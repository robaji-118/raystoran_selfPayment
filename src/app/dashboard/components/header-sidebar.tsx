// components/dashboard/header-sidebar.tsx
import React from 'react';
import { Bell, Search, Settings, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  pageTitle?: string;
  userName?: string;
  userRole?: 'admin' | 'kitchen' | 'waiter' | 'owner' | 'customer';
  onMenuClick?: () => void;
  showSearch?: boolean;
  showNotifications?: boolean;
  notificationCount?: number;
}

const HeaderSidebar: React.FC<HeaderProps> = ({
  pageTitle = 'Dashboard',
  userName = 'John Doe',
  userRole = 'admin',
  onMenuClick,
  showSearch = true,
  showNotifications = true,
  notificationCount = 0
}) => {
  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      admin: 'bg-neutral-100 text-fluid-sm text-black rounded-full items-center justify-center',
      kitchen: 'bg-neutral-100 text-fluid-sm text-black',
      waiter: 'bg-neutral-100 text-fluid-sm text-black',
      owner: 'bg-neutral-100 text-fluid-sm text-black',
      customer: 'bg-neutral-100 text-fluid-sm text-black',
    };
    return colors[role] || colors.admin;
  };

  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      admin: 'admin',
      kitchen: 'Kkitchen',
      waiter: 'waiter',
      owner: 'owner',
      customer: 'customer',
    };
    return labels[role] || role;
  };

  return (
    <header className="bg-white sticky top-0 z-40">
      <div className="px-fluid-6 py-fluid-4">
        <div className="flex items-center justify-between gap-fluid-4">
          {/* Left Section: Menu + Title */}
          <div className="flex items-center gap-fluid-4 flex-1 min-w-0">
            {/* Mobile Menu Button */}
            {onMenuClick && (
              <button
                onClick={onMenuClick}
                className="lg:hidden p-fluid-2 hover:bg-neutral-100 rounded-lg transition-colors"
                aria-label="Toggle menu"
              >
                <Menu className="w-fluid-6 h-fluid-6 text-neutral-700" />
              </button>
            )}

            {/* Page Title */}
            <div className="min-w-0">
              <h1 className="font-bold text-fluid-2xl text-neutral-950">
                {pageTitle}
              </h1>
              <p className="text-sm text-neutral-500 mt-fluid-0.5">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right Section: Search + Notifications + User */}
          <div className="flex items-center gap-fluid-3">
            {/* Notifications */}
            {showNotifications && (
              <button className="relative p-fluid-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <Bell className="w-fluid-6 h-fluid-6 text-neutral-600" />
                {notificationCount > 0 && (
                  <span className="absolute top-fluid-1 right-fluid-1 w-fluid-5 h-fluid-5 bg-red-500 text-white text-fluid-xs font-semibold rounded-full flex items-center justify-center">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
            )}

            {/* User Info */}
            <div className="hidden sm:flex items-center gap-fluid-2 pl-fluid-3 border-l border-neutral-200">
              <div className="text-right flex flex-col gap-fluid-1">
                <p className="label-sm font-bold text-neutral-950">{userName}</p>
                <span className="bg-neutral-100 text-fluid-xs px-fluid-2 text-black rounded-full items-center justify-center">
                  {getRoleLabel(userRole)}
                </span>
              </div>
              <div className="w-fluid-10 h-fluid-10 text-fluid-lg bg-black rounded-full flex items-center justify-center text-white font-semibold">
                {userName.split(' ').map(n => n[0]).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderSidebar;