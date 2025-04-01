import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/mongodb';
import Account from '../../../../../../models/Account';
import Transaction from '../../../../../../models/Transactions';
import { validateToken } from '../../../../../../middleware/authMiddleware';

// Get credit card bill for a specific cycle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string; cycle: string } }
) {
  try {
    // Connect to database
    await connectDB();
    
    // Authenticate user
    const auth = await validateToken(request);
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    const user = auth.user;
    
    // Check if account exists and belongs to user
    const account = await Account.findOne({
      _id: params.id,
      user: user._id,
    });
    
    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    // Check if account is a credit card
    if (account.type !== 'credit-card') {
      return NextResponse.json({ error: 'Account is not a credit card' }, { status: 400 });
    }
    
    // Get transactions for this billing cycle
    const transactions = await Transaction.find({
      sourceAccount: params.id,
      billingCycle: params.cycle,
      user: user._id,
    }).sort({ date: -1 });
    
    // Calculate total bill amount
    const totalBill = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    return NextResponse.json({
      account: {
        id: account._id,
        name: account.name,
        balance: account.balance,
      },
      cycle: params.cycle,
      transactions,
      totalBill,
    }, { status: 200 });
  } catch (error: any) {
    console.error('Error getting credit card bill:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}