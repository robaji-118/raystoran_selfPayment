/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, logout } from "@/lib/auth-client";
import Sidebar from "../components/Sidebar"; 
import HeaderSidebar from "../components/header-sidebar";

import DashboardMain from "./components/dashboard-main";
import UserList from "./components/user-list";
import CategoryList from "./components/category-list";
import MenuList from "./components/menu-list";
import TableList from "./components/table-list";
import AdminDailyReport from "./components/admin-daily-report";
import AdminWeeklyReport from "./components/admin-weekly-report";
import AdminMonthlyReport from "./components/admin-monthly-report";
import AdminAllOrders from "./components/admin-all-orders";

type UserData = {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName?: string;
};

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const currentView = searchParams.get('view') || 'dashboard';
  const currentPath = `/dashboard/admin${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`;

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();
      
      if (!userData) {
        router.push('/login');
        return;
      }

      if (userData.role !== 'admin') {
        router.push(`/dashboard/${userData.role}`);
        return;
      }
      
      const userWithFullName: UserData = {
        ...userData,
        fullName: userData.fullName || userData.username
      };
      
      setUser(userWithFullName);
      setLoading(false);
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const titles: Record<string, string> = {
      'dashboard': 'Dashboard',
      'users': 'Users Management',
      'menu': 'Menu Management',
      'categories': 'Category Management',
      'tables': 'Tables Management',
      'orders': 'All Orders',
      'reports-daily': 'Daily Report',
      'reports-weekly': 'Weekly Report',
      'reports-monthly': 'Monthly Report'
    };
    setPageTitle(titles[currentView] || 'Dashboard');
  }, [currentView]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigate = (path: string, title: string) => {
    setPageTitle(title);
    router.push(path);
    setIsSidebarOpen(false);
  };

  const handleMenuClick = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardMain />;
      case 'users':
        return <UserList />;
      case 'menu':
        return <MenuList />;
      case 'categories':
        return <CategoryList />;
      case 'tables':
        return <TableList />;
      case 'orders':
        return <AdminAllOrders />;
      case 'reports-daily':
        return <AdminDailyReport />;
      case 'reports-weekly':
        return <AdminWeeklyReport />;
      case 'reports-monthly':
        return <AdminMonthlyReport />;
      default:
        return <DashboardMain />;
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Sidebar untuk desktop */}
      <div className="hidden lg:block">
        <Sidebar 
          role="admin"
          userName={user.fullName || user.username}
          userEmail={user.email}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPath={currentPath}
        />
      </div>
      
      {/* Sidebar untuk mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-fluid-72">
            <Sidebar 
              role="admin"
              userName={user.fullName || user.username}
              userEmail={user.email}
              onLogout={handleLogout}
              onNavigate={(path, title) => {
                handleNavigate(path, title);
                setIsSidebarOpen(false);
              }}
              currentPath={currentPath}
            />
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderSidebar
          pageTitle={pageTitle}
          userName={user.fullName || user.username}
          userRole="admin"
          onMenuClick={handleMenuClick}
          showSearch={false}
          showNotifications={true}
          notificationCount={5}
        />
        
        <main className="flex-1 overflow-auto p-fluid-4 bg-white">
          <div className="">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}