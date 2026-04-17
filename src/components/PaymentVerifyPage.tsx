import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { paymentApi, certificatePaymentApi } from "../utils/monetizationApi";

/**
 * This page handles the Paystack redirect after a buyer completes payment.
 * Paystack redirects to: /payment/verify?ref=CTFY_xxx
 *
 * It verifies the payment with our backend, then redirects accordingly.
 */
export default function PaymentVerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState("");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [returnUrl, setReturnUrl] = useState<string | null>(null);

  useEffect(() => {
    const ref = params.get("ref") || params.get("reference") || params.get("trxref");

    if (!ref) {
      setStatus("failed");
      setMessage("No payment reference found. If you completed a payment, please contact support.");
      return;
    }

    const paymentType = sessionStorage.getItem("pending_payment_type") || "product";
    const storedReturnUrl = sessionStorage.getItem("pending_return_url");

    const cleanup = () => {
      sessionStorage.removeItem("pending_payment_ref");
      sessionStorage.removeItem("pending_payment_cert");
      sessionStorage.removeItem("pending_payment_type");
      sessionStorage.removeItem("pending_return_url");
    };

    if (paymentType === "certificate") {
      certificatePaymentApi.verify(ref)
        .then(() => {
          setStatus("success");
          setMessage("Payment successful! You can now view and download your certificate.");
          setReturnUrl(storedReturnUrl);
          cleanup();
          // Auto-redirect back to the certificate after 2 seconds
          if (storedReturnUrl) {
            setTimeout(() => { window.location.href = storedReturnUrl; }, 2000);
          }
        })
        .catch((e: Error) => {
          cleanup();
          setStatus("failed");
          setMessage(e.message || "Payment verification failed. Please contact support with your reference.");
          setReturnUrl(storedReturnUrl);
        });
    } else {
      paymentApi.verify(ref)
        .then((result) => {
          setStatus("success");
          setMessage("Your payment was successful!");
          setInvoiceId(result.invoice?.id || null);
          setReturnUrl(storedReturnUrl);
          cleanup();
        })
        .catch((e: Error) => {
          cleanup();
          setStatus("failed");
          setMessage(e.message || "Payment verification failed. Please contact support with your reference.");
          setReturnUrl(storedReturnUrl);
        });
    }
  }, [params]);

  const goBack = () => {
    if (returnUrl) {
      window.location.href = returnUrl;
    } else {
      window.location.href = "/#/";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900">Verifying Payment</h2>
            <p className="text-gray-500 mt-2">Please wait while we confirm your payment...</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Payment Successful!</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            {invoiceId && (
              <p className="text-xs text-gray-400 mt-2">Invoice: {invoiceId}</p>
            )}
            <div className="mt-6 space-y-3">
              <button
                onClick={goBack}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                View Certificate
              </button>
              {invoiceId && (
                <button
                  onClick={() => navigate(`/invoice/${invoiceId}`)}
                  className="w-full text-sm text-indigo-600 hover:underline py-2"
                >
                  View Invoice
                </button>
              )}
              {returnUrl && (
                <p className="text-xs text-gray-400">Redirecting automatically in a moment...</p>
              )}
            </div>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Verification Failed</h2>
            <p className="text-gray-500 mt-2">{message}</p>
            <p className="text-xs text-gray-400 mt-3">
              Reference: {params.get("ref") || params.get("reference") || "—"}
            </p>
            <button
              onClick={goBack}
              className="mt-6 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              Go Back
            </button>
          </>
        )}
      </div>
    </div>
  );
}
