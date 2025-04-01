import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import Category from '../../../../models/Category';
import Transaction from '../../../../models/Transactions';
import Budget from '../../../../models/Budget';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get a category by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      const category = await Category.findOne({
        _id: id,
        user: user._id,
      });
      
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      
      return NextResponse.json(category, { status: 200 });
    } catch (error: any) {
      console.error('Error getting category:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Update a category
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      
      const { name } = await request.json();
      
      // Check if new name already exists for this user
      const existingCategory = await Category.findOne({
        name,
        user: user._id,
        _id: { $ne: id },
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 400 }
        );
      }
      
      // Find and update category
      const category = await Category.findOneAndUpdate(
        { _id: id, user: user._id },
        { name },
        { new: true, runValidators: true }
      );
      
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      
      return NextResponse.json(category, { status: 200 });
    } catch (error: any) {
      console.error('Error updating category:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Delete a category
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      const id = await params.then(p => p.id);
      
      
      // Check if category is being used in transactions or budgets
      const category = await Category.findOne({
        _id: id,
        user: user._id,
      });
      
      if (!category) {
        return NextResponse.json({ error: 'Category not found' }, { status: 404 });
      }
      
      const transactionCount = await Transaction.countDocuments({
        category: category.name,
        user: user._id,
      });
      
      const budgetCount = await Budget.countDocuments({
        category: category.name,
        user: user._id,
      });
      
      if (transactionCount > 0 || budgetCount > 0) {
        return NextResponse.json(
          {
            error: 'Cannot delete category that is in use',
            transactionCount,
            budgetCount,
          },
          { status: 400 }
        );
      }
      
      // Delete the category
      await Category.findByIdAndDelete(id);
      
      return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}