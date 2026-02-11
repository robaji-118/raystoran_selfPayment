/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  FileDown,
  SlidersHorizontal,
  ChevronRight,
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
import { cn } from "@/lib/utils";

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

// Define types based on your Order model
interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  tableNumber: string;
  totalAmount: number;
  orderStatus:
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "cancelled";
  paymentMethod: "cash" | "qris" | "debit" | "credit" | "e-wallet";
  createdAt: string;
  updatedAt: string;
}

interface Table {
  _id: string;
  tableNumber: string;
  status: string;
  capacity: number;
}

interface Menu {
  _id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

interface DashboardStats {
  totalMenus: number;
  totalOrders: number;
  totalTables: number;
  availableTables: number;
  occupiedTables: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  averageMonthlyRevenue: number;
  averageMonthlySales: number;
  weeklyRevenue: number[];
  dailyOrders: number[];
}

interface ApiResponse<T> {
  success?: boolean;
  data?: T[];
  message?: string;
  error?: string;
}

export default function DashboardMain() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMenus: 0,
    totalOrders: 0,
    totalTables: 0,
    availableTables: 0,
    occupiedTables: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    completedOrders: 0,
    averageMonthlyRevenue: 0,
    averageMonthlySales: 0,
    weeklyRevenue: [0, 0, 0, 0, 0, 0, 0],
    dailyOrders: [0, 0, 0, 0, 0, 0, 0],
  });

  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartLabels, setChartLabels] = useState<string[]>([
    "Sen",
    "Sel",
    "Rab",
    "Kam",
    "Jum",
    "Sab",
    "Min",
  ]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [menusRes, ordersRes, tablesRes] = await Promise.all([
        fetch("/api/menus"),
        fetch("/api/orders"),
        fetch("/api/tables"),
      ]);

      if (!menusRes.ok || !ordersRes.ok || !tablesRes.ok) {
        throw new Error("Failed to fetch data from one or more endpoints");
      }

      const menusResult = (await menusRes.json()) as ApiResponse<Menu>;
      const ordersResult = (await ordersRes.json()) as ApiResponse<Order>;
      const tablesResult = (await tablesRes.json()) as
        | ApiResponse<Table>
        | Table[];

      let menus: Menu[] = [];
      let orders: Order[] = [];
      let tables: Table[] = [];

      // Extract menus
      if (menusResult && Array.isArray(menusResult.data)) {
        menus = menusResult.data;
      } else if (Array.isArray(menusResult)) {
        menus = menusResult;
      }

      // Extract orders
      if (ordersResult && Array.isArray(ordersResult.data)) {
        orders = ordersResult.data;
      } else if (Array.isArray(ordersResult)) {
        orders = ordersResult;
      } else {
        orders = [];
      }

      // Extract tables
      if (Array.isArray(tablesResult)) {
        tables = tablesResult;
      } else if (tablesResult && Array.isArray(tablesResult.data)) {
        tables = tablesResult.data;
      }

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.totalAmount || 0);
      }, 0);

      const pendingCount = orders.filter(
        (order) =>
          order.orderStatus === "confirmed" ||
          order.orderStatus === "preparing" ||
          order.orderStatus === "ready" ||
          order.orderStatus === "delivering"
      ).length;

      const completedCount = orders.filter(
        (order) => order.orderStatus === "completed"
      ).length;

      const availableCount = tables.filter(
        (table) => table.status?.toLowerCase() === "available"
      ).length;

      const occupiedCount = tables.filter(
        (table) => table.status?.toLowerCase() === "occupied"
      ).length;

      // Calculate weekly revenue for Monday to Sunday
      const weeklyRevenue = [0, 0, 0, 0, 0, 0, 0];
      const dailyOrders = [0, 0, 0, 0, 0, 0, 0];

      // Get today's date
      const today = new Date();
      const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

      // Calculate Monday of this week (or previous week if today is Sunday)
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(today);
      monday.setDate(today.getDate() + mondayOffset);
      monday.setHours(0, 0, 0, 0);

      // Create array of dates for Monday to Sunday of this week
      const weekDates = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        date.setHours(0, 0, 0, 0);
        return date;
      });

      // Update chart labels (always Monday to Sunday in Indonesian)
      const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
      const newChartLabels = weekDates.map((date) => dayNames[date.getDay()]);
      setChartLabels(newChartLabels);

      // Process orders and group by day of week
      orders.forEach((order) => {
        try {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0); // Normalize to start of day

          // Find which day index this order belongs to (0 = Monday, 6 = Sunday)
          const dayIndex = weekDates.findIndex(
            (day) => day.getTime() === orderDate.getTime()
          );

          if (dayIndex !== -1) {
            weeklyRevenue[dayIndex] += order.totalAmount || 0;
            dailyOrders[dayIndex]++;
          }
        } catch (err) {
          console.error("Error processing order date:", order.createdAt, err);
        }
      });

      // Calculate totals for the week
      const totalWeeklyRevenue = weeklyRevenue.reduce((a, b) => a + b, 0);
      const totalDailyOrders = dailyOrders.reduce((a, b) => a + b, 0);

      setStats({
        totalMenus: menus.length,
        totalOrders: orders.length,
        totalTables: tables.length,
        availableTables: availableCount,
        occupiedTables: occupiedCount,
        totalRevenue,
        pendingOrders: pendingCount,
        completedOrders: completedCount,
        averageMonthlyRevenue: totalWeeklyRevenue,
        averageMonthlySales: totalDailyOrders,
        weeklyRevenue,
        dailyOrders,
      });

      // Get recent orders (last 7) - sort by createdAt descending
      if (orders.length > 0) {
        const sortedOrders = [...orders]
          .sort((a, b) => {
            try {
              const dateA = new Date(a.createdAt).getTime();
              const dateB = new Date(b.createdAt).getTime();
              return dateB - dateA;
            } catch {
              return 0;
            }
          })
          .slice(0, 7);

        setRecentOrders(sortedOrders);
      } else {
        setRecentOrders([]);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data. Please try again.");
      setRecentOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Chart Data Configuration
  const revenueChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Weekly Revenue",
        data: stats.weeklyRevenue,
        borderColor: "#000000",
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const salesChartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "Daily Orders",
        data: stats.dailyOrders,
        backgroundColor: "#000000",
        borderColor: "#000000",
      },
    ],
  };

  // Helper: compute fluid pixel value for Chart.js (needs numbers, not CSS strings)
  const fluidPx = (px: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    return Math.round((px / 1440) * vw);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        titleFont: { size: fluidPx(12) },
        bodyFont: { size: fluidPx(12) },
        padding: fluidPx(8),
        cornerRadius: fluidPx(6),
        boxPadding: fluidPx(4),
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: { size: fluidPx(11) },
          padding: fluidPx(4),
        },
        border: {
          display: false,
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
        borderWidth: fluidPx(2),
      },
      point: {
        radius: fluidPx(3),
        hoverRadius: fluidPx(5),
        borderWidth: fluidPx(2),
      },
      bar: {
        borderRadius: fluidPx(4),
      },
    },
  };

  const formatCurrency = (amount: number | string) => {
    try {
      const numAmount =
        typeof amount === "string" ? parseFloat(amount) : amount;
      return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(isNaN(numAmount) ? 0 : numAmount);
    } catch {
      return "Rp 0";
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "Invalid Date";
      }
      return date.toLocaleString("id-ID", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    const colors: Record<string, string> = {
      confirmed: "bg-blue-100 text-blue-800 text-sm lg:text-fluid-sm",
      preparing: "bg-orange-100 text-orange-800 text-sm lg:text-fluid-sm",
      ready: "bg-green-100 text-green-800 text-sm lg:text-fluid-sm",
      delivering: "bg-indigo-100 text-indigo-800 text-sm lg:text-fluid-sm",
      completed: "bg-gray-100 text-gray-800 text-sm lg:text-fluid-sm",
      cancelled: "bg-red-100 text-red-800 text-sm lg:text-fluid-sm",
    };
    return colors[statusLower] || "bg-gray-100 text-gray-800";
  };

  const getPaymentMethodColor = (method: string) => {
    const methodLower = method.toLowerCase();
    if (methodLower === "cash") return "bg-blue-100 text-blue-700 text-sm lg:text-fluid-sm";
    if (methodLower === "qris") return "bg-green-100 text-green-700 text-sm lg:text-fluid-sm";
    if (methodLower === "debit" || methodLower === "credit")
      return "bg-purple-100 text-purple-700 text-sm lg:text-fluid-sm";
    if (methodLower === "e-wallet") return "bg-orange-100 text-orange-700 text-sm lg:text-fluid-sm";
    return "bg-gray-100 text-gray-700 text-sm lg:text-fluid-sm";
  };

  const formatPaymentMethod = (method: string) => {
    const methodLower = method.toLowerCase();
    switch (methodLower) {
      case "cash":
        return "Cash";
      case "qris":
        return "QRIS";
      case "debit":
        return "Debit Card";
      case "credit":
        return "Credit Card";
      case "e-wallet":
        return "E-Wallet";
      default:
        return method.charAt(0).toUpperCase() + method.slice(1);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === recentOrders.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(recentOrders.map((_, index) => index));
    }
  };

  const toggleSelectItem = (index: number) => {
    setSelectedItems((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-12 h-12 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-base lg:text-fluid-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 lg:mb-fluid-4">
            <ShoppingCart className="w-8 h-8 lg:w-fluid-8 lg:h-fluid-8 text-red-600" />
          </div>
          <p className="text-red-600 font-medium mb-2 lg:mb-fluid-2 text-base lg:text-fluid-base">
            Error Loading Dashboard
          </p>
          <p className="text-neutral-500 mb-4 lg:mb-fluid-4 text-base lg:text-fluid-base">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-base lg:text-fluid-base"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-fluid-4 mb-4 lg:mb-fluid-4">
          {/* Total Income */}
          <div className="bg-white p-6 lg:p-fluid-6 shadow-sm border border-gray-100 rounded-xl lg:rounded-[1.111vw]">
            <div className="flex items-start justify-between mb-4 lg:mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-base lg:text-fluid-base">Total Income</p>
                <h4 className="font-bold text-gray-900 text-2xl lg:text-fluid-2xl">
                  {formatCurrency(stats.totalRevenue)}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-fluid-2">
              <div className="flex items-center text-green-600 text-sm lg:text-fluid-sm">
                <TrendingUp className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 mr-1 lg:mr-fluid-1" />
                <span className="font-medium">
                  {stats.totalOrders > 0 ? "+" : ""}
                  {stats.completedOrders} orders
                </span>
              </div>
              <span className="text-gray-400 text-sm lg:text-fluid-sm">completed</span>
            </div>
          </div>

          {/* Total Income per Week */}
          <div className="bg-white rounded-xl lg:rounded-[1.111vw] p-6 lg:p-fluid-6 shadow-sm border border-gray-100">
            <div className="flex flex-col items-start gap-6 lg:gap-fluid-6 justify-between">
              <div className="flex-1 w-full">
                <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-base lg:text-fluid-base">
                  Total Income per Week
                </p>
                <h4 className="font-bold text-gray-900 mb-2 lg:mb-fluid-2 text-2xl lg:text-fluid-2xl">
                  {formatCurrency(stats.averageMonthlyRevenue)}
                </h4>
                <span className="text-gray-400 text-sm lg:text-fluid-sm">Last 7 days</span>
              </div>
              <div className="w-full h-32 lg:h-fluid-32">
                <Line
                  data={revenueChartData}
                  options={chartOptions}
                />
              </div>
            </div>
          </div>

          {/* Total Orders per Week */}
          <div className="flex flex-col justify-between gap-6 lg:gap-fluid-6 bg-white rounded-xl lg:rounded-[1.111vw] p-6 lg:p-fluid-6 shadow-sm border border-gray-100">
            <div className="flex-1">
              <p className="text-gray-500 mb-1 lg:mb-fluid-1 text-base lg:text-fluid-base">
                Total Orders per Week
              </p>
              <h4 className="font-bold text-gray-900 mb-2 lg:mb-fluid-2 text-2xl lg:text-fluid-2xl">
                {stats.averageMonthlySales}
              </h4>
              <span className="text-gray-400 text-sm lg:text-fluid-sm">Last 7 days</span>
            </div>
            <div className="w-full h-28 lg:h-fluid-28">
              <Bar
                data={salesChartData}
                options={chartOptions}
              />
            </div>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white rounded-xl lg:rounded-[1.111vw] shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-4 lg:p-fluid-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h4 className="text-gray-900 text-lg lg:text-fluid-lg">Recent Transactions</h4>
              <div className="flex items-center gap-3 lg:gap-fluid-3">
                <button className="flex items-center gap-2 lg:gap-fluid-2 px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <FileDown className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4" />
                  <span className="text-sm lg:text-fluid-sm">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-sm lg:text-fluid-sm">
                    Order
                  </th>
                  <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-sm lg:text-fluid-sm">
                    Customer
                  </th>
                  <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-sm lg:text-fluid-sm">
                    Date
                  </th>
                  <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-sm lg:text-fluid-sm">
                    Amount
                  </th>
                  <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-sm lg:text-fluid-sm">
                    Status
                  </th>
                  <th className="text-left p-3 lg:p-fluid-4 text-gray-600 font-medium text-sm lg:text-fluid-sm">
                    Payment
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-12 lg:p-fluid-12 text-center">
                      <div className="flex flex-col items-center">
                        <ShoppingCart className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 text-gray-300 mb-4 lg:mb-fluid-4" />
                        <p className="text-gray-500 mb-2 lg:mb-fluid-2 text-lg lg:text-fluid-lg">
                          No transactions yet
                        </p>
                        <p className="text-gray-400 text-sm lg:text-fluid-sm">
                          Orders will appear here once created
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order, index) => {
                    const productName = `Order #${order.orderNumber}`;
                    return (
                      <tr
                        key={order._id}
                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-3 lg:p-fluid-4">
                          <div className="flex items-center gap-3 lg:gap-fluid-3">
                            <div>
                              <span className="font-medium text-gray-900 block text-sm lg:text-fluid-sm">
                                {productName}
                              </span>
                              <span className="text-gray-500 text-xs lg:text-fluid-xs">
                                Table {order.tableNumber}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span className="text-gray-900 font-medium text-sm lg:text-fluid-sm">
                            {order.customerName || "Guest"}
                          </span>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span className="text-gray-600 text-sm lg:text-fluid-sm">
                            {formatDate(order.createdAt)}
                          </span>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span className="font-medium text-gray-900 text-sm lg:text-fluid-sm">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span
                            className={cn(
                              "px-3 lg:px-fluid-3 py-1 lg:py-fluid-1 rounded-full font-medium text-xs lg:text-fluid-xs",
                              getStatusColor(order.orderStatus)
                            )}
                          >
                            {order.orderStatus.charAt(0).toUpperCase() +
                              order.orderStatus.slice(1)}
                          </span>
                        </td>
                        <td className="p-3 lg:p-fluid-4">
                          <span
                            className={cn(
                              "inline-flex px-3 lg:px-fluid-3 py-1 lg:py-fluid-1 rounded-full font-medium text-xs lg:text-fluid-xs",
                              getPaymentMethodColor(order.paymentMethod)
                            )}
                          >
                            {formatPaymentMethod(order.paymentMethod)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}