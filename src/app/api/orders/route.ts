import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Table from "@/models/Table";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // 1. Auto-Cancel Logic (Cleaned)
    const tenHoursAgo = new Date(Date.now() - 10 * 60 * 60 * 1000);
    const dormantOrders = await Order.find({
      updatedAt: { $lt: tenHoursAgo },
      orderStatus: { $nin: ["completed", "cancelled", "refunded", "served"] }
    }).select("_id");

    if (dormantOrders.length > 0) {
      const ids = dormantOrders.map(o => o._id);
      await Promise.all([
        Order.updateMany(
          { _id: { $in: ids } }, 
          { $set: { orderStatus: "cancelled", cancellationReason: "System: Auto-timeout", updatedAt: new Date() } }
        ),
        OrderItem.updateMany({ orderId: { $in: ids } }, { $set: { status: "cancelled" } })
      ]);
    }

    // 2. Query Params Fetching
    const { searchParams } = new URL(request.url);
    const query: any = {};
    if (searchParams.get("status")) query.orderStatus = searchParams.get("status");
    if (searchParams.get("tableId")) query.tableId = searchParams.get("tableId");
    if (searchParams.get("orderType")) query.orderType = searchParams.get("orderType");

    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    const orderIds = orders.map(o => o._id);
    const allItems = await OrderItem.find({ orderId: { $in: orderIds } }).lean();

    // Map items to orders
    const itemsMap = allItems.reduce((acc: any, item: any) => {
      acc[item.orderId] = acc[item.orderId] || [];
      acc[item.orderId].push(item);
      return acc;
    }, {});

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({ ...order, items: itemsMap[order._id] || [] })),
      count: orders.length
    });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // Validation
    if (!body.customerName || !body.items?.length || !body.customerEmail) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    if (!body.customerEmail.endsWith("@gmail.com")) {
      return NextResponse.json({ success: false, error: "Invalid Gmail address" }, { status: 400 });
    }

    if (body.orderType === "dine-in") {
      const table = await Table.findById(body.tableId);
      if (!table) return NextResponse.json({ success: false, error: "Table not found" }, { status: 404 });
    }

    // Generate Order Number
    const now = new Date();
    const prefix = `ORD-${now.getFullYear().toString().slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
    const lastOrder = await Order.findOne({ orderNumber: { $regex: `^${prefix}` } }).sort({ createdAt: -1 });
    
    let sequence = "0001";
    if (lastOrder) {
      const lastSeq = parseInt(lastOrder.orderNumber.split("-").pop() || "0");
      sequence = String(lastSeq + 1).padStart(4, "0");
    }

    // Create Order
    const newOrder = await Order.create({
      ...body,
      orderNumber: `${prefix}-${sequence}`,
      confirmedAt: new Date(),
      paymentStatus: "paid", // As per your logic
      paidAt: new Date()
    });

    // Create Items
    const orderItems = await OrderItem.insertMany(
      body.items.map((item: any) => ({
        orderId: newOrder._id,
        menuItemId: item.menuItemId,
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity,
        notes: item.notes,
        status: "preparing",
        cookingStartedAt: new Date()
      }))
    );

    return NextResponse.json({
      success: true,
      message: "Order created",
      data: { ...newOrder.toObject(), items: orderItems }
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}