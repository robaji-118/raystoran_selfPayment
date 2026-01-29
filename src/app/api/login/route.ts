import { NextResponse } from "next/server";
import User from "@/models/User";
import { connectDB } from "@/lib/database";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { identifier, password } = await req.json();

    // 1. Validasi Input Kosong
    if (!identifier || !password) {
      return NextResponse.json(
        { message: "Mohon isi email/username dan password" },
        { status: 400 }
      );
    }

    const isEmail = identifier.includes("@");
    let user;

    // 2. Logika Pengecekan User (Staff vs Customer)
    if (isEmail) {
      // --- Skenario Login Pakai Email (Harusnya Staff/Admin) ---
      user = await User.findOne({ email: identifier });

      if (!user) {
        return NextResponse.json(
          { message: "Email tidak terdaftar" }, 
          { status: 404 }
        );
      }

      // Cegah Customer login pakai Email (Sesuai request logic kamu)
      if (user.role === "customer") {
        return NextResponse.json(
          { message: "Customer harus login menggunakan Username" },
          { status: 401 }
        );
      }
    } else {
      // --- Skenario Login Pakai Username (Harusnya Customer) ---
      user = await User.findOne({ username: identifier });

      if (!user) {
        return NextResponse.json(
          { message: "Username tidak ditemukan" }, 
          { status: 404 }
        );
      }

      // Cegah Staff login pakai Username
      if (user.role !== "customer") {
        return NextResponse.json(
          { message: "Staff harus login menggunakan Email" },
          { status: 401 }
        );
      }
    }

    // 3. Cek Password
    // Note: Ini perbandingan plain text. Jika nanti database kamu pakai bcrypt, ganti logika ini.
    if (password !== user.password) {
      return NextResponse.json(
        { message: "Password salah!" }, // Pesan ini akan muncul di Alert Shadcn
        { status: 401 }
      );
    }

    // 4. Login Berhasil
    return NextResponse.json(
      {
        message: "Login berhasil",
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          fullName: user.fullName,
        },
      },
      { status: 200 }
    );

  } catch (err) {
    console.error("Login API Error:", err);
    return NextResponse.json(
      { message: "Terjadi kesalahan pada server" },
      { status: 500 }
    );
  }
}