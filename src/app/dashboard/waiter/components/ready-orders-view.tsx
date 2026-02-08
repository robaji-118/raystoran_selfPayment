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
  ArrowRight,
  UtensilsCrossed
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
      if (orders.length === 0) setLoading(true);
      
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

      // Hanya kirim status, backend otomatis isi timestamp deliveringAt
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "delivering",
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
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
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

  const getElapsedTime = (startTime: string | null): number => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff > 0 ? diff : 0;
  };

  const getWaitingStatus = (readyAt: string | null) => {
    const minutes = getElapsedTime(readyAt);
    if (minutes > 10) {
      return { status: "urgent", bg: "bg-red-50/50", badge: "bg-red-100 text-red-800", label: "URGENT", iconColor: "text-red-600" };
    } else if (minutes > 5) {
      return { status: "warning", bg: "bg-orange-50/30", badge: "bg-orange-100 text-orange-800", label: "Waiting", iconColor: "text-orange-600" };
    }
    return { status: "normal", bg: "hover:bg-gray-50/50", badge: "bg-green-100 text-green-800", label: "Fresh", iconColor: "text-green-600" };
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
      <div className="mb-6 flex flex-col gap-4">
        {urgentCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-pulse flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-red-800 font-bold">Attention Needed!</p>
                  <p className="text-red-600 text-sm">
                      {urgentCount} order{urgentCount > 1 ? "s have" : " has"} been waiting for more than 10 minutes.
                  </p>
                </div>
            </div>
        )}
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Ready for Pickup</h1>
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search order #, table, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-gray-500 font-medium">Fetching ready orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg">No ready orders</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
              Great job! All prepared orders have been delivered or there are no new orders from the kitchen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Wait Time</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Items</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const waitingStatus = getWaitingStatus(order.readyAt);
                  const waitingTime = getElapsedTime(order.readyAt);

                  return (
                    <tr 
                      key={order._id} 
                      className={`transition-colors ${waitingStatus.bg}`}
                    >
                      {/* Order Info */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                          <span className="text-sm text-gray-500 mt-1">{order.customerName}</span>
                          <span className={`inline-flex items-center gap-1 mt-2 text-xs font-bold px-2 py-0.5 rounded-full w-fit uppercase ${waitingStatus.badge}`}>
                             {waitingStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Table */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <UtensilsCrossed className="w-4 h-4 text-gray-400" />
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {order.tableNumber}
                          </span>
                        </div>
                      </td>

                      {/* Wait Time */}
                      <td className="p-4 align-top">
                         <div className={`flex items-center gap-1.5 font-medium text-sm ${waitingStatus.iconColor}`}>
                            <Clock className="w-4 h-4" />
                            <span>{waitingTime} min</span>
                         </div>
                      </td>

                      {/* Items */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-sm">
                              <span className="text-gray-700">
                                <span className="font-semibold text-gray-900">{item.quantity}x</span> {item.menuItemName}
                              </span>
                              {item.notes && (
                                <span className="text-xs text-orange-600 italic bg-orange-50 px-1 rounded ml-2 whitespace-nowrap">
                                  Note: {item.notes}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-4 align-top text-right">
                        <span className="font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-4 align-top text-center">
                        <button
                          onClick={() => handleStartDelivery(order._id)}
                          disabled={processingOrder === order._id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-semibold shadow-sm hover:shadow"
                        >
                          {processingOrder === order._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </>
                          ) : (
                            <>
                              <Truck className="w-4 h-4" />
                              <span>Deliver</span>
                              <ArrowRight className="w-3 h-3 ml-1 opacity-70" />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary Footer */}
      {!loading && filteredOrders.length > 0 && (
        <div className="mt-4 flex justify-end">
          <div className="bg-white rounded-lg px-4 py-2 border border-gray-200 shadow-sm text-sm">
            <span className="text-gray-500">
              Items Ready: <span className="text-gray-900 font-bold ml-1">{filteredOrders.length}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}