/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Table from "@/models/Table";

// ==============================================================================
// GET METHOD (Mengambil Data Order)
// ==============================================================================
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");
    const orderType = searchParams.get("orderType");
    
    // Build query
    const query: any = {};
    
    if (status) {
      query.orderStatus = status;
    }
    
    if (tableId) {
      query.tableId = tableId;
    }

    if (orderType && (orderType === "dine-in" || orderType === "take-away")) {
      query.orderType = orderType;
    }

    // Get orders - sort by newest first
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Get all order items for these orders
    const orderIds = orders.map(order => order._id);
    const allItems = await OrderItem.find({
      orderId: { $in: orderIds }
    }).lean();

    // Group items by orderId
    const itemsByOrder = allItems.reduce((acc: any, item: any) => {
      const orderId = item.orderId.toString();
      if (!acc[orderId]) {
        acc[orderId] = [];
      }
      acc[orderId].push(item);
      return acc;
    }, {});

    // Attach items to orders
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: itemsByOrder[order._id.toString()] || []
    }));

    return NextResponse.json({
      success: true,
      data: ordersWithItems,
      count: ordersWithItems.length
    });
  } catch (error: any) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch orders"
      },
      { status: 500 }
    );
  }
}

// ==============================================================================
// POST METHOD (Membuat Order Baru)
// ==============================================================================
export async function POST(request: NextRequest) {
  let body: any;
  try {
    await connectDB();

    body = await request.json();
    
    // Validasi Field Utama
    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: customerName or items"
        },
        { status: 400 }
      );
    }

    // Default order type jika tidak ada
    const orderType = body.orderType || "dine-in";

    // Validasi Table (Khusus Dine-in)
    if (orderType === "dine-in") {
      if (!body.tableId) {
        return NextResponse.json(
          {
            success: false,
            error: "Table is required for dine-in orders"
          },
          { status: 400 }
        );
      }

      // Cek apakah table tersedia
      const table = await Table.findById(body.tableId);
      if (!table) {
        return NextResponse.json(
          {
            success: false,
            error: "Table not found"
          },
          { status: 404 }
        );
      }

      if (table.status !== "available") {
        return NextResponse.json(
          {
            success: false,
            error: "Table is not available"
          },
          { status: 400 }
        );
      }

      // Update table status ke occupied
      table.status = "occupied";
      await table.save();
    }

    // Validasi Struktur Items
    for (const item of body.items) {
      if (!item.menuItemId || !item.menuItemName || !item.quantity || !item.price) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid item structure. Each item must have menuItemId, menuItemName, quantity, and price"
          },
          { status: 400 }
        );
      }
    }

    // ------------------------------------------------------------------
    // GENERATE ORDER NUMBER (ORD-YYMMDD-XXXX) - RESET PER HARI
    // ------------------------------------------------------------------
    const now = new Date();
    // Format Tanggal: YYMMDD (Contoh: 240126)
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    
    const dateCode = `${year}${month}${day}`; 
    const prefix = `ORD-${dateCode}`; // Prefix hari ini

    // Cari order terakhir HANYA yang prefix-nya sama dengan hari ini
    const lastOrderToday = await Order.findOne({
      orderNumber: { $regex: `^${prefix}` }
    })
    .sort({ orderNumber: -1 }) // Ambil yang paling besar
    .select("orderNumber"); // Hanya butuh field orderNumber

    let orderNumber;
    
    if (lastOrderToday && lastOrderToday.orderNumber) {
      // Jika hari ini sudah ada order, ambil sequence terakhir dan tambah 1
      const parts = lastOrderToday.orderNumber.split("-"); // Split ORD, YYMMDD, XXXX
      const lastSequence = parseInt(parts[parts.length - 1]); // Ambil bagian angka terakhir
      const nextSequence = lastSequence + 1;
      orderNumber = `${prefix}-${String(nextSequence).padStart(4, "0")}`;
    } else {
      // Jika belum ada order hari ini, mulai dari 0001
      orderNumber = `${prefix}-0001`;
    }
    // ------------------------------------------------------------------

    // Create Order
    const newOrder = await Order.create({
      orderNumber,
      customerId: body.customerId || null,
      orderType, 
      tableId: orderType === "dine-in" ? body.tableId : null,
      tableNumber: orderType === "dine-in" ? body.tableNumber : "Take Away",
      customerName: body.customerName,
      customerPhone: body.customerPhone || null,
      orderStatus: "confirmed", 
      confirmedAt: new Date(),
      subtotal: body.subtotal,
      tax: body.tax || 0,
      serviceCharge: body.serviceCharge || 0,
      discount: body.discount || 0,
      totalAmount: body.totalAmount,
      paymentStatus: "paid", 
      paymentMethod: body.paymentMethod || "cash",
      paidAt: new Date(), 
      customerNotes: body.customerNotes || null
    });

    // Create Order Items
    const orderItems = await OrderItem.insertMany(
      body.items.map((item: any) => ({
        orderId: newOrder._id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        notes: item.notes || null,
        status: "preparing",
        cookingStartedAt: new Date()
      }))
    );

    // Return Response
    return NextResponse.json({
      success: true,
      message: `${orderType === "dine-in" ? "Dine-in" : "Take-away"} order created successfully`,
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
      data: {
        ...newOrder.toObject(),
        items: orderItems
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST Order Error:", error);
    
    // Rollback table status jika error (Khusus Dine-in)
    if (error.message && body?.tableId && body?.orderType === "dine-in") {
      try {
        await Table.findByIdAndUpdate(body.tableId, { status: "available" });
      } catch (rollbackError) {
        console.error("Rollback table status error:", rollbackError);
      }
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order"
      },
      { status: 500 }
    );
  }
}