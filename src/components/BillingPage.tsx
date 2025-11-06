import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  CreditCard,
  Check,
  Crown,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { publicAnonKey, projectId } from "../utils/supabase/info";
import BillingSkeleton from "./skeletons/BillingSkeleton";

interface BillingPageProps {
  organizationId: string;
  organizationName: string;
  userEmail: string;
  accessToken: string | null;
}

interface Plan {
  name: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
}

interface Subscription {
  organizationId: string;
  plan: string;
  planName: string;
  planId?: string;
  status: "active" | "expired" | "free" | "cancelled";
  startDate?: string;
  expiryDate?: string;
  features?: string[];
  expiredOn?: string;
  previousPlan?: string;
  cancelledAt?: string;
}

interface Transaction {
  reference: string;
  organizationId: string;
  userId: string;
  planId: string;
  amount: number;
  currency: string;
  status: "pending" | "success" | "failed";
  createdAt: string;
  verifiedAt?: string;
}

interface BillingActivity {
  id: string;
  organizationId: string;
  type:
    | "payment_initiated"
    | "payment_success"
    | "payment_failed"
    | "subscription_activated"
    | "subscription_cancelled"
    | "subscription_expired"
    | "subscription_renewed";
  description: string;
  metadata: any;
  timestamp: string;
}

