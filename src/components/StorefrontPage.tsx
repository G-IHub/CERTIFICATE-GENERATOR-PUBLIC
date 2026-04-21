import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { ShoppingBag, FileText, Video, Package, ExternalLink, AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

interface Product {
  id: string;
  orgId: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  type: "pdf" | "video" | "bundle";
  priceNGN: number;
  priceUSD: number;
  status: "draft" | "published";
}

interface OrgInfo {
  id: string;
  name: string;
  logo?: string;
  primaryColor?: string;
}

interface BuyModalState {
  product: Product;
  buyerName: string;
  buyerEmail: string;
  currency: "NGN" | "USD";
}

const TYPE_META = {
  pdf: { label: "PDF / File", icon: FileText, color: "#2563eb" },
  video: { label: "Video Course", icon: Video, color: "#7c3aed" },
  bundle: { label: "Bundle Package", icon: Package, color: "#ea580c" },
};

function nairaDisplay(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}
function dollarDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function StorefrontPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment modal state
  const [buyModal, setBuyModal] = useState<BuyModalState | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!orgId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/store/${orgId}/products`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Store not found");
        }
        const data = await res.json();
        setOrg(data.org);
        setProducts(data.products || []);
      } catch (e: any) {
        setError(e.message || "Could not load store");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orgId]);

  const openBuyModal = (product: Product) => {
    setBuyModal({ product, buyerName: "", buyerEmail: "", currency: product.priceNGN > 0 ? "NGN" : "USD" });
    setPayError("");
  };

  const handlePay = async () => {
    if (!buyModal || !orgId) return;
    const { product, buyerName, buyerEmail, currency } = buyModal;
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setPayError("Name and email are required");
      return;
    }

    setPaying(true);
    setPayError("");
    try {
      const res = await fetch(`${API_BASE}/digital-products/${product.id}/purchase/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
        body: JSON.stringify({ orgId, buyerEmail, buyerName, currency }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Payment initialization failed");
      }
      const data = await res.json();
      window.location.href = data.authorizationUrl;
    } catch (e: any) {
      setPayError(e.message || "Payment failed");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading store…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Store not found</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const primaryColor = org?.primaryColor || "#4f46e5";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store header */}
      <div style={{ background: primaryColor }} className="text-white py-10 px-4">
        <div className="max-w-5xl mx-auto flex flex-col items-center text-center gap-3">
          {org?.logo && (
            <img
              src={org.logo}
              alt={org?.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white/50"
            />
          )}
          <h1 className="text-3xl font-bold">{org?.name}</h1>
          <p className="text-white/80 text-sm">Digital Products Store</p>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        {products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No products available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => {
              const meta = TYPE_META[p.type];
              const Icon = meta.icon;
              return (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                >
                  {p.thumbnailUrl ? (
                    <div className="h-40 overflow-hidden">
                      <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div
                      className="h-40 flex items-center justify-center"
                      style={{ background: `${meta.color}15` }}
                    >
                      <Icon className="w-12 h-12 opacity-40" style={{ color: meta.color }} />
                    </div>
                  )}

                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: `${meta.color}18`, color: meta.color }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {p.description && (
                      <p className="text-sm text-gray-500 line-clamp-2">{p.description}</p>
                    )}

                    <div className="flex gap-3 text-sm font-semibold text-gray-800">
                      {p.priceNGN > 0 && <span>{nairaDisplay(p.priceNGN)}</span>}
                      {p.priceUSD > 0 && <span>{dollarDisplay(p.priceUSD)}</span>}
                      {!p.priceNGN && !p.priceUSD && <span className="text-gray-400">Free</span>}
                    </div>

                    <button
                      onClick={() => openBuyModal(p)}
                      className="mt-auto w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90"
                      style={{ background: primaryColor }}
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Buy modal */}
      {buyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{buyModal.product.title}</h2>
            <p className="text-sm text-gray-500 mb-4">Enter your details to complete the purchase</p>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={buyModal.buyerName}
                  onChange={(e) => setBuyModal({ ...buyModal, buyerName: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  value={buyModal.buyerEmail}
                  onChange={(e) => setBuyModal({ ...buyModal, buyerEmail: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Currency selector */}
              {buyModal.product.priceNGN > 0 && buyModal.product.priceUSD > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Pay in</label>
                  <div className="flex gap-2">
                    {(["NGN", "USD"] as const).map((cur) => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setBuyModal({ ...buyModal, currency: cur })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                          buyModal.currency === cur
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 text-gray-500"
                        }`}
                      >
                        {cur === "NGN"
                          ? nairaDisplay(buyModal.product.priceNGN)
                          : dollarDisplay(buyModal.product.priceUSD)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {payError && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {payError}
                </p>
              )}

              <div className="text-xs text-gray-400 mt-1">
                You will be redirected to Paystack to complete payment.
                Save your email — you'll need it to access your purchase.
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setBuyModal(null)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handlePay}
                disabled={paying}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity hover:opacity-90"
                style={{ background: primaryColor }}
              >
                {paying ? "Redirecting…" : "Proceed to Pay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
