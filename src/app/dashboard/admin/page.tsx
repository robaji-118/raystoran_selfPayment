import React, { Suspense } from 'react';
import { Metadata } from 'next';
import AdminMain from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const AdminPage = () => {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    }>
      <AdminMain/>
    </Suspense>
  );
};

export default AdminPage;