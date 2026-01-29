/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { Calendar, DollarSign, ShoppingCart, TrendingUp, Package, Users, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MonthlyReport() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  const [weeklyStats, setWeeklyStats] = useState<{ week: string; orders: number; revenue: any }[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalItems: 0,
    avgOrderValue: 0,
    completedOrders: 0,
    uniqueCustomers: 0
  });
  const [topDays, setTopDays] = useState<{ date: string; revenue: number; orders: number }[]>([]);

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
        const filtered = data.data.filter((order: { createdAt: string | number | Date; }) => {
          const orderDate = new Date(order.createdAt);
          return orderDate.getMonth() === selectedMonth.month && 
                 orderDate.getFullYear() === selectedMonth.year;
        });
        
        setOrders(filtered);
        calculateStats(filtered);
        calculateWeeklyStats(filtered);
        findTopDays(filtered);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (orderList: { length: any; reduce: (arg0: { (sum: any, order: any): any; (sum: any, order: any): any; }, arg1: number) => any; filter: (arg0: (o: any) => boolean) => { (): any; new(): any; length: any; }; map: (arg0: (o: any) => any) => Iterable<unknown> | null | undefined; }) => {
    const totalOrders = orderList.length;
    const totalRevenue = orderList.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalItems = orderList.reduce((sum, order) => 
      sum + order.items.reduce((itemSum: any, item: { quantity: any; }) => itemSum + item.quantity, 0), 0
    );
    const completedOrders = orderList.filter(o => o.orderStatus === 'completed').length;
    const uniqueCustomers = new Set(orderList.map(o => o.customerName)).size;
    
    setMonthlyTotals({
      totalOrders,
      totalRevenue,
      totalItems,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      uniqueCustomers
    });
  };

  const calculateWeeklyStats = (orderList: any[]) => {
    const weeks = [];
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
      
      weeks.push({
        week: `Week ${weekNumber}`,
        orders: weekOrders.length,
        revenue: revenue
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      weekNumber++;
    }
    
    setWeeklyStats(weeks);
  };

  const findTopDays = (orderList: any[]) => {
    const dailyRevenue: Record<string, { date: string; revenue: number; orders: number }> = {};
    
    orderList.forEach((order: { createdAt: string | number | Date; totalAmount: any; }) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!dailyRevenue[date]) {
        dailyRevenue[date] = { date, revenue: 0, orders: 0 };
      }
      dailyRevenue[date].revenue += order.totalAmount;
      dailyRevenue[date].orders += 1;
    });
    
    const sorted = Object.values(dailyRevenue)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    setTopDays(sorted);
  };

  const formatCurrency = (amount: string | number | bigint) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(Number(amount));
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

  const maxRevenue = Math.max(...weeklyStats.map(w => w.revenue), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with Month Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Monthly Report</h2>
          <p className="text-gray-600 mt-1">{months[selectedMonth.month]} {selectedMonth.year}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreviousMonth}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>
          <button
            onClick={handleNextMonth}
            disabled={selectedMonth.month === new Date().getMonth() && 
                     selectedMonth.year === new Date().getFullYear()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Orders</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{monthlyTotals.totalOrders}</h3>
              <p className="text-green-600 text-sm mt-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                {monthlyTotals.completedOrders} completed
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
              <h3 className="text-2xl font-bold text-gray-900 mt-2">{formatCurrency(monthlyTotals.totalRevenue)}</h3>
              <p className="text-gray-500 text-sm mt-2">Avg: {formatCurrency(monthlyTotals.avgOrderValue)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Items</p>
              <h3 className="text-3xl font-bold text-gray-900 mt-2">{monthlyTotals.totalItems}</h3>
              <p className="text-gray-500 text-sm mt-2">{monthlyTotals.uniqueCustomers} unique customers</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Weekly Breakdown</h3>
        
        <div className="space-y-4">
          {weeklyStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{stat.week}</span>
                <div className="text-right">
                  <span className="text-sm font-semibold text-gray-900">{formatCurrency(stat.revenue)}</span>
                  <span className="text-xs text-gray-500 ml-2">({stat.orders} orders)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(stat.revenue / maxRevenue) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Days */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Performing Days</h3>
        
        {topDays.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No data available</p>
        ) : (
          <div className="space-y-3">
            {topDays.map((day, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {new Date(day.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                    <p className="text-xs text-gray-500">{day.orders} orders</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(day.revenue)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}