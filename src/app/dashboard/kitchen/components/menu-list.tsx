// app/dashboard/kitchen/components/menu-list.tsx
"use client";

import { useState, useEffect } from "react";
import { UtensilsCrossed, Search, Clock, DollarSign, Filter } from "lucide-react";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  preparationTime: number;
  categoryId?: {
    _id: string;
    name: string;
    type: string;
  };
  isAvailable: boolean;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  type: string;
}

export default function MenuList() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [menusRes, categoriesRes] = await Promise.all([
        fetch("/api/menus"),
        fetch("/api/categories")
      ]);

      if (menusRes.ok) {
        const menusData = await menusRes.json();
        const items = menusData.success && Array.isArray(menusData.data) ? menusData.data : [];
        setMenuItems(items);
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        const cats = categoriesData.success && Array.isArray(categoriesData.data) ? categoriesData.data : [];
        setCategories(cats);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || item.categoryId?._id?.toString() === selectedCategory;
    const matchesAvailability =
      availabilityFilter === "all" ||
      (availabilityFilter === "available" && item.isAvailable && item.isActive) ||
      (availabilityFilter === "unavailable" && (!item.isAvailable || !item.isActive));

    return matchesSearch && matchesCategory && matchesAvailability;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center">
            <UtensilsCrossed className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Menu List</h1>
            <p className="text-gray-400">View all menu items and their details</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-6 border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Available Items</p>
              <p className="text-3xl font-bold text-white mt-1">
                {menuItems.filter(item => item.isAvailable && item.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-xl p-6 border border-red-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">Unavailable Items</p>
              <p className="text-3xl font-bold text-white mt-1">
                {menuItems.filter(item => !item.isAvailable || !item.isActive).length}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-6 border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Items</p>
              <p className="text-3xl font-bold text-white mt-1">
                {menuItems.length}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setAvailabilityFilter("all")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${availabilityFilter === "all"
              ? "bg-gray-900 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
          >
            <Filter className="w-4 h-4" />
            All Items
          </button>
          <button
            onClick={() => setAvailabilityFilter("available")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${availabilityFilter === "available"
              ? "bg-green-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
          >
            Available Only
          </button>
          <button
            onClick={() => setAvailabilityFilter("unavailable")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${availabilityFilter === "unavailable"
              ? "bg-red-600 text-white"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700"
              }`}
          >
            Unavailable Only
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <UtensilsCrossed className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">No menu items found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item._id}
              className={`rounded-xl border-2 overflow-hidden transition-all ${item.isAvailable && item.isActive
                ? "bg-gray-800 border-gray-700 hover:border-gray-600"
                : "bg-gray-800/50 border-red-900/50 opacity-75"
                }`}
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-400 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                  {(!item.isAvailable || !item.isActive) && (
                    <span className="px-2 py-1 bg-red-900/30 border border-red-600/30 rounded text-xs font-bold text-red-400">
                      UNAVAILABLE
                    </span>
                  )}
                </div>

                {/* Category */}
                {item.categoryId && (
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-gray-900/30 border border-gray-700/30 rounded-full text-xs font-medium text-gray-300">
                      {item.categoryId.name}
                    </span>
                  </div>
                )}

                {/* Details */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between py-2 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">Price</span>
                    </div>
                    <span className="text-white font-bold">
                      Rp {item.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-t border-gray-700">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">Prep Time</span>
                    </div>
                    <span className="text-white font-bold">
                      {item.preparationTime} min
                    </span>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="mt-4 pt-4 border-t border-gray-700">
                  {item.isAvailable && item.isActive ? (
                    <div className="flex items-center gap-2 text-green-400">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Ready to Cook</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-400">
                      <div className="w-2 h-2 bg-red-400 rounded-full" />
                      <span className="text-sm font-medium">
                        {!item.isActive ? "Inactive" : "Out of Stock"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {!loading && filteredItems.length > 0 && (
        <div className="mt-6 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">
              Showing <span className="text-white font-medium">{filteredItems.length}</span> of{" "}
              <span className="text-white font-medium">{menuItems.length}</span> items
            </span>
            <span className="text-gray-400">
              <span className="text-green-400 font-medium">
                {filteredItems.filter(item => item.isAvailable && item.isActive).length}
              </span>{" "}
              available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}