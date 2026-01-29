/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/waiter/components/tables-status-view.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Table2,
  Users,
  Clock,
  DollarSign,
  RefreshCw,
  Search,
  AlertCircle,
  CheckCircle,
  Package,
} from "lucide-react";

interface Order {
  _id: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  createdAt: string;
}

interface Table {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: "available" | "occupied" | "reserved";
  isActive: boolean;
  currentOrder?: Order;
}

export default function TablesStatusView() {
  const [tables, setTables] = useState<Table[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "available" | "occupied" | "reserved">("all");

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tablesRes, ordersRes] = await Promise.all([
        fetch("/api/tables"),
        fetch("/api/orders"),
      ]);

      if (tablesRes.ok) {
        const tablesData = await tablesRes.json();
        setTables(tablesData.data || []);
      }

      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrders(ordersData.data || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Match orders to tables
  const tablesWithOrders = tables.map((table) => {
    const activeOrder = orders.find(
      (order) =>
        order.orderStatus !== "completed" &&
        order.orderStatus !== "cancelled" &&
        // Match by table number (assuming order has tableNumber field)
        (order as any).tableNumber === table.tableNumber
    );

    return {
      ...table,
      currentOrder: activeOrder,
    };
  });

  const getElapsedTime = (startTime: string): number => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000 / 60);
    return diff;
  };

  const filteredTables = tablesWithOrders
    .filter((table) => {
      // Status filter
      if (filterStatus !== "all" && table.status !== filterStatus) return false;

      // Search filter
      return (
        table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        table.currentOrder?.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      // Sort by table number
      return parseInt(a.tableNumber) - parseInt(b.tableNumber);
    });

  // Calculate statistics
  const stats = {
    total: tables.length,
    available: tables.filter((t) => t.status === "available").length,
    occupied: tables.filter((t) => t.status === "occupied").length,
    reserved: tables.filter((t) => t.status === "reserved").length,
    totalRevenue: tablesWithOrders
      .filter((t) => t.currentOrder)
      .reduce((sum, t) => sum + (t.currentOrder?.totalAmount || 0), 0),
  };

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "from-green-600 to-green-700 border-green-500/30";
      case "occupied":
        return "from-blue-600 to-blue-700 border-blue-500/30";
      case "reserved":
        return "from-orange-600 to-orange-700 border-orange-500/30";
      default:
        return "from-gray-600 to-gray-700 border-gray-500/30";
    }
  };

  const getTableStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-5 h-5 text-white" />;
      case "occupied":
        return <Users className="w-5 h-5 text-white" />;
      case "reserved":
        return <AlertCircle className="w-5 h-5 text-white" />;
      default:
        return <Table2 className="w-5 h-5 text-white" />;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Table2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Tables Status</h1>
              <p className="text-gray-400">Monitor all table activities</p>
            </div>
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors border border-gray-700"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            {loading ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-6 border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Total Tables</p>
              <p className="text-3xl font-bold text-white mt-1">{stats.total}</p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Table2 className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.available}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Occupied</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.occupied}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-6 border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Reserved</p>
              <p className="text-3xl font-bold text-white mt-1">
                {stats.reserved}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl p-6 border border-emerald-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Active Revenue</p>
              <p className="text-3xl font-bold text-white mt-1">
                ${stats.totalRevenue.toFixed(0)}
              </p>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by table number or order..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filterStatus === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("available")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filterStatus === "available"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            Available ({stats.available})
          </button>
          <button
            onClick={() => setFilterStatus("occupied")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filterStatus === "occupied"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            Occupied ({stats.occupied})
          </button>
          <button
            onClick={() => setFilterStatus("reserved")}
            className={`px-4 py-3 rounded-lg font-medium transition-colors ${
              filterStatus === "reserved"
                ? "bg-orange-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
            }`}
          >
            Reserved ({stats.reserved})
          </button>
        </div>
      </div>

      {/* Tables Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-gray-300">Loading tables...</span>
        </div>
      ) : filteredTables.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No tables found</p>
          <p className="text-gray-500 text-sm mt-2">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTables.map((table) => (
            <div
              key={table._id}
              className={`rounded-xl border-2 overflow-hidden transition-all hover:scale-105 ${
                table.status === "available"
                  ? "bg-green-900/20 border-green-600/50 hover:border-green-500"
                  : table.status === "occupied"
                  ? "bg-blue-900/20 border-blue-600/50 hover:border-blue-500"
                  : "bg-orange-900/20 border-orange-600/50 hover:border-orange-500"
              }`}
            >
              {/* Header */}
              <div
                className={`p-4 border-b bg-gradient-to-br ${getTableStatusColor(
                  table.status
                )}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                      {getTableStatusIcon(table.status)}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        Table {table.tableNumber}
                      </h3>
                      <p className="text-xs text-white/80">
                        Capacity: {table.capacity}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
                      table.status === "available"
                        ? "bg-green-600"
                        : table.status === "occupied"
                        ? "bg-blue-600"
                        : "bg-orange-600"
                    }`}
                  >
                    {table.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                {table.currentOrder ? (
                  <div className="space-y-3">
                    <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Order #</span>
                        <span className="text-sm font-bold text-white">
                          {table.currentOrder.orderNumber}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Status</span>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${
                            table.currentOrder.orderStatus === "confirmed"
                              ? "bg-blue-600/20 text-blue-400"
                              : table.currentOrder.orderStatus === "preparing"
                              ? "bg-orange-600/20 text-orange-400"
                              : table.currentOrder.orderStatus === "ready"
                              ? "bg-green-600/20 text-green-400"
                              : "bg-gray-600/20 text-gray-400"
                          }`}
                        >
                          {table.currentOrder.orderStatus.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-400">Amount</span>
                        <span className="text-sm font-bold text-white">
                          ${table.currentOrder.totalAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-700">
                        <Clock className="w-3 h-3" />
                        <span>
                          {getElapsedTime(table.currentOrder.createdAt)} min ago
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">Table is free</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ready for new guests
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredTables.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Showing{" "}
              <span className="text-white font-medium">
                {filteredTables.length}
              </span>{" "}
              of {stats.total} tables
            </span>
            <span className="text-blue-400 font-medium">
              Occupancy: {Math.round((stats.occupied / stats.total) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}