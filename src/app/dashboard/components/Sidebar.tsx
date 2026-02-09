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
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
        { label: "Order Deliveries", path: "/dashboard/waiter?view=deliveries-active" },
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
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  role = "admin",
  onLogout = () => alert("Logout clicked"),
  onNavigate,
  currentPath,
  isOpen = false,
  onClose,
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
    // Close sidebar on mobile after navigation
    if (onClose) onClose();
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
          <div className="group mb-2 lg:mb-fluid-2">
            <button
              onClick={() => toggleMenu(menu.label)}
              className={cn(
                "relative w-full flex items-center gap-3 lg:gap-fluid-3 px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 rounded-xl lg:rounded-[0.833vw] transition-all duration-300 ease-in-out cursor-pointer overflow-hidden",
                isParentActive
                  ? "bg-gray-50 text-black"
                  : "text-gray-500 hover:text-black hover:bg-gray-50/50"
              )}
            >
              {/* Active Indicator Bar */}
              {isParentActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-black shadow-sm w-1 lg:w-[0.278vw] h-6 lg:h-[1.667vw] rounded-r-full" />
              )}

              <menu.icon
                className={cn(
                  "w-5 h-5 lg:w-fluid-5 lg:h-fluid-5 flex-shrink-0 transition-transform duration-300",
                  isParentActive ? "text-black scale-105" : "group-hover:scale-105"
                )}
              />

              <span className={cn(
                "text-sm lg:text-fluid-sm font-medium flex-1 text-left transition-all duration-300",
                isParentActive ? "font-semibold translate-x-1" : "group-hover:translate-x-1"
              )}>
                {menu.label}
              </span>

              <ChevronRight
                className={cn(
                  "w-4 h-4 lg:w-fluid-4 lg:h-fluid-4 transition-transform duration-300 text-gray-400",
                  isExpanded ? "rotate-90 text-black" : "group-hover:text-black"
                )}
              />
            </button>

            {/* Submenu Container */}
            <div
              className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100 mt-1 lg:mt-fluid-1" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <div className="overflow-hidden">
                <div className="relative ml-6 lg:ml-fluid-6 pl-4 lg:pl-fluid-4 border-l border-gray-100 space-y-1 lg:space-y-fluid-1 py-1 lg:py-fluid-1">
                  {menu.submenu.map((sub, j) => {
                    const isSubItemActive = isActive(sub.path);
                    return (
                      <button
                        key={j}
                        onClick={() => handleNavigation(sub.path)}
                        className={cn(
                          "w-full text-left px-3 lg:px-fluid-3 py-2 lg:py-fluid-2 text-sm lg:!text-fluid-sm rounded-lg lg:rounded-[0.556vw] transition-all duration-200 cursor-pointer flex items-center gap-2 lg:gap-fluid-2 group/sub",
                          isSubItemActive
                            ? "text-black bg-gray-50"
                            : "text-gray-500 hover:text-black hover:bg-gray-50/50"
                        )}
                      >
                        {/* Modern Submenu Dot Indicator */}
                        <div
                          className={cn(
                            "w-1.5 h-1.5 lg:w-[0.417vw] lg:h-[0.417vw] rounded-full transition-all duration-300",
                            isSubItemActive
                              ? "bg-black scale-110"
                              : "bg-gray-300 group-hover/sub:bg-gray-400"
                          )}
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
              "relative w-full flex items-center gap-3 lg:gap-fluid-3 px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 mb-2 lg:mb-fluid-2 rounded-xl lg:rounded-[0.833vw] transition-all duration-300 ease-in-out cursor-pointer group",
              isActive(menu.path || "")
                ? "bg-gray-50 text-black shadow-sm"
                : "text-gray-500 hover:text-black hover:bg-gray-50/50"
            )}
          >
            {/* Active Indicator Bar */}
            {isActive(menu.path || "") && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 bg-black shadow-sm w-1 lg:w-[0.278vw] h-6 lg:h-[1.667vw] rounded-r-full" />
            )}

            <menu.icon
              className={cn(
                "w-5 h-5 lg:w-fluid-5 lg:h-fluid-5 flex-shrink-0 transition-transform duration-300",
                isActive(menu.path || "") ? "text-black scale-105" : "group-hover:scale-105"
              )}
            />

            <span className={cn(
              "text-sm lg:text-fluid-sm font-medium transition-all duration-300",
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
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          "bg-white flex flex-col h-screen z-50 transition-transform duration-300 ease-in-out",
          // Mobile: fixed position, slide in from left
          "fixed lg:sticky top-0 left-0",
          // Mobile: hidden by default, shown when isOpen
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          // Width: fixed 256px on mobile, fluid on desktop
          "w-64 lg:w-[17.778vw]"
        )}
      >
        {/* Header with logo */}
        <div className="p-6 lg:p-fluid-6 flex items-center justify-between">
          <div className="flex items-center gap-2 lg:gap-fluid-2">
            <span className="font-bold tracking-tight text-black text-xl lg:text-[1.389vw]">
              raystorant
            </span>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 lg:px-fluid-2 scrollbar-hide">
          <nav className="space-y-1 lg:space-y-fluid-1">
            {menus.map((menu, i) => renderMenuItem(menu, i))}
          </nav>
        </div>

        {/* Footer - Logout Button */}
        <div className="mt-auto px-4 lg:px-fluid-4 pb-6 lg:pb-fluid-6 pt-4 lg:pt-fluid-4 border-t border-gray-50">
          <button
            onClick={onLogout}
            className="group w-full flex items-center gap-3 lg:gap-fluid-3 px-4 lg:px-fluid-4 py-3 lg:py-fluid-3 rounded-xl lg:rounded-[0.833vw] text-gray-500 hover:bg-red-50 hover:text-red-600 transition-all duration-300 cursor-pointer"
          >
            <LogOut className="w-5 h-5 lg:w-fluid-5 lg:h-fluid-5 transition-transform group-hover:-translate-x-1" />
            <span className="text-sm lg:text-fluid-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;