/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/waiter/components/my-deliveries-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  Search,
  MapPin,
  ShoppingBag,
  ArrowRight,
  Package
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
      if (orders.length === 0) setLoading(true);
      
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

      // Kita hanya kirim status "completed", backend yang isi tanggalnya
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "completed",
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

  const getElapsedTime = (startTime: string | null): number => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff > 0 ? diff : 0;
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
      {/* Search Header */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">My Deliveries</h1>
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

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <span className="text-gray-500 font-medium">Loading deliveries...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-gray-900 font-bold text-lg">No active deliveries</h3>
            <p className="text-gray-500 text-sm mt-1 max-w-xs mx-auto">
              You don&apos;t have any active deliveries at the moment.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order Info</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Table</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-1/3">Items</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Total</th>
                  <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const deliveryTime = getElapsedTime(order.deliveringAt);
                  
                  return (
                    <tr key={order._id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Order Info */}
                      <td className="p-4 align-top">
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-900">#{order.orderNumber}</span>
                          <span className="text-sm text-gray-500 mt-1">{order.customerName}</span>
                          <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                            <Package className="w-3 h-3" /> Delivering
                          </span>
                        </div>
                      </td>

                      {/* Table */}
                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                          <MapPin className="w-4 h-4 text-blue-500" />
                          <span className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {order.tableNumber}
                          </span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td className="p-4 align-top">
                         <div className="flex items-center gap-1.5 text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded-md w-fit text-sm">
                            <Clock className="w-4 h-4" />
                            <span>{deliveryTime} min</span>
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
                          onClick={() => handleMarkDelivered(order._id)}
                          disabled={processingOrder === order._id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-semibold shadow-sm"
                        >
                          {processingOrder === order._id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              <span>Complete</span>
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
              Total Delivering Value: <span className="text-green-600 font-bold ml-1">{formatCurrency(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0))}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}