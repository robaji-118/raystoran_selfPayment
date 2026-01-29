import React from 'react';
import { Metadata } from 'next';
import AdminMain from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const AdminPage = () => {
  return <AdminMain/>;
};

export default AdminPage;
