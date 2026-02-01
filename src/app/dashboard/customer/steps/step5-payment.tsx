/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { 
  CheckCircle, 
  Download, 
  ShoppingBag, 
  UtensilsCrossed, 
  User,
  MapPin,
  Wallet
} from "lucide-react";
import { CustomerInfo, TableSelection, CartItem, OrderType } from "../components/dashboard-main";
import OrderSummary from "../components/order-summary"; 

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
  paymentMethod: string;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
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
  paymentMethod,
  onUpdateQuantity,
  onRemoveItem,
}: Step5PaymentProps) {

  // Helper Format Currency
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- CONTENT UTAMA: ORDER SUMMARY (REVIEW) --- */}
      <div className="max-w-xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Review Order</h2>
          <p className="text-gray-500 text-sm mt-1">Please check your items before payment</p>
        </div>

        {/* Panggil OrderSummary dengan mode static agar langsung tampil */}
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
          viewMode="static" // Mode statis (selalu tampil)
        />
      </div>

      {/* --- MODAL SUCCESS (Overlay) --- 
          Muncul otomatis ketika orderId tersedia (setelah pembayaran sukses)
      */}
      {orderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 transform scale-100">
            
            {/* Header Modal */}
            <div className="flex flex-col items-center pt-8 pb-6 px-6 bg-white border-b border-gray-50">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-8 ring-green-50/50">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-gray-900">Payment Successful!</h2>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Order ID: <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{orderNumber || orderId}</span>
              </p>
            </div>

            {/* Receipt Details (Mini) */}
            <div className="px-6 py-6 bg-gray-50/50">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">
                
                {/* Type */}
                <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    {orderType === "dine-in" ? <UtensilsCrossed className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                    Type
                  </span>
                  <span className="text-sm font-bold text-gray-900 capitalize">
                    {orderType.replace("-", " ")}
                  </span>
                </div>

                {/* Customer */}
                <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4" /> 
                    Customer
                  </span>
                  <span className="text-sm font-bold text-gray-900">{customerInfo.name}</span>
                </div>

                {/* Table (Conditional) */}
                {orderType === "dine-in" && selectedTable && (
                  <div className="flex justify-between items-center pb-3 border-b border-dashed border-gray-200">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Table
                    </span>
                    <span className="text-sm font-bold text-gray-900">No. {selectedTable.tableNumber}</span>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Amount Paid
                  </span>
                  <span className="text-lg font-black text-green-600">{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="p-6 bg-white border-t border-gray-100 space-y-3">
              <button
                onClick={() => window.print()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all text-sm font-bold shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download Receipt
              </button>
              
              <button
                onClick={() => window.location.href = '/dashboard/customer'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-lg transform active:scale-95"
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