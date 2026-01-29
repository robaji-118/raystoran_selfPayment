/* eslint-disable @next/next/no-img-element */
// app/dashboard/customer/steps/step2-food-selection.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, ChefHat, Clock, ImageIcon, ShoppingBag } from "lucide-react";
import { CartItem } from "../components/dashboard-main";

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  preparationTime: number;
  categoryId?: {
    _id: string;
    name: string;
  };
  isAvailable: boolean;
}

interface Step2FoodSelectionProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export default function Step2FoodSelection({
  cart,
  onAddToCart,
  onUpdateQuantity,
}: Step2FoodSelectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [animatingOut, setAnimatingOut] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/menus?availableOnly=true&activeOnly=true");
      if (res.ok) {
        const response = await res.json();
        const items = response.success && Array.isArray(response.data) ? response.data : [];
        
        const foodItems = items.filter((item: MenuItem) => {
          const categoryName = item.categoryId?.name?.toLowerCase() || '';
          return categoryName.includes('food') || categoryName.includes('makanan');
        });
        
        setMenuItems(foodItems);
      }
    } catch (error) {
      console.error("Error fetching menu:", error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-3 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  const getCartQuantity = (menuItemId: string) => {
    const item = cart.find(i => i.menuItemId === menuItemId);
    return item ? item.quantity : 0;
  };

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/')) return `${process.env.NEXT_PUBLIC_BASE_URL || ''}${imagePath}`;
    return `/uploads/${imagePath}`;
  };

  const handleDecreaseQuantity = (menuItemId: string, currentQuantity: number) => {
    if (currentQuantity === 1) {
      // Trigger animasi keluar sebelum menghapus
      setAnimatingOut(prev => ({ ...prev, [menuItemId]: true }));
      
      // Tunggu animasi selesai baru update quantity
      setTimeout(() => {
        onUpdateQuantity(menuItemId, 0);
        setAnimatingOut(prev => ({ ...prev, [menuItemId]: false }));
      }, 200); // Durasi sama dengan animasi
    } else {
      onUpdateQuantity(menuItemId, currentQuantity - 1);
    }
  };

  return (
    <div className="space-y-6">
      {menuItems.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 lg:gap-6">
          {menuItems.map((item) => {
            const cartQuantity = getCartQuantity(item._id);
            const imageUrl = getImageUrl(item.image);
            const isSoldOut = !item.isAvailable;
            
            return (
              <div
                key={item._id}
                className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-300 border border-gray-100"
              >
                {/* Image Container with aspect ratio */}
                <div className="relative bg-gray-100 overflow-hidden" style={{ paddingBottom: '90%' }}>
                  {imageUrl ? (
                    <img 
                      src={imageUrl}
                      alt={item.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
                      <ImageIcon className="w-20 h-20 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Sold Out Overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <div className="bg-white/95 px-6 py-3 rounded-full shadow-xl">
                        <span className="text-base font-bold text-black">
                          SOLD OUT
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Time Badge */}
                  <div className="absolute bottom-4 right-2">
                    <div className="bg-white/95 backdrop-blur-sm p-2 rounded-full flex items-center gap-2 shadow-lg border border-gray-200">
                      <Clock className="w-4 h-4 text-gray-700" />
                      <span className="!text-sm text-black">{item.preparationTime}m</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5">
                  {/* Price */}
                  <div className="mb-4">
                    <p className="!text-sm lg:text-3xl font-bold text-gray-500">
                      Rp {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* Name */}
                  <h4 className="lg:text-lg text-gray-700 font-semibold line-clamp-2 leading-tight mb-4 min-h-[3rem]">
                    {item.name}
                  </h4>

                  {/* Action Button / Quantity Controls - Container dengan posisi relative */}
                  <div className="relative h-10 flex items-center justify-end">
                    {/* Plus Button (Always visible as base) */}
                    <button
                      onClick={() => {
                        if (cartQuantity === 0) {
                          onAddToCart({
                            menuItemId: item._id,
                            menuItemName: item.name,
                            price: item.price,
                            quantity: 1,
                            category: 'food'
                          });
                        } else {
                          onUpdateQuantity(item._id, cartQuantity + 1);
                        }
                      }}
                      disabled={isSoldOut}
                      className={`w-10 h-10 flex items-center justify-center rounded-full font-bold transition-all active:scale-95 ${
                        isSoldOut
                          ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                          : "bg-gray-900 hover:bg-gray-800 text-white shadow-lg"
                      }`}
                    >
                      <Plus className="w-5 h-5 text-white" />
                    </button>

                    {/* Quantity Controls Overlay - Muncul di atas Plus button */}
                    {cartQuantity > 0 && (
                      <div className="absolute right-0 bg-white px-2 py-2 flex items-center gap-2 rounded-full animate-in slide-in-from-right duration-200">
                        {/* Minus Button */}
                        <button
                          onClick={() => onUpdateQuantity(item._id, cartQuantity - 1)}
                          className="w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-50 text-gray-900 rounded-full transition-all active:scale-90 shadow-sm border border-gray-200"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        
                        {/* Quantity Display */}
                        <span className="text-base font-bold text-gray-900 min-w-[24px] text-center">
                          {cartQuantity}
                        </span>
                        
                        {/* Plus Button (dalam quantity controls) */}
                        <button
                          onClick={() => onUpdateQuantity(item._id, cartQuantity + 1)}
                          className="w-10 h-10 flex items-center justify-center bg-gray-900 hover:bg-gray-800 text-white rounded-full transition-all active:scale-90 shadow-lg"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-24 bg-white rounded-3xl shadow-lg">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <ChefHat className="w-12 h-12 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-xl mb-3">No Food Items Available</p>
          <p className="text-base text-gray-500">
            Check back later for menu updates
          </p>
        </div>
      )}
    </div>
  );
}