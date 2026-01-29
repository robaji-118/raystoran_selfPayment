/* eslint-disable react-hooks/set-state-in-effect */
// app/dashboard/kitchen/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, logout } from "@/lib/auth-client";
import Sidebar from "../components/Sidebar";
import HeaderSidebar from "../components/header-sidebar";
import KitchenDashboardMain from "./components/kitchen-dashboard-main";
import MenuList from "./components/menu-list";

export default function KitchenDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: string; username: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentTitle, setCurrentTitle] = useState("Kitchen Dashboard");
  
  const currentView = searchParams.get('view') || 'dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();
      
      if (!userData) {
        router.push('/login');
        return;
      }

      if (userData.role !== 'kitchen') {
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
        setCurrentTitle('Kitchen Dashboard');
        break;
      default:
        setCurrentTitle('Kitchen Dashboard');
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
      default:
        return <KitchenDashboardMain />;
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen">
      {/* Sidebar untuk desktop */}
      <div className={`hidden lg:block ${!isSidebarOpen ? 'lg:hidden' : ''}`}>
        <Sidebar 
          role="kitchen"
          userName={user.username}
          userEmail={user.email}
          onLogout={handleLogout}
          onNavigate={handleNavigate}
          currentPath={`/dashboard/kitchen${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`}
        />
      </div>
      
      {/* Sidebar untuk mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72">
            <Sidebar 
              role="kitchen"
              userName={user.username}
              userEmail={user.email}
              onLogout={handleLogout}
              onNavigate={(path, title) => {
                handleNavigate(path, title);
                setIsSidebarOpen(false);
              }}
              currentPath={`/dashboard/kitchen${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`}
            />
          </div>
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderSidebar
          pageTitle={currentTitle}
          userName={user.username}
          userRole="kitchen"
          onMenuClick={handleMenuClick}
          showSearch={false}
          showNotifications={true}
          notificationCount={0}
        />
        
        <main className="flex-1 overflow-auto p-4">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}