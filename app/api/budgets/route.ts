import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Budget from '../../../models/Budget';
import { withAuth } from '../../../middleware/authMiddleware';

// Get all budgets for the authenticated user
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      // Get query params
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period');
      const category = searchParams.get('category');
      
      // Build query
      const query: any = { user: user._id };
      
      if (period) {
        query.period = period;
      }
      
      if (category) {
        query.category = category;
      }
      
      const budgets = await Budget.find(query).sort({ period: -1, category: 1 });
      
      return NextResponse.json(budgets, { status: 200 });
    } catch (error: any) {
      console.error('Error getting budgets:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Create a new budget
export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      const { category, allocated, period } = await request.json();
      
      // Check if budget already exists for this category and period
      const existingBudget = await Budget.findOne({
        category,
        period,
        user: user._id,
      });
      
      if (existingBudget) {
        return NextResponse.json(
          { error: 'Budget for this category and period already exists' },
          { status: 400 }
        );
      }
      
      // Create budget
      const budget = await Budget.create({
        category,
        allocated,
        spent: 0,
        period,
        user: user._id,
      });
      
      return NextResponse.json(budget, { status: 201 });
    } catch (error: any) {
      console.error('Error creating budget:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}