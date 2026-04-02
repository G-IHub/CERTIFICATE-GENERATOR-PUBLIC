/**
 * Interswitch Payment Configuration & Utilities
 * Supports Web Checkout (inline and redirect modes)
 */

// ================= CONFIGURATION =================

export const INTERSWITCH_CONFIG = {
  // Test environment
  test: {
    baseUrl: 'https://qa.interswitchng.com',
    webCheckoutUrl: 'https://newwebpay.qa.interswitchng.com',
    inlineCheckoutScript: 'https://newwebpay.qa.interswitchng.com/inline-checkout.js',
    collectionsApiUrl: 'https://qa.interswitchng.com/collections/api/v1',
  },
  // Live environment
  live: {
    baseUrl: 'https://interswitchng.com',
    webCheckoutUrl: 'https://newwebpay.interswitchng.com',
    inlineCheckoutScript: 'https://newwebpay.interswitchng.com/inline-checkout.js',
    collectionsApiUrl: 'https://webpay.interswitchng.com',
  },
};

// ================= TYPES =================

export interface InterswitchPaymentRequest {
  merchant_code: string;
  pay_item_id: string;
  pay_item_name: string;
  txn_ref: string;
  amount: number; // Amount in minor (e.g., kobo for NGN)
  currency: string; // ISO 4217 numeric code (566 for NGN)
  cust_id?: string;
  cust_name?: string;
  cust_email?: string;
  cust_mobile_no?: string;
  site_redirect_url?: string;
  tokenise_card?: boolean;
  onComplete?: (response: InterswitchPaymentResponse) => void;
  mode: 'TEST' | 'LIVE';
}

export interface InterswitchPaymentResponse {
  TransactionRef?: string;
  PaymentId?: string;
  Message?: string;
  Amount?: string;
  ResponseCode?: string;
  ResponseDescription?: string;
  PaymentReference?: string;
  RetrievalReferenceNumber?: string;
  TransactionDate?: string;
  CardNumber?: string;
  BankCode?: string;
  STAN?: string;
  TerminalId?: string;
  // Inline checkout response
  txnref?: string;
  amount?: number;
  resp?: string;
  desc?: string;
  retRef?: string;
}

export interface InterswitchTransactionStatus {
  Amount: number;
  CardNumber: string;
  MerchantReference: string;
  PaymentReference: string;
  RetrievalReferenceNumber: string;
  TransactionDate: string;
  ResponseCode: string;
  ResponseDescription: string;
  BankCode: string;
  STAN: string;
  TerminalId?: string;
  Channel: string;
  SplitAccounts: any[];
  RemittanceAmount: number;
}

// ================= HELPER FUNCTIONS =================

/**
 * Get Interswitch environment configuration
 */
export const getInterswitchConfig = (isLive: boolean = false) => {
  return isLive ? INTERSWITCH_CONFIG.live : INTERSWITCH_CONFIG.test;
};

/**
 * Generate a unique transaction reference
 * Format: ISW_{timestamp}_{random}
 */
