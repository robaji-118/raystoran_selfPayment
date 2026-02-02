// lib/mail.ts
import nodemailer from 'nodemailer';

// Konfigurasi Transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// --- FUNGSI 1: Notifikasi Pesanan Siap / Diantar ---
export const sendReadyEmail = async (
  to: string,
  customerName: string,
  orderNumber: string,
  tableNumber: string
) => {
  try {
    if (!to || !to.includes('@')) return false;

    await transporter.sendMail({
      from: `"Restoran Enak" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `🍽️ Pesanan #${orderNumber} Sedang Diantar!`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #2e7d32; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Pesanan Siap Disajikan</h2>
          </div>
          
          <div style="padding: 25px;">
            <p>Halo <strong>${customerName}</strong>,</p>
            <p>Kabar gembira! Pesanan Anda <strong>#${orderNumber}</strong> sudah selesai dimasak.</p>
            
            <div style="background-color: #e8f5e9; border: 1px dashed #2e7d32; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center;">
              <p style="margin: 0; color: #1b5e20; font-size: 14px;">Waiter kami sedang menuju ke:</p>
              <h1 style="margin: 5px 0 0 0; color: #2e7d32; font-size: 32px;">Meja ${tableNumber}</h1>
            </div>

            <p style="color: #555;">Mohon siapkan ruang di meja Anda. Selamat menikmati hidangan!</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 11px; color: #999; text-align: center;">Terima kasih telah makan di Restoran Enak.</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Gagal kirim email ready:", error);
    return false;
  }
};

// --- FUNGSI 2: Notifikasi Pembatalan (Revisi) ---
export const sendCancellationEmail = async (
  to: string, 
  customerName: string, 
  orderNumber: string, 
  reason: string
) => {
  try {
    if (!to || !to.includes('@')) return false;

    await transporter.sendMail({
      from: `"Restoran Enak" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `⚠️ Penting: Pesanan #${orderNumber} Dibatalkan`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #d32f2f; padding: 20px; text-align: center;">
            <h2 style="color: white; margin: 0;">Pemberitahuan Pembatalan</h2>
          </div>
          
          <div style="padding: 25px;">
            <p>Yth. <strong>${customerName}</strong>,</p>
            <p>Kami memohon maaf yang sebesar-besarnya. Dengan berat hati kami menginformasikan bahwa pesanan <strong>#${orderNumber}</strong> harus kami batalkan karena adanya kendala internal.</p>
            
            <div style="background-color: #ffebee; border-left: 4px solid #d32f2f; padding: 15px; margin: 20px 0;">
              <p style="margin: 0; color: #b71c1c; font-size: 12px; font-weight: bold; text-transform: uppercase;">Detail Kendala:</p>
              <p style="margin: 5px 0 0 0; color: #333;">${reason}</p>
            </div>

            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #333;">ℹ️ Informasi Pengembalian Dana (Refund)</h4>
              <p style="margin: 0; font-size: 14px; color: #555;">
                Karena pesanan dibatalkan dari pihak restoran, <strong>dana Anda akan dikembalikan sepenuhnya (100%)</strong> secepat mungkin ke metode pembayaran asal Anda. Mohon tunggu konfirmasi dari payment gateway.
              </p>
            </div>
            
            <p style="margin-top: 20px;">Kami akan mengevaluasi kejadian ini agar tidak terulang kembali.</p>
            
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 11px; color: #999; text-align: center;">Restoran Enak Management</p>
          </div>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error("Gagal kirim email cancel:", error);
    return false;
  }
};