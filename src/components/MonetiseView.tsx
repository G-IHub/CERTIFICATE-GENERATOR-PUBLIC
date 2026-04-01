import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { CreditCard, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { certificateApi, organizationApi } from "../utils/api";

interface MonetiseViewProps {
  organizationId: string;
  accessToken: string;
}

interface CertMonetizationDraft {
  id: string;
  courseName: string;
  monetizationEnabled: boolean;
  amountMinor: number;
  currency: string;
  platformFeePercent: number;
  paymentStatus: string;
}

export default function MonetiseView({
  organizationId,
  accessToken,
}: MonetiseViewProps) {
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [certificates, setCertificates] = useState<CertMonetizationDraft[]>([]);
  const [payoutAccountId, setPayoutAccountId] = useState("");
  const [savingPayout, setSavingPayout] = useState(false);

  const monetizedCount = useMemo(
    () => certificates.filter((cert) => cert.monetizationEnabled).length,
    [certificates],
  );

  const loadCertificates = async () => {
    try {
      setLoading(true);
      const response = await certificateApi.getForOrganization(
        accessToken,
        organizationId,
      );
      const mapped = (response.certificates || []).map((cert: any) => ({
        id: cert.id,
        courseName:
          cert.courseName || cert.certificateHeader || "Untitled Certificate",
        monetizationEnabled: !!cert.monetizationEnabled,
        amountMinor: Number(cert.certificatePriceMinor || 0),
        currency: cert.certificateCurrency || "NGN",
        platformFeePercent:
          cert.platformFeePercent !== undefined
            ? Number(cert.platformFeePercent)
            : 15,
        paymentStatus: cert.paymentStatus || "unpaid",
      }));
      setCertificates(mapped);
    } catch (error) {
      console.error("Failed to load certificates for monetization:", error);
      toast.error("Failed to load certificates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCertificates();
  }, [organizationId]);

  useEffect(() => {
    const loadMonetizationSettings = async () => {
      try {
        const response = await organizationApi.getSettings(
          accessToken,
          organizationId,
        );
        const storedPayout =
          response?.settings?.monetization?.payoutAccountId || "";
        setPayoutAccountId(storedPayout);
      } catch (error) {
        console.error("Failed to load monetization settings:", error);
      }
    };

    loadMonetizationSettings();
  }, [accessToken, organizationId]);

  const savePayoutSettings = async () => {
    try {
      if (!payoutAccountId.trim()) {
        toast.error("Payout account ID is required");
        return;
      }

      setSavingPayout(true);
      const response = await organizationApi.getSettings(
        accessToken,
        organizationId,
      );
      const currentSettings = response?.settings || {};

      await organizationApi.updateSettings(accessToken, organizationId, {
        ...currentSettings,
        monetization: {
          ...(currentSettings.monetization || {}),
          payoutAccountId: payoutAccountId.trim(),
          paymentProvider: "interswitch",
        },
      });

      toast.success("Payout settings saved");
    } catch (error: any) {
      console.error("Failed to save payout settings:", error);
      toast.error(error.message || "Failed to save payout settings");
    } finally {
      setSavingPayout(false);
    }
  };

  const updateDraft = (id: string, updates: Partial<CertMonetizationDraft>) => {
    setCertificates((prev) =>
      prev.map((cert) => (cert.id === id ? { ...cert, ...updates } : cert)),
    );
  };

  const saveMonetization = async (cert: CertMonetizationDraft) => {
    try {
      if (cert.monetizationEnabled && cert.amountMinor <= 0) {
        toast.error("Amount must be greater than zero");
        return;
      }

      if (cert.platformFeePercent < 0 || cert.platformFeePercent > 100) {
        toast.error("Platform fee must be between 0 and 100");
        return;
      }

      setSavingId(cert.id);
      await certificateApi.updateMonetization(accessToken, cert.id, {
        monetizationEnabled: cert.monetizationEnabled,
        certificatePriceMinor: cert.amountMinor,
        certificateCurrency: cert.currency,
        platformFeePercent: cert.platformFeePercent,
      });

      toast.success("Monetization settings saved");
      await loadCertificates();
    } catch (error: any) {
      console.error("Failed to save monetization:", error);
      toast.error(error.message || "Failed to save monetization settings");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-gray-600">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading monetization settings...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Monetise Certificates
          </CardTitle>
          <CardDescription>
            Enable payment for selected certificates. Students pay before
            access, and split settlement is handled by your payment provider.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-gray-100 text-gray-700">
              Total certificates: {certificates.length}
            </Badge>
            <Badge className="bg-primary/10 text-primary">
              Monetized: {monetizedCount}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payout Account</CardTitle>
          <CardDescription>
            Set the organization payout account used for immediate tutor
            settlement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="payout-account-id">
              Interswitch Payout Account ID
            </Label>
            <Input
              id="payout-account-id"
              value={payoutAccountId}
              onChange={(e) => setPayoutAccountId(e.target.value)}
              placeholder="Enter payout account ID"
            />
          </div>
          <div className="flex justify-end">
            <Button onClick={savePayoutSettings} disabled={savingPayout}>
              {savingPayout ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Payout Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {certificates.length === 0 && (
        <Alert>
          <AlertDescription>
            No certificates found yet. Generate certificates first, then
            configure monetization here.
          </AlertDescription>
        </Alert>
      )}

      {certificates.map((cert) => {
        const amountMajor = cert.amountMinor > 0 ? cert.amountMinor / 100 : 0;
        const tutorPercent = Math.max(0, 100 - cert.platformFeePercent);

        return (
          <Card key={cert.id}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {cert.courseName}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Certificate ID: {cert.id}
                  </p>
                </div>
                <Badge
                  className={
                    cert.paymentStatus === "paid"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-700"
                  }
                >
                  {cert.paymentStatus === "paid" ? "Paid" : "Unpaid"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label htmlFor={`monetized-${cert.id}`} className="font-medium">
                  Require payment before certificate access
                </Label>
                <Switch
                  id={`monetized-${cert.id}`}
                  checked={cert.monetizationEnabled}
                  onCheckedChange={(checked: boolean) =>
                    updateDraft(cert.id, {
                      monetizationEnabled: checked,
                      paymentStatus: checked ? cert.paymentStatus : "unpaid",
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor={`amount-${cert.id}`}>
                    Price ({cert.currency})
                  </Label>
                  <Input
                    id={`amount-${cert.id}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={amountMajor}
                    onChange={(e) => {
                      const major = Number(e.target.value || 0);
                      updateDraft(cert.id, {
                        amountMinor: Math.round(major * 100),
                      });
                    }}
                    disabled={!cert.monetizationEnabled}
                  />
                </div>

                <div>
                  <Label htmlFor={`currency-${cert.id}`}>Currency</Label>
                  <Input
                    id={`currency-${cert.id}`}
                    value={cert.currency}
                    onChange={(e) =>
                      updateDraft(cert.id, {
                        currency: e.target.value.toUpperCase() || "NGN",
                      })
                    }
                    disabled={!cert.monetizationEnabled}
                  />
                </div>

                <div>
                  <Label htmlFor={`platform-fee-${cert.id}`}>
                    Platform fee %
                  </Label>
                  <Input
                    id={`platform-fee-${cert.id}`}
                    type="number"
                    min="0"
                    max="100"
                    value={cert.platformFeePercent}
                    onChange={(e) =>
                      updateDraft(cert.id, {
                        platformFeePercent: Number(e.target.value || 0),
                      })
                    }
                    disabled={!cert.monetizationEnabled}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Tutor share: {tutorPercent}%
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => saveMonetization(cert)}
                  disabled={savingId === cert.id}
                >
                  {savingId === cert.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
