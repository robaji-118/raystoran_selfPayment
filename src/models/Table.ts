import mongoose, { Schema, Document } from "mongoose";

export interface ITable extends Document {
  tableNumber: string;
  capacity: number;
  status: string;
  currentOrderId: mongoose.Types.ObjectId | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TableSchema = new Schema<ITable>(
  {
    tableNumber: { type: String, required: true, unique: true },
    capacity: { type: Number, required: true },
    status: { type: String, default: "available" }, 
    currentOrderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Table ||
  mongoose.model<ITable>("Table", TableSchema);
