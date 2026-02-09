// app/dashboard/admin/components/modal/table-edit-modal.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Table2, Save } from "lucide-react";
import Toast from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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

    if (!table) return;

    if (!formData.tableNumber.trim()) {
      setToast({ message: "Table number is required", type: "error" });
      return;
    }

    if (formData.capacity < 1 || formData.capacity > 20) {
      setToast({ message: "Capacity must be between 1 and 20", type: "error" });
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
        setToast({ message: "Table updated successfully", type: "success" });
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setToast({ message: result.error || "Failed to update table", type: "error" });
      }
    } catch (error) {
      console.error("Error updating table:", error);
      setToast({ message: "Error updating table", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !table) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Table2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-gray-900 text-lg font-bold">
                Edit Table
              </h3>
              <p className="text-gray-500 text-sm mt-0.5">
                Update table information
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Table Number */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-black uppercase tracking-wider">
              Table Number <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              placeholder="e.g., T01, Table 1"
              value={formData.tableNumber}
              onChange={(e) =>
                setFormData({ ...formData, tableNumber: e.target.value })
              }
              className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-400"
              required
              disabled={loading}
            />
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-black uppercase tracking-wider">
              Capacity <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })
                }
                className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black pr-20"
                required
                disabled={loading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm font-medium">
                people
              </div>
            </div>
            <p className="text-gray-500 text-xs">
              Number of people this table can accommodate (1-20)
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-200 pt-6 flex gap-4 -mx-6 -mb-6 px-6 pb-6 mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Update Table</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}