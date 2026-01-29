// app/api/categories/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Category from "@/models/Category";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    const filter = activeOnly ? { isActive: true } : {};
    const categories = await Category.find(filter).sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: categories 
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 }
      );
    }

    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return NextResponse.json(
        { success: false, error: "Category already exists" },
        { status: 400 }
      );
    }

    const category = await Category.create({
      name,
      description: description || "",
      isActive: true
    });

    return NextResponse.json({ 
      success: true, 
      data: category 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create category" },
      { status: 500 }
    );
  }
}