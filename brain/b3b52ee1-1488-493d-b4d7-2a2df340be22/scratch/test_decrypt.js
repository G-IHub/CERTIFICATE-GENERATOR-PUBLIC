const CryptoJS = require('c:\\Users\\OWNER\\Documents\\Genomac\\Certifyer\\node_modules\\crypto-js');

const ENCRYPTION_KEY = 'cert-platform-key-2025';

const encryptCertificateData = (
  organizationId,
  courseName,
  certificateId,
  expirationDays = 365
) => {
  const now = Date.now();
  const expiresAt = now + (expirationDays * 24 * 60 * 60 * 1000);

  const data = {
    organizationId,
    courseName,
    certificateId,
    timestamp: now,
    expiresAt
  };

  const dataString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
  return encodeURIComponent(encrypted);
};

const decryptCertificateData = (encryptedData) => {
  try {
    const decodedData = decodeURIComponent(encryptedData);
    const decrypted = CryptoJS.AES.decrypt(decodedData, ENCRYPTION_KEY);
    const dataString = decrypted.toString(CryptoJS.enc.Utf8);
    if (!dataString) return null;
    return JSON.parse(dataString);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

// Test
const orgId = 'org-123';
const course = 'Test Course';
const certId = 'CERT-12345';
const enc = encryptCertificateData(orgId, course, certId);
console.log('Encrypted string (encoded):', enc);
const dec = decryptCertificateData(enc);
console.log('Decrypted data:', dec);
