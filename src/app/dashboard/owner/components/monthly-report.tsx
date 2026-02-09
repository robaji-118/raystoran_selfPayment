/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
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
  ArcElement
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
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  customerNotes?: string;
  createdAt: string;
}

interface MonthlyTotals {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  completedOrders: number;
  uniqueCustomers: number;
  cancelledOrders: number;
}

interface WeeklyStat {
  week: string;
  orders: number;
  revenue: number;
  items: number;
}

interface TopMenuItem {
  name: string;
  quantity: number;
  revenue: number;
}

export default function MonthlyReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    uniqueCustomers: 0,
    cancelledOrders: 0
  });
  const [topMenuItems, setTopMenuItems] = useState<TopMenuItem[]>([]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    fetchMonthlyOrders();
  }, [selectedMonth]);

  const fetchMonthlyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();

      if (data.success) {
        const filtered = data.data.filter((order: Order) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === selectedMonth.month &&
            orderDate.getFullYear() === selectedMonth.year;
        });

        setOrders(filtered);
        calculateStats(filtered);
        calculateWeeklyStats(filtered);
        findTopMenuItems(filtered);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: Order[]) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = orderList.reduce((sum, order) =>
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const completedOrders = orderList.filter(o => o.orderStatus === 'completed').length;
    const cancelledOrders = orderList.filter(o => o.orderStatus === 'cancelled').length;
    const uniqueCustomers = new Set(orderList.map(o => o.customerName)).size;

    setMonthlyTotals({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      uniqueCustomers,
      cancelledOrders
    });
  };

  const calculateWeeklyStats = (orderList: Order[]) => {
    const weeks: WeeklyStat[] = [];
    const startDate = new Date(selectedMonth.year, selectedMonth.month, 1);
    const endDate = new Date(selectedMonth.year, selectedMonth.month + 1, 0);

    const currentWeekStart = new Date(startDate);
    let weekNumber = 1;

    while (currentWeekStart <= endDate) {
      const weekEnd = new Date(currentWeekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const weekOrders = orderList.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= currentWeekStart && orderDate <= (weekEnd > endDate ? endDate : weekEnd);
      });

      const revenue = weekOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const items = weekOrders.reduce((sum, order) =>
        sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
      );

      weeks.push({
        week: `Week ${weekNumber}`,
        orders: weekOrders.length,
        revenue,
        items
      });

      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }

    setWeeklyStats(weeks);
  };

  const findTopMenuItems = (orderList: Order[]) => {
    const menuStats: Record<string, TopMenuItem> = {};

    orderList.forEach(order => {
      order.items.forEach(item => {
        if (!menuStats[item.menuItemName]) {
          menuStats[item.menuItemName] = {
            name: item.menuItemName,
            quantity: 0,
            revenue: 0
          };
        }
        menuStats[item.menuItemName].quantity += item.quantity;
        menuStats[item.menuItemName].revenue += item.subtotal;
      });
    });

    const sorted = Object.values(menuStats)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    setTopMenuItems(sorted);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handlePreviousMonth = () => {
    setSelectedMonth(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const handleNextMonth = () => {
    const now = new Date();
    const isCurrentMonth = selectedMonth.month === now.getMonth() &&
      selectedMonth.year === now.getFullYear();

    if (!isCurrentMonth) {
      setSelectedMonth(prev => {
        if (prev.month === 11) {
          return { month: 0, year: prev.year + 1 };
        }
        return { month: prev.month + 1, year: prev.year };
      });
    }
  };

  // Chart Data
  const weeklyChartData = {
    labels: weeklyStats.map(stat => stat.week),
    datasets: [
      {
        label: "Weekly Revenue",
        data: weeklyStats.map(stat => stat.revenue),
        borderColor: "#8B5CF6",
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#8B5CF6",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 4,
      },
      {
        label: "Weekly Orders",
        data: weeklyStats.map(stat => stat.orders),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#10B981",
        pointBorderColor: "#FFFFFF",
        pointBorderWidth: 2,
        pointRadius: 4,
        yAxisID: 'y1',
      }
    ],
  };

  const topItemsChartData = {
    labels: topMenuItems.map(item => item.name),
    datasets: [
      {
        label: "Revenue",
        data: topMenuItems.map(item => item.revenue),
        backgroundColor: "#8B5CF6",
        borderRadius: 4,
        borderWidth: 1,
        barPercentage: 0.7,
      },
      {
        label: "Quantity",
        data: topMenuItems.map(item => item.quantity),
        backgroundColor: "#10B981",
        borderRadius: 4,
        borderWidth: 1,
        barPercentage: 0.7,
        yAxisID: 'y1',
      }
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: "#6B7280",
          font: {
            size: Math.max(10, window.innerWidth * 0.00694),
          },
          padding: Math.max(12, window.innerWidth * 0.01389),
          usePointStyle: true,
          pointStyle: 'circle',
        }
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        titleColor: "#1F2937",
        bodyColor: "#1F2937",
        borderColor: "#E5E7EB",
        borderWidth: 1,
        padding: Math.max(8, window.innerWidth * 0.00833),
        boxPadding: Math.max(3, window.innerWidth * 0.00417),
        usePointStyle: true,
        bodyFont: {
          size: Math.max(10, window.innerWidth * 0.00694),
        },
        titleFont: {
          size: Math.max(10, window.innerWidth * 0.00694),
        },
        callbacks: {
          label: function (context: any) {
            if (context.dataset.label?.includes('Revenue')) {
              return `Rp ${context.parsed.y.toLocaleString('id-ID')}`;
            }
            return `${context.parsed.y} ${context.dataset.label?.includes('Quantity') ? 'items' : 'orders'}`;
          }
        }
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: true,
        grid: {
          color: "rgba(229, 231, 235, 0.5)",
          drawTicks: false,
          offset: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: Math.max(10, window.innerWidth * 0.00694),
          },
          padding: Math.max(8, window.innerWidth * 0.00833),
          callback: function (value: any) {
            return `Rp ${Number(value).toLocaleString('id-ID')}`;
          },
        },
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        beginAtZero: true,
        grid: {
          drawOnChartArea: false,
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: Math.max(10, window.innerWidth * 0.00694),
          },
          padding: Math.max(8, window.innerWidth * 0.00833),
        },
      },
      x: {
        grid: {
          display: false,
          drawTicks: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            size: Math.max(10, window.innerWidth * 0.00694),
          },
          padding: Math.max(8, window.innerWidth * 0.00833),
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
      mode: 'index' as const,
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-gray-500 text-fluid-base">Loading monthly report...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Header with Month Navigation */}
        <div className="bg-white mb-fluid-6" style={{ borderRadius: fluidSize(16) }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center bg-white border border-gray-200 rounded-lg">
              <button
                onClick={handlePreviousMonth}
                className="p-fluid-2 text-gray-600 hover:bg-gray-50 rounded-l-lg transition-colors"
              >
                <ChevronLeft className="w-fluid-5 h-fluid-5" />
              </button>
              <div className="px-fluid-4 py-fluid-2 text-center" style={{ minWidth: fluidSize(160) }}>
                <span className="font-medium text-gray-900 text-fluid-base">
                  {months[selectedMonth.month]} {selectedMonth.year}
                </span>
              </div>
              <button
                onClick={handleNextMonth}
                disabled={selectedMonth.month === new Date().getMonth() && selectedMonth.year === new Date().getFullYear()}
                className={cn(
                  "p-fluid-2 rounded-r-lg transition-colors",
                  selectedMonth.month === new Date().getMonth() && selectedMonth.year === new Date().getFullYear()
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <ChevronRight className="w-fluid-5 h-fluid-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-fluid-4 mb-fluid-6">
          {/* Total Orders */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Orders</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {monthlyTotals.totalOrders}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <div className="flex items-center text-green-600 text-fluid-sm">
                <TrendingUp className="w-fluid-4 h-fluid-4 mr-fluid-1" />
                <span className="font-medium">
                  {monthlyTotals.completedOrders} completed
                </span>
              </div>
              <span className="text-gray-400 text-fluid-sm">{monthlyTotals.cancelledOrders} cancelled</span>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Revenue</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {formatCurrency(monthlyTotals.totalRevenue)}
                </h4>
              </div>
            </div>
          </div>

          {/* Total Items */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Items</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {monthlyTotals.totalItems}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <div className="flex items-center text-gray-600 text-fluid-sm">
                <Users className="w-fluid-4 h-fluid-4 mr-fluid-1" />
                <span className="font-medium">
                  {monthlyTotals.uniqueCustomers} customers
                </span>
              </div>
            </div>
          </div>

          {/* Success Rate */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Success Rate</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {monthlyTotals.totalOrders > 0
                    ? `${Math.round((monthlyTotals.completedOrders / monthlyTotals.totalOrders) * 100)}%`
                    : "0%"}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <span className="text-gray-400 text-fluid-sm">
                {monthlyTotals.completedOrders} of {monthlyTotals.totalOrders} orders
              </span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Weekly Performance Chart */}
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-gray-900 text-lg font-semibold">Weekly Performance</h4>
              </div>
            </div>
            <div className="h-64">
              <Line
                data={weeklyChartData}
                options={chartOptions}
              />
            </div>
          </div>

          {/* Top Menu Items Chart */}
          <div className="bg-white p-6 shadow-sm border border-gray-100 rounded-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-gray-900 text-lg font-semibold">Top Menu Items</h4>
              </div>
            </div>
            <div className="h-64">
              {topMenuItems.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No data available</p>
                </div>
              ) : (
                <Bar
                  data={topItemsChartData}
                  options={chartOptions}
                />
              )}
            </div>
          </div>
        </div>

        {/* Top Menu Items List */}
        <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
          <div className="flex items-center justify-between mb-fluid-6">
            <div>
              <h4 className="text-gray-900 text-fluid-lg font-semibold">Top Selling Items</h4>
              <p className="text-gray-500 text-fluid-sm mt-fluid-1">Most popular menu items by quantity sold</p>
            </div>
          </div>

          {topMenuItems.length === 0 ? (
            <div className="flex items-center justify-center py-fluid-12">
              <p className="text-gray-500 text-fluid-base">No data available</p>
            </div>
          ) : (
            <div className="space-y-fluid-3">
              {topMenuItems.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-fluid-3 rounded-lg transition-colors">
                  <div className="flex items-center gap-fluid-3">
                    <div className={cn(
                      "flex items-center justify-center w-fluid-8 h-fluid-8 rounded-full font-bold text-fluid-sm",
                      index === 0 ? "bg-yellow-100 text-yellow-600" :
                        index === 1 ? "bg-gray-100 text-gray-600" :
                          index === 2 ? "bg-orange-100 text-orange-600" :
                            "bg-purple-100 text-purple-600"
                    )}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-gray-900 font-semibold text-fluid-base">{item.name}</p>
                      <span className="text-gray-500 text-fluid-sm">{item.quantity} sold</span>
                    </div>
                  </div>
                  <span className="text-gray-900 font-bold text-fluid-base">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}