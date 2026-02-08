// app/api/tables/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Table from "@/models/Table";

// GET - Fetch all tables
export async function GET() {
  try {
    await connectDB();
    const tables = await Table.find({}).sort({ tableNumber: 1 });
    return NextResponse.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Failed to fetch tables" },
      { status: 500 }
    );
  }
}

// POST - Create new table
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const { tableNumber, capacity, status, isActive } = body;

    // Validation
    if (!tableNumber || !capacity) {
      return NextResponse.json(
        { error: "Table number and capacity are required" },
        { status: 400 }
      );
    }

    // Check if table number already exists
    const existingTable = await Table.findOne({ tableNumber });
    if (existingTable) {
      return NextResponse.json(
        { error: "Table number already exists" },
        { status: 400 }
      );
    }

    const newTable = await Table.create({
      tableNumber,
      capacity,
      status: status || "available",
      isActive: isActive !== undefined ? isActive : true,
      currentOrderId: null
    });

    return NextResponse.json(
      { success: true, data: newTable },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json(
      { error: "Failed to create table" },
      { status: 500 }
    );
  }
}