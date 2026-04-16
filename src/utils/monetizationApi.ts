import { projectId, publicAnonKey } from './supabase/info';

const BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/monetization`;

const headers = (token?: string): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token || publicAnonKey}`,
});

const handle = async (res: Response) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
};

// ---- Types ----

export interface Product {
  id: string;
  sellerId: string;
  sellerOrgId?: string;
  type: 'certificate' | 'course' | 'pdf';
  title: string;
  description: string;
  priceNGN: number; // in kobo
  currency: string;
  status: 'active' | 'draft' | 'archived';
  certificateTemplateId?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SellerProfile {
  userId: string;
  displayName: string;
  email: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankCode: string;
  bankName: string;
  accountType: string;
  verified: boolean;
  verifiedAt?: string;
  paystackRecipientCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  reference: string;
  productId: string;
  productType: string;
  sellerId: string;
  buyerEmail: string;
  buyerName: string;
  amountTotal: number;
  platformFee: number;
  sellerEarning: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'refunded';
  createdAt: string;
  completedAt?: string;
  holdUntil?: string;
  released?: boolean;
  invoiceId?: string;
}

export interface SellerBalance {
  sellerId: string;
  totalEarned: number;
  pendingHold: number;
  availableBalance: number;
  totalWithdrawn: number;
  lastUpdated?: string;
}

export interface Payout {
  id: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  recipientCode?: string;
  paystackTransferCode?: string;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
}

export interface Invoice {
  id: string;
  reference: string;
  buyerEmail: string;
  buyerName: string;
  sellerId: string;
  productId: string;
  productTitle: string;
  amountTotal: number;
  platformFee: number;
  sellerEarning: number;
  currency: string;
  status: 'paid' | 'refunded';
  issuedAt: string;
  refundedAt?: string;
}

export interface NigerianBank {
  id: number;
  name: string;
  code: string;
  slug: string;
}

export interface PlatformOverview {
  platformFees: number;
  totalTransactions: number;
  pendingPayouts: number;
  lastUpdated?: string;
}

// ---- Products ----

export const productApi = {
  list: (token: string, orgId?: string): Promise<{ products: Product[] }> =>
    fetch(`${BASE}/products${orgId ? `?orgId=${orgId}` : ''}`, { headers: headers(token) }).then(handle),

  getPublic: (productId: string): Promise<{ product: Product }> =>
    fetch(`${BASE}/products/${productId}/public`, { headers: headers() }).then(handle),

  create: (token: string, data: Partial<Product>): Promise<{ product: Product }> =>
    fetch(`${BASE}/products`, { method: 'POST', headers: headers(token), body: JSON.stringify(data) }).then(handle),

  update: (token: string, id: string, data: Partial<Product>): Promise<{ product: Product }> =>
    fetch(`${BASE}/products/${id}`, { method: 'PUT', headers: headers(token), body: JSON.stringify(data) }).then(handle),

  remove: (token: string, id: string): Promise<{ success: boolean }> =>
    fetch(`${BASE}/products/${id}`, { method: 'DELETE', headers: headers(token) }).then(handle),
};

// ---- Seller ----

export const sellerApi = {
  getProfile: (token: string): Promise<{ profile: SellerProfile | null }> =>
    fetch(`${BASE}/seller/profile`, { headers: headers(token) }).then(handle),

  onboard: (token: string, data: { bankAccountNumber: string; bankCode: string; bankName: string; displayName?: string }): Promise<{ profile: SellerProfile }> =>
    fetch(`${BASE}/seller/onboard`, { method: 'POST', headers: headers(token), body: JSON.stringify(data) }).then(handle),

  verifyBank: (token: string, data: { bankAccountNumber: string; bankCode: string }): Promise<{ accountName: string; verified: boolean }> =>
    fetch(`${BASE}/seller/verify-bank`, { method: 'POST', headers: headers(token), body: JSON.stringify(data) }).then(handle),

  getEarnings: (token: string): Promise<{ balance: SellerBalance }> =>
    fetch(`${BASE}/seller/earnings`, { headers: headers(token) }).then(handle),

  getTransactions: (token: string): Promise<{ transactions: Transaction[] }> =>
    fetch(`${BASE}/seller/transactions`, { headers: headers(token) }).then(handle),

  getInvoices: (token: string): Promise<{ invoices: Invoice[] }> =>
    fetch(`${BASE}/seller/invoices`, { headers: headers(token) }).then(handle),

  requestPayout: (token: string): Promise<{ payout: Payout }> =>
    fetch(`${BASE}/seller/payout/request`, { method: 'POST', headers: headers(token), body: JSON.stringify({}) }).then(handle),

  getPayouts: (token: string): Promise<{ payouts: Payout[] }> =>
    fetch(`${BASE}/seller/payouts`, { headers: headers(token) }).then(handle),
};

// ---- Banks ----

export const bankApi = {
  list: (token: string): Promise<{ banks: NigerianBank[] }> =>
    fetch(`${BASE}/banks`, { headers: headers(token) }).then(handle),
};

// ---- Payments ----

export const certificatePaymentApi = {
  initialize: (data: { certificateId: string; buyerEmail: string; buyerName: string }): Promise<{ authorizationUrl: string; reference: string }> =>
    fetch(`${BASE}/payments/initialize-certificate`, { method: 'POST', headers: headers(''), body: JSON.stringify(data) }).then(handle),

  verify: (reference: string): Promise<{ success: boolean; transaction: any; certificateId: string }> =>
    fetch(`${BASE}/payments/verify-certificate`, { method: 'POST', headers: headers(''), body: JSON.stringify({ reference }) }).then(handle),
};

export const paymentApi = {
  initialize: (data: { productId: string; buyerEmail: string; buyerName: string }): Promise<{ authorizationUrl: string; reference: string }> =>
    fetch(`${BASE}/payments/initialize`, { method: 'POST', headers: headers(), body: JSON.stringify(data) }).then(handle),

  verify: (reference: string, token?: string): Promise<{ success: boolean; transaction: Transaction; invoice: Invoice }> =>
    fetch(`${BASE}/payments/verify`, { method: 'POST', headers: headers(token), body: JSON.stringify({ reference }) }).then(handle),
};

// ---- Invoices ----

export const invoiceApi = {
  getById: (invoiceId: string): Promise<{ invoice: Invoice }> =>
    fetch(`${BASE}/invoices/${invoiceId}`, { headers: headers() }).then(handle),
};

// ---- Admin ----

export const adminMonetizationApi = {
  getProducts: (token: string): Promise<{ products: Product[] }> =>
    fetch(`${BASE}/admin/products`, { headers: headers(token) }).then(handle),

  getOverview: (token: string): Promise<{ overview: PlatformOverview }> =>
    fetch(`${BASE}/admin/overview`, { headers: headers(token) }).then(handle),

  getTransactions: (token: string): Promise<{ transactions: Transaction[] }> =>
    fetch(`${BASE}/admin/transactions`, { headers: headers(token) }).then(handle),

  getSellers: (token: string): Promise<{ sellers: (SellerProfile & { balance: SellerBalance })[] }> =>
    fetch(`${BASE}/admin/sellers`, { headers: headers(token) }).then(handle),

  getPayouts: (token: string): Promise<{ payouts: Payout[] }> =>
    fetch(`${BASE}/admin/payouts`, { headers: headers(token) }).then(handle),

  processPayout: (token: string, payoutId: string): Promise<{ success: boolean; payout: Payout }> =>
    fetch(`${BASE}/admin/payouts/${payoutId}/process`, { method: 'POST', headers: headers(token), body: JSON.stringify({}) }).then(handle),

  issueRefund: (token: string, reference: string, reason?: string): Promise<{ success: boolean }> =>
    fetch(`${BASE}/admin/refund`, { method: 'POST', headers: headers(token), body: JSON.stringify({ reference, reason }) }).then(handle),

  getSettings: (token: string): Promise<{ settings: { platformFeePercent: number; payoutSchedule: string } }> =>
    fetch(`${BASE}/admin/settings`, { headers: headers(token) }).then(handle),

  updateSettings: (token: string, data: object): Promise<{ success: boolean }> =>
    fetch(`${BASE}/admin/settings`, { method: 'POST', headers: headers(token), body: JSON.stringify(data) }).then(handle),
};

// ---- Utils ----

export const formatKobo = (kobo: number, currency = 'NGN'): string => {
  const amount = kobo / 100;
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
};

export const koboFromNaira = (naira: number): number => Math.round(naira * 100);
export const nairaFromKobo = (kobo: number): number => kobo / 100;
