/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import {
  Search,
  Filter,
  Eye,
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---
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
  orderStatus: "confirmed" | "preparing" | "ready" | "completed" | "cancelled";
  paymentStatus: "paid" | "pending" | "failed";
  paymentMethod: string;
  subtotal: number;
  tax: number;
  serviceCharge: number;
  discount: number;
  totalAmount: number;
  customerNotes?: string;
  createdAt: string;
}

export default function AllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Custom Dropdown States
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isRowSelectOpen, setIsRowSelectOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);
  const rowSelectRef = useRef<HTMLDivElement>(null);

  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "ready", label: "Ready" },
    { value: "completed", label: "Completed" },
    { value: "cancelled", label: "Cancelled" },
  ];

  const rowOptions = [5, 10, 20, 50];

  // --- Effects ---

  useEffect(() => {
    fetchOrders();

    // Click outside handler to close dropdowns
    function handleClickOutside(event: MouseEvent) {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false);
      }
      if (
        rowSelectRef.current &&
        !rowSelectRef.current.contains(event.target as Node)
      ) {
        setIsRowSelectOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    filterOrders();
    setCurrentPage(1);
  }, [orders, selectedStatus, searchQuery]);

  // --- Functions ---

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/orders");
      const data = await response.json();

      if (data.success) {
        const sortedData = data.data.sort(
          (a: Order, b: Order) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setOrders(sortedData);
        setFilteredOrders(sortedData);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (selectedStatus !== "all") {
      filtered = filtered.filter(
        (order) => order.orderStatus === selectedStatus,
      );
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (order) =>
          order.orderNumber.toLowerCase().includes(lowerQuery) ||
          order.customerName.toLowerCase().includes(lowerQuery) ||
          order.tableNumber.toString().includes(lowerQuery),
      );
    }

    setFilteredOrders(filtered);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // --- Formatters ---

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Order["orderStatus"]) => {
    const config: Record<Order["orderStatus"], string> = {
      confirmed: "bg-blue-50 text-blue-700 border-blue-100",
      preparing: "bg-gray-100 text-gray-700 border-gray-200",
      ready: "bg-orange-50 text-orange-700 border-orange-100",
      completed: "bg-green-50 text-green-700 border-green-100",
      cancelled: "bg-red-50 text-red-700 border-red-100",
    };
    return config[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  const getPaymentStatusBadge = (status: Order["paymentStatus"]) => {
    const config: Record<Order["paymentStatus"], string> = {
      paid: "bg-green-50 text-green-700 border-green-100",
      pending: "bg-yellow-50 text-yellow-700 border-yellow-100",
      failed: "bg-red-50 text-red-700 border-red-100",
    };
    return config[status] || "bg-gray-50 text-gray-700 border-gray-100";
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-base lg:!text-fluid-base">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 lg:p-fluid-6">
      <div className="flex flex-col md:flex-row gap-4 lg:gap-fluid-4 mb-6 lg:mb-fluid-6 items-center">
        {/* Search Input */}
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-3.5 lg:left-fluid-3.5 top-1/2 -translate-y-1/2 w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 transition-colors pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order #, customer, table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 lg:pl-fluid-10 pr-4 lg:pr-fluid-4 py-3 lg:py-fluid-3 border-transparent focus:border-gray-400 rounded-xl lg:rounded-[0.833vw] text-sm lg:!text-fluid-sm text-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-400/10 transition-all placeholder:text-gray-400"
          />
        </div>

        {/* Custom Status Dropdown */}
        <div className="relative min-w-[200px]" ref={statusRef}>
          <button
            onClick={() => setIsStatusOpen(!isStatusOpen)}
            className={cn(
              "w-full flex items-center justify-between px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 bg-white border rounded-xl lg:rounded-[0.833vw] text-sm lg:!text-fluid-sm font-medium text-gray-700 transition-all",
              isStatusOpen
                ? "border-gray-400 ring-4 ring-gray-400/10"
                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
            )}
          >
            <div className="flex items-center gap-2 lg:gap-fluid-2">
              <Filter className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 text-gray-500" />
              <span>
                {statusOptions.find((o) => o.value === selectedStatus)?.label}
              </span>
            </div>
            <ChevronDown
              className={cn(
                "w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 text-gray-400 transition-transform",
                isStatusOpen && "rotate-180",
              )}
            />
          </button>

          {isStatusOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl lg:rounded-[0.833vw] shadow-lg z-20 py-1 animate-in fade-in zoom-in-95 duration-200">
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    setSelectedStatus(option.value);
                    setIsStatusOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-4 lg:px-fluid-4 py-2.5 lg:py-fluid-2.5 text-sm lg:!text-fluid-sm text-left hover:bg-gray-50 transition-colors",
                    selectedStatus === option.value
                      ? "text-gray-900 bg-gray-100 font-medium"
                      : "text-gray-600",
                  )}
                >
                  {option.label}
                  {selectedStatus === option.value && (
                    <Check className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-2xl lg:rounded-[1.111vw] shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Order Info
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-left text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-right text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 lg:p-fluid-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 text-gray-300 mb-4 lg:mb-fluid-4" />
                      <p className="text-gray-500 mb-2 lg:mb-fluid-2 text-lg lg:!text-fluid-lg font-medium">
                        No orders found
                      </p>
                      <p className="text-gray-400 text-sm lg:!text-fluid-sm">
                        Try adjusting your search or filters
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                currentItems.map((order) => (
                  <tr
                    key={order._id}
                    className="hover:bg-gray-50/80 transition-colors group"
                  >
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <div className="flex flex-col">
                        <span className="text-sm lg:!text-fluid-sm font-bold text-gray-900">
                          {order.orderNumber}
                        </span>
                        <div className="flex items-center gap-1 text-xs lg:!text-fluid-xs text-gray-500 mt-0.5">
                          <Clock className="w-3 h-3 lg:w-fluid-3 lg:h-fluid-3" />
                          {formatDate(order.createdAt)}, {formatTime(order.createdAt)}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <div className="flex items-center gap-3 lg:gap-fluid-3">
                        <span className="text-sm lg:!text-fluid-sm font-medium text-gray-900">
                          {order.customerName}
                        </span>
                      </div>
                      {order.customerPhone && (
                        <div className="text-xs lg:!text-fluid-xs text-gray-500 mt-0.5">
                          {order.customerPhone}
                        </div>
                      )}
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <span className="inline-flex items-center gap-1.5 lg:gap-fluid-1.5 px-2.5 lg:px-fluid-2.5 py-1 lg:py-fluid-1 rounded-md lg:rounded-[0.417vw] text-xs lg:!text-fluid-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <MapPin className="w-3 h-3 lg:w-fluid-3 lg:h-fluid-3" />
                        Table {order.tableNumber}
                      </span>
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <span className="text-sm lg:!text-fluid-sm text-gray-600">{order.items?.length || 0} items</span>
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <span
                        className={cn(
                          "px-2.5 lg:px-fluid-2.5 py-1 lg:py-fluid-1 inline-flex text-xs lg:!text-fluid-xs font-semibold rounded-full border",
                          getStatusBadge(order.orderStatus)
                        )}
                      >
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <div className="flex flex-col gap-1 lg:gap-fluid-1">
                        <span
                          className={cn(
                            "px-2.5 lg:px-fluid-2.5 py-1 lg:py-fluid-1 inline-flex text-xs lg:!text-fluid-xs font-semibold rounded-full border w-fit",
                            getPaymentStatusBadge(order.paymentStatus)
                          )}
                        >
                          {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                        </span>
                        <span className="text-xs lg:!text-fluid-xs text-gray-500 capitalize ml-1">
                          {order.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3">
                      <span className="text-sm lg:!text-fluid-sm font-bold text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </span>
                    </td>
                    <td className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 text-right">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="p-2 lg:p-fluid-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg lg:rounded-[0.556vw] transition-all border border-transparent hover:border-gray-200"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Modern Pagination Footer --- */}
        {filteredOrders.length > 0 && (
          <div className="px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 lg:gap-fluid-4 bg-gray-50/30">
            {/* Rows Per Page Selector */}
            <div className="flex items-center gap-3 lg:gap-fluid-3">
              <span className="text-sm lg:!text-fluid-sm text-gray-500">Rows per page:</span>
              <div className="relative" ref={rowSelectRef}>
                <button
                  onClick={() => setIsRowSelectOpen(!isRowSelectOpen)}
                  className="flex items-center gap-2 lg:gap-fluid-2 px-3 lg:px-fluid-3 py-1.5 lg:py-fluid-1.5 bg-white border border-gray-200 rounded-lg lg:rounded-[0.556vw] text-sm lg:!text-fluid-sm text-gray-700 hover:border-gray-300 focus:ring-2 focus:ring-gray-400/20 transition-all"
                >
                  {itemsPerPage}
                  <ChevronDown className="w-3 h-3 lg:w-fluid-3 lg:h-fluid-3 text-gray-400" />
                </button>

                {isRowSelectOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-20 bg-white border border-gray-100 rounded-lg lg:rounded-[0.556vw] shadow-lg z-20 py-1 overflow-hidden">
                    {rowOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => {
                          setItemsPerPage(option);
                          setCurrentPage(1);
                          setIsRowSelectOpen(false);
                        }}
                        className={cn(
                          "w-full px-3 lg:px-fluid-3 py-1.5 lg:py-fluid-1.5 text-sm lg:!text-fluid-sm text-left hover:bg-gray-50 transition-colors",
                          itemsPerPage === option
                            ? "text-gray-900 bg-gray-100 font-medium"
                            : "text-gray-600",
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <span className="text-sm lg:!text-fluid-sm text-gray-500 border-l border-gray-200 pl-3 lg:pl-fluid-3">
                {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredOrders.length)} of{" "}
                {filteredOrders.length}
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1 lg:gap-fluid-1">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 lg:p-fluid-2 rounded-lg lg:rounded-[0.556vw] hover:bg-white hover:shadow-sm text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
              >
                <ChevronLeft className="w-5 h-5 lg:w-fluid-5 lg:h-fluid-5" />
              </button>

              <div className="flex items-center gap-1 lg:gap-fluid-1 px-1 lg:px-fluid-1">
                {(() => {
                  const siblingCount = 1;
                  const pageNumbers = new Set<number>();

                  // Always add first and last page
                  pageNumbers.add(1);
                  if (totalPages > 1) pageNumbers.add(totalPages);

                  // Add current page and siblings
                  for (let i = currentPage - siblingCount; i <= currentPage + siblingCount; i++) {
                    if (i > 1 && i < totalPages) {
                      pageNumbers.add(i);
                    }
                  }

                  // Convert to sorted array
                  const sortedPages = Array.from(pageNumbers).sort((a, b) => a - b);

                  // Build final array with ellipsis
                  const result: (number | string)[] = [];
                  sortedPages.forEach((page, index) => {
                    if (index > 0) {
                      const prevPage = sortedPages[index - 1];
                      if (page - prevPage > 1) {
                        result.push(`ellipsis-${prevPage}`);
                      }
                    }
                    result.push(page);
                  });

                  return result.map((item) => {
                    if (typeof item === 'string') {
                      return (
                        <span key={item} className="w-8 h-8 lg:w-fluid-8 lg:h-fluid-8 flex items-center justify-center text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={item}
                        onClick={() => handlePageChange(item)}
                        className={cn(
                          "w-8 h-8 lg:w-fluid-8 lg:h-fluid-8 flex items-center justify-center rounded-lg lg:rounded-[0.556vw] text-sm lg:!text-fluid-sm font-medium transition-all",
                          currentPage === item
                            ? "bg-gray-900 text-white shadow-sm ring-2 ring-gray-900 ring-offset-1"
                            : "text-gray-600 hover:bg-white hover:shadow-sm hover:border-gray-200 border border-transparent",
                        )}
                      >
                        {item}
                      </button>
                    );
                  });
                })()}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 lg:p-fluid-2 rounded-lg lg:rounded-[0.556vw] hover:bg-white hover:shadow-sm text-gray-500 disabled:opacity-30 disabled:cursor-not-allowed transition-all border border-transparent hover:border-gray-200"
              >
                <ChevronRight className="w-5 h-5 lg:w-fluid-5 lg:h-fluid-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 lg:p-fluid-4">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={closeModal}
          />
          <div className="relative bg-white rounded-2xl lg:rounded-[1.111vw] shadow-2xl w-full max-w-[95vw] sm:max-w-2xl lg:max-w-[44.444vw] max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 lg:px-fluid-6 py-3 sm:py-4 lg:py-fluid-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 shrink-0">
              <div className="min-w-0 flex-1 mr-3">
                <h3 className="text-base sm:text-lg lg:!text-fluid-lg font-bold text-gray-900">
                  Order Details
                </h3>
                <p className="text-xs sm:text-sm lg:!text-fluid-sm text-gray-500 truncate">
                  ID:{" "}
                  <span className="font-mono text-gray-700">
                    {selectedOrder.orderNumber}
                  </span>
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 sm:p-2 lg:p-fluid-2 bg-white rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 lg:w-fluid-5 lg:h-fluid-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 lg:p-fluid-6 overflow-y-auto space-y-4 sm:space-y-6 lg:space-y-fluid-6">
              {/* Status Badges */}
              <div className="flex flex-wrap items-center gap-2 lg:gap-fluid-2">
                <span
                  className={cn(
                    "px-2.5 lg:px-fluid-2.5 py-1 lg:py-fluid-1 inline-flex text-xs lg:!text-fluid-xs font-semibold rounded-full border",
                    getStatusBadge(selectedOrder.orderStatus)
                  )}
                >
                  {selectedOrder.orderStatus.charAt(0).toUpperCase() + selectedOrder.orderStatus.slice(1)}
                </span>
                <span
                  className={cn(
                    "px-2.5 lg:px-fluid-2.5 py-1 lg:py-fluid-1 inline-flex text-xs lg:!text-fluid-xs font-semibold rounded-full border",
                    getPaymentStatusBadge(selectedOrder.paymentStatus)
                  )}
                >
                  {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                </span>
                <span className="text-xs lg:!text-fluid-xs text-gray-500 capitalize">
                  via {selectedOrder.paymentMethod}
                </span>
              </div>

              {/* Order Info Grid - 1 col on mobile, 2 cols on sm+ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-fluid-3">
                <div className="p-3 lg:p-fluid-3 bg-gray-50 rounded-xl lg:rounded-[0.833vw] border border-gray-100">
                  <div className="flex items-center gap-2 lg:gap-fluid-2 mb-1 lg:mb-fluid-1">
                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-fluid-4 lg:h-fluid-4 text-gray-500 shrink-0" />
                    <span className="text-[10px] sm:text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase">
                      Customer
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm lg:!text-fluid-sm ml-5.5 sm:ml-6 lg:ml-fluid-6 truncate">
                    {selectedOrder.customerName}
                  </p>
                  {selectedOrder.customerEmail && (
                    <p className="text-xs lg:!text-fluid-xs text-gray-500 ml-5.5 sm:ml-6 lg:ml-fluid-6 truncate">
                      {selectedOrder.customerEmail}
                    </p>
                  )}
                  {selectedOrder.customerPhone && (
                    <p className="text-xs lg:!text-fluid-xs text-gray-500 ml-5.5 sm:ml-6 lg:ml-fluid-6">
                      {selectedOrder.customerPhone}
                    </p>
                  )}
                </div>
                <div className="p-3 lg:p-fluid-3 bg-gray-50 rounded-xl lg:rounded-[0.833vw] border border-gray-100">
                  <div className="flex items-center gap-2 lg:gap-fluid-2 mb-1 lg:mb-fluid-1">
                    <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-fluid-4 lg:h-fluid-4 text-orange-500 shrink-0" />
                    <span className="text-[10px] sm:text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase">
                      Location
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm lg:!text-fluid-sm ml-5.5 sm:ml-6 lg:ml-fluid-6">
                    Table {selectedOrder.tableNumber}
                  </p>
                </div>
                <div className="p-3 lg:p-fluid-3 bg-gray-50 rounded-xl lg:rounded-[0.833vw] border border-gray-100">
                  <div className="flex items-center gap-2 lg:gap-fluid-2 mb-1 lg:mb-fluid-1">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-fluid-4 lg:h-fluid-4 text-blue-500 shrink-0" />
                    <span className="text-[10px] sm:text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase">
                      Date
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm lg:!text-fluid-sm ml-5.5 sm:ml-6 lg:ml-fluid-6">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <div className="p-3 lg:p-fluid-3 bg-gray-50 rounded-xl lg:rounded-[0.833vw] border border-gray-100">
                  <div className="flex items-center gap-2 lg:gap-fluid-2 mb-1 lg:mb-fluid-1">
                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-fluid-4 lg:h-fluid-4 text-green-500 shrink-0" />
                    <span className="text-[10px] sm:text-xs lg:!text-fluid-xs font-semibold text-gray-500 uppercase">
                      Time
                    </span>
                  </div>
                  <p className="font-medium text-gray-900 text-sm lg:!text-fluid-sm ml-5.5 sm:ml-6 lg:ml-fluid-6">
                    {formatTime(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Order Items List */}
              <div>
                <h4 className="text-xs sm:text-sm lg:!text-fluid-sm font-bold text-gray-900 mb-2 sm:mb-3 lg:mb-fluid-3 flex items-center gap-2 lg:gap-fluid-2">
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-fluid-4 lg:h-fluid-4 text-gray-500" /> Order Summary
                </h4>
                <div className="border border-gray-100 rounded-xl lg:rounded-[0.833vw] overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs sm:text-sm lg:!text-fluid-sm min-w-[340px]">
                      <thead className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs lg:!text-fluid-xs uppercase font-medium">
                        <tr>
                          <th className="px-3 sm:px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 text-left">Item</th>
                          <th className="px-2 sm:px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 text-center w-12 sm:w-auto">Qty</th>
                          <th className="px-2 sm:px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 text-right">Price</th>
                          <th className="px-3 sm:px-4 lg:px-fluid-4 py-2 lg:py-fluid-2 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx}>
                            <td className="px-3 sm:px-4 lg:px-fluid-4 py-2.5 sm:py-3 lg:py-fluid-3 text-gray-900 font-medium">
                              <span className="line-clamp-2">{item.menuItemName}</span>
                              {item.notes && (
                                <p className="text-[10px] sm:text-xs lg:!text-fluid-xs text-gray-500 font-normal italic mt-0.5 line-clamp-1">
                                  &quot;{item.notes}&quot;
                                </p>
                              )}
                            </td>
                            <td className="px-2 sm:px-4 lg:px-fluid-4 py-2.5 sm:py-3 lg:py-fluid-3 text-center text-gray-600">
                              x{item.quantity}
                            </td>
                            <td className="px-2 sm:px-4 lg:px-fluid-4 py-2.5 sm:py-3 lg:py-fluid-3 text-right text-gray-600 whitespace-nowrap">
                              {formatCurrency(item.price)}
                            </td>
                            <td className="px-3 sm:px-4 lg:px-fluid-4 py-2.5 sm:py-3 lg:py-fluid-3 text-right text-gray-900 font-medium whitespace-nowrap">
                              {formatCurrency(item.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Customer Notes */}
              {selectedOrder.customerNotes && (
                <div className="bg-amber-50 p-3 sm:p-4 lg:p-fluid-4 rounded-xl lg:rounded-[0.833vw] border border-amber-100">
                  <p className="text-[10px] sm:text-xs lg:!text-fluid-xs font-semibold text-amber-700 uppercase mb-1 lg:mb-fluid-1">
                    Customer Notes
                  </p>
                  <p className="text-xs sm:text-sm lg:!text-fluid-sm text-amber-900 italic">
                    &quot;{selectedOrder.customerNotes}&quot;
                  </p>
                </div>
              )}

              {/* Total Calculation */}
              <div className="bg-gray-50 p-3 sm:p-4 lg:p-fluid-4 rounded-xl lg:rounded-[0.833vw] space-y-1.5 sm:space-y-2 lg:space-y-fluid-2 border border-gray-100">
                <div className="flex justify-between text-xs sm:text-sm lg:!text-fluid-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="whitespace-nowrap">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.tax > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm lg:!text-fluid-sm text-gray-600">
                    <span>Tax (10%)</span>
                    <span className="whitespace-nowrap">{formatCurrency(selectedOrder.tax)}</span>
                  </div>
                )}
                {selectedOrder.serviceCharge > 0 && (
                  <div className="flex justify-between text-xs sm:text-sm lg:!text-fluid-sm text-gray-600">
                    <span>Service Charge (5%)</span>
                    <span className="whitespace-nowrap">{formatCurrency(selectedOrder.serviceCharge)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 my-1.5 sm:my-2 lg:my-fluid-2 pt-1.5 sm:pt-2 lg:pt-fluid-2 flex justify-between text-sm sm:text-base lg:!text-fluid-base font-bold text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-gray-900 whitespace-nowrap">
                    {formatCurrency(selectedOrder.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
