import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import {
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Video,
  Package,
  Upload,
  X,
  ExternalLink,
  CheckCircle,
  Globe,
  AlertCircle,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { supabase } from "../utils/supabase";

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

// ---- types ----
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

interface DigitalProduct {
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
  createdAt: string;
  updatedAt: string;
}

interface Props {
  organizationId: string | undefined;
  accessToken: string | null;
}

const TYPE_META = {
  pdf: { label: "PDF / File", icon: FileText, color: "bg-blue-100 text-blue-700" },
  video: { label: "Video Course", icon: Video, color: "bg-purple-100 text-purple-700" },
  bundle: { label: "Bundle Package", icon: Package, color: "bg-orange-100 text-orange-700" },
} as const;

function nairaDisplay(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}
function dollarDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function DigitalProductsPage({ organizationId, accessToken }: Props) {
  const [products, setProducts] = useState<DigitalProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<DigitalProduct | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [templates, setTemplates] = useState<{ id: string; name: string }[]>([]);

  // Form state
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formType, setFormType] = useState<"pdf" | "video" | "bundle">("pdf");
  const [formPriceNGN, setFormPriceNGN] = useState("");
  const [formPriceUSD, setFormPriceUSD] = useState("");
  const [formFiles, setFormFiles] = useState<ProductFile[]>([]);
  const [formLinks, setFormLinks] = useState<ProductLink[]>([{ label: "", url: "", encrypted: true }]);
  const [formIncludeCert, setFormIncludeCert] = useState(false);
  const [formCertTemplate, setFormCertTemplate] = useState("");
  const [formStatus, setFormStatus] = useState<"draft" | "published">("draft");
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = () => ({
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken || publicAnonKey}`,
  });

  // Fetch products
  const loadProducts = async () => {
    if (!organizationId || !accessToken) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/digital-products?orgId=${organizationId}`, {
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e: any) {
      toast.error(e.message || "Could not load digital products");
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates for cert selector
  const loadTemplates = async () => {
    if (!organizationId || !accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/templates?orgId=${organizationId}`, {
        headers: authHeaders(),
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates((data.templates || []).map((t: any) => ({ id: t.id, name: t.name })));
      }
    } catch (_e) { /* non-critical */ }
  };

  useEffect(() => {
    loadProducts();
    loadTemplates();
  }, [organizationId, accessToken]);

  const resetForm = () => {
    setFormTitle("");
    setFormDescription("");
    setFormThumbnail("");
    setFormType("pdf");
    setFormPriceNGN("");
    setFormPriceUSD("");
    setFormFiles([]);
    setFormLinks([{ label: "", url: "", encrypted: true }]);
    setFormIncludeCert(false);
    setFormCertTemplate("");
    setFormStatus("draft");
    setEditingProduct(null);
  };

  const openCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (p: DigitalProduct) => {
    setEditingProduct(p);
    setFormTitle(p.title);
    setFormDescription(p.description);
    setFormThumbnail(p.thumbnailUrl || "");
    setFormType(p.type);
    setFormPriceNGN(p.priceNGN ? (p.priceNGN / 100).toString() : "");
    setFormPriceUSD(p.priceUSD ? (p.priceUSD / 100).toString() : "");
    setFormFiles(p.files || []);
    setFormLinks(p.links?.length ? p.links : [{ label: "", url: "", encrypted: true }]);
    setFormIncludeCert(!!p.certificateTemplateId);
    setFormCertTemplate(p.certificateTemplateId || "");
    setFormStatus(p.status);
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !organizationId) return;

    setUploadingFile(true);
    try {
      const ext = file.name.split(".").pop() || "bin";
      const storagePath = `${organizationId}/${Date.now()}_${file.name.replace(/\s+/g, "_")}`;

      const { error } = await supabase.storage
        .from("digital-products")
        .upload(storagePath, file, { upsert: false });

      if (error) throw new Error(error.message);

      setFormFiles((prev) => [...prev, { name: file.name, storagePath, size: file.size }]);
      toast.success(`${file.name} uploaded`);
    } catch (e: any) {
      toast.error(e.message || "File upload failed");
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setFormFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const addLink = () => {
    setFormLinks((prev) => [...prev, { label: "", url: "", encrypted: true }]);
  };

  const updateLink = (index: number, field: "label" | "url", value: string) => {
    setFormLinks((prev) => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const removeLink = (index: number) => {
    setFormLinks((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!organizationId || !accessToken) return;
    if (!formTitle.trim()) { toast.error("Title is required"); return; }

    setSaving(true);
    try {
      const validLinks = formLinks.filter((l) => l.label.trim() && l.url.trim());
      const payload = {
        orgId: organizationId,
        title: formTitle.trim(),
        description: formDescription.trim(),
        thumbnailUrl: formThumbnail.trim() || undefined,
        type: formType,
        priceNGN: formPriceNGN ? Math.round(parseFloat(formPriceNGN) * 100) : 0,
        priceUSD: formPriceUSD ? Math.round(parseFloat(formPriceUSD) * 100) : 0,
        files: formType !== "video" ? formFiles : [],
        links: formType !== "pdf" ? validLinks : [],
        certificateTemplateId: formIncludeCert && formCertTemplate ? formCertTemplate : undefined,
        status: formStatus,
      };

      let res: Response;
      if (editingProduct) {
        res = await fetch(`${API_BASE}/digital-products/${editingProduct.id}`, {
          method: "PUT",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_BASE}/digital-products`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Save failed");
      }

      toast.success(editingProduct ? "Product updated" : "Product created");
      setShowForm(false);
      resetForm();
      loadProducts();
    } catch (e: any) {
      toast.error(e.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    if (!organizationId || !accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/digital-products/${productId}?orgId=${organizationId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error("Delete failed");
      toast.success("Product deleted");
      setConfirmDelete(null);
      loadProducts();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete product");
    }
  };

  const handleTogglePublish = async (p: DigitalProduct) => {
    if (!organizationId || !accessToken) return;
    try {
      const res = await fetch(`${API_BASE}/digital-products/${p.id}/publish`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ orgId: organizationId }),
      });
      if (!res.ok) throw new Error("Failed to toggle status");
      const data = await res.json();
      setProducts((prev) => prev.map((item) => (item.id === p.id ? data.product : item)));
      toast.success(data.product.status === "published" ? "Product published" : "Product set to draft");
    } catch (e: any) {
      toast.error(e.message || "Failed to update status");
    }
  };

  const totalPublished = products.filter((p) => p.status === "published").length;

  if (!organizationId) {
    return (
      <div className="px-4 md:px-8 py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              <p>You need an organization to manage digital products.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            Digital Products
          </h1>
          <p className="text-sm text-gray-500 mt-1">Sell PDFs, video courses, and bundles</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          New Product
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length },
          { label: "Published", value: totalPublished },
          { label: "Total Sales", value: "—" },
          { label: "Revenue", value: "—" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Product list */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading products…</div>
      ) : products.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No digital products yet.</p>
            <Button onClick={openCreate} variant="outline" className="mt-4">
              <Plus className="w-4 h-4 mr-2" />
              Create your first product
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => {
            const meta = TYPE_META[p.type];
            const Icon = meta.icon;
            return (
              <Card key={p.id} className="flex flex-col">
                {p.thumbnailUrl && (
                  <div className="h-36 overflow-hidden rounded-t-lg">
                    <img src={p.thumbnailUrl} alt={p.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardContent className="flex-1 pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight">{p.title}</h3>
                    <Badge className={`text-[10px] shrink-0 ${meta.color}`}>
                      <Icon className="w-3 h-3 mr-1" />
                      {meta.label}
                    </Badge>
                  </div>

                  {p.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                  )}

                  <div className="flex gap-3 text-sm font-medium text-gray-700">
                    {p.priceNGN > 0 && <span>{nairaDisplay(p.priceNGN)}</span>}
                    {p.priceUSD > 0 && <span>{dollarDisplay(p.priceUSD)}</span>}
                    {!p.priceNGN && !p.priceUSD && <span className="text-gray-400">No price set</span>}
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge
                      className={p.status === "published"
                        ? "bg-green-100 text-green-700 text-[10px]"
                        : "bg-gray-100 text-gray-600 text-[10px]"}
                    >
                      {p.status === "published" ? (
                        <><CheckCircle className="w-3 h-3 mr-1" />Published</>
                      ) : "Draft"}
                    </Badge>

                    {p.status === "published" && (
                      <a
                        href={`/#/store/${p.orgId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 flex items-center gap-1 hover:underline"
                      >
                        <Globe className="w-3 h-3" />
                        View Store
                      </a>
                    )}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => openEdit(p)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`flex-1 text-xs ${p.status === "published" ? "text-amber-600 border-amber-300" : "text-green-600 border-green-300"}`}
                      onClick={() => handleTogglePublish(p)}
                    >
                      {p.status === "published" ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => setConfirmDelete(p.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-4">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white" onClick={() => handleDelete(confirmDelete)}>
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-start justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl my-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                {editingProduct ? "Edit Product" : "New Digital Product"}
              </h2>
              <button onClick={() => { setShowForm(false); resetForm(); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-5 overflow-y-auto max-h-[70vh]">
              {/* Title */}
              <div>
                <Label htmlFor="dp-title">Title *</Label>
                <Input
                  id="dp-title"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. Advanced Python Course"
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="dp-desc">Description</Label>
                <Textarea
                  id="dp-desc"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="What buyers will get…"
                  className="mt-1"
                  rows={3}
                />
              </div>

              {/* Thumbnail URL */}
              <div>
                <Label htmlFor="dp-thumb">Thumbnail URL (optional)</Label>
                <Input
                  id="dp-thumb"
                  value={formThumbnail}
                  onChange={(e) => setFormThumbnail(e.target.value)}
                  placeholder="https://..."
                  className="mt-1"
                />
              </div>

              {/* Product type */}
              <div>
                <Label className="mb-2 block">Product Type *</Label>
                <div className="grid grid-cols-3 gap-3">
                  {(["pdf", "video", "bundle"] as const).map((t) => {
                    const meta = TYPE_META[t];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setFormType(t)}
                        className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 text-sm transition-colors ${
                          formType === t
                            ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-600"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium text-center text-xs leading-tight">{meta.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prices */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dp-ngn">Price in Naira (₦)</Label>
                  <Input
                    id="dp-ngn"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPriceNGN}
                    onChange={(e) => setFormPriceNGN(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="dp-usd">Price in Dollars ($)</Label>
                  <Input
                    id="dp-usd"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formPriceUSD}
                    onChange={(e) => setFormPriceUSD(e.target.value)}
                    placeholder="0.00"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* File upload — for pdf and bundle */}
              {(formType === "pdf" || formType === "bundle") && (
                <div>
                  <Label className="mb-2 block">Files</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-400 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadingFile ? (
                      <p className="text-sm text-gray-500">Uploading…</p>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Click to upload a file (PDF, ZIP, etc.)</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.zip,.docx,.xlsx,.pptx,.mp4,.mov"
                  />

                  {formFiles.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {formFiles.map((f, i) => (
                        <li key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-1.5">
                          <span className="truncate text-gray-700">{f.name} <span className="text-gray-400">({(f.size / 1024).toFixed(1)} KB)</span></span>
                          <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 ml-2">
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Links — for video and bundle */}
              {(formType === "video" || formType === "bundle") && (
                <div>
                  <Label className="mb-2 block">Links</Label>
                  <div className="space-y-2">
                    {formLinks.map((l, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          placeholder="Label (e.g. Module 1)"
                          value={l.label}
                          onChange={(e) => updateLink(i, "label", e.target.value)}
                          className="flex-1"
                        />
                        <Input
                          placeholder="URL (https://...)"
                          value={l.url}
                          onChange={(e) => updateLink(i, "url", e.target.value)}
                          className="flex-2"
                        />
                        <button onClick={() => removeLink(i)} className="text-gray-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addLink}
                    className="mt-2 text-sm text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add another link
                  </button>
                </div>
              )}

              {/* Bundle: Include certificate */}
              {formType === "bundle" && (
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-indigo-600"
                      checked={formIncludeCert}
                      onChange={(e) => setFormIncludeCert(e.target.checked)}
                    />
                    <span className="text-sm font-medium text-gray-700">Include Certificate on Purchase</span>
                  </label>
                  {formIncludeCert && (
                    <div className="mt-2">
                      <Label htmlFor="dp-cert">Certificate Template</Label>
                      <select
                        id="dp-cert"
                        value={formCertTemplate}
                        onChange={(e) => setFormCertTemplate(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="">— Select template —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              {/* Status toggle */}
              <div>
                <Label className="mb-2 block">Status</Label>
                <div className="flex gap-3">
                  {(["draft", "published"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormStatus(s)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        formStatus === s
                          ? s === "published"
                            ? "bg-green-100 border-green-500 text-green-700"
                            : "bg-gray-100 border-gray-400 text-gray-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300"
                      }`}
                    >
                      {s === "published" ? "Published" : "Draft"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "Saving…" : editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
