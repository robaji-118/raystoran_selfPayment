/* eslint-disable react-hooks/set-state-in-effect */
// components/dashboard/Sidebar.tsx
import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  UtensilsCrossed,
  Table2,
  FileText,
  LogOut,
  ShoppingCart,
  ChefHat,
  Truck,
  TrendingUp,
  ChevronRight,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { fluidSize } from "@/lib/utils";

interface SubMenuItem {
  label: string;
  path: string;
}

interface MenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  submenu?: SubMenuItem[];
}

interface MenuConfig {
  admin: MenuItem[];
  kitchen: MenuItem[];
  waiter: MenuItem[];
  owner: MenuItem[];
  customer: MenuItem[];
}

const menuConfig: MenuConfig = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/admin" },
    { icon: Users, label: "Users", path: "/dashboard/admin?view=users" },
    {
      icon: UtensilsCrossed,
      label: "Menu Management",
      submenu: [
        { label: "Menus", path: "/dashboard/admin?view=menu" },
        { label: "Categories", path: "/dashboard/admin?view=categories" },
      ],
    },
    { icon: Table2, label: "Tables", path: "/dashboard/admin?view=tables" },
    {
      icon: FileText,
      label: "Reports",
      submenu: [
        { label: "Daily Report", path: "/dashboard/admin?view=reports-daily" },
        { label: "Weekly Report", path: "/dashboard/admin?view=reports-weekly" },
        { label: "Monthly Report", path: "/dashboard/admin?view=reports-monthly" },
      ],
    },
    { icon: ShoppingCart, label: "All Orders", path: "/dashboard/admin?view=orders" },
  ],
  kitchen: [
    { icon: ChefHat, label: "Order Antrian", path: "/dashboard/kitchen" }
  ],
  waiter: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/waiter" },
    {
      icon: Truck,
      label: "Deliveries",
      submenu: [
        { label: "Ready Orders", path: "/dashboard/waiter?view=deliveries-ready" },
        { label: "My Deliveries", path: "/dashboard/waiter?view=deliveries-active" },
        { label: "Completed", path: "/dashboard/waiter?view=deliveries-completed" },
      ],
    },
  ],
  owner: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard/owner" },
    { icon: TrendingUp, label: "Menu Terlaris", path: "/dashboard/owner?view=top-menus" },
    {
      icon: FileText,
      label: "Reports",
      submenu: [
        { label: "Daily Report", path: "/dashboard/owner?view=reports-daily" },
        { label: "Weekly Report", path: "/dashboard/owner?view=reports-weekly" },
        { label: "Monthly Report", path: "/dashboard/owner?view=reports-monthly" },
      ],
    },
    { icon: ShoppingCart, label: "All Orders", path: "/dashboard/owner?view=orders" },
  ],
  customer: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/customer" },
    { icon: ShoppingCart, label: "My Orders", path: "/dashboard/customer?view=orders" },
  ],
};

type UserRole = keyof typeof menuConfig;

