import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "./ui/card";
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
  FileText,
  Video,
  Package,
  Upload,
  X,
  CheckCircle,
  Globe,
  AlertCircle,
  Link as LinkIcon,
  Award,
} from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";

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
  pdf: {
    label: "PDF / File",
    description: "Sell downloadable files like PDFs, ZIPs, docs",
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    borderColor: "border-blue-500",
    bgTint: "bg-blue-50",
    textColor: "text-blue-700",
    headerBg: "bg-blue-600",
    badgeClass: "bg-blue-100 text-blue-700",
  },
  video: {
    label: "Video Course",
    description: "Share video links from YouTube, Vimeo, Loom, etc.",
    icon: Video,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    borderColor: "border-purple-500",
    bgTint: "bg-purple-50",
    textColor: "text-purple-700",
    headerBg: "bg-purple-600",
    badgeClass: "bg-purple-100 text-purple-700",
  },
  bundle: {
    label: "Bundle Package",
    description: "Combine files and links into one complete package",
    icon: Package,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    borderColor: "border-orange-500",
    bgTint: "bg-orange-50",
    textColor: "text-orange-700",
    headerBg: "bg-orange-600",
    badgeClass: "bg-orange-100 text-orange-700",
  },
} as const;

function nairaDisplay(kobo: number) {
  return `₦${(kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}
function dollarDisplay(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}
function fileSizeDisplay(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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
    if (!file || !organizationId || !accessToken) return;
    setUploadingFile(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("orgId", organizationId);
      const res = await fetch(`${API_BASE}/digital-products/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` }, // NO Content-Type for FormData
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }
      const data = await res.json();
      setFormFiles((prev) => [...prev, { name: data.name, storagePath: data.storagePath, size: data.size }]);
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
  const typeMeta = TYPE_META[formType];

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
                    <Badge className={`text-[10px] shrink-0 ${meta.badgeClass}`}>
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

            {/* Scrollable form body */}
            <div className="overflow-y-auto max-h-[72vh]">

              {/* ── Basic Info section ── */}
              <div className="px-6 py-5 space-y-4" style={{ background: "#f9fafb" }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Basic Info</p>

                <div>
                  <Label htmlFor="dp-title">Title <span className="text-red-500">*</span></Label>
                  <Input
                    id="dp-title"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Advanced Python Course"
                    className="mt-1 bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="dp-desc">Description</Label>
                  <p className="text-xs text-gray-400 mt-0.5 mb-1">Tell buyers what they'll get</p>
                  <Textarea
                    id="dp-desc"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="What buyers will get…"
                    className="bg-white"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="dp-thumb">Thumbnail URL <span className="text-gray-400 font-normal">(optional)</span></Label>
                  <Input
                    id="dp-thumb"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    placeholder="https://..."
                    className="mt-1 bg-white"
                  />
                </div>

                {/* Product type */}
                <div>
                  <Label className="mb-2 block">Product Type <span className="text-red-500">*</span></Label>
                  <div className="grid grid-cols-3 gap-3">
                    {(["pdf", "video", "bundle"] as const).map((t) => {
                      const meta = TYPE_META[t];
                      const Icon = meta.icon;
                      const selected = formType === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setFormType(t)}
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm transition-all ${
                            selected
                              ? `${meta.borderColor} ${meta.bgTint} ${meta.textColor}`
                              : "border-gray-200 hover:border-gray-300 bg-white text-gray-600"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected ? meta.iconBg : "bg-gray-100"}`}>
                            <Icon className={`w-5 h-5 ${selected ? meta.iconColor : "text-gray-500"}`} />
                          </div>
                          <span className="font-semibold text-xs text-center leading-tight">{meta.label}</span>
                          <span className="text-[10px] text-center leading-tight opacity-70">{meta.description}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Pricing section ── */}
              <div className="px-6 py-5 space-y-4 border-t" style={{ background: "#f9fafb" }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Pricing</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dp-ngn">Price in Naira (₦)</Label>
                    <p className="text-xs text-gray-400 mb-1">Enter amount in naira (e.g. 5000)</p>
                    <Input
                      id="dp-ngn"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formPriceNGN}
                      onChange={(e) => setFormPriceNGN(e.target.value)}
                      placeholder="0.00"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dp-usd">Price in Dollars ($)</Label>
                    <p className="text-xs text-gray-400 mb-1">Enter amount in dollars (e.g. 29.99)</p>
                    <Input
                      id="dp-usd"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formPriceUSD}
                      onChange={(e) => setFormPriceUSD(e.target.value)}
                      placeholder="0.00"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* ── Content section ── */}
              <div className="border-t">
                {/* Colored header bar */}
                <div className={`px-6 py-3 ${typeMeta.headerBg}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white">Content</p>
                </div>
                <div className="px-6 py-5 space-y-5 bg-white">

                  {/* File upload — for pdf and bundle */}
                  {(formType === "pdf" || formType === "bundle") && (
                    <div>
                      <Label className="mb-1 block">Files</Label>
                      <p className="text-xs text-gray-400 mb-2">Upload PDFs, ZIPs, docs, or other files. You can add multiple.</p>

                      {/* Uploaded file cards */}
                      {formFiles.length > 0 && (
                        <ul className="mb-3 space-y-2">
                          {formFiles.map((f, i) => (
                            <li key={i} className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5">
                              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 ${typeMeta.iconBg}`}>
                                <FileText className={`w-4 h-4 ${typeMeta.iconColor}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{f.name}</p>
                                <p className="text-xs text-gray-400">{fileSizeDisplay(f.size)}</p>
                              </div>
                              <button
                                onClick={() => removeFile(i)}
                                className="text-gray-400 hover:text-red-500 transition-colors shrink-0"
                                title="Remove file"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Upload zone */}
                      <div
                        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${
                          uploadingFile ? "border-gray-200 bg-gray-50" : `hover:${typeMeta.borderColor} border-gray-300 hover:bg-gray-50`
                        }`}
                        onClick={() => !uploadingFile && fileInputRef.current?.click()}
                      >
                        {uploadingFile ? (
                          <div className="flex items-center justify-center gap-2 text-gray-500">
                            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm">Uploading…</p>
                          </div>
                        ) : (
                          <>
                            <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-sm text-gray-600 font-medium">
                              {formFiles.length > 0 ? "Add another file" : "Upload a file"}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">PDF, ZIP, DOCX, XLSX, PPTX, MP4, MOV</p>
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
                    </div>
                  )}

                  {/* Links — for video and bundle */}
                  {(formType === "video" || formType === "bundle") && (
                    <div>
                      <Label className="mb-1 block">Links</Label>
                      <p className="text-xs text-gray-400 mb-2">Add links to videos or resources buyers will receive.</p>
                      <div className="space-y-3">
                        {formLinks.map((l, i) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex gap-2 items-start">
                              <div className={`w-8 h-8 rounded flex items-center justify-center shrink-0 mt-1 ${typeMeta.iconBg}`}>
                                <LinkIcon className={`w-4 h-4 ${typeMeta.iconColor}`} />
                              </div>
                              <div className="flex-1 grid grid-cols-2 gap-2">
                                <Input
                                  placeholder="Label (e.g. Module 1)"
                                  value={l.label}
                                  onChange={(e) => updateLink(i, "label", e.target.value)}
                                />
                                <Input
                                  placeholder="URL (https://...)"
                                  value={l.url}
                                  onChange={(e) => updateLink(i, "url", e.target.value)}
                                />
                              </div>
                              <button
                                onClick={() => removeLink(i)}
                                className="text-gray-400 hover:text-red-500 transition-colors mt-2 shrink-0"
                                title="Remove link"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-400 pl-10">
                              Supports: YouTube, Vimeo, Google Drive, Loom, Notion, Dropbox, and more
                            </p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={addLink}
                        className={`mt-3 text-sm font-medium flex items-center gap-1 ${typeMeta.textColor} hover:opacity-80 transition-opacity`}
                      >
                        <Plus className="w-3 h-3" />
                        Add another link
                      </button>
                    </div>
                  )}

                  {/* Placeholder if no content inputs for this type */}
                  {formType === "pdf" && formFiles.length === 0 && (
                    <p className="text-xs text-gray-400 italic">Upload at least one file for buyers to download.</p>
                  )}
                </div>
              </div>

              {/* ── Certificate section ── */}
              <div className="border-t">
                <div className="px-6 py-3 bg-indigo-50">
                  <p className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Certificate</p>
                </div>
                <div className="px-6 py-5 bg-white">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-indigo-600 shrink-0"
                      checked={formIncludeCert}
                      onChange={(e) => setFormIncludeCert(e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-indigo-500" />
                        Include Certificate on Purchase
                      </span>
                      <p className="text-xs text-gray-400 mt-0.5">Buyers automatically receive a certificate when they purchase this product.</p>
                    </div>
                  </label>
                  {formIncludeCert && (
                    <div className="mt-4 pl-7">
                      <Label htmlFor="dp-cert">Certificate Template</Label>
                      <select
                        id="dp-cert"
                        value={formCertTemplate}
                        onChange={(e) => setFormCertTemplate(e.target.value)}
                        className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                      >
                        <option value="">— Select template —</option>
                        {templates.map((t) => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                      {templates.length === 0 && (
                        <p className="text-xs text-amber-600 mt-1.5">No templates found. Create a certificate template first.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ── Status section ── */}
              <div className="px-6 py-5 border-t" style={{ background: "#f9fafb" }}>
                <Label className="mb-2 block">Status</Label>
                <p className="text-xs text-gray-400 mb-3">Draft products are not visible in your store.</p>
                <div className="flex gap-3">
                  {(["draft", "published"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setFormStatus(s)}
                      className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors ${
                        formStatus === s
                          ? s === "published"
                            ? "bg-green-100 border-green-500 text-green-700"
                            : "bg-gray-100 border-gray-400 text-gray-700"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {s === "published" ? "Published" : "Draft"}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-6 py-4 border-t bg-white">
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
