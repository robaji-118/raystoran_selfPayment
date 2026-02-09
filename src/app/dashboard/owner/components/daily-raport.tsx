/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import {
  ShoppingCart,
  TrendingUp,
  FileDown,
  CalendarIcon,
  XCircle
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: number;
  items: Array<{ quantity: number }>;
  orderStatus: 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
}

export default function DailyReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    cancelledOrders: 0
  });

  useEffect(() => {
    fetchDailyOrders();
  }, [selectedDate]);

  const fetchDailyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        const dateString = selectedDate.toISOString().split('T')[0];
        const filtered = data.data.filter((order: any) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === dateString;
        });

        setOrders(filtered);
        calculateStats(filtered);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: any[]) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalItems = orderList.reduce((sum, order) =>
      sum + (order.items?.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0) || 0), 0
    );
    const completedOrders = orderList.filter((o) => o.orderStatus === 'completed').length;
    const cancelledOrders = orderList.filter((o) => o.orderStatus === 'cancelled').length;

    setStats({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      cancelledOrders
    });
  };

  // --- Helpers ---
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  // Fungsi Export Sederhana (CSV)
  const handleExport = () => {
    if (orders.length === 0) return alert("No data to export");

    const headers = ["Order No", "Time", "Customer", "Table", "Items", "Status", "Total"];
    const rows = orders.map(o => [
      o.orderNumber,
      formatTime(o.createdAt),
      `"${o.customerName}"`,
      o.tableNumber,
      o.items.length,
      o.orderStatus,
      o.totalAmount
    ]);

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daily_report_${selectedDate.toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-base lg:!text-fluid-base">Loading daily report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-fluid-6">

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-fluid-4 mb-6 lg:mb-fluid-6">

        {/* Card 1: Total Orders */}
        <div className="bg-white p-6 lg:p-fluid-6 shadow-sm border border-gray-100 rounded-2xl lg:rounded-[1.111vw]">
          <div className="flex items-start justify-between mb-4 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-base lg:!text-fluid-base">Total Orders</p>
              <h4 className="font-bold text-gray-900 text-2xl lg:!text-fluid-2xl">
                {stats.totalOrders}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-4 lg:gap-fluid-4">
            <div className="flex items-center text-green-600 text-sm lg:!text-fluid-sm bg-green-50 px-2 lg:px-fluid-2 py-1 lg:py-fluid-1 rounded-md lg:rounded-[0.417vw] border border-green-100">
              <TrendingUp className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 mr-1 lg:mr-fluid-1" />
              <span className="font-medium">{stats.completedOrders} Finished</span>
            </div>
            <div className="flex items-center text-red-600 text-sm lg:!text-fluid-sm bg-red-50 px-2 lg:px-fluid-2 py-1 lg:py-fluid-1 rounded-md lg:rounded-[0.417vw] border border-red-100">
              <XCircle className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 mr-1 lg:mr-fluid-1" />
              <span className="font-medium">{stats.cancelledOrders} Cancelled</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white p-6 lg:p-fluid-6 shadow-sm border border-gray-100 rounded-2xl lg:rounded-[1.111vw]">
          <div className="flex items-start justify-between mb-4 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-base lg:!text-fluid-base">Total Revenue</p>
              <h4 className="font-bold text-gray-900 text-2xl lg:!text-fluid-2xl">
                {formatCurrency(stats.totalRevenue)}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-fluid-2">
            <span className="text-gray-400 text-sm lg:!text-fluid-sm">
              Avg Order: <span className="font-medium text-gray-700">{formatCurrency(stats.avgOrderValue)}</span>
            </span>
          </div>
        </div>

        {/* Card 3: Total Items */}
        <div className="bg-white p-6 lg:p-fluid-6 shadow-sm border border-gray-100 rounded-2xl lg:rounded-[1.111vw]">
          <div className="flex items-start justify-between mb-4 lg:mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-base lg:!text-fluid-base">Items Sold</p>
              <h4 className="font-bold text-gray-900 text-2xl lg:!text-fluid-2xl">
                {stats.totalItems}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-fluid-2">
            <span className="text-gray-400 text-sm lg:!text-fluid-sm">Total quantity of items sold today</span>
          </div>
        </div>
      </div>

      {/* Orders Table Section */}
      <div className="bg-white shadow-sm border border-gray-100 rounded-2xl lg:rounded-[1.111vw]">

        {/* Table Header & Controls */}
        <div className="p-6 lg:p-fluid-6 border-b border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 lg:gap-fluid-4">
            <div>
              <h4 className="text-gray-900 font-bold text-lg lg:!text-fluid-lg">Daily Transactions</h4>
              <p className="text-gray-500 text-sm lg:!text-fluid-sm mt-1 lg:mt-fluid-1">Detailed list of orders for selected date</p>
            </div>

            <div className="flex items-center gap-3 lg:gap-fluid-3">
              {/* Date Picker with Shadcn Calendar */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="flex items-center gap-2 lg:gap-fluid-2 pl-3 lg:pl-fluid-3 pr-4 lg:pr-fluid-4 py-2 lg:py-fluid-2 bg-white border border-gray-200 rounded-lg lg:rounded-[0.556vw] text-sm lg:!text-fluid-sm text-gray-700 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:border-transparent transition-all cursor-pointer">
                    <CalendarIcon className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 text-gray-400" />
                    <span className="font-medium">
                      {format(selectedDate, "dd MMM yyyy", { locale: id })}
                    </span>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 border-gray-200 shadow-xl rounded-xl" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-2 lg:gap-fluid-2 px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 text-gray-700 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 rounded-lg lg:rounded-[0.556vw] transition-all"
              >
                <FileDown className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4" />
                <span className="text-sm lg:!text-fluid-sm font-medium">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          {orders.length === 0 ? (
            <div className="p-12 lg:p-fluid-12 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 lg:mb-fluid-4">
                  <ShoppingCart className="w-8 h-8 lg:w-fluid-8 lg:h-fluid-8 text-gray-300" />
                </div>
                <p className="text-gray-900 font-medium text-lg lg:!text-fluid-lg">No orders found</p>
                <p className="text-gray-500 text-sm lg:!text-fluid-sm mt-1 lg:mt-fluid-1">There are no transactions recorded for {format(selectedDate, "dd MMMM yyyy", { locale: id })}</p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Order #</th>
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Time</th>
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Customer</th>
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Table</th>
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Items</th>
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Status</th>
                  <th className="text-left p-4 lg:p-fluid-4 text-gray-500 font-medium text-xs lg:!text-fluid-xs uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50 transition-colors group"
                  >
                    <td className="p-4 lg:p-fluid-4">
                      <span className="font-semibold text-gray-900 text-sm lg:!text-fluid-sm">#{order.orderNumber}</span>
                    </td>
                    <td className="p-4 lg:p-fluid-4">
                      <span className="text-gray-600 text-sm lg:!text-fluid-sm font-mono">
                        {formatTime(order.createdAt)}
                      </span>
                    </td>
                    <td className="p-4 lg:p-fluid-4">
                      <span className="font-medium text-gray-900 text-sm lg:!text-fluid-sm block">{order.customerName}</span>
                    </td>
                    <td className="p-4 lg:p-fluid-4">
                      <span className="text-gray-600 text-sm lg:!text-fluid-sm">Table {order.tableNumber}</span>
                    </td>
                    <td className="p-4 lg:p-fluid-4">
                      <span className="text-gray-600 text-sm lg:!text-fluid-sm">{order.items.length} items</span>
                    </td>
                    <td className="p-4 lg:p-fluid-4">
                      <span className={cn(
                        "px-2.5 lg:px-fluid-2.5 py-1 lg:py-fluid-1 rounded-full font-medium text-xs lg:!text-fluid-xs border",
                        order.orderStatus === 'confirmed' ? "bg-blue-50 text-blue-700 border-blue-100" :
                          order.orderStatus === 'preparing' ? "bg-purple-50 text-purple-700 border-purple-100" :
                            order.orderStatus === 'ready' ? "bg-orange-50 text-orange-700 border-orange-100" :
                              order.orderStatus === 'completed' ? "bg-green-50 text-green-700 border-green-100" :
                                "bg-red-50 text-red-700 border-red-100"
                      )}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="p-4 lg:p-fluid-4">
                      <span className="font-bold text-gray-900 text-sm lg:!text-fluid-sm">
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
  );
}