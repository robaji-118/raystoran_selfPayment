// app/dashboard/admin/components/category-list.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  AlertCircle,
  Loader2,
  X,
  Save,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CategoryFormData {
  name: string;
  description: string;
  isActive: boolean;
}

export default function CategoryList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    isActive: true,
  });
  const [saveLoading, setSaveLoading] = useState(false);

  // Delete states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    filterCategories();
  }, [categories, searchTerm, selectedStatus]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
        setFilteredCategories(result.data);
      } else {
        setError("Failed to fetch categories");
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Error fetching categories");
    } finally {
      setLoading(false);
    }
  };

  const filterCategories = () => {
    let filtered = categories;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((category) => {
        if (selectedStatus === "active") return category.isActive;
        if (selectedStatus === "inactive") return !category.isActive;
        return true;
      });
    }

    setFilteredCategories(filtered);
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      // Edit mode
      setEditingId(category._id);
      setFormData({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
    } else {
      // Add mode
      setEditingId(null);
      setFormData({
        name: "",
        description: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Category name is required");
      return;
    }

    try {
      setSaveLoading(true);

      const url = editingId
        ? `/api/categories/${editingId}`
        : "/api/categories";
      const method = editingId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert(
          editingId
            ? "Category updated successfully"
            : "Category created successfully"
        );
        fetchCategories();
        handleCloseModal();
      } else {
        alert(result.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Error saving category");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/categories/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Category deleted successfully");
        fetchCategories();
      } else {
        alert(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      alert("Error deleting category");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-800";
  };

  const clearFilter = () => {
    setSearchTerm("");
    setSelectedStatus("all");
    setShowFilter(false);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-fluid-12">
        <Loader2 className="w-fluid-8 h-fluid-8 animate-spin text-purple-600 mb-fluid-4" />
        <p className="text-gray-500 text-fluid-base">Loading categories...</p>
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
          onClick={() => fetchCategories()}
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
              <h6 className="text-gray-900 text-fluid-lg">List Categories</h6>
              <div className="text-gray-500 text-fluid-sm mt-fluid-1">
                {filteredCategories.length} of {categories.length} items
                {selectedStatus !== "all" && " (filtered)"}
              </div>
            </div>
            <div className="flex items-center gap-fluid-3">
              {/* Filter Button */}
              <button
                onClick={() => setShowFilter(!showFilter)}
                className={cn(
                  "flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors text-fluid-sm border border-gray-200",
                  selectedStatus !== "all" &&
                    "bg-purple-50 text-purple-700 border-purple-200"
                )}
              >
                <Filter className="w-fluid-4 h-fluid-4" />
                <span>Filter</span>
                {selectedStatus !== "all" && (
                  <span className="ml-fluid-1 px-fluid-2 py-fluid-0.5 bg-purple-100 text-purple-700 rounded-full text-fluid-xs">
                    Filtered
                  </span>
                )}
              </button>

              {/* Add Category Button */}
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-fluid-sm"
              >
                <Plus className="w-fluid-4 h-fluid-4" />
                <span>Add Category</span>
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
                    placeholder="Search category name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-fluid-10 pr-fluid-4 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>

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
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredCategories.length === 0 ? (
            <div className="p-fluid-12 text-center">
              <div className="flex flex-col items-center">
                <Package className="w-fluid-16 h-fluid-16 text-gray-300 mb-fluid-4" />
                <p className="text-gray-500 mb-fluid-2 text-fluid-lg">
                  No categories found
                </p>
                <p className="text-gray-400 text-fluid-sm mb-fluid-4">
                  {searchTerm || selectedStatus !== "all"
                    ? "Try changing your filters or search term"
                    : "Add your first category to get started"}
                </p>
                <div className="flex gap-fluid-3">
                  {(searchTerm || selectedStatus !== "all") && (
                    <button
                      onClick={clearFilter}
                      className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-fluid-sm"
                    >
                      <X className="w-fluid-4 h-fluid-4" />
                      Clear Filter
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-fluid-sm"
                  >
                    <Plus className="w-fluid-4 h-fluid-4" />
                    Add Category
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
                      Category Name
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Description
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Status
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Created At
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-fluid-4">
                        <div>
                          <span className="font-medium text-gray-900 block text-fluid-sm">
                            {category.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-700 text-fluid-sm line-clamp-2 max-w-[300px]">
                          {category.description || "No description"}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span
                          className={cn(
                            "px-fluid-3 py-fluid-1 rounded-full font-medium !text-fluid-xs",
                            getStatusColor(category.isActive)
                          )}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-600 text-fluid-sm">
                          {new Date(category.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-2">
                          <button
                            onClick={() => handleOpenModal(category)}
                            className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-fluid-xs"
                            title="Edit"
                          >
                            <Edit className="w-fluid-3 h-fluid-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeleteId(category._id)}
                            className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-fluid-xs"
                            title="Delete"
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

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-xl">
            <div className="p-fluid-6 border-b border-gray-100">
              <h3 className="text-gray-900 text-fluid-lg font-bold">
                {editingId ? "Edit Category" : "Add New Category"}
              </h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="p-fluid-6 space-y-fluid-4">
                {/* Category Name */}
                <div className="space-y-fluid-2">
                  <label className="block text-gray-700 font-medium text-fluid-sm">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Appetizers, Main Course, Desserts"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-fluid-2">
                  <label className="block text-gray-700 font-medium text-fluid-sm">
                    Description
                  </label>
                  <textarea
                    placeholder="Brief description about this category..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="w-full px-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between p-fluid-4 bg-gray-50 rounded-lg">
                  <div className="space-y-fluid-1">
                    <label className="block text-gray-700 font-medium text-fluid-sm">
                      Active Status
                    </label>
                    <p className="text-gray-500 text-fluid-xs">
                      Inactive categories won&lsquo;t be visible in menu selection
                    </p>
                  </div>
                  <div className="relative inline-block w-fluid-10 mr-2 align-middle select-none">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) =>
                        setFormData({ ...formData, isActive: e.target.checked })
                      }
                      className="sr-only"
                    />
                    <label
                      htmlFor="isActive"
                      className={cn(
                        "block overflow-hidden h-fluid-6 rounded-full cursor-pointer transition-colors",
                        formData.isActive
                          ? "bg-purple-600"
                          : "bg-gray-300"
                      )}
                    >
                      <span
                        className={cn(
                          "block h-fluid-6 w-fluid-6 rounded-full bg-white shadow transform transition-transform",
                          formData.isActive
                            ? "translate-x-fluid-4"
                            : "translate-x-0"
                        )}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-fluid-6 border-t border-gray-100 flex gap-fluid-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saveLoading}
                  className="flex-1 px-fluid-6 py-fluid-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 text-fluid-base"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 px-fluid-6 py-fluid-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-fluid-2 text-fluid-base"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                      <span className="text-fluid-sm">Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-fluid-5 h-fluid-5" />
                      <span className="text-fluid-sm">
                        {editingId ? "Update" : "Create"}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-xl">
            <div className="p-fluid-6 border-b border-gray-100">
              <h3 className="text-gray-900 text-fluid-lg font-bold">
                Delete Category
              </h3>
            </div>

            <div className="p-fluid-6">
              <p className="text-gray-600 text-fluid-base">
                Are you sure you want to delete this category? This action cannot be
                undone. Categories with existing menus cannot be deleted.
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
                onClick={handleDelete}
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