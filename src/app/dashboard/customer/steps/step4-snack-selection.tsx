/* eslint-disable @next/next/no-img-element */
// app/dashboard/customer/steps/step4-snack-selection.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Minus, Cookie, Clock, ImageIcon } from "lucide-react";
import { CartItem } from "../components/dashboard-main";
import { cn } from "@/lib/utils";

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

interface Step4SnackSelectionProps {
  cart: CartItem[];
  onAddToCart: (item: CartItem) => void;
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onRemoveItem: (menuItemId: string) => void;
}

export default function Step4SnackSelection({
  cart,
  onAddToCart,
  onUpdateQuantity,
}: Step4SnackSelectionProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const res = await fetch("/api/menus?availableOnly=true&activeOnly=true");
      if (res.ok) {
        const response = await res.json();
        const items = response.success && Array.isArray(response.data) ? response.data : [];
        
        // Filter hanya untuk snack/camilan
        const snackItems = items.filter((item: MenuItem) => {
          const categoryName = item.categoryId?.name?.toLowerCase() || '';
          return categoryName.includes('snack') || 
                 categoryName.includes('camilan') ||
                 categoryName.includes('dessert') ||
                 categoryName.includes('kudapan') ||
                 categoryName.includes('jajanan') ||
                 categoryName.includes('appetizer');
        });
        
        setMenuItems(snackItems);
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

  return (
    <div className="space-y-6">
      {menuItems.length > 0 ? (
        // MOBILE: Flex Column (List), DESKTOP: Grid
        <div className="flex flex-col sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {menuItems.map((item) => {
            const cartQuantity = getCartQuantity(item._id);
            const imageUrl = getImageUrl(item.image);
            const isSoldOut = !item.isAvailable;
            
            return (
              <div
                key={item._id}
                className={cn(
                  "group relative bg-white rounded-2xl overflow-hidden transition-all duration-300 border border-gray-100 shadow-sm",
                  // MOBILE STYLE: Horizontal Layout
                  "flex flex-row sm:flex-col h-28 sm:h-auto"
                )}
              >
                {/* --- IMAGE SECTION --- */}
                <div 
                  className={cn(
                    "relative bg-gray-100 overflow-hidden flex-shrink-0",
                    // Mobile: Fixed width 110px
                    "w-[110px] h-full",
                    // Desktop: Full width, aspect ratio
                    "sm:w-full sm:h-auto sm:aspect-[4/3]"
                  )}
                >
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
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                      <Cookie className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Sold Out Overlay */}
                  {isSoldOut && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-white px-2 py-1 bg-black/50 rounded">
                        SOLD
                      </span>
                    </div>
                  )}

                  {/* Time Badge */}
                  <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3">
                    <div className="bg-white/90 backdrop-blur-sm px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full flex items-center gap-1 shadow-sm text-[10px] sm:text-xs">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="font-medium text-gray-900">{item.preparationTime}m</span>
                    </div>
                  </div>
                </div>

                {/* --- CONTENT SECTION --- */}
                <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                  <div>
                    {/* Name */}
                    <h4 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-2 leading-tight mb-1 sm:mb-2">
                      {item.name}
                    </h4>
                    {/* Price */}
                    <p className="text-sm font-semibold text-gray-500">
                      Rp {item.price.toLocaleString()}
                    </p>
                  </div>

                  {/* --- QUANTITY CONTROLS --- */}
                  <div className="flex items-center justify-end mt-2">
                    {cartQuantity === 0 ? (
                      <button
                        onClick={() => onAddToCart({
                          menuItemId: item._id,
                          menuItemName: item.name,
                          price: item.price,
                          quantity: 1,
                          category: 'snack'
                        })}
                        disabled={isSoldOut}
                        className={cn(
                          "flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95",
                          isSoldOut
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-black text-white hover:bg-gray-800 shadow-sm"
                        )}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                      </button>
                    ) : (
                      <div className="flex items-center bg-gray-50 rounded-full border border-gray-200 p-0.5 shadow-sm animate-in zoom-in duration-200">
                        <button
                          onClick={() => onUpdateQuantity(item._id, cartQuantity - 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-white hover:bg-gray-100 text-gray-900 rounded-full transition-colors border border-gray-100 shadow-sm"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        
                        <span className="w-6 sm:w-8 text-center text-sm font-bold text-gray-900">
                          {cartQuantity}
                        </span>
                        
                        <button
                          onClick={() => onUpdateQuantity(item._id, cartQuantity + 1)}
                          className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center bg-black hover:bg-gray-800 text-white rounded-full transition-colors shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
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
        <div className="text-center py-16 bg-white rounded-3xl border border-gray-100">
          <div className="w-16 h-16 bg-gray-50 rounded-full mx-auto mb-4 flex items-center justify-center">
            <Cookie className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-900 font-bold text-lg mb-1">No Snack Items</p>
          <p className="text-sm text-gray-500">Check back later for menu updates</p>
        </div>
      )}
    </div>
  );
}