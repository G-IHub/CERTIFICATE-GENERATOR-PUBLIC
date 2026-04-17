import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign, Package, CreditCard, ArrowDownToLine, FileText,
  RefreshCw, TrendingUp, Users, AlertCircle, CheckCircle,
  Clock, XCircle, Building2, ChevronRight,
  BarChart3, ShieldCheck, Banknote, Eye, Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  productApi, sellerApi, bankApi, adminMonetizationApi,
  formatKobo,
  type Product, type SellerProfile, type SellerBalance,
  type Transaction, type Payout, type Invoice, type NigerianBank,
} from "../utils/monetizationApi";

// ---------- Shared UI primitives ----------

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-4 border-b border-gray-100">{children}</div>
);
const CardTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`font-semibold text-gray-900 ${className}`}>{children}</h3>
);
const CardContent = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);

const Badge = ({ children, variant = "default" }: { children: React.ReactNode; variant?: string }) => {
  const colors: Record<string, string> = {
    default: "bg-gray-100 text-gray-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };
  return <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant] || colors.default}`}>{children}</span>;
};

const Btn = ({
  children, onClick, disabled = false, variant = "primary", size = "md", className = "",
}: {
  children: React.ReactNode; onClick?: () => void; disabled?: boolean;
  variant?: "primary" | "secondary" | "danger" | "ghost"; size?: "sm" | "md"; className?: string;
}) => {
  const base = "inline-flex items-center gap-2 font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1";
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm" };
  const variants = {
    primary: "bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-400 disabled:opacity-50",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400 disabled:opacity-50",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 disabled:opacity-50",
    ghost: "text-gray-600 hover:bg-gray-100 focus:ring-gray-400 disabled:opacity-50",
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
};

const Input = ({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <input {...props} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:bg-gray-50" />
  </div>
);

const Select = ({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <select {...props} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white">
      {children}
    </select>
  </div>
);

const Textarea = ({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <textarea {...props} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none" />
  </div>
);

const EmptyState = ({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <Icon className="w-12 h-12 text-gray-300 mb-3" />
    <p className="font-medium text-gray-500">{title}</p>
    <p className="text-sm text-gray-400 mt-1">{desc}</p>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; variant: string }> = {
    success: { label: "Success", variant: "success" },
    paid: { label: "Paid", variant: "success" },
    active: { label: "Active", variant: "success" },
    completed: { label: "Completed", variant: "success" },
    pending: { label: "Pending", variant: "warning" },
    processing: { label: "Processing", variant: "info" },
    draft: { label: "Draft", variant: "default" },
    failed: { label: "Failed", variant: "danger" },
    refunded: { label: "Refunded", variant: "danger" },
    archived: { label: "Archived", variant: "default" },
  };
  const s = map[status] || { label: status, variant: "default" };
  return <Badge variant={s.variant}>{s.label}</Badge>;
};

const StatCard = ({ icon: Icon, label, value, sub, color = "indigo" }: {
  icon: React.ElementType; label: string; value: string; sub?: string; color?: string;
}) => {
  const colors: Record<string, string> = {
    indigo: "bg-orange-50 text-orange-500",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    blue: "bg-blue-50 text-blue-600",
  };
  return (
    <Card>
      <CardContent className="flex items-start gap-4">
        <div className={`p-2.5 rounded-lg ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

// ---------- Tab definitions ----------

const SELLER_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "products", label: "Products", icon: Package },
  { id: "transactions", label: "Transactions", icon: CreditCard },
  { id: "payouts", label: "Payouts", icon: ArrowDownToLine },
  { id: "invoices", label: "Invoices", icon: FileText },
  { id: "settings", label: "Payout Account", icon: Banknote },
] as const;

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: BarChart3 },
  { id: "sellers_products", label: "Sellers & Products", icon: Users },
  { id: "transactions", label: "All Transactions", icon: CreditCard },
  { id: "payouts", label: "Payouts", icon: ArrowDownToLine },
  { id: "refunds", label: "Refunds", icon: RefreshCw },
  { id: "settings", label: "Settings", icon: ShieldCheck },
] as const;

// ==================== SELLER TABS ====================

