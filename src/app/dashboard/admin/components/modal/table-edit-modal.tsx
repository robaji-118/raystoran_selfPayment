"use client";

import { useState, useEffect } from "react";
import { Loader2, X } from "lucide-react";
import { fluidSize } from "@/lib/utils";

type TableType = {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: string;
  currentOrderId: string | null;
  isActive: boolean;
};

type TableEditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  table: TableType | null;
  onSuccess: () => void;
};

type FormData = {
  tableNumber: string;
  capacity: number;
  status: string;
  isActive: boolean;
};

export default function TableEditModal({
  isOpen,
  onClose,
  table,
  onSuccess,
}: TableEditModalProps) {
  const [formData, setFormData] = useState<FormData>({
    tableNumber: "",
    capacity: 4,
    status: "available",
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        status: table.status,
        isActive: table.isActive,
      });
    }
  }, [table]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!table) return;

    if (!formData.tableNumber.trim()) {
      setError("Table number is required");
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 20) {
      setError("Capacity must be between 1 and 20");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tables/${table._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to update table");
      }
    } catch (error) {
      console.error("Error updating table:", error);
      setError("Error updating table");
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async () => {
    if (!table) return;

    if (table.status === "occupied") {
      alert("Cannot delete occupied table!");
      return;
    }

    if (!confirm(`Are you sure you want to delete table "${table.tableNumber}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/tables/${table._id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        onSuccess();
        onClose();
      } else {
        setError(result.error || "Failed to delete table");
      }
    } catch (error) {
      console.error("Error deleting table:", error);
      setError("Error deleting table");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
      <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-xl">
        {/* Header */}
        <div className="p-fluid-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-gray-900 text-fluid-lg font-bold">
              Edit Table
            </h3>
            <button
              onClick={onClose}
              className="w-fluid-8 h-fluid-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={loading}
            >
              <X className="w-fluid-5 h-fluid-5" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="p-fluid-6 space-y-fluid-4">
            {error && (
              <div className="p-fluid-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-fluid-sm">{error}</p>
              </div>
            )}

            {/* Table Number */}
            <div className="space-y-fluid-2">
              <label className="block text-gray-700 font-medium text-fluid-sm">
                Table Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., T01, Table 1"
                value={formData.tableNumber}
                onChange={(e) =>
                  setFormData({ ...formData, tableNumber: e.target.value })
                }
                className="w-full px-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                required
                disabled={loading}
              />
            </div>

            {/* Capacity */}
            <div className="space-y-fluid-2">
              <label className="block text-gray-700 font-medium text-fluid-sm">
                Capacity <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.capacity}
                  onChange={(e) =>
                    setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                  }
                  className="w-full px-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                  disabled={loading}
                />
                <div className="absolute right-fluid-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-fluid-sm">
                  people
                </div>
              </div>
              <p className="text-gray-500 text-fluid-xs">
                Number of people this table can accommodate
              </p>
            </div>

          </div>

          {/* Footer */}
          <div className="p-fluid-6 border-t border-gray-100 flex gap-fluid-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-fluid-6 py-fluid-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 text-fluid-base"
            >
              Cancel
            </button>

            <div className="flex-1 flex gap-fluid-3">
              <button
                type="button"
                onClick={deleteTable}
                disabled={loading || table.status === "occupied"}
                className={`flex-1 px-fluid-6 py-fluid-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-fluid-2 text-fluid-base ${
                  table.status === "occupied"
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {loading ? (
                  <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                ) : (
                  <>
                    <X className="w-fluid-5 h-fluid-5" />
                    <span className="text-fluid-sm">Delete</span>
                  </>
                )}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-fluid-6 py-fluid-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-fluid-2 text-fluid-base"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                    <span className="text-fluid-sm">Updating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-fluid-sm">Update</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}