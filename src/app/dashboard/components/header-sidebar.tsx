// components/dashboard/header-sidebar.tsx
import React from "react";
import { Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderProps {
  pageTitle?: string;
  userName?: string;
  userRole?: "admin" | "kitchen" | "waiter" | "owner" | "customer";
  onMenuClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
}

const HeaderSidebar: React.FC<HeaderProps> = ({
  pageTitle = "Dashboard",
  userName = "John Doe",
  userRole = "admin",
  onMenuClick,
  showSearch = true,
  showNotifications = true,
  notificationCount = 0,
}) => {
  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: "Admin",
      kitchen: "Kitchen",
      waiter: "Waiter",
      owner: "Owner",
      customer: "Customer",
    };
    return labels[role] || role;
  };

  return (
    <header className="bg-white sticky top-0 z-40">
      <div className="px-4 py-3 lg:px-fluid-6 lg:py-fluid-4">
        <div className="flex items-center justify-between gap-4 lg:gap-fluid-4">
          {/* Left Section: Menu + Title */}
          <div className="flex items-center gap-3 lg:gap-fluid-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6 text-neutral-700" />
              </button>
            )}

            {/* Page Title */}
            <div className="min-w-0">
              <h1 className="font-bold text-xl lg:text-fluid-2xl text-neutral-950">
                {pageTitle}
              </h1>
              <p className="text-xs lg:text-fluid-sm text-neutral-500 mt-0.5 lg:mt-fluid-0.5">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Right Section: Notifications + User */}
          <div className="flex items-center gap-2 lg:gap-fluid-3">
            {/* User Info */}
            <div className="hidden sm:flex items-center gap-2 lg:gap-fluid-3 pl-2 lg:pl-fluid-3 border-l border-neutral-200/50">
              {/* Name & Role */}
              <div className="flex flex-col items-end justify-center gap-0.5 lg:gap-fluid-0.5">
                <p className="text-sm lg:text-fluid-sm font-bold text-neutral-950 leading-none">
                  {userName}
                </p>
                {/* Badge Role */}
                <span className="inline-flex items-center justify-center bg-neutral-100 px-2 lg:px-fluid-2 py-0.5 lg:py-fluid-0.5 rounded-full text-xs lg:text-fluid-xs font-medium text-black mt-0.5 lg:mt-fluid-0.5">
                  {getRoleLabel(userRole)}
                </span>
              </div>

              {/* Avatar */}
              <div className="w-9 h-9 lg:w-fluid-10 lg:h-fluid-10 bg-black uppercase rounded-full flex items-center justify-center text-white font-semibold text-base lg:text-fluid-lg shrink-0">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .substring(0, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSidebar;
