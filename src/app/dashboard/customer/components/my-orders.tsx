// app/dashboard/customer/components/my-orders.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Package, 
  Truck, 
  ChefHat,
  Receipt,
  Calendar,
  DollarSign,
  MapPin
} from "lucide-react";
import React from "react";

interface OrderItem {
  _id: string;
  menuItemName: string;
  quantity: number;
  price: number;
  subtotal: number;
  notes?: string;
  status: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  tableNumber: string;
  customerName: string;
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivering' | 'completed' | 'cancelled';
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  items?: OrderItem[];
}

const statusConfig = {
  pending: { 
    label: 'Pending', 
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    icon: Clock 
  },
  confirmed: { 
    label: 'Confirmed', 
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: CheckCircle 
  },
  preparing: { 
    label: 'Preparing', 
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: ChefHat 
  },
  ready: { 
    label: 'Ready', 
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Package 
  },
  delivering: { 
    label: 'Delivering', 
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    icon: Truck 
  },
  completed: { 
    label: 'Completed', 
    color: 'bg-green-100 text-green-700 border-green-200',
    icon: CheckCircle 
  },
  cancelled: { 
    label: 'Cancelled', 
    color: 'bg-red-100 text-red-700 border-red-200',
    icon: XCircle 
  }
};

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const ordersData = data.success && Array.isArray(data.data) ? data.data : [];
        setOrders(ordersData);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.orderStatus === filterStatus);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('id-ID', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="ml-3 text-neutral-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg border border-neutral-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              filterStatus === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {Object.entries(statusConfig).map(([status, config]) => {
            const count = orders.filter(o => o.orderStatus === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  filterStatus === status
                    ? 'bg-purple-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {config.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-lg border border-neutral-200 p-12 text-center">
          <Receipt className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No orders found</h3>
          <p className="text-neutral-600">
            {filterStatus === 'all' 
              ? "You haven't placed any orders yet."
              : `No ${statusConfig[filterStatus as keyof typeof statusConfig]?.label.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => {
            const StatusIcon = statusConfig[order.orderStatus].icon;
            
            return (
              <div
                key={order._id}
                className="bg-white rounded-lg border border-neutral-200 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-neutral-950">
                          {order.orderNumber}
                        </h3>
                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[order.orderStatus].color}`}>
                          <StatusIcon className="w-4 h-4" />
                          {statusConfig[order.orderStatus].label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-neutral-600">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          Table {order.tableNumber}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(order.createdAt)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Package className="w-4 h-4" />
                          {order.items?.length || 0} items
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 text-2xl font-bold text-neutral-950">
                        <DollarSign className="w-5 h-5" />
                        Rp {order.totalAmount.toLocaleString()}
                      </div>
                      <div className={`text-sm font-medium mt-1 ${
                        order.paymentStatus === 'paid' 
                          ? 'text-green-600' 
                          : order.paymentStatus === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {order.paymentStatus === 'paid' ? '✓ Paid' : 
                         order.paymentStatus === 'pending' ? '○ Pending Payment' : 
                         '✗ ' + order.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  {order.items && order.items.length > 0 && (
                    <div className="border-t border-neutral-200 pt-4 mt-4">
                      <p className="text-sm font-medium text-neutral-700 mb-2">Items:</p>
                      <div className="space-y-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div key={item._id} className="flex justify-between text-sm">
                            <span className="text-neutral-600">
                              {item.quantity}x {item.menuItemName}
                            </span>
                            <span className="text-neutral-900 font-medium">
                              Rp {item.subtotal.toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-sm text-neutral-500 italic">
                            +{order.items.length - 3} more items...
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-neutral-950 mb-2">
                    {selectedOrder.orderNumber}
                  </h2>
                  <p className="text-neutral-600">
                    Ordered {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-neutral-400 hover:text-neutral-600 text-2xl"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Status */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Order Status</h3>
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${statusConfig[selectedOrder.orderStatus].color}`}>
                  {React.createElement(statusConfig[selectedOrder.orderStatus].icon, { className: "w-5 h-5" })}
                  {statusConfig[selectedOrder.orderStatus].label}
                </span>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item) => (
                    <div key={item._id} className="flex justify-between items-start p-3 bg-neutral-50 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-neutral-900">{item.menuItemName}</p>
                        <p className="text-sm text-neutral-600">Quantity: {item.quantity}</p>
                        {item.notes && (
                          <p className="text-sm text-neutral-500 italic mt-1">Note: {item.notes}</p>
                        )}
                      </div>
                      <p className="font-semibold text-neutral-900">
                        Rp {item.subtotal.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Price Details</h3>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-lg">
                  <div className="flex justify-between text-neutral-700">
                    <span>Subtotal</span>
                    <span>Rp {selectedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Tax (10%)</span>
                    <span>Rp {selectedOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-neutral-700">
                    <span>Service Charge (5%)</span>
                    <span>Rp {selectedOrder.serviceCharge.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-neutral-300 pt-2 mt-2 flex justify-between text-lg font-bold text-neutral-950">
                    <span>Total</span>
                    <span>Rp {selectedOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div>
                <h3 className="font-semibold text-neutral-900 mb-3">Payment Information</h3>
                <div className="bg-neutral-50 p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Method</span>
                    <span className="font-medium text-neutral-900 capitalize">
                      {selectedOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-700">Status</span>
                    <span className={`font-medium ${
                      selectedOrder.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}