/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/waiter/components/ready-orders-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Truck,
  Package,
  AlertTriangle,
  Search,
  ChefHat,
  UtensilsCrossed,
  ArrowRight,
} from "lucide-react";

interface OrderItem {
  _id: string;
  menuItemName: string;
  quantity: number;
  price: number;
  notes: string | null;
}

interface Order {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  orderStatus: string;
  totalAmount: number;
  readyAt: string | null;
  createdAt: string;
}

export default function ReadyOrdersView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 15000); // Refresh setiap 15 detik
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?status=ready");
      if (res.ok) {
        const data = await res.json();
        const readyOrders = (data.data || []).filter(
          (order: Order) => order.orderStatus === "ready"
        );
        setOrders(readyOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDelivery = async (orderId: string) => {
    if (!orderId) return;

    try {
      setProcessingOrder(orderId);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "delivering",
          deliveringAt: new Date().toISOString(),
        }),
      });

      const responseText = await res.text();
      let responseData;
      
      try {
        responseData = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error("Invalid server response");
      }

      if (res.ok && responseData.success) {
        // Remove from ready orders list
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        
        // Refresh after delay
        setTimeout(() => {
          fetchOrders();
        }, 500);
      } else {
        const errorMessage = responseData.error || "Failed to start delivery";
        alert(errorMessage);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Error starting delivery:", error);
      alert(error.message || "Error starting delivery");
      fetchOrders();
    } finally {
      setProcessingOrder(null);
    }
  };

  const getElapsedTime = (startTime: string): number => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff;
  };

  const getWaitingStatus = (readyAt: string) => {
    const minutes = getElapsedTime(readyAt);
    if (minutes > 10) {
      return { status: "urgent", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", label: "URGENT!" };
    } else if (minutes > 5) {
      return { status: "warning", bg: "bg-orange-50", border: "border-orange-200", badge: "bg-orange-100 text-orange-800", label: "Waiting" };
    }
    return { status: "normal", bg: "bg-white", border: "border-gray-200", badge: "bg-green-100 text-green-800", label: "Fresh" };
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const urgentCount = orders.filter(
    (o) => o.readyAt && getWaitingStatus(o.readyAt).status === "urgent"
  ).length;

  return (
    <div className="p-6 min-h-screen">
      {/* Header & Urgent Alert */}
      <div className="mb-6">
        {urgentCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                <p className="text-red-800 font-bold">Attention Needed!</p>
                <p className="text-red-600 text-sm">
                    {urgentCount} order{urgentCount > 1 ? "s have" : " has"} been
                    waiting for more than 10 minutes.
                </p>
                </div>
            </div>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by #number, table, or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </div>
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <span className="text-gray-500 font-medium">Fetching ready orders...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Package className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">No ready orders</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            Great job! All prepared orders have been delivered or there are no new orders from the kitchen.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const waitingStatus = order.readyAt
              ? getWaitingStatus(order.readyAt)
              : { status: "normal", bg: "bg-white", border: "border-gray-200", badge: "bg-green-100 text-green-800", label: "Fresh" };
            
            const waitingTime = order.readyAt
              ? getElapsedTime(order.readyAt)
              : 0;

            return (
              <div
                key={order._id}
                className={`flex flex-col rounded-xl border-2 shadow-sm overflow-hidden transition-all hover:shadow-md ${waitingStatus.bg} ${waitingStatus.border}`}
              >
                {/* Card Header */}
                <div className={`p-5 border-b ${waitingStatus.status === 'urgent' ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-white'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-2xl font-bold text-gray-900">
                                #{order.orderNumber}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">Table {order.tableNumber}</span>
                            <span>•</span>
                            <span>{order.customerName}</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${waitingStatus.badge}`}>
                        {waitingStatus.label}
                      </span>
                      {waitingStatus.status === "urgent" && (
                        <div className="flex items-center gap-1 text-xs text-red-600 font-bold animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>10+ MIN</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={waitingStatus.status === "urgent" ? "text-red-600" : ""}>
                      Waiting for {waitingTime} min
                    </span>
                  </div>
                </div>

                {/* Items List */}
                <div className="p-4 bg-white flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Order Items</p>
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                        {order.items.map((item, index) => (
                        <div
                            key={`${item._id}-${index}`}
                            className="flex items-start justify-between group"
                        >
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium text-sm flex items-start gap-2">
                                    <span className="text-gray-400 text-xs mt-0.5 min-w-[20px]">x{item.quantity}</span>
                                    {item.menuItemName}
                                </p>
                                {item.notes && (
                                    <p className="text-xs text-orange-600 mt-0.5 pl-7 italic flex items-center gap-1">
                                    <span>📝</span> {item.notes}
                                    </p>
                                )}
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleStartDelivery(order._id)}
                    disabled={processingOrder === order._id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-semibold shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    {processingOrder === order._id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5" />
                        <span>Start Delivery</span>
                        <ArrowRight className="w-4 h-4 ml-1 opacity-60" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Summary Footer */}
      {!loading && filteredOrders.length > 0 && (
        <div className="mt-8 text-center">
            <p className="text-sm text-gray-400">
                Showing <span className="font-semibold text-gray-900">{filteredOrders.length}</span> ready order{filteredOrders.length !== 1 ? "s" : ""}
            </p>
        </div>
      )}
    </div>
  );
}