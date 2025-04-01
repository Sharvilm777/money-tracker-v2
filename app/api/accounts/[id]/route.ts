import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Account from '../../../../models/Account';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get an account by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      const account = await Account.findOne({
        _id: id,
        user: user._id,
      });
      
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      
      return NextResponse.json(account, { status: 200 });
    } catch (error: any) {
      console.error('Error getting account:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Update an account
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      const { name, balance, accountNumber, creditLimit } = await request.json();
      
      // Find and update account
      const account = await Account.findOneAndUpdate(
        { _id: id, user: user._id },
        { name, balance, accountNumber, creditLimit },
        { new: true, runValidators: true }
      );
      
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      
      return NextResponse.json(account, { status: 200 });
    } catch (error: any) {
      console.error('Error updating account:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Delete an account
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      // Find and delete account
      const account = await Account.findOneAndDelete({
        _id: id,
        user: user._id,
      });
      
      if (!account) {
        return NextResponse.json({ error: 'Account not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Account deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}