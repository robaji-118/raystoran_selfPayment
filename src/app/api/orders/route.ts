import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import Table from "@/models/Table";
import { sendCancellationEmail } from "@/lib/mail";

// --- GET: Fetch All Orders & Auto-Cancel Dormant Orders ---
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const cutOffTime = new Date(Date.now() - 1 * 60 * 60 * 1000);
    const dormantOrders = await Order.find({
      updatedAt: { $lt: cutOffTime },
      orderStatus: { $nin: ["completed", "cancelled", "refunded", "served"] }
    }).select("_id customerEmail customerName orderNumber").lean();

    if (dormantOrders.length > 0) {
      const ids = dormantOrders.map((o) => o._id);
      const reason = "System: Auto-timeout (inactivity)";
      await Promise.all([
        Order.updateMany(
          { _id: { $in: ids } },
          { 
            $set: { 
              orderStatus: "cancelled", 
              cancellationReason: reason, 
              updatedAt: new Date() 
            } 
          }
        ),
        OrderItem.updateMany(
          { orderId: { $in: ids } }, 
          { $set: { status: "cancelled" } }
        )
      ]);
      const allDormantItems = await OrderItem.find({ orderId: { $in: ids } })
        .select("orderId menuItemName quantity price")
        .lean();
      const itemsByOrder = allDormantItems.reduce((acc: Record<string, { menuItemName: string; quantity: number; price: number }[]>, item: any) => {
        const oid = String(item.orderId);
        if (!acc[oid]) acc[oid] = [];
        acc[oid].push({ menuItemName: item.menuItemName, quantity: item.quantity, price: item.price });
        return acc;
      }, {});
      // Kirim email notifikasi pembatalan ke email yang terdaftar pada order
      for (const order of dormantOrders) {
        const toEmail = order.customerEmail;
        if (toEmail && toEmail.includes("@")) {
          try {
            const itemsForEmail = itemsByOrder[String(order._id)] || [];
            const sent = await sendCancellationEmail(
              toEmail,
              order.customerName || "Customer",
              order.orderNumber,
              reason,
              itemsForEmail
            );
            if (sent) console.log("[AutoCancel] Email pembatalan terkirim ke:", toEmail, "| Order:", order.orderNumber);
            else console.warn("[AutoCancel] Email gagal terkirim ke:", toEmail);
          } catch (err) {
            console.error("[AutoCancel] Error kirim email:", err);
          }
        }
      }
    }

    // 2. Handle Query Parameters
    const { searchParams } = new URL(request.url);
    const query: any = {};
    if (searchParams.get("status")) query.orderStatus = searchParams.get("status");
    if (searchParams.get("tableId")) query.tableId = searchParams.get("tableId");
    if (searchParams.get("orderType")) query.orderType = searchParams.get("orderType");

    // 3. Fetch Data
    const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
    const orderIds = orders.map((o) => o._id);
    const allItems = await OrderItem.find({ orderId: { $in: orderIds } }).lean();

    // 4. Map Items to Orders
    const itemsMap = allItems.reduce((acc: any, item: any) => {
      acc[item.orderId] = acc[item.orderId] || [];
      acc[item.orderId].push(item);
      return acc;
    }, {});

    const enrichedOrders = orders.map((order) => ({
      ...order,
      items: itemsMap[order._id] || []
    }));

    return NextResponse.json({
      success: true,
      data: enrichedOrders,
      count: enrichedOrders.length
    });

  } catch (error: any) {
    console.error("GET Orders Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch orders" }, 
      { status: 500 }
    );
  }
}

// --- POST: Create New Order ---
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    // 1. Validation
    if (!body.customerName || !body.items?.length || !body.customerEmail) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: Name, Email, or Items" }, 
        { status: 400 }
      );
    }

    if (!body.customerEmail.endsWith("@gmail.com")) {
      return NextResponse.json(
        { success: false, error: "Email must be a valid @gmail.com address" }, 
        { status: 400 }
      );
    }

    if (body.orderType === "dine-in") {
      if (!body.tableId) {
        return NextResponse.json({ success: false, error: "Table is required for dine-in" }, { status: 400 });
      }
      const table = await Table.findById(body.tableId);
      if (!table) {
        return NextResponse.json({ success: false, error: "Selected table not found" }, { status: 404 });
      }
    }

    // 2. Generate Order Number (ORD-YYMMDD-XXXX)
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const prefix = `ORD-${year}${month}${day}`;

    const lastOrder = await Order.findOne({ orderNumber: { $regex: `^${prefix}` } })
      .sort({ createdAt: -1 })
      .select("orderNumber");
    
    let sequence = "0001";
    if (lastOrder?.orderNumber) {
      const lastSeqStr = lastOrder.orderNumber.split("-").pop();
      const lastSeqNum = parseInt(lastSeqStr || "0");
      if (!isNaN(lastSeqNum)) {
        sequence = String(lastSeqNum + 1).padStart(4, "0");
      }
    }
    const orderNumber = `${prefix}-${sequence}`;

    // 3. Create Order
    const newOrder = await Order.create({
      orderNumber,
      customerId: body.customerId || null,
      orderType: body.orderType || "dine-in",
      tableId: body.orderType === "dine-in" ? body.tableId : null,
      tableNumber: body.orderType === "dine-in" ? body.tableNumber : "Take Away",
      customerName: body.customerName,
      customerEmail: body.customerEmail, // ✅ Email Saved Here
      customerPhone: body.customerPhone || null,
      customerNotes: body.customerNotes || null,
      orderStatus: "confirmed",
      confirmedAt: new Date(),
      subtotal: body.subtotal,
      tax: body.tax || 0,
      serviceCharge: body.serviceCharge || 0,
      discount: body.discount || 0,
      totalAmount: body.totalAmount,
      paymentStatus: body.paymentStatus || "pending",
      paymentMethod: body.paymentMethod || null,
      paidAt: body.paymentStatus === "paid" ? new Date() : null,
    });

    // 4. Create Order Items
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

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
      orderNumber: newOrder.orderNumber,
      data: { ...newOrder.toObject(), items: orderItems }
    }, { status: 201 });

  } catch (error: any) {
    console.error("POST Order Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create order" }, 
      { status: 500 }
    );
  }
}