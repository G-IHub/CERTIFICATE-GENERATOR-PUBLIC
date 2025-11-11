import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { 
  Settings, 
  DollarSign, 
  Check, 
  X, 
  Eye, 
  EyeOff,
  AlertCircle,
  CreditCard,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { publicAnonKey, projectId } from '../utils/supabase/info';

interface BillingSettingsProps {
  accessToken: string | null;
}

interface Plan {
  name: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
}

interface BillingConfig {
  configured: boolean;
  paystackPublicKey?: string;
  paystackSecretKeyPreview?: string;
  plans?: Record<string, Plan>;
  updatedAt?: string;
}

export default function BillingSettings({ accessToken }: BillingSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [config, setConfig] = useState<BillingConfig | null>(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  // Form state
  const [paystackSecretKey, setPaystackSecretKey] = useState('');
  const [paystackPublicKey, setPaystackPublicKey] = useState('');
  
  // Plan pricing
  const [monthlyPrice, setMonthlyPrice] = useState('1000');
  const [yearlyPrice, setYearlyPrice] = useState('10000');
  const [currency, setCurrency] = useState('USD');

  // Helper function to format currency display
  const formatCurrency = (amount: string, currencyCode: string) => {
    const numAmount = parseInt(amount) || 0;
    const value = (numAmount / 100).toFixed(2);
    const currencySymbols: Record<string, string> = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'NGN': '₦',
      'GHS': '₵',
    };
    const symbol = currencySymbols[currencyCode.toUpperCase()] || currencyCode;
    return `${symbol}${value}`;
  };

  useEffect(() => {
    loadBillingSettings();
  }, []);

  const loadBillingSettings = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/billing/settings`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load billing settings');
      }

      const data = await response.json();
      setConfig(data);

      if (data.configured) {
        setPaystackPublicKey(data.paystackPublicKey || '');
        if (data.plans) {
          setMonthlyPrice(data.plans.premium_monthly?.price?.toString() || '1000');
          setYearlyPrice(data.plans.premium_yearly?.price?.toString() || '10000');
          setCurrency(data.plans.premium_monthly?.currency || 'USD');
        }
      }
    } catch (error: any) {
      console.error('Error loading billing settings:', error);
      toast.error('Failed to load billing settings');
      setConfig({ configured: false });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!paystackSecretKey && !config?.configured) {
      toast.error('Please enter Paystack Secret Key');
      return;
    }

    if (!paystackPublicKey) {
      toast.error('Please enter Paystack Public Key');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/billing/settings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paystackSecretKey: paystackSecretKey || undefined,
            paystackPublicKey,
            plans: {
              premium_monthly: {
                name: 'Premium Monthly',
                price: parseInt(monthlyPrice),
                currency,
                duration: 30,
                features: [
                  'Custom Templates',
                  'Template Builder',
                  'Unlimited Certificates',
                  'Priority Support'
                ]
              },
              premium_yearly: {
                name: 'Premium Yearly',
                price: parseInt(yearlyPrice),
                currency,
                duration: 365,
                features: [
                  'Custom Templates',
                  'Template Builder',
                  'Unlimited Certificates',
                  'Priority Support',
                  '2 Months Free'
                ]
              }
            }
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save settings');
      }

      toast.success('Billing settings saved successfully!');
      await loadBillingSettings();
      setPaystackSecretKey(''); // Clear sensitive data after save
    } catch (error: any) {
      console.error('Error saving billing settings:', error);
      toast.error(error.message || 'Failed to save billing settings');
    } finally {
      setSaving(false);
    }
  };

  const handleMigrateToNGN = async () => {
    if (!window.confirm('This will update all plans to use NGN currency. Continue?')) {
      return;
    }

    setMigrating(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/billing/migrate-to-ngn`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Migration failed');
      }

      const data = await response.json();
      toast.success('Plans successfully migrated to NGN!');
      await loadBillingSettings();
    } catch (error: any) {
      console.error('Migration error:', error);
      toast.error(error.message || 'Failed to migrate plans');
    } finally {
      setMigrating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Loading billing settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Card */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Billing System Status</CardTitle>
              <CardDescription className="text-xs">Paystack payment integration</CardDescription>
            </div>
            {config?.configured ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Check className="w-3 h-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        {config?.configured && config.updatedAt && (
          <CardContent className="pt-0">
            <p className="text-xs text-gray-500">
              Last updated: {new Date(config.updatedAt).toLocaleString()}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Configuration Alert */}
      {!config?.configured && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Configure your Paystack API keys to enable premium billing for organizations.
            Get your API keys from your{' '}
            <a 
              href="https://dashboard.paystack.com/#/settings/developer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Paystack Dashboard
            </a>.
          </AlertDescription>
        </Alert>
      )}

      {/* API Keys Configuration */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Paystack API Keys
          </CardTitle>
          <CardDescription className="text-xs">
            Configure your Paystack API credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="secretKey" className="text-sm">Secret Key</Label>
            <div className="relative">
              <Input
                id="secretKey"
                type={showSecretKey ? 'text' : 'password'}
                value={paystackSecretKey}
                onChange={(e) => setPaystackSecretKey(e.target.value)}
                placeholder={config?.configured ? 'Enter new key to update' : 'sk_test_...'}
                className="pr-10 text-sm h-9"
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {config?.configured && config.paystackSecretKeyPreview && (
              <p className="text-xs text-gray-500">
                Current: {config.paystackSecretKeyPreview}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="publicKey" className="text-sm">Public Key</Label>
            <Input
              id="publicKey"
              type="text"
              value={paystackPublicKey}
              onChange={(e) => setPaystackPublicKey(e.target.value)}
              placeholder="pk_test_..."
              className="text-sm h-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing Configuration */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Pricing Plans
          </CardTitle>
          <CardDescription className="text-xs">
            Set your premium subscription pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm">Currency</Label>
              <Input
                id="currency"
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
                maxLength={3}
                className="text-sm h-9"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyPrice" className="text-sm">Monthly Price</Label>
              <Input
                id="monthlyPrice"
                type="number"
                value={monthlyPrice}
                onChange={(e) => setMonthlyPrice(e.target.value)}
                placeholder="1000"
                className="text-sm h-9"
              />
              <p className="text-xs text-gray-500">In cents (1000 = $10.00)</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="yearlyPrice" className="text-sm">Yearly Price</Label>
              <Input
                id="yearlyPrice"
                type="number"
                value={yearlyPrice}
                onChange={(e) => setYearlyPrice(e.target.value)}
                placeholder="10000"
                className="text-sm h-9"
              />
              <p className="text-xs text-gray-500">In cents (10000 = $100.00)</p>
            </div>
          </div>

          <Separator />

          {/* Plan Preview */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Premium Monthly</h4>
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
              </div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(monthlyPrice, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per month</p>
              <ul className="mt-3 space-y-1">
                <li className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  Custom Templates
                </li>
                <li className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  Template Builder
                </li>
                <li className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  Unlimited Certificates
                </li>
              </ul>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium">Premium Yearly</h4>
                <Badge variant="secondary" className="text-xs">Best Value</Badge>
              </div>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(yearlyPrice, currency)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per year</p>
              <ul className="mt-3 space-y-1">
                <li className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  All Monthly Features
                </li>
                <li className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  2 Months Free
                </li>
                <li className="text-xs text-gray-600 flex items-start gap-1">
                  <Check className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  Priority Support
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={loadBillingSettings}
          disabled={saving}
          size="sm"
        >
          Reset
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            <>
              <Settings className="w-3.5 h-3.5 mr-2" />
              Save Settings
            </>
          )}
        </Button>
        <Button
          onClick={handleMigrateToNGN}
          disabled={migrating}
          size="sm"
        >
          {migrating ? (
            <>
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white mr-2"></div>
              Migrating...
            </>
          ) : (
            <>
              <CreditCard className="w-3.5 h-3.5 mr-2" />
              Migrate to NGN
            </>
          )}
        </Button>
      </div>
    </div>
  );
}