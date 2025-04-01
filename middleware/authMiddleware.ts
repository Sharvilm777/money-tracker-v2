import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import connectDB from '../lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'sharvilm_jwt_authkey';

export async function validateToken(request: Request) {
  try {
    // Connect to database
    await connectDB();
    
    // Get token from header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Unauthorized - No token provided', status: 401 };
    }

    const token = authHeader.split(' ')[1];
    console.log("This is the token in backend",token);
    
    
    // Verify token
    console.log("Before check");
    
    let decoded: any;
    try {
    console.log("In Check");
    
      decoded = jwt.verify(token, JWT_SECRET);
      console.log("This is the decoded",decoded);
      
    } catch (error) {
        console.log(error);
        
      return { error: 'Unauthorized - Invalid token', status: 401 };
    }

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return { error: 'Unauthorized - User not found', status: 401 };
    }

    // Return user
    return { user, status: 200 };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return { error: 'Server error', status: 500 };
  }
}

export async function withAuth(request: Request, handler: (req: Request, user: any) => Promise<NextResponse>) {
    const auth = await validateToken(request);
    
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }
    
    return handler(request, auth.user);
  }