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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("Owner Dashboard");

  const currentView = searchParams.get('view') || 'dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();

      if (!userData) {
        router.replace('/login');
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
    switch (currentView) {
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
    router.replace('/login');
  };

  const handleNavigate = (path: string, title: string) => {
    setCurrentTitle(title);
    router.push(path);
    setIsSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
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

  if (!user) return null;

  return (
    <div className="flex h-screen">
      {/* Responsive Sidebar */}
      <Sidebar
        role="owner"
        userName={user.username}
        userEmail={user.email}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPath={`/dashboard/owner${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

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

        <main className="flex-1 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}