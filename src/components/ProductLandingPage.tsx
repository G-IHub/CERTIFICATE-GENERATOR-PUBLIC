import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { FileText, Video, Package, AlertCircle, Lock, ArrowLeft } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

interface ProductFile {
  name: string;
  storagePath: string;
  size: number;
}

interface ProductLink {
  label: string;
  url: string;
  encrypted: boolean;
}

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
  files: ProductFile[];
  links: ProductLink[];
  certificateTemplateId?: string;
}

interface OrgInfo {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  primaryColor?: string;
}

const TYPE_META: Record<string, { label: string; color: string; gradientFrom: string; gradientTo: string }> = {
  pdf: { label: "PDF / File", color: "#2563eb", gradientFrom: "#dbeafe", gradientTo: "#bfdbfe" },
  video: { label: "Video Course", color: "#7c3aed", gradientFrom: "#ede9fe", gradientTo: "#ddd6fe" },
  bundle: { label: "Bundle Package", color: "#ea580c", gradientFrom: "#ffedd5", gradientTo: "#fed7aa" },
};

const TYPE_ICONS: Record<string, React.ElementType> = {
  pdf: FileText,
  video: Video,
  bundle: Package,
};

function nairaDisplay(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}
function dollarDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button
      onClick={handleCopy}
      style={{
        padding: "6px 14px",
        borderRadius: 8,
        background: copied ? "#d1fae5" : "#f3f4f6",
        color: copied ? "#065f46" : "#374151",
        border: "none",
        cursor: "pointer",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap" as const,
        flexShrink: 0,
      }}
    >
      {copied ? "Copied!" : "Copy Link"}
    </button>
  );
}

