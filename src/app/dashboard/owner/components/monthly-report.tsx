/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  Package,
  ShoppingCart,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  FileDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Order {
  _id: string;
  totalAmount: number;
  items: any[];
  orderStatus: string;
  customerName: string;
  createdAt: string;
}

interface MonthlyTotals {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  completedOrders: number;
  uniqueCustomers: number;
}

interface WeeklyStat {
  week: string; // "Week 1", "Week 2", etc.
  startDate: string;
  endDate: string;
  orders: number;
  revenue: number;
}

export default function MonthlyReport() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    uniqueCustomers: 0,
  });
  const [dailyData, setDailyData] = useState<{ day: string; revenue: number }[]>([]);

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  useEffect(() => {
    fetchMonthlyOrders();
  }, [selectedMonth]);

  const fetchMonthlyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success) {
        const filtered = data.data.filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return (
            orderDate.getMonth() === selectedMonth.month &&
            orderDate.getFullYear() === selectedMonth.year
          );
        });

        calculateStats(filtered);
        calculateWeeklyStats(filtered);
        calculateDailyData(filtered);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: Order[]) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = orderList.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
      0
    );
    const completedOrders = orderList.filter((o) => o.orderStatus === "completed").length;
    const uniqueCustomers = new Set(orderList.map((o) => o.customerName)).size;

    setMonthlyTotals({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      uniqueCustomers,
    });
  };

  const calculateWeeklyStats = (orderList: Order[]) => {
    const stats: WeeklyStat[] = [];
    const firstDay = new Date(selectedMonth.year, selectedMonth.month, 1);
    const lastDay = new Date(selectedMonth.year, selectedMonth.month + 1, 0);

    let currentStart = new Date(firstDay);
    let weekCount = 1;

    // Loop per minggu dalam bulan tersebut
    while (currentStart <= lastDay) {
      // Tentukan akhir minggu (Minggu atau akhir bulan)
      const currentEnd = new Date(currentStart);
      const dayOfWeek = currentStart.getDay(); // 0 = Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;

      currentEnd.setDate(currentStart.getDate() + daysUntilSunday);

      // Jika akhir minggu melebihi akhir bulan, gunakan akhir bulan
      const effectiveEnd = currentEnd > lastDay ? lastDay : currentEnd;

      // Filter order dalam range minggu ini
      const weekOrders = orderList.filter(order => {
        const d = new Date(order.createdAt);
        // Reset jam agar perbandingan tanggal akurat
        const dTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const startTime = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate()).getTime();
        const endTime = new Date(effectiveEnd.getFullYear(), effectiveEnd.getMonth(), effectiveEnd.getDate()).getTime();
        return dTime >= startTime && dTime <= endTime;
      });

      const revenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);

      stats.push({
        week: `Week ${weekCount}`,
        startDate: currentStart.toISOString(),
        endDate: effectiveEnd.toISOString(),
        orders: weekOrders.length,
        revenue: revenue
      });

      // Lanjut ke minggu berikutnya (Senin depan)
      currentStart = new Date(effectiveEnd);
      currentStart.setDate(currentStart.getDate() + 1);
      weekCount++;
    }

    setWeeklyStats(stats);
  };

  const calculateDailyData = (orderList: Order[]) => {
    const daysInMonth = new Date(selectedMonth.year, selectedMonth.month + 1, 0).getDate();
    const data = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${i}`; // Label tanggal 1, 2, 3...
      const ordersToday = orderList.filter(o => new Date(o.createdAt).getDate() === i);
      const revenue = ordersToday.reduce((sum, o) => sum + o.totalAmount, 0);
      data.push({ day: dateStr, revenue });
    }
    setDailyData(data);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => {
      if (prev.month === 0) return { month: 11, year: prev.year - 1 };
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    const now = new Date();
    const isCurrent = selectedMonth.month === now.getMonth() && selectedMonth.year === now.getFullYear();
    if (!isCurrent) {
      setSelectedMonth((prev) => {
        if (prev.month === 11) return { month: 0, year: prev.year + 1 };
        return { month: prev.month + 1, year: prev.year };
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Chart Config
  const chartData = {
    labels: dailyData.map(d => d.day),
    datasets: [
      {
        label: "Revenue",
        data: dailyData.map(d => d.revenue),
        borderColor: "#10B981", // Green
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatCurrency(ctx.raw),
        }
      }
    },
    scales: {
      y: { display: false, beginAtZero: true },
      x: { grid: { display: false }, ticks: { maxTicksLimit: 10 } },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-neutral-500 text-fluid-base">Loading monthly report...</p>
        </div>
      </div>
    );
  }

  // Sort weeks by revenue descending for "Top Performing Weeks"
  const topWeeks = [...weeklyStats].sort((a, b) => b.revenue - a.revenue).slice(0, 5);

  return (
    <div className="min-h-screen p-6">

      {/* Header */}
      <div className="mb-fluid-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-fluid-3">
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={handlePreviousMonth}
              className="p-fluid-2 text-gray-600 hover:bg-gray-50 rounded-l-lg border-r border-gray-100"
            >
              <ChevronLeft className="w-fluid-5 h-fluid-5" />
            </button>
            <div className="px-fluid-4 py-fluid-2 text-center min-w-[140px]">
              <span className="font-medium text-gray-900 text-fluid-sm">
                {months[selectedMonth.month]} {selectedMonth.year}
              </span>
            </div>
            <button
              onClick={handleNextMonth}
              disabled={selectedMonth.month === new Date().getMonth() && selectedMonth.year === new Date().getFullYear()}
              className="p-fluid-2 text-gray-600 hover:bg-gray-50 rounded-r-lg border-l border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-fluid-5 h-fluid-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-4 mb-fluid-6">
        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Total Revenue</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{formatCurrency(monthlyTotals.totalRevenue)}</h3>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Avg: {formatCurrency(monthlyTotals.avgOrderValue)}</span>
          </div>
        </div>

        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Total Orders</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{monthlyTotals.totalOrders}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-fluid-xs">
            <ShoppingCart className="w-3 h-3 text-blue-500" />
            <span>{monthlyTotals.completedOrders} Completed</span>
          </div>
        </div>

        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Items Sold</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{monthlyTotals.totalItems}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-fluid-xs">
            <Package className="w-3 h-3 text-purple-500" />
            <span>Across all weeks</span>
          </div>
        </div>

        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Customers</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{monthlyTotals.uniqueCustomers}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-fluid-xs">
            <Calendar className="w-3 h-3 text-orange-500" />
            <span>Unique visitors</span>
          </div>
        </div>
      </div>

      {/* Charts & Top Performing Weeks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-fluid-6 mb-fluid-6">

        {/* Daily Trend Chart */}
        <div className="lg:col-span-2 bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-gray-900 font-bold text-fluid-lg mb-4">Revenue Trend (Daily)</h4>
          <div className="h-fluid-64 w-full">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Top Performing Weeks */}
        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <h4 className="text-gray-900 font-bold text-fluid-lg mb-4">Top Performing Weeks</h4>
          {topWeeks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-4">
              {topWeeks.map((week, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                      index === 0 ? "bg-yellow-100 text-yellow-700" :
                        index === 1 ? "bg-gray-200 text-gray-700" : "bg-white border border-gray-200 text-gray-500"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-sm">{week.week}</p>
                      <p className="text-gray-500 text-xs">
                        {new Date(week.startDate).getDate()} - {new Date(week.endDate).getDate()} {months[selectedMonth.month]}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-900 font-bold text-sm">{formatCurrency(week.revenue)}</p>
                    <p className="text-gray-500 text-xs">{week.orders} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-fluid-6 border-b border-gray-100">
          <h4 className="text-gray-900 font-bold text-fluid-lg">Weekly Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Period</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Orders</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Revenue</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Avg/Order</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {weeklyStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-fluid-4">
                    <span className="font-bold text-gray-900 text-fluid-sm">{stat.week}</span>
                    <span className="block text-gray-500 text-fluid-xs mt-0.5">
                      {new Date(stat.startDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })} - {new Date(stat.endDate).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                    </span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="text-gray-900 text-fluid-sm">{stat.orders}</span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="font-bold text-green-600 text-fluid-sm">{formatCurrency(stat.revenue)}</span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="text-gray-600 text-fluid-sm">
                      {stat.orders > 0 ? formatCurrency(stat.revenue / stat.orders) : "Rp 0"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}