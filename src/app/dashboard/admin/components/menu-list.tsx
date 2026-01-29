// app/dashboard/admin/components/menu-list.tsx
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
  Clock,
  Package,
  X,
  ChevronDown,
} from "lucide-react";
import MenuAddModal from "./modal/menu-add-modal";
import MenuEditModal from "./modal/menu-edit-modal";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
}

interface Menu {
  _id: string;
  name: string;
  description: string;
  categoryId: Category;
  price: number;
  image: string;
  isAvailable: boolean;
  preparationTime: number;
  isActive: boolean;
  createdAt: string;
}

export default function MenuList() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [filteredMenus, setFilteredMenus] = useState<Menu[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);

  // Delete states
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchCategories();
  }, []);

  useEffect(() => {
    filterMenus();
  }, [menus, searchTerm, selectedCategory, selectedStatus]);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/menus");
      const result = await response.json();

      if (result.success) {
        setMenus(result.data);
        setFilteredMenus(result.data);
      } else {
        setError("Failed to fetch menus");
      }
    } catch (error) {
      console.error("Error fetching menus:", error);
      setError("Error fetching menus");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?activeOnly=true");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const filterMenus = () => {
    let filtered = menus;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (menu) =>
          menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          menu.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (menu) => menu.categoryId._id === selectedCategory
      );
    }

    // Filter by status
    if (selectedStatus !== "all") {
      filtered = filtered.filter((menu) => {
        if (selectedStatus === "available") return menu.isAvailable;
        if (selectedStatus === "unavailable") return !menu.isAvailable;
        return true;
      });
    }

    setFilteredMenus(filtered);
  };

  const handleOpenEditModal = (menu: Menu) => {
    setEditingMenu(menu);
    setIsEditModalOpen(true);
  };

  const handleAddSuccess = () => {
    fetchMenus();
    setIsAddModalOpen(false);
  };

  const handleEditSuccess = () => {
    fetchMenus();
    setIsEditModalOpen(false);
    setEditingMenu(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      setDeleteLoading(true);
      const response = await fetch(`/api/menus/${deleteId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        alert("Menu deleted successfully");
        fetchMenus();
      } else {
        alert(result.error || "Failed to delete menu");
      }
    } catch (error) {
      console.error("Error deleting menu:", error);
      alert("Error deleting menu");
    } finally {
      setDeleteLoading(false);
      setDeleteId(null);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStatusColor = (isAvailable: boolean) => {
    return isAvailable
      ? "bg-green-100 text-green-700 "
      : "bg-red-100 text-red-800 ";
  };

  const clearFilter = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setSelectedStatus("all");
  };

  const isFilterActive = () => {
    return selectedCategory !== "all" || selectedStatus !== "all" || searchTerm;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-fluid-12">
        <Loader2 className="w-fluid-8 h-fluid-8 animate-spin text-purple-600 mb-fluid-4" />
        <p className="text-gray-500 text-fluid-base">Loading menus...</p>
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
          onClick={() => fetchMenus()}
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
        {/* Header dengan Filter Langsung */}
        <div className="p-fluid-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-fluid-4">
            <div>
              <h6 className="text-gray-900 text-fluid-lg">List Menu</h6>
              <div className="text-gray-500 text-fluid-sm mt-fluid-1">
                {filteredMenus.length} of {menus.length} items
                {isFilterActive() && " (filtered)"}
              </div>
            </div>
            <div className="flex items-center gap-fluid-3">
              {/* Clear Filter Button jika filter aktif */}
              {isFilterActive() && (
                <button
                  onClick={clearFilter}
                  className="flex items-center gap-fluid-2 px-fluid-3 py-fluid-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-fluid-xs border border-gray-200"
                >
                  <X className="w-fluid-3 h-fluid-3" />
                  <span>Clear Filter</span>
                </button>
              )}

              {/* Add Menu Button */}
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-fluid-2 px-fluid-4 py-fluid-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-fluid-sm"
              >
                <Plus className="w-fluid-4 h-fluid-4" />
                <span>Add Menu</span>
              </button>
            </div>
          </div>

          {/* Filter Bar Langsung Tampil */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-fluid-4">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-fluid-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-fluid-4 h-fluid-4" />
              <input
                type="text"
                placeholder="Search menu name or description..."
                className="w-full pl-fluid-10 pr-fluid-3 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-fluid-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-fluid-3 h-fluid-3" />
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="relative">
              <div className="absolute left-fluid-3 top-1/2 transform -translate-y-1/2">
                <Filter className="w-fluid-4 h-fluid-4 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full pl-fluid-10 pr-fluid-8 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
              >
                <option value="all">All Categories</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-fluid-3 top-1/2 transform -translate-y-1/2 w-fluid-4 h-fluid-4 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <div className="absolute left-fluid-3 top-1/2 transform -translate-y-1/2">
                <Filter className="w-fluid-4 h-fluid-4 text-gray-400" />
              </div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full pl-fluid-10 pr-fluid-8 py-fluid-2.5 bg-white border border-gray-200 rounded-lg text-fluid-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <ChevronDown className="absolute right-fluid-3 top-1/2 transform -translate-y-1/2 w-fluid-4 h-fluid-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Active Filter Tags */}
          {isFilterActive() && (
            <div className="mt-fluid-4 flex flex-wrap gap-fluid-2">
              {searchTerm && (
                <div className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 bg-blue-50 text-blue-700 rounded-full text-fluid-xs">
                  <span>Search:&ldquo;{searchTerm}&ldquo;</span>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-fluid-1 text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-fluid-3 h-fluid-3" />
                  </button>
                </div>
              )}
              
              {selectedCategory !== "all" && (
                <div className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 bg-purple-50 text-purple-700 rounded-full text-fluid-xs">
                  <span>
                    Category: {categories.find(c => c._id === selectedCategory)?.name || "Unknown"}
                  </span>
                  <button
                    onClick={() => setSelectedCategory("all")}
                    className="ml-fluid-1 text-purple-600 hover:text-purple-800"
                  >
                    <X className="w-fluid-3 h-fluid-3" />
                  </button>
                </div>
              )}

              {selectedStatus !== "all" && (
                <div className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 bg-green-50 text-green-700 rounded-full text-fluid-xs">
                  <span>Status: {selectedStatus === "available" ? "Available" : "Unavailable"}</span>
                  <button
                    onClick={() => setSelectedStatus("all")}
                    className="ml-fluid-1 text-green-600 hover:text-green-800"
                  >
                    <X className="w-fluid-3 h-fluid-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredMenus.length === 0 ? (
            <div className="p-fluid-12 text-center">
              <div className="flex flex-col items-center">
                <Package className="w-fluid-16 h-fluid-16 text-gray-300 mb-fluid-4" />
                <p className="text-gray-500 mb-fluid-2 text-fluid-lg">
                  No menus found
                </p>
                <p className="text-gray-400 text-fluid-sm mb-fluid-4">
                  {isFilterActive()
                    ? "Try changing your filters or search term"
                    : "Add your first menu to get started"}
                </p>
                <div className="flex gap-fluid-3">
                  {isFilterActive() && (
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
                    Add Menu
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
                      Menu
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Category
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Price
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Prep Time
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Status
                    </th>
                    <th className="text-left p-fluid-4 text-gray-600 font-medium text-fluid-sm">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMenus.map((menu) => (
                    <tr
                      key={menu._id}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-3">
                          <div className="w-fluid-12 h-fluid-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0">
                            {menu.image ? (
                              <img
                                src={menu.image}
                                alt={menu.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Package className="w-fluid-6 h-fluid-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div>
                            <span className="font-medium text-gray-900 block text-fluid-sm">
                              {menu.name}
                            </span>
                            <span className="text-gray-500 text-fluid-xs line-clamp-1">
                              {menu.description || "No description"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span className="text-gray-700 text-fluid-sm">
                          {menu.categoryId.name}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <span className="font-medium text-gray-900 text-fluid-sm">
                          {formatPrice(menu.price)}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-1 text-gray-600 text-fluid-sm">
                          <Clock className="w-fluid-3 h-fluid-3" />
                          <span>{menu.preparationTime || 0} min</span>
                        </div>
                      </td>
                      <td className="p-fluid-4">
                        <span
                          className={cn(
                            "px-fluid-3 py-fluid-1 rounded-full font-medium !text-fluid-sm",
                            getStatusColor(menu.isAvailable)
                          )}
                        >
                          {menu.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </td>
                      <td className="p-fluid-4">
                        <div className="flex items-center gap-fluid-2">
                          <button
                            onClick={() => handleOpenEditModal(menu)}
                            className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-fluid-sm"
                            title="Edit"
                          >
                            <Edit className="w-fluid-3 h-fluid-3" />
                            <span>Edit</span>
                          </button>

                          <button
                            onClick={() => setDeleteId(menu._id)}
                            className="flex items-center gap-fluid-1 px-fluid-3 py-fluid-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-fluid-sm"
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

      {/* Modals */}
      <MenuAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddSuccess}
        categories={categories}
      />

      <MenuEditModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingMenu(null);
        }}
        onSuccess={handleEditSuccess}
        categories={categories}
        menu={editingMenu}
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
          <div className="bg-white rounded-2xl border border-gray-100 max-w-md w-full shadow-xl">
            <div className="p-fluid-6 border-b border-gray-100">
              <h3 className="text-gray-900 text-fluid-lg font-bold">
                Delete Menu
              </h3>
            </div>

            <div className="p-fluid-6">
              <p className="text-gray-600 text-fluid-base">
                Are you sure you want to delete this menu? This action cannot be
                undone.
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