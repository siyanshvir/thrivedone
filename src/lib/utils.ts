import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Determines if a hex color is light or dark
 * Returns true if light, false if dark
 */
export function isLightColor(hexColor: string | null | undefined): boolean {
  if (!hexColor) return false;
  
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Calculate luminance using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if light (luminance > 0.5)
  return luminance > 0.5;
}

/**
 * Gets the appropriate text color (black or white) for a given background color
 */
export function getContrastColor(hexColor: string | null | undefined): string {
  return isLightColor(hexColor) ? 'text-black' : 'text-white';
}

/**
 * Determines if a hex color is white or very close to white
 * Returns true if the color is white or near-white
 */
export function isWhiteColor(hexColor: string | null | undefined): boolean {
  if (!hexColor) return false;
  
  // Remove # if present
  const hex = hexColor.replace('#', '').toLowerCase();
  
  // Check for pure white (#ffffff or #fff)
  if (hex === 'ffffff' || hex === 'fff') return true;
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Check if all RGB values are above 230 (very close to white, includes #EDEDEF which is 237,237,239)
  return r > 230 && g > 230 && b > 230;
}
