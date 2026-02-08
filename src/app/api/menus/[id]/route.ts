// app/api/menus/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Menu from "@/models/Menu";
import "@/models/Category";
import mongoose from "mongoose";

// The key fix: params needs to be awaited in Next.js 13+ App Router
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await the params object
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid menu ID" },
        { status: 400 }
      );
    }

    const menu = await Menu.findById(id).populate('categoryId', 'name');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menu" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await the params object
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid menu ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      categoryId,
      price,
      image,
      preparationTime,
      isAvailable,
      isActive
    } = body;

    if (!name || !categoryId || price === undefined) {
      return NextResponse.json(
        { success: false, error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    const menu = await Menu.findByIdAndUpdate(
      id,
      {
        name,
        description,
        categoryId,
        price,
        image,
        preparationTime,
        isAvailable,
        isActive
      },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: menu
    });
  } catch (error) {
    console.error("Error updating menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update menu" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Await the params object
    const { id } = await context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: "Invalid menu ID" },
        { status: 400 }
      );
    }

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return NextResponse.json(
        { success: false, error: "Menu not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Menu deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete menu" },
      { status: 500 }
    );
  }
}