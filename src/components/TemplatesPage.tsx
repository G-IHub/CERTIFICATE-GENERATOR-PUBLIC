import React, { useEffect, useState } from "react";
import {
  Loader2,
  Crown,
  Eye,
  Check,
  AlertCircle,
  Lock,
  RefreshCw,
} from "lucide-react";
import TemplatesSkeleton from "./skeletons/TemplatesSkeletons";
import { templateApi } from "../utils/api";
import { toast } from "sonner";
import { revalidateOrgPremium, isOrgPremium } from "../utils/subscriptionUtils";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "./ui/badge";
import CertificateRenderer from "./CertificateRenderer";
import PreviewWrapper from "./PreviewWrapper";
import type { Organization } from "../App";
import { projectId, publicAnonKey } from "../utils/supabase/info";

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
  config: any;
  type: "default" | "custom" | "premium";
  createdBy?: string;
  createdAt?: string;
  isDefault?: boolean;
}

interface TemplatesPageProps {
  organization: Organization;
  accessToken?: string | null;
  onSelectTemplate?: (template: Template) => void;
  showBuilderButton?: boolean;
  isPremiumUser?: boolean;
}

export default function TemplatesPage({
  organization,
  accessToken,
  onSelectTemplate,
  showBuilderButton = true,
  isPremiumUser = false,
}: TemplatesPageProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Template | null>(null);
  const [isReseeding, setIsReseeding] = useState(false);

  const loadTemplates = async () => {
    setLoading(true);
    try {
      const res = await templateApi.getAll();
      const loaded = res.templates || [];
      // Debug: log template ids/types to help trace preview issues
      try {
        // eslint-disable-next-line no-console
        console.log(
          "TemplatesPage: loaded templates",
          loaded.map((t: any) => ({ id: t.id, type: t.type }))
        );
      } catch (e) {}
      setTemplates(loaded);
    } catch (e: any) {
      console.error("Failed to load templates", e);
      toast.error(e?.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const navigate = useNavigate();

  const handleReseed = async () => {
    setIsReseeding(true);
    try {
      // Try primary functions endpoint (project .supabase.co/functions/v1)
      const primaryUrl = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/templates/force-reseed`;
      // Fallback: functions subdomain
      const fallbackUrl = `https://${projectId}.functions.supabase.co/make-server-a611b057/templates/force-reseed`;

      const doFetch = async (url: string) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${publicAnonKey}`,
              "Content-Type": "application/json",
            },
          });
          return res;
        } catch (err) {
          // Network-level failure (CORS, DNS, connectivity)
          console.error("Network error calling function:", url, err);
          throw err;
        }
      };

      let response;
      try {
        response = await doFetch(primaryUrl);
      } catch (err) {
        // Try fallback URL once
        try {
          response = await doFetch(fallbackUrl);
        } catch (err2) {
          throw err2;
        }
      }

      // Safely parse response body (handle non-JSON responses)
      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        const text = await response.text().catch(() => "");
        data = { message: text || "(no body)" };
      }

      if (response.ok) {
        toast.success(
          `✅ ${data.message || "Templates reseeded successfully!"} (${
            data.count || "?"
          } templates)`
        );
        // Reload templates after reseeding
        await loadTemplates();
      } else {
        console.error("Reseed failed", response.status, data);
        toast.error(
          data.error ||
            data.message ||
            `Failed to reseed (status ${response.status})`
        );
      }
    } catch (error) {
      console.error("Error reseeding templates (caught):", error);
      // Show user-friendly guidance
      toast.error(
        "Reseed failed — check browser DevTools Network tab or run the reseed command manually. See console for details."
      );
    } finally {
      setIsReseeding(false);
    }
  };

  const handleSelect = async (template: Template) => {
    // Debug trace: verify selection handler is invoked
    // eslint-disable-next-line no-console
    console.debug(
      "TemplatesPage: handleSelect called",
      template?.id,
      template?.name
    );
    const premium = template.type === "premium";
    if (premium && !isOrgPremium(organization)) {
      // revalidate with backend to avoid stale local state
      const ok = await revalidateOrgPremium(
        organization.id,
        accessToken || undefined
      );
      if (!ok) {
        toast.error("This template requires a Premium plan. Please upgrade.");
        return;
      }
    }

    onSelectTemplate?.(template);
    toast.success(`Selected template: ${template.name}`);
  };

  const freeTemplates = templates.filter(
    (t) => t.type !== "premium" && (t.type === "default" || t.isDefault)
  );
  const premiumTemplates = templates.filter((t) => t.type === "premium");

  if (loading) {
    return <TemplatesSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Templates</h2>
          <p className="text-sm text-gray-600">
            {`${freeTemplates.length} free`}
            {premiumTemplates.length > 0 && (
              <>
                {` + ${premiumTemplates.length} premium`}
                {!isPremiumUser && (
                  <span className="text-xs text-gray-500"> (locked)</span>
                )}
              </>
            )}{" "}
            {`templates for ${organization?.name || "your organization"}`}
          </p>
        </div>

        {/* Reseed Templates Button removed per user request. */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div
            key={template.id}
            className="relative border rounded-lg overflow-hidden"
          >
            {/* Premium badge */}
            {template.type === "premium" && (
              <div className="absolute top-2 left-2 z-10">
                <Badge className="bg-gradient-to-r from-primary to-orange-600 text-white border-0 shadow-md">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              </div>
            )}

            {/* Preview area */}
            <div
              className={`bg-gray-50 p-4 aspect-[4/3] flex items-center justify-center overflow-hidden`}
            >
              <TemplateErrorBoundary>
                <PreviewWrapper scale={0.4} origin="center" wrapperSize={2}>
                  <CertificateRenderer
                    templateId={template.id}
                    header="Certificate of Completion"
                    courseTitle="Sample Course"
                    description="For successfully completing the program"
                    date="22nd January 2025"
                    recipientName="John Doe"
                    isPreview={true}
                    mode="template-selection"
                    organizationName={organization?.name}
                    organizationLogo={organization?.logo}
                    // Only pass customTemplateConfig for user-created custom templates.
                    // Some template records may include a config object even for defaults;
                    // treating those as custom causes the generic renderer to be used for all templates.
                    customTemplateConfig={
                      template.type === "custom" ? template.config : undefined
                    }
                  />
                </PreviewWrapper>
              </TemplateErrorBoundary>
            </div>

            {/* Info & actions */}
            <div className="p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h4 className="line-clamp-1">{template.name}</h4>
                  {template.isDefault && template.type !== "premium" && (
                    <Badge variant="secondary" className="text-xs">
                      Free
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {template.description}
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Debug trace: preview button clicked
                    // eslint-disable-next-line no-console
                    console.debug(
                      "TemplatesPage: Preview clicked",
                      template?.id,
                      template?.name
                    );
                    setPreview(template);
                  }}
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>

                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Debug trace: use template (grid) clicked
                    // eslint-disable-next-line no-console
                    console.debug(
                      "TemplatesPage: Use (grid) clicked",
                      template?.id,
                      template?.name
                    );
                    if (
                      template.type === "premium" &&
                      !isOrgPremium(organization)
                    ) {
                      toast.error(
                        "This is a premium template. Upgrade to use premium templates."
                      );
                      navigate("/billing");
                      return;
                    }
                    handleSelect(template);
                  }}
                  disabled={
                    template.type === "premium" && !isOrgPremium(organization)
                  }
                >
                  {template.type === "premium" &&
                  !isOrgPremium(organization) ? (
                    <>
                      <Crown className="w-4 h-4" />
                      Upgrade
                    </>
                  ) : (
                    "Use Template"
                  )}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-auto">
            <div className="border-b border-gray-200 p-4 flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2">
                  {preview.name}
                  {preview.type === "premium" && (
                    <Badge className="bg-gradient-to-r from-primary to-orange-600 text-white border-0">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </h3>
                <p className="text-sm text-gray-600">{preview.description}</p>
              </div>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreview(null)}
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-8 bg-gray-50 flex items-center justify-center">
              <TemplateErrorBoundary>
                <PreviewWrapper scale={1} origin="center" wrapperSize={2}>
                  <CertificateRenderer
                    templateId={preview.id}
                    header="Certificate of Completion"
                    courseTitle="Sample Course"
                    description={preview.description}
                    date="22nd January 2025"
                    recipientName="John Doe"
                    isPreview={true}
                    mode="template-selection"
                    organizationName={organization?.name}
                    organizationLogo={organization?.logo}
                    customTemplateConfig={
                      preview.type === "custom" ? preview.config : undefined
                    }
                  />
                </PreviewWrapper>
              </TemplateErrorBoundary>
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setPreview(null)}>
                Close
              </Button>
              <Button
                onClick={async () => {
                  if (
                    preview.type === "premium" &&
                    !isOrgPremium(organization)
                  ) {
                    const ok = await revalidateOrgPremium(
                      organization.id,
                      accessToken || undefined
                    );
                    if (!ok) {
                      toast.error(
                        "This template requires a Premium plan. Please upgrade."
                      );
                      return;
                    }
                  }
                  handleSelect(preview);
                  setPreview(null);
                }}
              >
                {preview.type === "premium" && !isOrgPremium(organization) ? (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Use
                  </>
                ) : (
                  "Use This Template"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
