import React from 'react';
import { Metadata } from 'next';
import WaiterMain from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const WaiterPage = () => {
  return <WaiterMain/>;
};

export default WaiterPage;
