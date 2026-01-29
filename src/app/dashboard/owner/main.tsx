/* eslint-disable react-hooks/exhaustive-deps */
// app/dashboard/owner/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, logout } from "@/lib/auth-client";
import Sidebar from "../components/Sidebar";
import HeaderSidebar from "../components/header-sidebar";
import OwnerDashboardMain from "./components/owner-dashboard-main";
import TopMenus from "./components/top-menus";
import DailyReport from "./components/daily-raport";
import WeeklyReport from "./components/weekly-report";
import MonthlyReport from "./components/monthly-report";
import AllOrders from "./components/all-orders";

export default function OwnerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: string; username: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("Owner Dashboard");
  
  const currentView = searchParams.get('view') || 'dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();
      
      if (!userData) {
        router.push('/login');
        return;
      }

      if (userData.role !== 'owner') {
        router.push(`/dashboard/${userData.role}`);
        return;
      }
      
      setUser(userData);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    switch(currentView) {
      case 'dashboard':
        setCurrentTitle('Owner Dashboard');
        break;
      case 'top-menus':
        setCurrentTitle('Menu Terlaris');
        break;
      case 'reports-daily':
        setCurrentTitle('Daily Report');
        break;
      case 'reports-weekly':
        setCurrentTitle('Weekly Report');
        break;
      case 'reports-monthly':
        setCurrentTitle('Monthly Report');
        break;
      case 'orders':
        setCurrentTitle('All Orders');
        break;
      default:
        setCurrentTitle('Owner Dashboard');
    }
  }, [currentView]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigate = (path: string, title: string) => {
    setCurrentTitle(title);
    router.push(path);
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <OwnerDashboardMain />;
      case 'top-menus':
        return <TopMenus />;
      case 'reports-daily':
        return <DailyReport />;
      case 'reports-weekly':
        return <WeeklyReport />;
      case 'reports-monthly':
        return <MonthlyReport />;
      case 'orders':
        return <AllOrders />;
      default:
        return <OwnerDashboardMain />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading Owner Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar untuk desktop */}
      <div className={`hidden lg:block ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
        <Sidebar 
          role="owner"
          userName={user.username}
          userEmail={user.email}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPath={`/dashboard/owner${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`}
        />
      </div>
      
      {/* Sidebar untuk mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <Sidebar 
              role="owner"
              userName={user.username}
              userEmail={user.email}
              onLogout={handleLogout}
              onNavigate={(path, title) => {
                handleNavigate(path, title);
                setIsSidebarOpen(false);
              }}
              currentPath={`/dashboard/owner${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderSidebar
          pageTitle={currentTitle}
          userName={user.username}
          userRole="owner"
          onMenuClick={handleMenuClick}
          showSearch={false}
          showNotifications={true}
          notificationCount={0}
        />
        
        <main className="flex-1 overflow-auto bg-neutral-50">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}