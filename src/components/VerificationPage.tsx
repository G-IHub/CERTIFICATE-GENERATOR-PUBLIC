import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Calendar,
  Building2,
  User,
  ExternalLink,
  Shield,
  Loader2,
} from "lucide-react";

const API_BASE = `https://gzawvtlehnujtviahdbv.supabase.co/functions/v1/make-server-a611b057`;

interface VerifyResult {
  valid: boolean;
  certificate?: {
    id: string;
    courseName?: string;
    certificateHeader?: string;
    courseDescription?: string;
    completionDate?: string;
    issuedDate?: string;
    studentName?: string;
    template?: string;
    status?: string;
    signatories?: { name: string; title: string }[];
  };
  organization?: {
    name: string;
    logo?: string;
  };
  course?: {
    name: string;
    description?: string;
  } | null;
  message?: string;
  error?: string;
}

export default function VerificationPage() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!certificateId) return;
    fetch(`${API_BASE}/certificates/${certificateId}/verify`)
      .then((r) => r.json())
      .then((data) => setResult(data))
      .catch(() => setResult({ valid: false, error: "Could not reach verification server." }))
      .finally(() => setLoading(false));
  }, [certificateId]);

  const cert = result?.certificate;
  const org = result?.organization;
  const isRevoked = cert?.status === "revoked";
  const isExpired = cert?.status === "expired";
  const isValid = result?.valid && !isRevoked && !isExpired;

  const statusConfig = loading
    ? { icon: Loader2, color: "text-indigo-500", bg: "bg-indigo-50", border: "border-indigo-200", label: "Checking…", spin: true }
    : isValid
    ? { icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Verified & Authentic", spin: false }
    : isRevoked
    ? { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Certificate Revoked", spin: false }
    : isExpired
    ? { icon: AlertCircle, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", label: "Certificate Expired", spin: false }
    : { icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-200", label: "Not Found / Invalid", spin: false };

  const StatusIcon = statusConfig.icon;

  const courseName = cert?.courseName || cert?.certificateHeader || "Certificate";
  const formattedDate = cert?.completionDate
    ? new Date(cert.completionDate).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })
    : cert?.issuedDate
    ? new Date(cert.issuedDate).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" })
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f0fdf4 100%)" }}>
      {/* Top nav bar */}
      <div style={{ background: "white", borderBottom: "1px solid #e5e7eb", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Award style={{ width: 16, height: 16, color: "white" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Certifyer</span>
        </Link>
        <span style={{ fontSize: 12, color: "#9ca3af", letterSpacing: 1, textTransform: "uppercase" }}>
          Certificate Verification
        </span>
      </div>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px" }}>

        {/* Status card */}
        <div style={{
          background: "white",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
          overflow: "hidden",
          marginBottom: 24,
        }}>
          {/* Status banner */}
          <div style={{
            padding: "28px 32px",
            background: loading ? "#f5f3ff" : isValid ? "linear-gradient(135deg, #ecfdf5, #d1fae5)" : isRevoked ? "#fef2f2" : isExpired ? "#fffbeb" : "#fef2f2",
            borderBottom: `1px solid ${isValid && !loading ? "#a7f3d0" : "#fee2e2"}`,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: "white",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              flexShrink: 0,
            }}>
              <StatusIcon
                style={{ width: 28, height: 28 }}
                className={`${statusConfig.color}${statusConfig.spin ? " animate-spin" : ""}`}
              />
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#111827" }}>{statusConfig.label}</p>
              {result?.message && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>{result.message}</p>
              )}
              {!loading && !result?.valid && (
                <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6b7280" }}>
                  {result?.error || "This certificate could not be verified."}
                </p>
              )}
            </div>
          </div>

          {/* Certificate details */}
          {cert && (
            <div style={{ padding: "28px 32px" }}>
              {/* Org header */}
              {org && (
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid #f3f4f6" }}>
                  {org.logo ? (
                    <img src={org.logo} alt={org.name} style={{ width: 44, height: 44, objectFit: "contain", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  ) : (
                    <div style={{ width: 44, height: 44, borderRadius: 8, background: "linear-gradient(135deg, #4f46e5, #7c3aed)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ color: "white", fontWeight: 700, fontSize: 18 }}>{org.name.charAt(0)}</span>
                    </div>
                  )}
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, color: "#111827", fontSize: 15 }}>{org.name}</p>
                    <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>Issuing Organisation</p>
                  </div>
                </div>
              )}

              {/* Detail rows */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {cert.studentName && (
                  <DetailRow icon={<User style={{ width: 16, height: 16, color: "#4f46e5" }} />} label="Certificate Holder" value={cert.studentName} large />
                )}
                <DetailRow icon={<Award style={{ width: 16, height: 16, color: "#4f46e5" }} />} label="Course" value={courseName} />
                {cert.certificateHeader && cert.certificateHeader !== courseName && (
                  <DetailRow icon={<Shield style={{ width: 16, height: 16, color: "#4f46e5" }} />} label="Certificate Type" value={cert.certificateHeader} />
                )}
                {formattedDate && (
                  <DetailRow icon={<Calendar style={{ width: 16, height: 16, color: "#4f46e5" }} />} label="Date Awarded" value={formattedDate} />
                )}
                {org && (
                  <DetailRow icon={<Building2 style={{ width: 16, height: 16, color: "#4f46e5" }} />} label="Issued By" value={org.name} />
                )}
                <DetailRow
                  icon={<Shield style={{ width: 16, height: 16, color: "#4f46e5" }} />}
                  label="Certificate ID"
                  value={certificateId || ""}
                  mono
                />
              </div>

              {/* Signatories */}
              {cert.signatories && cert.signatories.length > 0 && (
                <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #f3f4f6" }}>
                  <p style={{ margin: "0 0 10px", fontSize: 12, color: "#6b7280", textTransform: "uppercase", letterSpacing: 1 }}>Authorised by</p>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    {cert.signatories.map((s, i) => (
                      <div key={i}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>{s.name}</p>
                        <p style={{ margin: 0, fontSize: 12, color: "#6b7280" }}>{s.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Security notice */}
        <div style={{
          background: "white",
          borderRadius: 12,
          padding: "16px 20px",
          border: "1px solid #e5e7eb",
          display: "flex", alignItems: "flex-start", gap: 12,
        }}>
          <Shield style={{ width: 18, height: 18, color: "#4f46e5", flexShrink: 0, marginTop: 1 }} />
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#111827" }}>Verified by Certifyer</p>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#6b7280", lineHeight: 1.5 }}>
              This verification is served directly from Certifyer's secure database.
              The QR code on each certificate links uniquely to this page.
              If you have concerns about this certificate, contact the issuing organisation directly.
            </p>
          </div>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: 24, fontSize: 12, color: "#9ca3af" }}>
          Powered by{" "}
          <Link to="/" style={{ color: "#4f46e5", textDecoration: "none", fontWeight: 600 }}>
            Certifyer
          </Link>
          {" "}· Digital Certificate Platform
          {cert && (
            <>
              {" · "}
              <a
                href={`/certificate/${certificateId}`}
                style={{ color: "#4f46e5", textDecoration: "none" }}
              >
                View Certificate <ExternalLink style={{ width: 10, height: 10, display: "inline" }} />
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
  large,
  mono,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  large?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <div style={{ width: 28, height: 28, borderRadius: 6, background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
        {icon}
      </div>
      <div>
        <p style={{ margin: 0, fontSize: 11, color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</p>
        <p style={{
          margin: 0,
          fontSize: large ? 17 : 14,
          fontWeight: large ? 700 : 500,
          color: "#111827",
          fontFamily: mono ? "monospace" : undefined,
          letterSpacing: mono ? 0.5 : undefined,
          wordBreak: "break-all",
        }}>
          {value}
        </p>
      </div>
    </div>
  );
}
