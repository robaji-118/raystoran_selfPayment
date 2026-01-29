import React from 'react';
import { Metadata } from 'next';
import KitchenDashboard from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const KitchenPage = () => {
  return <KitchenDashboard/>;
};

export default KitchenPage;