// app/api/payments/create/route.ts
import { NextResponse } from "next/server";
import Midtrans from "midtrans-client";
import { v4 as uuidv4 } from 'uuid';

const snap = new Midtrans.Snap({
  isProduction: false, // PASTIKAN INI FALSE UNTUK SANDBOX
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { customerInfo, items } = body;

    // 1. Validasi Input
    if (!items || !Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, message: "Cart is empty" }, { status: 400 });
    }

    if (!customerInfo || typeof customerInfo !== "object" || !customerInfo.name?.trim()) {
        return NextResponse.json({ success: false, message: "Customer name is required" }, { status: 400 });
    }

    // 2. Generate Order ID
    const orderId = `ORDER-${uuidv4().split('-')[0]}-${Date.now()}`;

    // 3. Susun Item Details (Wajib Integer untuk Midtrans)
    let grossAmount = 0;
    
    const itemDetails = items.map((item: any) => {
        const price = Math.round(Number(item.price) || 0);
        const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
        grossAmount += price * quantity;

        return {
            id: String(item.menuItemId || item.id || "").substring(0, 50) || "item",
            price: price,
            quantity: quantity,
            name: String(item.menuItemName || item.name || "Item").substring(0, 50),
        };
    });

    // 4. Hitung Tax & Service (Sesuai Logic Frontend)
    const tax = Math.round(grossAmount * 0.1);
    const serviceCharge = Math.round(grossAmount * 0.05);

    // Tambahkan Tax ke Item Details Midtrans
    if (tax > 0) {
        itemDetails.push({
            id: "TAX",
            price: tax,
            quantity: 1,
            name: "Tax (10%)"
        });
        grossAmount += tax;
    }

    // Tambahkan Service Charge ke Item Details Midtrans
    if (serviceCharge > 0) {
        itemDetails.push({
            id: "SERVICE",
            price: serviceCharge,
            quantity: 1,
            name: "Service Charge (5%)"
        });
        grossAmount += serviceCharge;
    }

    // 5. Parameter Transaksi
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: grossAmount, // Total akhir harus sama persis dengan sum(item_details)
      },
      item_details: itemDetails,
      customer_details: {
        first_name: customerInfo.name,
        phone: customerInfo.phone || "08123456789", // Midtrans wajib ada no HP valid di mode strict tertentu
        notes: customerInfo.notes,
      },
    };

    // 6. Request ke Midtrans
    const transaction = await snap.createTransaction(parameter);

    return NextResponse.json({
      success: true,
      snapToken: transaction.token,
      orderId: orderId,
      orderNumber: orderId,
    });

  } catch (error: any) {
    console.error("Midtrans API Error:", error);
    // Tampilkan pesan error detail dari Midtrans untuk debugging
    return NextResponse.json(
      { 
        success: false, 
        message: error.message || "Failed to create transaction" 
      },
      { status: 500 }
    );
  }
}