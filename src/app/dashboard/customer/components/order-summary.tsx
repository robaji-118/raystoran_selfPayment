// app/dashboard/customer/components/order-summary.tsx
"use client";

import { useState } from "react";
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  User, 
  Table2, 
  X,
  Receipt,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  
  // PROP BARU UNTUK MENGATUR MODE TAMPILAN
  viewMode?: "sidebar" | "static"; 
}

export default function OrderSummary(props: OrderSummaryProps) {
  const { viewMode = "sidebar" } = props; // Default ke "sidebar"
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const totalItems = props.cart.reduce((acc, item) => acc + item.quantity, 0);

  // --- MODE STATIC (UNTUK STEP 5) ---
  // Tampil langsung tanpa tombol floating, tanpa modal, selalu terlihat.
  if (viewMode === "static") {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
         <SummaryContent {...props} isStatic={true} />
      </div>
    );
  }

  // --- MODE SIDEBAR (DEFAULT) ---
  return (
    <>
      {/* MOBILE: Floating Button (Hanya muncul di mode sidebar) */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="fixed top-4 left-4 z-40 bg-black text-white p-3 rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95"
        >
          <ShoppingCart className="w-5 h-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {totalItems}
            </span>
          )}
        </button>

        {/* MOBILE: Drawer Modal */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="relative w-full sm:w-[400px] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <h3 className="font-bold text-lg">Current Order</h3>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="overflow-y-auto">
                <SummaryContent {...props} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* DESKTOP: Static Sidebar */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden sticky top-6">
         <SummaryContent {...props} />
      </div>
    </>
  );
}

// --- KONTEN ORDER SUMMARY (REUSABLE) ---
function SummaryContent({
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
  isStatic = false // Penanda apakah ini mode static (Step 5)
}: OrderSummaryProps & { isStatic?: boolean }) {
  
  // Helper Currency
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  return (
    <div className="flex flex-col h-full">
      {/* Header Info */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div>
              <h5 className="!text-base !font-bold text-gray-900">Order Summary</h5>
              <p className="!text-xs text-gray-500">{cart.length} Items</p>
            </div>
          </div>
          <div className={cn(
            "px-3 py-1 rounded-full !text-[10px] font-bold border tracking-wider uppercase",
            orderType === "dine-in" 
              ? "bg-black text-white border-black" 
              : "bg-white text-black border-gray-300"
          )}>
            {orderType === "dine-in" ? "Dine In" : "Take Away"}
          </div>
        </div>

        {/* Customer Info (Hanya tampilkan jika bukan mode static Step 5, karena di Step 5 infonya sudah ada di kiri) 
            Kecuali Anda ingin tetap menampilkannya, hapus kondisi !isStatic
        */}
        {!isStatic && (
          <div className="grid grid-cols-1 gap-2">
            {customerInfo.name && (
              <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-gray-600" />
                </div>
                <div className="min-w-0">
                  <p className="!text-[10px] text-gray-400 font-medium uppercase">Customer</p>
                  <p className="!text-sm font-bold text-gray-900 truncate">{customerInfo.name}</p>
                </div>
              </div>
            )}
            {orderType === "dine-in" && selectedTable && (
              <div className="flex items-center gap-3 p-2.5 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Table2 className="w-4 h-4 text-gray-600" />
                </div>
                <div>
                  <p className="!text-[10px] text-gray-400 font-medium uppercase">Table</p>
                  <p className="!text-sm font-bold text-gray-900">No. {selectedTable.tableNumber}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Cart Items List */}
      <div className={cn(
        "p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200",
        isStatic ? "max-h-[400px]" : "max-h-[300px]"
      )}>
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <ShoppingCart className="w-6 h-6 text-gray-300" />
            </div>
            <p className="!text-sm font-medium text-gray-900">Cart is empty</p>
          </div>
        ) : (
          <div className="space-y-4">
            {cart.map((item) => (
              <div key={item.menuItemId} className="group relative flex gap-3">
                {/* Qty Controls */}
                <div className="flex flex-col items-center gap-1">
                   <button 
                     onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                     className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                   >
                     <Plus className="w-3 h-3" />
                   </button>
                   <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                   <button 
                     onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                     className="w-6 h-6 flex items-center justify-center rounded-md bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
                   >
                     <Minus className="w-3 h-3" />
                   </button>
                </div>

                {/* Info Column */}
                <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-transparent hover:border-gray-200 transition-colors relative">
                   <div className="flex justify-between items-start gap-2">
                      <p className="!text-sm font-bold text-gray-900 leading-tight">{item.menuItemName}</p>
                      <p className="!text-sm font-bold text-gray-900 whitespace-nowrap">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                   </div>
                   <p className="!text-xs text-gray-400 mt-0.5">
                      @ {formatCurrency(item.price)}
                   </p>
                   {item.notes && (
                     <div className="mt-2 text-[10px] bg-white p-1.5 rounded border border-gray-100 text-gray-500 italic inline-block">
                       "{item.notes}"
                     </div>
                   )}
                   
                   <button
                    onClick={() => onRemoveItem(item.menuItemId)}
                    className="absolute -right-2 -top-2 bg-white text-gray-400 hover:text-red-500 p-1.5 rounded-full shadow-sm border border-gray-100 opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                    title="Remove Item"
                   >
                     <Trash2 className="w-3.5 h-3.5" />
                   </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Totals */}
      <div className="p-5 border-t border-gray-100 mt-auto bg-gray-50/30">
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center !text-xs text-gray-500">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center !text-xs text-gray-500">
            <span>Tax (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between items-center !text-xs text-gray-500">
            <span>Service Charge (5%)</span>
            <span>{formatCurrency(serviceCharge)}</span>
          </div>
        </div>
        
        <div className="pt-3 border-t border-gray-200 border-dashed">
          <div className="flex justify-between items-end">
            <div>
              <p className="!text-xs text-gray-500 mb-0.5">Total Amount</p>
              <p className="!text-xl font-black text-gray-900">{formatCurrency(totalAmount)}</p>
            </div>
          </div>
        </div>

        {/* Info Box (Hanya tampil di mode static/review) */}
        {isStatic && (
          <div className="mt-4 flex items-center gap-2 text-xs text-gray-500 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
             <Clock className="w-4 h-4 text-orange-500" />
             <span>Est. preparation time: <span className="font-bold text-gray-900">15-20 mins</span></span>
          </div>
        )}
      </div>
    </div>
  );
}