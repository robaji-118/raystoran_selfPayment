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



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-12 h-12 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-sm lg:!text-fluid-base">Fetching ready orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-fluid-4">
      {/* Header & Urgent Alert */}
      <div className="mb-4 lg:mb-fluid-6 flex flex-col gap-3 lg:gap-fluid-4">
        {urgentCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-xl lg:rounded-[1.389vw] p-3 lg:p-fluid-4 animate-pulse flex items-center gap-2 lg:gap-fluid-3">
            <div className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 bg-red-100 rounded-lg lg:rounded-[0.556vw] flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-red-600" />
            </div>
            <div>
              <p className="text-red-800 font-bold text-sm lg:!text-fluid-base">Attention Needed!</p>
              <p className="text-red-600 text-xs lg:!text-fluid-sm">
                {urgentCount} order{urgentCount > 1 ? "s have" : " has"} been waiting for more than 10 minutes.
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 lg:gap-fluid-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search order #, table, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 lg:pl-fluid-10 pr-4 lg:pr-fluid-4 py-2 lg:py-fluid-2.5 bg-white border border-gray-200 rounded-lg lg:rounded-[0.556vw] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-sm lg:!text-fluid-sm"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl lg:rounded-[1.389vw] shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 lg:py-fluid-20">
            <div className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3 lg:mb-fluid-4" />
            <span className="text-gray-500 font-medium text-sm lg:!text-fluid-base">Fetching ready orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 lg:py-fluid-20 text-center px-4">
            <div className="w-16 h-16 lg:w-fluid-20 lg:h-fluid-20 bg-gray-50 rounded-full flex items-center justify-center mb-3 lg:mb-fluid-4">
              <Package className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold text-base lg:!text-fluid-lg">No ready orders</h3>
            <p className="text-gray-500 text-xs lg:!text-fluid-sm mt-1 lg:mt-fluid-1 max-w-xs mx-auto">
              Great job! All prepared orders have been delivered or there are no new orders from the kitchen.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-3 lg:p-fluid-4 text-[10px] lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</th>
                  <th className="p-3 lg:p-fluid-4 text-[10px] lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="p-3 lg:p-fluid-4 text-[10px] lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">Wait Time</th>
                  <th className="p-3 lg:p-fluid-4 text-[10px] lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3 hidden md:table-cell">Items</th>
                  <th className="p-3 lg:p-fluid-4 text-[10px] lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider text-right hidden sm:table-cell">Total</th>
                  <th className="p-3 lg:p-fluid-4 text-[10px] lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
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
                      <td className="p-3 lg:p-fluid-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900 text-xs lg:!text-fluid-sm">#{order.orderNumber}</span>
                          <span className="text-[10px] lg:!text-fluid-xs text-gray-500 mt-1">{order.customerName}</span>
                          <span className={`inline-flex items-center gap-1 mt-2 text-[10px] lg:!text-fluid-xs font-bold px-2 py-0.5 rounded-full w-fit uppercase ${waitingStatus.badge}`}>
                            {waitingStatus.label}
                          </span>
                        </div>
                      </td>

                      {/* Table */}
                      <td className="p-3 lg:p-fluid-4 align-top">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <span className="bg-gray-100 px-2 py-1 rounded text-xs lg:!text-fluid-sm">
                            {order.tableNumber}
                          </span>
                        </div>
                      </td>

                      {/* Wait Time */}
                      <td className="p-3 lg:p-fluid-4 align-top">
                        <div className={`flex items-center gap-1.5 font-medium text-xs lg:!text-fluid-sm ${waitingStatus.iconColor}`}>
                          <Clock className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4" />
                          <span>{waitingTime} min</span>
                        </div>
                      </td>

                      {/* Items */}
                      <td className="p-3 lg:p-fluid-4 align-top hidden md:table-cell">
                        <div className="flex flex-col gap-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start text-xs lg:!text-fluid-sm">
                              <span className="text-gray-700">
                                <span className="font-semibold text-gray-900">{item.quantity}x</span> {item.menuItemName}
                              </span>
                              {item.notes && (
                                <span className="text-[10px] lg:!text-fluid-xs text-orange-600 italic bg-orange-50 px-1 rounded ml-2 whitespace-nowrap">
                                  Note: {item.notes}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="p-3 lg:p-fluid-4 align-top text-right hidden sm:table-cell">
                        <span className="font-bold text-gray-900 text-xs lg:!text-fluid-sm">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="p-3 lg:p-fluid-4 align-top text-center">
                        <button
                          onClick={() => handleStartDelivery(order._id)}
                          disabled={processingOrder === order._id}
                          className="inline-flex items-center gap-1 lg:gap-fluid-2 px-2 lg:px-fluid-3 py-1.5 lg:py-fluid-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg lg:rounded-[0.556vw] transition-colors text-xs lg:!text-fluid-sm font-semibold shadow-sm hover:shadow"
                        >
                          {processingOrder === order._id ? (
                            <>
                              <div className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </>
                          ) : (
                            <>
                              <Truck className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4" />
                              <span className="hidden sm:inline">Deliver</span>
                              <ArrowRight className="w-2.5 h-2.5 lg:w-fluid-3 lg:h-fluid-3 ml-0.5 opacity-70" />
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
    </div>
  );
}