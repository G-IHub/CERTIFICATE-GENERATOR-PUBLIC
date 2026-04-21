import React, { useState, useEffect } from "react";
import { CreditCard, X, Lock, CheckCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { certificatePaymentApi, paymentApi, formatKobo, exchangeRateApi } from "../utils/monetizationApi";

interface PaystackPaymentModalProps {
  itemId: string;
  paymentType?: "certificate" | "product";
  itemName: string;
  priceKobo: number;
  /** Currency the creator set — "NGN" (default) or "USD" */
  currency?: string;
  email: string;
  buyerName: string;
  onPaymentComplete: (transactionRef: string) => void;
  onClose: () => void;
  // Legacy prop support
  certificateId?: string;
  certificateName?: string;
}

export default function PaystackPaymentModal({
  itemId,
  paymentType = "certificate",
  itemName,
  priceKobo,
  currency = "NGN",
  email,
  buyerName,
  onPaymentComplete,
  onClose,
  certificateId,
  certificateName,
}: PaystackPaymentModalProps) {
  const resolvedId = itemId || certificateId || "";
  const resolvedName = itemName || certificateName || "";

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Currency toggle
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  // Amount in selected currency's minor unit
  const chargeAmountMinor = (() => {
    if (selectedCurrency === currency) return priceKobo;
    if (exchangeRate === null) return priceKobo;
    return Math.round((priceKobo / 100) * exchangeRate * 100);
  })();

  // Fetch live exchange rate when currency differs from creator's
  useEffect(() => {
    if (selectedCurrency === currency) {
      setExchangeRate(null);
      return;
    }
    setRateLoading(true);
    exchangeRateApi.get(currency, selectedCurrency)
      .then((data) => {
        if (data?.rate) setExchangeRate(data.rate);
        else toast.error("Could not fetch exchange rate");
      })
      .catch(() => toast.error("Could not fetch exchange rate"))
      .finally(() => setRateLoading(false));
  }, [selectedCurrency, currency]);

  const handlePay = async () => {
    setLoading(true);
    try {
      let authorizationUrl: string;
      let reference: string;

      if (paymentType === "certificate") {
        const result = await certificatePaymentApi.initialize({
          certificateId: resolvedId,
          buyerEmail: email,
          buyerName,
          currency: selectedCurrency,
          amountMinor: chargeAmountMinor,
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
      setLoading(false);
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
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">You are purchasing</p>
            <p className="font-semibold text-gray-900">{resolvedName}</p>

            {/* Currency toggle */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Pay in</p>
              <div className="flex gap-2">
                {["NGN", "USD"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedCurrency(c)}
                    className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      selectedCurrency === c
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {c === "NGN" ? "₦ NGN" : "$ USD"}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-500">Total</span>
              <div className="flex items-center gap-1.5">
                {rateLoading && <RefreshCw className="w-3.5 h-3.5 text-gray-400 animate-spin" />}
                <span className="text-lg font-bold text-gray-900">
                  {rateLoading ? "Converting…" : formatKobo(chargeAmountMinor, selectedCurrency)}
                </span>
              </div>
            </div>
            {selectedCurrency !== currency && exchangeRate && (
              <p className="text-xs text-gray-400">
                Live rate: 1 {currency} = {exchangeRate.toFixed(6)} {selectedCurrency}
              </p>
            )}
          </div>

          {/* Buyer info */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Payment Details</p>
            <div className="rounded-lg border border-gray-200 px-4 py-3 space-y-1">
              <p className="text-sm text-gray-900">{buyerName}</p>
              <p className="text-sm text-gray-500">{email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Lock className="w-3.5 h-3.5 shrink-0" />
            <span>Secure payment powered by Paystack. Your card details are never stored on our servers.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 space-y-3">
          <button
            onClick={handlePay}
            disabled={loading || rateLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Redirecting to payment...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Pay {rateLoading ? "…" : formatKobo(chargeAmountMinor, selectedCurrency)}
              </>
            )}
          </button>
          <button onClick={onClose} className="w-full text-sm text-gray-500 hover:text-gray-700 py-2 transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}
