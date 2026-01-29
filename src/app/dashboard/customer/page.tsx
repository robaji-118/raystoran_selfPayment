import React from 'react';
import { Metadata } from 'next';
import CustomerMain from './main';

export const metadata: Metadata = {
  title: "Dashboard - Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const CustomerPage = () => {
  return <CustomerMain/>;
};

export default CustomerPage;
