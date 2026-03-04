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
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  Palette,
  Search,
  Users,
  Loader2,
  X,
  CheckCircle,
  Building2,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { templateApi } from "../utils/api";
import CertificateRenderer from "./CertificateRenderer";
import PreviewWrapper from "./PreviewWrapper";

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

interface Organization {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  ownerId: string;
  ownerEmail?: string;
  createdAt: string;
}

interface TemplateAssignmentsProps {
  accessToken: string | null;
  organizations: Organization[];
}

export default function TemplateAssignments({
  accessToken,
  organizations,
}: TemplateAssignmentsProps) {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [orgSearchQuery, setOrgSearchQuery] = useState(""); // Search for organizations in dialog
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null,
  );
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedOrgs, setSelectedOrgs] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Load templates and assignments
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load templates
      const templatesRes = await templateApi.getAll();
      setTemplates(templatesRes.templates || []);

      // Load assignments
      if (accessToken) {
        const assignmentsRes = await templateApi.getAssignments(accessToken);
        setAssignments(assignmentsRes.assignments || {});
      }
    } catch (error: any) {
      console.error("Failed to load template data:", error);
      toast.error(error?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter templates by search query
  const filteredTemplates = templates.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.name.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.id.toLowerCase().includes(query)
    );
  });

  // Filter organizations by search query in dialog
  const filteredOrganizations = organizations.filter((org) => {
    const query = orgSearchQuery.toLowerCase();
    return (
      org.name.toLowerCase().includes(query) ||
      org.shortName.toLowerCase().includes(query) ||
      (org.ownerEmail && org.ownerEmail.toLowerCase().includes(query))
    );
  });

  // Get template number from ID
  const getTemplateNumber = (templateId: string): number => {
    const match = templateId.match(/^template(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };

  // Check if template is public (1-16) or exclusive (17+)
  const isPublicTemplate = (template: Template): boolean => {
    const templateNumber = getTemplateNumber(template.id);
    return templateNumber > 0 && templateNumber <= 16;
  };

  // Open assign dialog
  const handleOpenAssign = (template: Template) => {
    setSelectedTemplate(template);
    setSelectedOrgs(assignments[template.id] || []);
    setOrgSearchQuery(""); // Reset organization search when opening dialog
    setShowAssignDialog(true);
  };

  // Toggle organization selection
  const toggleOrg = (orgId: string) => {
    setSelectedOrgs((prev) =>
      prev.includes(orgId)
        ? prev.filter((id) => id !== orgId)
        : [...prev, orgId],
    );
  };

  // Save assignments
  const handleSaveAssignments = async () => {
    if (!selectedTemplate || !accessToken) return;

    setSubmitting(true);
    try {
      const currentAssignments = assignments[selectedTemplate.id] || [];
      const toAssign = selectedOrgs.filter(
        (id) => !currentAssignments.includes(id),
      );
      const toUnassign = currentAssignments.filter(
        (id) => !selectedOrgs.includes(id),
      );

      // Assign new organizations
      if (toAssign.length > 0) {
        await templateApi.assignToOrganizations(
          accessToken,
          selectedTemplate.id,
          toAssign,
        );
      }

      // Unassign removed organizations
      if (toUnassign.length > 0) {
        await templateApi.unassignFromOrganizations(
          accessToken,
          selectedTemplate.id,
          toUnassign,
        );
      }

      // Update local state
      setAssignments((prev) => ({
        ...prev,
        [selectedTemplate.id]: selectedOrgs,
      }));

      toast.success("Template assignments updated successfully");
      setShowAssignDialog(false);
    } catch (error: any) {
      console.error("Failed to save assignments:", error);
      toast.error(error?.message || "Failed to save assignments");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Template Assignments
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Assign templates to specific organizations or allow everyone to access
          them. Templates with no assignments are visible to all organizations.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const assignedOrgs = assignments[template.id] || [];
          const assignedCount = assignedOrgs.length;

          return (
            <Card key={template.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs mt-1 line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* Template Preview */}
                <div className="aspect-[4/3] bg-gray-50 rounded-lg border overflow-hidden">
                  <PreviewWrapper scale={0.15}>
                    <CertificateRenderer
                      templateId={template.id}
                      studentName="John Doe"
                      courseName="Example Course"
                      issueDate={new Date().toISOString().split("T")[0]}
                      verificationUrl="https://example.com"
                      organizationLogo=""
                      organizationName="Organization"
                      primaryColor="#f97316"
                      signatories={[]}
                    />
                  </PreviewWrapper>
                </div>

                {/* Assignment Info */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Building2 className="w-4 h-4" />
                    <span>
                      {assignedCount === 0
                        ? "Available to everyone"
                        : `${assignedCount} ${
                            assignedCount === 1
                              ? "organization"
                              : "organizations"
                          }`}
                    </span>
                  </div>
                </div>

                {/* Manage Button - Available for all templates */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleOpenAssign(template)}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Access
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No templates found</p>
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Template Access</DialogTitle>
            <DialogDescription>
              Select which organizations can access{" "}
              <strong>{selectedTemplate?.name}</strong>. Leave empty to allow
              everyone.
            </DialogDescription>
          </DialogHeader>

          {/* Organization Search */}
          <div className="relative px-6">
            <Search className="absolute left-9 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search organizations..."
              value={orgSearchQuery}
              onChange={(e) => setOrgSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-2">
            <div className="space-y-2">
              {organizations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No organizations available
                </p>
              ) : filteredOrganizations.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No organizations found
                </p>
              ) : (
                filteredOrganizations.map((org) => {
                  const isSelected = selectedOrgs.includes(org.id);
                  return (
                    <div
                      key={org.id}
                      onClick={() => toggleOrg(org.id)}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-primary/10 border-primary"
                          : "bg-white border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-primary border-primary"
                            : "border-gray-300"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">
                          {org.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {org.ownerEmail || org.shortName}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <DialogFooter className="px-6 pb-6">
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAssignments} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
