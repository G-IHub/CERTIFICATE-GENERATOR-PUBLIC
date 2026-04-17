# Interswitch Payment Integration Guide

## Overview

This guide explains the Interswitch Web Checkout integration for certificate monetization using inline checkout mode. Customers can complete payments without leaving your site.

## Environment Variables

Add these variables to your `.env.local` file:

```env
# Interswitch Configuration
VITE_INTERSWITCH_MERCHANT_CODE=MX6072        # Your Interswitch merchant code (from Quickteller Business)
VITE_INTERSWITCH_PAY_ITEM_ID=101007          # Your pay item ID (from Quickteller Business)
VITE_INTERSWITCH_LIVE=false                  # Set to true for production, false for testing

# Server-side environment variables (Supabase secrets)
INTERSWITCH_MERCHANT_CODE=MX6072
INTERSWITCH_PAY_ITEM_ID=101007
INTERSWITCH_LIVE=false
INTERSWITCH_WEBHOOK_SECRET=your_webhook_secret_key
APP_PUBLIC_URL=http://localhost:5173         # Frontend URL for redirects
```

## Getting Started

### 1. Create Interswitch Developer Account

1. Sign up at: https://developer.interswitchgroup.com
2. Create an application and get test credentials
3. Go to Quickteller Business: https://business.quickteller.com
4. Find your `Merchant Code` and create a `Pay Item` to get your `Pay Item ID`

### 2. Test Credentials

Use these test card details for testing:

```
Card Number: 5061050000000001
Expiry: 05/25
CVV: 999
PIN: 0000
OTP: 123456
```

### 3. Payment Flow

```
Frontend (User) 
    ↓
[Initialize Payment] → Backend API creates payment intent
    ↓
[Show Inline Checkout] → Interswitch JS SDK opens modal popup
    ↓
[User Enters Card Details] → No data stored on your server (PCI compliant)
    ↓
[Payment Processing] → Interswitch processes transaction
    ↓
[Verify Payment] → Backend confirms with Interswitch API
    ↓
[Grant Access] → Certificate unlocked for download
```

## API Endpoints

### Initialize Payment

**Endpoint:** `POST /certificate-payments/interswitch/initialize`

**Request:**
```json
{
  "certificateId": "uuid",
  "studentEmail": "student@example.com",
  "studentName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "txnRef": "CERT1704067200000ABC123",
  "paymentParams": {
    "merchant_code": "MX6072",
    "pay_item_id": "101007",
    "pay_item_name": "Course Name - Payment",
    "txn_ref": "CERT1704067200000ABC123",
    "amount": 500000,
    "currency": "566",
    "cust_id": "cert-uuid",
    "cust_name": "John Doe",
    "cust_email": "student@example.com",
    "site_redirect_url": "http://localhost:5173/?payment_complete=CERT...",
    "mode": "TEST"
  },
  "certificateInfo": {
    "id": "uuid",
    "name": "Course Name",
    "organizationId": "org-uuid"
  }
}
```

### Verify Payment

**Endpoint:** `POST /certificate-payments/interswitch/verify`

**Request:**
```json
{
  "transactionRef": "CERT1704067200000ABC123",
  "amount": 500000,
  "certificateId": "uuid"
}
```

**Response:**
```json
{
  "success": true,
  "certificate": {
    "id": "uuid",
    "paymentStatus": "paid",
    "paidAt": "2024-01-01T12:00:00Z"
  },
  "transactionDetails": {
    "reference": "FBN|WEB|MX6072|01-01-2024|3481032|762672",
    "amount": 500000,
    "date": "2024-01-01T12:00:00Z",
    "bankCode": "011"
  }
}
```

## Webhook Handler

Interswitch will POST to your webhook endpoint (configured in Quickteller Business):

**Endpoint:** `POST /certificate-payments/webhook`

**Webhook Payload:**
```json
{
  "event": "TRANSACTION.COMPLETED",
  "uuid": "unique-id",
  "timestamp": 1704067200000,
  "data": {
    "responseCode": "00",
    "responseDescription": "Approved by Financial Institution",
    "amount": 500000,
    "paymentReference": "FBN|WEB|MX6072|01-01-2024|3481032|762672",
    "merchantReference": "CERT1704067200000ABC123",
    "transactionDate": 1704067200000,
    "cardNumber": "561233*********0865",
    "bankCode": "011"
  }
}
```

## Frontend Implementation

### Using the Payment Modal

