// lib/mail.ts
import nodemailer from 'nodemailer';

// --- KONFIGURASI SMTP ---

// Helper: Ambil password dari env (dukung variasi penamaan)
const getSmtpPass = () => process.env.SMTP_PASS || process.env.SMTP_PASSWORD;

// Helper: Cek kelengkapan env
function isSmtpConfigured(): boolean {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    getSmtpPass()
  );
}

// Helper: Buat transporter (Lazy Loading)
function getTransporter() {
  if (!isSmtpConfigured()) {
    console.warn("[Mail] SMTP Missing: Cek env SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS");
    return null;
  }
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: getSmtpPass(),
    },
  });
}

// --- STYLE CSS UMUM (Agar konsisten) ---
const styles = {
  container: `font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #f0f0f0;`,
  header: `background-color: #111827; padding: 24px; text-align: center;`,
  headerText: `color: #ffffff; margin: 0; font-size: 20px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;`,
  body: `padding: 32px 24px; color: #374151; line-height: 1.6;`,
  footer: `background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;`,
  h1: `margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #111827;`,
  p: `margin: 0 0 16px; font-size: 16px;`,
};

// Tipe item untuk list menu di email
export interface MailOrderItem {
  menuItemName: string;
  quantity: number;
  price: number;
}

// Helper: render HTML list menu
function renderItemsList(items: MailOrderItem[]): string {
  if (!items || items.length === 0) return '';
  return `
    <div style="background-color: #f9fafb; border-radius: 12px; padding: 16px; margin: 16px 0; border: 1px solid #e5e7eb;">
      <p style="margin: 0 0 12px; font-size: 12px; font-weight: 700; color: #6b7280; text-transform: uppercase;">Daftar Pesanan</p>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
        ${items.map((i) => `
          <tr>
            <td style="padding: 6px 0; color: #374151;">${i.quantity}x ${i.menuItemName}</td>
            <td style="padding: 6px 0; text-align: right; font-weight: 600; color: #111827;">Rp ${(i.price * i.quantity).toLocaleString('id-ID')}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}

// --- FUNGSI 1: Notifikasi Pesanan Siap (Ready) ---
export const sendReadyEmail = async (
  to: string,
  customerName: string,
  orderNumber: string,
  tableNumber: string,
  items?: MailOrderItem[]
) => {
  try {
    if (!to || !to.includes('@')) return false;
    const transporter = getTransporter();
    if (!transporter) return false;

    const itemsHtml = renderItemsList(items || []);

    await transporter.sendMail({
      from: `"Raystorant Updates" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `✨ Pesanan #${orderNumber} Siap Disajikan!`,
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}">
            <h2 style="${styles.headerText}">Raystorant</h2>
          </div>
          
          <div style="${styles.body}">
            <p style="${styles.p}">Halo <strong>${customerName}</strong>,</p>
            <p style="${styles.p}">Hidangan lezat Anda (Order <strong>#${orderNumber}</strong>) telah selesai dimasak oleh chef kami.</p>
            
            ${itemsHtml}

            <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border: 1px solid #a7f3d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
              <p style="margin: 0; color: #065f46; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Diantar ke Meja</p>
              <p style="margin: 8px 0 0; color: #047857; font-size: 48px; font-weight: 800; line-height: 1;">${tableNumber}</p>
            </div>

            <p style="${styles.p}">Waiter kami sedang menuju ke meja Anda sekarang. Mohon siapkan ruang di meja.</p>
          </div>

          <div style="${styles.footer}">
            <p style="margin: 0;">Terima kasih telah bersantap di Raystorant.</p>
            <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} Raystorant Group.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mail] Ready email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Mail] Failed sendReadyEmail:", error);
    return false;
  }
};

// --- FUNGSI 2: Notifikasi Pembatalan (Cancel) ---
export const sendCancellationEmail = async (
  to: string, 
  customerName: string, 
  orderNumber: string, 
  reason: string,
  items?: MailOrderItem[]
) => {
  try {
    if (!to || !to.includes('@')) return false;
    const transporter = getTransporter();
    if (!transporter) return false;

    const itemsHtml = renderItemsList(items || []);

    await transporter.sendMail({
      from: `"Raystorant Support" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `⚠️ Update Status Pesanan #${orderNumber}`,
      html: `
        <div style="${styles.container}">
          <div style="${styles.header}; background-color: #991b1b;">
            <h2 style="${styles.headerText}">Raystorant</h2>
          </div>
          
          <div style="${styles.body}">
            <h1 style="${styles.h1}">Mohon Maaf 🙏</h1>
            <p style="${styles.p}">Yth. <strong>${customerName}</strong>,</p>
            <p style="${styles.p}">Kami memohon maaf yang sebesar-besarnya. Pesanan <strong>#${orderNumber}</strong> tidak dapat kami proses saat ini.</p>
            
            ${itemsHtml}

            <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0; border-radius: 4px;">
              <p style="margin: 0 0 4px; color: #991b1b; font-size: 12px; font-weight: 700; text-transform: uppercase;">Alasan Pembatalan:</p>
              <p style="margin: 0; color: #1f2937; font-weight: 500;">"${reason}"</p>
            </div>

            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin-top: 24px;">
              <div style="display: flex; align-items: center; margin-bottom: 8px;">
                <span style="font-size: 18px; margin-right: 8px;">💸</span>
                <strong style="color: #111827;">Jaminan Pengembalian Dana</strong>
              </div>
              <p style="margin: 0; font-size: 14px; color: #4b5563;">
                Dana Anda akan dikembalikan <strong>100%</strong> secara otomatis ke metode pembayaran asal Anda. Proses ini biasanya instan atau memakan waktu maksimal 1x24 jam tergantung bank terkait.
              </p>
            </div>
          </div>

          <div style="${styles.footer}">
             <p style="margin: 0;">Butuh bantuan? Balas email ini.</p>
             <p style="margin: 5px 0 0;">&copy; ${new Date().getFullYear()} Raystorant Group.</p>
          </div>
        </div>
      `,
    });
    console.log(`[Mail] Cancel email sent to ${to}`);
    return true;
  } catch (error) {
    console.error("[Mail] Failed sendCancellationEmail:", error);
    return false;
  }
};