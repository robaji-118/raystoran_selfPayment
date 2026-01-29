// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/database";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import crypto from "crypto";

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

    // Update order
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: paymentStatus === "success" ? "paid" : "unpaid",
      orderStatus: orderStatus,
    });

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