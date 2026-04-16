import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Wallet,
  CheckCircle2,
  Loader2,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";

interface BankAccount {
  accountNumber: string;
  bankCode: string;
  bankName: string;
  accountName: string;
  verified: boolean;
}

interface PayoutRequest {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  bankAccount: BankAccount;
}

interface AdminPayoutManagementProps {
  accessToken: string;
}

export default function AdminPayoutManagement({
  accessToken,
}: AdminPayoutManagementProps) {
  const [pendingPayouts, setPendingPayouts] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    loadPendingPayouts();
  }, []);

  const loadPendingPayouts = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/admin/payouts/pending`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to load pending payouts");
      }

      const data = await response.json();
      setPendingPayouts(data.payouts || []);
    } catch (error: any) {
      console.error("Error loading pending payouts:", error);
      toast.error(error.message || "Failed to load pending payouts");
    } finally {
      setIsLoading(false);
    }
  };

  const processPayout = async (payoutId: string) => {
    try {
      setProcessingPayoutId(payoutId);

      const response = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/admin/payouts/${payoutId}/process`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process payout");
      }

      toast.success("Payout processed successfully");
      await loadPendingPayouts();
    } catch (error: any) {
      console.error("Error processing payout:", error);
      toast.error(error.message || "Failed to process payout");
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const formatCurrency = (amount: number, currency: string = "NGN") => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Payout Management
          </CardTitle>
          <CardDescription>Loading pending payouts...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Payout Management
        </CardTitle>
        <CardDescription>
          Review and process payout requests from organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingPayouts.length === 0 ? (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">
              No pending payouts at this time
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {pendingPayouts.map((payout) => (
              <div key={payout.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold text-lg">
                        {formatCurrency(payout.amount, payout.currency)}
                      </span>
                      <Badge variant="secondary">{payout.status}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      Organization: {payout.organizationId}
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested: {formatDate(payout.requestedAt)}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded p-3 space-y-1">
                  <div className="text-sm font-medium">
                    Bank Account Details
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Account Name:</strong>{" "}
                    {payout.bankAccount.accountName}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Account Number:</strong>{" "}
                    {payout.bankAccount.accountNumber}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Bank:</strong> {payout.bankAccount.bankName}
                  </div>
                </div>

                {payout.failureReason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{payout.failureReason}</AlertDescription>
                  </Alert>
                )}

                {payout.status === "pending" && (
                  <Button
                    onClick={() => processPayout(payout.id)}
                    disabled={processingPayoutId === payout.id}
                    className="w-full"
                  >
                    {processingPayoutId === payout.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Process Payout
                      </>
                    )}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Processing payouts will transfer funds from your Paystack balance to
            the organization's bank account. Ensure you have sufficient balance.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}