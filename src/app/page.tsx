import React from 'react';
import { Metadata } from 'next';
import LoginPage from './login/main';

export const metadata: Metadata = {
  title: "Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const MainPage = () => {
  return <LoginPage/>;
};

export default MainPage;
