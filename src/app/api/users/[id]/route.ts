// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/database';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } // ← params adalah Promise
) {
  try {
    await connectDB();

    // UNWRAP PARAMS TERLEBIH DAHULU
    const { id } = await params; // ← tambahkan await di sini

    console.log('DELETE request for user ID:', id);

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      data: user
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params; // ← unwrap params

    if (!id || id === 'undefined') {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

async function updateUser(
  request: NextRequest,
  params: Promise<{ id: string }>
) {
  await connectDB();

  const { id } = await params;

  if (!id || id === 'undefined') {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    );
  }

  const data = await request.json();

  // Remove password from update data if it's empty
  // This allows updating user without changing password
  if (!data.password || data.password.trim() === '') {
    delete data.password;
  }

  // Check if username or email already exists (excluding current user)
  if (data.username || data.email) {
    const existingUser = await User.findOne({
      _id: { $ne: id },
      $or: [
        ...(data.username ? [{ username: data.username }] : []),
        ...(data.email ? [{ email: data.email }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.username === data.username) {
        return NextResponse.json(
          { message: 'Username already exists' },
          { status: 400 }
        );
      }
      if (existingUser.email === data.email) {
        return NextResponse.json(
          { message: 'Email already exists' },
          { status: 400 }
        );
      }
    }
  }

  const user = await User.findByIdAndUpdate(
    id,
    { $set: data },
    { new: true, runValidators: true }
  );

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    return await updateUser(request, context.params);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    return await updateUser(request, params);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}