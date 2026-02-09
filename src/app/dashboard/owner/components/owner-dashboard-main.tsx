/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  FileDown,
  Award,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { cn, fluidSize } from "@/lib/utils";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

// --- Tipe Data ---

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  totalAmount: number;
  orderStatus: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
  items?: any[];
}

interface TopMenuItem {
  name: string;
  count: number;
  revenue: number;
}

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  averageMonthlyRevenue: number;
  averageMonthlySales: number;
  weeklyRevenue: number[];
  dailyOrders: number[];
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T[];
}

export default function OwnerDashboardMain() {
  // --- State ---
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    totalOrders: 0,
    completedOrders: 0,
    averageMonthlyRevenue: 0,
    averageMonthlySales: 0,
    weeklyRevenue: [0, 0, 0, 0, 0, 0, 0],
    dailyOrders: [0, 0, 0, 0, 0, 0, 0],
  });

  // Ganti recentOrders dengan weeklyOrders untuk menampung data seminggu
  const [weeklyOrders, setWeeklyOrders] = useState<Order[]>([]);
  const [topSellingItems, setTopSellingItems] = useState<TopMenuItem[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartLabels, setChartLabels] = useState<string[]>([
    "Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min",
  ]);

  // --- Fetch Data ---
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersRes = await fetch("/api/orders");

      if (!ordersRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const ordersResult = (await ordersRes.json()) as ApiResponse<Order>;
      let orders: Order[] = [];

      if (ordersResult && Array.isArray(ordersResult.data)) {
        orders = ordersResult.data;
      } else if (Array.isArray(ordersResult)) {
        orders = ordersResult;
      }

      // 1. Hitung Statistik Dasar
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const completedCount = orders.filter((o) => o.orderStatus === "completed").length;

      // 2. Tentukan Rentang Waktu Minggu Ini (Senin 00:00 - Sekarang)
      const weeklyRevenue = [0, 0, 0, 0, 0, 0, 0];
      const dailyOrders = [0, 0, 0, 0, 0, 0, 0];

      const today = new Date();
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0); // Reset jam ke awal hari Senin

      // Setup tanggal untuk chart
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        date.setHours(0, 0, 0, 0);
        return date;
      });

      const newChartLabels = weekDates.map((date) => {
        const d = date.getDay();
        const standardDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
        return standardDays[d];
      });
      setChartLabels(newChartLabels);

      // 3. Proses Data Mingguan (Chart & Tabel)
      orders.forEach((order) => {
        try {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          const dayIndex = weekDates.findIndex((day) => day.getTime() === orderDate.getTime());

          if (dayIndex !== -1) {
            weeklyRevenue[dayIndex] += order.totalAmount || 0;
            dailyOrders[dayIndex]++;
          }
        } catch (err) { console.error(err); }
      });

      // Filter Order KHUSUS Minggu Ini untuk Tabel
      // Logic: Ambil order yang tanggalnya >= Senin minggu ini
      const filteredWeeklyOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= monday;
      }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort terbaru

      setWeeklyOrders(filteredWeeklyOrders);

      // 4. Hitung Top Selling Items
      const menuCount: { [key: string]: TopMenuItem } = {};

      orders.forEach((order) => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach((item: any) => {
            const name = item.menuItemName || item.name || "Unknown Item";
            const price = item.price || 0;
            const qty = item.quantity || 1;
            const subtotal = item.subtotal || (price * qty);

            if (!menuCount[name]) {
              menuCount[name] = { name, count: 0, revenue: 0 };
            }
            menuCount[name].count += qty;
            menuCount[name].revenue += subtotal;
          });
        }
      });

      const sortedTopItems = Object.values(menuCount)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopSellingItems(sortedTopItems);

      // 5. Update Stats
      setStats({
        totalRevenue,
        totalOrders: orders.length,
        completedOrders: completedCount,
        averageMonthlyRevenue: weeklyRevenue.reduce((a, b) => a + b, 0),
        averageMonthlySales: dailyOrders.reduce((a, b) => a + b, 0),
        weeklyRevenue,
        dailyOrders,
      });

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // --- Pagination Logic ---
  const totalPages = Math.ceil(weeklyOrders.length / itemsPerPage);
  const paginatedOrders = weeklyOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // --- Fungsi Export Report (Mingguan) ---
  const handleExport = () => {
    if (weeklyOrders.length === 0) {
      alert("No data to export for this week");
      return;
    }

    const headers = [
      "Order Number",
      "Customer Name",
      "Table",
      "Date",
      "Total Amount",
      "Status",
      "Payment Method"
    ];

    const rows = weeklyOrders.map(order => [
      order.orderNumber,
      `"${order.customerName || 'Guest'}"`,
      order.tableNumber,
      new Date(order.createdAt).toLocaleDateString("id-ID") + " " + new Date(order.createdAt).toLocaleTimeString("id-ID"),
      order.totalAmount,
      order.orderStatus,
      order.paymentMethod
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `weekly_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Helpers ---
  const formatCurrency = (amount: number | string) => {
    const val = typeof amount === "string" ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(isNaN(val) ? 0 : val);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch { return "-"; }
  };

  const getStatusColor = (status: string) => {
    const s = status.toLowerCase();
    const colors: Record<string, string> = {
      confirmed: "bg-blue-100 text-blue-800",
      preparing: "bg-orange-100 text-orange-800",
      ready: "bg-green-100 text-green-800",
      delivering: "bg-indigo-100 text-indigo-800",
      completed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[s] || "bg-gray-100 text-gray-800";
  };

  const revenueChartData = {
    labels: chartLabels,
    datasets: [{
      label: "Revenue",
      data: stats.weeklyRevenue,
      borderColor: "#000000",
      backgroundColor: "rgba(0, 0, 0, 0.1)",
      fill: true,
      tension: 0.4,
    }],
  };

  const salesChartData = {
    labels: chartLabels,
    datasets: [{
      label: "Orders",
      data: stats.dailyOrders,
      backgroundColor: "#000000",
      borderColor: "#000000",
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { display: false, beginAtZero: true },
      x: {
        display: true,
        grid: { display: false, drawBorder: false },
        ticks: { font: { size: 11 } }
      },
    },
    elements: { line: { tension: 0.4 } },
  };

  // --- Render ---

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-neutral-500 text-fluid-base">Loading owner dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-fluid-96">
        <p className="text-red-600 font-medium">{error}</p>
        <button onClick={fetchDashboardData} className="ml-4 underline">Retry</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen">

      {/* --- ROW 1: Summary Cards & Charts --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-4 mb-fluid-4">

        {/* Card 1: Total Income */}
        <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
          <div className="flex items-start justify-between mb-fluid-4">
            <div>
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Income (All Time)</p>
              <h4 className="font-bold text-gray-900 text-fluid-2xl">
                {formatCurrency(stats.totalRevenue)}
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-fluid-2">
            <div className="flex items-center text-green-600 text-fluid-sm">
              <TrendingUp className="w-fluid-4 h-fluid-4 mr-fluid-1" />
              <span className="font-medium">
                {stats.completedOrders} orders
              </span>
            </div>
            <span className="text-gray-400 text-fluid-sm">completed</span>
          </div>
        </div>

        {/* Card 2: Weekly Revenue Chart */}
        <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
          <div className="flex flex-col items-start gap-fluid-6 justify-between h-full">
            <div className="flex-1 w-full">
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">Weekly Revenue</p>
              <h4 className="font-bold text-gray-900 mb-fluid-2 text-fluid-2xl">
                {formatCurrency(stats.averageMonthlyRevenue)}
              </h4>
              <span className="text-gray-400 text-fluid-sm">Last 7 days</span>
            </div>
            <div className="w-full h-fluid-32">
              <Line data={revenueChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Card 3: Weekly Orders Chart */}
        <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
          <div className="flex flex-col items-start gap-fluid-6 justify-between h-full">
            <div className="flex-1 w-full">
              <p className="text-gray-500 mb-fluid-1 text-fluid-base">Weekly Orders</p>
              <h4 className="font-bold text-gray-900 mb-fluid-2 text-fluid-2xl">
                {stats.averageMonthlySales}
              </h4>
              <span className="text-gray-400 text-fluid-sm">Last 7 days</span>
            </div>
            <div className="w-full h-fluid-28">
              <Bar data={salesChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* --- ROW 2: Top Selling Items --- */}
      <div className="mb-fluid-4">
        <div className="bg-white shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
          <div className="p-fluid-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-fluid-3">
              <div>
                <h4 className="text-gray-900 font-bold text-fluid-lg">Top 5 Selling Items</h4>
                <p className="text-gray-500 text-fluid-sm">Most popular menu items based on order quantity</p>
              </div>
            </div>
          </div>

          <div className="p-fluid-6">
            {topSellingItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-fluid-4">
                {topSellingItems.map((item, index) => (
                  <div
                    key={index}
                    className="group relative bg-gray-50 p-fluid-4 rounded-xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="absolute -top-3 -right-3 w-10 h-10 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm shadow-sm z-10">
                      #{index + 1}
                    </div>

                    <div className="mb-fluid-3">
                      <h5 className="font-bold text-gray-900 text-fluid-base line-clamp-1 group-hover:text-purple-700 transition-colors">
                        {item.name}
                      </h5>
                    </div>

                    <div className="space-y-fluid-2">
                      <div className="flex items-center justify-between text-fluid-sm">
                        <span className="text-gray-500">Sold</span>
                        <span className="font-bold text-gray-900">{item.count}</span>
                      </div>
                      <div className="flex items-center justify-between text-fluid-sm">
                        <span className="text-gray-500">Revenue</span>
                        <span className="font-bold text-green-600">{formatCurrency(item.revenue)}</span>
                      </div>
                    </div>

                    <div className="mt-fluid-3 h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          index === 0 ? "bg-gray-600 w-full" :
                            index === 1 ? "bg-gray-500 w-[85%]" :
                              index === 2 ? "bg-gray-400 w-[70%]" :
                                "bg-gray-300 w-[50%]"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-fluid-8">
                <p className="text-gray-500">No sales data available to determine top items.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- ROW 3: Transactions (Weekly Reset + Pagination) --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
        <div className="p-fluid-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-gray-900 text-fluid-lg font-bold">Transactions (This Week)</h4>
              <p className="text-gray-500 text-fluid-xs mt-1">Resets every Monday</p>
            </div>

            <button
              onClick={handleExport}
              className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <FileDown className="w-fluid-4 h-fluid-4" />
              <span className="text-fluid-sm">Export Weekly</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Order ID</th>
                <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Customer</th>
                <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Date</th>
                <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Amount</th>
                <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-fluid-12 text-center text-gray-500">
                    No transactions found for this week.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="p-fluid-4">
                      <div className="font-medium text-gray-900 text-fluid-sm">#{order.orderNumber}</div>
                      <div className="text-gray-500 text-fluid-xs">Table {order.tableNumber}</div>
                    </td>
                    <td className="p-fluid-4 text-gray-900 text-fluid-sm font-medium">
                      {order.customerName || "Guest"}
                    </td>
                    <td className="p-fluid-4 text-gray-600 text-fluid-sm">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-fluid-4 text-gray-900 font-bold text-fluid-sm">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="p-fluid-4">
                      <span className={cn("px-fluid-3 py-fluid-1 rounded-full font-medium !text-fluid-sm", getStatusColor(order.orderStatus))}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {weeklyOrders.length > itemsPerPage && (
          <div className="flex items-center justify-between p-fluid-4 border-t border-gray-100">
            <span className="text-gray-500 text-fluid-sm">
              Showing {(currentPage - 1) * itemsPerPage + 1}-
              {Math.min(currentPage * itemsPerPage, weeklyOrders.length)} of {weeklyOrders.length}
            </span>
            <div className="flex items-center gap-fluid-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-fluid-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-fluid-4 h-fluid-4" />
              </button>
              <span className="text-fluid-sm font-medium px-fluid-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-fluid-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-fluid-4 h-fluid-4" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}