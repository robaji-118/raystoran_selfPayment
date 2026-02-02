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

    // B. Status: READY (Trigger Email "Siap Diantar")
    if (body.orderStatus === 'ready' && !order.readyAt) {
      updateData.readyAt = new Date();
      await OrderItem.updateMany(
        { orderId: id, status: 'preparing' }, 
        { status: 'ready', readyAt: new Date() }
      );

      // Kirim Email
      if (order.customerEmail) {
        sendReadyEmail(
          order.customerEmail,
          order.customerName,
          order.orderNumber,
          order.tableNumber
        );
      }
    }

    // C. Status: DELIVERING
    if (body.orderStatus === 'delivering' && !order.deliveringAt) {
      updateData.deliveringAt = new Date();
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

      // Kirim Email
      if (order.customerEmail) {
        sendCancellationEmail(
          order.customerEmail,
          order.customerName,
          order.orderNumber,
          reason
        );
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

    order.orderStatus = 'cancelled';
    order.cancellationReason = 'Order deleted';
    await order.save();
    
    // Also cancel items
    await OrderItem.updateMany({ orderId: id }, { status: 'cancelled' });

    return NextResponse.json({ success: true, message: 'Order cancelled' });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}