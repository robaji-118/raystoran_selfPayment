// app/dashboard/admin/components/modal/menu-add-modal.tsx
"use client";

import { useState, useRef } from "react";
import { X, ImageIcon, Save, Upload, Loader2, Package } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface Category {
  _id: string;
  name: string;
}

interface MenuAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
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

export default function MenuAddModal({
  isOpen,
  onClose,
  onSuccess,
  categories
}: MenuAddModalProps) {
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setToast({ message: "Please select an image file", type: "error" });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setToast({ message: "Image size should be less than 5MB", type: "error" });
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
        setToast({ message: "Image uploaded successfully", type: "success" });
      } else {
        setToast({ message: result.error || "Failed to upload image", type: "error" });
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      setToast({ message: "Error uploading image", type: "error" });
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
      setToast({ message: "Menu name is required", type: "error" });
      return;
    }

    if (!formData.categoryId) {
      setToast({ message: "Please select a category", type: "error" });
      return;
    }

    if (formData.price <= 0) {
      setToast({ message: "Price must be greater than 0", type: "error" });
      return;
    }

    try {
      setSaveLoading(true);

      const response = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setToast({ message: "Menu created successfully", type: "success" });
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1000);
      } else {
        setToast({ message: result.error || "Failed to create menu", type: "error" });
      }
    } catch (error) {
      console.error("Error creating menu:", error);
      setToast({ message: "Error creating menu", type: "error" });
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-gray-200 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-gray-900 text-lg font-bold">
                Add New Menu
              </h2>
              <p className="text-gray-500 text-sm mt-0.5">
                Create a new menu item
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-lg transition-all"
            disabled={saveLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {/* Menu Name */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider">
                  Menu Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  placeholder="e.g., Nasi Goreng Special"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider">
                  Description
                </Label>
                <Textarea
                  placeholder="Describe your menu item..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl resize-none transition-all font-medium text-black placeholder:text-gray-400"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider">
                  Category <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, categoryId: value })
                  }
                >
                  <SelectTrigger className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl font-medium text-black">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white rounded-xl shadow-xl">
                    {categories.map((category) => (
                      <SelectItem key={category._id} value={category._id} className="cursor-pointer">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider">
                  Price (IDR) <span className="text-red-500">*</span>
                </Label>
                <Input
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
                  className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Preparation Time */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider">
                  Preparation Time (minutes)
                </Label>
                <Input
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
                  className="h-12 bg-white border border-gray-300 focus:border-black focus:ring-1 focus:ring-black rounded-xl transition-all font-medium text-black placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Right Column - Image Upload */}
            <div className="space-y-5">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="text-xs font-bold text-black uppercase tracking-wider">
                  Menu Image
                </Label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                  {imagePreview ? (
                    <div className="space-y-3">
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
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                      >
                        <Upload className="w-4 h-4" />
                        Change Image
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-lg flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-gray-600 text-sm mb-3">
                        Upload menu image
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadLoading}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm mx-auto font-medium"
                      >
                        {uploadLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Image
                          </>
                        )}
                      </button>
                      <p className="text-gray-500 text-xs mt-2">
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-black">
                    Available
                  </Label>
                  <p className="text-gray-500 text-xs">
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
                      formData.isAvailable ? "bg-black" : "bg-gray-300"
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
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold text-black">
                    Active
                  </Label>
                  <p className="text-gray-500 text-xs">
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
                      formData.isActive ? "bg-black" : "bg-gray-300"
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
          <div className="border-t border-gray-200 pt-6 flex gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={saveLoading}
              className="flex-1 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all border border-gray-300 hover:border-gray-400"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saveLoading || uploadLoading}
              className="flex-1 px-6 py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saveLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Create Menu</span>
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