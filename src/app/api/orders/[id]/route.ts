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

    const updateData: any = { orderStatus: body.orderStatus, updatedAt: new Date() };

    // --- LOGIKA STATUS ---

    // A. Status: PREPARING
    if (body.orderStatus === 'preparing' && !order.cookingStartedAt) {
      updateData.cookingStartedAt = new Date();
      await OrderItem.updateMany(
        { orderId: id, status: 'pending' }, 
        { status: 'preparing', cookingStartedAt: new Date() }
      );
    }

    // B. Status: DELIVERING (Trigger Email "Pesanan Sedang Diantar")
    if (body.orderStatus === 'delivering' && !order.deliveringAt) {
      updateData.deliveringAt = new Date();
      if (order.customerEmail) {
        try {
          const sent = await sendReadyEmail(
            order.customerEmail,
            order.customerName,
            order.orderNumber,
            order.tableNumber || 'N/A'
          );
          if (!sent) console.warn("Email delivering gagal terkirim ke:", order.customerEmail);
        } catch (err) {
          console.error("Error kirim email delivering:", err);
        }
      }
    }

    // D. Status: COMPLETED (Bebaskan Meja)
    if (body.orderStatus === 'completed' && !order.completedAt) {
      updateData.completedAt = new Date();
      await OrderItem.updateMany(
        { orderId: id }, 
        { status: 'served', servedAt: new Date() }
      );
      
      if (order.orderType === 'dine-in' && order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
      }
    }

    // E. Status: CANCELLED (Trigger Email "Batal" + Bebaskan Meja)
    if (body.orderStatus === 'cancelled') {
      const reason = body.cancellationReason || 'Kendala operasional internal';
      updateData.cancellationReason = reason;
      
      await OrderItem.updateMany({ orderId: id }, { status: 'cancelled' });
      
      if (order.orderType === 'dine-in' && order.tableId) {
        await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
      }

      // Kirim Email Pembatalan
      if (order.customerEmail) {
        try {
          const sent = await sendCancellationEmail(
            order.customerEmail,
            order.customerName,
            order.orderNumber,
            reason
          );
          if (!sent) console.warn("Email pembatalan gagal terkirim ke:", order.customerEmail);
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

    const reason = 'Order deleted';
    order.orderStatus = 'cancelled';
    order.cancellationReason = reason;
    await order.save();
    
    // Also cancel items
    await OrderItem.updateMany({ orderId: id }, { status: 'cancelled' });

    // Kirim email notifikasi pembatalan
    if (order.customerEmail) {
      try {
        await sendCancellationEmail(
          order.customerEmail,
          order.customerName,
          order.orderNumber,
          reason
        );
      } catch (err) {
        console.error("Error kirim email pembatalan (DELETE):", err);
      }
    }

    return NextResponse.json({ success: true, message: 'Order cancelled' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}