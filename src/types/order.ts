// types/order.ts

export interface CreateOrderItem {
  menuItemId: string;
  menuItemName: string;
  quantity: number;
  price: number;
  notes?: string;
  category: string;
}

export interface CreateOrderRequest {
  customerName: string;
  customerPhone?: string;
  customerNotes?: string;
  orderType: "dine-in" | "take-away"; // ✅ TAMBAHAN
  tableId: string | null; // ✅ UPDATE: nullable untuk take-away
  tableNumber: string;
  items: CreateOrderItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod: string;
}