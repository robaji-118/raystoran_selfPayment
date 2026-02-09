/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  CheckCircle,
  Package,
  TrendingUp,
  AlertCircle,
  ChefHat,
  ArrowRight,
  Clock,
  XCircle,
  ClipboardList,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface OrderItem {
  _id: string;
  menuItemName: string;
  quantity: number;
  price: number;
  notes: string | null;
  status: string;
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
  deliveringAt: string | null;
  createdAt: string;
}

export default function DashboardMain() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats
  const stats = {
    readyOrders: orders.filter((o) => o.orderStatus === "ready").length,
    delivering: orders.filter((o) => o.orderStatus === "delivering").length,
    completed: orders.filter((o) => o.orderStatus === "completed").length,
    total: orders.length,
  };

  const getElapsedTime = (startTime: string): number => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff;
  };

  const getTimeAgo = (date: string | null): string => {
    if (!date) return "—";
    const minutes = getElapsedTime(date);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) return `${hours}h ago`;
    return `${hours}h ${mins}m ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Badge Status Helper (DIPERBARUI)
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();

    // 1. CONFIRMED (Order Baru Masuk / Belum Dimasak) - Warna Biru
    if (s === "confirmed") {
      return (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] lg:!text-fluid-xs font-medium border border-blue-200">
          New Order
        </span>
      );
    }
    // 2. READY (Siap Saji) - Warna Hijau
    else if (s === "ready") {
      return (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-[10px] lg:!text-fluid-xs font-medium border border-green-200 animate-pulse">
          Ready
        </span>
      );
    }
    // 3. DELIVERING (Sedang Diantar) - Warna Indigo (Biar beda sama Confirmed)
    else if (s === "delivering") {
      return (
        <span className="px-2 py-1 rounded-full bg-indigo-100 text-indigo-800 text-[10px] lg:!text-fluid-xs font-medium border border-indigo-200">
          Delivering
        </span>
      );
    }
    // 4. COMPLETED / SERVED (Selesai) - Warna Abu
    else if (s === "completed" || s === "served") {
      return (
        <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-[10px] lg:!text-fluid-xs font-medium border border-gray-200">
          Served
        </span>
      );
    }
    // 5. CANCELLED (Batal) - Warna Merah
    else if (s === "cancelled") {
      return (
        <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 text-[10px] lg:!text-fluid-xs font-medium border border-red-200">
          Cancelled
        </span>
      );
    }
    // 6. PREPARING (Sedang Dimasak) - Default Orange
    else {
      return (
        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-[10px] lg:!text-fluid-xs font-medium border border-orange-200">
          Cooking
        </span>
      );
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-12 h-12 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-sm lg:!text-fluid-base">Loading waiter dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Stats Cards - Styling identical to Kitchen */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-fluid-4 mb-4 lg:mb-fluid-6">
        {/* Ready Orders Card */}
        <div
          onClick={() => router.push("/dashboard/waiter?view=deliveries-ready")}
          className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-3 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-xs lg:!text-fluid-base">
                Ready Orders
              </p>
              <h4 className="font-bold text-gray-900 text-xl lg:!text-fluid-2xl">
                {stats.readyOrders}
              </h4>
            </div>
            <div className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 bg-green-50 rounded-lg lg:rounded-[0.556vw] flex items-center justify-center relative">
              <ChefHat className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-green-600" />
              {stats.readyOrders > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 lg:gap-fluid-2">
            <span className="text-gray-400 text-xs lg:!text-fluid-sm">Action needed</span>
          </div>
        </div>

        {/* Delivering Card */}
        <div
          onClick={() =>
            router.push("/dashboard/waiter?view=deliveries-active")
          }
          className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-3 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-xs lg:!text-fluid-base">
                Delivering
              </p>
              <h4 className="font-bold text-gray-900 text-xl lg:!text-fluid-2xl">
                {stats.delivering}
              </h4>
            </div>
            <div className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 bg-blue-50 rounded-lg lg:rounded-[0.556vw] flex items-center justify-center">
              <Truck className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 lg:gap-fluid-2">
            <span className="text-gray-400 text-xs lg:!text-fluid-sm">In progress</span>
          </div>
        </div>

        {/* Completed Card */}
        <div
          onClick={() =>
            router.push("/dashboard/waiter?view=deliveries-completed")
          }
          className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-3 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-xs lg:!text-fluid-base">
                Completed
              </p>
              <h4 className="font-bold text-gray-900 text-xl lg:!text-fluid-2xl">
                {stats.completed}
              </h4>
            </div>
            <div className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 bg-purple-50 rounded-lg lg:rounded-[0.556vw] flex items-center justify-center">
              <CheckCircle className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 lg:gap-fluid-2">
            <span className="text-gray-400 text-xs lg:!text-fluid-sm">Served today</span>
          </div>
        </div>

        {/* Total Active Card */}
        <div
          className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-3 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-xs lg:!text-fluid-base">
                Total Orders
              </p>
              <h4 className="font-bold text-gray-900 text-xl lg:!text-fluid-2xl">
                {stats.total}
              </h4>
            </div>
            <div className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 bg-orange-50 rounded-lg lg:rounded-[0.556vw] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 lg:gap-fluid-2">
            <span className="text-gray-400 text-xs lg:!text-fluid-sm">All activity</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-fluid-4">
        <div className="lg:col-span-1 space-y-3 lg:space-y-fluid-4">
          <div className="bg-white rounded-xl lg:rounded-[1.389vw] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-h-[450px] lg:max-h-[33.333vw]">
            {/* Header */}
            <div className="p-4 lg:p-fluid-6 border-b border-gray-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-fluid-3">
                <div className="relative">
                  <AlertCircle className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-gray-600" />
                  {stats.readyOrders > 0 && (
                    <>
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-base lg:!text-fluid-lg">
                  Ready to Serve
                </h3>
              </div>
              <div className="flex items-center gap-2">
                {loading && (
                  <RefreshCw className="w-3 h-3 text-gray-400 animate-spin" />
                )}
              </div>
            </div>

            {/* List Content - Background sedikit abu agar card putih terlihat jelas */}
            <div className="p-3 lg:p-fluid-4 overflow-y-auto flex-1 custom-scrollbar bg-gray-50/50">
              {orders.filter((o) => o.orderStatus === "ready").length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center h-full">
                  <div className="w-12 h-12 lg:w-fluid-16 lg:h-fluid-16 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-3 shadow-sm">
                    <CheckCircle className="w-6 h-6 lg:w-fluid-8 lg:h-fluid-8 text-gray-300" />
                  </div>
                  <p className="text-gray-900 font-medium text-sm lg:!text-fluid-base">All caught up!</p>
                  <p className="text-gray-500 text-xs lg:!text-fluid-sm">
                    Waiting for kitchen...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders
                    .filter((o) => o.orderStatus === "ready")
                    .map((order) => (
                      // START: Clean Card Design (Putih & Border Abu)
                      <div
                        key={order._id}
                        onClick={() =>
                          router.push("/dashboard/waiter?view=deliveries-ready")
                        }
                        className="group bg-white p-3 lg:p-fluid-4 rounded-lg lg:rounded-[0.833vw] border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all cursor-pointer"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 lg:gap-fluid-4">
                            {/* Order Info */}
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-bold text-gray-900 text-xs lg:!text-fluid-sm">
                                  #{order.orderNumber}
                                </span>

                                {/* BADGE HIJAU (Hanya disini warna hijaunya) */}
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] lg:!text-fluid-xs font-bold rounded-full border border-green-200 flex items-center gap-1">
                                  READY
                                </span>
                              </div>

                              <div className="text-[10px] lg:!text-fluid-xs text-gray-500 flex items-center gap-1">
                                <span>{order.items.length} Items</span>
                                <span className="text-gray-300">•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />{" "}
                                  {getTimeAgo(order.readyAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Arrow Icon (Netral) */}
                          <ArrowRight className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-gray-300 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                      // END: Clean Card Design
                    ))}

                  {orders.filter((o) => o.orderStatus === "ready").length >
                    4 && (
                      <button
                        onClick={() =>
                          router.push("/dashboard/waiter?view=deliveries-ready")
                        }
                        className="w-full py-2.5 lg:py-fluid-3 text-center text-xs lg:!text-fluid-sm text-gray-500 font-medium hover:text-gray-800 bg-white border border-gray-200 rounded-lg lg:rounded-[0.556vw] hover:bg-gray-50 transition-colors shadow-sm"
                      >
                        View All Ready Orders
                      </button>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity Table */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl lg:rounded-[1.389vw] shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 lg:p-fluid-6 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2 lg:gap-fluid-3">
                <Package className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-gray-400" />
                <h3 className="font-bold text-gray-900 text-base lg:!text-fluid-lg">
                  Recent Orders
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex items-center justify-center p-8 lg:p-fluid-12">
                  <div className="w-6 h-6 lg:w-fluid-8 lg:h-fluid-8 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="p-8 lg:p-fluid-12 text-center">
                  <p className="text-gray-500 text-sm lg:!text-fluid-base">
                    No orders found
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-xs lg:!text-fluid-sm">
                        Order
                      </th>
                      <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-xs lg:!text-fluid-sm">
                        Table
                      </th>
                      <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-xs lg:!text-fluid-sm">
                        Status
                      </th>
                      <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-xs lg:!text-fluid-sm">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 6).map((order) => (
                      <tr
                        key={order._id}
                        className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                      >
                        <td className="p-3 lg:p-fluid-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-900 text-xs lg:!text-fluid-sm">
                              #{order.orderNumber}
                            </span>
                            <span className="text-gray-500 text-[10px] lg:!text-fluid-xs">
                              {order.customerName}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span className="text-gray-900 font-medium text-xs lg:!text-fluid-sm">
                            Table {order.tableNumber}
                          </span>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          {getStatusBadge(order.orderStatus)}
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span className="font-medium text-gray-900 text-xs lg:!text-fluid-sm">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
