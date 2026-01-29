import React from 'react';
import { Metadata } from 'next';
import OwnerMain from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const OwnerPage = () => {
  return <OwnerMain/>;
};

export default OwnerPage;