interface SidebarProps {
  role?: UserRole;
  userName?: string;
  userEmail?: string;
  onLogout?: () => void;
  onNavigate?: (path: string, title: string) => void;
  currentPath?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
  role = "admin",
  onLogout = () => alert("Logout clicked"),
  onNavigate,
  currentPath,
}) => {
  const [activeItem, setActiveItem] = useState<string>(
    currentPath || "/dashboard/admin"
  );
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    if (currentPath) {
      setActiveItem(currentPath);
      const menus = menuConfig[role];
      menus.forEach((menu) => {
        if (menu.submenu && menu.submenu.length > 1) {
          const hasActivePath = menu.submenu.some((sub) => sub.path === currentPath);
          if (hasActivePath && !expandedMenus.includes(menu.label)) {
            setExpandedMenus((prev) => [...prev, menu.label]);
          }
        }
      });
    }
  }, [currentPath, role]);

  const menus = menuConfig[role];

  const getTitleFromPath = (path: string): string => {
    for (const menu of menus) {
      if (menu.path === path) return menu.label;
      if (menu.submenu) {
        const subItem = menu.submenu.find((sub) => sub.path === path);
        if (subItem) return subItem.label;
      }
    }
    return "Dashboard";
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleNavigation = (path: string) => {
    setActiveItem(path);
    const title = getTitleFromPath(path);
    if (onNavigate) onNavigate(path, title);
  };

  const isActive = (path: string): boolean => activeItem === path;

  const isSubmenuActive = (submenu?: SubMenuItem[]): boolean => {
    if (!submenu) return false;
    return submenu.some((item) => isActive(item.path));
  };

  const renderMenuItem = (menu: MenuItem, index: number) => {
    const isParentActive = isSubmenuActive(menu.submenu);
    const isExpanded = expandedMenus.includes(menu.label);

    return (
      <div key={index}>
        {menu.submenu && menu.submenu.length > 1 ? (
          <div className="group mb-fluid-2">
            <button
              onClick={() => toggleMenu(menu.label)}
              className={cn(
                "relative w-full flex items-center gap-fluid-3 px-fluid-4 py-fluid-3 transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                isParentActive 
                  ? "bg-gray-50 text-black" 
                  : "text-gray-500 hover:text-black hover:bg-gray-50/50"
              )}
              style={{ borderRadius: fluidSize(12) }}
            >
              {/* Active Indicator Bar (Fluid Sized) */}
              {isParentActive && (
                <div 
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-black shadow-sm"
                  style={{ 
                    width: fluidSize(4), 
                    height: fluidSize(24), 
                    borderTopRightRadius: fluidSize(99), 
                    borderBottomRightRadius: fluidSize(99) 
                  }} 
                />
              )}

              <menu.icon 
                className={cn(
                  "w-fluid-5 h-fluid-5 flex-shrink-0 transition-transform duration-300",
                  isParentActive ? "text-black scale-105" : "group-hover:scale-105"
                )} 
              />
              
              <span className={cn(
                "text-fluid-sm font-medium flex-1 text-left transition-all duration-300",
                isParentActive ? "font-semibold translate-x-1" : "group-hover:translate-x-1"
              )}>
                {menu.label}
              </span>
              
              <ChevronRight 
                className={cn(
                  "w-fluid-4 h-fluid-4 transition-transform duration-300 text-gray-400",
                  isExpanded ? "rotate-90 text-black" : "group-hover:text-black"
                )}
              />
            </button>
            
            {/* Submenu Container */}
            <div 
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100 mt-fluid-1" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="relative ml-fluid-6 pl-fluid-4 border-l border-gray-100 space-y-fluid-1 py-fluid-1">
                  {menu.submenu.map((sub, j) => {
                    const isSubItemActive = isActive(sub.path);
                    return (
                      <button
                        key={j}
                        onClick={() => handleNavigation(sub.path)}
                        className={cn(
                          "w-full text-left px-fluid-3 py-fluid-2 !text-fluid-sm transition-all duration-200 cursor-pointer flex items-center gap-fluid-2 group/sub",
                          isSubItemActive 
                            ? "text-black bg-gray-50" 
                            : "text-gray-500 hover:text-black hover:bg-gray-50/50"
                        )}
                        style={{ borderRadius: fluidSize(8) }}
                      >
                         {/* Modern Submenu Dot Indicator */}
                         <div 
                            className={cn(
                              "rounded-full transition-all duration-300",
                              isSubItemActive 
                                  ? "bg-black scale-110" 
                                  : "bg-gray-300 group-hover/sub:bg-gray-400"
                            )}
                            style={{ width: fluidSize(6), height: fluidSize(6) }} 
                         />
                         
                         <span className={cn(
                           "transition-transform duration-200",
                           isSubItemActive ? "translate-x-1" : "group-hover/sub:translate-x-1"
                         )}>
                            {sub.label}
                         </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => menu.path && handleNavigation(menu.path)}
            className={cn(
              "relative w-full flex items-center gap-fluid-3 px-fluid-4 py-fluid-3 mb-fluid-2 transition-all duration-300 ease-in-out cursor-pointer group",
              isActive(menu.path || "")
                ? "bg-gray-50 text-black shadow-sm" 
                : "text-gray-500 hover:text-black hover:bg-gray-50/50"
            )}
            style={{ borderRadius: fluidSize(12) }}
          >
            {/* Active Indicator Bar */}
            {isActive(menu.path || "") && (
              <div 
                className="absolute left-0 top-1/2 -translate-y-1/2 bg-black shadow-sm"
                style={{ 
                  width: fluidSize(4), 
                  height: fluidSize(24), 
                  borderTopRightRadius: fluidSize(99), 
                  borderBottomRightRadius: fluidSize(99) 
                }} 
              />
            )}

            <menu.icon 
              className={cn(
                "w-fluid-5 h-fluid-5 flex-shrink-0 transition-transform duration-300",
                isActive(menu.path || "") ? "text-black scale-105" : "group-hover:scale-105"
              )} 
            />
            
            <span className={cn(
              "text-fluid-sm font-medium transition-all duration-300",
              isActive(menu.path || "") ? "font-semibold translate-x-1" : "group-hover:translate-x-1"
            )}>
              {menu.label}
            </span>
          </button>
        )}
      </div>
    );
  };

  return (
    <aside 
      className="bg-white flex flex-col h-screen sticky top-0  z-20"
      style={{ width: fluidSize(256) }} // w-64 equivalent
    >
      {/* Header with logo */}
      <div className="p-fluid-6">
        <div className="flex items-center gap-fluid-2">
           <span className="font-bold tracking-tight text-black" style={{ fontSize: fluidSize(20) }}>
             raystorant
           </span>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto px-fluid-2 scrollbar-hide">
        <nav className="space-y-fluid-1">
          {menus.map((menu, i) => renderMenuItem(menu, i))}
        </nav>
      </div>

      {/* Footer - Logout Button */}
      <div className="mt-auto px-fluid-4 pb-fluid-6 pt-fluid-4 border-t border-gray-50">
        <button
          onClick={onLogout}
          className="group w-full flex items-center gap-fluid-3 px-fluid-4 py-fluid-3 text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer"
          style={{ borderRadius: fluidSize(12) }}
        >
          <LogOut className="w-fluid-5 h-fluid-5 transition-transform group-hover:-translate-x-1" />
          <span className="text-fluid-sm font-medium">Logout</span> 
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;