// --- Overview ---
const SellerOverview = ({ token }: { token: string }) => {
  const [balance, setBalance] = useState<SellerBalance | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [recentTxns, setRecentTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sellerApi.getEarnings(token),
      productApi.list(token),
      sellerApi.getTransactions(token),
    ]).then(([e, p, t]) => {
      setBalance(e.balance);
      setProducts(p.products);
      setRecentTxns(t.transactions.slice(0, 5));
    }).catch(() => toast.error("Failed to load overview")).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="p-6 text-gray-400 text-sm">Loading...</div>;

  const b = balance || { totalEarned: 0, pendingHold: 0, availableBalance: 0, totalWithdrawn: 0 };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label="Total Earned" value={formatKobo(b.totalEarned)} color="green" />
        <StatCard icon={DollarSign} label="Available Balance" value={formatKobo(b.availableBalance)} color="indigo" sub="Ready to withdraw" />
        <StatCard icon={Clock} label="Pending (7-day hold)" value={formatKobo(b.pendingHold)} color="yellow" sub="Releases after 7 days" />
        <StatCard icon={ArrowDownToLine} label="Total Withdrawn" value={formatKobo(b.totalWithdrawn)} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Products ({products.length})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {products.length === 0
              ? <EmptyState icon={Package} title="No products yet" desc="Create your first product to start selling" />
              : products.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between px-6 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-500 capitalize">{p.type} • {formatKobo(p.priceNGN)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              ))
            }
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Sales</CardTitle></CardHeader>
          <CardContent className="p-0">
            {recentTxns.length === 0
              ? <EmptyState icon={CreditCard} title="No sales yet" desc="Share your products to start receiving payments" />
              : recentTxns.map(t => (
                <div key={t.reference} className="flex items-center justify-between px-6 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.buyerName}</p>
                    <p className="text-xs text-gray-500">{t.buyerEmail} • {new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">{formatKobo(t.sellerEarning)}</p>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
              ))
            }
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// --- Products (read-only — shows monetized certificates created from the certificate pages) ---
const SellerProducts = ({ token }: { token: string }) => {
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerApi.getCertificates(token)
      .then(r => setCerts(r.certificates))
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Your Products</h3>
        <p className="text-xs text-gray-400">To add a product, enable monetization when generating a certificate.</p>
      </div>

      {certs.length === 0 ? (
        <EmptyState icon={Package} title="No monetized certificates yet" desc="Enable monetization when generating a certificate to list it here as a product for sale." />
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {certs.map(cert => {
            const title = cert.courseName || cert.certificateHeader || "Certificate";
            const price = cert.certificatePriceMinor || 0;
            const currency = cert.certificateCurrency || "NGN";
            const isPaid = cert.paymentStatus === "paid";
            const date = cert.generatedAt || cert.createdAt;
            return (
              <Card key={cert.id}>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{title}</p>
                      <p className="text-sm text-gray-500">Certificate • {formatKobo(price, currency)}</p>
                      {date && <p className="text-xs text-gray-400 mt-0.5">Created: {new Date(date).toLocaleDateString()}</p>}
                      {cert.studentName && <p className="text-xs text-gray-400">Recipient: {cert.studentName}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={isPaid ? "success" : "warning"}>{isPaid ? "Sold" : "Unpaid"}</Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// --- Transactions ---
const SellerTransactions = ({ token }: { token: string }) => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerApi.getTransactions(token).then(r => setTxns(r.transactions)).catch(() => toast.error("Failed to load transactions")).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (txns.length === 0) return <EmptyState icon={CreditCard} title="No transactions yet" desc="Transactions will appear here once buyers purchase your products" />;

  return (
    <div className="space-y-3">
      {txns.map(t => (
        <Card key={t.reference}>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{t.buyerName}</p>
              <p className="text-sm text-gray-500">{t.buyerEmail}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(t.createdAt).toLocaleString()} • Ref: {t.reference}</p>
              {t.holdUntil && t.status === "success" && !t.released && (
                <p className="text-xs text-yellow-600 mt-0.5">Hold releases: {new Date(t.holdUntil).toLocaleDateString()}</p>
              )}
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold text-gray-900">{formatKobo(t.sellerEarning)}</p>
              <p className="text-xs text-gray-400">of {formatKobo(t.amountTotal)} total</p>
              <StatusBadge status={t.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Payouts ---
const SellerPayouts = ({ token }: { token: string }) => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [balance, setBalance] = useState<SellerBalance | null>(null);
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const load = useCallback(() => {
    Promise.all([sellerApi.getPayouts(token), sellerApi.getEarnings(token), sellerApi.getProfile(token)])
      .then(([p, e, pr]) => { setPayouts(p.payouts); setBalance(e.balance); setProfile(pr.profile); })
      .catch(() => toast.error("Failed to load payout data"))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const requestPayout = async () => {
    setRequesting(true);
    try { await sellerApi.requestPayout(token); toast.success("Payout requested! Admin will process it on the next Friday."); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setRequesting(false); }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  const available = balance?.availableBalance || 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Available for Withdrawal</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{formatKobo(available)}</p>
            {(balance?.pendingHold || 0) > 0 && (
              <p className="text-xs text-yellow-600 mt-1">{formatKobo(balance!.pendingHold)} pending (7-day hold)</p>
            )}
          </div>
          <Btn onClick={requestPayout} disabled={requesting || available <= 0}>
            <ArrowDownToLine className="w-4 h-4" />
            {requesting ? "Requesting..." : "Request Payout"}
          </Btn>
        </CardContent>
      </Card>

      {!profile?.paystackRecipientCode && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-yellow-800">Bank account required</p>
            <p className="text-sm text-yellow-700 mt-0.5">Go to the <strong>Payout Account</strong> tab to add your bank account before requesting a payout.</p>
          </div>
        </div>
      )}

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Payout History</h4>
        {payouts.length === 0 ? <EmptyState icon={ArrowDownToLine} title="No payouts yet" desc="Your payout history will appear here" />
          : payouts.map(p => (
            <Card key={p.id} className="mb-3">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{formatKobo(p.amount)}</p>
                  <p className="text-sm text-gray-500">Requested: {new Date(p.requestedAt).toLocaleDateString()}</p>
                  {p.processedAt && <p className="text-xs text-gray-400">Processed: {new Date(p.processedAt).toLocaleDateString()}</p>}
                  {p.failureReason && <p className="text-xs text-red-500 mt-0.5">{p.failureReason}</p>}
                </div>
                <StatusBadge status={p.status} />
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

// --- Invoices ---
const SellerInvoices = ({ token }: { token: string }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerApi.getInvoices(token).then(r => setInvoices(r.invoices)).catch(() => toast.error("Failed to load invoices")).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (invoices.length === 0) return <EmptyState icon={FileText} title="No invoices yet" desc="Invoices are auto-generated for every successful purchase" />;

  return (
    <div className="space-y-3">
      {invoices.map(inv => (
        <Card key={inv.id}>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">{inv.productTitle}</p>
              <p className="text-sm text-gray-500">{inv.buyerName} ({inv.buyerEmail})</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(inv.issuedAt).toLocaleString()} • {inv.id}</p>
            </div>
            <div className="text-right space-y-1">
              <p className="font-bold text-gray-900">{formatKobo(inv.amountTotal, inv.currency)}</p>
              <p className="text-xs text-gray-400">Your cut: {formatKobo(inv.sellerEarning, inv.currency)}</p>
              <StatusBadge status={inv.status} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

// --- Payout Account Settings ---
const SellerBankSettings = ({ token }: { token: string }) => {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [banks, setBanks] = useState<NigerianBank[]>([]);
  const [form, setForm] = useState({ bankAccountNumber: "", bankCode: "", displayName: "" });
  const [resolvedName, setResolvedName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([sellerApi.getProfile(token), bankApi.list(token)])
      .then(([p, b]) => { setProfile(p.profile); setBanks(b.banks); if (p.profile) { setForm({ bankAccountNumber: p.profile.bankAccountNumber, bankCode: p.profile.bankCode, displayName: p.profile.displayName }); } })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  const resolveAccount = async () => {
    if (!form.bankAccountNumber || !form.bankCode) return toast.error("Enter account number and select bank");
    setResolving(true); setResolvedName("");
    try { const r = await sellerApi.verifyBank(token, { bankAccountNumber: form.bankAccountNumber, bankCode: form.bankCode }); setResolvedName(r.accountName); }
    catch (e: any) { toast.error(e.message); }
    finally { setResolving(false); }
  };

  const save = async () => {
    if (!resolvedName) return toast.error("Please verify your bank account first");
    const bank = banks.find(b => b.code === form.bankCode);
    if (!bank) return toast.error("Select a valid bank");
    setSaving(true);
    try { const r = await sellerApi.onboard(token, { bankAccountNumber: form.bankAccountNumber, bankCode: form.bankCode, bankName: bank.name, displayName: form.displayName }); setProfile(r.profile); toast.success("Bank account saved!"); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-6 max-w-xl">
      {profile?.verified && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4 flex gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
          <div>
            <p className="font-medium text-green-800">Bank account verified</p>
            <p className="text-sm text-green-700">{profile.bankAccountName} • {profile.bankName}</p>
            <p className="text-xs text-green-600 mt-0.5">•••• {profile.bankAccountNumber.slice(-4)}</p>
          </div>
        </div>
      )}

      <Card>
        <CardHeader><CardTitle>Bank Account Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Display Name (for payouts)" value={form.displayName} onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))} placeholder="Your name or business name" />
          <Select label="Bank *" value={form.bankCode} onChange={e => { setForm(f => ({ ...f, bankCode: e.target.value })); setResolvedName(""); }}>
            <option value="">Select bank...</option>
            {banks.map((b, i) => <option key={`${b.code}-${i}`} value={b.code}>{b.name}</option>)}
          </Select>
          <div className="space-y-1">
            <Input label="Account Number *" value={form.bankAccountNumber} onChange={e => { setForm(f => ({ ...f, bankAccountNumber: e.target.value })); setResolvedName(""); }} placeholder="10-digit account number" maxLength={10} />
            {resolvedName && <p className="text-sm text-green-600 font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" />{resolvedName}</p>}
          </div>
          <div className="flex gap-2">
            <Btn variant="secondary" onClick={resolveAccount} disabled={resolving}>{resolving ? "Verifying..." : "Verify Account"}</Btn>
            <Btn onClick={save} disabled={saving || !resolvedName}>{saving ? "Saving..." : "Save Bank Account"}</Btn>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// ==================== ADMIN TABS ====================

// --- Admin Products ---
// --- Admin Sellers & Products (combined) ---
const AdminSellersAndProducts = ({ token }: { token: string }) => {
  const [sellers, setSellers] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSeller, setExpandedSeller] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      adminMonetizationApi.getSellers(token),
      adminMonetizationApi.getProducts(token),
    ])
      .then(([s, p]) => {
        setSellers(s.sellers || []);
        // getProducts returns certificate-level products
        setCerts(p.products || p.certificates || []);
      })
      .catch(() => toast.error("Failed to load sellers & products"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (sellers.length === 0) return (
    <EmptyState icon={Users} title="No sellers yet" desc="Sellers appear here once they have sold a certificate." />
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-lg font-semibold text-gray-900">Sellers & Products</h2>
        <span className="text-xs text-gray-400">{sellers.length} seller{sellers.length !== 1 ? "s" : ""} · {certs.length} product{certs.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Table header */}
      <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 rounded-lg">
        <div className="col-span-4">Seller</div>
        <div className="col-span-2 text-center">Sales</div>
        <div className="col-span-2 text-right">Earned</div>
        <div className="col-span-2 text-right">Available</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {sellers.map(s => {
        const name = s.displayName || s.orgName || s.email || s.userId;
        const sellerCerts = certs.filter((c: any) =>
          c.organizationId === s.sellerOrgId ||
          c.organizationId === s.userId ||
          c.sellerId === s.userId
        );
        const isExpanded = expandedSeller === s.userId;

        return (
          <div key={s.userId} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {/* Seller row */}
            <button
              onClick={() => setExpandedSeller(isExpanded ? null : s.userId)}
              className="w-full grid grid-cols-12 gap-2 px-4 py-3 text-left hover:bg-gray-50 transition-colors items-center"
            >
              <div className="col-span-4 flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500 shrink-0">
                  <Users className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate text-sm">{name}</p>
                  {s.email && <p className="text-xs text-gray-400 truncate">{s.email}</p>}
                </div>
              </div>
              <div className="col-span-2 text-center">
                <span className="text-sm font-medium text-gray-700">{s.transactionCount || 0}</span>
                <p className="text-xs text-gray-400">sales</p>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm font-semibold text-gray-900">{formatKobo(s.balance?.totalEarned || s.totalEarned || 0)}</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="text-sm text-gray-700">{formatKobo(s.balance?.availableBalance || 0)}</span>
              </div>
              <div className="col-span-2 text-right flex items-center justify-end gap-1">
                <Badge variant={s.verified ? "success" : "warning"}>{s.verified ? "Verified" : "Unverified"}</Badge>
                <ChevronRight className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
              </div>
            </button>

            {/* Expanded: products table */}
            {isExpanded && (
              <div className="border-t border-gray-100 bg-gray-50">
                {sellerCerts.length === 0 ? (
                  <p className="text-xs text-gray-400 px-6 py-4">No monetized certificates found for this seller.</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b border-gray-200">
                        <th className="text-left px-6 py-2 font-medium">Product / Certificate</th>
                        <th className="text-center px-4 py-2 font-medium">Status</th>
                        <th className="text-right px-6 py-2 font-medium">Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sellerCerts.map((c: any) => {
                        const title = c.name || c.courseName || c.certificateHeader || c.title || "Certificate";
                        const price = c.priceKobo || c.certificatePriceMinor || 0;
                        const currency = c.currency || c.certificateCurrency || "NGN";
                        const sold = c.paymentStatus === "paid" || c.isActive === false;
                        return (
                          <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                            <td className="px-6 py-3">
                              <p className="font-medium text-gray-800 truncate max-w-xs">{title}</p>
                              <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.id?.slice(0, 12)}…</p>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <Badge variant={sold ? "success" : "info"}>{sold ? "Sold" : "Available"}</Badge>
                            </td>
                            <td className="px-6 py-3 text-right font-semibold text-gray-900">
                              {formatKobo(price, currency)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Admin Overview ---
const AdminOverview = ({ token }: { token: string }) => {
  const [data, setData] = useState<any>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([adminMonetizationApi.getOverview(token), adminMonetizationApi.getTransactions(token)])
      .then(([o, t]) => { setData(o.overview); setTxns(t.transactions.slice(0, 5)); })
      .catch(() => toast.error("Failed to load admin overview"))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={DollarSign} label="Platform Fees Earned" value={formatKobo(data?.platformFees || 0)} color="green" />
        <StatCard icon={CreditCard} label="Total Transactions" value={String(data?.totalTransactions || 0)} color="indigo" />
        <StatCard icon={ArrowDownToLine} label="Pending Payouts" value={formatKobo(data?.pendingPayouts || 0)} color="yellow" />
      </div>

      <Card>
        <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
        <CardContent className="p-0">
          {txns.length === 0 ? <EmptyState icon={CreditCard} title="No transactions yet" desc="Transactions across all products will appear here" />
            : txns.map(t => (
              <div key={t.reference} className="flex items-center justify-between px-6 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.buyerName}</p>
                  <p className="text-xs text-gray-500">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatKobo(t.amountTotal)}</p>
                  <p className="text-xs text-green-600">+{formatKobo(t.platformFee)} fee</p>
                </div>
              </div>
            ))
          }
        </CardContent>
      </Card>
    </div>
  );
};

// --- Admin All Transactions ---
const AdminTransactions = ({ token }: { token: string }) => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    adminMonetizationApi.getTransactions(token).then(r => setTxns(r.transactions)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  const filtered = filter === "all" ? txns : txns.filter(t => t.status === filter);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {["all", "success", "pending", "failed", "refunded"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${filter === s ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>{s}</button>
        ))}
      </div>
      {filtered.length === 0 ? <EmptyState icon={CreditCard} title="No transactions" desc={`No ${filter} transactions found`} />
        : filtered.map(t => (
          <Card key={t.reference}>
            <CardContent className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">{t.buyerName} <span className="text-gray-400 font-normal">→</span> {t.productId}</p>
                <p className="text-sm text-gray-500">{t.buyerEmail}</p>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(t.createdAt).toLocaleString()} • {t.reference}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="font-bold text-gray-900">{formatKobo(t.amountTotal)}</p>
                <p className="text-xs text-green-600">Fee: {formatKobo(t.platformFee)}</p>
                <StatusBadge status={t.status} />
              </div>
            </CardContent>
          </Card>
        ))
      }
    </div>
  );
};

// --- Admin Sellers ---
// --- Admin Payouts ---
const AdminPayouts = ({ token }: { token: string }) => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    adminMonetizationApi.getPayouts(token).then(r => setPayouts(r.payouts)).catch(() => toast.error("Failed to load")).finally(() => setLoading(false));
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const process = async (id: string) => {
    setProcessing(id);
    try { await adminMonetizationApi.processPayout(token, id); toast.success("Payout processed!"); load(); }
    catch (e: any) { toast.error(e.message); }
    finally { setProcessing(null); }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  const pending = payouts.filter(p => p.status === "pending");
  const rest = payouts.filter(p => p.status !== "pending");

  return (
    <div className="space-y-6">
      {pending.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-yellow-500" /> Pending ({pending.length})</h4>
          {pending.map(p => (
            <Card key={p.id} className="mb-3 border-yellow-200">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-gray-900">{formatKobo(p.amount)}</p>
                  <p className="text-sm text-gray-500">Seller: {p.sellerId}</p>
                  <p className="text-xs text-gray-400">{new Date(p.requestedAt).toLocaleString()}</p>
                </div>
                <Btn size="sm" onClick={() => process(p.id)} disabled={processing === p.id}>
                  {processing === p.id ? "Processing..." : "Process Payout"}
                </Btn>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {rest.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-700 mb-3">History</h4>
          {rest.map(p => (
            <Card key={p.id} className="mb-3">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{formatKobo(p.amount)}</p>
                  <p className="text-xs text-gray-400">{new Date(p.requestedAt).toLocaleString()}</p>
                  {p.failureReason && <p className="text-xs text-red-500">{p.failureReason}</p>}
                </div>
                <StatusBadge status={p.status} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {payouts.length === 0 && <EmptyState icon={ArrowDownToLine} title="No payouts yet" desc="Payout requests from sellers will appear here" />}
    </div>
  );
};

// --- Admin Refunds ---
const AdminRefunds = ({ token }: { token: string }) => {
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [ref, setRef] = useState("");
  const [reason, setReason] = useState("");
  const [issuing, setIssuing] = useState(false);

  useEffect(() => {
    adminMonetizationApi.getTransactions(token)
      .then(r => setTxns(r.transactions.filter(t => t.status === "success" || t.status === "refunded")))
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, [token]);

  const issue = async () => {
    if (!ref) return toast.error("Enter a transaction reference");
    setIssuing(true);
    try { await adminMonetizationApi.issueRefund(token, ref, reason); toast.success("Refund issued!"); setRef(""); setReason(""); }
    catch (e: any) { toast.error(e.message); }
    finally { setIssuing(false); }
  };

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Issue Refund</CardTitle></CardHeader>
        <CardContent className="space-y-4 max-w-lg">
          <Input label="Transaction Reference *" value={ref} onChange={e => setRef(e.target.value)} placeholder="CTFY_..." />
          <Input label="Reason (optional)" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Buyer complaint" />
          <Btn variant="danger" onClick={issue} disabled={issuing || !ref}><RefreshCw className="w-4 h-4" />{issuing ? "Processing..." : "Issue Refund"}</Btn>
        </CardContent>
      </Card>

      <div>
        <h4 className="font-medium text-gray-700 mb-3">Refundable Transactions</h4>
        {txns.length === 0 ? <EmptyState icon={RefreshCw} title="No transactions" desc="Successful transactions eligible for refund will appear here" />
          : txns.map(t => (
            <Card key={t.reference} className="mb-3">
              <CardContent className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{t.buyerName}</p>
                  <p className="text-sm text-gray-500 font-mono text-xs">{t.reference}</p>
                  <p className="text-xs text-gray-400">{new Date(t.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right space-y-1">
                  <p className="font-bold">{formatKobo(t.amountTotal)}</p>
                  <StatusBadge status={t.status} />
                  {t.status === "success" && (
                    <button onClick={() => setRef(t.reference)} className="text-xs text-orange-500 hover:underline block">Use reference</button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        }
      </div>
    </div>
  );
};

// --- Admin Settings ---
const AdminSettings = ({ token }: { token: string }) => {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminMonetizationApi.getSettings(token).then(r => setSettings(r.settings)).catch(() => toast.error("Failed to load settings")).finally(() => setLoading(false));
  }, [token]);

  const save = async () => {
    setSaving(true);
    try { await adminMonetizationApi.updateSettings(token, settings); toast.success("Settings saved"); }
    catch (e: any) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (loading || !settings) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="space-y-6 max-w-lg">
      <Card>
        <CardHeader><CardTitle>Platform Fee</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input label="Platform Fee (%)" type="number" min="0" max="100" value={settings.platformFeePercent} onChange={e => setSettings((s: any) => ({ ...s, platformFeePercent: Number(e.target.value) }))} />
          <p className="text-xs text-gray-500">Currently: Certifyer takes {settings.platformFeePercent}% of every transaction. Sellers receive {100 - settings.platformFeePercent}%.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payout Schedule</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Select label="Schedule" value={settings.payoutSchedule} onChange={e => setSettings((s: any) => ({ ...s, payoutSchedule: e.target.value }))}>
            <option value="weekly_friday">Weekly (Every Friday)</option>
            <option value="weekly_monday">Weekly (Every Monday)</option>
            <option value="biweekly">Bi-weekly</option>
            <option value="monthly">Monthly</option>
          </Select>
          <p className="text-xs text-gray-500">Sellers request payouts manually. Admin processes them on the scheduled day.</p>
        </CardContent>
      </Card>

      <Btn onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Settings"}</Btn>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

interface MonetizationPageProps {
  organizationId?: string;
  accessToken: string;
  isAdmin?: boolean;
  adminOnly?: boolean;
  userId?: string;
}

export default function MonetizationPage({ organizationId, accessToken, isAdmin = false, adminOnly = false }: MonetizationPageProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [view, setView] = useState<"seller" | "admin">(isAdmin ? "admin" : "seller");

  const tabs = view === "admin" ? ADMIN_TABS : SELLER_TABS;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Page header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              Monetization
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {view === "admin" ? "Platform-wide earnings, payouts, and seller management" : "Sell certificates, courses, and PDFs — receive payouts to your bank account"}
            </p>
          </div>
          {isAdmin && !adminOnly && (
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button onClick={() => { setView("seller"); setActiveTab("overview"); }} className={`px-4 py-2 text-sm font-medium transition-colors ${view === "seller" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>My Account</button>
              <button onClick={() => { setView("admin"); setActiveTab("overview"); }} className={`px-4 py-2 text-sm font-medium transition-colors ${view === "admin" ? "bg-orange-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>Admin</button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-6 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${activeTab === tab.id ? "bg-orange-500 text-white shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div>
          {view === "seller" && (
            <>
              {activeTab === "overview" && <SellerOverview token={accessToken} />}
              {activeTab === "products" && <SellerProducts token={accessToken} />}
              {activeTab === "transactions" && <SellerTransactions token={accessToken} />}
              {activeTab === "payouts" && <SellerPayouts token={accessToken} />}
              {activeTab === "invoices" && <SellerInvoices token={accessToken} />}
              {activeTab === "settings" && <SellerBankSettings token={accessToken} />}
            </>
          )}
          {view === "admin" && (
            <>
              {activeTab === "overview" && <AdminOverview token={accessToken} />}
              {activeTab === "sellers_products" && <AdminSellersAndProducts token={accessToken} />}
              {activeTab === "transactions" && <AdminTransactions token={accessToken} />}
              {activeTab === "payouts" && <AdminPayouts token={accessToken} />}
              {activeTab === "refunds" && <AdminRefunds token={accessToken} />}
              {activeTab === "settings" && <AdminSettings token={accessToken} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
