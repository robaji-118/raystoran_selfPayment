// app/dashboard/customer/components/order-summary.tsx
"use client";

import { ShoppingCart, Trash2, Plus, Minus, UtensilsCrossed, ShoppingBag, User, Table2 } from "lucide-react";
import { CartItem, CustomerInfo, TableSelection } from "./dashboard-main";

type OrderType = "dine-in" | "take-away";

interface OrderSummaryProps {
  cart: CartItem[];
  customerInfo: CustomerInfo;
  selectedTable: TableSelection | null;
  orderType: OrderType;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export default function OrderSummary({
  cart,
  customerInfo,
  selectedTable,
  orderType,
  subtotal,
  tax,
  serviceCharge,
  totalAmount,
  onUpdateQuantity,
  onRemoveItem,
}: OrderSummaryProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 ">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h5 className="!text-base !font-bold text-gray-900">Order Summary</h5>
            <p className="!text-sm text-gray-500">{cart.length} items in cart</p>
          </div>
          <div className={`px-2.5 py-1 rounded-full !text-xs font-semibold border ${
            orderType === "dine-in" 
              ? " text-gray-900 border-gray-300" 
              : " text-gray-900 border-gray-300"
          }`}>
            {orderType === "dine-in" ? "DINE IN" : "TAKE AWAY"}
          </div>
        </div>

        {/* Customer & Table Info */}
        <div className="space-y-2">
          {customerInfo.name && (
            <div className="flex items-center gap-2 p-2 rounded-md">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="!text-xs text-gray-500">Customer</p>
                <p className="!text-sm font-medium text-gray-900 truncate">{customerInfo.name}</p>
              </div>
            </div>
          )}

          {orderType === "dine-in" && selectedTable && (
            <div className="flex items-center gap-2 p-2 rounded-md">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <Table2 className="w-4 h-4" />
              </div>
              <div>
                <p className="!text-xs text-gray-500">Table</p>
                <p className="!text-sm font-medium text-gray-900">Table {selectedTable.tableNumber}</p>
              </div>
            </div>
          )}

          {orderType === "take-away" && (
            <div className="flex items-center gap-2 p-2 rounded-md">
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <p className="!text-xs text-gray-500">Pickup Location</p>
                <p className="!text-sm font-medium text-gray-900">takeaway place</p>
              </div>
            </div>
          )}
        </div>  
      </div>

      {/* Cart Items */}
      <div className="p-4 max-h-72 scrollbar-thin overflow-auto ">
        {cart.length === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12  rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6 text-gray-400" />
            </div>
            <p className="!text-sm text-gray-500">Your cart is empty</p>
            <p className="!text-xs text-gray-400 mt-1">Add items to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.menuItemId} className="group flex items-end gap-3 p-3  rounded-md transition-colors">
                {/* Item Info */}
                <div className="flex-1 min-w-0">
                  <p className="!text-sm font-medium text-gray-900 truncate mb-1">{item.menuItemName}</p>
                  <div className="flex items-center justify-between">
                    <p className="!text-xs text-gray-600">
                      Rp {item.price.toLocaleString()} × {item.quantity}
                    </p>
                    <p className="!text-sm font-bold text-gray-900">
                      Rp {(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                  {item.notes && (
                    <p className="!text-xs text-gray-500 mt-1 italic">Note: {item.notes}</p>
                  )}
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 items-end">
                  <div className="flex items-center bg-white border border-gray-300 rounded-md">
                    <button
                      onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-l transition-colors"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="!text-sm font-semibold text-gray-900 w-7 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded-r transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  
                  {/* Remove Button */}
                  <button
                    onClick={() => onRemoveItem(item.menuItemId)}
                    className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Totals */}
      <div className="p-4 border-t border-gray-200 ">
        <div className="space-y-2">
          <div className="flex justify-between items-center !text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900 font-medium">Rp {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center !text-sm">
            <span className="text-gray-600">Tax (10%)</span>
            <span className="text-gray-900 font-medium">Rp {tax.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center !text-sm">
            <span className="text-gray-600">Service Charge (5%)</span>
            <span className="text-gray-900 font-medium">Rp {serviceCharge.toLocaleString()}</span>
          </div>
          
          {/* Total Amount */}
          <div className="pt-3 mt-2 border-t border-gray-300">
            <div className="flex justify-between items-center">
              <span className="!text-base font-bold text-gray-900">Total Amount</span>
              <span className="!text-lg font-bold text-gray-900">Rp {totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Order Type Info Footer */}
        <div className={`mt-4 p-2.5 rounded-md !text-xs text-center ${
          orderType === "dine-in"
            ? "bg-gray-100 border border-gray-50 text-gray-400"
            : "bg-gray-100 border border-gray-50 text-gray-400"
        }`}>
          <p className="!text-base text-gray-500">
            {orderType === "dine-in"
              ? "Your order will be served at your table"
              : "Ready for pickup at the counter"
            }
          </p>
        </div>
      </div>
    </div>
  );
}