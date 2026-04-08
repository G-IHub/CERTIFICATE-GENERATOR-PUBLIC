import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Wallet,
  AlertCircle,
  CheckCircle2,
  Loader2,
  DollarSign,
  TrendingUp,
  Clock,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "./ui/badge";

interface BankAccount {
  accountType?: "nigerian" | "international";
  // Nigerian account fields
  accountNumber?: string;
  bankCode?: string;
  bankName?: string;
  accountName: string;
  // International account fields
  iban?: string;
  swiftCode?: string;
  routingNumber?: string;
  sortCode?: string;
  country?: string;
  bankAddress?: string;
  currency?: string;
  verified: boolean;
}

interface Balance {
  availableBalance: number;
  totalEarnings: number;
  pendingPayouts: number;
  currency: string;
}

interface PayoutRequest {
  id: string;
  organizationId: string;
  amount: number;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  processedAt?: string;
  bankAccount: BankAccount;
}

interface PayoutSettingsProps {
  organizationId: string;
  accessToken: string;
}

// List of Nigerian banks
const NIGERIAN_BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "063", name: "Access Bank (Diamond)" },
  { code: "035A", name: "ALAT by WEMA" },
  { code: "401", name: "ASO Savings and Loans" },
  { code: "50931", name: "Bowen Microfinance Bank" },
  { code: "50823", name: "CEMCS Microfinance Bank" },
  { code: "023", name: "Citibank Nigeria" },
  { code: "559", name: "Coronation Merchant Bank" },
  { code: "050", name: "Ecobank Nigeria" },
  { code: "562", name: "Ekondo Microfinance Bank" },
  { code: "070", name: "Fidelity Bank" },
  { code: "011", name: "First Bank of Nigeria" },
  { code: "214", name: "First City Monument Bank" },
  { code: "00103", name: "Globus Bank" },
  { code: "058", name: "Guaranty Trust Bank" },
  { code: "030", name: "Heritage Bank" },
  { code: "51244", name: "Hackman Microfinance Bank" },
  { code: "50383", name: "Hasal Microfinance Bank" },
  { code: "301", name: "Jaiz Bank" },
  { code: "082", name: "Keystone Bank" },
  { code: "50211", name: "Kuda Bank" },
  { code: "526", name: "Parallex Bank" },
  { code: "076", name: "Polaris Bank" },
  { code: "101", name: "Providus Bank" },
  { code: "125", name: "Rubies MFB" },
  { code: "51310", name: "Sparkle Microfinance Bank" },
  { code: "221", name: "Stanbic IBTC Bank" },
  { code: "068", name: "Standard Chartered Bank" },
  { code: "232", name: "Sterling Bank" },
  { code: "100", name: "Suntrust Bank" },
  { code: "302", name: "TAJ Bank" },
  { code: "51211", name: "TCF MFB" },
  { code: "102", name: "Titan Bank" },
  { code: "032", name: "Union Bank of Nigeria" },
  { code: "033", name: "United Bank For Africa" },
  { code: "215", name: "Unity Bank" },
  { code: "566", name: "VFD Microfinance Bank Limited" },
  { code: "035", name: "Wema Bank" },
  { code: "057", name: "Zenith Bank" },
];

