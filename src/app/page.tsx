import React from 'react';
import { Metadata } from 'next';
import LoginPage from './login/main';

export const metadata: Metadata = {
  title: "Aplikasi Payment Self",
  description: "Aplikasi Payment Self | Tugas Akhir Kelas XII",
};

const MainPage = () => {
  return <LoginPage/>;
};

export default MainPage;
