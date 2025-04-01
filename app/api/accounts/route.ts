import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Account from '../../../models/Account';
import { withAuth } from '../../../middleware/authMiddleware';

// Get all accounts for the authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const accounts = await Account.find({ user: user._id });
      
      return NextResponse.json(accounts, { status: 200 });
    } catch (error: any) {
      console.error('Error getting accounts:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Create a new account
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const { name, type, balance, accountNumber, creditLimit } = await request.json();
      
      // Create account
      const account = await Account.create({
        name,
        type,
        balance,
        accountNumber,
        creditLimit,
        user: user._id,
      });
      
      return NextResponse.json(account, { status: 201 });
    } catch (error: any) {
      console.error('Error creating account:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}