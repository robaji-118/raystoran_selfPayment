import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import Table from '@/models/Table';
import mongoose from 'mongoose';
import { sendCancellationEmail, sendReadyEmail } from '@/lib/mail';


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    const items = await OrderItem.find({ orderId: id });
    return NextResponse.json({ success: true, data: { ...order.toObject(), items } });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- PATCH Update Order & Timestamps ---
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await request.json();

    // 1. Validasi ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    // 2. Ambil Data Order Lama
    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    const newStatus = body.orderStatus;
    const updateData: any = {
      orderStatus: newStatus,
      updatedAt: new Date()
    };

    // --- LOGIKA DATE & STATUS ---

    // A. Status: PREPARING (Kitchen Start)
    if (newStatus === 'preparing' && !order.cookingStartedAt) {
      updateData.cookingStartedAt = new Date();
      await OrderItem.updateMany(
        { orderId: id, status: 'pending' },
        { status: 'preparing', cookingStartedAt: new Date() }
      );
    }

    // B. Status: READY (Kitchen Finish -> Waiter)
    if (newStatus === 'ready' && !order.readyAt) {
      updateData.readyAt = new Date();
      await OrderItem.updateMany(
        { orderId: id },
        { status: 'ready', readyAt: new Date() }
      );
    }

    // C. Status: DELIVERING (Waiter Mengantar)
    if (newStatus === 'delivering' && !order.deliveringAt) {
      updateData.deliveringAt = new Date();

      // Trigger Email Ready
      if (order.customerEmail) {
        try {
          const orderItems = await OrderItem.find({ orderId: id }).select('menuItemName quantity price').lean();
          const itemsForEmail = orderItems.map((i: any) => ({ menuItemName: i.menuItemName, quantity: i.quantity, price: i.price }));

          sendReadyEmail(
            order.customerEmail,
            order.customerName,
            order.orderNumber,
            order.tableNumber || 'N/A',
            itemsForEmail
          ).catch(err => console.error("Email delivering bg error:", err));
        } catch (err) {
          console.error("Error setup email delivering:", err);
        }
      }
    }

    // D. Status: COMPLETED (Selesai Makan/Bayar)
    if (newStatus === 'completed' && !order.completedAt) {
      updateData.completedAt = new Date();

      await OrderItem.updateMany(
        { orderId: id },
        { status: 'served', servedAt: new Date() }
      );

      // Bebaskan Meja
      if (order.orderType === 'dine-in' && order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
      }
    }

    // E. Status: CANCELLED (Batal)
    if (newStatus === 'cancelled') {
      const reason = body.cancellationReason || 'Kendala operasional internal';
      updateData.cancellationReason = reason;

      await OrderItem.updateMany({ orderId: id }, { status: 'cancelled' });

      if (order.orderType === 'dine-in' && order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
      }

      // Kirim Email Pembatalan
      if (order.customerEmail) {
        try {
          const orderItems = await OrderItem.find({ orderId: id }).select('menuItemName quantity price').lean();
          const itemsForEmail = orderItems.map((i: any) => ({ menuItemName: i.menuItemName, quantity: i.quantity, price: i.price }));

          sendCancellationEmail(
            order.customerEmail,
            order.customerName,
            order.orderNumber,
            reason,
            itemsForEmail
          ).catch(err => console.error("Email cancel bg error:", err));
        } catch (err) {
          console.error("Error kirim email pembatalan:", err);
        }
      }
    }

    // 3. Update Database Utama
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, { new: true });
    const items = await OrderItem.find({ orderId: id });

    return NextResponse.json({
      success: true,
      data: { ...updatedOrder.toObject(), items }
    });

  } catch (error: any) {
    console.error("PATCH Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// --- DELETE Order ---
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const order = await Order.findById(id);
    if (!order) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });

    // Free table logic
    if (order.orderType === 'dine-in' && order.tableId) {
      await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
    }

    const reason = 'Order deleted by admin';
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    await order.save();

    // Also cancel items
    await OrderItem.updateMany({ orderId: id }, { status: 'cancelled' });

    // Kirim email notifikasi pembatalan
    if (order.customerEmail) {
      try {
        const orderItems = await OrderItem.find({ orderId: id }).select('menuItemName quantity price').lean();
        const itemsForEmail = orderItems.map((i: any) => ({ menuItemName: i.menuItemName, quantity: i.quantity, price: i.price }));

        sendCancellationEmail(
          order.customerEmail,
          order.customerName,
          order.orderNumber,
          reason,
          itemsForEmail
        ).catch(err => console.error("Email delete bg error:", err));
      } catch (err) {
        console.error("Error kirim email pembatalan (DELETE):", err);
      }
    }

    return NextResponse.json({ success: true, message: 'Order cancelled and marked as deleted' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}