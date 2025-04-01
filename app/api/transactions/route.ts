import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Transaction from '../../../models/Transactions';
import Account from '../../../models/Account';
import Budget from '../../../models/Budget';
import { withAuth } from '../../../middleware/authMiddleware';

// Get all transactions for the authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      // Get query params
      const { searchParams } = new URL(req.url);
      const accountId = searchParams.get('accountId');
      const category = searchParams.get('category');
      const startDate = searchParams.get('startDate');
      const endDate = searchParams.get('endDate');
      
      // Build query
      const query: any = { user: user._id };
      
      if (accountId) {
        query.sourceAccount = accountId;
      }
      
      if (category) {
        query.category = category;
      }
      
      if (startDate && endDate) {
        query.date = { $gte: startDate, $lte: endDate };
      } else if (startDate) {
        query.date = { $gte: startDate };
      } else if (endDate) {
        query.date = { $lte: endDate };
      }
      
      const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .populate('sourceAccount', 'name type');
      
      return NextResponse.json(transactions, { status: 200 });
    } catch (error: any) {
      console.error('Error getting transactions:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Create a new transaction
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
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
      
      // Create transaction
      const transaction = await Transaction.create({
        amount: type === 'credit' ? Math.abs(amount) : -Math.abs(amount),
        type,
        category,
        subCategory,
        description,
        date,
        sourceAccount,
        billingCycle,
        user: user._id,
      });
      
      // Update account balance
      const isCreditCard = account.type === 'credit-card';
      const newBalance = isCreditCard
        ? account.balance + transaction.amount // Credit cards: credit reduces balance, debit increases
        : account.balance + transaction.amount;
      
      await Account.findByIdAndUpdate(sourceAccount, { balance: newBalance });
      
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
      
      return NextResponse.json(transaction, { status: 201 });
    } catch (error: any) {
      console.error('Error creating transaction:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}