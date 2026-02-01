// app/dashboard/customer/steps/step5-payment.tsx
"use client";

import { CheckCircle, Download, Clock, ShoppingBag, UtensilsCrossed, Receipt, CreditCard } from "lucide-react";
import { CustomerInfo, TableSelection, CartItem } from "../components/dashboard-main";
import OrderSummary from "../components/order-summary";

type OrderType = "dine-in" | "take-away";

interface Step5PaymentProps {
  orderId: string | null;
  orderNumber: string | null;
  customerInfo: CustomerInfo;
  selectedTable: TableSelection | null;
  orderType: OrderType;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod?: string;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export default function Step5Payment({
  orderId,
  orderNumber,
  customerInfo,
  selectedTable,
  orderType,
  cart,
  subtotal,
  tax,
  serviceCharge,
  totalAmount,
  paymentMethod = "QRIS",
  onUpdateQuantity,
  onRemoveItem,
}: Step5PaymentProps) {

  return (
    <div className="relative">
      {/* 1. CONTENT UTAMA (Background)
        PERBAIKAN: Blur dan Opacity hanya aktif jika orderId SUDAH ADA (Sukses).
        Jika belum ada orderId, tampilan akan jelas.
      */}
      <div className={`space-y-6 transition-all duration-300 ${
        orderId ? "opacity-50 pointer-events-none filter blur-[1px]" : "opacity-100"
      }`}>
        <div className="justify-center">
           <OrderSummary
             cart={cart}
             customerInfo={customerInfo}
             selectedTable={selectedTable}
             orderType={orderType}
             subtotal={subtotal}
             tax={tax}
             serviceCharge={serviceCharge}
             totalAmount={totalAmount}
             onUpdateQuantity={onUpdateQuantity}
             onRemoveItem={onRemoveItem}
           />
        </div>
      </div>

      {/* 2. MODAL SUCCESS (Overlay)
        Muncul hanya jika orderId ada
      */}
      {orderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header Modal */}
            <div className="flex flex-col items-center pt-8 pb-4 px-6 bg-white">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mt-1">Order ID : <span className="font-mono font-medium text-gray-700">{orderNumber || orderId}</span></p>
            </div>

            {/* Content Details (Style mirip OrderSummary) */}
            <div className="px-6 py-2">
              <div className=" rounded-lg  p-4 space-y-7">
                {/* Order Type */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    {orderType === "dine-in" ? <UtensilsCrossed className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                    Type
                  </span>
                  <span className="text-xs ">
                    {orderType === "dine-in" ? "Dine In" : "Take Away"}
                  </span>
                </div>

                {/* Customer */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5" /> 
                    Customer
                  </span>
                  <span className="text-sm font-medium text-gray-900">{customerInfo.name}</span>
                </div>

                {/* Table (Conditional) */}
                {orderType === "dine-in" && selectedTable && (
                  <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                    <span className="text-xs text-gray-500">Table</span>
                    <span className="text-sm font-medium text-gray-900">Table {selectedTable.tableNumber}</span>
                  </div>
                )}

                {/* Payment Method */}
                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    Method
                  </span>
                  <span className="text-xs font-medium text-gray-900 uppercase">{paymentMethod}</span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-gray-700">Total Paid</span>
                  <span className="text-lg font-bold text-gray-900">Rp {totalAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Footer Status Message */}
            <div className="px-6 pb-2 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1.5">
                <Clock className="w-3 h-3" />
                {orderType === "dine-in" 
                  ? "Please wait at your table, we are preparing your order."
                  : "Please wait at the counter, your order is being prepared."
                }
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-6  border-t border-gray-100 mt-4 space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700  hover:text-gray-900 rounded-lg transition-colors text-sm font-medium shadow-sm cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard/customer'}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-black hover:bg-gray-800 text-white rounded-lg transition-colors text-sm font-medium shadow-md cursor-pointer"
              >
                Create New Order
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}