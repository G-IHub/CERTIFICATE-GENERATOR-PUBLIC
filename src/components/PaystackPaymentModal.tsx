import React, { useState } from "react";
import { CreditCard, X, Lock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { certificatePaymentApi, paymentApi, formatKobo } from "../utils/monetizationApi";

interface PaystackPaymentModalProps {
  itemId: string;
  paymentType?: "certificate" | "product";
  itemName: string;
  /** Price in kobo (NGN). 0 = not offered in NGN */
  priceKobo: number;
  /** Price in cents (USD). 0 = not offered in USD */
  priceUSDCents?: number;
  email: string;
  buyerName: string;
  onPaymentComplete: (transactionRef: string) => void;
  onClose: () => void;
  // Legacy prop support
  certificateId?: string;
  certificateName?: string;
  currency?: string; // ignored — kept for backward-compat
}

export default function PaystackPaymentModal({
  itemId,
  paymentType = "certificate",
  itemName,
  priceKobo,
  priceUSDCents = 0,
  email,
  buyerName,
  onPaymentComplete,
  onClose,
  certificateId,
  certificateName,
}: PaystackPaymentModalProps) {
  const resolvedId = itemId || certificateId || "";
  const resolvedName = itemName || certificateName || "";

  const [loading, setLoading] = useState<"NGN" | "USD" | null>(null);
  const [success, setSuccess] = useState(false);

  const hasNGN = priceKobo > 0;
  const hasUSD = priceUSDCents > 0;

  const handlePay = async (currency: "NGN" | "USD") => {
    setLoading(currency);
    try {
      let authorizationUrl: string;
      let reference: string;

      if (paymentType === "certificate") {
        const result = await certificatePaymentApi.initialize({
          certificateId: resolvedId,
          buyerEmail: email,
          buyerName,
          currency,
        });
        authorizationUrl = result.authorizationUrl;
        reference = result.reference;
        sessionStorage.setItem("pending_payment_type", "certificate");
        sessionStorage.setItem("pending_payment_cert", resolvedId);
      } else {
        const result = await paymentApi.initialize({
          productId: resolvedId,
          buyerEmail: email,
          buyerName,
        });
        authorizationUrl = result.authorizationUrl;
        reference = result.reference;
        sessionStorage.setItem("pending_payment_type", "product");
      }

      sessionStorage.setItem("pending_payment_ref", reference);
      sessionStorage.setItem("pending_return_url", window.location.href);
      window.location.href = authorizationUrl;
    } catch (e: any) {
      toast.error(e.message || "Failed to start payment");
      setLoading(null);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
          <p className="text-gray-500 mt-2">You can now view and download your certificate.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-indigo-600" />
            </div>
            <span className="font-semibold text-gray-900">Complete Purchase</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-6 space-y-5">
          {/* Item info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">You are purchasing</p>
            <p className="font-semibold text-gray-900">{resolvedName}</p>
          </div>

          {/* Buyer info */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Payment Details</p>
            <div className="rounded-lg border border-gray-200 px-4 py-3 space-y-1">
              <p className="text-sm text-gray-900">{buyerName}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          {/* Pay buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Choose how to pay</p>

            {hasNGN && (
              <button
                onClick={() => handlePay("NGN")}
                disabled={loading !== null}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {loading === "NGN" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {formatKobo(priceKobo, "NGN")} in Naira
                  </>
                )}
              </button>
            )}

            {hasUSD && (
              <button
                onClick={() => handlePay("USD")}
                disabled={loading !== null}
                className={`w-full font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 ${
                  hasNGN
                    ? "bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 disabled:opacity-60"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
                }`}
              >
                {loading === "USD" ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirecting...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-4 h-4" />
                    Pay {formatKobo(priceUSDCents, "USD")} in Dollars
                  </>
                )}
              </button>
            )}

            {!hasNGN && !hasUSD && (
              <p className="text-sm text-red-500 text-center">No price has been set for this certificate.</p>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Secure payment powered by Paystack. Your card details are never stored on our servers.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}
