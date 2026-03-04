/**
 * Color utility functions for ensuring proper contrast and visibility
 */

/**
 * Converts a hex color to RGB values
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse the hex color
  const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(cleanHex);
  
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate the relative luminance of a color
 * Formula from WCAG 2.0: https://www.w3.org/TR/WCAG20/#relativeluminancedef
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determines if a color is considered dark (requires light text)
 * @param color - Hex color string (e.g., "#000000" or "#ffffff")
 * @returns true if the color is dark, false if light
 */
export function isDarkColor(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  
  // Calculate luminance
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // Threshold of 0.5 - colors darker than this need light text
  return luminance < 0.5;
}

/**
 * Gets the appropriate contrasting text color for a given background color
 * @param backgroundColor - Hex color string
 * @returns "#ffffff" for dark backgrounds, "#000000" for light backgrounds
 */
export function getContrastingTextColor(backgroundColor: string): string {
  return isDarkColor(backgroundColor) ? '#ffffff' : '#000000';
}

/**
 * Gets the appropriate contrasting color with medium opacity
 * Useful for borders and dividers
 * @param backgroundColor - Hex color string
 * @returns A color with appropriate contrast
 */
export function getContrastingAccentColor(backgroundColor: string): string {
  const rgb = hexToRgb(backgroundColor);
  if (!rgb) return backgroundColor;
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  
  // For very dark colors (near black), use a lighter version
  if (luminance < 0.1) {
    return '#ffffff';
  }
  
  // For very light colors (near white), use a darker version
  if (luminance > 0.9) {
    return '#000000';
  }
  
  // Otherwise use the original color
  return backgroundColor;
}

/**
 * Checks if a color is very close to pure white
 */
export function isNearWhite(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance > 0.95;
}

/**
 * Checks if a color is very close to pure black
 */
export function isNearBlack(color: string): boolean {
  const rgb = hexToRgb(color);
  if (!rgb) return false;
  
  const luminance = getLuminance(rgb.r, rgb.g, rgb.b);
  return luminance < 0.05;
}

/**
 * Adjusts a color to ensure it's visible on white backgrounds
 * If the color is too light, it returns a darker version
 */
export function ensureVisibleOnWhite(color: string): string {
  if (isNearWhite(color)) {
    return '#171717'; // Very dark gray/black for visibility
  }
  return color;
}

/**
 * Adjusts a color to ensure it's visible on dark backgrounds
 * If the color is too dark, it returns a lighter version
 */
export function ensureVisibleOnDark(color: string): string {
  if (isNearBlack(color)) {
    return '#f5f5f5'; // Very light gray/white for visibility
  }
  return color;
}