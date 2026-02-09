/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Calendar,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  BarChart3,
  Package,
  Users,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Award,
  Star,
  Crown,
  Trophy,
  TrendingDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";
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
  ArcElement,
);

interface OrderItem {
  menuItemName: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  tableNumber: number;
  items: OrderItem[];
  orderStatus: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  paymentStatus: "paid" | "failed";
  paymentMethod: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  customerNotes?: string;
  createdAt: string;
}

interface WeekDates {
  start: string;
  end: string;
}

interface DailyStat {
  day: string;
  date: string;
  orders: number;
  revenue: number;
  items: number;
}

interface WeeklyTotals {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  completedOrders: number;
  uniqueCustomers: number;
}

interface TopMenuItem {
  name: string;
  quantity: number;
  revenue: number;
  avgPrice: number;
}

export default function WeeklyReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<WeekDates>(
    getWeekDates(new Date()),
  );
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState<WeeklyTotals>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    uniqueCustomers: 0,
  });
  const [topMenuItems, setTopMenuItems] = useState<TopMenuItem[]>([]);
  const [topDay, setTopDay] = useState<DailyStat | null>(null);

  function getWeekDates(date: Date): WeekDates {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
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
          const orderDate = new Date(order.createdAt)
            .toISOString()
            .split("T")[0];
          return (
            orderDate >= selectedWeek.start && orderDate <= selectedWeek.end
          );
        });

        setOrders(filtered);
        calculateStats(filtered);
        calculateDailyStats(filtered);
        findTopMenuItems(filtered);
        findTopDay(filtered);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: Order[]) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce(
      (sum, order) => sum + order.totalAmount,
      0,
    );
    const totalItems = orderList.reduce(
      (sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    );
    const completedOrders = orderList.filter(
      (o) => o.orderStatus === "completed",
    ).length;
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

      const revenue = dayOrders.reduce(
        (sum, order) => sum + order.totalAmount,
        0,
      );
      const items = dayOrders.reduce(
        (sum, order) =>
          sum +
          order.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
        0,
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

  const findTopMenuItems = (orderList: Order[]) => {
    const menuStats: Record<
      string,
      { quantity: number; revenue: number; totalPrice: number }
    > = {};

    orderList.forEach((order) => {
      order.items.forEach((item) => {
        if (!menuStats[item.menuItemName]) {
          menuStats[item.menuItemName] = {
            quantity: 0,
            revenue: 0,
            totalPrice: 0,
          };
        }
        menuStats[item.menuItemName].quantity += item.quantity;
        menuStats[item.menuItemName].revenue += item.subtotal;
        menuStats[item.menuItemName].totalPrice += item.price * item.quantity;
      });
    });

    const sorted = Object.entries(menuStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        avgPrice:
          stats.quantity > 0
            ? Math.round(stats.totalPrice / stats.quantity)
            : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    setTopMenuItems(sorted);
  };

  const findTopMenuItemsToday = (orderList: Order[]) => {
    // Filter hanya order hari ini
    const today = new Date().toISOString().split("T")[0];
    const todayOrders = orderList.filter((order) => {
      const orderDate = new Date(order.createdAt).toISOString().split("T")[0];
      return orderDate === today;
    });

    const menuStats: Record<
      string,
      { quantity: number; revenue: number; totalPrice: number }
    > = {};

    todayOrders.forEach((order) => {
      order.items.forEach((item) => {
        if (!menuStats[item.menuItemName]) {
          menuStats[item.menuItemName] = {
            quantity: 0,
            revenue: 0,
            totalPrice: 0,
          };
        }
        menuStats[item.menuItemName].quantity += item.quantity;
        menuStats[item.menuItemName].revenue += item.subtotal;
        menuStats[item.menuItemName].totalPrice += item.price * item.quantity;
      });
    });

    const sorted = Object.entries(menuStats)
      .map(([name, stats]) => ({
        name,
        quantity: stats.quantity,
        revenue: stats.revenue,
        avgPrice:
          stats.quantity > 0
            ? Math.round(stats.totalPrice / stats.quantity)
            : 0,
      }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    setTopMenuItems(sorted);
  };

  const findTopDay = (orderList: Order[]) => {
    const dailyStats: Record<string, DailyStat> = {};

    orderList.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split("T")[0];
      if (!dailyStats[date]) {
        const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
          new Date(date).getDay()
        ];
        dailyStats[date] = {
          day,
          date,
          orders: 0,
          revenue: 0,
          items: 0,
        };
      }
      dailyStats[date].orders += 1;
      dailyStats[date].revenue += order.totalAmount;
      dailyStats[date].items += order.items.reduce(
        (sum, item) => sum + item.quantity,
        0,
      );
    });

    const daysArray = Object.values(dailyStats);
    const top =
      daysArray.length > 0
        ? daysArray.reduce((prev, current) =>
          prev.revenue > current.revenue ? prev : current,
        )
        : null;

    setTopDay(top);
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

  // Chart Data
  const dailyChartData = {
    labels: dailyStats.map((stat) => stat.day),
    datasets: [
      {
        label: "Daily Revenue",
        data: dailyStats.map((stat) => stat.revenue),
        borderColor: "#8B5CF6", // Purple
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Daily Orders",
        data: dailyStats.map((stat) => stat.orders),
        borderColor: "#10B981", // Green
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: "y1",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1F2937",
        bodyColor: "#1F2937",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: 12,
        boxPadding: 4,
        usePointStyle: true,
        callbacks: {
          label: function (context: any) {
            if (context.dataset.label?.includes("Revenue")) {
              return `Rp ${context.parsed.y.toLocaleString("id-ID")}`;
            }
            return `${context.parsed.y} ${context.dataset.label?.includes("Quantity") ? "items" : "orders"}`;
          },
        },
      },
    },
    scales: {
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        beginAtZero: true,
        grid: {
          display: true,
          color: "rgba(229, 231, 235, 0.5)",
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
          callback: function (value: any) {
            return `Rp ${value.toLocaleString("id-ID")}`;
          },
        },
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: 11,
          },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
    interaction: {
      intersect: false,
      mode: "index" as const,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-neutral-500 text-fluid-base">Loading weekly report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-fluid-4">
      <div className="">
        {/* Header with Week Navigation */}
        <div className="mb-fluid-6" style={{ borderRadius: fluidSize(16) }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <button
                onClick={handlePreviousWeek}
                className="p-fluid-2 text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors"
              >
                <ChevronLeft className="w-fluid-5 h-fluid-5" />
              </button>
              <div className="px-fluid-4 py-fluid-2 text-center min-w-[180px]">
                <span className="font-medium text-gray-900 text-fluid-base">
                  {new Date(selectedWeek.start).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  -{" "}
                  {new Date(selectedWeek.end).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
              <button
                onClick={handleNextWeek}
                disabled={new Date(selectedWeek.end) >= new Date()}
                className={cn(
                  "p-fluid-2 rounded-r-lg transition-colors",
                  new Date(selectedWeek.end) >= new Date()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50",
                )}
              >
                <ChevronRight className="w-fluid-5 h-fluid-5" />
              </button>
            </div>
            <button className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-fluid-sm border border-gray-200">
              <FileDown className="w-fluid-4 h-fluid-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-4 mb-fluid-6">
          {/* Total Orders */}
          <div
            className="bg-white p-fluid-6 shadow-sm border border-gray-100"
            style={{ borderRadius: fluidSize(16) }}
          >
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                  Total Orders
                </p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {weeklyTotals.totalOrders}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <div className="flex items-center text-green-600 text-fluid-sm">
                <TrendingUp className="w-fluid-4 h-fluid-4 mr-fluid-1" />
                <span className="font-medium">
                  {weeklyTotals.completedOrders} completed
                </span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div
            className="bg-white p-fluid-6 shadow-sm border border-gray-100"
            style={{ borderRadius: fluidSize(16) }}
          >
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                  Total Revenue
                </p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {formatCurrency(weeklyTotals.totalRevenue)}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <span className="text-gray-400 text-fluid-sm">This week</span>
            </div>
          </div>

          {/* Avg Order Value */}
          <div
            className="bg-white p-fluid-6 shadow-sm border border-gray-100"
            style={{ borderRadius: fluidSize(16) }}
          >
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                  Avg Order Value
                </p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {formatCurrency(weeklyTotals.avgOrderValue)}
                </h4>
              </div>
            </div>
          </div>

          {/* Total Items */}
          <div
            className="bg-white p-fluid-6 shadow-sm border border-gray-100"
            style={{ borderRadius: fluidSize(16) }}
          >
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">
                  Total Items
                </p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {weeklyTotals.totalItems}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <div className="flex items-center text-gray-600 text-fluid-sm">
                <Users className="w-fluid-4 h-fluid-4 mr-fluid-1" />
                <span className="font-medium">
                  {weeklyTotals.uniqueCustomers} customers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Top Selling Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-fluid-6 mb-fluid-6">
          {/* Daily Performance Chart */}
          <div
            className="lg:col-span-2 bg-white p-fluid-6 shadow-sm border border-gray-100"
            style={{ borderRadius: fluidSize(16) }}
          >
            <div className="flex items-center justify-between mb-fluid-6">
              <div>
                <h4 className="text-gray-900 text-fluid-lg">
                  Daily Performance
                </h4>
                <p className="text-gray-500 text-fluid-sm mt-fluid-1">
                  Revenue and orders throughout the week
                </p>
              </div>
              <div className="flex items-center gap-fluid-4"></div>
            </div>
            <div className="h-fluid-64">
              <Line data={dailyChartData} options={chartOptions} />
            </div>
          </div>

          {/* Top Selling This Week Section */}
          <div
            className="bg-white p-fluid-4 shadow-sm border border-gray-100"
            style={{ borderRadius: fluidSize(16) }}
          >
            <div className="flex items-center justify-between mb-fluid-6">
              <div>
                <h5 className="text-gray-900">Top Selling This Week</h5>
              </div>
            </div>

            {/* Top Menu Items This Week */}
            <div className="space-y-fluid-3">
              {topMenuItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-fluid-8">
                  <Package className="w-fluid-8 h-fluid-8 text-gray-300 mb-fluid-3" />
                  <p className="text-gray-500 text-fluid-sm text-center">
                    No menu items sold this week
                  </p>
                </div>
              ) : (
                <>
                  {topMenuItems.slice(0, 5).map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-fluid-3 transition-colors"
                      style={{ borderRadius: fluidSize(12) }}
                    >
                      <div className="flex items-center gap-fluid-3">
                        <div
                          className={cn(
                            "flex items-center justify-center w-fluid-8 h-fluid-8 rounded-full font-bold text-fluid-xs",
                            index === 0
                              ? "bg-yellow-100 text-yellow-600"
                              : index === 1
                                ? "bg-gray-100 text-gray-600"
                                : index === 2
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-purple-100 text-purple-600",
                          )}
                        >
                          {index === 0 ? (
                            <Star className="w-fluid-4 h-fluid-4" />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <div className="" style={{ maxWidth: fluidSize(140) }}>
                          <p className="text-gray-900 font-semibold truncate">
                            {item.name}
                          </p>
                          <span className="text-gray-500 !text-fluid-sm">
                            {formatCurrency(item.avgPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Daily Summary Table */}
        <div
          className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-fluid-6"
          style={{ borderRadius: fluidSize(16) }}
        >
          {/* Header */}
          <div className="p-fluid-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 text-fluid-lg">Daily Summary</h4>
                <p className="text-gray-500 text-fluid-sm mt-fluid-1">
                  Detailed breakdown of each day&lsquo;s performance
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Day
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Date
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Orders
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Items Sold
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {dailyStats.map((stat, index) => (
                  <tr
                    key={index}
                    className={cn(
                      "border-b border-gray-50 hover:bg-gray-50 transition-colors",
                      topDay && stat.date === topDay.date && "bg-purple-50",
                    )}
                  >
                    <td className="p-fluid-4">
                      <div className="flex items-center gap-fluid-2">
                        <span className="font-medium text-gray-900 text-fluid-sm">
                          {stat.day}
                        </span>
                        {topDay && stat.date === topDay.date && (
                          <span className="px-fluid-1.5 py-fluid-0.5 bg-yellow-100 text-yellow-700 rounded text-fluid-xs font-medium">
                            Top
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-fluid-4">
                      <span className="text-gray-600 text-fluid-sm">
                        {new Date(stat.date).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                    </td>
                    <td className="p-fluid-4">
                      <span className="text-gray-900 text-fluid-sm">
                        {stat.orders}
                      </span>
                    </td>
                    <td className="p-fluid-4">
                      <span className="text-gray-900 text-fluid-sm">
                        {stat.items}
                      </span>
                    </td>
                    <td className="p-fluid-4">
                      <span className="font-medium text-gray-900 text-fluid-sm">
                        {formatCurrency(stat.revenue)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}