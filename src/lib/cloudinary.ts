// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Validasi environment variables
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Log untuk debugging (hapus setelah berhasil)
console.log('Cloudinary Config Check:', {
  cloudName: cloudName ? '✓ Set' : '✗ Missing',
  apiKey: apiKey ? '✓ Set' : '✗ Missing',
  apiSecret: apiSecret ? '✓ Set' : '✗ Missing',
});

if (!cloudName || !apiKey || !apiSecret) {
  console.error('Missing Cloudinary credentials:', {
    cloudName: cloudName || 'MISSING',
    apiKey: apiKey ? 'EXISTS' : 'MISSING',
    apiSecret: apiSecret ? 'EXISTS' : 'MISSING',
  });
}

cloudinary.config({
  cloud_name: cloudName,
  api_key: apiKey,
  api_secret: apiSecret,
  secure: true,
});

export default cloudinary;