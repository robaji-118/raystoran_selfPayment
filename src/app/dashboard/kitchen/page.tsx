import React, { Suspense } from 'react';
import { Metadata } from 'next';
import KitchenDashboard from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const KitchenPage = () => {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="text-center">
          <div className="w-fluid-16 h-fluid-16 border-4 border-gray-200 border-t-black rounded-full animate-spin mx-auto mb-fluid-4" />
          <p className="text-neutral-500 text-fluid-base">Loading Kitchen Dashboard...</p>
        </div>
      </div>
    }>
      <KitchenDashboard/>
    </Suspense>
  );
};

export default KitchenPage;