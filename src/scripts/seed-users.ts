// scripts/seed-users.ts
import "dotenv/config";   // ← WAJIB ADA
import mongoose from "mongoose";
import User from "../models/User";

const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

// Data users untuk di-seed
const users = [
  {
    username: "admin",
    email: "admin@gmail.com",
    password: "admin123",
    fullName: "Super Admin",
    role: "admin",
    phone: "08123456789",
    isActive: true,
    createdBy: null,
  },
  {
    username: "Customer",
    email: "customer@gmail.com",
    password: "customer123",
    fullName: "Customer User",
    role: "customer",
    phone: "08111111111",
    isActive: true,
    createdBy: null,
  },
  {
    username: "waiter1",
    email: "waiter1@gmail.com",
    password: "waiter123",
    fullName: "Ahmad Waiter",
    role: "waiter",
    phone: "08133333333",
    isActive: true,
    createdBy: null,
  },
  {
    username: "kitchen1",
    email: "kitchen1@gmail.com",
    password: "kitchen123",
    fullName: "Budi Kitchen",
    role: "kitchen",
    phone: "08144444444",
    isActive: true,
    createdBy: null,
  },
  {
    username: "owner1",
    email: "owner1@gmail.com",
    password: "owner123",
    fullName: "Siti Owner",
    role: "owner",
    phone: "08155555555",
    isActive: true,
    createdBy: null,
  },
];

async function seedUsers() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Hapus semua users yang ada (opsional - comment jika tidak ingin hapus)
    console.log("🗑️  Clearing existing users...");
    await User.deleteMany({});
    console.log("✅ Existing users cleared");

    // Insert users baru
    console.log("📝 Inserting users...");
    const result = await User.insertMany(users);
    console.log(`✅ Successfully inserted ${result.length} users`);

    // Tampilkan data yang berhasil di-insert
    console.log("\n📊 Inserted Users:");
    result.forEach((user) => {
      console.log(`   - ${user.fullName} (${user.role}) - ${user.email}`);
    });

    console.log("\n🎉 Seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log("🔌 MongoDB connection closed");
  }
}

// Jalankan seeder
seedUsers();