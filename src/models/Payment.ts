import mongoose, { Schema, Document } from "mongoose";

export interface IPayment extends Document {
  orderId: mongoose.Types.ObjectId;
  orderNumber: string;
  customerId: mongoose.Types.ObjectId | null;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
  transactionId: string | null;
  gatewayResponse: unknown | null;
  paidAt: Date | null;
  refundedAt: Date | null;
  refundReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    orderNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    amount: { type: Number, required: true },

    paymentMethod: { type: String, required: true }, // "cash", "qris", "card", etc
    paymentStatus: {
      type: String,
      enum: ["success", "pending", "failed", "refunded"],
      required: true,
    },

    transactionId: { type: String, default: null },
    gatewayResponse: { type: Schema.Types.Mixed, default: null },

    paidAt: { type: Date, default: null },
    refundedAt: { type: Date, default: null },
    refundReason: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model<IPayment>("Payment", PaymentSchema);
