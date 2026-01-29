import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Table from "@/models/Table";
import mongoose from "mongoose";

interface RouteParams {
  params: {
    id: string;
  };
}

// PUT - Update table
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid table ID" 
      }, { status: 400 });
    }

    const body = await req.json();
    const { tableNumber, capacity, status, isActive } = body;

    // Validate required fields
    if (!tableNumber?.trim()) {
      return NextResponse.json({ 
        success: false, 
        error: "Table number is required" 
      }, { status: 400 });
    }

    if (capacity === undefined || capacity < 1 || capacity > 20) {
      return NextResponse.json({ 
        success: false, 
        error: "Capacity must be between 1 and 20" 
      }, { status: 400 });
    }

    // Check if table number already exists (excluding current table)
    const existingTable = await Table.findOne({
      tableNumber,
      _id: { $ne: id },
    });

    if (existingTable) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Table number already exists" 
        },
        { status: 400 }
      );
    }

    const updatedTable = await Table.findByIdAndUpdate(
      id,
      {
        tableNumber,
        capacity,
        status: status || "available",
        isActive: isActive !== undefined ? isActive : true,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTable) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Table not found" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: updatedTable 
    });
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to update table" 
    }, { status: 500 });
  }
}

// DELETE - Delete table
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ 
        success: false, 
        error: "Invalid table ID" 
      }, { status: 400 });
    }

    const table = await Table.findById(id);

    if (!table) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Table not found" 
        },
        { status: 404 }
      );
    }

    if (table.status === "occupied") {
      return NextResponse.json(
        { 
          success: false, 
          error: "Cannot delete occupied table" 
        },
        { status: 400 }
      );
    }

    await Table.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: "Table deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting table:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to delete table" 
    }, { status: 500 });
  }
}