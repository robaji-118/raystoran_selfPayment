// app/dashboard/admin/components/modal/menu-edit-modal.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { X, ImageIcon, Save, Upload, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

interface MenuEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
  menu: Menu | null;
}

interface MenuFormData {
  name: string;
  description: string;
  categoryId: string;
  price: number;
  image: string;
  preparationTime: number;
  isAvailable: boolean;
  isActive: boolean;
}

export default function MenuEditModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  categories,
  menu
}: MenuEditModalProps) {
  const [formData, setFormData] = useState<MenuFormData>({
    name: "",
    description: "",
    categoryId: "",
    price: 0,
    image: "",
    preparationTime: 0,
    isAvailable: true,
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState<string>("");
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (menu) {
      setFormData({
        name: menu.name,
        description: menu.description || "",
        categoryId: menu.categoryId._id,
        price: menu.price,
        image: menu.image || "",
        preparationTime: menu.preparationTime || 0,
        isAvailable: menu.isAvailable,
        isActive: menu.isActive,
      });
      setImagePreview(menu.image || "");
    }
  }, [menu]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB");
      return;
    }

    try {
      setUploadLoading(true);

      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      const result = await response.json();

      if (result.success) {
        setFormData({ ...formData, image: result.data.url });
        setImagePreview(result.data.url);
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploadLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: "" });
    setImagePreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert("Menu name is required");
      return;
    }

    if (!formData.categoryId) {
      alert("Please select a category");
      return;
    }

    if (formData.price <= 0) {
      alert("Price must be greater than 0");
      return;
    }

    if (!menu) return;

    try {
      setSaveLoading(true);

      const response = await fetch(`/api/menus/${menu._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        alert("Menu updated successfully");
        onSuccess();
        handleClose();
      } else {
        alert(result.error || "Failed to update menu");
      }
    } catch (error) {
      console.error("Error updating menu:", error);
      alert("Error updating menu");
    } finally {
      setSaveLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      description: "",
      categoryId: "",
      price: 0,
      image: "",
      preparationTime: 0,
      isAvailable: true,
      isActive: true,
    });
    setImagePreview("");
    onClose();
  };

  if (!isOpen || !menu) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-fluid-4">
      <div className="bg-white rounded-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-fluid-6 border-b border-gray-100">
          <div className="flex items-center gap-fluid-3">
            <div className="p-fluid-2 bg-purple-50 rounded-lg">
              <Package className="w-fluid-6 h-fluid-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-gray-900 text-fluid-xl font-bold">
                Edit Menu
              </h2>
              <p className="text-gray-500 text-fluid-sm mt-fluid-1">
                Update menu information
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={saveLoading}
          >
            <X className="w-fluid-6 h-fluid-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-fluid-6 space-y-fluid-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-fluid-6">
            {/* Left Column */}
            <div className="space-y-fluid-4">
              {/* Menu Name */}
              <div className="space-y-fluid-2">
                <label className="block text-gray-700 font-medium text-fluid-sm">
                  Menu Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Nasi Goreng Special"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-fluid-base"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-fluid-2">
                <label className="block text-gray-700 font-medium text-fluid-sm">Description</label>
                <textarea
                  placeholder="Describe your menu item..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-fluid-base resize-none"
                />
              </div>

              {/* Category */}
              <div className="space-y-fluid-2">
                <label className="block text-gray-700 font-medium text-fluid-sm">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-fluid-base cursor-pointer"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-fluid-2">
                <label className="block text-gray-700 font-medium text-fluid-sm">
                  Price (IDR) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="50000"
                  value={formData.price || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-fluid-base"
                  required
                />
              </div>

              {/* Preparation Time */}
              <div className="space-y-fluid-2">
                <label className="block text-gray-700 font-medium text-fluid-sm">
                  Preparation Time (minutes)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="15"
                  value={formData.preparationTime || ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preparationTime: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-fluid-4 py-fluid-3 bg-white border border-gray-200 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all text-fluid-base"
                />
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-fluid-4">
              {/* Image Upload */}
              <div className="space-y-fluid-2">
                <label className="block text-gray-700 font-medium text-fluid-sm">
                  Menu Image
                </label>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-fluid-4">
                  {imagePreview ? (
                    <div className="space-y-fluid-3">
                      <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        >
                          <X className="w-fluid-4 h-fluid-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="flex items-center justify-center gap-fluid-2 w-full px-fluid-4 py-fluid-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-fluid-sm"
                      >
                        <Upload className="w-fluid-4 h-fluid-4" />
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-fluid-8">
                      <div className="w-fluid-16 h-fluid-16 mx-auto mb-fluid-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-fluid-8 h-fluid-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-fluid-sm mb-fluid-3">
                        Upload menu image
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="flex items-center justify-center gap-fluid-2 px-fluid-4 py-fluid-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-fluid-sm mx-auto"
                      >
                        {uploadLoading ? (
                          <>
                            <Loader2 className="w-fluid-4 h-fluid-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-fluid-4 h-fluid-4" />
                            Upload Image
                          </>
                        )}
                      </button>
                      <p className="text-gray-500 text-fluid-xs mt-fluid-2">
                        Max 5MB (JPG, PNG, WebP)
                      </p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Availability Status */}
              <div className="flex items-center justify-between p-fluid-3 bg-gray-50 rounded-lg">
                <div className="space-y-fluid-0.5">
                  <label className="text-gray-700 font-medium text-fluid-sm">
                    Available
                  </label>
                  <p className="text-gray-500 text-fluid-xs">
                    Customers can order this item
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
                  <input
                    type="checkbox"
                    id="isAvailable"
                    checked={formData.isAvailable}
                    onChange={(e) =>
                      setFormData({ ...formData, isAvailable: e.target.checked })
                    }
                    className="sr-only"
                  />
                  <label
                    htmlFor="isAvailable"
                    className={cn(
                      "block w-12 h-6 rounded-full cursor-pointer transition-colors",
                      formData.isAvailable ? "bg-purple-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                        formData.isAvailable ? "transform translate-x-6" : ""
                      )}
                    />
                  </label>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center justify-between p-fluid-3 bg-gray-50 rounded-lg">
                <div className="space-y-fluid-0.5">
                  <label className="text-gray-700 font-medium text-fluid-sm">
                    Active
                  </label>
                  <p className="text-gray-500 text-fluid-xs">
                    Show this item in the menu
                  </p>
                </div>
                <div className="relative inline-block w-12 h-6">
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
                      "block w-12 h-6 rounded-full cursor-pointer transition-colors",
                      formData.isActive ? "bg-purple-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                        formData.isActive ? "transform translate-x-6" : ""
                      )}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t border-gray-100 pt-fluid-6 flex gap-fluid-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saveLoading}
              className={cn(
                "flex-1 px-fluid-6 py-fluid-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-fluid-base"
              )}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={saveLoading || uploadLoading}
              className={cn(
                "flex-1 px-fluid-6 py-fluid-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-fluid-2 text-fluid-base"
              )}
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-fluid-5 h-fluid-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-fluid-5 h-fluid-5" />
                  <span>Update Menu</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}