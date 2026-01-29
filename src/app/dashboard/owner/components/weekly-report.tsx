/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Calendar, DollarSign, ShoppingCart, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

export default function WeeklyReport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState(getWeekDates(new Date()));
  const [dailyStats, setDailyStats] = useState<{ day: string; date: string; orders: number; revenue: any; }[]>([]);
  const [weeklyTotals, setWeeklyTotals] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0
  });

  function getWeekDates(date: string | number | Date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    
    return {
      start: monday.toISOString().split('T')[0],
      end: sunday.toISOString().split('T')[0]
    };
  }

  useEffect(() => {
    fetchWeeklyOrders();
  }, [selectedWeek]);

  const fetchWeeklyOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        const filtered = data.data.filter((order: { createdAt: string | number | Date; }) => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate >= selectedWeek.start && orderDate <= selectedWeek.end;
        });
        
        setOrders(filtered);
        calculateStats(filtered);
        calculateDailyStats(filtered);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: { length: any; reduce: (arg0: { (sum: any, order: any): any; (sum: any, order: any): any; }, arg1: number) => any; filter: (arg0: (o: any) => boolean) => { (): any; new(): any; length: any; }; }) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = orderList.reduce((sum, order) => 
      sum + order.items.reduce((itemSum: any, item: { quantity: any; }) => itemSum + item.quantity, 0), 0
    );
    const completedOrders = orderList.filter(o => o.orderStatus === 'completed').length;
    
    setWeeklyTotals({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders
    });
  };

  const calculateDailyStats = (orderList: any[]) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const stats = [];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(selectedWeek.start);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayOrders = orderList.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        return orderDate === dateStr;
      });
      
      const revenue = dayOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      stats.push({
        day: days[i],
        date: dateStr,
        orders: dayOrders.length,
        revenue: revenue
      });
    }
    
    setDailyStats(stats);
  };

  const formatCurrency = (amount: string | number | bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount));
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

  const maxRevenue = Math.max(...dailyStats.map(d => d.revenue), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Week Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Weekly Report</h2>
          <p className="text-gray-600 mt-1">
            {new Date(selectedWeek.start).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(selectedWeek.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousWeek}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium"
          >
            Previous
          </button>
          <button
            onClick={handleNextWeek}
            disabled={new Date(selectedWeek.end) >= new Date()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{weeklyTotals.totalOrders}</h3>
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {weeklyTotals.completedOrders} completed
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <ShoppingCart className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(weeklyTotals.totalRevenue)}</h3>
              <p className="text-gray-500 text-sm mt-2">This week</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Avg Order Value</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(weeklyTotals.avgOrderValue)}</h3>
              <p className="text-gray-500 text-sm mt-2">Per order</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Items</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{weeklyTotals.totalItems}</h3>
              <p className="text-gray-500 text-sm mt-2">Items sold</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Daily Breakdown Chart */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Breakdown</h3>
        
        <div className="space-y-4">
          {dailyStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{stat.day}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(stat.revenue)}</span>
                  <span className="text-xs text-gray-500 ml-2">({stat.orders} orders)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(stat.revenue / maxRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}