export default function ProductLandingPage() {
  const { orgId, productId } = useParams<{ orgId: string; productId: string }>();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Purchase form state
  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");

  useEffect(() => {
    if (!orgId || !productId) return;
    const load = async () => {
      setLoading(true);
      try {
        // Load product details
        const res = await fetch(`${API_BASE}/store/${orgId}/products/${productId}`, {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        });
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Product not found");
        }
        const data = await res.json();
        setProduct(data.product);
        setOrg(data.org);
        // Set default currency
        if (data.product?.priceNGN > 0) setCurrency("NGN");
        else if (data.product?.priceUSD > 0) setCurrency("USD");
      } catch (e: any) {
        setError(e.message || "Could not load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orgId, productId]);

  const handlePay = async () => {
    if (!product || !orgId) return;
    if (!buyerName.trim() || !buyerEmail.trim()) {
      setPayError("Name and email are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(buyerEmail)) {
      setPayError("Please enter a valid email address");
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
          <p className="text-gray-500">Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Product not found</h2>
          <p className="text-gray-500">{error}</p>
          <a href={`/#/store/${orgId}`} style={{ display: "inline-block", marginTop: 16, color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
            ← Back to Store
          </a>
        </div>
      </div>
    );
  }

  const primaryColor = org?.primaryColor || "#4f46e5";
  const meta = TYPE_META[product.type] || TYPE_META.bundle;
  const Icon = TYPE_ICONS[product.type] || Package;
  const fileCount = product.files?.length || 0;
  const linkCount = product.links?.length || 0;
  const hasCert = !!product.certificateTemplateId;
  const hasBothPrices = product.priceNGN > 0 && product.priceUSD > 0;
  const productUrl = `https://certifyer.online/#/store/${orgId}/${productId}`;

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Top Navbar */}
      <nav style={{ background: "white", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {org?.logo ? (
              <img
                src={org.logo}
                alt={org.name}
                style={{ width: 36, height: 36, borderRadius: "50%", objectFit: "cover", border: "2px solid #e5e7eb" }}
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: primaryColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "white", fontWeight: 700, fontSize: 14 }}>{org?.name?.[0] || "?"}</span>
              </div>
            )}
            <span style={{ fontWeight: 600, fontSize: 15, color: "#111827" }}>{org?.name}</span>
          </div>
          <span style={{ fontSize: 12, color: "#9ca3af" }}>Powered by <span style={{ color: primaryColor, fontWeight: 600 }}>Certifyer</span></span>
        </div>
      </nav>

      {/* Back link */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 20px 0" }}>
        <a
          href={`/#/store/${orgId}`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 13, textDecoration: "none", fontWeight: 500 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = primaryColor)}
          onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.color = "#6b7280")}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} />
          Back to {org?.name || "Store"} Store
        </a>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 60px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 32 }} className="lg:grid-cols-product">
          {/* Two-column layout */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }} className="product-layout">
            {/* We'll use CSS media queries approach via inline-style grid */}
          </div>
        </div>

        {/* Responsive two-column */}
        <div style={{ display: "grid", gap: 32, gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", alignItems: "start" }}>
          {/* Left column (60%) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Product image */}
            <div style={{ borderRadius: 16, overflow: "hidden", height: 300 }}>
              {product.thumbnailUrl ? (
                <img src={product.thumbnailUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${meta.gradientFrom} 0%, ${meta.gradientTo} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon style={{ width: 72, height: 72, color: meta.color, opacity: 0.4 }} />
                </div>
              )}
            </div>

            {/* What You Get card */}
            {(fileCount > 0 || linkCount > 0 || hasCert) && (
              <div style={{ background: "white", borderRadius: 16, padding: "24px 28px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6" }}>
                <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827", marginBottom: 18, marginTop: 0 }}>What You Get</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {fileCount === 1 && product.files.map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>📄</span>
                      <span style={{ fontSize: 14, color: "#374151" }}>{f.name}</span>
                    </div>
                  ))}
                  {fileCount > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>📄</span>
                      <span style={{ fontSize: 14, color: "#374151" }}>{fileCount} downloadable files</span>
                    </div>
                  )}
                  {linkCount === 1 && product.links.filter(l => l.label).map((l, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>🔗</span>
                      <span style={{ fontSize: 14, color: "#374151" }}>{l.label}</span>
                    </div>
                  ))}
                  {linkCount > 1 && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>🔗</span>
                      <span style={{ fontSize: 14, color: "#374151" }}>{linkCount} video/course links</span>
                    </div>
                  )}
                  {hasCert && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18 }}>🏆</span>
                      <span style={{ fontSize: 14, color: "#374151" }}>Certificate of Completion included</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column (40%) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Product info */}
            <div style={{ background: "white", borderRadius: 16, padding: "28px 28px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6" }}>
              {/* Type badge */}
              <span style={{ display: "inline-block", background: meta.color, color: "white", fontSize: 11, fontWeight: 700, padding: "3px 12px", borderRadius: 100, marginBottom: 14, letterSpacing: "0.04em" }}>
                {meta.label}
              </span>

              <h1 style={{ fontWeight: 800, fontSize: 24, color: "#111827", marginBottom: 12, marginTop: 0, lineHeight: 1.3 }}>{product.title}</h1>

              {product.description && (
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, marginBottom: 20, marginTop: 0 }}>{product.description}</p>
              )}

              {/* Price display */}
              <div style={{ marginBottom: 20 }}>
                {hasBothPrices ? (
                  <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                    <button
                      onClick={() => setCurrency("NGN")}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${currency === "NGN" ? primaryColor : "#e5e7eb"}`,
                        background: currency === "NGN" ? `${primaryColor}10` : "white", color: currency === "NGN" ? primaryColor : "#6b7280",
                        fontWeight: 700, fontSize: 14, cursor: "pointer",
                      }}
                    >
                      Pay in Naira {nairaDisplay(product.priceNGN)}
                    </button>
                    <button
                      onClick={() => setCurrency("USD")}
                      style={{
                        flex: 1, padding: "10px 0", borderRadius: 10, border: `2px solid ${currency === "USD" ? primaryColor : "#e5e7eb"}`,
                        background: currency === "USD" ? `${primaryColor}10` : "white", color: currency === "USD" ? primaryColor : "#6b7280",
                        fontWeight: 700, fontSize: 14, cursor: "pointer",
                      }}
                    >
                      Pay in Dollars {dollarDisplay(product.priceUSD)}
                    </button>
                  </div>
                ) : (
                  <div style={{ marginBottom: 16 }}>
                    {product.priceNGN > 0 && (
                      <p style={{ fontWeight: 800, fontSize: 28, color: "#111827", margin: 0 }}>{nairaDisplay(product.priceNGN)}</p>
                    )}
                    {product.priceUSD > 0 && (
                      <p style={{ fontWeight: 800, fontSize: 28, color: "#111827", margin: 0 }}>{dollarDisplay(product.priceUSD)}</p>
                    )}
                    {!product.priceNGN && !product.priceUSD && (
                      <p style={{ fontWeight: 700, fontSize: 22, color: "#9ca3af", margin: 0 }}>Free</p>
                    )}
                  </div>
                )}
              </div>

              {/* Buy form */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Full Name</label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your full name"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Email Address</label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{ width: "100%", padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: 10, fontSize: 14, outline: "none", boxSizing: "border-box" as const }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = primaryColor)}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#d1d5db")}
                  />
                </div>

                {payError && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px" }}>
                    <AlertCircle style={{ width: 16, height: 16, color: "#dc2626", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "#dc2626" }}>{payError}</span>
                  </div>
                )}

                <button
                  onClick={handlePay}
                  disabled={paying}
                  style={{
                    width: "100%", padding: "13px 0", borderRadius: 12, background: paying ? "#9ca3af" : primaryColor,
                    color: "white", fontWeight: 700, fontSize: 16, border: "none", cursor: paying ? "not-allowed" : "pointer",
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={(e) => { if (!paying) (e.currentTarget as HTMLButtonElement).style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                >
                  {paying ? "Redirecting to Paystack…" : "Proceed to Pay"}
                </button>

                <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", margin: 0 }}>
                  You will be redirected to Paystack. Save your email to re-access your purchase.
                </p>
              </div>
            </div>

            {/* Share this product */}
            <div style={{ background: "white", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.07)", border: "1px solid #f3f4f6" }}>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: "#374151", marginBottom: 12, marginTop: 0 }}>Share this product</h3>
              <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "8px 12px" }}>
                <span style={{ fontSize: 12, color: "#6b7280", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{productUrl}</span>
                <CopyLinkButton url={productUrl} />
              </div>
            </div>

            {/* Secure badge */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 0" }}>
              <Lock style={{ width: 14, height: 14, color: "#9ca3af" }} />
              <span style={{ fontSize: 12, color: "#9ca3af" }}>Secure payment via Paystack</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e7eb", background: "white", padding: "20px", textAlign: "center" }}>
        <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>
          Powered by{" "}
          <a href="https://certifyer.online" target="_blank" rel="noopener noreferrer" style={{ color: "#4f46e5", fontWeight: 600, textDecoration: "none" }}>
            Certifyer
          </a>{" "}
          · Digital Certificate Platform
        </p>
      </footer>
    </div>
  );
}
