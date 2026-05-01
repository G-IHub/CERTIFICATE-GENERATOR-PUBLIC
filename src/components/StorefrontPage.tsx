import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ShoppingBag, FileText, Video, Package, AlertCircle, Lock } from "lucide-react";
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

export default function StorefrontPage() {
  const { orgId } = useParams<{ orgId: string }>();
  const navigate = useNavigate();
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

      {/* Hero Section */}
      <div
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)`,
          height: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Decorative circles */}
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", bottom: -40, left: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />

        <div style={{ textAlign: "center", padding: "0 20px", position: "relative", zIndex: 1 }}>
          {/* Store pill */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.18)", borderRadius: 100, padding: "4px 14px", marginBottom: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 12, fontWeight: 600, letterSpacing: "0.05em" }}>✦ Digital Products Store</span>
          </div>

          {/* Org logo large */}
          {org?.logo ? (
            <img
              src={org.logo}
              alt={org.name}
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", border: "3px solid white", boxShadow: "0 4px 20px rgba(0,0,0,0.25)", margin: "0 auto 14px" }}
            />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
              <span style={{ color: "white", fontWeight: 800, fontSize: 28 }}>{org?.name?.[0] || "?"}</span>
            </div>
          )}

          <h1 style={{ color: "white", fontWeight: 800, fontSize: 28, margin: "0 0 6px", textShadow: "0 1px 4px rgba(0,0,0,0.15)" }}>{org?.name}</h1>
          {org?.description && (
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, margin: 0, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>{org.description}</p>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: "#f3f4f6", borderBottom: "1px solid #e5e7eb", padding: "10px 20px", textAlign: "center" }}>
        <span style={{ fontSize: 13, color: "#6b7280" }}>
          <strong style={{ color: "#374151" }}>{products.length}</strong> {products.length === 1 ? "Product" : "Products"} Available
        </span>
      </div>

      {/* Products section */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "36px 20px 60px" }}>
        <h2 style={{ fontWeight: 700, fontSize: 20, color: "#111827", marginBottom: 24 }}>All Products</h2>

        {products.length === 0 ? (
          <div style={{ textAlign: "center", padding: "64px 20px" }}>
            <ShoppingBag style={{ width: 48, height: 48, color: "#d1d5db", margin: "0 auto 16px", display: "block" }} />
            <p style={{ color: "#9ca3af", fontSize: 15 }}>No products available yet.</p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 24 }}>
            {products.map((p) => {
              const meta = TYPE_META[p.type] || TYPE_META.bundle;
              const Icon = TYPE_ICONS[p.type] || Package;
              const fileCount = p.files?.length || 0;
              const linkCount = p.links?.length || 0;
              const hasCert = !!p.certificateTemplateId;

              return (
                <div
                  key={p.id}
                  style={{
                    background: "white",
                    borderRadius: 16,
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                    border: "1px solid #f3f4f6",
                    display: "flex",
                    flexDirection: "column",
                    transition: "box-shadow 0.2s, transform 0.2s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 8px 30px rgba(0,0,0,0.12)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)";
                    (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
                  }}
                >
                  {/* Image area */}
                  <div style={{ position: "relative", height: 200, overflow: "hidden" }}>
                    {p.thumbnailUrl ? (
                      <img src={p.thumbnailUrl} alt={p.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: `linear-gradient(135deg, ${meta.gradientFrom} 0%, ${meta.gradientTo} 100%)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Icon style={{ width: 52, height: 52, color: meta.color, opacity: 0.5 }} />
                      </div>
                    )}
                    {/* Type badge overlay */}
                    <span style={{ position: "absolute", top: 12, right: 12, background: meta.color, color: "white", fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 100, letterSpacing: "0.04em" }}>
                      {meta.label}
                    </span>
                  </div>

                  {/* Card body */}
                  <div style={{ padding: "18px 20px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 16, color: "#111827", margin: 0, lineHeight: 1.3 }}>{p.title}</h3>

                    {p.description && (
                      <p style={{ fontSize: 13, color: "#6b7280", margin: 0, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" } as React.CSSProperties}>
                        {p.description}
                      </p>
                    )}

                    {/* What's included */}
                    {(fileCount > 0 || linkCount > 0 || hasCert) && (
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {fileCount > 0 && (
                          <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                            📄 {fileCount} {fileCount === 1 ? "file" : "files"}
                          </span>
                        )}
                        {linkCount > 0 && (
                          <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                            🔗 {linkCount} {linkCount === 1 ? "link" : "links"}
                          </span>
                        )}
                        {hasCert && (
                          <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
                            🏆 Certificate
                          </span>
                        )}
                      </div>
                    )}

                    {/* Price */}
                    <div style={{ display: "flex", gap: 10, alignItems: "baseline", marginTop: 2 }}>
                      {p.priceNGN > 0 && (
                        <span style={{ fontWeight: 800, fontSize: 17, color: "#111827" }}>{nairaDisplay(p.priceNGN)}</span>
                      )}
                      {p.priceUSD > 0 && (
                        <span style={{ fontWeight: 700, fontSize: 14, color: "#6b7280" }}>{dollarDisplay(p.priceUSD)}</span>
                      )}
                      {!p.priceNGN && !p.priceUSD && (
                        <span style={{ fontWeight: 700, fontSize: 15, color: "#9ca3af" }}>Free</span>
                      )}
                    </div>

                    {/* CTA button */}
                    <button
                      onClick={() => navigate(`/store/${p.orgId}/${p.id}`)}
                      style={{
                        marginTop: "auto",
                        width: "100%",
                        padding: "11px 0",
                        borderRadius: 10,
                        background: primaryColor,
                        color: "white",
                        fontWeight: 700,
                        fontSize: 14,
                        border: "none",
                        cursor: "pointer",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "0.88")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.opacity = "1")}
                    >
                      View &amp; Buy
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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
