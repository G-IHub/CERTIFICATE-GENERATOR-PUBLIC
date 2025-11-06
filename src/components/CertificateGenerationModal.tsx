// Version: 2.0 - Simplified 3-step flow (Setup > Generation > Results)
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Award,
  Upload,
  User,
  Users,
  FileText,
  Download,
  Eye,
  CheckCircle,
  Copy,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import TemplatesPage from "./TemplatesPage";
import { isOrgPremium } from "../utils/subscriptionUtils";
import { copyToClipboard } from "../utils/clipboard";
import CertificateRenderer from "./CertificateRenderer";
import {
  generateSecureCertificateUrl,
  generateCertificateId,
  buildFullCertificateUrl,
  normalizeCertificateUrl,
} from "../utils/certificateUtils";
import { certificateApi } from "../utils/api";
import { projectId, publicAnonKey } from "../utils/supabase/info";

interface GeneratedCertificate {
  id: string;
  studentName: string;
  email?: string;
  generatedAt: string;
  certificateUrl: string;
}

interface CertificateGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  subsidiaries: any[];
  currentSubsidiary: any;
  onUpdateProgramStats?: (
    organizationId: string,
    programId: string,
    certificateCount: number
  ) => void;
  onCertificatesGenerated?: (
    certificates: GeneratedCertificate[],
    organization: any,
    program: any
  ) => void;
  customTemplateConfig?: any; // Custom template configuration from Template Builder
}

