import CryptoJS from 'crypto-js';

// Encryption key - in production, this should be environment variable
const ENCRYPTION_KEY = 'cert-platform-key-2025';

export interface CertificateData {
  organizationId: string;
  courseName: string;
  certificateId: string;
  timestamp: number;
  expiresAt: number;
}

/**
 * Encrypt certificate data with expiration
 * @param organizationId - Organization ID
 * @param courseName - Course Name (can be course title)
 * @param certificateId - Certificate ID
 * @param expirationDays - Number of days until expiration (default: 365)
 * @returns Encrypted string
 */
export const encryptCertificateData = (
  organizationId: string,
  courseName: string,
  certificateId: string,
  expirationDays: number = 365
): string => {
  const now = Date.now();
  const expiresAt = now + (expirationDays * 24 * 60 * 60 * 1000); // Days to milliseconds

  const data: CertificateData = {
    organizationId,
    courseName,
    certificateId,
    timestamp: now,
    expiresAt
  };

  const dataString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();

  // URL-safe base64 encoding
  return encodeURIComponent(encrypted);
};

/**
 * Decrypt certificate data and validate expiration
 * @param encryptedData - Encrypted certificate data
 * @returns Decrypted data or null if invalid/expired
 */
export const decryptCertificateData = (encryptedData: string): CertificateData | null => {
  try {
    // URL-safe base64 decoding
    let decodedData = decodeURIComponent(encryptedData);
    // Normalize spaces to '+' (browser routing/email clients sometimes decode '+' as space)
    decodedData = decodedData.replace(/ /g, '+');
    const decrypted = CryptoJS.AES.decrypt(decodedData, ENCRYPTION_KEY);
    const dataString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!dataString) {
      console.error('🔓 Failed to decrypt certificate data');
      return null;
    }

    const data: CertificateData = JSON.parse(dataString);
    const now = Date.now();

    // Check if expired
    if (now > data.expiresAt) {
      console.warn('⚠️ Certificate link has expired');
      return null;
    }

    return data;
  } catch (error) {
    console.error('🔓 Error decrypting certificate data:', error);
    return null;
  }
};

/**
 * Check if encrypted certificate data is expired without full decryption
 * @param encryptedData - Encrypted certificate data
 * @returns true if expired, false if valid, null if invalid
 */
export const isCertificateLinkExpired = (encryptedData: string): boolean | null => {
  try {
    let decodedData = decodeURIComponent(encryptedData);
    // Normalize spaces to '+' (browser routing/email clients sometimes decode '+' as space)
    decodedData = decodedData.replace(/ /g, '+');
    const decrypted = CryptoJS.AES.decrypt(decodedData, ENCRYPTION_KEY);
    const dataString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!dataString) return null;

    const data: CertificateData = JSON.parse(dataString);
    return Date.now() > data.expiresAt;
  } catch {
    return null;
  }
};

/**
 * Get time remaining for certificate link
 * @param encryptedData - Encrypted certificate data
 * @returns Time remaining in milliseconds, or null if invalid
 */
export const getCertificateLinkTimeRemaining = (encryptedData: string): number | null => {
  try {
    let decodedData = decodeURIComponent(encryptedData);
    // Normalize spaces to '+' (browser routing/email clients sometimes decode '+' as space)
    decodedData = decodedData.replace(/ /g, '+');
    const decrypted = CryptoJS.AES.decrypt(decodedData, ENCRYPTION_KEY);
    const dataString = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!dataString) return null;

    const data: CertificateData = JSON.parse(dataString);
    const timeRemaining = data.expiresAt - Date.now();
    
    return timeRemaining > 0 ? timeRemaining : 0;
  } catch {
    return null;
  }
};
