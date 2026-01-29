import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/database";

// GET -> Ambil semua user
export async function GET() {
  try {
    await connectDB();
    const users = await User.find().sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}

// POST -> Tambahkan user
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Validasi required fields
    const { username, email, password, fullName, phone, role } = body;
    
    if (!username || !email || !password || !fullName || !phone || !role) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    // Cek apakah username atau email sudah ada
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { message: "Username already exists" },
          { status: 400 }
        );
      }
      if (existingUser.email === email) {
        return NextResponse.json(
          { message: "Email already exists" },
          { status: 400 }
        );
      }
    }

    const user = await User.create(body);

    return NextResponse.json(user, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { message: (error as Error).message },
      { status: 500 }
    );
  }
}