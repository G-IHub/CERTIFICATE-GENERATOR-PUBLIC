import React, { useState, useEffect } from "react";
import { useParams } from "react-router";
import {
  FileText,
  Video,
  Package,
  Download,
  ExternalLink,
  Award,
  AlertCircle,
  Mail,
  CheckCircle,
  Lock,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

interface AccessData {
  purchase: {
    reference: string;
    productId: string;
    buyerName: string;
    paidAt: string;
  };
  product: {
    id: string;
    title: string;
    type: "pdf" | "video" | "bundle";
    description: string;
  };
  org: { name: string; logo?: string } | null;
  files: { name: string; size?: number; url: string }[];
  links: { label: string; url: string }[];
  certificate: any | null;
}

export default function ProductAccessPage() {
  const { reference } = useParams<{ reference: string }>();

  const [email, setEmail] = useState("");
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [accessData, setAccessData] = useState<AccessData | null>(null);
  const [error, setError] = useState("");

  // Auto-verify payment on load, then show email gate
  useEffect(() => {
    if (!reference) return;
    // Try to auto-verify the Paystack payment (in case user landed here from callback)
    const autoVerify = async () => {
      try {
        await fetch(`${API_BASE}/digital-products/purchase/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${publicAnonKey}` },
          body: JSON.stringify({ reference }),
        });
      } catch (_e) { /* non-blocking */ }
    };
    autoVerify();
  }, [reference]);

  const handleEmailVerify = async () => {
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!reference) return;
    setVerifying(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/digital-products/purchase/${reference}/access?email=${encodeURIComponent(email.trim())}`,
        { headers: { Authorization: `Bearer ${publicAnonKey}` } },
      );
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Could not verify access");
      }
      const data = await res.json();
      setAccessData(data);
      setVerified(true);
    } catch (e: any) {
      setError(e.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  // Email gate screen
  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-7 h-7 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Access Your Purchase</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enter the email you used during checkout to access your content.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailVerify()}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              onClick={handleEmailVerify}
              disabled={verifying}
              className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            >
              {verifying ? "Verifying…" : "Access My Content"}
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center mt-6">
            Bookmark or save this page URL — you can re-access your purchase anytime with your email.
          </p>
        </div>
      </div>
    );
  }

  // Access content screen
  if (!accessData) return null;
  const { product, org, files, links, certificate } = accessData;

  const typeIcon = {
    pdf: FileText,
    video: Video,
    bundle: Package,
  }[product.type] || Package;

  const TypeIcon = typeIcon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start gap-4">
            {org?.logo ? (
              <img src={org.logo} alt={org.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TypeIcon className="w-6 h-6 text-indigo-600" />
              </div>
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Payment Confirmed</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">{product.title}</h1>
              {org && <p className="text-sm text-gray-500 mt-0.5">by {org.name}</p>}
            </div>
          </div>
          {product.description && (
            <p className="text-sm text-gray-500 mt-4 border-t pt-4">{product.description}</p>
          )}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            Save this page URL — you can re-access your purchase anytime by returning here and entering your email.
          </div>
        </div>

        {/* Files section */}
        {files.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Downloadable Files
            </h2>
            <div className="space-y-2">
              {files.map((f, i) => (
                <a
                  key={i}
                  href={f.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{f.name}</p>
                      {f.size !== undefined && (
                        <p className="text-xs text-gray-500">{(f.size / 1024).toFixed(1)} KB</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-blue-600 text-xs font-medium opacity-80 group-hover:opacity-100">
                    <Download className="w-4 h-4" />
                    Download
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Links section */}
        {links.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-600" />
              Course Links
            </h2>
            <div className="space-y-2">
              {links.map((l, i) => (
                <a
                  key={i}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <Video className="w-5 h-5 text-purple-600" />
                    <p className="text-sm font-medium text-gray-900">{l.label || `Link ${i + 1}`}</p>
                  </div>
                  <div className="flex items-center gap-1 text-purple-600 text-xs font-medium opacity-80 group-hover:opacity-100">
                    <ExternalLink className="w-4 h-4" />
                    Access
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Certificate section */}
        {certificate && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Your Certificate
            </h2>
            <div className="p-4 bg-yellow-50 rounded-lg text-center">
              <Award className="w-10 h-10 text-yellow-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900 mb-1">
                Certificate of Completion
              </p>
              <p className="text-xs text-gray-500">
                Issued to {accessData.purchase.buyerName}
              </p>
              {certificate.id && (
                <a
                  href={`/#/certificate/${certificate.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-yellow-700 hover:underline"
                >
                  <ExternalLink className="w-3 h-3" />
                  View Certificate
                </a>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pb-4">
          Powered by Certifyer
        </p>
      </div>
    </div>
  );
}
