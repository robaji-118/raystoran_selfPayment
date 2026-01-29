// models/OrderItem.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem extends Document {
  orderId: mongoose.Types.ObjectId;
  menuItemId: mongoose.Types.ObjectId;
  menuItemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes: string | null;
  status: string;
  cookingStartedAt: Date | null;
  readyAt: Date | null;
  servedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { 
      type: Schema.Types.ObjectId, 
      ref: "Order", 
      required: true 
    },
    menuItemId: { 
      type: Schema.Types.ObjectId, 
      ref: "Menu", 
      required: true 
    },
    menuItemName: { 
      type: String, 
      required: true 
    },
    quantity: { 
      type: Number, 
      required: true,
      min: 1 
    },
    price: { 
      type: Number, 
      required: true,
      min: 0 
    },
    subtotal: { 
      type: Number, 
      required: true,
      min: 0 
    },
    notes: { 
      type: String, 
      default: null 
    },
    status: {
      type: String,
      enum: ["preparing", "ready", "served", "cancelled"],
      default: "preparing"
    },
    cookingStartedAt: { 
      type: Date, 
      default: null 
    },
    readyAt: { 
      type: Date, 
      default: null 
    },
    servedAt: { 
      type: Date, 
      default: null 
    }
  },
  { timestamps: true }
);

// Indexes untuk performa query
OrderItemSchema.index({ orderId: 1 });
OrderItemSchema.index({ menuItemId: 1 });
OrderItemSchema.index({ status: 1 });
OrderItemSchema.index({ orderId: 1, status: 1 });

export default mongoose.models.OrderItem || 
  mongoose.model<IOrderItem>("OrderItem", OrderItemSchema);