export const generateTransactionRef = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ISW_${timestamp}_${random}`;
};

/**
 * Convert amount to minor denomination (kobo for NGN)
 * @param amount Amount in naira
 * @returns Amount in kobo
 */
export const toMinorAmount = (amount: number): number => {
  return Math.round(amount * 100);
};

/**
 * Convert amount from minor denomination to major
 * @param amountMinor Amount in kobo
 * @returns Amount in naira
 */
export const fromMinorAmount = (amountMinor: number): number => {
  return amountMinor / 100;
};

/**
 * Get currency code for Interswitch
 * NGN = 566 (ISO 4217 numeric code)
 */
export const getCurrencyCode = (currency: string = 'NGN'): number => {
  const currencyCodes: Record<string, number> = {
    NGN: 566,
    // Add other currencies as needed
  };
  return currencyCodes[currency] || 566;
};

/**
 * Validate Interswitch payment response
 */
export const isInterswitchPaymentSuccessful = (response: InterswitchPaymentResponse): boolean => {
  const successCodes = ['00']; // '00' = Approved by Financial Institution
  const responseCode = response.ResponseCode || response.resp;
  return successCodes.includes(responseCode);
};

/**
 * Format Interswitch response for display
 */
export const formatInterswitchResponse = (response: InterswitchPaymentResponse): string => {
  const description = response.ResponseDescription || response.desc;
  const amount = response.Amount || response.amount;
  return `${description}${amount ? ` - Amount: ${fromMinorAmount(Number(amount))} NGN` : ''}`;
};

/**
 * Create Interswitch payment request for inline checkout
 */
export const createInlineCheckoutRequest = (params: {
  merchantCode: string;
  payItemId: string;
  payItemName: string;
  amount: number; // In major currency (e.g., NGN)
  currency?: string;
  transactionRef: string;
  customerName?: string;
  customerEmail: string;
  customerId?: string;
  customerPhone?: string;
  onComplete: (response: InterswitchPaymentResponse) => void;
  mode?: 'TEST' | 'LIVE';
}): InterswitchPaymentRequest => {
  return {
    merchant_code: params.merchantCode,
    pay_item_id: params.payItemId,
    pay_item_name: params.payItemName,
    txn_ref: params.transactionRef,
    amount: toMinorAmount(params.amount), // Convert to minor
    currency: getCurrencyCode(params.currency).toString(),
    cust_name: params.customerName || 'Student',
    cust_email: params.customerEmail,
    cust_id: params.customerId,
    cust_mobile_no: params.customerPhone,
    onComplete: params.onComplete,
    mode: params.mode || 'TEST',
  };
};

/**
 * Initialize Interswitch inline checkout
 * Call this after the script is loaded
 */
export const initializeInlineCheckout = (request: InterswitchPaymentRequest) => {
  if (typeof window === 'undefined' || !(window as any).webpayCheckout) {
    console.error('Interswitch checkout script not loaded');
    return false;
  }
  
  try {
    (window as any).webpayCheckout(request);
    return true;
  } catch (error) {
    console.error('Failed to initialize Interswitch checkout:', error);
    return false;
  }
};

/**
 * Verify transaction status after payment
 * Should be called server-side for security
 */
export const createTransactionVerificationUrl = (params: {
  baseUrl: string;
  merchantCode: string;
  transactionReference: string;
  amount: number;
}): string => {
  const url = new URL(`${params.baseUrl}/collections/api/v1/gettransaction`);
  url.searchParams.append('merchantcode', params.merchantCode);
  url.searchParams.append('transactionreference', params.transactionReference);
  url.searchParams.append('amount', params.amount.toString());
  return url.toString();
};

/**
 * Type for Interswitch webhook payload
 */
export interface InterswitchWebhookPayload {
  event: string; // e.g., "TRANSACTION.COMPLETED"
  uuid: string;
  timestamp: number;
  data: {
    remittanceAmount: number;
    bankCode: string;
    amount: number;
    paymentReference: string;
    channel: string;
    splitAccounts: any[];
    retrievalReferenceNumber: string;
    stan: string;
    transactionDate: number;
    accountNumber: string | null;
    responseCode: string;
    token: string | null;
    responseDescription: string;
    paymentId: number;
    merchantCustomerId: string;
    escrow: boolean;
    merchantReference: string;
    currencyCode: string;
    merchantCustomerName: string;
    cardNumber: string;
  };
}

/**
 * Verify Interswitch webhook signature using HMAC-SHA512
 * @param payload The raw JSON string from the webhook
 * @param signature The X-Interswitch-Signature header value
 * @param secret Your Interswitch webhook secret key
 */
export const verifyInterswitchWebhookSignature = (
  payload: string,
  signature: string,
  secret: string,
): boolean => {
  try {
    // Note: This requires Node.js crypto or a polyfill
    // For browser, you'd typically do this server-side
    if (typeof window !== 'undefined') {
      console.warn('Webhook signature verification should be done server-side');
      return false;
    }

    const crypto = require('crypto');
    const hash = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Failed to verify webhook signature:', error);
    return false;
  }
};

export default {
  INTERSWITCH_CONFIG,
  getInterswitchConfig,
  generateTransactionRef,
  toMinorAmount,
  fromMinorAmount,
  getCurrencyCode,
  isInterswitchPaymentSuccessful,
  formatInterswitchResponse,
  createInlineCheckoutRequest,
  initializeInlineCheckout,
  createTransactionVerificationUrl,
  verifyInterswitchWebhookSignature,
};
