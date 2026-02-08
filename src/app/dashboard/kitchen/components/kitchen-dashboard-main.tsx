/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/kitchen/components/kitchen-dashboard-main.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import {
  ChefHat,
  Clock,
  CheckCircle,
  AlertCircle,
  Flame,
  Package,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Bell,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  FileDown,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";

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
  orderStatus:
    | "confirmed"
    | "preparing"
    | "ready"
    | "delivering"
    | "completed"
    | "cancelled";
  totalAmount: number;
  confirmedAt: string;
  cookingStartedAt: string | null;
  readyAt: string | null;
  createdAt: string;
}

export default function KitchenDashboardMain() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "confirmed" | "preparing" | "ready"
  >("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const previousOrderCountRef = useRef(0);

  // Helper function untuk display status
  const getStatusDisplay = (status: string): string => {
    switch (status) {
      case "confirmed":
        return "NEW ORDER";
      case "preparing":
        return "COOKING";
      case "ready":
        return "READY";
      case "delivering":
        return "DELIVERING";
      case "completed":
        return "COMPLETED";
      case "cancelled":
        return "CANCELLED";
      default:
        return status.toUpperCase();
    }
  };

  // Helper function untuk get elapsed time
  const getElapsedTime = (startTime: string): number => {
    if (!startTime) return 0;
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff;
  };

  // Helper function untuk get time status
  const getTimeStatus = (order: Order) => {
    const elapsedMinutes = order.cookingStartedAt
      ? getElapsedTime(order.cookingStartedAt)
      : getElapsedTime(order.confirmedAt);

    // Calculate expected time based on items (15 min per item)
    const totalPrepTime = order.items.reduce(
      (sum, item) => sum + item.quantity * 15,
      0
    );
    // Safety check div by zero
    const itemCount = order.items.length || 1;
    const avgPrepTime = totalPrepTime / itemCount;

    if (elapsedMinutes > avgPrepTime * 1.5) {
      return { status: "urgent", color: "red", minutes: elapsedMinutes };
    } else if (elapsedMinutes > avgPrepTime) {
      return { status: "warning", color: "yellow", minutes: elapsedMinutes };
    }
    return { status: "normal", color: "green", minutes: elapsedMinutes };
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); // Refresh setiap 30 detik
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Play sound when new order arrives
    const newOrderCount = orders.filter(
      (o) => o.orderStatus === "confirmed"
    ).length;
    if (
      soundEnabled &&
      newOrderCount > previousOrderCountRef.current &&
      newOrderCount > 0
    ) {
      playNotificationSound();
    }
    previousOrderCountRef.current = newOrderCount;
  }, [orders, soundEnabled]);

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.5
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const fetchOrders = async () => {
    try {
        // Jangan set loading true saat interval agar tidak kedip-kedip
      if (orders.length === 0) setLoading(true);
      
      const res = await fetch("/api/orders");
      if (res.ok) {
        const data = await res.json();
        
        // Filter hanya orders yang relevant untuk kitchen
        const kitchenOrders = data.data.filter((order: Order) =>
          ["confirmed", "preparing", "ready"].includes(order.orderStatus)
        );

        setOrders(kitchenOrders);
      } else {
        console.error("Failed to fetch orders:", await res.text());
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGIC FIX 1: Start Cooking tanpa kirim tanggal (biar backend yang handle) ---
  const handleStartCooking = async (orderId: string) => {
    if (!orderId) return;

    try {
      setProcessingOrder(orderId);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderStatus: "preparing",
          // HAPUS: cookingStartedAt (Biarkan backend yang isi)
        }),
      });

      // Parse response dengan aman
      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Invalid JSON:", responseText);
        throw new Error("Server error: Invalid response");
      }

      if (res.ok && responseData.success) {
        // Optimistic update UI
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: "preparing",
                  cookingStartedAt: new Date().toISOString(), // Visual only
                }
              : order
          )
        );

        // Refresh from server after delay
        setTimeout(() => {
          fetchOrders();
        }, 500);
      } else {
        const errorMessage = responseData.error || "Unknown error";
        alert(`Failed to start cooking: ${errorMessage}`);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Error starting cooking:", error);
      alert("Error starting cooking. Please try again.");
      fetchOrders();
    } finally {
      setProcessingOrder(null);
    }
  };

  // --- LOGIC FIX 2: Mark Ready tanpa kirim tanggal ---
  const handleMarkReady = async (orderId: string) => {
    if (!orderId) return;

    try {
      setProcessingOrder(orderId);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderStatus: "ready",
          // HAPUS: readyAt (Biarkan backend yang isi)
        }),
      });

      const responseText = await res.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        console.error("Invalid JSON:", responseText);
        throw new Error("Server error");
      }

      if (res.ok && responseData.success) {
        // Optimistic update UI
        setOrders((prev) =>
          prev.map((order) =>
            order._id === orderId
              ? {
                  ...order,
                  orderStatus: "ready",
                  readyAt: new Date().toISOString(), // Visual only
                }
              : order
          )
        );

        if (soundEnabled) {
          playNotificationSound();
        }

        setTimeout(() => {
          fetchOrders();
        }, 500);
      } else {
        const errorMessage = responseData.error || "Unknown error";
        alert(`Failed to mark as ready: ${errorMessage}`);
        fetchOrders();
      }
    } catch (error: any) {
      console.error("Error marking ready:", error);
      alert("Error marking order as ready.");
      fetchOrders();
    } finally {
      setProcessingOrder(null);
    }
  };

  // Filter orders berdasarkan status dan search term
  const filteredOrders = orders
    .filter((order) => {
      if (filter === "all") return true;
      if (filter === "confirmed") return order.orderStatus === "confirmed";
      if (filter === "preparing") return order.orderStatus === "preparing";
      if (filter === "ready") return order.orderStatus === "ready";
      return true;
    })
    .filter(
      (order) =>
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // Sort by time (oldest first)
      const aTime = a.cookingStartedAt || a.confirmedAt;
      const bTime = b.cookingStartedAt || b.confirmedAt;
      return new Date(aTime).getTime() - new Date(bTime).getTime();
    });

  // Calculate statistics
  const stats = {
    newOrders: orders.filter((o) => o.orderStatus === "confirmed").length,
    cooking: orders.filter((o) => o.orderStatus === "preparing").length,
    ready: orders.filter((o) => o.orderStatus === "ready").length,
    total: orders.length,
  };

  const urgentOrders = orders.filter(
    (o) => o.orderStatus === "preparing" && getTimeStatus(o).status === "urgent"
  ).length;

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === filteredOrders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredOrders.map((_, index) => index));
    }
  };

  // Toggle select item
  const toggleSelectItem = (index: number) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });
  };

  // Get status color (unused in display but kept for consistency)
  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "confirmed":
        return "bg-blue-100 text-blue-800";
      case "preparing":
        return "bg-orange-100 text-orange-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivering":
        return "bg-indigo-100 text-indigo-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get time status badge
  const getTimeStatusBadge = (order: Order) => {
    const timeStatus = getTimeStatus(order);
    const elapsedMinutes = order.cookingStartedAt
      ? getElapsedTime(order.cookingStartedAt)
      : getElapsedTime(order.confirmedAt);

    if (order.orderStatus === "preparing" && timeStatus.status === "urgent") {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
          <AlertTriangle className="w-3 h-3" />
          {elapsedMinutes} min
        </span>
      );
    } else if (order.orderStatus === "preparing") {
      return (
        <span className="px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
          {elapsedMinutes} min
        </span>
      );
    } else if (order.orderStatus === "ready") {
      return (
        <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
          Ready
        </span>
      );
    } else {
      return (
        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-medium">
          New
        </span>
      );
    }
  };

  return (
    <div className="min-h-screen">
      {/* Alert for urgent orders */}
      {urgentOrders > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <div>
              <p className="text-red-800 font-medium">Urgent Orders!</p>
              <p className="text-red-600 text-sm">
                {urgentOrders} order{urgentOrders > 1 ? "s are" : " is"} taking
                longer than expected
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-4 mb-fluid-6">
        <div className="bg-white rounded-2xl p-fluid-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                New Orders
              </p>
              <h4 className="font-bold text-gray-900 text-fluid-2xl">
                {stats.newOrders}
              </h4>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-fluid-2">
            <span className="text-gray-400 text-fluid-sm">Ready to cook</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-fluid-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                Cooking
              </p>
              <h4 className="font-bold text-gray-900 text-fluid-2xl">
                {stats.cooking}
              </h4>
            </div>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <Flame className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-fluid-2">
            <span className="text-gray-400 text-fluid-sm">In progress</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-fluid-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-fluid-4">
            <div> 
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">Ready</p>
              <h4 className="font-bold text-gray-900 text-fluid-2xl">
                {stats.ready}
              </h4>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div className="flex items-center gap-fluid-2">
            <span className="text-gray-400 text-fluid-sm">For pickup</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-fluid-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                Total Active
              </p>
              <h4 className="font-bold text-gray-900 text-fluid-2xl">
                {stats.total}
              </h4>
            </div>
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-fluid-2">
            <span className="text-gray-400 text-fluid-sm">All orders</span>
          </div>
        </div>
      </div>

      {/* Kitchen Orders Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
        {/* Header dengan Filter dan Search */}
        <div className="p-fluid-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by order number, table, or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5  rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-fluid-sm"
                />
              </div>
            </div>

            <div className="flex items-center gap-fluid-3 flex-wrap">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-fluid-sm cursor-pointer ${
                    filter === "all"
                      ? "bg-black text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  All ({stats.total})
                </button>
                <button
                  onClick={() => setFilter("confirmed")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-fluid-sm cursor-pointer ${
                    filter === "confirmed"
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  New ({stats.newOrders})
                </button>
                <button
                  onClick={() => setFilter("preparing")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-fluid-sm cursor-pointer ${
                    filter === "preparing"
                      ? "bg-orange-600 text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  Cooking ({stats.cooking})
                </button>
                <button
                  onClick={() => setFilter("ready")}
                  className={`px-3 py-2 rounded-lg font-medium transition-colors text-fluid-sm cursor-pointer ${
                    filter === "ready"
                      ? "bg-green-600 text-white"
                      : "bg-white border border-gray-300"
                  }`}
                >
                  Ready ({stats.ready})
                </button>
              </div>

              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="text-fluid-sm">Refresh</span>
              </button>

              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-fluid-sm cursor-pointer ${
                  soundEnabled
                    ? "bg-black text-white border border-gray-200"
                    : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200"
                }`}
              >
                <Bell className="w-4 h-4" />
                <span className="text-fluid-sm">
                  {soundEnabled ? "Sound On" : "Sound Off"}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center p-12">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-2">
                {filter === "all"
                  ? "No active orders at the moment"
                  : `No ${filter} orders found`}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Order Details
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Table
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Time
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Status
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Items
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Amount
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const timeStatus = getTimeStatus(order);
                  const isUrgent =
                    order.orderStatus === "preparing" &&
                    timeStatus.status === "urgent";

                  return (
                    <tr
                      key={order._id}
                      className={`border-b border-gray-50 transition-colors ${
                        isUrgent ? "bg-red-50/50 hover:bg-red-50" : ""
                      }`}
                    >
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-3">
                          <div>
                            <span className="font-medium text-gray-900 block text-fluid-sm">
                              #{order.orderNumber}
                            </span>
                            <span className="text-gray-500 text-fluid-xs">
                              {order.customerName}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-900 font-medium text-fluid-sm">
                          Table {order.tableNumber}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">
                          {formatDate(order.confirmedAt)}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex flex-col !text-center gap-1 ">
                          {getTimeStatusBadge(order)}
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <div className="max-w-xs">
                          <div className="text-gray-900 text-fluid-sm">
                            {order.items.length} item
                            {order.items.length > 1 ? "s" : ""}
                          </div>
                          <div className="text-gray-500 text-fluid-xs truncate">
                            {order.items
                              .map((item) => `${item.menuItemName} ×${item.quantity}`)
                              .join(", ")}
                          </div>
                          {order.items.some((item) => item.notes) && (
                            <div className="text-yellow-600 text-fluid-xs mt-1">
                              📝 Special notes
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="font-medium text-gray-900 text-fluid-sm">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-2">
                          {order.orderStatus === "confirmed" && (
                            <button
                              onClick={() => handleStartCooking(order._id)}
                              disabled={processingOrder === order._id}
                              className="flex items-center gap-2 px-3 py-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-fluid-sm"
                            >
                              {processingOrder === order._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /></>
                              ) : (
                                <>
                                  <Flame className="w-4 h-4" />
                                  Start
                                </>
                              )}
                            </button>
                          )}

                          {order.orderStatus === "preparing" && (
                            <button
                              onClick={() => handleMarkReady(order._id)}
                              disabled={processingOrder === order._id}
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-fluid-sm"
                            >
                              {processingOrder === order._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-4 h-4" />
                                  Ready
                                </>
                              )}
                            </button>
                          )}

                          {order.orderStatus === "ready" && (
                            <div className="p-2 bg-green-100 text-green-800 rounded-full text-fluid-xs font-medium">
                              Awaiting Pickup
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}