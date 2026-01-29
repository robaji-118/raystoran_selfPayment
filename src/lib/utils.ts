import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts pixel values to viewport width (vw) units at 1440px maximum
 * Formula: (px / 1440) * 100 = vw
 * @param px - The pixel value to convert
 * @returns The vw value as a string (e.g., "18.888vw")
 */
export function fluidSize(px: number): string {
  return `${(px / 1440) * 100}vw`;
}
