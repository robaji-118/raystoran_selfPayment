/* eslint-disable react-hooks/set-state-in-effect */
// app/dashboard/waiter/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getUser, logout } from "@/lib/auth-client";
import Sidebar from "../components/Sidebar";
import HeaderSidebar from "../components/header-sidebar";
import WaiterDashboardMain from "./components/dashboard-main";
import ReadyOrdersView from "./components/ready-orders-view";
import MyDeliveriesView from "./components/my-deliveries-view";
import CompletedDeliveriesView from "./components/completed-deliveries-view";
import TablesStatusView from "./components/table-status-view";

export default function WaiterDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<{ id: string; username: string; email: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTitle, setCurrentTitle] = useState("Waiter Dashboard");

  const currentView = searchParams.get('view') || 'dashboard';

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUser();

      if (!userData) {
        router.push('/login');
        return;
      }

      if (userData.role !== 'waiter') {
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
        setCurrentTitle('Waiter Dashboard');
        break;
      case 'deliveries-ready':
        setCurrentTitle('Ready Orders');
        break;
      case 'deliveries-active':
        setCurrentTitle('Order Deliveries');
        break;
      case 'deliveries-completed':
        setCurrentTitle('Completed Deliveries');
        break;
      default:
        setCurrentTitle('Waiter Dashboard');
    }
  }, [currentView]);

  const handleLogout = () => {
    logout();
    router.push('/login');
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
        return <WaiterDashboardMain />;
      case 'deliveries-ready':
        return <ReadyOrdersView />;
      case 'deliveries-active':
        return <MyDeliveriesView userId={user?.id || ''} />;
      case 'deliveries-completed':
        return <CompletedDeliveriesView userId={user?.id || ''} />;
      case 'tables':
        return <TablesStatusView />;
      default:
        return <WaiterDashboardMain />;
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-screen">
      {/* Responsive Sidebar */}
      <Sidebar
        role="waiter"
        userName={user.username}
        userEmail={user.email}
        onLogout={handleLogout}
        onNavigate={handleNavigate}
        currentPath={`/dashboard/waiter${currentView !== 'dashboard' ? `?view=${currentView}` : ''}`}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderSidebar
          pageTitle={currentTitle}
          userName={user.username}
          userRole="waiter"
          onMenuClick={handleMenuClick}
          showSearch={false}
          showNotifications={true}
          notificationCount={0}
        />

        <main className="flex-1 overflow-auto ">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}