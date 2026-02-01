// app/dashboard/customer/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Home } from "lucide-react";
import DashboardMain from "./components/dashboard-main";

export default function CustomerDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentTitle, setCurrentTitle] = useState("Place Order");
  
  const currentView = searchParams.get('view') || 'dashboard';

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardMain />;
      default:
        return <DashboardMain />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Simple Header untuk Guest */}
      <header className="bg-white top-0 z-10 ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              
            </div>
            <button
              onClick={() => router.push('/login')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
               Login
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl mb-12">
        {renderContent()}
      </div>
    </div>
  );
}