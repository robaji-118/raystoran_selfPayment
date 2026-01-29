/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Calendar, DollarSign, ShoppingCart, TrendingUp, Users, Package, Clock, AlertCircle, FileDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";

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
  orderStatus: 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentStatus: 'paid';
  paymentMethod: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  customerNotes?: string;
  createdAt: string;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  avgOrderValue: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  uniqueCustomers: number;
}

export default function AdminDailyReport() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<Stats>({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    pendingOrders: 0,
    uniqueCustomers: 0
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
        const filtered = data.data.filter((order: Order) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === selectedDate;
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

  const calculateStats = (orderList: Order[]) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = orderList.reduce((sum, order) => 
      sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
    );
    const completedOrders = orderList.filter(o => o.orderStatus === 'completed').length;
    const cancelledOrders = orderList.filter(o => o.orderStatus === 'cancelled').length;
    const pendingOrders = orderList.filter(o => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(o.orderStatus)
    ).length;
    const uniqueCustomers = new Set(orderList.map(o => o.customerName)).size;
    
    setStats({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      cancelledOrders,
      pendingOrders,
      uniqueCustomers
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    const statusConfig: Record<Order['orderStatus'], string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-purple-100 text-purple-800',
      ready: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    
    return statusConfig[status] || 'bg-gray-100 text-gray-800';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (dateString: string) => {
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-fluid-12">
        <div className="w-fluid-16 h-fluid-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-fluid-4"></div>
        <p className="text-gray-500 text-fluid-base">Loading daily report...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-fluid-4 mb-fluid-6">
          {/* Total Orders */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Orders</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {stats.totalOrders}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <div className="flex items-center text-green-600 text-fluid-sm">
                <TrendingUp className="w-fluid-4 h-fluid-4 mr-fluid-1" />
                <span className="font-medium">
                  {stats.completedOrders} completed
                </span>
              </div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Revenue</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {formatCurrency(stats.totalRevenue)}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <span className="text-gray-400 text-fluid-sm">Avg: {formatCurrency(stats.avgOrderValue)}</span>
            </div>
          </div>

          {/* Total Items */}
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <div className="flex items-start justify-between mb-fluid-4">
              <div>
                <p className="text-gray-500 mb-fluid-1 text-fluid-base">Total Items</p>
                <h4 className="font-bold text-gray-900 text-fluid-2xl">
                  {stats.totalItems}
                </h4>
              </div>
            </div>
            <div className="flex items-center gap-fluid-2">
              <div className="flex items-center text-gray-600 text-fluid-sm">
                <Users className="w-fluid-4 h-fluid-4 mr-fluid-1" />
                <span className="font-medium">
                  {stats.uniqueCustomers} customers
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
          {/* Header */}
          <div className="p-fluid-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-gray-900 text-fluid-lg">Today&lsquo;s Orders</h4>
              </div>
              <div className="flex items-center gap-fluid-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-fluid-3 py-fluid-2 bg-white border border-gray-200 rounded-lg text-fluid-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
                <button className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <FileDown className="w-fluid-4 h-fluid-4" />
                  <span className="text-fluid-sm">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {orders.length === 0 ? (
              <div className="p-fluid-12 text-center">
                <div className="flex flex-col items-center">
                  <ShoppingCart className="w-fluid-16 h-fluid-16 text-gray-300 mb-fluid-4" />
                  <p className="text-gray-500 mb-fluid-2 text-fluid-lg">No orders found for this date</p>
                  <p className="text-gray-400 text-fluid-sm">Orders will appear here once created</p>
                </div>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Order #</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Time</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Customer</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Table</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Items</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Status</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Payment</th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr
                      key={order._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-fluid-4">
                        <span className="font-medium text-gray-900 block text-fluid-sm">
                          {order.orderNumber}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">
                          {formatTime(order.createdAt)}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div>
                          <span className="font-medium text-gray-900 block text-fluid-sm">
                            {order.customerName}
                          </span>
                          {order.customerPhone && (
                            <span className="text-gray-500 text-fluid-xs">
                              {order.customerPhone}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-700 text-fluid-sm">
                          Table {order.tableNumber}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">
                          {order.items.length} items
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span
                          className={cn(
                            "px-fluid-2 py-fluid-1 rounded-full font-medium !text-fluid-xs",
                            getStatusBadge(order.orderStatus)
                          )}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm capitalize">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="font-medium text-gray-900 text-fluid-sm">
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
    </div>
  );
}