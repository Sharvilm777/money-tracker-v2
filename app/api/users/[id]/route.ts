import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../../../lib/mongodb';
import User from '../../../../models/User';
import { withAuth } from '../../../../middleware/authMiddleware';

// Get a user by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, authUser) => {
    try {
      await connectDB();
      
      // Check if the user is trying to access their own profile
      if (authUser._id.toString() !== params.id) {
        return NextResponse.json({ error: 'Not authorized to access this resource' }, { status: 403 });
      }
      
      const user = await User.findById(params.id).select('-password');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json(user, { status: 200 });
    } catch (error: any) {
      console.error('Error getting user:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Update a user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, authUser) => {
    try {
      await connectDB();
      
      // Check if the user is trying to update their own profile
      if (authUser._id.toString() !== params.id) {
        return NextResponse.json({ error: 'Not authorized to update this resource' }, { status: 403 });
      }
      
      const { name, email } = await request.json();
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        params.id,
        { name, email },
        { new: true, runValidators: true }
      ).select('-password');
      
      if (!updatedUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json(updatedUser, { status: 200 });
    } catch (error: any) {
      console.error('Error updating user:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}

// Delete a user
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(request, async (req, authUser) => {
    try {
      await connectDB();
      
      // Check if the user is trying to delete their own profile
      if (authUser._id.toString() !== params.id) {
        return NextResponse.json({ error: 'Not authorized to delete this resource' }, { status: 403 });
      }
      
      const user = await User.findByIdAndDelete(params.id);
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      
      return NextResponse.json({ message: 'User deleted successfully' }, { status: 200 });
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}