/**
 * Token utility functions for JWT handling
 */

interface JWTPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Decode a JWT token without verification (client-side only)
 * @param token - JWT token string
 * @returns Decoded payload or null if invalid
 */
export const decodeJWT = (token: string): JWTPayload | null => {
  try {
    // Handle Admin Bypass tokens
    if (token.startsWith('admin-bypass-')) {
      const payload = token.replace('admin-bypass-', '');
      const decoded = atob(payload);
      const [email] = decoded.split(':');
      return {
        email,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365, // 1 year from now
        isBypass: true
      };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * Check if a JWT token is expired
 * @param token - JWT token string
 * @returns true if expired, false if still valid
 */
export const isTokenExpired = (token: string): boolean => {
  // Handle Admin Bypass tokens
  if (token.startsWith('admin-bypass-')) {
    return false; // Bypass tokens never expire locally
  }

  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true; // Consider invalid tokens as expired
  }

  // exp is in seconds, Date.now() is in milliseconds
  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();

  return currentTime >= expirationTime;
};

/**
 * Get the remaining time until token expiration in milliseconds
 * @param token - JWT token string
 * @returns Remaining time in ms, or 0 if expired/invalid
 */
export const getTokenRemainingTime = (token: string): number => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return 0;
  }

  const expirationTime = payload.exp * 1000;
  const currentTime = Date.now();
  const remainingTime = expirationTime - currentTime;

  return remainingTime > 0 ? remainingTime : 0;
};

/**
 * Format remaining time for display
 * @param milliseconds - Time in milliseconds
 * @returns Formatted string (e.g., "2h 30m")
 */
export const formatRemainingTime = (milliseconds: number): string => {
  if (milliseconds <= 0) {
    return 'Expired';
  }

  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return `${seconds}s`;
  }
};

/**
 * Get token expiration date
 * @param token - JWT token string
 * @returns Date object or null if invalid
 */
export const getTokenExpirationDate = (token: string): Date | null => {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
};
