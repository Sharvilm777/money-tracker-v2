import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import connectDB from '../../../lib/mongodb';
import User from '../../../models/User';
import { withAuth } from '../../../middleware/authMiddleware';

const JWT_SECRET = process.env.JWT_SECRET || 'sharvilm_jwt_authkey';

// Register a new user
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, name, password } = await request.json();
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user
    const user = await User.create({
      email,
      name,
      password: hashedPassword,
    });
    
    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '30d' });
    
    return NextResponse.json({
      id: user._id,
      name: user.name,
      email: user.email,
      token,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

// Get all users (admin only - you would need to add admin role check)
export async function GET(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      await connectDB();
      
      // In a real app, you would check if the user is an admin
      // For now, just return the user's own data
      return NextResponse.json({
        id: user._id,
        name: user.name,
        email: user.email,
      }, { status: 200 });
    } catch (error: any) {
      console.error('Error getting users:', error);
      return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
    }
  });
}