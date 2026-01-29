import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Menu from "@/models/Menu";
import "@/models/Category"; // ← INI YANG PERLU DITAMBAHKAN!

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('categoryId');
    const availableOnly = searchParams.get('availableOnly') === 'true';
    const activeOnly = searchParams.get('activeOnly') === 'true';
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (categoryId) filter.categoryId = categoryId;
    if (availableOnly) filter.isAvailable = true;
    if (activeOnly) filter.isActive = true;
    
    const menus = await Menu.find(filter)
      .populate('categoryId', 'name')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({ 
      success: true, 
      data: menus 
    });
  } catch (error) {
    console.error("Error fetching menus:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch menus" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    const { 
      name, 
      description, 
      categoryId, 
      price, 
      image, 
      preparationTime,
      isAvailable 
    } = body;

    if (!name || !categoryId || !price) {
      return NextResponse.json(
        { success: false, error: "Name, category, and price are required" },
        { status: 400 }
      );
    }

    const menu = await Menu.create({
      name,
      description: description || "",
      categoryId,
      price,
      image: image || "",
      preparationTime: preparationTime || 0,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      isActive: true
    });

    const populatedMenu = await Menu.findById(menu._id).populate('categoryId', 'name');

    return NextResponse.json({ 
      success: true, 
      data: populatedMenu 
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating menu:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create menu" },
      { status: 500 }
    );
  }
}