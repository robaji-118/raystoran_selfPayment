/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Table from "@/models/Table";

// ==============================================================================
// GET METHOD
// Fitur:
// 1. Mengambil semua data order
// 2. AUTO-CANCEL order yang 'gantung' (tidak aktif) lebih dari 10 jam
// ==============================================================================
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // --- LOGIC 1: AUTO CANCEL DORMANT ORDERS (> 10 JAM) ---
    // REVISI: Update Order DAN OrderItem sekaligus
    
    const ONE_HOURS_IN_MS = 1 * 60 * 60 * 1000; // Ubah ke 10 jam sesuai komentar (sebelumnya 1 jam)
    const cutOffTime = new Date(Date.now() - ONE_HOURS_IN_MS);

    // 1. Cari dulu order yang 'basi' (dormant)
    const dormantOrders = await Order.find({
      updatedAt: { $lt: cutOffTime },
      orderStatus: { 
        $nin: ["completed", "cancelled", "refunded", "served"] 
      }
    }).select("_id"); // Kita cuma butuh ID-nya

    if (dormantOrders.length > 0) {
      const dormantOrderIds = dormantOrders.map(order => order._id);

      // 2. Update Status Parent (ORDER) menjadi cancelled
      await Order.updateMany(
        { _id: { $in: dormantOrderIds } },
        {
          $set: {
            orderStatus: "cancelled",
            cancellationReason: "System: Auto-cancelled due to inactivity (10h)",
            updatedAt: new Date()
          }
        }
      );

      // 3. Update Status Child (ORDER ITEMS) menjadi cancelled juga
      // INI YANG KURANG SEBELUMNYA
      await OrderItem.updateMany(
        { orderId: { $in: dormantOrderIds } },
        {
          $set: {
            status: "cancelled" 
          }
        }
      );
      
      console.log(`Auto-cancelled ${dormantOrders.length} dormant orders and their items.`);
    }
    // ------------------------------------------------------

    // ... sisa kode fetch data query params (tidak berubah) ...
    const { searchParams } = new URL(request.url);
    // ... dst ...
    
    // (Kode di bawah ini sama seperti sebelumnya, hanya copy paste bagian bawah file kamu)
    const status = searchParams.get("status");
    const tableId = searchParams.get("tableId");
    const orderType = searchParams.get("orderType");
    
    const query: any = {};
    if (status) query.orderStatus = status;
    if (tableId) query.tableId = tableId;
    if (orderType && (orderType === "dine-in" || orderType === "take-away")) {
      query.orderType = orderType;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    const orderIds = orders.map(order => order._id);
    const allItems = await OrderItem.find({ orderId: { $in: orderIds } }).lean();

    const itemsByOrder = allItems.reduce((acc: any, item: any) => {
      const orderId = item.orderId.toString();
      if (!acc[orderId]) acc[orderId] = [];
      acc[orderId].push(item);
      return acc;
    }, {});

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
      { success: false, error: error.message || "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let body: any;
  try {
    await connectDB();
    body = await request.json();
    
    // 1. Validasi Field Utama
    if (!body.customerName || !body.items || body.items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: customerName or items" },
        { status: 400 }
      );
    }

    const orderType = body.orderType || "dine-in";

    // 2. Validasi Table (Khusus Dine-in)
    if (orderType === "dine-in") {
      if (!body.tableId) {
        return NextResponse.json(
          { success: false, error: "Table is required for dine-in orders" },
          { status: 400 }
        );
      }

      // Cek apakah table ada di DB
      const table = await Table.findById(body.tableId);
      if (!table) {
        return NextResponse.json(
          { success: false, error: "Table not found" },
          { status: 404 }
        );
      }
      
      // CATATAN: Kita TIDAK mengubah table.status menjadi occupied
      // agar meja bisa dipesan berkali-kali (multi-order).
    }

    // 3. Validasi Struktur Items
    for (const item of body.items) {
      if (!item.menuItemId || !item.quantity || !item.price) {
        return NextResponse.json(
          { success: false, error: "Invalid item structure" },
          { status: 400 }
        );
      }
    }

    // 4. GENERATE ORDER NUMBER (RESET PER HARI)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    
    const prefix = `ORD-${year}${month}${day}`; // Format: ORD-240131

    // Cari order terakhir hari ini
    const lastOrderToday = await Order.findOne({
      orderNumber: { $regex: `^${prefix}` }
    })
    .sort({ createdAt: -1 }) // Gunakan createdAt untuk sorting paling akurat
    .select("orderNumber");

    let orderNumber;
    
    if (lastOrderToday && lastOrderToday.orderNumber) {
      // Ambil sequence terakhir
      const parts = lastOrderToday.orderNumber.split("-"); 
      const lastSequence = parseInt(parts[parts.length - 1]); 
      
      if (!isNaN(lastSequence)) {
        const nextSequence = lastSequence + 1;
        orderNumber = `${prefix}-${String(nextSequence).padStart(4, "0")}`;
      } else {
        // Fallback jika format error/tidak sesuai
        orderNumber = `${prefix}-${Date.now().toString().slice(-4)}`;
      }
    } else {
      // Jika belum ada order hari ini
      orderNumber = `${prefix}-0001`;
    }

    // 5. Create Order ke Database
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

    // 6. Create Order Items
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

    // Return Success Response
    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
      data: {
        ...newOrder.toObject(),
        items: orderItems
      }
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to create order"
      },
      { status: 500 }
    );
  }
}