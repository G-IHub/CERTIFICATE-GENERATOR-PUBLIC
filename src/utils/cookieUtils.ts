/**
 * Cookie utility functions for managing cross-domain session cookies.
 */

/**
 * Set a cookie with standard security parameters and optional wildcard domain.
 */
export const setCookie = (
  name: string,
  value: string,
  days: number = 30,
  domain: string = '.certifyer.online'
): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  
  // Format cookie string
  let cookieStr = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax; Secure`;
  
  // Use domain if we are on a real host (not localhost)
  const hostname = window.location.hostname;
  if (domain && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    cookieStr += `; domain=${domain}`;
  }
  
  document.cookie = cookieStr;
};

/**
 * Retrieve a cookie value by name.
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
  }
  return null;
};

/**
 * Delete a cookie by forcing it to expire immediately.
 */
export const deleteCookie = (name: string, domain: string = '.certifyer.online'): void => {
  let cookieStr = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
  
  const hostname = window.location.hostname;
  if (domain && !hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    cookieStr += `; domain=${domain}`;
  }
  
  document.cookie = cookieStr;
};
