/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import {
  Truck,
  Clock,
  CheckCircle,
  Package,
  TrendingUp,
  AlertCircle,
  ChefHat,
  Table2,
  ArrowRight,
  UtensilsCrossed,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

  // Helper untuk format currency (sama seperti Kitchen)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen p-6">
      {/* Stats Cards - STYLING DISAMAKAN DENGAN KITCHEN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Ready Orders Card */}
        <div 
          onClick={() => router.push("/dashboard/waiter?view=deliveries-ready")}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 mb-1 text-base font-medium">Ready Orders</p>
              <h4 className="font-bold text-gray-900 text-3xl">{stats.readyOrders}</h4>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center group-hover:bg-green-100 transition-colors relative">
              <ChefHat className="w-6 h-6 text-green-600" />
              {stats.readyOrders > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-600 text-sm font-medium">Action Needed</span>
            <span className="text-gray-400 text-sm">• Ready to deliver</span>
          </div>
        </div>

        {/* Delivering Card */}
        <div 
          onClick={() => router.push("/dashboard/waiter?view=deliveries-active")}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 mb-1 text-base font-medium">Delivering</p>
              <h4 className="font-bold text-gray-900 text-3xl">{stats.delivering}</h4>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <Truck className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 text-sm font-medium">In Progress</span>
            <span className="text-gray-400 text-sm">• On the way</span>
          </div>
        </div>

        {/* Completed Card */}
        <div 
          onClick={() => router.push("/dashboard/waiter?view=deliveries-completed")}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 mb-1 text-base font-medium">Completed</p>
              <h4 className="font-bold text-gray-900 text-3xl">{stats.completed}</h4>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <CheckCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-600 text-sm font-medium">Done</span>
            <span className="text-gray-400 text-sm">• Served today</span>
          </div>
        </div>

        {/* Total Active Card */}
        <div 
          onClick={() => router.push("/dashboard/waiter?view=tables")}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-gray-500 mb-1 text-base font-medium">All Orders</p>
              <h4 className="font-bold text-gray-900 text-3xl">{stats.total}</h4>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
              <Table2 className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-orange-600 text-sm font-medium">Active</span>
            <span className="text-gray-400 text-sm">• Total activity</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        
        {/* Urgent Deliveries Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Ready to Serve</h3>
                <p className="text-sm text-gray-500">Orders waiting for pickup</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1">
            {orders.filter((o) => o.orderStatus === "ready").slice(0, 3).length > 0 ? (
              <div className="space-y-3">
                {orders
                  .filter((o) => o.orderStatus === "ready")
                  .slice(0, 3)
                  .map((order) => (
                    <div
                      key={order._id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-lg">
                          {order.tableNumber}
                        </div>
                        <div>
                          <p className="text-gray-900 font-bold text-lg">#{order.orderNumber}</p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <UtensilsCrossed className="w-3 h-3" /> {order.items.length} Items
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-100 text-green-800 text-xs font-bold mb-1">
                          READY
                        </span>
                        {order.readyAt && (
                          <p className="text-xs text-gray-500 font-medium">
                             {getElapsedTime(order.readyAt)} min ago
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                
                {orders.filter((o) => o.orderStatus === "ready").length > 3 && (
                  <button
                    onClick={() => router.push("/dashboard/waiter?view=deliveries-ready")}
                    className="w-full mt-2 py-3 flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg font-medium transition-colors border border-gray-200"
                  >
                    View all {orders.filter((o) => o.orderStatus === "ready").length} ready orders <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle className="w-8 h-8 text-gray-300" />
                </div>
                <h4 className="text-gray-900 font-medium">All caught up!</h4>
                <p className="text-gray-500 text-sm mt-1">No orders waiting to be served.</p>
              </div>
            )}
          </div>
        </div>

        {/* Today's Activity Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Today's Activity</h3>
                <p className="text-sm text-gray-500">Delivery statistics overview</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 flex-1 flex flex-col justify-center space-y-4">
             {/* Completed Stat Row */}
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-gray-700 font-medium">Completed Deliveries</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{stats.completed}</span>
            </div>
            
            {/* In Progress Stat Row */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-gray-700 font-medium">Currently Delivering</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{stats.delivering}</span>
            </div>
            
            {/* Pending Stat Row */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-gray-700 font-medium">Pending / Cooking</span>
              </div>
              <span className="text-xl font-bold text-gray-900">{stats.total - stats.completed - stats.delivering - stats.readyOrders}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders Table - STYLING SAMA SEPERTI KITCHEN TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-gray-600" />
              </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500">Latest updates from the kitchen</p>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No orders found</p>
              <p className="text-gray-400 text-sm mt-1">Waiting for new orders...</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Order Details</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Table</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Status</th>
                  <th className="text-left p-4 text-gray-600 font-medium text-sm">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="text-gray-900 font-medium text-sm">#{order.orderNumber}</p>
                          <p className="text-xs text-gray-500">{order.customerName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-md text-sm">
                        Table {order.tableNumber}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        order.orderStatus === "ready" ? "bg-green-100 text-green-800" :
                        order.orderStatus === "delivering" ? "bg-blue-100 text-blue-800" :
                        order.orderStatus === "completed" ? "bg-purple-100 text-purple-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.orderStatus === "ready" ? "READY TO SERVE" : order.orderStatus.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 font-medium text-sm">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}