import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Category from '../../../models/Category';
import { withAuth } from '../../../middleware/authMiddleware';

// Get all categories for the authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const categories = await Category.find({ user: user._id }).sort({ name: 1 });
      
      return NextResponse.json(categories, { status: 200 });
    } catch (error: any) {
      console.error('Error getting categories:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Create a new category
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const { name } = await request.json();
      
      // Check if category already exists for this user
      const existingCategory = await Category.findOne({
        name,
        user: user._id,
      });
      
      if (existingCategory) {
        return NextResponse.json(
          { error: 'Category already exists' },
          { status: 400 }
        );
      }
      
      // Create category
      const category = await Category.create({
        name,
        user: user._id,
      });
      
      return NextResponse.json(category, { status: 201 });
    } catch (error: any) {
      console.error('Error creating category:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}