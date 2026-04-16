import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { FileText, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { invoiceApi, formatKobo } from "../utils/monetizationApi";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) { setError("No invoice ID provided."); setLoading(false); return; }
    invoiceApi.getById(id)
      .then(r => setInvoice(r.invoice))
      .catch(e => setError(e.message || "Invoice not found"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
    </div>
  );

  if (error || !invoice) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <p className="text-gray-500">{error || "Invoice not found."}</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-orange-500 hover:underline">Go back</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <p className="font-bold text-gray-900">Invoice</p>
              <p className="text-xs text-gray-400 font-mono">{invoice.id}</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> {invoice.status === "paid" ? "Paid" : invoice.status}
          </span>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Product</p>
            <p className="font-semibold text-gray-900">{invoice.productTitle}</p>
            <p className="text-xs text-gray-400 capitalize">{invoice.type || "certificate"}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Buyer</p>
              <p className="text-sm font-medium text-gray-900">{invoice.buyerName}</p>
              <p className="text-xs text-gray-500">{invoice.buyerEmail}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Date</p>
              <p className="text-sm font-medium text-gray-900">{new Date(invoice.issuedAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">{new Date(invoice.issuedAt).toLocaleTimeString()}</p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="text-gray-900">{formatKobo(invoice.amountTotal, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Platform fee</span>
              <span className="text-gray-500">{formatKobo(invoice.platformFee, invoice.currency)}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-2">
              <span className="text-gray-900">Total paid</span>
              <span className="text-gray-900">{formatKobo(invoice.amountTotal, invoice.currency)}</span>
            </div>
          </div>

          {invoice.reference && (
            <p className="text-xs text-gray-400 font-mono">Ref: {invoice.reference}</p>
          )}
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700 py-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go back
          </button>
        </div>
      </div>
    </div>
  );
}