export default function BillingPage({
  organizationId,
  organizationName,
  userEmail,
  accessToken,
}: BillingPageProps) {
  const [loading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [billingConfigured, setBillingConfigured] = useState(false);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [billingActivities, setBillingActivities] = useState<BillingActivity[]>(
    []
  );
  const [activeTab, setActiveTab] = useState("subscription");
  const [activitiesDisplayCount, setActivitiesDisplayCount] = useState(5); // Show 5 activities initially

  useEffect(() => {
    // Load billing data whenever accessToken OR organizationId changes
    console.debug("BillingPage: effect triggered", {
      organizationId,
      accessToken,
    });
    loadBillingData();

    // Check for Paystack payment callback
    // Paystack redirects with: ?trxref=xxx&reference=yyy&tab=billing
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference") || urlParams.get("trxref");
    const tab = urlParams.get("tab");

    console.debug("BillingPage: URL params", { reference, tab });

    if (reference && accessToken) {
      console.log(
        "🔄 Payment callback detected, verifying reference:",
        reference
      );
      toast.info("Verifying your payment...");
      verifyPayment(reference);

      // Note: URL cleanup is handled by AdminDashboard after 2 seconds
      // This allows BillingPage to detect the reference parameter
    }
  }, [accessToken, organizationId]);

  const loadBillingData = async () => {
    try {
      // Set default plans first so user always sees something
      const defaultPlans = {
        premium_monthly: {
          name: "Premium Monthly",
          price: 1000, // $10.00 USD (1000 cents)
          currency: "USD",
          duration: 30,
          features: [
            "Custom Templates",
            "Template Builder",
            "Unlimited Certificates",
            "Priority Support",
            "Advanced Analytics",
            "Custom Branding",
            "Bulk Generation",
            "API Access",
          ],
        },
        premium_yearly: {
          name: "Premium Yearly",
          price: 10000, // $100.00 USD (10000 cents) - 2 months free bonus!
          currency: "USD",
          duration: 365,
          features: [
            "All Monthly Features",
            "Custom Templates",
            "Template Builder",
            "Unlimited Certificates",
            "Priority Support",
            "Advanced Analytics",
            "Custom Branding",
            "Bulk Generation",
            "API Access",
            "2 Months Free (Best Value!)",
          ],
        },
      };

      setPlans(defaultPlans);

      // Check if billing is configured
      const configResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/config`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (configResponse.ok) {
        const configData = await configResponse.json();
        console.log("📊 Billing config received:", configData);
        setBillingConfigured(configData.configured);
        // Override with admin-configured plans if they exist
        if (configData.plans && Object.keys(configData.plans).length > 0) {
          console.log("✅ Using admin-configured plans");
          setPlans(configData.plans);
        } else {
          console.log("⚠️ No admin plans found, using defaults");
        }
      } else {
        console.error(
          "❌ Failed to fetch billing config:",
          configResponse.status
        );
      }

      if (!accessToken) return;

      // Load subscription status
      const subResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/subscription/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let currentSubscription: Subscription | null = null;
      if (subResponse.ok) {
        const subData = await subResponse.json();
        currentSubscription = subData;
        setSubscription(subData);
      } else {
        // Set default free plan if no subscription found
        const freeSubscription = {
          organizationId,
          plan: "free",
          planName: "Free Plan",
          status: "free" as const,
          features: [
            "7 Basic Templates",
            "Up to 50 Certificates",
            "Basic Analytics",
            "Standard Support",
          ],
        };
        currentSubscription = freeSubscription;
        setSubscription(freeSubscription);
      }

      // Load transaction history
      const txResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/transactions/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      let loadedTransactions: Transaction[] = [];
      if (txResponse.ok) {
        const txData = await txResponse.json();
        loadedTransactions = txData.transactions || [];
      }

      // If we have a subscription but no transactions, create a display entry
      // This happens when a subscription is manually activated, set by admin, or cancelled
      // IMPORTANT: Create transaction for any premium subscription, regardless of status
      if (currentSubscription) {
        // Get the plan ID from either planId or plan field
        const activePlanId =
          currentSubscription.planId || currentSubscription.plan;

        // Check if subscription is premium (not free), regardless of status
        // This ensures cancelled subscriptions still show their payment history
        if (activePlanId && activePlanId !== "free") {
          // Check if we already have a transaction for this subscription
          const hasTransaction = loadedTransactions.some(
            (tx) =>
              (tx.planId === activePlanId ||
                tx.planId === currentSubscription!.planId) &&
              tx.status === "success"
          );

          // If no transaction exists, create a synthetic one for display purposes
          if (!hasTransaction) {
            const plan = defaultPlans[activePlanId];
            const displayStartDate =
              currentSubscription.startDate || new Date().toISOString();

            const syntheticTransaction: Transaction = {
              reference: `SUBSCRIPTION-${organizationId.substring(0, 8)}`,
              organizationId: currentSubscription.organizationId,
              userId: organizationId, // Use org ID as fallback
              planId: activePlanId,
              amount: plan?.price || 0,
              currency: plan?.currency || "NGN",
              status: "success",
              createdAt: displayStartDate,
              verifiedAt: displayStartDate,
            };

            // Add to the beginning of the transactions array
            loadedTransactions = [syntheticTransaction, ...loadedTransactions];
            console.log("📝 Added subscription to payment history:", {
              planId: activePlanId,
              planName: currentSubscription.planName,
              status: currentSubscription.status,
              startDate: displayStartDate,
              note: "Included for complete billing history, regardless of status",
            });
          }
        }
      }

      setTransactions(loadedTransactions);

      // Load billing activities
      const activitiesResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/activities/${organizationId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setBillingActivities(activitiesData.activities || []);
        console.log(
          "📋 Loaded billing activities:",
          activitiesData.activities?.length || 0
        );
      } else {
        console.log("��️ No billing activities found or failed to fetch");
        setBillingActivities([]);
      }
    } catch (error) {
      console.error("Failed to load billing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const initiatePayment = async (planId: string) => {
    if (!accessToken) {
      toast.error("Please log in to upgrade");
      return;
    }

    if (!billingConfigured) {
      toast.error("Billing is not configured yet. Please contact support.");
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Debug: log the init payload
      console.debug("BillingPage: initiating payment", {
        organizationId,
        planId,
      });
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/initialize`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            organizationId,
            planId,
          }),
        }
      );
      let data: any = null;
      let rawText: string | null = null;
      try {
        rawText = await response.text();
        if (rawText) {
          try {
            data = JSON.parse(rawText);
          } catch (err) {
            console.error(
              "BillingPage: failed to parse initialize response body as JSON",
              err,
              rawText
            );
          }
        }
      } catch (err) {
        console.error(
          "BillingPage: failed to read initialize response text",
          err
        );
      }

      console.debug("BillingPage: initialize response", {
        status: response.status,
        ok: response.ok,
        body: data,
        rawText,
        headers: Array.from(response.headers.entries()),
      });

      if (!response.ok) {
        // Helpful debugging: show server-provided error and status
        if (data?.requiresSetup) {
          console.error(
            "BillingPage: backend indicates billing system not configured",
            data
          );
          toast.error(
            "Billing system is not configured. Please contact support."
          );
        } else {
          console.error("BillingPage: initialize failed", {
            status: response.status,
            body: data,
            rawText,
          });
          // Show a more informative toast when possible
          const serverMsg = data?.error || data?.message || rawText;
          toast.error(
            serverMsg ||
              `Failed to initialize payment (status ${response.status})`
          );
        }
        return;
      }

      // Redirect to Paystack checkout
      if (data?.authorizationUrl) {
        console.info(
          "BillingPage: redirecting to payment provider",
          data.authorizationUrl
        );
        toast.success("Redirecting to payment page...");
        window.location.href = data.authorizationUrl;
      } else {
        console.warn(
          "BillingPage: initialize succeeded but no authorizationUrl returned",
          data
        );
        toast.error(
          "Payment initialization did not return a redirect URL. Please contact support."
        );
      }
    } catch (error: any) {
      console.error("Payment initialization error (network/exception):", error);
      toast.error(`Failed to initialize payment: ${error?.message || error}`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    if (!accessToken) {
      console.error("❌ No access token for payment verification");
      return;
    }

    try {
      console.log("🔄 Verifying payment with backend...");
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/verify`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reference }),
        }
      );

      const data = await response.json();
      console.log("✅ Verification response:", data);

      if (response.ok && data.success) {
        console.log("🎉 Payment verified successfully!");
        toast.success(
          "🎉 Payment verified! Your Premium subscription is now active!",
          {
            duration: 5000,
          }
        );

        // Reload billing data to show new subscription
        await loadBillingData();

        // Switch to subscription tab to show the new plan
        setActiveTab("subscription");
      } else {
        console.error("❌ Payment verification failed:", data);
        toast.error(
          data.error || "Payment verification failed. Please contact support."
        );
      }
    } catch (error: any) {
      console.error("❌ Payment verification error:", error);
      toast.error(
        "Failed to verify payment. Please contact support with your transaction reference."
      );
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    const value = ((amount || 0) / 100).toFixed(2);
    const currencySymbols: Record<string, string> = {
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      GHS: "₵",
    };
    const symbol = currencySymbols[currency.toUpperCase()] || currency;
    return `${symbol}${value}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isPremium =
    subscription &&
    subscription.status === "active" &&
    subscription.plan !== "free";

  const cancelSubscription = async () => {
    if (!accessToken || !subscription) {
      toast.error("Unable to cancel subscription");
      return;
    }

    // Confirm cancellation
    if (
      !window.confirm(
        "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/subscription/${organizationId}/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(
          "Subscription cancelled successfully. You will retain access until the end of your billing period."
        );
        await loadBillingData();
      } else {
        toast.error(data.error || "Failed to cancel subscription");
      }
    } catch (error: any) {
      console.error("Subscription cancellation error:", error);
      toast.error("Failed to cancel subscription");
    }
  };

  if (loading) {
    return <BillingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {isPremium ? (
                  <>
                    <Crown className="w-5 h-5 text-primary" />
                    Premium Plan
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 text-gray-400" />
                    Free Plan
                  </>
                )}
              </CardTitle>
              <CardDescription>{organizationName}</CardDescription>
            </div>
            <Badge
              variant={isPremium ? "default" : "secondary"}
              className="text-sm"
            >
              {subscription?.status === "active"
                ? "Active"
                : subscription?.status === "cancelled"
                ? "Cancelled"
                : subscription?.status === "expired"
                ? "Expired"
                : "Free"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isPremium && subscription?.expiryDate && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plan Name:</span>
                <span className="font-medium">{subscription.planName}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Expires On:</span>
                <span className="font-medium">
                  {formatDate(subscription.expiryDate)}
                </span>
              </div>
              {subscription.features && subscription.features.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium mb-2">Included Features:</p>
                  <ul className="space-y-1">
                    {subscription.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="text-sm text-gray-600 flex items-center gap-2"
                      >
                        <Check className="w-4 h-4 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {/* Cancel Subscription Button or Cancellation Notice */}
              <div className="mt-6 pt-4 border-t">
                {subscription.status === "cancelled" ? (
                  <Alert className="bg-amber-50 border-amber-200">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-900">
                      <strong>Subscription Cancelled:</strong> Your subscription
                      has been cancelled and will not renew. You'll retain
                      access to premium features until{" "}
                      {subscription.expiryDate &&
                        formatDate(subscription.expiryDate)}
                      .
                    </AlertDescription>
                  </Alert>
                ) : (
                  <>
                    <Button
                      onClick={cancelSubscription}
                      variant="outline"
                      className="w-full sm:w-auto border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                    <p className="text-xs text-gray-500 mt-2">
                      You'll retain access until{" "}
                      {subscription.expiryDate &&
                        formatDate(subscription.expiryDate)}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          {!isPremium && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                You're currently on the Free Plan. Here's what you have access
                to:
              </p>

              {/* Free Plan Features */}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-semibold mb-3 text-gray-900">
                  Your Free Plan Includes:
                </p>
                <ul className="space-y-2">
                  <li className="text-sm text-gray-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>7 Basic Templates</strong> - Professional
                      certificate designs
                    </span>
                  </li>
                  <li className="text-sm text-gray-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Up to 50 Certificates</strong> - Generate
                      certificates for your programs
                    </span>
                  </li>
                  <li className="text-sm text-gray-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Basic Analytics</strong> - Track certificate
                      generation and views
                    </span>
                  </li>
                  <li className="text-sm text-gray-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Certificate Sharing</strong> - Email and social
                      media sharing
                    </span>
                  </li>
                  <li className="text-sm text-gray-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Secure URLs</strong> - Unique certificate
                      verification links
                    </span>
                  </li>
                  <li className="text-sm text-gray-700 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong>Standard Support</strong> - Email support within
                      48 hours
                    </span>
                  </li>
                </ul>
              </div>

              {/* Upgrade CTA */}
              <div className="pt-2">
                <p className="text-sm text-gray-600 mb-3">
                  Want more? Upgrade to Premium for unlimited certificates and
                  custom templates!
                </p>
                <Button
                  onClick={() => setActiveTab("plans")}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  View Premium Plans
                </Button>
              </div>
            </div>
          )}
          {subscription?.status === "expired" && subscription.previousPlan && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your {subscription.previousPlan} subscription expired on{" "}
                {formatDate(subscription.expiredOn!)}. Renew now to continue
                using premium features.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="plans">Upgrade Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="subscription" className="space-y-4">
          {/* Billing Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Billing Activity</CardTitle>
              <CardDescription>
                Complete history of your subscription and payments
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                // MERGED APPROACH: Combine backend activities with computed activities from transactions
                // This ensures we never lose history, even during the transition to the new logging system

                const hasTransactions = transactions.length > 0;
                const hasSubscription = subscription !== null;
                const hasBackendActivities = billingActivities.length > 0;

                if (
                  !hasBackendActivities &&
                  !hasTransactions &&
                  !hasSubscription
                ) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No billing activity yet
                    </p>
                  );
                }

                // Build a complete merged timeline
                const mergedActivities: Array<{
                  id: string;
                  type: string;
                  description: string;
                  timestamp: string;
                  metadata: any;
                  source: "backend" | "computed";
                }> = [];

                // Debug logging
                console.log("🔍 Building billing activity timeline:", {
                  backendActivities: billingActivities.length,
                  transactions: transactions.length,
                  subscription: subscription?.status,
                });

                // Add all backend activities
                billingActivities.forEach((activity) => {
                  mergedActivities.push({
                    ...activity,
                    source: "backend",
                  });
                  console.log(
                    "✅ Added backend activity:",
                    activity.type,
                    activity.timestamp
                  );
                });

                // Compute activities from transactions (for backward compatibility)
                // Only add if not already covered by backend activities
                const backendReferences = new Set(
                  billingActivities
                    .filter((a) => a.metadata?.reference)
                    .map((a) => a.metadata.reference)
                );

                transactions.forEach((tx) => {
                  // Only add transaction-based activities if they're not already logged in backend
                  const alreadyLogged = backendReferences.has(tx.reference);

                  console.log(`🔄 Processing transaction ${tx.reference}:`, {
                    status: tx.status,
                    planId: tx.planId,
                    alreadyLogged,
                    amount: tx.amount,
                  });

                  if (!alreadyLogged) {
                    // Add payment activity
                    mergedActivities.push({
                      id: `computed-payment-${tx.reference}`,
                      type:
                        tx.status === "success"
                          ? "payment_success"
                          : "payment_initiated",
                      description: `Payment ${
                        tx.status === "success" ? "successful" : "initiated"
                      } for ${plans[tx.planId]?.name || tx.planId}`,
                      timestamp: tx.createdAt,
                      metadata: {
                        reference: tx.reference,
                        planId: tx.planId,
                        planName: plans[tx.planId]?.name,
                        amount: tx.amount,
                        currency: tx.currency,
                      },
                      source: "computed",
                    });
                    console.log(
                      "✅ Added computed payment activity:",
                      tx.reference
                    );

                    // Add activation if successful
                    if (tx.status === "success" && tx.verifiedAt) {
                      mergedActivities.push({
                        id: `computed-activation-${tx.reference}`,
                        type: "subscription_activated",
                        description: `${
                          plans[tx.planId]?.name || "Premium"
                        } subscription activated`,
                        timestamp: tx.verifiedAt,
                        metadata: {
                          planId: tx.planId,
                          planName: plans[tx.planId]?.name,
                        },
                        source: "computed",
                      });
                      console.log(
                        "✅ Added computed activation activity:",
                        tx.reference
                      );
                    }
                  }
                });

                console.log("📊 Merged activities summary:", {
                  total: mergedActivities.length,
                  backend: mergedActivities.filter(
                    (a) => a.source === "backend"
                  ).length,
                  computed: mergedActivities.filter(
                    (a) => a.source === "computed"
                  ).length,
                });

                // Add cancellation if not already in backend activities
                const hasCancellationActivity = billingActivities.some(
                  (a) => a.type === "subscription_cancelled"
                );
                if (
                  subscription?.status === "cancelled" &&
                  subscription.cancelledAt &&
                  !hasCancellationActivity
                ) {
                  mergedActivities.push({
                    id: `computed-cancellation-${subscription.cancelledAt}`,
                    type: "subscription_cancelled",
                    description: `${subscription.planName} subscription cancelled`,
                    timestamp: subscription.cancelledAt,
                    metadata: {
                      planId: subscription.planId,
                      planName: subscription.planName,
                      expiryDate: subscription.expiryDate,
                    },
                    source: "computed",
                  });
                }

                // Add expiration if not already in backend activities
                const hasExpirationActivity = billingActivities.some(
                  (a) => a.type === "subscription_expired"
                );
                if (
                  subscription?.status === "expired" &&
                  subscription.expiredOn &&
                  !hasExpirationActivity
                ) {
                  mergedActivities.push({
                    id: `computed-expiration-${subscription.expiredOn}`,
                    type: "subscription_expired",
                    description: "Subscription expired",
                    timestamp: subscription.expiredOn,
                    metadata: {
                      previousPlan: subscription.previousPlan,
                    },
                    source: "computed",
                  });
                }

                // Sort by timestamp (newest first)
                mergedActivities.sort(
                  (a, b) =>
                    new Date(b.timestamp).getTime() -
                    new Date(a.timestamp).getTime()
                );

                if (mergedActivities.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No billing activity yet
                    </p>
                  );
                }

                // Get activities to display based on current display count
                const activitiesToShow = mergedActivities.slice(
                  0,
                  activitiesDisplayCount
                );
                const hasMoreActivities =
                  mergedActivities.length > activitiesDisplayCount;
                const remainingCount =
                  mergedActivities.length - activitiesDisplayCount;

                return (
                  <div className="space-y-4">
                    {/* Activity count summary */}
                    <div className="flex items-center justify-between text-sm text-gray-600 pb-2">
                      <span>
                        {mergedActivities.length}{" "}
                        {mergedActivities.length === 1
                          ? "activity"
                          : "activities"}{" "}
                        found
                      </span>
                      {mergedActivities.length > 5 && hasMoreActivities && (
                        <button
                          onClick={() =>
                            setActivitiesDisplayCount(mergedActivities.length)
                          }
                          className="text-primary hover:underline"
                        >
                          Show all
                        </button>
                      )}
                    </div>

                    {/* Scrollable activity timeline with fade effect */}
                    <div className="relative">
                      <div className="max-h-[600px] overflow-y-auto scroll-smooth pr-2 border border-gray-100 rounded-lg p-4 bg-gray-50/50">
                        {(() => {
                          return (
                            <div className="relative space-y-4">
                              {/* Timeline line */}
                              <div className="absolute left-[19px] top-8 bottom-8 w-0.5 bg-gray-200"></div>

                              {activitiesToShow.map((activity, index) => {
                                const plan = activity.metadata?.planId
                                  ? plans[activity.metadata.planId]
                                  : null;

                                // Determine colors and icons based on activity type
                                const getActivityStyle = () => {
                                  switch (activity.type) {
                                    case "payment_initiated":
                                      return {
                                        icon: (
                                          <CreditCard className="w-5 h-5" />
                                        ),
                                        dotClass: "bg-gray-100 text-gray-600",
                                        cardClass: "bg-gray-50 border-gray-200",
                                        textClass: "text-gray-900",
                                      };
                                    case "payment_success":
                                      return {
                                        icon: <Check className="w-5 h-5" />,
                                        dotClass: "bg-green-100 text-green-600",
                                        cardClass:
                                          "bg-green-50 border-green-200",
                                        textClass: "text-green-900",
                                      };
                                    case "payment_failed":
                                      return {
                                        icon: (
                                          <AlertCircle className="w-5 h-5" />
                                        ),
                                        dotClass: "bg-red-100 text-red-600",
                                        cardClass: "bg-red-50 border-red-200",
                                        textClass: "text-red-900",
                                      };
                                    case "subscription_activated":
                                      return {
                                        icon: <Sparkles className="w-5 h-5" />,
                                        dotClass: "bg-blue-100 text-blue-600",
                                        cardClass: "bg-blue-50 border-blue-200",
                                        textClass: "text-blue-900",
                                      };
                                    case "subscription_cancelled":
                                      return {
                                        icon: (
                                          <AlertCircle className="w-5 h-5" />
                                        ),
                                        dotClass: "bg-amber-100 text-amber-600",
                                        cardClass:
                                          "bg-amber-50 border-amber-200",
                                        textClass: "text-amber-900",
                                      };
                                    case "subscription_expired":
                                      return {
                                        icon: <Clock className="w-5 h-5" />,
                                        dotClass: "bg-red-100 text-red-600",
                                        cardClass: "bg-red-50 border-red-200",
                                        textClass: "text-red-900",
                                      };
                                    case "subscription_renewed":
                                      return {
                                        icon: (
                                          <TrendingUp className="w-5 h-5" />
                                        ),
                                        dotClass: "bg-green-100 text-green-600",
                                        cardClass:
                                          "bg-green-50 border-green-200",
                                        textClass: "text-green-900",
                                      };
                                    default:
                                      return {
                                        icon: <FileText className="w-5 h-5" />,
                                        dotClass: "bg-gray-100 text-gray-600",
                                        cardClass: "bg-gray-50 border-gray-200",
                                        textClass: "text-gray-900",
                                      };
                                  }
                                };

                                const style = getActivityStyle();

                                return (
                                  <div
                                    key={`${activity.id}-${index}`}
                                    className="relative flex gap-4"
                                  >
                                    {/* Timeline dot */}
                                    <div
                                      className={`relative z-10 flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.dotClass}`}
                                    >
                                      {style.icon}
                                    </div>

                                    {/* Activity content */}
                                    <div className="flex-1 pb-6">
                                      <div
                                        className={`p-4 rounded-lg border ${style.cardClass}`}
                                      >
                                        {/* Activity details */}
                                        <div className="flex items-start justify-between mb-2">
                                          <div className="flex-1">
                                            <p
                                              className={`font-medium mb-1 ${style.textClass}`}
                                            >
                                              {activity.description}
                                            </p>
                                            {activity.metadata?.planName && (
                                              <p className="text-sm opacity-80">
                                                {activity.metadata.planName}
                                                {activity.metadata.duration &&
                                                  ` - ${
                                                    activity.metadata
                                                      .duration === 30
                                                      ? "1 Month"
                                                      : activity.metadata
                                                          .duration === 365
                                                      ? "1 Year"
                                                      : `${activity.metadata.duration} Days`
                                                  }`}
                                              </p>
                                            )}
                                            {activity.metadata?.expiryDate &&
                                              activity.type ===
                                                "subscription_cancelled" && (
                                                <p className="text-sm opacity-80 mt-1">
                                                  Access until{" "}
                                                  {formatDate(
                                                    activity.metadata.expiryDate
                                                  )}
                                                </p>
                                              )}
                                          </div>
                                          {activity.metadata?.amount && (
                                            <div className="text-right">
                                              <p
                                                className={`font-bold ${style.textClass}`}
                                              >
                                                {formatCurrency(
                                                  activity.metadata.amount,
                                                  activity.metadata.currency ||
                                                    "NGN"
                                                )}
                                              </p>
                                            </div>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2 text-xs opacity-70">
                                          <Clock className="w-3 h-3" />
                                          <span>
                                            {formatDate(activity.timestamp)}
                                          </span>
                                          {activity.metadata?.reference && (
                                            <>
                                              <span className="text-gray-400">
                                                •
                                              </span>
                                              <span className="font-mono">
                                                {activity.metadata.reference}
                                              </span>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    {/* Load More Button */}
                    {hasMoreActivities && (
                      <div className="flex flex-col items-center gap-3 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          Showing {activitiesToShow.length} of{" "}
                          {mergedActivities.length} activities
                        </p>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActivitiesDisplayCount((prev) => prev + 5)
                            }
                            className="flex-1 sm:flex-initial"
                          >
                            Load 5 More
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() =>
                              setActivitiesDisplayCount(mergedActivities.length)
                            }
                            className="flex-1 sm:flex-initial"
                          >
                            Show All ({remainingCount})
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Show All loaded message with Collapse option */}
                    {!hasMoreActivities && mergedActivities.length > 5 && (
                      <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          All {mergedActivities.length} activities loaded
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setActivitiesDisplayCount(5)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          Collapse to 5
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {/* Debug Info - Show Billing Status */}
          <Alert
            className={
              billingConfigured
                ? "bg-green-50 border-green-200"
                : "bg-amber-50 border-amber-200"
            }
          >
            <AlertCircle
              className={`h-4 w-4 ${
                billingConfigured ? "text-green-600" : "text-amber-600"
              }`}
            />
            <AlertDescription
              className={
                billingConfigured ? "text-green-900" : "text-amber-900"
              }
            >
              {billingConfigured ? (
                <>
                  <strong>✅ Billing Configured:</strong> Payment processing is
                  enabled. You can upgrade to premium plans below.
                </>
              ) : (
                <>
                  <strong>⚠️ Billing Setup Required:</strong> The admin needs to
                  configure Paystack keys in Platform Admin → Billing. The plans
                  below will become available once billing is set up.
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Always show plans */}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(plans).map(([planId, plan]) => {
              const isCurrentPlan =
                subscription?.planId === planId && isPremium;
              return (
                <Card
                  key={planId}
                  className={
                    isCurrentPlan
                      ? "border-primary border-2"
                      : "border-2 border-gray-200"
                  }
                >
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{plan.name}</CardTitle>
                      {planId.includes("yearly") && (
                        <Badge className="bg-gradient-to-r from-orange-500 to-amber-600 text-white text-xs">
                          Best Value
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      <span className="text-3xl font-bold text-gray-900">
                        {formatCurrency(plan.price, plan.currency)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        / {plan.duration === 30 ? "month" : "year"}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, idx) => (
                        <li
                          key={idx}
                          className="text-sm flex items-start gap-2"
                        >
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      onClick={() => initiatePayment(planId)}
                      disabled={
                        isProcessingPayment ||
                        isCurrentPlan ||
                        !billingConfigured
                      }
                      className="w-full"
                      variant={isCurrentPlan ? "secondary" : "default"}
                    >
                      {isCurrentPlan ? (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Current Plan
                        </>
                      ) : !billingConfigured ? (
                        <>
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Coming Soon
                        </>
                      ) : isProcessingPayment ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 mr-2" />
                          Upgrade Now
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Free vs Premium Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-gray-700" />
                Free vs Premium Comparison
              </CardTitle>
              <CardDescription>See what you get with each plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-2 font-medium text-gray-900">
                        Feature
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-gray-600">
                        Free
                      </th>
                      <th className="text-center py-2 px-2 font-medium text-primary">
                        Premium
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    <tr>
                      <td className="py-3 px-2 text-gray-700">Templates</td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        7 Basic
                      </td>
                      <td className="py-3 px-2 text-center text-primary font-medium">
                        Unlimited Custom
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">
                        Certificates per Month
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        Up to 50
                      </td>
                      <td className="py-3 px-2 text-center text-primary font-medium">
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">
                        Template Builder
                      </td>
                      <td className="py-3 px-2 text-center text-gray-400">✗</td>
                      <td className="py-3 px-2 text-center text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">Analytics</td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        Basic
                      </td>
                      <td className="py-3 px-2 text-center text-primary font-medium">
                        Advanced
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">
                        Custom Branding
                      </td>
                      <td className="py-3 px-2 text-center text-gray-400">✗</td>
                      <td className="py-3 px-2 text-center text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">
                        Bulk Generation
                      </td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        Limited
                      </td>
                      <td className="py-3 px-2 text-center text-primary font-medium">
                        Unlimited
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">API Access</td>
                      <td className="py-3 px-2 text-center text-gray-400">✗</td>
                      <td className="py-3 px-2 text-center text-green-600">
                        ✓
                      </td>
                    </tr>
                    <tr>
                      <td className="py-3 px-2 text-gray-700">Support</td>
                      <td className="py-3 px-2 text-center text-gray-600">
                        48h Email
                      </td>
                      <td className="py-3 px-2 text-center text-primary font-medium">
                        Priority 24h
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Premium Features Info */}
          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Why Go Premium?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <FileText className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Custom Templates</p>
                    <p className="text-xs text-gray-600">
                      Create your own certificate designs
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <TrendingUp className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">
                      Unlimited Certificates
                    </p>
                    <p className="text-xs text-gray-600">
                      No limits on generation
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Crown className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Template Builder</p>
                    <p className="text-xs text-gray-600">
                      Visual template editor
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-primary mt-1" />
                  <div>
                    <p className="text-sm font-medium">Priority Support</p>
                    <p className="text-xs text-gray-600">
                      Get help when you need it
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
