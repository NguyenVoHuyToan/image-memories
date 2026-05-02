import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    // 1. Parse request body
    const body = await req.json();
    const { username, email, password } = body;

    // 2. Validate input
    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng cung cấp đầy đủ thông tin (username, email, password)' }, 
        { status: 400 }
      );
    }

    // 3. Connect to Database (Singleton)
    try {
      await dbConnect();
    } catch (dbError: any) {
      console.error('Database connection failed in Register API:', dbError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra cấu hình MONGODB_URI.',
          error: dbError.message 
        }, 
        { status: 503 } // Service Unavailable
      );
    }

    // 4. Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email này đã được đăng ký' }, 
        { status: 400 }
      );
    }

    // 5. Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Create user record
    const newUser = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    // 7. Success response (exclude password)
    return NextResponse.json(
      { 
        success: true, 
        message: 'Đăng ký tài khoản thành công!',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        }
      },
      { status: 201 }
    );
    
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Đã xảy ra lỗi trong quá trình đăng ký', 
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
