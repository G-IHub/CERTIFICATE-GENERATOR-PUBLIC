import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { AlertCircle } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

interface ProductFile {
  name: string;
  storagePath: string;
  size: number;
  description?: string;
}

interface ProductLink {
  label: string;
  url: string;
  encrypted?: boolean;
  meta?: string;
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
  level?: string;
  coverSubtitle?: string;
  outcomes?: string[];
}

interface OrgInfo {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  email?: string;
}

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

function nairaDisplay(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 })}`;
}
function dollarDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const TYPE_GRADIENTS: Record<string, { bg: string; textColor: string }> = {
  bundle: {
    bg: "linear-gradient(135deg, #FFE6D5, #FFA56E)",
    textColor: "#2A2A2E",
  },
  video: {
    bg: "linear-gradient(135deg, #1E1E22, #3a3a40)",
    textColor: "#ffffff",
  },
  pdf: {
    bg: "linear-gradient(135deg, #FFF4ED, #FFCAA7)",
    textColor: "#2A2A2E",
  },
};

const TYPE_LABELS: Record<string, string> = {
  bundle: "Bundle",
  video: "Video Course",
  pdf: "PDF / Resource",
};

const DOT_GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23000'/%3E%3C/svg%3E")`;

function ShieldIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function TypeIcon({ type }: { type: string }) {
  if (type === "pdf") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (type === "video") {
    return (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
      </svg>
    );
  }
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F25C0B"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="none"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function ProductLandingPage() {
  const { orgId, productId } = useParams<{
    orgId: string;
    productId: string;
  }>();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [currency, setCurrency] = useState<"NGN" | "USD">("NGN");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [copied, setCopied] = useState(false);
  const [showExpandedDescription, setShowExpandedDescription] = useState(false);
  const fullDescriptionRef = useRef<HTMLDivElement | null>(null);

  const width = useWindowWidth();

  // Inject Google Fonts
  useEffect(() => {
    const id = "certifyer-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,800&family=Geist:wght@300;400;500;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  useEffect(() => {
    if (!orgId || !productId) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/store/${orgId}/products/${productId}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          },
        );
        if (!res.ok) {
          const d = await res.json();
          throw new Error(d.error || "Product not found");
        }
        const data = await res.json();
        setProduct(data.product);
        setOrg(data.org);
        if (data.product?.priceNGN > 0) setCurrency("NGN");
        else if (data.product?.priceUSD > 0) setCurrency("USD");
      } catch (e: unknown) {
        setError((e as Error).message || "Could not load product");
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
      const res = await fetch(
        `${API_BASE}/digital-products/${product.id}/purchase/initialize`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ orgId, buyerEmail, buyerName, currency }),
        },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Payment initialization failed");
      }
      const data = await res.json();
      window.location.href = data.authorizationUrl;
    } catch (e: unknown) {
      setPayError((e as Error).message || "Payment failed");
      setPaying(false);
    }
  };

  const handleCopy = () => {
    const url = `https://certifyer.online/store/${orgId}/${productId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F8F9",
          fontFamily: "'Geist', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid #E5E5E8",
              borderTopColor: "#F25C0B",
              borderRadius: "50%",
              margin: "0 auto 16px",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: "#84848C", fontSize: 14 }}>Loading product…</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#F8F8F9",
          padding: "20px",
          fontFamily: "'Geist', system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <AlertCircle
            style={{
              width: 48,
              height: 48,
              color: "#F25C0B",
              margin: "0 auto 16px",
              display: "block",
            }}
          />
          <h2
            style={{
              fontSize: 20,
              fontWeight: 600,
              color: "#0E0E10",
              marginBottom: 8,
            }}
          >
            Product not found
          </h2>
          <p style={{ color: "#5C5C63", fontSize: 14, marginBottom: 20 }}>
            {error}
          </p>
          <a
            href={`/store/${orgId}`}
            style={{
              color: "#F25C0B",
              fontWeight: 600,
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            ← Back to Store
          </a>
        </div>
      </div>
    );
  }

  const gradient = TYPE_GRADIENTS[product.type] || TYPE_GRADIENTS.bundle;
  const hasCert = !!product.certificateTemplateId;
  const hasBothPrices = product.priceNGN > 0 && product.priceUSD > 0;

  const handleSeeMoreDescription = () => {
    setShowExpandedDescription(true);
    requestAnimationFrame(() => {
      fullDescriptionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  };

  const descriptionPreview =
    product.description && product.description.length > 140
      ? `${product.description.slice(0, 140)}...`
      : product.description;
  const productUrl = `https://certifyer.online/store/${orgId}/${productId}`;
  const year = new Date().getFullYear();
  const isMobile = width < 840;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8F8F9",
        fontFamily: "'Geist', system-ui, sans-serif",
      }}
    >
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        * { box-sizing: border-box; }
        details summary { cursor: pointer; list-style: none; }
        details summary::-webkit-details-marker { display: none; }
      `}</style>

      {/* ── Top bar ── */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid #E5E5E8",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            padding: "0 24px",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: 8,
                background: "linear-gradient(135deg, #F25C0B, #FF8C42)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 13,
                  fontFamily: "'Fraunces', Georgia, serif",
                }}
              >
                C
              </span>
            </div>
            <span
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontWeight: 600,
                fontSize: 16,
                color: "#0E0E10",
              }}
            >
              Certifyer
            </span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "#F1F1F3",
              border: "1px solid #E5E5E8",
              borderRadius: 100,
              padding: "5px 12px",
            }}
          >
            <ShieldIcon />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#5C5C63" }}>
              Secure store · Paystack verified
            </span>
          </div>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "16px 24px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 13,
            color: "#84848C",
          }}
        >
          <a
            href={`/store/${orgId}`}
            style={{
              color: "#5C5C63",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {org?.name}
          </a>
          <span style={{ color: "#B6B6BC" }}>›</span>
          <span style={{ color: "#0E0E10", fontWeight: 500 }}>
            {product.title}
          </span>
        </div>
      </div>

      {/* ── Main two-column layout ── */}
      <div
        style={{
          maxWidth: 1140,
          margin: "0 auto",
          padding: isMobile ? "24px 20px 60px" : "32px 24px 72px",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 420px",
          gap: isMobile ? 32 : 56,
          alignItems: "start",
        }}
      >
        {/* ── LEFT column ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {/* Product cover */}
          <div
            style={{
              borderRadius: 20,
              overflow: "hidden",
              aspectRatio: "16/10",
              boxShadow: "0 8px 32px rgba(0,0,0,0.10)",
              position: "relative",
            }}
          >
            {product.thumbnailUrl ? (
              <img
                src={product.thumbnailUrl}
                alt={product.title}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  background: gradient.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "32px",
                  position: "relative",
                }}
              >
                {/* Dot grid overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: DOT_GRID_SVG,
                    backgroundSize: "20px 20px",
                    opacity: 0.18,
                  }}
                />
                <span
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontSize: 56,
                    fontWeight: 700,
                    color: gradient.textColor,
                    textAlign: "center",
                    lineHeight: 1.15,
                    zIndex: 1,
                    position: "relative",
                  }}
                >
                  {product.title}
                </span>
                {product.coverSubtitle && (
                  <div
                    style={{
                      position: "relative",
                      zIndex: 2,
                      marginTop: 16,
                      fontSize: 13,
                      fontWeight: 600,
                      letterSpacing: "0.14em",
                      textTransform: "uppercase",
                      color: "#B33B00",
                      textAlign: "center",
                    }}
                  >
                    {product.coverSubtitle}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Type badge row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
              marginTop: -16,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "#F1F1F3",
                border: "1px solid #E5E5E8",
                borderRadius: 100,
                padding: "5px 14px",
                fontSize: 12,
                fontWeight: 600,
                color: "#2A2A2E",
              }}
            >
              <TypeIcon type={product.type} />
              {TYPE_LABELS[product.type] || product.type}
            </span>
            {hasCert && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#0E0E10",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#ffffff",
                }}
              >
                <StarIcon size={10} /> Certificate included
              </span>
            )}
            {product.level && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "#FFF4ED",
                  color: "#B33B00",
                  border: "1px solid #FFE6D5",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {product.level}
              </span>
            )}
          </div>

          {/* Product title */}
          <h1
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: isMobile ? 28 : 44,
              fontWeight: 600,
              color: "#0E0E10",
              margin: 0,
              lineHeight: 1.15,
              marginTop: -16,
            }}
          >
            {product.title}
          </h1>

          {/* Product description */}
          {product.description && (
            <div ref={fullDescriptionRef} style={{ marginTop: -16 }}>
              <p
                style={{
                  fontSize: 18,
                  color: "#5C5C63",
                  margin: 0,
                  lineHeight: 1.65,
                }}
              >
                {product.description}
              </p>
            </div>
          )}

          {/* Seller row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              background: "#ffffff",
              border: "1.5px solid #E5E5E8",
              borderRadius: 14,
              padding: "14px 18px",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background: "linear-gradient(135deg, #F25C0B, #FF8C42)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  overflow: "hidden",
                }}
              >
                {org?.logo ? (
                  <img
                    src={org.logo}
                    alt={org.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: 16,
                      fontFamily: "'Fraunces', Georgia, serif",
                    }}
                  >
                    {org?.name?.[0] || "?"}
                  </span>
                )}
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <span
                    style={{ fontWeight: 600, fontSize: 14, color: "#0E0E10" }}
                  >
                    {org?.name}
                  </span>
                  <span style={{ fontSize: 12, color: "#F25C0B" }}>✓</span>
                </div>
                <div style={{ fontSize: 12, color: "#84848C" }}>
                  Verified seller
                </div>
              </div>
            </div>
            <a
              href={`/store/${orgId}`}
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#F25C0B",
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Visit store →
            </a>
          </div>

          {/* What you get */}
          {(product.files.length > 0 ||
            product.links.length > 0 ||
            hasCert) && (
            <div>
              <h2
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 22,
                  fontWeight: 600,
                  color: "#0E0E10",
                  margin: "0 0 16px",
                }}
              >
                What you get
              </h2>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {product.files.map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#ffffff",
                      border: "1.5px solid #E5E5E8",
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "#FFF3EC",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#F25C0B",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#0E0E10",
                        }}
                      >
                        {f.name}
                      </div>
                      <div style={{ fontSize: 12.5, color: "#84848C" }}>
                        {f.description ||
                          `${(f.size / 1024).toFixed(0)} KB · downloadable`}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#F25C0B",
                        background: "#FFF3EC",
                        border: "1px solid #FFCAA7",
                        borderRadius: 4,
                        padding: "2px 7px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      PDF
                    </span>
                  </div>
                ))}

                {product.links.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#ffffff",
                      border: "1.5px solid #E5E5E8",
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "#1E1E22",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#ffffff",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polygon points="23 7 16 12 23 17 23 7" />
                        <rect
                          x="1"
                          y="5"
                          width="15"
                          height="14"
                          rx="2"
                          ry="2"
                        />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#0E0E10",
                        }}
                      >
                        {l.label || "Video lesson"}
                      </div>
                      <div style={{ fontSize: 12.5, color: "#84848C" }}>
                        {l.meta || "Access link · no expiry"}
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#ffffff",
                        background: "#1E1E22",
                        borderRadius: 4,
                        padding: "2px 7px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      VIDEO
                    </span>
                  </div>
                ))}

                {hasCert && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      background: "#ffffff",
                      border: "1.5px solid #E5E5E8",
                      borderRadius: 12,
                      padding: "12px 16px",
                    }}
                  >
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "#ECFDF5",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        color: "#059669",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#0E0E10",
                        }}
                      >
                        Certificate of Completion · Verifiable
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#84848C", marginTop: 2 }}
                      >
                        Auto-issued on purchase · QR-verifiable
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 700,
                        color: "#059669",
                        background: "#ECFDF5",
                        border: "1px solid #6EE7B7",
                        borderRadius: 4,
                        padding: "2px 7px",
                        letterSpacing: "0.04em",
                      }}
                    >
                      CERT
                    </span>
                  </div>
                )}

                {product.files.length === 0 &&
                  product.links.length === 0 &&
                  !hasCert && (
                    <div
                      style={{
                        padding: "16px 20px",
                        background: "#F8F8F9",
                        border: "1.5px solid #E5E5E8",
                        borderRadius: 12,
                        fontSize: 14,
                        color: "#84848C",
                      }}
                    >
                      Access granted after purchase
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Learning Outcomes */}
          {product.outcomes &&
            product.outcomes.filter((o) => o.trim()).length > 0 && (
              <div style={{ marginBottom: 44 }}>
                <h2
                  style={{
                    fontFamily: "'Fraunces', Georgia, serif",
                    fontWeight: 600,
                    fontSize: 26,
                    letterSpacing: "-0.02em",
                    color: "#0E0E10",
                    marginBottom: 18,
                  }}
                >
                  By the end, you'll be able to
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: width < 640 ? "1fr" : "repeat(2, 1fr)",
                    gap: 12,
                  }}
                >
                  {product.outcomes
                    .filter((o) => o.trim())
                    .map((outcome, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 12,
                          padding: "16px 18px",
                          border: "1px solid #E5E5E8",
                          borderRadius: 14,
                          background: "white",
                        }}
                      >
                        <div
                          style={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            background: "#F25C0B",
                            display: "grid",
                            placeItems: "center",
                            color: "white",
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        >
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <div
                          style={{
                            fontSize: 14,
                            color: "#2A2A2E",
                            lineHeight: 1.45,
                          }}
                        >
                          {outcome}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

          {/* FAQ */}
          <div>
            <h2
              style={{
                fontFamily: "'Fraunces', Georgia, serif",
                fontSize: 22,
                fontWeight: 600,
                color: "#0E0E10",
                margin: "0 0 16px",
              }}
            >
              Frequently asked questions
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {[
                {
                  q: "How do I access the product after I pay?",
                  a: "After Paystack confirms, you'll receive secure access links instantly. Links don't expire — lifetime access.",
                },
                // {
                //   q: "Is the certificate verifiable by employers?",
                //   a: "Yes. Each certificate has a unique ID and QR code anyone can verify instantly.",
                // },
                {
                  q: "What payment methods are accepted?",
                  a: "Paystack supports debit cards, bank transfers, USSD, and mobile money.",
                },
                {
                  q: "What if I have a problem?",
                  a: "Contact the seller directly using the email on their store page. Certifyer also offers platform support.",
                },
              ].map((faq, i) => (
                <details
                  key={i}
                  style={{
                    borderTop: i === 0 ? "1.5px solid #E5E5E8" : "none",
                    borderBottom: "1.5px solid #E5E5E8",
                    borderLeft: "1.5px solid #E5E5E8",
                    borderRight: "1.5px solid #E5E5E8",
                    borderRadius:
                      i === 0
                        ? "12px 12px 0 0"
                        : i === 3
                          ? "0 0 12px 12px"
                          : "0",
                    background: "#ffffff",
                    overflow: "hidden",
                  }}
                >
                  <summary
                    style={{
                      padding: "16px 20px",
                      fontSize: 15,
                      fontWeight: 600,
                      color: "#0E0E10",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    {faq.q}
                    <span
                      style={{
                        color: "#84848C",
                        flexShrink: 0,
                        fontSize: 18,
                        lineHeight: 1,
                      }}
                    >
                      +
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: "0 20px 16px",
                      fontSize: 14,
                      color: "#5C5C63",
                      lineHeight: 1.6,
                    }}
                  >
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT column ── */}
        <div
          style={{
            position: isMobile ? "static" : "sticky",
            top: 88,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          {/* Buy card */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #E5E5E8",
              borderRadius: 20,
              boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
              overflow: "hidden",
            }}
          >
            {/* Price block */}
            <div
              style={{
                padding: "24px 24px 20px",
                borderBottom: "1px solid #F1F1F3",
              }}
            >
              {/* Currency toggle */}
              {hasBothPrices && (
                <div
                  style={{
                    display: "flex",
                    background: "#F1F1F3",
                    borderRadius: 10,
                    padding: 3,
                    marginBottom: 16,
                    gap: 3,
                  }}
                >
                  {(["NGN", "USD"] as const).map((c) => (
                    <button
                      key={c}
                      onClick={() => setCurrency(c)}
                      style={{
                        flex: 1,
                        padding: "7px 0",
                        borderRadius: 8,
                        border: "none",
                        background: currency === c ? "#ffffff" : "transparent",
                        color: currency === c ? "#0E0E10" : "#84848C",
                        fontWeight: currency === c ? 600 : 400,
                        fontSize: 13,
                        cursor: "pointer",
                        boxShadow:
                          currency === c
                            ? "0 1px 4px rgba(0,0,0,0.08)"
                            : "none",
                        transition: "all 0.15s ease",
                        fontFamily: "'Geist', system-ui, sans-serif",
                      }}
                    >
                      {c === "NGN" ? "₦ NGN" : "$ USD"}
                    </button>
                  ))}
                </div>
              )}

              {product.description && (
                <div style={{ marginTop: 16 }}>
                  <p
                    style={{
                      fontSize: 12,
                      color: "#5C5C63",
                      margin: 0,
                      lineHeight: 1.65,
                    }}
                  >
                    {descriptionPreview}
                  </p>
                  {product.description.length > 200 && (
                    <button
                      type="button"
                      onClick={handleSeeMoreDescription}
                      style={{
                        marginTop: 8,
                        padding: 0,
                        border: "none",
                        background: "transparent",
                        color: "#B33B00",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        fontFamily: "'Geist', system-ui, sans-serif",
                      }}
                    >
                      {showExpandedDescription ? "See full details" : "See more"}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Form block */}
            <div style={{ padding: "22px 24px" }}>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 14 }}
              >
                {/* Full name */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#2A2A2E",
                      marginBottom: 6,
                    }}
                  >
                    Full name
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Your full name"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid #E5E5E8",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "'Geist', system-ui, sans-serif",
                      color: "#0E0E10",
                      background: "#ffffff",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#F25C0B")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#E5E5E8")
                    }
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#2A2A2E",
                      marginBottom: 6,
                    }}
                  >
                    Email address
                  </label>
                  <input
                    type="email"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1.5px solid #E5E5E8",
                      borderRadius: 10,
                      fontSize: 14,
                      outline: "none",
                      fontFamily: "'Geist', system-ui, sans-serif",
                      color: "#0E0E10",
                      background: "#ffffff",
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.borderColor = "#F25C0B")
                    }
                    onBlur={(e) =>
                      (e.currentTarget.style.borderColor = "#E5E5E8")
                    }
                  />
                </div>

                {/* Pay error */}
                {payError && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: 8,
                      padding: "10px 14px",
                    }}
                  >
                    <AlertCircle
                      style={{
                        width: 15,
                        height: 15,
                        color: "#DC2626",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: 13, color: "#DC2626" }}>
                      {payError}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-5">
                  {/* Main price */}
                  {currency === "NGN" && product.priceNGN > 0 ? (
                    <>
                      <div
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#0E0E10",
                          lineHeight: 1,
                        }}
                      >
                        {nairaDisplay(product.priceNGN)}
                      </div>
                      {product.priceUSD > 0 && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#84848C",
                            marginTop: 6,
                          }}
                        >
                          {/* or {dollarDisplay(product.priceUSD)} USD */}
                        </div>
                      )}
                    </>
                  ) : currency === "USD" && product.priceUSD > 0 ? (
                    <>
                      <div
                        style={{
                          fontFamily: "'Fraunces', Georgia, serif",
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#0E0E10",
                          lineHeight: 1,
                        }}
                      >
                        {dollarDisplay(product.priceUSD)}
                      </div>
                      {product.priceNGN > 0 && (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#84848C",
                            marginTop: 6,
                          }}
                        >
                          {/* or {nairaDisplay(product.priceNGN)} NGN */}
                        </div>
                      )}
                    </>
                  ) : !product.priceNGN && !product.priceUSD ? (
                    <div
                      style={{
                        fontFamily: "'Fraunces', Georgia, serif",
                        fontSize: 40,
                        fontWeight: 700,
                        color: "#84848C",
                        lineHeight: 1,
                      }}
                    >
                      Free
                    </div>
                  ) : null}

                  {/* Pay button */}
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    style={{
                      width: "40%",
                      padding: "14px 0",
                      borderRadius: 12,
                      background: paying ? "#B6B6BC" : "#F25C0B",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: 15,
                      border: "none",
                      cursor: paying ? "not-allowed" : "pointer",
                      fontFamily: "'Geist', system-ui, sans-serif",
                      boxShadow: paying
                        ? "none"
                        : "0 4px 16px rgba(242,92,11,0.30)",
                      transition:
                        "background 0.15s ease, box-shadow 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (!paying) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#D94F08";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!paying) {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.background = "#F25C0B";
                      }
                    }}
                  >
                    {paying ? "Redirecting to Paystack…" : "Proceed →"}
                  </button>
                </div>

                {/* Secure footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    color: "#84848C",
                    fontSize: 12,
                  }}
                >
                  <ShieldIcon />
                  Secure payment via Paystack
                </div>
              </div>
            </div>

            {/* Buy extras */}
            {/* <div
              style={{
                background: "#F8F8F9",
                borderTop: "1px solid #F1F1F3",
                padding: "16px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 9,
              }}
            >
              {[
                "Lifetime access to all materials",
                ...(hasCert ? ["Verifiable certificate on completion"] : []),
                "Instant delivery to your inbox",
                "Direct support from seller",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#2A2A2E" }}>
                  <CheckIcon />
                  {item}
                </div>
              ))}
            </div> */}
          </div>

          {/* Share block */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #E5E5E8",
              borderRadius: 16,
              padding: "18px 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                fontSize: 13,
                fontWeight: 600,
                color: "#2A2A2E",
                marginBottom: 12,
              }}
            >
              <ShareIcon />
              Share this product
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "#F8F8F9",
                border: "1.5px solid #E5E5E8",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: 11,
                  color: "#5C5C63",
                  flex: 1,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {productUrl}
              </span>
              <button
                onClick={handleCopy}
                style={{
                  padding: "5px 12px",
                  borderRadius: 7,
                  border: "none",
                  background: copied ? "#ECFDF5" : "#E5E5E8",
                  color: copied ? "#059669" : "#2A2A2E",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  fontFamily: "'Geist', system-ui, sans-serif",
                  transition: "background 0.15s ease, color 0.15s ease",
                }}
              >
                {copied ? "✓ Copied" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer
        style={{
          background: "#ffffff",
          borderTop: "1px solid #E5E5E8",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 13, color: "#84848C", margin: "0 0 6px" }}>
          © {year} {org?.name} · All products and certificates issued through
          this store.
        </p>
        <p style={{ fontSize: 12, color: "#B6B6BC", margin: 0 }}>
          ● Powered by{" "}
          <a
            href="https://certifyer.online"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: "#F25C0B",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Certifyer
          </a>
        </p>
      </footer>
    </div>
  );
}
