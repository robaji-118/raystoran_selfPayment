/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/owner/components/top-menus.tsx
"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Star } from "lucide-react";

interface MenuItem {
  name: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

export default function TopMenus() {
  const [topMenus, setTopMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopMenus();
  }, []);

  const fetchTopMenus = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      if (data.success) {
        const menuCount: { [key: string]: MenuItem } = {};
        
        data.data.forEach((order: any) => {
          if (order.items) {
            order.items.forEach((item: any) => {
              const key = item.menuItemId || item.menuItemName;
              if (!menuCount[key]) {
                menuCount[key] = {
                  name: item.menuItemName,
                  count: 0,
                  revenue: 0,
                  avgPrice: item.price
                };
              }
              menuCount[key].count += item.quantity;
              menuCount[key].revenue += item.subtotal || (item.price * item.quantity);
            });
          }
        });

        const sorted = Object.values(menuCount)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopMenus(sorted);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <TrendingUp className="w-8 h-8" />
            <h1 className="text-2xl font-bold">Menu Terlaris</h1>
          </div>
          <p className="text-purple-100">Top performing menu items based on orders</p>
        </div>

        <div className="p-6">
          {topMenus.length > 0 ? (
            <div className="space-y-4">
              {topMenus.map((item, index) => (
                <div 
                  key={index} 
                  className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                    index === 0 
                      ? 'border-yellow-400 bg-yellow-50' 
                      : index === 1
                      ? 'border-gray-300 bg-gray-50'
                      : index === 2
                      ? 'border-orange-300 bg-orange-50'
                      : 'border-neutral-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold ${
                    index === 0 
                      ? 'bg-yellow-400 text-yellow-900' 
                      : index === 1
                      ? 'bg-gray-400 text-gray-900'
                      : index === 2
                      ? 'bg-orange-400 text-orange-900'
                      : 'bg-purple-100 text-purple-600'
                  }`}>
                    {index === 0 && <Star className="w-7 h-7 fill-current" />}
                    {index !== 0 && `#${index + 1}`}
                  </div>

                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-neutral-900">{item.name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-sm text-neutral-600">
                        {item.count} orders
                      </span>
                      <span className="text-sm text-neutral-400">•</span>
                      <span className="text-sm text-neutral-600">
                        Avg: Rp {item.avgPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-xl font-bold text-neutral-900">
                      Rp {item.revenue.toLocaleString('id-ID')}
                    </p>
                    <p className="text-sm text-neutral-500">Total Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-neutral-500">No menu data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// app/dashboard/owner/components/daily-report.tsx
export function DailyReport() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDailyOrders();
  }, []);

  const fetchDailyOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      if (data.success) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayOrders = data.data.filter((order: any) => {
          const orderDate = new Date(order.createdAt);
          orderDate.setHours(0, 0, 0, 0);
          return orderDate.getTime() === today.getTime();
        });

        setOrders(todayOrders);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">Daily Report</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-green-900">{orders.length}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-600 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-blue-900">
              Rp {totalRevenue.toLocaleString('id-ID')}
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">Average Order</p>
            <p className="text-3xl font-bold text-purple-900">
              Rp {orders.length > 0 ? (totalRevenue / orders.length).toFixed(0) : 0}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {orders.map((order, index) => (
            <div key={index} className="border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-neutral-900">{order.orderNumber}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleTimeString('id-ID')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-neutral-900">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </p>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                    order.orderStatus === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// app/dashboard/owner/components/weekly-report.tsx
export function WeeklyReport() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Weekly Report</h1>
        <p className="text-neutral-500">Weekly analytics and trends coming soon...</p>
      </div>
    </div>
  );
}

// app/dashboard/owner/components/monthly-report.tsx
export function MonthlyReport() {
  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-4">Monthly Report</h1>
        <p className="text-neutral-500">Monthly analytics and trends coming soon...</p>
      </div>
    </div>
  );
}

// app/dashboard/owner/components/all-orders.tsx
export function AllOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();

      if (data.success) {
        setOrders(data.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-6">
        <h1 className="text-2xl font-bold text-neutral-900 mb-6">All Orders</h1>
        
        <div className="space-y-4">
          {orders.map((order, index) => (
            <div key={index} className="border border-neutral-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-lg text-neutral-900">{order.orderNumber}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-neutral-900">
                    Rp {order.totalAmount.toLocaleString('id-ID')}
                  </p>
                  <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                    order.orderStatus === 'completed' 
                      ? 'bg-green-100 text-green-700'
                      : order.orderStatus === 'confirmed'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {order.orderStatus}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-neutral-600">
                <span>Table: {order.tableNumber}</span>
                <span>•</span>
                <span>{order.customerName}</span>
                <span>•</span>
                <span>{order.items?.length || 0} items</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}