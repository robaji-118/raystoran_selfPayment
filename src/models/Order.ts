/* eslint-disable @typescript-eslint/no-explicit-any */
// models/Order.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrder extends Document {
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  orderType: "dine-in" | "take-away";
  tableId: mongoose.Types.ObjectId | null;
  tableNumber: string;
  customerName: string;
  customerPhone: string | null;
  orderStatus: string;
  confirmedAt: Date | null;
  cookingStartedAt: Date | null;
  readyAt: Date | null;
  deliveringAt: Date | null;
  completedAt: Date | null;
  kitchenAssignedTo: mongoose.Types.ObjectId | null;
  waiterAssignedTo: mongoose.Types.ObjectId | null;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  paymentStatus: string;
  paymentMethod: string | null;
  paidAt: Date | null;
  customerNotes: string | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { 
      type: String, 
      required: true, 
      unique: true
    },
    customerId: { 
      type: Schema.Types.ObjectId, 
      ref: "User" 
    },
    orderType: {
      type: String,
      enum: ["dine-in", "take-away"],
      default: "dine-in",
      required: true
    },
    tableId: { 
      type: Schema.Types.ObjectId, 
      ref: "Table",
      default: null,
      // ✅ VALIDASI YANG LEBIH BAIK: Custom validator
      validate: {
        validator: function(this: any, value: any) {
          // Jika orderType adalah dine-in, tableId harus ada
          if (this.orderType === 'dine-in') {
            return value !== null && value !== undefined;
          }
          // Jika take-away, tableId boleh null
          return true;
        },
        message: 'Table ID is required for dine-in orders'
      }
    },
    tableNumber: { 
      type: String, 
      required: true 
    },
    customerName: { 
      type: String, 
      required: true 
    },
    customerPhone: { 
      type: String, 
      default: null 
    },
    orderStatus: {
      type: String,
      enum: ["confirmed", "preparing", "ready", "delivering", "completed", "cancelled"],
      default: "confirmed"
    },
    confirmedAt: { 
      type: Date, 
      default: null 
    },
    cookingStartedAt: { 
      type: Date, 
      default: null 
    },
    readyAt: { 
      type: Date, 
      default: null 
    },
    deliveringAt: { 
      type: Date, 
      default: null 
    },
    completedAt: { 
      type: Date, 
      default: null 
    },
    kitchenAssignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    waiterAssignedTo: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      default: null 
    },
    subtotal: { 
      type: Number, 
      required: true,
      min: 0 
    },
    tax: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    serviceCharge: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    discount: { 
      type: Number, 
      default: 0,
      min: 0 
    },
    totalAmount: { 
      type: Number, 
      required: true,
      min: 0 
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending"
    },
    paymentMethod: { 
      type: String, 
      enum: ["cash", "qris", "card", "transfer", null],
      default: null 
    },
    paidAt: { 
      type: Date, 
      default: null 
    },
    customerNotes: { 
      type: String, 
      default: null 
    },
    cancellationReason: { 
      type: String, 
      default: null 
    }
  },
  { timestamps: true }
);

// Indexes untuk performa query
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ customerId: 1 });
OrderSchema.index({ tableId: 1 });
OrderSchema.index({ orderStatus: 1 });
OrderSchema.index({ paymentStatus: 1 });
OrderSchema.index({ orderType: 1 });
OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ orderStatus: 1, paymentStatus: 1 });
OrderSchema.index({ orderType: 1, orderStatus: 1 });

// Virtual untuk mendapatkan items dari OrderItem
OrderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'orderId',
  justOne: false
});

// Enable virtuals pada toJSON
OrderSchema.set('toJSON', { virtuals: true });
OrderSchema.set('toObject', { virtuals: true });

export default mongoose.models.Order || 
  mongoose.model<IOrder>("Order", OrderSchema);