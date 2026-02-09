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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  customerEmail?: string;
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
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-100',
      preparing: 'bg-purple-50 text-purple-700 border-purple-100',
      ready: 'bg-green-50 text-green-700 border-green-100',
      completed: 'bg-gray-50 text-gray-700 border-gray-100',
      cancelled: 'bg-red-50 text-red-700 border-red-100'
    };

    return config[status] || 'bg-gray-50 text-gray-700 border-gray-100';
  };

  const getPaymentStatusBadge = (status: Order['paymentStatus']) => {
    const config: Record<Order['paymentStatus'], string> = {
      paid: 'bg-green-50 text-green-700 border-green-100',
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-100',
      failed: 'bg-red-50 text-red-700 border-red-100'
    };

    return config[status] || 'bg-gray-50 text-gray-700 border-gray-100';
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
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <p className="text-gray-500 text-fluid-sm font-medium">Total</p>
            <p className="text-gray-900 font-bold text-fluid-2xl mt-fluid-1">{orders.length}</p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <p className="text-gray-500 text-fluid-sm font-medium">Completed</p>
            <p className="text-green-600 font-bold text-fluid-2xl mt-fluid-1">
              {orders.filter(o => o.orderStatus === 'completed').length}
            </p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <p className="text-gray-500 text-fluid-sm font-medium">In Progress</p>
            <p className="text-purple-600 font-bold text-fluid-2xl mt-fluid-1">
              {orders.filter(o => ['confirmed', 'preparing', 'ready'].includes(o.orderStatus)).length}
            </p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
            <p className="text-gray-500 text-fluid-sm font-medium">Cancelled</p>
            <p className="text-red-600 font-bold text-fluid-2xl mt-fluid-1">
              {orders.filter(o => o.orderStatus === 'cancelled').length}
            </p>
          </div>
          <div className="bg-white p-fluid-6 shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
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
              className="w-full pl-fluid-10 pr-fluid-4 py-fluid-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-fluid-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-fluid-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px] border-gray-200 focus:ring-black focus:border-black text-fluid-sm">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Payment Filter */}
            <Select value={selectedPaymentStatus} onValueChange={setSelectedPaymentStatus}>
              <SelectTrigger className="w-[180px] border-gray-200 focus:ring-black focus:border-black text-fluid-sm">
                <SelectValue placeholder="Filter by payment" />
              </SelectTrigger>
              <SelectContent>
                {paymentStatusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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
              className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors"
            >
              <FileDown className="w-fluid-4 h-fluid-4" />
              <span className="text-fluid-sm">Export</span>
            </button>
          </div>
        </div>

        {/* Orders Table - Styling sama dengan dashboard */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100" style={{ borderRadius: fluidSize(16) }}>
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
                <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                  <SelectTrigger className="w-[100px] border-gray-200 focus:ring-black focus:border-black text-fluid-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <SelectItem key={size} value={size.toString()}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Order Info
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-12 text-center">
                      <div className="flex flex-col items-center">
                        <FileText className="w-16 h-16 text-gray-300 mb-4" />
                        <p className="text-gray-500 mb-2 text-lg font-medium">
                          No orders found
                        </p>
                        <p className="text-gray-400 text-sm">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginatedOrders.map((order) => (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50/80 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900">
                            {order.orderNumber}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {order.customerName}
                          </span>
                        </div>
                        {order.customerPhone && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            {order.customerPhone}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                          <MapPin className="w-3 h-3" />
                          Table {order.tableNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{order.items?.length || 0} items</span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={cn(
                            "px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border",
                            getStatusBadge(order.orderStatus)
                          )}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span
                            className={cn(
                              "px-2.5 py-1 inline-flex text-xs font-semibold rounded-full border w-fit",
                              getPaymentStatusBadge(order.paymentStatus)
                            )}
                          >
                            {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                          </span>
                          <span className="text-xs text-gray-500 capitalize ml-1">
                            {order.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all border border-transparent hover:border-purple-100"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Order Details
                </h3>
                <p className="text-sm text-gray-500">
                  Transaction ID:{" "}
                  <span className="font-mono text-gray-700">
                    {selectedOrder.orderNumber}
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 bg-white rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors border border-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Order Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-4 h-4 text-purple-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Customer
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm ml-6">
                    {selectedOrder.customerName}
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-xs text-gray-500 ml-6">
                      {selectedOrder.customerEmail}
                    </p>
                  )}
                  {selectedOrder.customerPhone && (
                    <p className="text-xs text-gray-500 ml-6">
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Location
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm ml-6">
                    Table {selectedOrder.tableNumber}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Date
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm ml-6">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-green-500" />
                    <span className="text-xs font-semibold text-gray-500 uppercase">
                      Time
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm ml-6">
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" /> Order Summary
                </h4>
                <div className="border border-gray-100 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-medium">
                      <tr>
                        <th className="px-4 py-2 text-left">Item</th>
                        <th className="px-4 py-2 text-center">Qty</th>
                        <th className="px-4 py-2 text-right">Price</th>
                        <th className="px-4 py-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items?.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-4 py-3 text-gray-900 font-medium">
                            {item.menuItemName}
                            {item.notes && (
                              <p className="text-xs text-gray-500 font-normal italic mt-0.5">
                                "{item.notes}"
                              </p>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center text-gray-600">
                            x{item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-900 font-medium">
                            {formatCurrency(item.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span>{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {selectedOrder.serviceCharge > 0 && (
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service Charge (5%)</span>
                    <span>{formatCurrency(selectedOrder.serviceCharge)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-2 pt-2 flex justify-between text-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-purple-600">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.customerNotes && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <p className="text-blue-700 font-medium text-xs mb-1">
                    Customer Notes
                  </p>
                  <p className="text-gray-900 text-sm">
                    {selectedOrder.customerNotes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}