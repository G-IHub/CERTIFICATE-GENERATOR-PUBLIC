import { useState, useEffect, useCallback } from "react";
import { Button } from "./ui/button";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Loader2, AlertCircle, CheckCircle, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { certificatePaymentApi } from "../utils/api";
import {
  createInlineCheckoutRequest,
  initializeInlineCheckout,
  isInterswitchPaymentSuccessful,
  fromMinorAmount,
} from "../utils/interswitch";

interface InterswitchPaymentModalProps {
  certificateId: string;
  certificateName: string;
  priceKobo: number; // Price in kobo (minor denomination)
  onPaymentComplete: (transactionRef: string) => void;
  onClose: () => void;
}

export default function InterswitchPaymentModal({
  certificateId,
  certificateName,
  priceKobo,
  onPaymentComplete,
  onClose,
}: InterswitchPaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentName, setStudentName] = useState("");
  const [checkoutInitialized, setCheckoutInitialized] = useState(false);
  const [paymentInProgress, setPaymentInProgress] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Load Interswitch checkout script
  useEffect(() => {
    const loadInterswitchScript = () => {
      if ((window as any).webpayCheckout) {
        setCheckoutInitialized(true);
        return;
      }

      const script = document.createElement("script");
      script.src = "https://newwebpay.qa.interswitchng.com/inline-checkout.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).webpayCheckout) {
          setCheckoutInitialized(true);
          console.log("✅ Interswitch checkout script loaded");
        }
      };
      script.onerror = () => {
        console.error("❌ Failed to load Interswitch checkout script");
        setError("Failed to load payment processor");
      };
      document.head.appendChild(script);
    };

    loadInterswitchScript();
  }, []);

  const handlePaymentComplete = useCallback((response: any) => {
    console.log("💳 Interswitch payment response:", response);
    setPaymentInProgress(true);
    setPaymentResult(response);

    if (isInterswitchPaymentSuccessful(response)) {
      const txnRef = response.txnref || response.TransactionRef;
      const amount = response.amount || response.Amount;

      // Verify payment on backend
      verifyPayment(txnRef, amount);
    } else {
      setError(
        response.desc ||
          response.ResponseDescription ||
          "Payment was not successful",
      );
      setPaymentInProgress(false);
    }
  }, []);

  const verifyPayment = async (transactionRef: string, amount: number) => {
    try {
      const response = await certificatePaymentApi.verifyInterswitch({
        transactionRef,
        amount,
        certificateId,
      });

      if (response.success) {
        toast.success("Payment verified successfully!");
        setPaymentInProgress(false);
        onPaymentComplete(transactionRef);
      } else {
        setError(response.error || "Failed to verify payment");
        setPaymentInProgress(false);
      }
    } catch (err: any) {
      console.error("❌ Payment verification error:", err);
      setError(err.message || "Failed to verify payment");
      setPaymentInProgress(false);
    }
  };

  const handleInitiatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!studentEmail) {
      setError("Email is required");
      return;
    }

    if (!checkoutInitialized) {
      setError("Payment processor is not ready. Please refresh and try again.");
      return;
    }

    setLoading(true);

    try {
      // Initialize payment on backend
      const response = await certificatePaymentApi.initializeInterswitch({
        certificateId,
        studentEmail,
        studentName: studentName || "Student",
      });

      if (!response.success) {
        setError(response.error || "Failed to initialize payment");
        setLoading(false);
        return;
      }

      // Launch Interswitch inline checkout
      const paymentRequest = createInlineCheckoutRequest({
        merchantCode: response.paymentParams.merchant_code,
        payItemId: response.paymentParams.pay_item_id,
        payItemName: response.paymentParams.pay_item_name,
        amount: fromMinorAmount(Number(response.paymentParams.amount)),
        currency: "NGN",
        transactionRef: response.paymentParams.txn_ref,
        customerName: response.paymentParams.cust_name,
        customerEmail: response.paymentParams.cust_email,
        customerId: response.paymentParams.cust_id,
        onComplete: handlePaymentComplete,
        mode: response.paymentParams.mode === "LIVE" ? "LIVE" : "TEST",
      });

      const initialized = initializeInlineCheckout(paymentRequest);
      if (!initialized) {
        setError("Failed to initialize checkout");
      }
      setLoading(false);
    } catch (err: any) {
      console.error("❌ Error initializing payment:", err);
      setError(err.message || "Failed to initialize payment");
      setLoading(false);
    }
  };

  const priceNaira = fromMinorAmount(priceKobo);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Complete Payment
          </CardTitle>
          <CardDescription>{certificateName}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Amount Display */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-sm text-gray-600 mb-1">Amount due</div>
            <div className="text-3xl font-bold text-blue-600">
              ₦{priceNaira.toFixed(2)}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Payment Success */}
          {paymentResult && isInterswitchPaymentSuccessful(paymentResult) && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Payment processing completed. Verifying with Interswitch...
              </AlertDescription>
            </Alert>
          )}

          {/* Form - Only show if not completed */}
          {!paymentResult && (
            <form onSubmit={handleInitiatePayment} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="student@example.com"
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name (Optional)
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  disabled={loading}
                  className="mt-1"
                />
              </div>

              <Button
                type="submit"
                disabled={loading || !checkoutInitialized}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  "Pay with Card"
                )}
              </Button>
            </form>
          )}

          {/* Verifying */}
          {paymentInProgress && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-gray-600">
                Verifying payment...
              </span>
            </div>
          )}

          {/* Close Button */}
          {!paymentInProgress && (
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="w-full"
            >
              Close
            </Button>
          )}

          {/* Info */}
          <div className="text-xs text-gray-500 text-center pt-2">
            <p>Powered by Interswitch</p>
            <p>Your payment information is secure and encrypted</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
