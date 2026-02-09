/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/waiter/components/completed-deliveries-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  Package,
  Search,
  Calendar,
  TrendingUp,
  DollarSign,
  ChevronDown,
  ChevronUp,
  User,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface OrderItem {
  _id: string;
  menuItemName: string;
  quantity: number;
  price: number;
  notes: string | null;
}

interface Order {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  items: OrderItem[];
  orderStatus: string;
  totalAmount: number;
  completedAt: string | null;
  readyAt: string | null;
  deliveringAt: string | null;
  createdAt: string;
}

interface CompletedDeliveriesViewProps {
  userId: string;
}

// --- HELPER FUNCTIONS ---
const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getElapsedTime = (startTime: string, endTime: string): number => {
  const start = new Date(startTime);
  const end = new Date(endTime);
  const diff = Math.floor((end.getTime() - start.getTime()) / 1000 / 60);
  return diff;
};

// --- SUB-COMPONENT: ORDER CARD (Compact Header + Detailed Accordion) ---
const CompletedOrderCard = ({ order }: { order: Order }) => {
  const [isOpen, setIsOpen] = useState(false);

  const deliveryTime = order.deliveringAt && order.completedAt
    ? getElapsedTime(order.deliveringAt, order.completedAt)
    : 0;

  const totalTime = order.completedAt
    ? getElapsedTime(order.createdAt, order.completedAt)
    : 0;

  return (
    <div className="bg-white rounded-xl lg:rounded-[1.389vw] border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* 1. HEADER (Selalu Terlihat) - Hanya ID, Status, Harga */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3 lg:p-fluid-4 flex items-center justify-between cursor-pointer bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3 lg:gap-fluid-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base lg:!text-fluid-lg font-bold text-gray-900">
                #{order.orderNumber}
              </h3>
              <span className="px-2 py-0.5 bg-gray-100 text-black rounded text-[10px] lg:!text-fluid-xs font-bold uppercase tracking-wider border border-purple-200">
                Completed
              </span>
            </div>
            {/* Harga tampil di sini supaya ringkas */}
            <p className="text-xs lg:!text-fluid-sm font-bold text-gray-600 mt-0.5">
              {formatRupiah(order.totalAmount)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:gap-fluid-3">
          {/* Indikator Buka/Tutup */}
          <div className={`p-1.5 lg:p-fluid-2 rounded-full transition-all duration-200 ${isOpen ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
            {isOpen ? <ChevronUp className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5" /> : <ChevronDown className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5" />}
          </div>
        </div>
      </div>

      {/* 2. ACCORDION CONTENT (Detail Tersembunyi) */}
      {/* Meja, Customer, Waktu, dan Menu ada di sini */}
      {isOpen && (
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 lg:p-fluid-5 animate-in slide-in-from-top-2 duration-200">

          {/* Info Grid: Customer & Waktu */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-fluid-4 mb-4 lg:mb-fluid-5">
            <div className="space-y-2 lg:space-y-fluid-3">
              <div className="flex items-center gap-2 lg:gap-fluid-3 text-xs lg:!text-fluid-sm text-gray-600">
                <MapPin className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4 text-blue-500" />
                <span className="font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
                  Table {order.tableNumber}
                </span>
              </div>
              <div className="flex items-center gap-2 lg:gap-fluid-3 text-xs lg:!text-fluid-sm text-gray-600">
                <User className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4 text-orange-500" />
                <span className="font-medium">{order.customerName}</span>
              </div>
              {order.completedAt && (
                <div className="flex items-center gap-2 lg:gap-fluid-3 text-xs lg:!text-fluid-sm text-gray-600">
                  <CalendarDays className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4 text-gray-400" />
                  <span>{new Date(order.completedAt).toLocaleString("id-ID")}</span>
                </div>
              )}
            </div>

            {/* Time Stats Box */}
            <div className="flex gap-2 lg:gap-fluid-3">
              <div className="flex-1 bg-white p-2 lg:p-fluid-3 rounded-lg lg:rounded-[0.556vw] border border-gray-200 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-[10px] lg:!text-fluid-xs text-gray-500 mb-1">
                  <Clock className="w-3 h-3 lg:w-fluid-3.5 lg:h-fluid-3.5 text-blue-500" />
                  Delivery
                </div>
                <span className="font-bold text-gray-900 text-xs lg:!text-fluid-sm">{deliveryTime} min</span>
              </div>
              <div className="flex-1 bg-white p-2 lg:p-fluid-3 rounded-lg lg:rounded-[0.556vw] border border-gray-200 flex flex-col items-center justify-center text-center">
                <div className="flex items-center gap-1.5 text-[10px] lg:!text-fluid-xs text-gray-500 mb-1">
                  <TrendingUp className="w-3 h-3 lg:w-fluid-3.5 lg:h-fluid-3.5 text-green-500" />
                  Total
                </div>
                <span className="font-bold text-gray-900 text-xs lg:!text-fluid-sm">{totalTime} min</span>
              </div>
            </div>
          </div>

          {/* Items List */}
          <div>
            <p className="text-[10px] lg:!text-fluid-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 lg:mb-fluid-3">
              Order Details
            </p>
            <div className="bg-white rounded-lg lg:rounded-[0.556vw] border border-gray-200 divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <div key={`${item._id}-${index}`} className="p-2 lg:p-fluid-3 flex justify-between items-start">
                  <div className="flex gap-2 lg:gap-fluid-3">
                    <span className="flex items-center justify-center w-5 h-5 lg:w-fluid-6 lg:h-fluid-6 bg-gray-100 rounded text-[10px] lg:!text-fluid-xs font-bold text-gray-700">
                      {item.quantity}x
                    </span>
                    <div>
                      <p className="text-xs lg:!text-fluid-sm font-medium text-gray-900">{item.menuItemName}</p>
                      {item.notes && (
                        <p className="text-[10px] lg:!text-fluid-xs text-orange-600 italic mt-0.5">Note: {item.notes}</p>
                      )}
                    </div>
                  </div>
                  <p className="text-xs lg:!text-fluid-sm text-gray-600 font-medium">
                    {formatRupiah(item.price * item.quantity)}
                  </p>
                </div>
              ))}

              {/* Total Row */}
              <div className="p-2 lg:p-fluid-3 bg-gray-50 flex justify-between items-center rounded-b-lg lg:rounded-b-[0.556vw]">
                <span className="text-xs lg:!text-fluid-sm font-semibold text-gray-600">Total Amount</span>
                <span className="text-sm lg:!text-fluid-base font-bold text-gray-900">{formatRupiah(order.totalAmount)}</span>
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

// --- MAIN COMPONENT ---
export default function CompletedDeliveriesView({
  userId,
}: CompletedDeliveriesViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  // UBAH: Hanya Today dan Week, hapus 'all'
  const [dateFilter, setDateFilter] = useState<"today" | "week">("today");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, dateFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/orders?status=completed");
      if (res.ok) {
        const data = await res.json();
        const completedOrders = (data.data || []).filter(
          (order: Order) => order.orderStatus === "completed"
        );
        setOrders(completedOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryTime = (order: Order): number => {
    if (!order.completedAt || !order.deliveringAt) return 0;
    return getElapsedTime(order.deliveringAt, order.completedAt);
  };

  // Helper untuk filter tanggal
  const isToday = (date: string): boolean => {
    const today = new Date();
    const orderDate = new Date(date);
    return (
      orderDate.getDate() === today.getDate() &&
      orderDate.getMonth() === today.getMonth() &&
      orderDate.getFullYear() === today.getFullYear()
    );
  };

  const isThisWeek = (date: string): boolean => {
    const orderDate = new Date(date);
    const today = new Date();

    // Calculate start of current week (Monday)
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today);
    monday.setDate(diff);
    monday.setHours(0, 0, 0, 0);

    // Calculate end of current week (Sunday)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return orderDate >= monday && orderDate <= sunday;
  };

  const filteredOrders = orders
    .filter((order) => {
      // HAPUS LOGIKA 'ALL', HANYA TODAY & WEEK
      if (dateFilter === "today" && !isToday(order.completedAt || "")) return false;
      if (dateFilter === "week" && !isThisWeek(order.completedAt || "")) return false;

      return (
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort(
      (a, b) =>
        new Date(b.completedAt || "").getTime() -
        new Date(a.completedAt || "").getTime()
    );

  // --- LOGIKA PAGINATION ---
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Statistics (Hitung dari filteredOrders sebelum dipaginasi agar total akurat sesuai filter)
  const stats = {
    total: filteredOrders.length,
    totalRevenue: filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0),
    avgDeliveryTime:
      filteredOrders.length > 0
        ? Math.round(
          filteredOrders.reduce((sum, o) => {
            if (!o.completedAt || !o.deliveringAt) return sum;
            return sum + getElapsedTime(o.deliveringAt, o.completedAt)
          }, 0) / filteredOrders.length
        )
        : 0,
    totalItems: filteredOrders.reduce(
      (sum, o) =>
        sum + o.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0
    ),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-12 h-12 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-sm lg:!text-fluid-base">Loading history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-fluid-4">
      {/* Stats Cards (White Theme) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-fluid-6 mb-4 lg:mb-fluid-8">
        <div className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs lg:!text-fluid-sm font-medium mb-1">Total Delivered</p>
            <p className="text-2xl lg:!text-fluid-3xl font-bold text-gray-900">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs lg:!text-fluid-sm font-medium mb-1">Total Revenue</p>
            <p className="text-2xl lg:!text-fluid-3xl font-bold text-gray-900">
              {formatRupiah(stats.totalRevenue)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs lg:!text-fluid-sm font-medium mb-1">Avg Delivery Time</p>
            <p className="text-2xl lg:!text-fluid-3xl font-bold text-gray-900">
              {stats.avgDeliveryTime}m
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl lg:rounded-[1.389vw] p-4 lg:p-fluid-6 shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-xs lg:!text-fluid-sm font-medium mb-1">Items Delivered</p>
            <p className="text-2xl lg:!text-fluid-3xl font-bold text-gray-900">
              {stats.totalItems}
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-3 lg:gap-fluid-4 mb-4 lg:mb-fluid-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 lg:w-fluid-5 lg:h-fluid-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order #, table, or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 lg:pl-fluid-10 pr-4 lg:pr-fluid-4 py-2 lg:py-fluid-3 bg-white border border-gray-200 rounded-lg lg:rounded-[0.833vw] text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm text-sm lg:!text-fluid-sm"
          />
        </div>

        <div className="flex gap-1 lg:gap-fluid-2 p-1 bg-white border border-gray-200 rounded-lg lg:rounded-[0.833vw]">
          <button
            onClick={() => setDateFilter("today")}
            className={`px-3 lg:px-fluid-4 py-1.5 lg:py-fluid-2 rounded-lg lg:rounded-[0.556vw] text-xs lg:!text-fluid-sm font-medium transition-all flex items-center gap-1 lg:gap-fluid-2 ${dateFilter === "today"
              ? "bg-black text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            <Calendar className="w-3 h-3 lg:w-fluid-4 lg:h-fluid-4" />
            Today
          </button>
          <button
            onClick={() => setDateFilter("week")}
            className={`px-3 lg:px-fluid-4 py-1.5 lg:py-fluid-2 rounded-lg lg:rounded-[0.556vw] text-xs lg:!text-fluid-sm font-medium transition-all ${dateFilter === "week"
              ? "bg-black text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-50"
              }`}
          >
            This Week
          </button>
          {/* TOMBOL ALL TIME SUDAH DIHAPUS */}
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[70vh] w-full">
          <div className="text-center">
            <div className="w-12 h-12 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-3 lg:mb-fluid-4" />
            <p className="text-neutral-500 text-sm lg:!text-fluid-base">Loading history...</p>
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 lg:py-fluid-20 bg-white rounded-xl lg:rounded-[1.389vw] border border-gray-100 shadow-sm text-center">
          <div className="w-16 h-16 lg:w-fluid-20 lg:h-fluid-20 bg-gray-50 rounded-full flex items-center justify-center mb-3 lg:mb-fluid-4">
            <Package className="w-8 h-8 lg:w-fluid-10 lg:h-fluid-10 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold text-base lg:!text-fluid-lg">
            No completed deliveries
          </h3>
          <p className="text-gray-500 text-xs lg:!text-fluid-sm mt-1">
            {dateFilter === "today"
              ? "No deliveries completed today."
              : "No deliveries completed this week."}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-3 lg:space-y-fluid-4">
            {currentOrders.map((order) => (
              <CompletedOrderCard key={order._id} order={order} />
            ))}
          </div>

          {/* PAGINATION CONTROLS */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center gap-3 lg:gap-fluid-4 mt-6 lg:mt-fluid-8">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className="p-2 lg:p-fluid-2 rounded-lg lg:rounded-[0.556vw] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5" />
              </button>

              <span className="text-xs lg:!text-fluid-sm font-medium text-gray-700 bg-white px-3 lg:px-fluid-4 py-1.5 lg:py-fluid-2 rounded-lg lg:rounded-[0.556vw] border border-gray-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={nextPage}
                disabled={currentPage === totalPages}
                className="p-2 lg:p-fluid-2 rounded-lg lg:rounded-[0.556vw] bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 lg:w-fluid-5 lg:h-fluid-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}