```tsx
import InterswitchPaymentModal from '@/components/InterswitchPaymentModal';
import { useState } from 'react';

export function BuyCertificate({ certificate }) {
  const [showPayment, setShowPayment] = useState(false);

  const handlePaymentComplete = (transactionRef) => {
    console.log('Payment verified:', transactionRef);
    // Certificate is now unlocked and accessible
    setShowPayment(false);
  };

  return (
    <>
      <button onClick={() => setShowPayment(true)}>
        Buy Certificate - ₦{certificate.price}
      </button>

      {showPayment && (
        <InterswitchPaymentModal
          certificateId={certificate.id}
          certificateName={certificate.name}
          priceKobo={certificate.priceMinor}
          onPaymentComplete={handlePaymentComplete}
          onClose={() => setShowPayment(false)}
        />
      )}
    </>
  );
}
```

## Amount Format

Interswitch uses **minor denominations** (Kobo for NGN):

```typescript
// Convert from NGN to Kobo
const kobo = Math.round(naira * 100);

// Convert from Kobo to NGN
const naira = kobo / 100;

// Example:
1000 NGN = 100,000 Kobo
```

## Transaction Status Codes

| Code | Meaning |
|------|---------|
| `00` | Approved by Financial Institution |
| `01` | Declined |
| `05` | Do not honour |
| `12` | Invalid transaction |
| `13` | Invalid amount |
| `30` | Format error |
| `51` | Insufficient funds |
| `91` | Issuer or switch is inoperative |
| `T0` | OTP Required (Verve/Mastercard) |
| `S0` | 3D Secure Required (Visa) |

## Currency Codes

| Currency | ISO Code |
|----------|----------|
| NGN (Naira) | 566 |

## Security Best Practices

1. **Never store card details** - Interswitch handles card data securely
2. **Always verify server-side** - Don't trust client-side payment responses
3. **Use HTTPS only** - Never send payment data over HTTP
4. **Validate amounts** - Always verify amounts match before processing
5. **Keep credentials secure** - Store merchant code and pay item ID in environment variables

## Testing

### Test with Test Card

1. Set `VITE_INTERSWITCH_LIVE=false` in `.env.local`
2. Use the test card details provided above
3. Check that payment modal opens correctly
4. Verify payment is recorded in your database

### Common Issues

| Issue | Solution |
|-------|----------|
| "Checkout script not loaded" | Ensure the Interswitch script URL is correct for your mode (test/live) |
| "Invalid merchant code" | Check your credentials in environment variables |
| "Payment amount mismatch" | Ensure amount is correctly converted to Kobo |
| "Failed to verify payment" | Ensure backend can reach Interswitch API endpoints |

## Going Live

1. Create production Interswitch account with KYC verification
2. Get live merchant code and pay item ID
3. Update environment variables: `INTERSWITCH_LIVE=true`
4. Update script URL in payment component to production endpoint
5. Set up webhook in Quickteller Business dashboard
6. Test with small transactions before full rollout

## Webhook Configuration

1. Log in to https://business.quickteller.com
2. Go to **Developer Tools** → **Webhooks**
3. Set webhook URL to: `https://your-domain.com/make-server-a611b057/certificate-payments/webhook`
4. Select events: `TRANSACTION.COMPLETED`
5. Copy and save the webhook secret

## Troubleshooting

### Payment not verifying

Check these endpoints are accessible:
- `https://qa.interswitchng.com/collections/api/v1/gettransaction` (test)
- `https://webpay.interswitchng.com/collections/api/v1/gettransaction` (live)

### Webhook not being received

1. Check webhook URL in Quickteller Business matches your endpoint
2. Verify your server is publicly accessible
3. Check firewall/routing allows inbound requests from Interswitch
4. Return HTTP 200 immediately in webhook handler

### Transaction reference not found

Ensure payment intent is stored before showing checkout:
- Backend stores intent with transaction reference as key
- Transaction reference must match between frontend and backend

## References

- [Interswitch API Documentation](https://docs.interswitchgroup.com)
- [Web Checkout Guide](https://docs.interswitchgroup.com/docs/web-checkout)
- [Payment API Reference](https://docs.interswitchgroup.com/docs/payment-api)
- [Webhooks Guide](https://docs.interswitchgroup.com/docs/webhooks)
- [Quickteller Business](https://business.quickteller.com)

## Support

For issues with:
- **Integration**: Check API documentation links above
- **Test Credentials**: Contact Interswitch support
- **Account Issues**: Log in to Quickteller Business dashboard
