/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  CheckCircle,
  Download,
  ShoppingBag,
  UtensilsCrossed,
  User,
  MapPin,
  Utensils
} from "lucide-react";
import { CustomerInfo, TableSelection, CartItem, OrderType } from "../components/dashboard-main";
import OrderSummary from "../components/order-summary";
import { useState } from "react";

// --- LIBRARY UNTUK PDF ---
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Step5PaymentProps {
  orderId: string | null;
  orderNumber: string | null;
  customerInfo: CustomerInfo;
  selectedTable: TableSelection | null;
  orderType: OrderType;
  cart: CartItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  totalAmount: number;
  paymentMethod: string;
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function Step5Payment({
  orderId,
  orderNumber,
  customerInfo,
  selectedTable,
  orderType,
  cart,
  subtotal,
  tax,
  serviceCharge,
  totalAmount,
  // paymentMethod, // (Tidak dipakai di UI, bisa dihapus jika mau)
  onUpdateQuantity,
  onRemoveItem,
}: Step5PaymentProps) {

  const [isDownloading, setIsDownloading] = useState(false);

  // Helper Format Currency
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);

  // --- FUNGSI DOWNLOAD PDF ---
  const handleDownloadPDF = async () => {
    const input = document.getElementById("receipt-print-area");
    if (!input) return;

    setIsDownloading(true);

    try {
      // 1. Capture elemen HTML menjadi Canvas (Gambar)
      // Menggunakan onclone untuk memperbaiki CSS yang tidak didukung html2canvas
      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
        // Workaround: Clone dan normalisasi warna sebelum render
        onclone: (clonedDoc: Document) => {
          // Cari semua elemen dengan style yang bermasalah dan reset
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el) => {
            const htmlEl = el as HTMLElement;
            const computedStyle = window.getComputedStyle(htmlEl);

            // Reset color dan background-color jika mengandung fungsi yang tidak didukung
            const color = computedStyle.color;
            const bgColor = computedStyle.backgroundColor;

            if (color && (color.includes('lab(') || color.includes('lch(') || color.includes('oklch('))) {
              htmlEl.style.color = '#000000';
            }
            if (bgColor && (bgColor.includes('lab(') || bgColor.includes('lch(') || bgColor.includes('oklch('))) {
              htmlEl.style.backgroundColor = '#ffffff';
            }
          });
        }
      });

      const imgData = canvas.toDataURL("image/png");

      // 2. Setup PDF (Ukuran A4 Portrait)
      const pdf = new jsPDF("p", "mm", "a4");

      // Hitung dimensi agar pas di lebar A4
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Margin PDF (misal 10mm kiri kanan)
      const margin = 10;
      const contentWidth = pdfWidth - (margin * 2);

      // Skala tinggi berdasarkan rasio lebar
      const ratio = contentWidth / imgWidth;
      const contentHeight = imgHeight * ratio;

      // 3. Masukkan gambar ke PDF
      pdf.addImage(imgData, "PNG", margin, margin, contentWidth, contentHeight);

      // 4. Download File
      pdf.save(`Receipt-${orderNumber || orderId}.pdf`);

    } catch (error) {
      console.error("Gagal download PDF:", error);
      alert("Terjadi kesalahan saat membuat PDF.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="relative w-full animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* --- CONTENT UTAMA: ORDER SUMMARY (REVIEW) --- */}
      <div className="max-w-xl mx-auto">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Review Order</h2>
          <p className="text-gray-500 text-sm mt-1">Please check your items before payment</p>
        </div>

        <OrderSummary
          cart={cart}
          customerInfo={customerInfo}
          selectedTable={selectedTable}
          orderType={orderType}
          subtotal={subtotal}
          tax={tax}
          serviceCharge={serviceCharge}
          totalAmount={totalAmount}
          onUpdateQuantity={onUpdateQuantity}
          onRemoveItem={onRemoveItem}
          viewMode="static"
        />
      </div>

      {/* --- MODAL SUCCESS (Overlay) --- */}
      {orderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">

          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

            {/* WRAPPER SCROLLABLE UNTUK STRUK */}
            <div className="overflow-y-auto flex-1">

              {/* ID ini yang akan difoto oleh html2canvas */}
              <div id="receipt-print-area" className="bg-white p-6">

                {/* Header Struk */}
                <div className="flex flex-col items-center pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 ring-4 ring-green-50/50">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900">Payment Successful!</h2>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Order ID: <span className="font-mono font-bold text-gray-900 bg-gray-100 px-2 py-0.5 rounded">{orderNumber || orderId}</span>
                  </p>
                </div>

                {/* Detail Struk */}
                <div className="mt-6 space-y-4">
                  <div className="bg-gray-50/80 rounded-xl border border-gray-100 p-4 space-y-3">

                    {/* Type */}
                    <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2">
                      <span className="text-gray-500 flex items-center gap-2">
                        {orderType === "dine-in" ? <UtensilsCrossed className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                        Type
                      </span>
                      <span className="font-bold text-gray-900 capitalize">{orderType.replace("-", " ")}</span>
                    </div>

                    {/* Customer */}
                    <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2">
                      <span className="text-gray-500 flex items-center gap-2">
                        <User className="w-3.5 h-3.5" />
                        Customer
                      </span>
                      <span className="font-bold text-gray-900">{customerInfo.name}</span>
                    </div>

                    {/* Table */}
                    {orderType === "dine-in" && selectedTable && (
                      <div className="flex justify-between items-center text-sm border-b border-dashed border-gray-200 pb-2">
                        <span className="text-gray-500 flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" />
                          Table
                        </span>
                        <span className="font-bold text-gray-900">No. {selectedTable.tableNumber}</span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="pt-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 block flex items-center gap-2">
                        <Utensils className="w-3 h-3" />
                        Items
                      </span>
                      <div className="space-y-2">
                        {cart.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start text-sm">
                            <span className="text-gray-800">
                              <span className="font-bold">{item.quantity}x</span> {item.menuItemName}
                            </span>
                            <span className="text-gray-600 font-medium">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Total */}
                    <div className="flex justify-between items-center pt-3 border-t-2 border-gray-800 mt-2">
                      <span className="text-sm font-bold text-gray-900">TOTAL</span>
                      <span className="text-lg font-black text-gray-900">{formatCurrency(totalAmount)}</span>
                    </div>

                    <div className="text-center mt-4">
                      <p className="text-[10px] text-gray-400">Terima kasih atas kunjungan Anda</p>
                      <p className="text-[10px] text-gray-400 font-mono">www.raystoran.com</p>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons (Fixed at bottom of modal) */}
            <div className="p-4 bg-white border-t border-gray-100 space-y-2 z-10">
              <button
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all text-sm font-bold shadow-sm disabled:opacity-50"
              >
                {isDownloading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Receipt (PDF)
                  </>
                )}
              </button>

              <button
                onClick={() => window.location.href = '/dashboard/customer'}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-all text-sm font-bold shadow-md hover:shadow-lg transform active:scale-95"
              >
                Create New Order
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}