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
  ChevronDown,
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
        {
          label: "Weekly Report",
          path: "/dashboard/admin?view=reports-weekly",
        },
        {
          label: "Monthly Report",
          path: "/dashboard/admin?view=reports-monthly",
        },
      ],
    },
    {
      icon: ShoppingCart,
      label: "All Orders",
      path: "/dashboard/admin?view=orders",
    },
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
        {
          label: "Ready Orders",
          path: "/dashboard/waiter?view=deliveries-ready",
        },
        {
          label: "My Deliveries",
          path: "/dashboard/waiter?view=deliveries-active",
        },
        {
          label: "Completed",
          path: "/dashboard/waiter?view=deliveries-completed",
        },
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
        {
          label: "Weekly Report",
          path: "/dashboard/owner?view=reports-weekly",
        },
        {
          label: "Monthly Report",
          path: "/dashboard/owner?view=reports-monthly",
        },
      ],
    },
    {
      icon: ShoppingCart,
      label: "All Orders",
      path: "/dashboard/owner?view=orders",
    },
  ],

  customer: [
    { icon: LayoutDashboard, label: "Home", path: "/dashboard/customer" },
    {
      icon: ShoppingCart,
      label: "My Orders",
      path: "/dashboard/customer?view=orders",
    },
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
  userName = "John Doe",
  userEmail = "johndoe@gmail.com",
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
          const hasActivePath = menu.submenu.some(
            (sub) => sub.path === currentPath
          );
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
      if (menu.path === path) {
        return menu.label;
      }
      if (menu.submenu) {
        const subItem = menu.submenu.find((sub) => sub.path === path);
        if (subItem) {
          return subItem.label;
        }
      }
    }
    return "Dashboard";
  };

  const toggleMenu = (label: string) => {
    setExpandedMenus((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const handleNavigation = (path: string) => {
    setActiveItem(path);
    const title = getTitleFromPath(path);

    if (onNavigate) {
      onNavigate(path, title);
    }
  };

  const isActive = (path: string): boolean => activeItem === path;

  const isSubmenuActive = (submenu?: SubMenuItem[]): boolean => {
    if (!submenu) return false;
    return submenu.some((item) => isActive(item.path));
  };

  const renderMenuItem = (menu: MenuItem, index: number) => {
    if (menu.submenu && menu.submenu.length > 1) {
      return (
        <div key={index} className="mb-fluid-0.5">
          <button
            onClick={() => toggleMenu(menu.label)}
            className={cn(
              "w-full flex items-center gap-fluid-3 px-fluid-3 py-fluid-2.5 transition-all cursor-pointer",
              isSubmenuActive(menu.submenu) 
                ? "bg-gray-100 text-gray-900" 
                : "text-gray-600 hover:bg-gray-50"
            )}
            style={{borderRadius: fluidSize(8)}}
          >
            <menu.icon className="w-fluid-5 h-fluid-5 flex-shrink-0" />
            <span className="text-fluid-sm font-medium flex-1 text-left">
              {menu.label}
            </span>
            <ChevronDown 
              className={cn(
                "w-fluid-4 h-fluid-4 transition-transform",
                expandedMenus.includes(menu.label) ? "rotate-180" : ""
              )}
            />
          </button>
          {expandedMenus.includes(menu.label) && (
            <div className="ml-fluid-8 mt-fluid-1 space-y-fluid-0.5">
              {menu.submenu.map((sub, j) => (
                <button
                  key={j}
                  onClick={() => handleNavigation(sub.path)}
                  className={cn(
                    "w-full  text-left px-fluid-3 py-fluid-2 text-fluid-sm  transition-all cursor-pointer",
                    isActive(sub.path) 
                      ? "bg-gray-100 text-gray-900 font-medium" 
                      : "text-gray-600 hover:bg-gray-50"
                  )}
                  style={{borderRadius: fluidSize(8)}}
                >
                 <div className="text-fluid-sm"> {sub.label} </div> 
                </button>
              ))}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <button
          key={index}
          onClick={() => menu.path && handleNavigation(menu.path)}
          className={cn(
            "w-full flex items-center gap-fluid-3 px-fluid-3 py-fluid-2.5 transition-all mb-fluid-0.5 cursor-pointer",
            menu.path && isActive(menu.path) 
              ? "bg-gray-100 text-gray-900" 
              : "text-gray-600 hover:bg-gray-50"
            )}
            style={{borderRadius: fluidSize(8)}}
        >
          <menu.icon className="w-fluid-5 h-fluid-5" />
          <span className="text-fluid-sm font-medium">{menu.label}</span>
        </button>
      );
    }
  };

  return (
    <aside className="w-fluid-64 bg-white flex flex-col h-screen sticky top-0">
      {/* Header with logo */}
      <div className="px-fluid-6 pt-fluid-6 pb-fluid-8">
        <span className="text-white tracking-wide bg-black rounded-full px-fluid-4 py-fluid-2 text-fluid-lg font-bold">
          raystorant
        </span>   
      </div>

      {/* Menu Items - All in one section */}
      <div className="flex-1 overflow-y-auto px-fluid-6">
        <div className="mb-fluid-6">
          <nav className="space-y-fluid-0.5">
            {menus.map((menu, i) => renderMenuItem(menu, i))}
          </nav>
        </div>
      </div>

      {/* Footer - Logout Button */}
      <div className="mt-auto px-fluid-6 pb-fluid-6 pt-fluid-4">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-fluid-3 p-fluid-4  text-gray-600 hover:bg-gray-100 rounded-lg transition-all !cursor-pointer"
        >
          <LogOut className="w-fluid-5 h-fluid-5" />
          <span className="text-fluid-sm font-medium">Logout</span> 
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;