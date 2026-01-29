import React from 'react';
import { Metadata } from 'next';
import LoginPage from './main';

export const metadata: Metadata = {
  title: "Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

const LoginMain = () => {
  return <LoginPage/>;
};

export default LoginMain;
