import mongoose, { Schema, Document } from "mongoose";

export interface IMenu extends Document {
  name: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  price: number;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MenuSchema = new Schema<IMenu>(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    categoryId: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    isAvailable: { type: Boolean, default: true },
    preparationTime: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.models.Menu || mongoose.model<IMenu>("Menu", MenuSchema);
