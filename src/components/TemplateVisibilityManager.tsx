import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import {
  Eye,
  Globe,
  Building2,
  RefreshCw,
  Loader2,
  Settings,
  X,
  Search,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { templateApi } from "../utils/api";
import CertificateRenderer from "./CertificateRenderer";
import PreviewWrapper from "./PreviewWrapper";
import React from "react";

// Simple error boundary for preview rendering
class TemplateErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
  },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Template render error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center p-4 text-gray-500">
            <AlertCircle className="w-4 h-4 mr-2" />
            <span className="text-sm">Preview unavailable</span>
          </div>
        )
      );
    }
    return this.props.children;
  }
}

interface Template {
  id: string;
  name: string;
  description: string;
  type: "default" | "custom" | "premium";
  visibility_type?: "public" | "organization";
  organization_id?: string | null;
}

interface Organization {
  id: string;
  name: string;
}

interface TemplateVisibilityManagerProps {
  accessToken: string | null;
  organizations: Organization[];
}

export default function TemplateVisibilityManager({
  accessToken,
  organizations,
}: TemplateVisibilityManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);
  const [modalVisibility, setModalVisibility] = useState<
    "public" | "organization"
  >("public");
  const [selectedOrgIds, setSelectedOrgIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const loadTemplates = async () => {
    setLoading(true);
    try {
      // Load all templates without filtering
      const res = await templateApi.getAll();
      const allTemplates = res.templates || [];
      // Sort templates by numeric ID (template1 → template44, custom last)
      const getNum = (id: string) => { const m = id.match(/template(\d+)$/); return m ? parseInt(m[1], 10) : Infinity; };
      allTemplates.sort((a: any, b: any) => getNum(a.id) - getNum(b.id));
      setTemplates(allTemplates);
    } catch (error: any) {
      console.error("Failed to load templates:", error);
      toast.error(error?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const handleVisibilityUpdate = async (
    templateId: string,
    visibility_type: "public" | "organization",
    organization_id?: string,
  ) => {
    if (!accessToken) {
      toast.error("Unauthorized: Please sign in");
      return;
    }

    setSaving(templateId);
    try {
      await templateApi.updateVisibility(accessToken, templateId, {
        visibility_type,
        organization_id,
      });

      // Update local state
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === templateId
            ? {
                ...t,
                visibility_type,
                organization_id: organization_id || null,
              }
            : t,
        ),
      );

      toast.success(`Template visibility updated to ${visibility_type}`);
    } catch (error: any) {
      console.error("Failed to update visibility:", error);
      toast.error(error?.message || "Failed to update template visibility");
    } finally {
      setSaving(null);
    }
  };

  const openModal = (template: Template) => {
    setSelectedTemplate(template);
    setModalVisibility(template.visibility_type || "public");
    setSelectedOrgIds(
      template.organization_id ? [template.organization_id] : [],
    );
    setSearchQuery("");
    setShowModal(true);
  };

  const handleModalSave = async () => {
    if (!selectedTemplate || !accessToken) return;

    if (modalVisibility === "organization" && selectedOrgIds.length === 0) {
      toast.error("Please select at least one organization");
      return;
    }

    setSaving(selectedTemplate.id);

    try {
      if (modalVisibility === "public") {
        await handleVisibilityUpdate(selectedTemplate.id, "public");
      } else {
        // For now, we save one organization at a time
        // In the future, you might want to support multiple organizations per template
        await handleVisibilityUpdate(
          selectedTemplate.id,
          "organization",
          selectedOrgIds[0],
        );
      }

      setShowModal(false);
    } catch (error) {
      // Error already handled in handleVisibilityUpdate
    } finally {
      setSaving(null);
    }
  };

  const toggleOrgSelection = (orgId: string) => {
    setSelectedOrgIds((prev) => {
      if (prev.includes(orgId)) {
        return prev.filter((id) => id !== orgId);
      } else {
        return [...prev, orgId];
      }
    });
  };

  // Filter organizations based on search query
  const filteredOrganizations = organizations.filter(
    (org) =>
      org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      org.id.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getVisibilityBadge = (template: Template) => {
    if (template.visibility_type === "organization") {
      const org = organizations.find((o) => o.id === template.organization_id);
      return (
        <Badge variant="secondary" className="gap-1">
          <Building2 className="w-3 h-3" />
          {org?.name || "Unknown Org"}
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <Globe className="w-3 h-3" />
        Public
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Template Visibility Manager</CardTitle>
          <CardDescription>
            Configure which organizations can access each template
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Template Visibility Manager</CardTitle>
            <CardDescription>
              Configure which organizations can access each template
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={loadTemplates}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="relative border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Premium badge */}
                {template.type === "premium" && (
                  <div className="absolute top-2 left-2 z-10">
                    <Badge className="bg-gradient-to-r from-primary to-orange-600 text-white border-0 shadow-md">
                      Premium
                    </Badge>
                  </div>
                )}

                {/* Visibility badge - top right */}
                <div className="absolute top-2 right-2 z-10">
                  {getVisibilityBadge(template)}
                </div>

                {/* Preview area - Same style as TemplatesPage */}
                <div className="bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden">
                  <TemplateErrorBoundary>
                    <PreviewWrapper scale={0.4} origin="center" wrapperSize={2}>
                      <CertificateRenderer
                        templateId={template.id}
                        header="Certificate of Completion"
                        courseTitle="Sample Course"
                        description="For successfully completing the course"
                        date="22nd January 2025"
                        recipientName="John Doe"
                        isPreview={true}
                        mode="template-selection"
                        organizationName="Your Organization"
                      />
                    </PreviewWrapper>
                  </TemplateErrorBoundary>
                </div>

                {/* Info & actions - Same style as TemplatesPage */}
                <div className="p-4 space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="line-clamp-1 font-medium">
                        {template.id.match(/template(\d+)$/) 
                          ? `${template.id.match(/template(\d+)$/)![1]}: ${template.name}`
                          : template.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => openModal(template)}
                    disabled={saving === template.id}
                  >
                    {saving === template.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Settings className="w-4 h-4 mr-2" />
                        Configure Visibility
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full text-center py-8 text-gray-500">
                <Eye className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No templates found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal */}
      {showModal && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-lg font-semibold">
                  Configure Template Visibility
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplate.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowModal(false)}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Visibility Type Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Visibility Type</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setModalVisibility("public")}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                      modalVisibility === "public"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Globe
                      className={`w-5 h-5 ${modalVisibility === "public" ? "text-primary" : "text-gray-400"}`}
                    />
                    <div className="text-left">
                      <div className="font-medium text-sm">Public</div>
                      <div className="text-xs text-gray-500">
                        Visible to all users
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setModalVisibility("organization")}
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                      modalVisibility === "organization"
                        ? "border-primary bg-primary/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Building2
                      className={`w-5 h-5 ${modalVisibility === "organization" ? "text-primary" : "text-gray-400"}`}
                    />
                    <div className="text-left">
                      <div className="font-medium text-sm">Organization</div>
                      <div className="text-xs text-gray-500">
                        Restrict to specific orgs
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Organization Selection */}
              {modalVisibility === "organization" && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">
                    Select Organizations ({selectedOrgIds.length} selected)
                  </Label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search organizations..."
                      className="w-full p-3 border rounded-lg mb-2"
                    />
                    <div className="border rounded-lg divide-y max-h-[300px] overflow-y-auto">
                      {filteredOrganizations.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No organizations found
                        </div>
                      ) : (
                        filteredOrganizations.map((org) => (
                          <label
                            key={org.id}
                            className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={selectedOrgIds.includes(org.id)}
                              onChange={() => toggleOrgSelection(org.id)}
                              className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {org.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {org.id.slice(0, 8)}...
                              </div>
                            </div>
                            {selectedOrgIds.includes(org.id) && (
                              <Badge variant="secondary" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </label>
                        ))
                      )}
                    </div>
                    {selectedOrgIds.length > 0 && (
                      <p className="text-xs text-gray-500">
                        Note: Currently, templates can only be assigned to one
                        organization at a time. The first selected organization
                        will be used.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <Button
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={saving === selectedTemplate.id}
              >
                Cancel
              </Button>
              <Button
                onClick={handleModalSave}
                disabled={saving === selectedTemplate.id}
              >
                {saving === selectedTemplate.id ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}