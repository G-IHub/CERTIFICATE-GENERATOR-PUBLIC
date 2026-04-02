/**
 * Interswitch Configuration from Environment Variables
 * These should be stored in your .env.local file
 */

export const getInterswitchCredentials = () => {
  const merchantCode = import.meta.env.VITE_INTERSWITCH_MERCHANT_CODE;
  const payItemId = import.meta.env.VITE_INTERSWITCH_PAY_ITEM_ID;
  const isLive = import.meta.env.VITE_INTERSWITCH_LIVE === 'true';
  const webhookSecret = import.meta.env.VITE_INTERSWITCH_WEBHOOK_SECRET;

  if (!merchantCode || !payItemId) {
    throw new Error(
      'Missing Interswitch configuration. Please set VITE_INTERSWITCH_MERCHANT_CODE and VITE_INTERSWITCH_PAY_ITEM_ID in your .env.local file',
    );
  }

  return {
    merchantCode,
    payItemId,
    isLive,
    webhookSecret,
  };
};

export default {
  getInterswitchCredentials,
};
