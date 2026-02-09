/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/owner/components/top-menus.tsx
"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Star,
  ChevronDown,
  Utensils,
  Info,
  Image as ImageIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface MergedMenuItem {
  id: string;
  name: string;
  count: number;
  revenue: number;
  avgPrice: number;
  description: string;
  image: string;
  categoryName?: string;
}

interface MenuData {
  _id: string;
  name: string;
  description: string;
  image: string;
  categoryId: {
    name: string;
  };
}

export default function TopMenus() {
  const [topMenus, setTopMenus] = useState<MergedMenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [ordersRes, menusRes] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/menus')
      ]);

      const ordersData = await ordersRes.json();
      const menusData = await menusRes.json();

      if (ordersData.success && menusData.success) {
        const menuDetailsMap = new Map<string, MenuData>();

        const menus: MenuData[] = Array.isArray(menusData.data) ? menusData.data : [];
        menus.forEach(menu => {
          menuDetailsMap.set(menu._id, menu);
          menuDetailsMap.set(menu.name.toLowerCase(), menu);
        });

        const menuStats: { [key: string]: MergedMenuItem } = {};

        ordersData.data.forEach((order: any) => {
          if (order.items && Array.isArray(order.items)) {
            order.items.forEach((item: any) => {
              const identifier = item.menuItemId || item.menuItemName;

              if (!menuStats[identifier]) {
                const detail = menuDetailsMap.get(item.menuItemId) || menuDetailsMap.get(item.menuItemName?.toLowerCase());

                menuStats[identifier] = {
                  id: item.menuItemId,
                  name: item.menuItemName,
                  count: 0,
                  revenue: 0,
                  avgPrice: item.price,
                  description: detail?.description || "No description available.",
                  image: detail?.image || "",
                  categoryName: (detail?.categoryId as any)?.name || "General"
                };
              }

              menuStats[identifier].count += item.quantity;
              menuStats[identifier].revenue += (item.subtotal || (item.price * item.quantity));
            });
          }
        });

        const sorted = Object.values(menuStats)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setTopMenus(sorted);
      }
    } catch (error) {
      console.error('Error fetching top menus:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] w-full">
        <div className="text-center">
          <div className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-4 lg:mb-fluid-4" />
          <p className="text-neutral-500 text-base lg:!text-fluid-base">Calculating top products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-fluid-6 bg-white">

      {/* Header Section */}
      <div className="mb-6 lg:mb-fluid-6 flex items-center justify-between">
        <div className="flex items-center gap-3 lg:gap-fluid-3">
          <div className="w-10 h-10 lg:w-fluid-10 lg:h-fluid-10 bg-white border border-gray-100 rounded-xl lg:rounded-[0.833vw] flex items-center justify-center shadow-sm">
            <Star className="w-5 h-5 lg:w-fluid-5 lg:h-fluid-5 text-black fill-black" />
          </div>
          <div>
            <h4 className="text-gray-900 font-bold text-xl lg:!text-fluid-xl">Top 10 Menu Items</h4>
            <p className="text-gray-500 text-sm lg:!text-fluid-sm">Best performing products by volume</p>
          </div>
        </div>
      </div>

      {/* SHADCN ACCORDION IMPLEMENTATION 
        - class 'flex flex-col gap-4' memberikan jarak antar item.
        - type="single" collapsible memastikan hanya satu yang terbuka.
      */}
      <Accordion type="single" collapsible className="flex flex-col gap-4 lg:gap-fluid-4 w-full">
        {topMenus.length > 0 ? (
          topMenus.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              // Styling container Card: border, radius, shadow saat open
              className="group bg-white rounded-2xl lg:rounded-[1.111vw] border border-gray-100 transition-all duration-300 border-b-0"
            >
              <AccordionTrigger className="w-full flex items-center justify-between p-4 lg:p-fluid-5 hover:no-underline [&>svg]:hidden">
                <div className="flex items-center gap-4 lg:gap-fluid-4 text-left">
                  {/* Rank Badge */}
                  <div className={cn(
                    "w-10 h-10 lg:w-fluid-10 lg:h-fluid-10 rounded-xl lg:rounded-[0.833vw] flex items-center justify-center text-base lg:!text-fluid-base font-bold flex-shrink-0 transition-transform group-hover:scale-110",
                    index === 0 ? "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200" :
                      index === 1 ? "bg-gray-200 text-gray-700 ring-1 ring-gray-300" :
                        index === 2 ? "bg-orange-100 text-orange-700 ring-1 ring-orange-200" :
                          "bg-gray-50 text-gray-500 border border-gray-100"
                  )}>
                    #{index + 1}
                  </div>

                  {/* Name & Basic Stats */}
                  <div>
                    <h5 className="font-bold text-gray-900 text-lg lg:!text-fluid-lg">{item.name}</h5>
                    <div className="flex items-center gap-4 lg:gap-fluid-4 mt-1 text-sm lg:!text-fluid-sm text-gray-500">
                      <span className="flex items-center gap-1.5 lg:gap-fluid-1.5 bg-gray-50 px-2 lg:px-fluid-2 py-0.5 lg:py-fluid-0.5 rounded-md lg:rounded-[0.417vw] border border-gray-100">
                        <TrendingUp className="w-3.5 h-3.5 lg:w-fluid-3.5 lg:h-fluid-3.5 text-black" />
                        <span className="font-medium text-gray-700">{item.count}</span> Sold
                      </span>
                      <span className="font-bold text-green-600">
                        Rp {item.revenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Custom Toggle Icon (Matches previous design) */}
                <div className="w-8 h-8 lg:w-fluid-8 lg:h-fluid-8 flex items-center justify-center rounded-full transition-all duration-300 border bg-white text-gray-400 border-gray-100 group-hover:border-gray-300 group-hover:text-gray-600 group-data-[state=open]:bg-black group-data-[state=open]:text-white group-data-[state=open]:border-black group-data-[state=open]:rotate-180">
                  <ChevronDown className="w-4 h-4 lg:w-fluid-4 lg:h-fluid-4" />
                </div>
              </AccordionTrigger>

              <AccordionContent className="p-0 border-t border-gray-100 bg-gray-50/50">
                <div className="p-4 lg:p-fluid-5 flex flex-col md:flex-row gap-4 lg:gap-fluid-6">

                  {/* Image Section */}
                  <div className="w-full md:w-40 lg:md:w-fluid-40 h-40 lg:h-fluid-40 flex-shrink-0 bg-white rounded-xl lg:rounded-[0.833vw] border border-gray-200 overflow-hidden flex items-center justify-center shadow-sm">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-gray-300 flex flex-col items-center gap-2 lg:gap-fluid-2">
                        <ImageIcon className="w-8 h-8 lg:w-fluid-8 lg:h-fluid-8" />
                        <span className="text-xs lg:!text-fluid-xs font-medium">No Image</span>
                      </div>
                    )}
                  </div>

                  {/* Details Section */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs lg:!text-fluid-xs font-bold text-gray-400 uppercase tracking-wider mb-2 lg:mb-fluid-2 flex items-center gap-1 lg:gap-fluid-1">
                        <Info className="w-3 h-3 lg:w-fluid-3 lg:h-fluid-3" /> Description
                      </p>
                      <p className="text-sm lg:!text-fluid-sm text-gray-600 leading-relaxed bg-white p-3 lg:p-fluid-3 rounded-lg lg:rounded-[0.556vw] border border-gray-100">
                        {item.description || "No specific description available for this menu item."}
                      </p>
                    </div>

                    <div className="flex gap-4 lg:gap-fluid-4 mt-4 lg:mt-fluid-4">
                      {/* Category */}
                      <div className="flex-1 bg-white px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 rounded-xl lg:rounded-[0.833vw] border border-gray-100">
                        <p className="text-xs lg:!text-fluid-xs text-gray-400 mb-1 lg:mb-fluid-1 font-medium uppercase">Category</p>
                        <p className="font-bold text-gray-900 text-sm lg:!text-fluid-sm flex items-center gap-2 lg:gap-fluid-2">
                          <span className="w-2 h-2 lg:w-fluid-2 lg:h-fluid-2 rounded-full bg-purple-500"></span>
                          {item.categoryName}
                        </p>
                      </div>

                      {/* Avg Price */}
                      <div className="flex-1 bg-white px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 rounded-xl lg:rounded-[0.833vw] border border-gray-100">
                        <p className="text-xs lg:!text-fluid-xs text-gray-400 mb-1 lg:mb-fluid-1 font-medium uppercase">Avg. Price</p>
                        <p className="font-bold text-gray-900 text-sm lg:!text-fluid-sm">
                          Rp {item.avgPrice.toLocaleString('id-ID')}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>
              </AccordionContent>
            </AccordionItem>
          ))
        ) : (
          <div className="text-center py-12 lg:py-fluid-12 bg-white rounded-2xl lg:rounded-[1.111vw] border border-gray-100 border-dashed">
            <div className="w-16 h-16 lg:w-fluid-16 lg:h-fluid-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-fluid-3">
              <Utensils className="w-8 h-8 lg:w-fluid-8 lg:h-fluid-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium text-base lg:!text-fluid-base">No sales data recorded yet.</p>
            <p className="text-gray-400 text-sm lg:!text-fluid-sm mt-1 lg:mt-fluid-1">Orders will appear here once transactions occur.</p>
          </div>
        )}
      </Accordion>
    </div>
  );
}