export default function PayoutSettings({
  organizationId,
  accessToken,
}: PayoutSettingsProps) {
  const [bankAccount, setBankAccount] = useState<BankAccount>({
    accountType: "nigerian",
    accountNumber: "",
    bankCode: "",
    bankName: "",
    accountName: "",
    verified: false,
  });
  const [accountType, setAccountType] = useState<"nigerian" | "international">(
    "nigerian",
  );

  const [balance, setBalance] = useState<Balance>({
    availableBalance: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    currency: "NGN",
  });

  const [payoutRequests, setPayoutRequests] = useState<PayoutRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRequestingPayout, setIsRequestingPayout] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    loadPayoutData();
  }, [organizationId]);

  const loadPayoutData = async () => {
    try {
      setIsLoading(true);

      // Load bank account details
      const bankAccountResponse = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/bank-account`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (bankAccountResponse.ok) {
        const data = await bankAccountResponse.json();
        if (data.bankAccount) {
          setBankAccount(data.bankAccount);
          // Sync account type state with loaded data
          if (data.bankAccount.accountType) {
            setAccountType(data.bankAccount.accountType);
          }
        }
      }

      // Load balance
      const balanceResponse = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/balance`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (balanceResponse.ok) {
        const data = await balanceResponse.json();
        setBalance(data.balance);
      }

      // Load payout history
      const payoutsResponse = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/payouts`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (payoutsResponse.ok) {
        const data = await payoutsResponse.json();
        setPayoutRequests(data.payouts || []);
      }
    } catch (error) {
      console.error("Error loading payout data:", error);
      toast.error("Failed to load payout settings");
    } finally {
      setIsLoading(false);
    }
  };

  const verifyBankAccount = async () => {
    // International account validation
    if (accountType === "international") {
      if (!bankAccount.accountName || !bankAccount.country) {
        toast.error("Please enter account name and country");
        return;
      }

      // Manual verification for international accounts
      setBankAccount({
        ...bankAccount,
        accountType: "international",
        verified: true,
      });
      setHasUnsavedChanges(true);
      toast.success("International account ready to save");
      return;
    }

    // Nigerian account validation
    if (!bankAccount.accountNumber || !bankAccount.bankCode) {
      toast.error("Please enter account number and select a bank");
      return;
    }

    if (bankAccount.accountNumber.length !== 10) {
      toast.error("Account number must be 10 digits");
      return;
    }

    try {
      setIsVerifying(true);

      const response = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/bank-account/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            accountNumber: bankAccount.accountNumber,
            bankCode: bankAccount.bankCode,
            accountType: "nigerian",
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to verify account");
      }

      const data = await response.json();

      setBankAccount({
        ...bankAccount,
        accountType: "nigerian",
        accountName: data.accountName,
        verified: true,
      });

      setHasUnsavedChanges(true);
      toast.success(`Account verified: ${data.accountName}`);
    } catch (error: any) {
      console.error("Error verifying account:", error);
      toast.error(error.message || "Failed to verify bank account");
    } finally {
      setIsVerifying(false);
    }
  };

  const saveBankAccount = async () => {
    if (!bankAccount.verified) {
      toast.error("Please verify your bank account first");
      return;
    }

    try {
      setIsSaving(true);

      const response = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/bank-account`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ bankAccount }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save bank account");
      }

      setHasUnsavedChanges(false);
      toast.success("Bank account saved successfully");
    } catch (error: any) {
      console.error("Error saving bank account:", error);
      toast.error(error.message || "Failed to save bank account");
    } finally {
      setIsSaving(false);
    }
  };

  const requestPayout = async () => {
    const amount = parseFloat(payoutAmount);

    if (!amount || amount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    // Convert to kobo/cents (minor currency units)
    const amountInMinorUnits = Math.round(amount * 100);

    if (amountInMinorUnits > balance.availableBalance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!bankAccount.verified) {
      toast.error("Please verify and save your bank account first");
      return;
    }

    try {
      setIsRequestingPayout(true);

      const response = await fetch(
        `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/payouts/request`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            amount: amountInMinorUnits, // Send in kobo/cents
            currency: balance.currency,
          }),
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to request payout");
      }

      setPayoutAmount("");
      toast.success("Payout requested successfully");
      await loadPayoutData();
    } catch (error: any) {
      console.error("Error requesting payout:", error);
      toast.error(error.message || "Failed to request payout");
    } finally {
      setIsRequestingPayout(false);
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
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Payout Settings
            </CardTitle>
            <CardDescription>Loading payout information...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Balance Overview
          </CardTitle>
          <CardDescription>
            Track your earnings from certificate monetization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Wallet className="w-4 h-4" />
                Available Balance
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(balance.availableBalance, balance.currency)}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <TrendingUp className="w-4 h-4" />
                Total Earnings
              </div>
              <div className="text-2xl font-bold">
                {formatCurrency(balance.totalEarnings, balance.currency)}
              </div>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                Pending Payouts
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {formatCurrency(balance.pendingPayouts, balance.currency)}
              </div>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Certifyer retains 7% as platform fee. You earn 93% of each
              certificate payment.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Bank Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Bank Account Details
          </CardTitle>
          <CardDescription>
            Add your bank account to receive payouts (Nigerian or International)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Account Type Toggle */}
          <div className="space-y-2">
            <Label>Account Type</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={accountType === "nigerian" ? "default" : "outline"}
                onClick={() => {
                  setAccountType("nigerian");
                  setBankAccount({
                    accountType: "nigerian",
                    accountNumber: "",
                    bankCode: "",
                    bankName: "",
                    accountName: "",
                    verified: false,
                  });
                  setHasUnsavedChanges(true);
                }}
                className="flex-1"
              >
                🇳🇬 Nigerian Bank
              </Button>
              <Button
                type="button"
                variant={
                  accountType === "international" ? "default" : "outline"
                }
                onClick={() => {
                  setAccountType("international");
                  setBankAccount({
                    accountType: "international",
                    accountName: "",
                    country: "",
                    currency: "USD",
                    verified: false,
                  });
                  setHasUnsavedChanges(true);
                }}
                className="flex-1"
              >
                🌍 International Bank
              </Button>
            </div>
          </div>

          {/* Nigerian Bank Form */}
          {accountType === "nigerian" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    placeholder="0123456789"
                    value={bankAccount.accountNumber || ""}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);
                      setBankAccount({
                        ...bankAccount,
                        accountNumber: value,
                        verified: false,
                        accountName: "",
                      });
                      setHasUnsavedChanges(true);
                    }}
                    maxLength={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <select
                    id="bankName"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={bankAccount.bankCode || ""}
                    onChange={(e) => {
                      const selectedBank = NIGERIAN_BANKS.find(
                        (b) => b.code === e.target.value,
                      );
                      setBankAccount({
                        ...bankAccount,
                        bankCode: e.target.value,
                        bankName: selectedBank?.name || "",
                        verified: false,
                        accountName: "",
                      });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <option value="">Select Bank</option>
                    {NIGERIAN_BANKS.map((bank) => (
                      <option key={bank.code} value={bank.code}>
                        {bank.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* International Bank Form */}
          {accountType === "international" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    placeholder="John Doe"
                    value={bankAccount.accountName || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        accountName: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <select
                    id="country"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={bankAccount.country || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        country: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <option value="">Select Country</option>
                    <option value="US">🇺🇸 United States</option>
                    <option value="GB">🇬🇧 United Kingdom</option>
                    <option value="GH">🇬🇭 Ghana</option>
                    <option value="KE">🇰🇪 Kenya</option>
                    <option value="ZA">🇿🇦 South Africa</option>
                    <option value="CA">🇨🇦 Canada</option>
                    <option value="DE">🇩🇪 Germany</option>
                    <option value="FR">🇫🇷 France</option>
                    <option value="OTHER">🌍 Other</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <select
                    id="currency"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={bankAccount.currency || "USD"}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        currency: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GHS">GHS - Ghana Cedi</option>
                    <option value="KES">KES - Kenya Shilling</option>
                    <option value="ZAR">ZAR - South African Rand</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankNameIntl">Bank Name</Label>
                  <Input
                    id="bankNameIntl"
                    placeholder="Bank of America"
                    value={bankAccount.bankName || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        bankName: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN (if applicable)</Label>
                  <Input
                    id="iban"
                    placeholder="DE89 3704 0044 0532 0130 00"
                    value={bankAccount.iban || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        iban: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <p className="text-xs text-gray-500">For European banks</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="swiftCode">SWIFT/BIC Code</Label>
                  <Input
                    id="swiftCode"
                    placeholder="DEUTDEFF"
                    value={bankAccount.swiftCode || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        swiftCode: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <p className="text-xs text-gray-500">8 or 11 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">Routing Number (if US)</Label>
                  <Input
                    id="routingNumber"
                    placeholder="021000021"
                    value={bankAccount.routingNumber || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        routingNumber: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <p className="text-xs text-gray-500">9 digits for US banks</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sortCode">Sort Code (if UK)</Label>
                  <Input
                    id="sortCode"
                    placeholder="12-34-56"
                    value={bankAccount.sortCode || ""}
                    onChange={(e) => {
                      setBankAccount({
                        ...bankAccount,
                        sortCode: e.target.value,
                        verified: false,
                      });
                      setHasUnsavedChanges(true);
                    }}
                  />
                  <p className="text-xs text-gray-500">6 digits for UK banks</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAddress">Bank Address (optional)</Label>
                <Input
                  id="bankAddress"
                  placeholder="123 Main St, New York, NY 10001"
                  value={bankAccount.bankAddress || ""}
                  onChange={(e) => {
                    setBankAccount({
                      ...bankAccount,
                      bankAddress: e.target.value,
                    });
                    setHasUnsavedChanges(true);
                  }}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  International transfers may take 3-5 business days and may
                  incur additional fees from your bank.
                </AlertDescription>
              </Alert>
            </>
          )}

          {bankAccount.accountName && bankAccount.verified && (
            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">
                <strong>Verified Account:</strong> {bankAccount.accountName}
                {accountType === "international" && bankAccount.country && (
                  <span> • {bankAccount.country}</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button
              onClick={verifyBankAccount}
              disabled={
                isVerifying ||
                (accountType === "nigerian" &&
                  (!bankAccount.accountNumber ||
                    !bankAccount.bankCode ||
                    (bankAccount.accountNumber?.length || 0) !== 10)) ||
                (accountType === "international" &&
                  (!bankAccount.accountName || !bankAccount.country))
              }
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {accountType === "international"
                    ? "Confirm Details"
                    : "Verify Account"}
                </>
              )}
            </Button>

            <Button
              onClick={saveBankAccount}
              disabled={isSaving || !bankAccount.verified || !hasUnsavedChanges}
              variant="default"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Bank Account"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Request Payout */}
      {bankAccount.verified && balance.availableBalance > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Request Payout
            </CardTitle>
            <CardDescription>
              Withdraw your earnings to your bank account
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="payoutAmount">
                Amount (Available:{" "}
                {formatCurrency(balance.availableBalance, balance.currency)})
              </Label>
              <Input
                id="payoutAmount"
                type="number"
                placeholder="0.00"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min="0"
                max={balance.availableBalance / 100}
                step="0.01"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Payouts are processed within 1-3 business days. A small
                processing fee may apply.
              </AlertDescription>
            </Alert>

            <Button
              onClick={requestPayout}
              disabled={isRequestingPayout || !payoutAmount}
            >
              {isRequestingPayout ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Requesting...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Request Payout
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payout History */}
      {payoutRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payout History</CardTitle>
            <CardDescription>
              View your previous payout requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payoutRequests.map((payout) => (
                <div
                  key={payout.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">
                      {formatCurrency(payout.amount, payout.currency)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Requested: {formatDate(payout.requestedAt)}
                    </div>
                    {payout.processedAt && (
                      <div className="text-sm text-gray-600">
                        Processed: {formatDate(payout.processedAt)}
                      </div>
                    )}
                  </div>
                  <Badge
                    variant={
                      payout.status === "completed"
                        ? "default"
                        : payout.status === "failed"
                          ? "destructive"
                          : "secondary"
                    }
                  >
                    {payout.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}