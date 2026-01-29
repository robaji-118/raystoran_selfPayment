/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/owner/components/owner-dashboard-main.tsx
"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users,
  ArrowUp,
  ArrowDown,
  Calendar
} from "lucide-react";

interface DashboardStats {
  todayRevenue: number;
  todayOrders: number;
  monthlyRevenue: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
}

export default function OwnerDashboardMain() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    totalCustomers: 0,
    revenueChange: 0,
    ordersChange: 0
  });
  const [loading, setLoading] = useState(true);
  const [topMenus, setTopMenus] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();

      if (ordersData.success) {
        const orders = ordersData.data;
        
        // Calculate today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        const todayRevenue = todayOrders.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0
        );

        // Calculate monthly stats
        const thisMonth = new Date().getMonth();
        const thisYear = new Date().getFullYear();
        
        const monthlyOrders = orders.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === thisMonth && 
                 orderDate.getFullYear() === thisYear;
        });

        const monthlyRevenue = monthlyOrders.reduce((sum: number, order: any) => 
          sum + (order.totalAmount || 0), 0
        );

        // Get unique customers
        const uniqueCustomers = new Set(orders.map((o: any) => o.customerId || o.customerName));

        // Calculate top selling items
        const menuCount: { [key: string]: { name: string; count: number; revenue: number } } = {};
        
        orders.forEach((order: any) => {
          if (order.items) {
            order.items.forEach((item: any) => {
              const key = item.menuItemId || item.menuItemName;
              if (!menuCount[key]) {
                menuCount[key] = {
                  name: item.menuItemName,
                  count: 0,
                  revenue: 0
                };
              }
              menuCount[key].count += item.quantity;
              menuCount[key].revenue += item.subtotal || (item.price * item.quantity);
            });
          }
        });

        const topItems = Object.values(menuCount)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setTopMenus(topItems);

        setStats({
          todayRevenue,
          todayOrders: todayOrders.length,
          monthlyRevenue,
          totalCustomers: uniqueCustomers.size,
          revenueChange: 12.5,
          ordersChange: 8.3
        });
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Revenue",
      value: `Rp ${stats.todayRevenue.toLocaleString('id-ID')}`,
      change: stats.revenueChange,
      icon: DollarSign,
      bgColor: "bg-green-500",
      textColor: "text-green-600",
      bgLight: "bg-green-50"
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders.toString(),
      change: stats.ordersChange,
      icon: ShoppingBag,
      bgColor: "bg-blue-500",
      textColor: "text-blue-600",
      bgLight: "bg-blue-50"
    },
    {
      title: "Monthly Revenue",
      value: `Rp ${stats.monthlyRevenue.toLocaleString('id-ID')}`,
      change: 15.2,
      icon: TrendingUp,
      bgColor: "bg-purple-500",
      textColor: "text-purple-600",
      bgLight: "bg-purple-50"
    },
    {
      title: "Total Customers",
      value: stats.totalCustomers.toString(),
      change: 5.4,
      icon: Users,
      bgColor: "bg-orange-500",
      textColor: "text-orange-600",
      bgLight: "bg-orange-50"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome Back, Owner!</h1>
            <p className="text-purple-100">Here&lsquo;s what&lsquo;s happening with your restaurant today</p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <Calendar className="w-5 h-5" />
            <span className="font-medium">
              {new Date().toLocaleDateString('id-ID', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 ${card.bgLight} rounded-lg flex items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.textColor}`} />
              </div>
              <div className={`flex items-center gap-1 text-sm font-medium ${
                card.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {card.change >= 0 ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                {Math.abs(card.change)}%
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-500 mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-neutral-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Top Selling Items</h2>
          <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            View All →
          </button>
        </div>
        
        {topMenus.length > 0 ? (
          <div className="space-y-4">
            {topMenus.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-neutral-900">{item.name}</p>
                    <p className="text-sm text-neutral-500">{item.count} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">
                    Rp {item.revenue.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-neutral-500">Total Revenue</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-neutral-500">No sales data available yet</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-2">View Reports</h3>
          <p className="text-purple-100 text-sm">Access detailed business reports</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-2">All Orders</h3>
          <p className="text-blue-100 text-sm">Monitor all restaurant orders</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white cursor-pointer hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold mb-2">Menu Analytics</h3>
          <p className="text-green-100 text-sm">Analyze menu performance</p>
        </div>
      </div>
    </div>
  );
}