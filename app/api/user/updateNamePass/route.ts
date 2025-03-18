import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { wallet_address, name, newPassword, coin } = body;

    if (!wallet_address) {
      return NextResponse.json({ success: false, message: 'Wallet address is required' }, { status: 400 });
    }

    await connectToDatabase();

    const updateData: any = { name };

    if (newPassword) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (coin !== undefined) {
      updateData.coin = coin;
    }

    const updatedUser = await User.findOneAndUpdate(
      { wallet_address },
      { $set: updateData },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // รีเฟรช session ฝั่ง client โดยให้ frontend เรียก session update แทน
    return NextResponse.json({ success: true, user: updatedUser, message: 'Please call session.update() on client' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
