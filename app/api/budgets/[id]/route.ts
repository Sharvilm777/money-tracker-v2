import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Budget from '../../../../models/Budget';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get a budget by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      const budget = await Budget.findOne({
        _id: id,
        user: user._id,
      });
      
      if (!budget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
      
      return NextResponse.json(budget, { status: 200 });
    } catch (error: any) {
      console.error('Error getting budget:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Update a budget
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const { allocated, spent } = await request.json();
      const id = await params.then(p => p.id);
      
      // Find and update budget
      const budget = await Budget.findOneAndUpdate(
        { _id: id, user: user._id },
        { allocated, spent },
        { new: true, runValidators: true }
      );
      
      if (!budget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
      
      return NextResponse.json(budget, { status: 200 });
    } catch (error: any) {
      console.error('Error updating budget:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Delete a budget
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      // Find and delete budget
      const budget = await Budget.findOneAndDelete({
        _id: id,
        user: user._id,
      });
      
      if (!budget) {
        return NextResponse.json({ error: 'Budget not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'Budget deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting budget:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}