/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/waiter/components/my-deliveries-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  CheckCircle,
  Package,
  Search,
  MapPin,
  ShoppingBag,
  DollarSign,
  ArrowRight
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
  deliveringAt: string | null;
  createdAt: string;
}

interface MyDeliveriesViewProps {
  userId: string;
}

export default function MyDeliveriesView({ userId }: MyDeliveriesViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Refresh setiap 10 detik
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?status=delivering");
      if (res.ok) {
        const data = await res.json();
        const deliveringOrders = (data.data || []).filter(
          (order: Order) => order.orderStatus === "delivering"
        );
        setOrders(deliveringOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    if (!orderId) return;

    const confirmed = confirm(
      "Mark this order as delivered? This will complete the order."
    );
    if (!confirmed) return;

    try {
      setProcessingOrder(orderId);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "completed",
          completedAt: new Date().toISOString(),
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
        // Remove from delivering list
        setOrders((prev) => prev.filter((order) => order._id !== orderId));

        // Refresh after delay
        setTimeout(() => {
          fetchOrders();
        }, 500);
      } else {
        const errorMessage = responseData.error || "Failed to mark as delivered";
        alert(errorMessage);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Error marking delivered:", error);
      alert(error.message || "Error marking as delivered");
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

  return (
    <div className="p-6 min-h-screen bg-gray-50/50">
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
          <span className="text-gray-500 font-medium">Loading deliveries...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold text-lg">No active deliveries</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
            You don't have any active deliveries at the moment. Pick up ready orders to start.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredOrders.map((order) => {
            const deliveryTime = order.deliveringAt
              ? getElapsedTime(order.deliveringAt)
              : 0;

            return (
              <div
                key={order._id}
                className="flex flex-col rounded-xl border border-blue-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:border-blue-300"
              >
                {/* Header */}
                <div className="p-5 bg-blue-50 border-b border-blue-100">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-xl font-bold text-gray-900">
                                #{order.orderNumber}
                            </span>
                        </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="font-semibold bg-white px-2 py-0.5 rounded border border-blue-100">Table {order.tableNumber}</span>
                        <span>•</span>
                        <span>{order.customerName}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wide border border-blue-200">
                        DELIVERING
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        <span>In Transit</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-800 bg-blue-100/50 w-fit px-2 py-1 rounded-md">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Delivering for {deliveryTime} min</span>
                  </div>
                </div>

                {/* Items */}
                <div className="p-4 bg-white flex-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Items to Deliver</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {order.items.map((item, index) => (
                        <div
                            key={`${item._id}-${index}`}
                            className="flex items-start justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100"
                        >
                            <div className="flex-1">
                                <p className="text-gray-900 font-medium text-sm">
                                    {item.menuItemName}
                                </p>
                                {item.notes && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                    <span>📝</span> {item.notes}
                                    </p>
                                )}
                            </div>
                            <div className="ml-3">
                                <span className="inline-flex items-center justify-center bg-white border border-gray-200 text-gray-700 text-xs font-bold h-6 min-w-[24px] px-1 rounded">
                                    x{item.quantity}
                                </span>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-gray-50 border-t border-gray-100 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500 font-medium">Total Amount</span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </span>
                  </div>

                  <button
                    onClick={() => handleMarkDelivered(order._id)}
                    disabled={processingOrder === order._id}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all font-semibold shadow-sm hover:shadow active:scale-[0.98]"
                  >
                    {processingOrder === order._id ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        <span>Mark as Delivered</span>
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
        <div className="mt-8 bg-white rounded-xl p-4 border border-gray-200 shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Currently delivering{" "}
              <span className="text-gray-900 font-bold">
                {filteredOrders.length}
              </span>{" "}
              order{filteredOrders.length !== 1 ? "s" : ""}
            </span>
            <span className="text-gray-900 font-medium">
              Total Value: <span className="text-green-600 font-bold">{formatCurrency(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0))}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}