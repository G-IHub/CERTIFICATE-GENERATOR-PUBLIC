import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Award,
  Plus,
  Building2,
  FileText,
  Palette,
  CheckCircle,
  AlertCircle,
  Users,
  Briefcase,
  GraduationCap,
} from "lucide-react";
import { toast } from "sonner";
import CertificateRenderer from "./CertificateRenderer";
import PreviewWrapper from "./PreviewWrapper";

interface NewProgramModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  subsidiaries: any[]; // organizations
  currentSubsidiary: any; // current organization
  onAddProgram: (organizationId: string, newProgram: any) => void;
}

// Simplified certificate templates - only 3 options
const certificateTemplates = [
  {
    id: "impact",
    name: "Impact",
    description:
      "Designed for free programs and impact initiatives that create social or environmental change",
    icon: Users,
    previewTemplateId: "1",
    features: [
      "Community focus",
      "Social impact design",
      "Accessibility emphasis",
    ],
    useCases: [
      "Free courses",
      "Community outreach",
      "Social impact programs",
      "Volunteer recognition",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    description:
      "Perfect for workshops, training sessions, and capacity building programs",
    icon: Briefcase,
    previewTemplateId: "2",
    features: [
      "Professional layout",
      "Business-ready design",
      "Skills-focused",
    ],
    useCases: [
      "Workshops",
      "Training programs",
      "Capacity building",
      "Professional development",
    ],
  },
  {
    id: "advanced",
    name: "Advanced",
    description:
      "Sophisticated design for research programs, certificates, diplomas, and advanced studies",
    icon: GraduationCap,
    previewTemplateId: "3",
    features: ["Academic excellence", "Research-focused", "Premium appearance"],
    useCases: [
      "Research programs",
      "Certificate courses",
      "Diploma programs",
      "Advanced studies",
    ],
  },
];

export default function NewProgramModal({
  isOpen,
  onClose,
  user,
  subsidiaries: organizations,
  currentSubsidiary: currentOrganization,
  onAddProgram,
}: NewProgramModalProps) {
  const [selectedOrganization, setSelectedOrganization] = useState(
    currentOrganization?.id || ""
  );
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [duration, setDuration] = useState("");
  const [prerequisites, setPrerequisites] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);

  // Get user's organization
  const currentUserOrganization =
    currentOrganization || (organizations.length > 0 ? organizations[0] : null);

  // Get selected organization data
  const selectedOrganizationData =
    organizations.find((o) => o.id === selectedOrganization) ||
    currentUserOrganization;

  // Generate unique program ID
  const generateProgramId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `prog-${timestamp}-${random}`;
  };

  // Create new program
  const createProgram = () => {
    const orgId = selectedOrganization || currentUserOrganization?.id;
    if (
      !orgId ||
      !programName.trim() ||
      !programDescription.trim() ||
      !selectedTemplate
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if program name already exists in the organization
    const existingProgram = selectedOrganizationData?.programs.find(
      (p: any) => p.name.toLowerCase() === programName.trim().toLowerCase()
    );

    if (existingProgram) {
      toast.error(
        "A program with this name already exists in your organization"
      );
      return;
    }

    setIsCreating(true);

    // Simulate API call delay
    setTimeout(() => {
      const newProgram = {
        id: generateProgramId(),
        name: programName.trim(),
        description: programDescription.trim(),
        template: selectedTemplate as "impact" | "professional" | "advanced",
        certificates: 0,
        testimonials: 0,
        duration: duration.trim(),
        prerequisites: prerequisites.trim(),
        createdAt: new Date().toISOString(),
        createdBy: user.username,
      };

      onAddProgram(orgId, newProgram);

      setIsCreating(false);
      toast.success(`Program "${programName}" created successfully!`);

      // Reset form and close modal
      resetForm();
      onClose();
    }, 1500);
  };

  // Reset form
  const resetForm = () => {
    setSelectedOrganization(currentOrganization?.id || "");
    setProgramName("");
    setProgramDescription("");
    setSelectedTemplate("");
    setDuration("");
    setPrerequisites("");
    setShowTemplatePreview(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const selectedTemplateData = certificateTemplates.find(
    (t) => t.id === selectedTemplate
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-600" />
            Create New Program
          </DialogTitle>
          <DialogDescription>
            Add a new certificate program to your organization
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Organization Info */}
          {selectedOrganizationData && (
            <Alert>
              <Building2 className="h-4 w-4" />
              <AlertDescription>
                Creating program for{" "}
                <strong>{selectedOrganizationData.name}</strong> - Currently has{" "}
                {selectedOrganizationData.programs.length} active programs
              </AlertDescription>
            </Alert>
          )}

          {/* Program Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Program Information
              </CardTitle>
              <CardDescription>
                Basic details about your certificate program
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="programName">Program Name *</Label>
                <Input
                  id="programName"
                  value={programName}
                  onChange={(e) => setProgramName(e.target.value)}
                  placeholder="e.g., Advanced Molecular Biology Certificate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="programDescription">
                  Program Description *
                </Label>
                <Textarea
                  id="programDescription"
                  value={programDescription}
                  onChange={(e) => setProgramDescription(e.target.value)}
                  placeholder="Describe what students will learn and achieve in this program..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (optional)</Label>
                  <Input
                    id="duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g., 8 weeks, 3 months"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="prerequisites">
                    Prerequisites (optional)
                  </Label>
                  <Input
                    id="prerequisites"
                    value={prerequisites}
                    onChange={(e) => setPrerequisites(e.target.value)}
                    placeholder="e.g., Basic biology knowledge"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Certificate Template *
              </CardTitle>
              <CardDescription>
                Choose the appropriate template based on your program type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {certificateTemplates.map((template) => {
                  const IconComponent = template.icon;
                  return (
                    <button
                      key={template.id}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setShowTemplatePreview(true);
                      }}
                      className={`p-4 border rounded-lg text-left transition-all hover:shadow-md ${
                        selectedTemplate === template.id
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`p-2 rounded-lg ${
                            selectedTemplate === template.id
                              ? "bg-indigo-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <IconComponent
                            className={`w-5 h-5 ${
                              selectedTemplate === template.id
                                ? "text-indigo-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>
                        <h4 className="font-semibold">{template.name}</h4>
                      </div>

                      <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden flex items-center justify-center">
                        <PreviewWrapper
                          scale={0.4}
                          origin="center"
                          wrapperSize={2}
                        >
                          <CertificateRenderer
                            templateId={template.previewTemplateId}
                            header="Certificate of Completion"
                            courseTitle="Sample Course"
                            description={template.description}
                            date="22nd January 2025"
                            recipientName="John Doe"
                            isPreview={true}
                            mode="template-selection"
                            organizationName={selectedOrganizationData?.name}
                            organizationLogo={selectedOrganizationData?.logo}
                          />
                        </PreviewWrapper>
                      </div>

                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>

                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1">
                          {template.features.map((feature, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="text-xs"
                            >
                              {feature}
                            </Badge>
                          ))}
                        </div>

                        <div className="text-xs text-gray-500">
                          <strong>Best for:</strong>{" "}
                          {template.useCases.join(", ")}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedTemplateData && (
                <Alert className="mt-4">
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Selected template:{" "}
                    <strong>{selectedTemplateData.name}</strong> -{" "}
                    {selectedTemplateData.description}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Preview Section */}
          {selectedOrganizationData && programName && selectedTemplateData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Program Preview</CardTitle>
                <CardDescription>
                  How this program will appear in your dashboard
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${selectedOrganizationData.primaryColor}40, ${selectedOrganizationData.primaryColor}60)`,
                      }}
                    >
                      <Award
                        className="w-6 h-6"
                        style={{ color: selectedOrganizationData.primaryColor }}
                      />
                    </div>
                    <div>
                      <h3 className="font-semibold">{programName}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {programDescription}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>0 certificates</span>
                        <span>0 testimonials</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{selectedTemplate}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={createProgram}
              disabled={
                isCreating ||
                !selectedOrganization ||
                !programName.trim() ||
                !programDescription.trim() ||
                !selectedTemplate
              }
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Program...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Program
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
