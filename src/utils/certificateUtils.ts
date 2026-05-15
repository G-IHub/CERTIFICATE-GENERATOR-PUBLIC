import { nanoid } from 'nanoid';
import { encryptCertificateData } from './encryption';

/**
 * Generate a unique certificate ID using nanoid
 * Format: CERT-[timestamp]-[8-character-nanoid]
 * Example: CERT-1234567890-V1StGXR8
 */
export const generateCertificateId = (): string => {
  const timestamp = Date.now();
  const id = `CERT-${timestamp}-${nanoid(8).toUpperCase()}`;
  return id;
};

/**
 * Generate a shorter certificate ID for demo purposes
 * Format: DEMO-[6-character-nanoid]
 * Example: DEMO-V1StGX
 */
export const generateDemoCertificateId = (): string => {
  return `DEMO-${nanoid(6).toUpperCase()}`;
};

/**
 * Generate certificate URL for student access (LEGACY - unencrypted)
 * @param organizationId - The organization ID
 * @param courseName - The course name
 * @param certificateId - The certificate ID
 * @returns Complete certificate URL
 * @deprecated Use generateSecureCertificateUrl instead for encrypted links
 */
export const generateCertificateUrl = (
  organizationId: string, 
  courseName: string, 
  certificateId: string
): string => {
  return `${window.location.origin}/certificate/${organizationId}/${courseName}/${certificateId}`;
};

/**
 * Generate secure certificate URL with time-based encryption
 * @param organizationId - The organization ID
 * @param courseName - The course name
 * @param certificateId - The certificate ID
 * @param expirationDays - Number of days until link expires (default: 365)
 * @returns Complete encrypted certificate URL
 */
export const generateSecureCertificateUrl = (
  organizationId: string, 
  courseName: string, 
  certificateId: string,
  expirationDays: number = 365
): string => {
  const encryptedData = encryptCertificateData(organizationId, courseName, certificateId, expirationDays);
  return `${window.location.origin}/certificate/${encryptedData}`;
};

/**
 * Generate SHORT certificate URL (6-character code) - NEW!
 * This creates a much shorter, more shareable URL
 * @param shortCode - The 6-character short code
 * @returns Complete short certificate URL
 * @example https://certifyer.online/c/Ab3xY9
 */
export const generateShortCertificateUrl = (shortCode: string): string => {
  console.warn('generateShortCertificateUrl called but short links are disabled');
  return '/';
};

/**
 * Validate if a string looks like a nanoid-based certificate ID
 * @param id - The ID to validate
 * @returns true if it looks like a valid certificate ID
 */
export const isValidCertificateId = (id: string): boolean => {
  // Check if it starts with CERT- or DEMO- and has appropriate format
  return (
    /^CERT-\d+-[A-Z0-9]{8}$/.test(id) || // CERT-timestamp-8chars
    /^DEMO-[A-Z0-9]{6}$/.test(id)        // DEMO-6chars
  );
};

/**
 * Generate a unique course ID using nanoid
 * Format: COURSE-[8-character-nanoid]
 * Example: COURSE-V1STGXR8
 */
export const generateCourseId = (): string => {
  return `COURSE-${nanoid(8).toUpperCase()}`;
};

/**
 * Normalize certificate URL (remove leading slash if present)
 * @param url - URL to normalize
 * @returns Normalized URL without leading slash
 */
export const normalizeCertificateUrl = (url: string): string => {
  const normalized = url.startsWith('/') ? url.slice(1) : url;
  return normalized;
};

/**
 * Build full certificate URL with proper hash routing
 * @param certificateUrl - The certificate URL path (can be encrypted or plain)
 * @returns Full URL with hash routing
 */
export const buildFullCertificateUrl = (certificateUrl: string | undefined): string => {
  if (!certificateUrl || certificateUrl.trim() === '') {
    console.error('❌ ERROR: Certificate URL is empty or undefined!');
    return '/';
  }
  
  const normalized = normalizeCertificateUrl(certificateUrl);
  const fullUrl = `${window.location.origin}/${normalized}`;
  return fullUrl;
};