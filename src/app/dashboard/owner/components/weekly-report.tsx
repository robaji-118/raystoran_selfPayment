/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Calendar,
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Package,
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

// Register ChartJS components
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

interface WeekDates {
  start: string;
  end: string;
}

interface WeeklyTotals {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  completedOrders: number;
  uniqueCustomers: number;
}

interface DailyStat {
  day: string;
  date: string;
  orders: number;
  revenue: number;
  items: number;
}

export default function WeeklyReport() {
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<WeekDates>(getWeekDates(new Date()));
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState<WeeklyTotals>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    uniqueCustomers: 0,
  });

  function getWeekDates(date: Date): WeekDates {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    return {
      start: monday.toISOString().split("T")[0],
      end: sunday.toISOString().split("T")[0],
    };
  }

  useEffect(() => {
    fetchWeeklyOrders();
  }, [selectedWeek]);

  const fetchWeeklyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success) {
        const filtered = data.data.filter((order: Order) => {
          const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
          return (
            orderDate >= selectedWeek.start && orderDate <= selectedWeek.end
          );
        });

        calculateStats(filtered);
        calculateDailyStats(filtered);
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

    setWeeklyTotals({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      uniqueCustomers,
    });
  };

  const calculateDailyStats = (orderList: Order[]) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const stats: DailyStat[] = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeek.start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split("T")[0];

      const dayOrders = orderList.filter((order) => {
        const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
        return orderDate === dateStr;
      });

      const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const items = dayOrders.reduce(
        (sum, order) =>
          sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0),
        0
      );

      stats.push({
        day: days[i],
        date: dateStr,
        orders: dayOrders.length,
        revenue: revenue,
        items: items,
      });
    }

    setDailyStats(stats);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(selectedWeek.start);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedWeek(getWeekDates(newDate));
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedWeek.start);
    newDate.setDate(newDate.getDate() + 7);
    const today = new Date();
    if (newDate <= today) {
      setSelectedWeek(getWeekDates(newDate));
    }
  };

  // Chart Configuration
  const chartData = {
    labels: dailyStats.map((d) => d.day),
    datasets: [
      {
        label: "Revenue",
        data: dailyStats.map((d) => d.revenue),
        borderColor: "#8B5CF6", // Purple
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(0,0,0,0.8)",
        padding: 12,
        titleFont: { size: 13 },
        bodyFont: { size: 13 },
        callbacks: {
          label: (context: any) => formatCurrency(context.raw),
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: "#f3f4f6" },
        ticks: {
          font: { size: 11 },
          callback: (value: any) => {
            if (value >= 1000000) return `Rp${value / 1000000}M`;
            if (value >= 1000) return `Rp${value / 1000}k`;
            return value;
          },
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-fluid-12">
        <div className="w-fluid-16 h-fluid-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-fluid-4"></div>
        <p className="text-gray-500 text-fluid-base">Loading weekly report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      
      {/* Header & Controls */}
      <div className="mb-fluid-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">


          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm">
            <button
              onClick={handlePreviousWeek}
              className="p-fluid-2 text-gray-600 hover:bg-gray-50 rounded-l-lg border-r border-gray-100"
            >
              <ChevronLeft className="w-fluid-5 h-fluid-5" />
            </button>
            <div className="px-fluid-4 py-fluid-2 text-center min-w-[140px]">
              <span className="font-medium text-gray-900 text-fluid-sm">
                Week {getWeekDates(new Date(selectedWeek.start)).start === getWeekDates(new Date()).start ? "(Current)" : ""}
              </span>
            </div>
            <button
              onClick={handleNextWeek}
              disabled={new Date(selectedWeek.end) >= new Date()}
              className="p-fluid-2 text-gray-600 hover:bg-gray-50 rounded-r-lg border-l border-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-fluid-5 h-fluid-5" />
            </button>
          </div>
          <button className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 rounded-lg shadow-sm transition-colors">
            <FileDown className="w-fluid-4 h-fluid-4" />
            <span className="text-fluid-sm font-medium">Export</span>
          </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-4 mb-fluid-6">
        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Total Revenue</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{formatCurrency(weeklyTotals.totalRevenue)}</h3>
          <div className="flex items-center gap-2 mt-2">
             <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-medium">Avg: {formatCurrency(weeklyTotals.avgOrderValue)}</span>
          </div>
        </div>

        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Total Orders</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{weeklyTotals.totalOrders}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-fluid-xs">
             <TrendingUp className="w-3 h-3 text-blue-500" />
             <span>{weeklyTotals.completedOrders} Completed</span>
          </div>
        </div>

        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Items Sold</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{weeklyTotals.totalItems}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-fluid-xs">
             <Package className="w-3 h-3 text-purple-500" />
             <span>Across all categories</span>
          </div>
        </div>

        <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100">
          <p className="text-gray-500 text-fluid-sm font-medium mb-2">Unique Customers</p>
          <h3 className="text-gray-900 font-bold text-fluid-2xl">{weeklyTotals.uniqueCustomers}</h3>
          <div className="flex items-center gap-2 mt-2 text-gray-500 text-fluid-xs">
             <Users className="w-3 h-3 text-orange-500" />
             <span>Served this week</span>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white p-fluid-6 rounded-2xl shadow-sm border border-gray-100 mb-fluid-6">
        <h4 className="text-gray-900 font-bold text-fluid-lg mb-fluid-6">Revenue Trend</h4>
        <div className="h-fluid-80 w-full">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Daily Breakdown Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-fluid-6 border-b border-gray-100">
          <h4 className="text-gray-900 font-bold text-fluid-lg">Daily Breakdown</h4>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Day</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Date</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Orders</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Items</th>
                <th className="text-left p-fluid-4 text-gray-500 font-medium text-fluid-xs uppercase">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dailyStats.map((stat, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="p-fluid-4">
                    <span className="font-medium text-gray-900 text-fluid-sm">{stat.day}</span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="text-gray-600 text-fluid-sm">
                      {new Date(stat.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                    </span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="text-gray-900 text-fluid-sm">{stat.orders}</span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="text-gray-900 text-fluid-sm">{stat.items}</span>
                  </td>
                  <td className="p-fluid-4">
                    <span className="font-bold text-gray-900 text-fluid-sm">{formatCurrency(stat.revenue)}</span>
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