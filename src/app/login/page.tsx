import React from 'react';
import { Metadata } from 'next';
import LoginPage from './main';

export const metadata: Metadata = {
  title: "Login - Aplikasi Payment Self",
  description: "Aplikasi Payment Self | Tugas Akhir Kelas XII",
};

const LoginMain = () => {
  return <LoginPage />;
};

export default LoginMain;
