/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/database';
import Order from '@/models/Order';
import OrderItem from '@/models/OrderItem';
import Table from '@/models/Table';
import mongoose from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    // Await params first
    const { id } = await params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get order items separately
    const items = await OrderItem.find({ orderId: id });
    
    return NextResponse.json({
      success: true,
      data: {
        ...order.toObject(),
        items
      }
    });
  } catch (error: any) {
    console.error('GET Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  console.log('=== API PATCH START ===');
  
  try {
    // 1. Await params first
    const { id } = await params;
    console.log('Order ID from params:', id);
    
    // 2. Validate order ID
    if (!id || id === 'undefined' || id === '[id]') {
      console.log('Invalid order ID:', id);
      return NextResponse.json(
        { 
          success: false,
          error: 'Order ID is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // Validate MongoDB ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid MongoDB ObjectId:', id);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid order ID format',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // 3. Parse request body
    let body;
    try {
      body = await request.json();
      console.log('Request body:', body);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid JSON in request body',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // 3. Validate required fields
    if (!body.orderStatus) {
      return NextResponse.json(
        { 
          success: false,
          error: 'orderStatus is required',
          timestamp: new Date().toISOString()
        },
        { status: 400 }
      );
    }
    
    // 4. Connect to database
    try {
      await connectDB();
      console.log('Database connected successfully');
    } catch (dbError) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          success: false,
          error: 'Database connection failed',
          details: dbError instanceof Error ? dbError.message : 'Unknown DB error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    // 5. Find order
    const order = await Order.findById(id);
    if (!order) {
      console.log('Order not found:', id);
      return NextResponse.json(
        { 
          success: false,
          error: 'Order not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }
    
    console.log('Found order:', order._id, 'current status:', order.orderStatus);
    console.log('Order type:', order.orderType, 'Table ID:', order.tableId); // ✅ Log order type
    
    // 6. Prepare update data
    const updateData: any = {
      orderStatus: body.orderStatus,
      updatedAt: new Date()
    };
    
    // Set timestamps based on status
    if (body.orderStatus === 'preparing' && !order.cookingStartedAt) {
      updateData.cookingStartedAt = body.cookingStartedAt || new Date();
      console.log('Setting cookingStartedAt:', updateData.cookingStartedAt);
      
      // Update all order items to preparing status
      await OrderItem.updateMany(
        { orderId: id, status: 'pending' },
        { 
          status: 'preparing',
          cookingStartedAt: updateData.cookingStartedAt
        }
      );
      console.log('Updated order items to preparing');
    }
    
    if (body.orderStatus === 'ready' && !order.readyAt) {
      updateData.readyAt = body.readyAt || new Date();
      console.log('Setting readyAt:', updateData.readyAt);
      
      // Update all order items to ready status
      await OrderItem.updateMany(
        { orderId: id, status: 'preparing' },
        { 
          status: 'ready',
          readyAt: updateData.readyAt
        }
      );
      console.log('Updated order items to ready');
    }
    
    if (body.orderStatus === 'delivering' && !order.deliveringAt) {
      updateData.deliveringAt = new Date();
    }
    
    // ✅ TAMBAHAN: Handle completed status - free table untuk dine-in
    if (body.orderStatus === 'completed' && !order.completedAt) {
      updateData.completedAt = new Date();
      
      // Update all order items to served status
      await OrderItem.updateMany(
        { orderId: id, status: 'ready' },
        { 
          status: 'served',
          servedAt: new Date()
        }
      );

      // ✅ TAMBAHAN: Free table jika dine-in order
      if (order.orderType === 'dine-in' && order.tableId) {
        try {
          const table = await Table.findById(order.tableId);
          if (table && table.status === 'occupied') {
            table.status = 'available';
            await table.save();
            console.log(`Table ${order.tableNumber} freed successfully`);
          }
        } catch (tableError) {
          console.error('Error freeing table:', tableError);
          // Don't fail the order update if table update fails
        }
      }
    }

    // ✅ TAMBAHAN: Handle cancelled status - free table
    if (body.orderStatus === 'cancelled') {
      updateData.cancellationReason = body.cancellationReason || 'Order cancelled';
      
      // Free table jika dine-in order
      if (order.orderType === 'dine-in' && order.tableId) {
        try {
          const table = await Table.findById(order.tableId);
          if (table && table.status === 'occupied') {
            table.status = 'available';
            await table.save();
            console.log(`Table ${order.tableNumber} freed after cancellation`);
          }
        } catch (tableError) {
          console.error('Error freeing table on cancellation:', tableError);
        }
      }
    }
    
    // 7. Update order
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!updatedOrder) {
      console.error('Failed to update order');
      return NextResponse.json(
        { 
          success: false,
          error: 'Failed to update order',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
    
    console.log('Order updated successfully:', updatedOrder._id);
    
    // 8. Get updated order items
    const items = await OrderItem.find({ orderId: id });
    console.log('Retrieved order items:', items.length);
    
    // 9. Return success response
    const response = {
      success: true,
      message: `Order ${order.orderNumber} updated to ${body.orderStatus}`,
      data: {
        ...updatedOrder.toObject(),
        items
      },
      timestamp: new Date().toISOString()
    };
    
    console.log('=== API PATCH SUCCESS ===');
    return NextResponse.json(response);
    
  } catch (error: any) {
    console.error('=== API PATCH ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error',
        message: error.message || 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// ✅ TAMBAHAN: DELETE endpoint untuk cancel order
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id } = await params;
    
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      );
    }

    // Free table jika dine-in
    if (order.orderType === 'dine-in' && order.tableId) {
      try {
        await Table.findByIdAndUpdate(order.tableId, { status: 'available' });
        console.log(`Table ${order.tableNumber} freed on order deletion`);
      } catch (tableError) {
        console.error('Error freeing table on deletion:', tableError);
      }
    }

    order.orderStatus = 'cancelled';
    order.cancellationReason = 'Order deleted';
    await order.save();

    return NextResponse.json({
      success: true,
      message: 'Order cancelled successfully',
      data: order
    });
  } catch (error: any) {
    console.error('DELETE Order Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}