export default function CertificateGenerationModal({
  isOpen,
  onClose,
  user,
  subsidiaries: organizations,
  currentSubsidiary: currentOrganization,
  onCertificatesGenerated,
  customTemplateConfig,
}: CertificateGenerationModalProps) {
  // Debug: Verify new version is loaded
  console.log(
    "✅ CertificateGenerationModal v2.0 loaded - Simplified 3-step flow"
  );
  console.log("📋 Custom template config:", customTemplateConfig);

  const [activeTab, setActiveTab] = useState("setup");
  const [certificateHeader, setCertificateHeader] = useState(
    "Certificate of Completion"
  );
  const [courseName, setCourseName] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedTemplateName, setSelectedTemplateName] = useState("");
  const [selectedTemplateConfig, setSelectedTemplateConfig] =
    useState<any>(null);
  const [studentName, setStudentName] = useState("");
  const [studentEmail, setStudentEmail] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [bulkStudents, setBulkStudents] = useState("");
  const [generatedCertificates, setGeneratedCertificates] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(false);
  const [generationType, setGenerationType] = useState<"individual" | "bulk">(
    "individual"
  );

  // Get user's organization
  const currentUserOrganization =
    currentOrganization || (organizations.length > 0 ? organizations[0] : null);

  // Note: generateCertificateId, normalizeCertificateUrl, and buildFullCertificateUrl are now imported from utils/certificateUtils

  // Generate secure encrypted certificate URL
  const generateCertificateUrlSecure = (certificateId: string) => {
    if (!currentUserOrganization) {
      console.error("❌ No organization selected for certificate generation");
      return "";
    }

    const programSlug = courseName.toLowerCase().replace(/\s+/g, "-");

    // Use encrypted URL format - more secure with expiration
    const encryptedUrl = generateSecureCertificateUrl(
      currentUserOrganization.id,
      programSlug,
      certificateId,
      365 // Valid for 1 year
    );

    // Remove the origin and hash from the URL to get just the path
    return encryptedUrl.replace(`${window.location.origin}/#/`, "");
  };

  // Parse bulk students input
  const parseBulkStudents = (input: string) => {
    const lines = input.trim().split("\n");
    const students = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const parts = trimmed.split(",").map((p) => p.trim());
      if (parts.length >= 2) {
        students.push({ name: parts[0], email: parts[1] });
      } else if (parts.length === 1) {
        students.push({ name: parts[0], email: "" });
      }
    }

    return students;
  };

  // Handle template selection from TemplatesPage (Global Template Library)
  const handleTemplateFromBrowser = (template: any) => {
    console.log("🎨 Template selected from global library:", template);
    console.log("🎨 Template config:", template.config);

    // Store the template ID, name, AND config
    setSelectedTemplate(template.id); // Store template ID (e.g., "template1", "template2")
    setSelectedTemplateName(template.name);

    // IMPORTANT: Store template config for custom templates
    // For default templates, config might be null (uses built-in styles)
    // For custom templates, config contains the user's design
    setSelectedTemplateConfig(template.config || null);

    setShowTemplatePicker(false);
    toast.success(`Template "${template.name}" selected!`);
  };

  // Generate individual certificate
  const generateIndividualCertificate = async () => {
    if (!certificateHeader.trim()) {
      toast.error("Please enter certificate header");
      return;
    }

    if (!courseName.trim()) {
      toast.error("Please enter course title");
      return;
    }

    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    if (!currentUserOrganization) {
      toast.error("No organization selected");
      return;
    }

    setIsGenerating(true);

    try {
      // Get access token from localStorage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        toast.error("Not authenticated. Please log in again.");
        setIsGenerating(false);
        return;
      }

      // Save certificate to backend
      // Use selectedTemplateConfig (from template picker) OR customTemplateConfig (from modal prop)
      const templateConfig =
        selectedTemplateConfig || customTemplateConfig || null;
      console.log(
        "💾 Saving certificate to backend with template config:",
        templateConfig
      );

      const response = await certificateApi.generate(token, {
        organizationId: currentUserOrganization.id,
        certificateHeader: certificateHeader.trim(),
        courseName: courseName.trim(),
        courseDescription: courseDescription.trim(),
        completionDate: completionDate,
        template: selectedTemplate,
        customTemplateConfig: templateConfig,
      });

      console.log("✅ Certificate saved to backend:", response);

      if (response.certificates && response.certificates.length > 0) {
        const backendCert = response.certificates[0];

        const certificate = {
          id: backendCert.id,
          generatedAt: backendCert.generatedAt,
          certificateUrl: backendCert.certificateUrl,
          template: backendCert.template || selectedTemplate,
          templateName: selectedTemplateName,
          organization: currentUserOrganization,
          certificateHeader: backendCert.certificateHeader,
          courseName: backendCert.courseName,
          courseDescription: backendCert.courseDescription,
          completionDate: backendCert.completionDate,
          customTemplateConfig:
            backendCert.customTemplateConfig || templateConfig,
        };

        setGeneratedCertificates([certificate]);

        toast.success("Certificate link generated and saved successfully!");
        setActiveTab("results");

        // Clear form
        setCourseName("");
        setCourseDescription("");
        setCertificateHeader("Certificate of Completion");
        setCompletionDate(new Date().toISOString().split("T")[0]);
      } else {
        toast.error("Failed to generate certificate");
      }
    } catch (error: any) {
      console.error("❌ Error generating certificate:", error);
      toast.error(error.message || "Failed to generate certificate");
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate bulk certificates
  const generateBulkCertificates = () => {
    if (!bulkStudents.trim()) {
      toast.error("Please enter student data");
      return;
    }

    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    const students = parseBulkStudents(bulkStudents);
    if (students.length === 0) {
      toast.error("No valid student data found");
      return;
    }

    setIsGenerating(true);

    setTimeout(() => {
      const certificates = students.map((student) => {
        const certificateId = generateCertificateId();
        const certificateUrl = generateCertificateUrl(certificateId);

        return {
          id: certificateId,
          studentName: student.name,
          email: student.email,
          generatedAt: new Date().toISOString(),
          certificateUrl: certificateUrl,
          template: selectedTemplate,
          templateName: selectedTemplateName,
          organization: currentUserOrganization,
          customMessage: customMessage.trim(),
          customTemplateConfig: customTemplateConfig, // Store custom template config with certificate
        };
      });

      setGeneratedCertificates(certificates);

      setIsGenerating(false);
      toast.success(
        `${certificates.length} certificates generated successfully!`
      );
      setActiveTab("results");

      // Clear form
      setBulkStudents("");
      setCustomMessage("");
    }, 2000);
  };

  // Copy certificate URL to clipboard
  const copyCertificateUrl = async (url: string) => {
    const fullUrl = buildFullCertificateUrl(url);
    const success = await copyToClipboard(fullUrl);
    if (success) {
      toast.success("Certificate URL copied to clipboard!");
    } else {
      toast.error("Failed to copy URL");
    }
  };

  // Export certificate list as CSV
  const exportCertificateList = () => {
    const csvHeader =
      "Course Name,Certificate ID,Certificate URL,Generated At\n";
    const csvRows = generatedCertificates
      .map(
        (cert) =>
          `"${cert.courseName}","${cert.id}","${
            cert.certificateUrl
          }","${new Date(cert.generatedAt).toLocaleString()}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `certificates-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Certificate list exported successfully!");
  };

  // Handle preview button
  const handlePreviewCertificates = () => {
    if (generatedCertificates.length > 0 && onCertificatesGenerated) {
      onCertificatesGenerated(
        generatedCertificates,
        currentUserOrganization,
        null
      );
      onClose();
    }
  };

  const resetModal = () => {
    setActiveTab("setup");
    setCertificateHeader("Certificate of Completion");
    setCourseName("");
    setCourseDescription("");
    setCompletionDate(new Date().toISOString().split("T")[0]);
    setSelectedTemplate("");
    setSelectedTemplateName("");
    setStudentName("");
    setStudentEmail("");
    setCustomMessage("");
    setBulkStudents("");
    setGeneratedCertificates([]);
    setIsGenerating(false);
    setGenerationType("individual");
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const canProceedToGeneration = selectedTemplate;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-default">
                    <Award className="w-5 h-5 text-indigo-600" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Certificate generation system</p>
                </TooltipContent>
              </Tooltip>
              Generate Certificates
            </DialogTitle>
            <DialogDescription>
              Create beautiful, professional certificates with customizable
              templates
            </DialogDescription>
          </DialogHeader>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="setup">Setup</TabsTrigger>
              <TabsTrigger
                value="generation"
                disabled={!canProceedToGeneration}
              >
                Generation
              </TabsTrigger>
              <TabsTrigger
                value="results"
                disabled={generatedCertificates.length === 0}
              >
                Results
              </TabsTrigger>
            </TabsList>

            <TabsContent value="setup" className="space-y-6">
              {/* Template Selection Only */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    Choose Template
                  </CardTitle>
                  <CardDescription>
                    Select a certificate template to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Template Selection */}
                  <div className="space-y-2">
                    <Label>Certificate Template *</Label>
                    <div
                      onClick={() => setShowTemplatePicker(true)}
                      className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all group"
                    >
                      {selectedTemplate ? (
                        <>
                          <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                            <FileText className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900">
                              {selectedTemplateName}
                            </p>
                            <p className="text-sm text-gray-500 capitalize">
                              {selectedTemplate} style
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowTemplatePicker(true);
                            }}
                            className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                          >
                            Change
                          </Button>
                        </>
                      ) : (
                        <>
                          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <Upload className="w-6 h-6 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Choose a certificate template
                            </p>
                            <p className="text-sm text-gray-500">
                              Select from previously used or browse all
                              templates
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={() => {
                        setActiveTab("generation");
                        // Clear previous results when starting new generation
                        setGeneratedCertificates([]);
                      }}
                      disabled={!selectedTemplate}
                    >
                      Next: Enter Certificate Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="generation" className="space-y-6">
              {/* Certificate Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-indigo-600" />
                    Certificate Information
                  </CardTitle>
                  <CardDescription>
                    Enter all the details for the certificate - no need to
                    re-enter them later
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Certificate Header */}
                  <div className="space-y-2">
                    <Label htmlFor="certificateHeader">
                      Certificate Header <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="certificateHeader"
                      value={certificateHeader}
                      onChange={(e) => setCertificateHeader(e.target.value)}
                      placeholder="e.g., Certificate of Completion"
                    />
                    <p className="text-xs text-gray-500">
                      The main title that appears on the certificate
                    </p>
                  </div>

                  {/* Program/Course Name */}
                  <div className="space-y-2">
                    <Label htmlFor="courseName">
                      Program/Course Name{" "}
                      <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="courseName"
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g., Advanced Data Analytics Program"
                    />
                    <p className="text-xs text-gray-500">
                      The name of the program or course
                    </p>
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="courseDescription">
                      Description (optional)
                    </Label>
                    <Textarea
                      id="courseDescription"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                      placeholder="Additional details about the achievement or program..."
                      rows={3}
                    />
                    <p className="text-xs text-gray-500">
                      Optional additional information about the program
                    </p>
                  </div>

                  {/* Completion Date */}
                  <div className="space-y-2">
                    <Label htmlFor="completionDate">
                      Completion Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="completionDate"
                      type="date"
                      value={completionDate}
                      onChange={(e) => setCompletionDate(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      The date when the program was completed
                    </p>
                  </div>

                  {/* Live Certificate Preview */}
                  {courseName &&
                    selectedTemplate &&
                    currentUserOrganization && (
                      <div className="pt-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-medium">Live Preview</h4>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {selectedTemplateName ||
                              `Template ${selectedTemplate}`}
                          </Badge>
                        </div>
                        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200">
                          <CardContent className="p-4">
                            <div className="bg-white rounded-lg overflow-hidden shadow-sm">
                              <PreviewWrapper
                                scale={0.4}
                                origin="center"
                                wrapperSize={2}
                              >
                                <CertificateRenderer
                                  templateId={selectedTemplate}
                                  header={certificateHeader}
                                  courseTitle={courseName}
                                  description={courseDescription}
                                  date={new Date(
                                    completionDate
                                  ).toLocaleDateString("en-US", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                  recipientName="Sample Student Name"
                                  isPreview={true}
                                  mode="template-selection"
                                  organizationName={
                                    currentUserOrganization.name
                                  }
                                  organizationLogo={
                                    currentUserOrganization.logo
                                  }
                                  customTemplateConfig={
                                    selectedTemplateConfig ||
                                    customTemplateConfig
                                  }
                                />
                              </PreviewWrapper>
                            </div>
                            <p className="text-xs text-gray-600 mt-3 text-center">
                              This is how the certificate will appear to
                              students
                            </p>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab("setup");
                        // Clear previous results when going back to start new generation
                        setGeneratedCertificates([]);
                      }}
                      className="flex-1"
                    >
                      Back to Template
                    </Button>
                    <Button
                      onClick={generateIndividualCertificate}
                      disabled={
                        isGenerating ||
                        !certificateHeader.trim() ||
                        !courseName.trim()
                      }
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Award className="w-4 h-4 mr-2" />
                          Generate Certificate Link
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="results" className="space-y-6">
              {/* Generated Certificates */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        Generated Certificate Links (
                        {generatedCertificates.length})
                      </CardTitle>
                      <CardDescription>
                        Share these links with students. They will enter their
                        name and view their certificate.
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      {onCertificatesGenerated && (
                        <Button
                          variant="outline"
                          onClick={handlePreviewCertificates}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      )}
                      <Button variant="outline" onClick={exportCertificateList}>
                        <Download className="w-4 h-4 mr-2" />
                        Export List
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {generatedCertificates.map((cert, index) => (
                      <div
                        key={cert.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{cert.courseName}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {cert.templateName}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-mono">
                            {cert.id}
                          </p>
                          <p className="text-xs text-gray-500">
                            Generated{" "}
                            {new Date(cert.generatedAt).toLocaleString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              copyCertificateUrl(cert.certificateUrl)
                            }
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              window.open(
                                buildFullCertificateUrl(cert.certificateUrl),
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Template Picker Dialog */}
      <Dialog open={showTemplatePicker} onOpenChange={setShowTemplatePicker}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
          <DialogHeader className="p-6 pb-4 shrink-0">
            <DialogTitle>Choose Certificate Template</DialogTitle>
            <DialogDescription>
              Browse and select from our collection of professional certificate
              templates
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto scrollbar-hide px-6 pb-6 flex-1">
            {currentOrganization && (
              <TemplatesPage
                onSelectTemplate={handleTemplateFromBrowser}
                organization={currentOrganization}
                showBuilderButton={false}
                isPremiumUser={isOrgPremium(currentOrganization)}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}
