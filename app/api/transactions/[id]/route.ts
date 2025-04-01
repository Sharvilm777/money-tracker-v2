import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Transaction from '../../../../models/Transactions';
import Account from '../../../../models/Account';
import Budget from '../../../../models/Budget';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get a transaction by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const transaction = await Transaction.findOne({
        _id: params.id,
        user: user._id,
      }).populate('sourceAccount', 'name type');
      
      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      
      return NextResponse.json(transaction, { status: 200 });
    } catch (error: any) {
      console.error('Error getting transaction:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      // First, get the existing transaction
      const existingTransaction = await Transaction.findOne({
        _id: params.id,
        user: user._id,
      });
      
      if (!existingTransaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      
      const { 
        amount, 
        type, 
        category, 
        subCategory, 
        description, 
        date, 
        sourceAccount, 
        billingCycle 
      } = await request.json();
      
      // Check if account exists and belongs to user
      const account = await Account.findOne({
        _id: sourceAccount,
        user: user._id,
      });
      
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      
      // Reverse the effect of the old transaction on the account balance
      const oldAmount = existingTransaction.amount;
      const oldSourceAccount = existingTransaction.sourceAccount;
      
      if (oldSourceAccount.toString() === sourceAccount.toString()) {
        // If the account hasn't changed, just update the balance with the difference
        const oldAccount = await Account.findById(oldSourceAccount);
        const isCreditCard = oldAccount.type === 'credit-card';
        const updatedBalance = oldAccount.balance - oldAmount;
        await Account.findByIdAndUpdate(oldSourceAccount, { balance: updatedBalance });
      } else {
        // If the account has changed, update both old and new account balances
        const oldAccount = await Account.findById(oldSourceAccount);
        const newAccount = await Account.findById(sourceAccount);
        
        const isOldCreditCard = oldAccount.type === 'credit-card';
        const isNewCreditCard = newAccount.type === 'credit-card';
        
        const oldUpdatedBalance = oldAccount.balance - oldAmount;
        await Account.findByIdAndUpdate(oldSourceAccount, { balance: oldUpdatedBalance });
      }
      
      // Reverse the effect of the old transaction on the budget if it was a debit
      if (existingTransaction.type === 'debit') {
        const oldBudget = await Budget.findOne({
          category: existingTransaction.category,
          period: existingTransaction.billingCycle,
          user: user._id,
        });
        
        if (oldBudget) {
          await Budget.findByIdAndUpdate(oldBudget._id, {
            spent: oldBudget.spent - Math.abs(oldAmount),
          });
        }
      }
      
      // Create the new transaction amount
      const newAmount = type === 'credit' ? Math.abs(amount) : -Math.abs(amount);
      
      // Update the transaction
      const updatedTransaction = await Transaction.findByIdAndUpdate(
        params.id,
        {
          amount: newAmount,
          type,
          category,
          subCategory,
          description,
          date,
          sourceAccount,
          billingCycle,
        },
        { new: true, runValidators: true }
      );
      
      // Update the account balance with the new transaction
      const updatedAccount = await Account.findById(sourceAccount);
      const isUpdatedCreditCard = updatedAccount.type === 'credit-card';
      const finalBalance = updatedAccount.balance + newAmount;
      await Account.findByIdAndUpdate(sourceAccount, { balance: finalBalance });
      
      // Update budget for debits
      if (type === 'debit') {
        const budget = await Budget.findOne({
          category,
          period: billingCycle,
          user: user._id,
        });
        
        if (budget) {
          await Budget.findByIdAndUpdate(budget._id, {
            spent: budget.spent + Math.abs(amount),
          });
        }
      }
      
      return NextResponse.json(updatedTransaction, { status: 200 });
    } catch (error: any) {
      console.error('Error updating transaction:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Delete a transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      // First, get the existing transaction
      const transaction = await Transaction.findOne({
        _id: params.id,
        user: user._id,
      });
      
      if (!transaction) {
        return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
      }
      
      // Reverse the effect of the transaction on the account balance
      const account = await Account.findById(transaction.sourceAccount);
      const isCreditCard = account.type === 'credit-card';
      const updatedBalance = account.balance - transaction.amount;
      await Account.findByIdAndUpdate(transaction.sourceAccount, { balance: updatedBalance });
      
      // Reverse the effect of the transaction on the budget if it was a debit
      if (transaction.type === 'debit') {
        const budget = await Budget.findOne({
          category: transaction.category,
          period: transaction.billingCycle,
          user: user._id,
        });
        
        if (budget) {
          await Budget.findByIdAndUpdate(budget._id, {
            spent: budget.spent - Math.abs(transaction.amount),
          });
        }
      }
      
      // Delete the transaction
      await Transaction.findByIdAndDelete(params.id);
      
      return NextResponse.json({ message: 'Transaction deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting transaction:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}