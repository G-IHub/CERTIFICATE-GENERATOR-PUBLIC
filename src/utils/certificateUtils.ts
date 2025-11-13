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
  console.log('🆔 Generated certificate ID:', id);
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
 * @param programId - The program ID
 * @param certificateId - The certificate ID
 * @returns Complete certificate URL
 * @deprecated Use generateSecureCertificateUrl instead for encrypted links
 */
export const generateCertificateUrl = (
  organizationId: string, 
  programId: string, 
  certificateId: string
): string => {
  return `${window.location.origin}/#/certificate/${organizationId}/${programId}/${certificateId}`;
};

/**
 * Generate secure certificate URL with time-based encryption
 * @param organizationId - The organization ID
 * @param programId - The program ID
 * @param certificateId - The certificate ID
 * @param expirationDays - Number of days until link expires (default: 365)
 * @returns Complete encrypted certificate URL
 */
export const generateSecureCertificateUrl = (
  organizationId: string, 
  programId: string, 
  certificateId: string,
  expirationDays: number = 365
): string => {
  const encryptedData = encryptCertificateData(organizationId, programId, certificateId, expirationDays);
  return `${window.location.origin}/#/certificate/${encryptedData}`;
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
 * Generate a unique program ID using nanoid
 * Format: PROG-[8-character-nanoid]
 * Example: PROG-V1STGXR8
 */
export const generateProgramId = (): string => {
  return `PROG-${nanoid(8).toUpperCase()}`;
};

/**
 * Normalize certificate URL (remove leading slash if present)
 * @param url - URL to normalize
 * @returns Normalized URL without leading slash
 */
export const normalizeCertificateUrl = (url: string): string => {
  console.log('🔧 Normalizing URL:', url);
  const normalized = url.startsWith('/') ? url.slice(1) : url;
  console.log('🔧 Normalized URL:', normalized);
  return normalized;
};

/**
 * Build full certificate URL with proper hash routing
 * @param certificateUrl - The certificate URL path (can be encrypted or plain)
 * @returns Full URL with hash routing
 */
export const buildFullCertificateUrl = (certificateUrl: string | undefined): string => {

  
  if (!certificateUrl || certificateUrl.trim() === '') {
    return '#/';
  }
  
  const normalized = normalizeCertificateUrl(certificateUrl);
  const fullUrl = `${window.location.origin}/#/${normalized}`;
  return fullUrl;
};
