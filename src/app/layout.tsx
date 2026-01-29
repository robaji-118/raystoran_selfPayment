import "./globals.css";
import type { Metadata } from "next";
import '@/styles/index.scss';

export const metadata: Metadata = {
  title: "Aplikasi Kasir Restoran",
  description: "Sistem Kasir Sederhana | Tugas Akhir Kelas XII",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className=""
      >
        {children}
      </body>
    </html>
  );
}
