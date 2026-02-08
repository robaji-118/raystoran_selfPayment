/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  ShoppingCart,
  TrendingUp,
  DollarSign,
  FileDown,
  SlidersHorizontal,
  ChevronRight,
  ChevronLeft,
  Search,
  Filter,
  Eye,
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  RefreshCw,
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
import { fluidSize } from "@/lib/utils";

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

// Define types for Order
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

interface StatusOption {
  value: string;
  label: string;
  color: string;
}

interface PaymentStatusOption {
  value: string;
  label: string;
}

export default function AdminAllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const PAGE_SIZE_OPTIONS = [10, 25, 50];

  const statusOptions: StatusOption[] = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmed', color: 'blue' },
    { value: 'preparing', label: 'Preparing', color: 'purple' },
    { value: 'ready', label: 'Ready', color: 'green' },
    { value: 'completed', label: 'Completed', color: 'gray' },
    { value: 'cancelled', label: 'Cancelled', color: 'red' }
  ];

  const paymentStatusOptions: PaymentStatusOption[] = [
    { value: 'all', label: 'All Payment' },
    { value: 'paid', label: 'Paid' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' }
  ];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, selectedStatus, selectedPaymentStatus, searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedStatus, selectedPaymentStatus, searchQuery, pageSize]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      if (data.success) {
        setOrders(data.data);
        setFilteredOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.orderStatus === selectedStatus);
    }

    if (selectedPaymentStatus !== 'all') {
      filtered = filtered.filter(order => order.paymentStatus === selectedPaymentStatus);
    }

    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.tableNumber.toString().includes(searchQuery)
      );
    }

    setFilteredOrders(filtered);
  };

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + pageSize);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: Order['orderStatus']) => {
    const config: Record<Order['orderStatus'], string> = {
      pending: 'bg-yellow-100 text-yellow-800 text-fluid-xs',
      confirmed: 'bg-blue-100 text-blue-800 text-fluid-xs',
      preparing: 'bg-purple-100 text-purple-800 text-fluid-xs',
      ready: 'bg-green-100 text-green-800 text-fluid-xs',
      completed: 'bg-gray-100 text-gray-800 text-fluid-xs',
      cancelled: 'bg-red-100 text-red-800 text-fluid-xs'
    };
    
    return config[status] || 'bg-gray-100 text-gray-800 text-fluid-xs';
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const config: Record<Order['paymentStatus'], string> = {
      paid: 'bg-green-100 text-green-800 text-fluid-xs',
      pending: 'bg-yellow-100 text-yellow-800 text-fluid-xs',
      failed: 'bg-red-100 text-red-800 text-fluid-xs'
    };
    
    return config[status] || 'bg-gray-100 text-gray-800 text-fluid-xs';
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  const handleExport = () => {
    const csvContent = [
      ['Order Number', 'Date', 'Time', 'Customer', 'Table', 'Status', 'Payment', 'Total'],
      ...filteredOrders.map(order => [
        order.orderNumber,
        formatDate(order.createdAt),
        formatTime(order.createdAt),
        order.customerName,
        `Table ${order.tableNumber}`,
        order.orderStatus,
        order.paymentStatus,
        order.totalAmount
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-neutral-500 text-fluid-base">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Stats Summary - Styling sama dengan dashboard */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-fluid-4 mb-fluid-4">
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <p className="text-gray-500 text-fluid-sm font-medium">Total</p>
            <p className="text-gray-900 font-bold text-fluid-2xl mt-fluid-1">{orders.length}</p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <p className="text-gray-500 text-fluid-sm font-medium">Completed</p>
            <p className="text-green-600 font-bold text-fluid-2xl mt-fluid-1">
              {orders.filter(o => o.orderStatus === 'completed').length}
            </p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <p className="text-gray-500 text-fluid-sm font-medium">In Progress</p>
            <p className="text-purple-600 font-bold text-fluid-2xl mt-fluid-1">
              {orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.orderStatus)).length}
            </p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <p className="text-gray-500 text-fluid-sm font-medium">Cancelled</p>
            <p className="text-red-600 font-bold text-fluid-2xl mt-fluid-1">
              {orders.filter(o => o.orderStatus === 'cancelled').length}
            </p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
            <p className="text-gray-500 text-fluid-sm font-medium">Total Revenue</p>
            <p className="text-gray-900 font-bold text-fluid-2xl mt-fluid-1">
              {formatCurrency(orders.reduce((sum, order) => sum + order.totalAmount, 0))}
            </p>
          </div>
        </div>

        {/* Filters and Search - Styling sama dengan dashboard */}
          <div className="flex flex-col md:flex-row gap-fluid-4 items-center justify-between mb-fluid-6">
            {/* Search */}
            <div className="relative flex-1 w-full md:w-auto">
              <Search className="absolute left-fluid-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-fluid-4 h-fluid-4" />
              <input
                type="text"
                placeholder="Search by order number, customer, or table..."
                className="w-full pl-fluid-10 pr-fluid-4 py-fluid-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-fluid-base"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-fluid-2">
              <select
                className="px-fluid-4 py-fluid-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-fluid-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Payment Filter */}
              <select
                className="px-fluid-4 py-fluid-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-fluid-sm"
                value={selectedPaymentStatus}
                onChange={(e) => setSelectedPaymentStatus(e.target.value)}
              >
                {paymentStatusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Refresh Button */}
              <button
                onClick={fetchOrders}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
              >
                <RefreshCw className="w-fluid-4 h-fluid-4" />
                <span className="text-fluid-sm">Refresh</span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <FileDown className="w-fluid-4 h-fluid-4" />
                <span className="text-fluid-sm">Export</span>
              </button>
            </div>
          </div>

        {/* Orders Table - Styling sama dengan dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{borderRadius: fluidSize(16)}}>
          {/* Header */}
          <div className="p-fluid-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-fluid-4">
              <div className="flex items-center gap-fluid-4">
                <h4 className="text-gray-900 text-fluid-lg font-medium">All Orders</h4>
                <span className="text-gray-500 text-fluid-sm">
                  {filteredOrders.length} orders found
                </span>
              </div>
              <div className="flex items-center gap-fluid-2">
                <span className="text-gray-600 text-fluid-sm whitespace-nowrap">Per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-fluid-3 py-fluid-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-fluid-sm"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Order
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Date & Time
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Customer
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Table
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Items
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Status
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Payment
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Total
                  </th>
                  <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-fluid-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="w-fluid-16 h-fluid-16 text-gray-300 mb-fluid-4" />
                        <p className="text-gray-500 mb-fluid-2 text-fluid-lg">
                          No orders found
                        </p>
                        <p className="text-gray-400 text-fluid-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
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
                        <div className="text-gray-900 text-fluid-sm">{formatDate(order.createdAt)}</div>
                        <div className="text-gray-500 text-fluid-xs">{formatTime(order.createdAt)}</div>
                      </td>
                      <td className="p-fluid-4">
                        <div>
                          <div className="font-medium text-gray-900 text-fluid-sm">{order.customerName}</div>
                          {order.customerPhone && (
                            <div className="text-gray-500 text-fluid-xs">{order.customerPhone}</div>
                          )}
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-900 text-fluid-sm">Table {order.tableNumber}</span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">{order.items?.length || 0} items</span>
                      </td>
                      <td className="p-fluid-4">
                        <span
                          className={cn(
                            "px-fluid-3 py-fluid-1 rounded-full font-medium text-fluid-xs",
                            getStatusBadge(order.orderStatus)
                          )}
                        >
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex flex-col gap-fluid-1 text-center">
                          <span
                            className={cn(
                              "px-fluid-2 py-fluid-1 rounded-full font-medium text-fluid-xs",
                              getPaymentStatusBadge(order.paymentStatus)
                            )}
                          >
                            {order.paymentStatus}
                          </span>
                          <span className="text-gray-500 text-fluid-xs capitalize">{order.paymentMethod}</span>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="font-bold text-gray-900 text-fluid-sm">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-purple-600 hover:text-purple-800 font-medium text-fluid-sm flex items-center gap-fluid-1"
                        >
                          <Eye className="w-fluid-4 h-fluid-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrders.length > 0 && (
            <div className="p-fluid-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-fluid-4">
              <p className="text-gray-600 text-fluid-sm">
                Showing {startIndex + 1}–{Math.min(startIndex + pageSize, filteredOrders.length)} of {filteredOrders.length}
              </p>
              <div className="flex items-center gap-fluid-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-fluid-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="w-fluid-4 h-fluid-4" />
                </button>
                <span className="px-fluid-3 py-fluid-1 text-fluid-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-fluid-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  <ChevronRight className="w-fluid-4 h-fluid-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal - Styling yang konsisten */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
            
            <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" style={{borderRadius: fluidSize(16)}}>
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-100 px-fluid-6 py-fluid-4 flex items-center justify-between z-10">
                <div>
                  <h3 className="text-gray-900 font-bold text-fluid-xl">Order Details</h3>
                  <p className="text-gray-600 text-fluid-sm mt-fluid-1">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-fluid-6 h-fluid-6" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-fluid-6 space-y-fluid-6">
                {/* Order Info Grid */}
                <div className="grid grid-cols-2 gap-fluid-4">
                  <div className="flex items-start gap-fluid-3">
                    <Calendar className="w-fluid-5 h-fluid-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-fluid-xs">Date</p>
                      <p className="text-gray-900 font-medium text-fluid-sm">{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-fluid-3">
                    <Clock className="w-fluid-5 h-fluid-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-fluid-xs">Time</p>
                      <p className="text-gray-900 font-medium text-fluid-sm">{formatTime(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-fluid-3">
                    <User className="w-fluid-5 h-fluid-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-fluid-xs">Customer</p>
                      <p className="text-gray-900 font-medium text-fluid-sm">{selectedOrder.customerName}</p>
                      {selectedOrder.customerPhone && (
                        <p className="text-gray-600 text-fluid-xs">{selectedOrder.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-fluid-3">
                    <MapPin className="w-fluid-5 h-fluid-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-gray-500 text-fluid-xs">Table</p>
                      <p className="text-gray-900 font-medium text-fluid-sm">Table {selectedOrder.tableNumber}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Payment */}
                <div className="flex gap-fluid-4">
                  <div className="flex-1 bg-gray-50 p-fluid-4 rounded-lg" style={{borderRadius: fluidSize(12)}}>
                    <p className="text-gray-500 text-fluid-xs mb-fluid-2">Order Status</p>
                    <span className={cn(
                      "px-fluid-3 py-fluid-1 inline-flex font-semibold rounded-full border text-fluid-sm",
                      getStatusBadge(selectedOrder.orderStatus)
                    )}>
                      {selectedOrder.orderStatus}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-50 p-fluid-4 rounded-lg" style={{borderRadius: fluidSize(12)}}>
                    <p className="text-gray-500 text-fluid-xs mb-fluid-2">Payment Status</p>
                    <div className="flex items-center gap-fluid-2">
                      <span className={cn(
                        "px-fluid-3 py-fluid-1 inline-flex font-semibold rounded-full text-fluid-sm",
                        getPaymentStatusBadge(selectedOrder.paymentStatus)
                      )}>
                        {selectedOrder.paymentStatus}
                      </span>
                      <span className="text-gray-600 text-fluid-xs capitalize">({selectedOrder.paymentMethod})</span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h4 className="font-semibold text-gray-900 text-fluid-base mb-fluid-3">Order Items</h4>
                  <div className="space-y-fluid-2">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex justify-between items-start p-fluid-3 bg-gray-50 rounded-lg" style={{borderRadius: fluidSize(12)}}>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-fluid-sm">{item.menuItemName}</p>
                          {item.notes && (
                            <p className="text-gray-600 text-fluid-xs mt-fluid-1">Note: {item.notes}</p>
                          )}
                          <p className="text-gray-600 text-fluid-sm mt-fluid-1">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-gray-900 text-fluid-sm">{formatCurrency(item.subtotal)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t border-gray-100 pt-fluid-4 space-y-fluid-2">
                  <div className="flex justify-between text-fluid-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.tax > 0 && (
                    <div className="flex justify-between text-fluid-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-900">{formatCurrency(selectedOrder.tax)}</span>
                    </div>
                  )}
                  {selectedOrder.serviceCharge > 0 && (
                    <div className="flex justify-between text-fluid-sm">
                      <span className="text-gray-600">Service Charge</span>
                      <span className="text-gray-900">{formatCurrency(selectedOrder.serviceCharge)}</span>
                    </div>
                  )}
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-fluid-sm">
                      <span className="text-gray-600">Discount</span>
                      <span className="text-red-600">-{formatCurrency(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-fluid-lg font-bold border-t border-gray-100 pt-fluid-2 mt-fluid-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                {/* Customer Notes */}
                {selectedOrder.customerNotes && (
                  <div className="bg-blue-50 p-fluid-4 rounded-lg border border-blue-200" style={{borderRadius: fluidSize(12)}}>
                    <p className="text-blue-600 font-medium text-fluid-xs mb-fluid-1">Customer Notes</p>
                    <p className="text-gray-900 text-fluid-sm">{selectedOrder.customerNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}