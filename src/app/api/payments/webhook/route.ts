// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import OrderItem from "@/models/OrderItem";
import crypto from "crypto";
import { sendCancellationEmail } from "@/lib/mail";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    // Verify signature dari Midtrans
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
      payment_type,
      transaction_id,
    } = body;

    // Verifikasi signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY!;
    const hash = crypto
      .createHash("sha512")
      .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
      .digest("hex");

    if (hash !== signature_key) {
      console.error("Invalid signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 403 }
      );
    }

    // Cari payment berdasarkan orderNumber
    const payment = await Payment.findOne({ orderNumber: order_id });
    
    if (!payment) {
      console.error("Payment not found:", order_id);
      return NextResponse.json(
        { error: "Payment not found" },
        { status: 404 }
      );
    }

    // Update payment status berdasarkan transaction_status
    let paymentStatus = payment.paymentStatus;
    let orderStatus = "pending";
    let paidAt = payment.paidAt;

    if (transaction_status === "capture" || transaction_status === "settlement") {
      if (fraud_status === "accept" || !fraud_status) {
        paymentStatus = "success";
        orderStatus = "confirmed";
        paidAt = new Date();
      }
    } else if (transaction_status === "pending") {
      paymentStatus = "pending";
      orderStatus = "pending";
    } else if (transaction_status === "deny" || transaction_status === "expire" || transaction_status === "cancel") {
      paymentStatus = "failed";
      orderStatus = "cancelled";
    } else if (transaction_status === "refund") {
      paymentStatus = "refunded";
      orderStatus = "refunded";
    }

    // Update payment
    payment.paymentStatus = paymentStatus;
    payment.transactionId = transaction_id;
    payment.paidAt = paidAt;
    payment.gatewayResponse = body;
    await payment.save();

    // Ambil data order & items jika akan dikirim email pembatalan
    let orderForEmail = null;
    let itemsForEmail: { menuItemName: string; quantity: number; price: number }[] = [];
    if (orderStatus === "cancelled") {
      orderForEmail = await Order.findById(payment.orderId)
        .select("customerEmail customerName orderNumber")
        .lean();
      const orderItems = await OrderItem.find({ orderId: payment.orderId })
        .select("menuItemName quantity price")
        .lean();
      itemsForEmail = orderItems.map((i) => ({
        menuItemName: i.menuItemName,
        quantity: i.quantity,
        price: i.price,
      }));
    }

    // Update order
    const updatePayload: Record<string, unknown> = {
      paymentStatus: paymentStatus === "success" ? "paid" : "unpaid",
      orderStatus: orderStatus,
    };
    if (orderStatus === "cancelled") {
      const reasonMap: Record<string, string> = {
        deny: "Pembayaran ditolak",
        expire: "Pembayaran kedaluwarsa",
        cancel: "Pembayaran dibatalkan",
      };
      updatePayload.cancellationReason =
        reasonMap[transaction_status] || "Pembayaran gagal";
    }
    await Order.findByIdAndUpdate(payment.orderId, { $set: updatePayload });

    // Kirim email pembatalan jika order dibatalkan via payment
    if (orderStatus === "cancelled" && orderForEmail?.customerEmail) {
      try {
        await sendCancellationEmail(
          orderForEmail.customerEmail,
          orderForEmail.customerName,
          orderForEmail.orderNumber,
          (updatePayload.cancellationReason as string) || "Pembayaran gagal",
          itemsForEmail
        );
      } catch (err) {
        console.error("Error kirim email pembatalan (webhook):", err);
      }
    }

    console.log(`Payment ${order_id} updated to ${paymentStatus}`);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}