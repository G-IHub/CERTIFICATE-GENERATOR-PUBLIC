import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import { AlertCircle } from "lucide-react";
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
  website?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  whatsapp?: string;
  email?: string;
}

type FilterType = "all" | "bundle" | "video" | "pdf";

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
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
  bundle: { bg: "linear-gradient(135deg, #FFE6D5, #FFA56E)", textColor: "#2A2A2E" },
  video:  { bg: "linear-gradient(135deg, #1E1E22, #3a3a40)",  textColor: "#ffffff" },
  pdf:    { bg: "linear-gradient(135deg, #FFF4ED, #FFCAA7)",  textColor: "#2A2A2E" },
};

const TYPE_LABELS: Record<string, string> = {
  bundle: "Bundle",
  video: "Video Course",
  pdf: "PDF / Resource",
};

const DOT_GRID_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23000'/%3E%3C/svg%3E")`;

function TypeIcon({ type }: { type: string }) {
  if (type === "pdf") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    );
  }
  if (type === "video") {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    );
  }
  // bundle
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}

function StarIcon({ size = 11 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

function ProductCard({ product, orgId }: { product: Product; orgId: string }) {
  const [hovered, setHovered] = useState(false);
  const gradient = TYPE_GRADIENTS[product.type] || TYPE_GRADIENTS.bundle;
  const hasCert = !!product.certificateTemplateId;

  const handleClick = () => {
    window.location.href = `/store/${orgId}/${product.id}`;
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#ffffff",
        borderRadius: 18,
        overflow: "hidden",
        border: hovered ? "1.5px solid #F25C0B" : "1.5px solid #E5E5E8",
        boxShadow: hovered
          ? "0 12px 40px rgba(242,92,11,0.13), 0 2px 8px rgba(0,0,0,0.07)"
          : "0 2px 8px rgba(0,0,0,0.06)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", aspectRatio: "16/10", overflow: "hidden" }}>
        {product.thumbnailUrl ? (
          <img
            src={product.thumbnailUrl}
            alt={product.title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
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
              padding: "20px",
              boxSizing: "border-box",
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
                fontSize: 18,
                fontWeight: 700,
                color: gradient.textColor,
                textAlign: "center",
                lineHeight: 1.3,
                zIndex: 1,
                position: "relative",
              }}
            >
              {product.title}
            </span>
          </div>
        )}

        {/* Type badge — top left */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            background: "rgba(255,255,255,0.95)",
            color: "#2A2A2E",
            fontSize: 11,
            fontWeight: 600,
            padding: "3px 9px",
            borderRadius: 100,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            backdropFilter: "blur(4px)",
          }}
        >
          <TypeIcon type={product.type} />
          {TYPE_LABELS[product.type] || product.type}
        </span>

        {/* Certificate badge — top right */}
        {hasCert && (
          <span
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              background: "rgba(14,14,16,0.82)",
              color: "#ffffff",
              fontSize: 11,
              fontWeight: 600,
              padding: "3px 9px",
              borderRadius: 100,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              backdropFilter: "blur(4px)",
            }}
          >
            <StarIcon /> Certificate
          </span>
        )}
      </div>

      {/* Card body */}
      <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 19,
            fontWeight: 600,
            color: "#0E0E10",
            margin: 0,
            lineHeight: 1.3,
          }}
        >
          {product.title}
        </h3>

        {product.description && (
          <p
            style={{
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 13.5,
              color: "#5C5C63",
              margin: 0,
              lineHeight: 1.55,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            } as React.CSSProperties}
          >
            {product.description}
          </p>
        )}

        {/* Price + CTA footer */}
        <div style={{ marginTop: "auto", paddingTop: 12, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            {product.priceNGN > 0 && (
              <span
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#0E0E10",
                  display: "block",
                }}
              >
                {nairaDisplay(product.priceNGN)}
              </span>
            )}
            {product.priceUSD > 0 && (
              <span
                style={{
                  fontFamily: "'Geist', system-ui, sans-serif",
                  fontSize: 12,
                  color: "#84848C",
                  display: "block",
                }}
              >
                or {dollarDisplay(product.priceUSD)} USD
              </span>
            )}
            {!product.priceNGN && !product.priceUSD && (
              <span style={{ fontFamily: "'Geist', system-ui, sans-serif", fontSize: 15, color: "#84848C" }}>Free</span>
            )}
          </div>

          <button
            style={{
              background: hovered ? "#F25C0B" : "#0E0E10",
              color: "#ffffff",
              border: "none",
              borderRadius: 10,
              padding: "9px 16px",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Geist', system-ui, sans-serif",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "background 0.18s ease",
              flexShrink: 0,
            }}
          >
            View &amp; Buy →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function StorefrontPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
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
      } catch (e: unknown) {
        setError((e as Error).message || "Could not load store");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orgId]);

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
          <p style={{ color: "#84848C", fontSize: 14 }}>Loading store…</p>
        </div>
      </div>
    );
  }

  if (error) {
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
          <AlertCircle style={{ width: 48, height: 48, color: "#F25C0B", margin: "0 auto 16px", display: "block" }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#0E0E10", marginBottom: 8 }}>Store not found</h2>
          <p style={{ color: "#5C5C63", fontSize: 14 }}>{error}</p>
        </div>
      </div>
    );
  }

  const filteredProducts =
    filter === "all"
      ? products
      : products.filter((p) => p.type === filter);

  const cols = width >= 1024 ? 3 : width >= 640 ? 2 : 1;
  const year = new Date().getFullYear();

  const socialLinks = [
    org?.website ? { label: "Website", href: org.website } : null,
    org?.instagram ? { label: "Instagram", href: `https://instagram.com/${org.instagram.replace("@", "")}` } : null,
    org?.linkedin ? { label: "LinkedIn", href: org.linkedin.startsWith("http") ? org.linkedin : `https://linkedin.com/in/${org.linkedin}` } : null,
    org?.twitter ? { label: "Twitter / X", href: `https://twitter.com/${org.twitter.replace("@", "")}` } : null,
    org?.whatsapp ? { label: "WhatsApp", href: `https://wa.me/${org.whatsapp.replace(/\D/g, "")}` } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  return (
    <div style={{ minHeight: "100vh", background: "#F8F8F9", fontFamily: "'Geist', system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
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
          {/* Brand */}
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
              <span style={{ color: "#fff", fontWeight: 800, fontSize: 13, fontFamily: "'Fraunces', Georgia, serif" }}>C</span>
            </div>
            <span style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 600, fontSize: 16, color: "#0E0E10" }}>
              Certifyer
            </span>
          </div>

          {/* Security pill */}
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
            <span style={{ fontSize: 12, fontWeight: 500, color: "#5C5C63" }}>Secure store · Paystack verified</span>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        style={{
          background: "radial-gradient(ellipse at 60% 40%, #FFF3EC 0%, #FFF8F4 40%, #F8F8F9 100%)",
          borderBottom: "1px solid #F1F1F3",
          padding: width >= 768 ? "56px 24px 40px" : "40px 20px 32px",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "flex",
            flexDirection: width >= 768 ? "row" : "column",
            alignItems: width >= 768 ? "center" : "flex-start",
            justifyContent: "space-between",
            gap: 32,
          }}
        >
          {/* Left: org info */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 24 }}>
            {/* Org logo */}
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: 22,
                flexShrink: 0,
                background: org?.logo ? "transparent" : "linear-gradient(135deg, #F25C0B, #FF8C42)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {org?.logo ? (
                <img src={org.logo} alt={org?.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span style={{ color: "#fff", fontWeight: 800, fontSize: 32, fontFamily: "'Fraunces', Georgia, serif" }}>
                  {org?.name?.[0] || "?"}
                </span>
              )}
            </div>

            {/* Meta */}
            <div>
              {/* Verified badge */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  background: "#FFF3EC",
                  border: "1px solid #FFCAA7",
                  borderRadius: 100,
                  padding: "3px 10px",
                  marginBottom: 10,
                }}
              >
                <StarIcon size={10} />
                <span style={{ fontSize: 11, fontWeight: 600, color: "#F25C0B" }}>Verified Organisation</span>
              </div>

              <h1
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: width >= 768 ? 42 : 28,
                  fontWeight: 600,
                  color: "#0E0E10",
                  margin: "0 0 8px",
                  lineHeight: 1.15,
                }}
              >
                {org?.name}
              </h1>
              <p
                style={{
                  fontSize: 15,
                  color: "#5C5C63",
                  margin: 0,
                  maxWidth: 480,
                  lineHeight: 1.55,
                }}
              >
                {org?.description || "Digital products store"}
              </p>
            </div>
          </div>

          {/* Right: stats card */}
          <div
            style={{
              background: "#ffffff",
              border: "1.5px solid #E5E5E8",
              borderRadius: 18,
              boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              padding: "20px 28px",
              display: "flex",
              gap: 32,
              flexShrink: 0,
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#0E0E10",
                  lineHeight: 1,
                }}
              >
                {products.length}
              </div>
              <div style={{ fontSize: 12, color: "#84848C", marginTop: 4, fontWeight: 500 }}>Products</div>
            </div>
            <div style={{ width: 1, background: "#E5E5E8" }} />
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Fraunces', Georgia, serif",
                  fontSize: 32,
                  fontWeight: 700,
                  color: "#0E0E10",
                  lineHeight: 1,
                }}
              >
                ✓
              </div>
              <div style={{ fontSize: 12, color: "#84848C", marginTop: 4, fontWeight: 500 }}>Certifyer Verified</div>
            </div>
          </div>
        </div>

        {/* Social links row */}
        {(socialLinks.length > 0 || org?.email) && (
          <div
            style={{
              maxWidth: 1140,
              margin: "24px auto 0",
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 10,
            }}
          >
            {socialLinks.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: "1px solid #E5E5E8",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2A2A2E",
                  textDecoration: "none",
                }}
              >
                {s.label}
              </a>
            ))}
            {org?.email && (
              <a
                href={`mailto:${org.email}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "#ffffff",
                  border: "1px solid #E5E5E8",
                  borderRadius: 100,
                  padding: "5px 14px",
                  fontSize: 12,
                  fontWeight: 500,
                  color: "#2A2A2E",
                  textDecoration: "none",
                }}
              >
                ✉ {org.email}
              </a>
            )}
          </div>
        )}
      </div>

      {/* ── Toolbar ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "28px 24px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <h2
            style={{
              fontFamily: "'Fraunces', Georgia, serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#0E0E10",
              margin: 0,
            }}
          >
            All products · {products.length}
          </h2>

          {/* Filter chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {(
              [
                { key: "all", label: "All" },
                { key: "bundle", label: "Bundles" },
                { key: "video", label: "Video courses" },
                { key: "pdf", label: "PDFs & resources" },
              ] as { key: FilterType; label: string }[]
            ).map((chip) => (
              <button
                key={chip.key}
                onClick={() => setFilter(chip.key)}
                style={{
                  padding: "6px 16px",
                  borderRadius: 100,
                  border: filter === chip.key ? "1.5px solid #F25C0B" : "1.5px solid #E5E5E8",
                  background: filter === chip.key ? "#FFF3EC" : "#ffffff",
                  color: filter === chip.key ? "#F25C0B" : "#5C5C63",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "'Geist', system-ui, sans-serif",
                  transition: "all 0.15s ease",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product grid ── */}
      <div style={{ maxWidth: 1140, margin: "0 auto", padding: "24px 24px 60px" }}>
        {filteredProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "72px 20px" }}>
            <p style={{ color: "#B6B6BC", fontSize: 15 }}>No products in this category yet.</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${cols}, 1fr)`,
              gap: 24,
            }}
          >
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} orgId={orgId || ""} />
            ))}
          </div>
        )}
      </div>

      {/* ── Trust strip ── */}
      <div
        style={{
          background: "#F1F1F3",
          borderTop: "1px solid #E5E5E8",
          borderBottom: "1px solid #E5E5E8",
          padding: "40px 24px",
        }}
      >
        <div
          style={{
            maxWidth: 1140,
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: width >= 768 ? "repeat(4, 1fr)" : "repeat(2, 1fr)",
            gap: 28,
          }}
        >
          {[
            {
              icon: "🔒",
              title: "Secure payments",
              desc: "All transactions handled by Paystack.",
            },
            {
              icon: "🏆",
              title: "Verifiable certificates",
              desc: "Every certificate has a unique ID and QR code.",
            },
            {
              icon: "💬",
              title: "Direct seller support",
              desc: "Questions? Reach the team that made this product.",
            },
            {
              icon: "♾️",
              title: "Lifetime access",
              desc: "Buy once, keep forever.",
            },
          ].map((item) => (
            <div key={item.title} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 22 }}>{item.icon}</span>
              <div
                style={{
                  fontFamily: "'Geist', system-ui, sans-serif",
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#0E0E10",
                }}
              >
                {item.title}
              </div>
              <div style={{ fontSize: 13, color: "#5C5C63", lineHeight: 1.5 }}>{item.desc}</div>
            </div>
          ))}
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
          © {year} {org?.name} · All products and certificates issued through this store.
        </p>
        <p style={{ fontSize: 12, color: "#B6B6BC", margin: 0 }}>
          ● Powered by{" "}
          <a
            href="https://certifyer.online"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#F25C0B", fontWeight: 600, textDecoration: "none" }}
          >
            Certifyer
          </a>
        </p>
      </footer>
    </div>
  );
}
