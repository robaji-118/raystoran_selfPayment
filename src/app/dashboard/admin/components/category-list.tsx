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
import Toast from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

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

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

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
      setToast({ message: "Category name is required", type: "error" });
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
        setToast({
          message: editingId
            ? "Category updated successfully"
            : "Category created successfully",
          type: "success"
        });
        setTimeout(() => {
          fetchCategories();
          handleCloseModal();
        }, 1000);
      } else {
        setToast({ message: result.error || "Failed to save category", type: "error" });
      }
    } catch (error) {
      console.error("Error saving category:", error);
      setToast({ message: "Error saving category", type: "error" });
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
        setToast({ message: "Category deleted successfully", type: "success" });
        setTimeout(() => {
          fetchCategories();
          setDeleteId(null);
        }, 1000);
      } else {
        setToast({ message: result.error || "Failed to delete category", type: "error" });
      }
    } catch (error) {
      console.error("Error deleting category:", error);
      setToast({ message: "Error deleting category", type: "error" });
    } finally {
      setDeleteLoading(false);
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
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-gray-500 text-fluid-base">Loading categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="flex items-center text-red-600 mb-fluid-4 justify-center">
            <AlertCircle className="w-fluid-5 h-fluid-5 mr-fluid-2" />
            <span className="text-fluid-base">{error}</span>
          </div>
          <button
            onClick={() => fetchCategories()}
            className="px-fluid-4 py-fluid-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-fluid-base"
          >
            Retry
          </button>
        </div>
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
          <div className="flex items-center justify-between mb-fluid-6">
            <div>
              <h6 className="text-gray-900 text-fluid-lg">List Categories</h6>
              <div className="text-gray-500 text-fluid-sm mt-fluid-1">
                {filteredCategories.length} of {categories.length} items
                {selectedStatus !== "all" && " (filtered)"}
              </div>
            </div>
            <div className="flex items-center gap-fluid-3">
              {/* Add Category Button */}
              <button
                onClick={() => handleOpenModal()}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-fluid-sm"
              >
                <Plus className="w-fluid-4 h-fluid-4" />
                <span>Add Category</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-fluid-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-fluid-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-fluid-4 h-fluid-4 z-10" />
              <Input
                type="text"
                placeholder="Search category name or description..."
                className="w-full pl-fluid-10 pr-fluid-3 h-auto py-fluid-2.5 bg-white border-gray-200 text-fluid-sm text-gray-700 focus-visible:ring-black placeholder:text-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-fluid-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                >
                  <X className="w-fluid-3 h-fluid-3" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full h-auto py-fluid-2.5 bg-white border-gray-200 text-fluid-sm text-gray-700 focus:ring-black">
                  <div className="flex items-center gap-fluid-2">
                    <Filter className="w-fluid-4 h-fluid-4 text-gray-400" />
                    <SelectValue placeholder="All Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
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
                    className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors text-fluid-sm"
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between p-fluid-6 border-b border-gray-200">
              <div className="flex items-center gap-fluid-3">
                <div className="w-fluid-10 h-fluid-10 bg-black rounded-xl flex items-center justify-center">
                  <Package className="w-fluid-5 h-fluid-5 text-white" />
                </div>
                <div>
                  <h3 className="text-gray-900 text-fluid-lg font-bold">
                    {editingId ? "Edit Category" : "Add New Category"}
                  </h3>
                  <p className="text-gray-500 text-fluid-sm mt-fluid-0.5">
                    {editingId ? "Update category information" : "Create a new category"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-fluid-2 rounded-lg transition-all"
                disabled={saveLoading}
              >
                <X className="w-fluid-5 h-fluid-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-fluid-6 space-y-fluid-5">
              {/* Category Name */}
              <div className="space-y-fluid-2">
                <Label className="text-fluid-xs font-bold text-black uppercase tracking-wider">
                  Category Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Appetizers, Main Course, Desserts"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-fluid-2">
                <Label className="text-fluid-xs font-bold text-black uppercase tracking-wider">
                  Description
                </Label>
                <Textarea
                  placeholder="Brief description about this category..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl resize-none transition-all font-medium text-black placeholder:text-gray-400"
                />
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-fluid-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-fluid-0.5">
                  <Label className="text-fluid-sm font-bold text-black">
                    Active Status
                  </Label>
                  <p className="text-gray-500 text-fluid-xs">
                    Inactive categories won't be visible in menu selection
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, isActive: checked })
                    }
                  />
                  <Label htmlFor="isActive" className="sr-only">
                    Active Status
                  </Label>
                </div>
              </div>

              {/* Footer Buttons */}
              <div className="border-t border-gray-200 pt-fluid-6 flex gap-fluid-4 -mx-fluid-6 -mb-fluid-6 px-fluid-6 pb-fluid-6 mt-fluid-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={saveLoading}
                  className="flex-1 px-fluid-6 py-fluid-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saveLoading}
                  className="flex-1 px-fluid-6 py-fluid-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-fluid-2"
                >
                  {saveLoading ? (
                    <>
                      <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-fluid-5 h-fluid-5" />
                      <span>{editingId ? "Update" : "Create"}</span>
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-gray-200 max-w-md w-full shadow-xl animate-in slide-in-from-bottom-4 duration-300">
            <div className="p-fluid-6 border-b border-gray-200">
              <h3 className="text-gray-900 text-fluid-lg font-bold">
                Delete Category
              </h3>
            </div>

            <div className="p-fluid-6">
              <p className="text-gray-600">
                Are you sure you want to delete this category? This action cannot be
                undone. Categories with existing menus cannot be deleted.
              </p>
            </div>

            <div className="p-fluid-6 border-t border-gray-200 flex gap-fluid-4">
              <button
                onClick={() => setDeleteId(null)}
                disabled={deleteLoading}
                className="flex-1 px-fluid-6 py-fluid-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 px-fluid-6 py-fluid-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-fluid-2"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-fluid-5 h-fluid-5" />
                    <span>Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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