// app/dashboard/admin/components/table-list.tsx
"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Trash2,
  AlertCircle,
  Plus,
  Table2,
  Users,
  Search,
  Filter,
  X,
} from "lucide-react";
import TableEditModal from "./modal/table-edit-modal";
import TableAddModal from "./modal/table-add-modal";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";

type TableType = {
  _id: string;
  tableNumber: string;
  capacity: number;
  status: string;
  currentOrderId: string | null;
  isActive: boolean;
};

export default function TableList() {
  const [tables, setTables] = useState<TableType[]>([]);
  const [filteredTables, setFilteredTables] = useState<TableType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedActive, setSelectedActive] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  const [editingTable, setEditingTable] = useState<TableType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Delete states (for confirmation modal)
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    filterTables();
  }, [tables, searchTerm, selectedStatus, selectedActive]);

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tables");

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      const tablesData = Array.isArray(data) ? data : [];
      setTables(tablesData);
      setFilteredTables(tablesData);
    } catch (error) {
      console.error("Error fetching tables:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load tables",
      );
    } finally {
      setLoading(false);
    }
  };

  const filterTables = () => {
    let filtered = tables;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((table) =>
        table.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((table) => table.status === selectedStatus);
    }

    // Filter by active status
    if (selectedActive !== "all") {
      filtered = filtered.filter((table) => {
        if (selectedActive === "active") return table.isActive;
        if (selectedActive === "inactive") return !table.isActive;
        return true;
      });
    }

    setFilteredTables(filtered);
  };

  const handleEdit = (table: TableType) => {
    setEditingTable(table);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    fetchTables();
    setIsEditModalOpen(false);
    setEditingTable(null);
  };

  const handleAddSuccess = () => {
    fetchTables();
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;

    const tableToDelete = tables.find((t) => t._id === deleteId);
    if (!tableToDelete) return;

    if (tableToDelete.status === "occupied") {
      alert("Cannot delete occupied table!");
      setDeleteId(null);
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await fetch(`/api/tables/${deleteId}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete table");
      }

      fetchTables();
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting table:", error);
      alert(error instanceof Error ? error.message : "Failed to delete table");
    } finally {
      setDeleteLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        bg: "bg-green-100",
        text: "text-green-800 text-fluid-sm",
        label: "Available",
      },
      occupied: {
        bg: "bg-red-100",
        text: "text-netral-100 text-fluid-sm",
        label: "Occupied",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.available;

    return (
      <span
        className={cn(
          "px-fluid-2 py-fluid-0.5 rounded-full font-medium text-fluid-xs",
          config.bg,
          config.text,
        )}
      >
        {config.label}
      </span>
    );
  };

  const getActiveBadge = (isActive: boolean) => {
    return (
      <span
        className={cn(
          "px-fluid-2 py-fluid-0.5 rounded-full font-medium text-fluid-sm",
          isActive
            ? "bg-green-100 text-green-800 text-fluid-sm"
            : "bg-gray-100 text-gray-800 text-fluid-sm",
        )}
      >
        {isActive ? "Active" : "Inactive"}
      </span>
    );
  };

  const clearFilter = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setSelectedActive("all");
    setShowFilter(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-fluid-12">
        <Loader2 className="w-fluid-8 h-fluid-8 animate-spin text-purple-600 mb-fluid-4" />
        <p className="text-gray-500 text-fluid-base">Loading tables...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-fluid-12">
        <div className="flex items-center text-red-600 mb-fluid-4">
          <AlertCircle className="w-fluid-5 h-fluid-5 mr-fluid-2" />
          <span className="text-fluid-base">{error}</span>
        </div>
        <button
          onClick={() => fetchTables()}
          className="px-fluid-4 py-fluid-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-fluid-base"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        className="bg-white border-gray-100 mb-fluid-6"
        style={{
          borderRadius: fluidSize(16),
          borderWidth: fluidSize(2),
        }}
      >
        {/* Header */}
        <div className="p-fluid-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h6 className="text-gray-900 text-fluid-lg">Table Management</h6>
              <div className="text-gray-500 text-fluid-sm mt-fluid-1">
                {filteredTables.length} of {tables.length} tables
                {(selectedStatus !== "all" || selectedActive !== "all") &&
                  " (filtered)"}
              </div>
            </div>
            <div className="flex items-center gap-fluid-3">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={cn(
                  "flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-fluid-sm border border-gray-200",
                  (selectedStatus !== "all" || selectedActive !== "all") &&
                    "bg-purple-50 text-purple-700 border-purple-200",
                )}
              >
                <Filter className="w-fluid-4 h-fluid-4" />
                <span>Filter</span>
                {(selectedStatus !== "all" || selectedActive !== "all") && (
                  <span className="ml-fluid-1 px-fluid-2 py-fluid-0.5 bg-purple-100 text-purple-700 rounded-full text-fluid-xs">
                    Filtered
                  </span>
                )}
              </button>

              {/* Add Table Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-fluid-sm"
              >
                <Plus className="w-fluid-4 h-fluid-4" />
                <span>Add Table</span>
              </button>
            </div>
          </div>

          {/* Filter Dropdown */}
          {showFilter && (
            <div className="mt-fluid-4 p-fluid-4 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between mb-fluid-3">
                <p className="text-gray-700 font-medium text-fluid-sm">
                  Filter Options
                </p>
                <button
                  onClick={clearFilter}
                  className="flex items-center gap-fluid-1 text-gray-500 hover:text-gray-700 text-fluid-xs"
                >
                  <X className="w-fluid-3 h-fluid-3" />
                  Clear
                </button>
              </div>

              {/* Search Input */}
              <div className="mb-fluid-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-fluid-4 h-fluid-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search table number..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-fluid-10 pr-fluid-4 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
                {/* Status Filter */}
                <div className="space-y-fluid-2">
                  <label className="block text-gray-700 font-medium text-fluid-sm">
                    Status
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Status</option>
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>

                {/* Active Filter */}
                <div className="space-y-fluid-2">
                  <label className="block text-gray-700 font-medium text-fluid-sm">
                    Active Status
                  </label>
                  <select
                    value={selectedActive}
                    onChange={(e) => setSelectedActive(e.target.value)}
                    className="w-full px-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Tables</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredTables.length === 0 ? (
            <div className="p-fluid-12 text-center">
              <div className="flex flex-col items-center">
                <Table2 className="w-fluid-16 h-fluid-16 text-gray-300 mb-fluid-4" />
                <p className="text-gray-500 mb-fluid-2 text-fluid-lg">
                  No tables found
                </p>
                <p className="text-gray-400 text-fluid-sm mb-fluid-4">
                  {searchTerm ||
                  selectedStatus !== "all" ||
                  selectedActive !== "all"
                    ? "Try changing your filters or search term"
                    : "Add your first table to get started"}
                </p>
                <div className="flex gap-fluid-3">
                  {(searchTerm ||
                    selectedStatus !== "all" ||
                    selectedActive !== "all") && (
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-fluid-sm"
                    >
                      <X className="w-fluid-4 h-fluid-4" />
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-fluid-sm"
                  >
                    <Plus className="w-fluid-4 h-fluid-4" />
                    Add Table
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Table Number
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Capacity
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Status
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Active
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTables.map((table) => (
                    <tr
                      key={table._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-3">
                          <div>
                            <span className="font-medium text-gray-900 block text-fluid-sm">
                              {table.tableNumber}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-1 text-gray-700 text-fluid-sm">
                          <Users className="w-fluid-3 h-fluid-3" />
                          <span>
                            {table.capacity}{" "}
                            {table.capacity === 1 ? "person" : "people"}
                          </span>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        {getStatusBadge(table.status)}
                      </td>
                      <td className="p-fluid-4">
                        {getActiveBadge(table.isActive)}
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-2">
                          <button
                            onClick={() => handleEdit(table)}
                            className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-fluid-xs"
                            title="Edit"
                          >
                            <Pencil className="w-fluid-3 h-fluid-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeleteId(table._id)}
                            disabled={table.status === "occupied"}
                            className={cn(
                              "flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 rounded-lg transition-colors !text-fluid-sm",
                              table.status === "occupied"
                                ? "text-gray-400 cursor-not-allowed bg-gray-100"
                                : "text-red-600 hover:bg-red-50",
                            )}
                            title={
                              table.status === "occupied"
                                ? "Cannot delete occupied table"
                                : "Delete"
                            }
                          >
                            <Trash2 className="w-fluid-3 h-fluid-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <TableAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
      />

      {/* Edit Modal */}
      <TableEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTable(null);
        }}
        table={editingTable}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-xl">
            <div className="p-fluid-6 border-b border-gray-100">
              <h3 className="text-gray-900 text-fluid-lg font-bold">
                Delete Table
              </h3>
            </div>

            <div className="p-fluid-6">
              <p className="text-gray-600 text-fluid-base">
                Are you sure you want to delete this table? This action cannot
                be undone.
              </p>
            </div>

            <div className="p-fluid-6 border-t border-gray-100 flex gap-fluid-3">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="flex-1 px-fluid-6 py-fluid-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 text-fluid-base"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="flex-1 px-fluid-6 py-fluid-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-fluid-2 text-fluid-base"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                    <span className="text-fluid-sm">Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-fluid-5 h-fluid-5" />
                    <span className="text-fluid-sm">Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
