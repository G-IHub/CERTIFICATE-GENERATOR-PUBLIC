import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Sparkles,
  Palette,
  FileText,
  PenTool,
  Trophy,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
} from "lucide-react";
import { projectId } from "../utils/supabase/info";
import { motion, AnimatePresence } from "motion/react";
import SignatoryManagement from "./SignatoryManagement";
import CertificateRenderer from "./CertificateRenderer";
import PreviewWrapper from "./PreviewWrapper";
import type { Signatory } from "../App";
import { toast } from "sonner";

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
    console.error("Template preview error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center h-full bg-gray-100 text-gray-500 text-sm">
            Preview unavailable
          </div>
        )
      );
    }

    return this.props.children;
  }
}

interface OnboardingWizardProps {
  organizationId: string;
  organizationName: string;
  accessToken: string;
  onComplete: (goToCertificates?: boolean) => void;
  onSkip: () => void;
}

interface Template {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
}

export default function OnboardingWizard({
  organizationId,
  organizationName,
  accessToken,
  onComplete,
  onSkip,
}: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [logo, setLogo] = useState<string>("");
  const [secondaryLogo, setSecondaryLogo] = useState<string>("");
  const [primaryColor, setPrimaryColor] = useState("#ea580c");
  const [programHeader, setProgramHeader] = useState(
    "Certificate of Completion",
  );
  const [courseTitle, setCourseTitle] = useState("My First Program");
  const [description, setDescription] = useState("");
  const [enableEmailRestriction, setEnableEmailRestriction] = useState(false);
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [uploadingSignature, setUploadingSignature] = useState<string | null>(
    null,
  );
  const [createdCertificateId, setCreatedCertificateId] = useState<string>("");
  const [certificateUrl, setCertificateUrl] = useState<string>("");

  const steps = [
    { title: "Welcome", icon: Sparkles },
    { title: "Choose Template", icon: FileText },
    { title: "Customize Dashboard", icon: Palette },
    { title: "Program Details", icon: FileText },
    { title: "Add Signatures", icon: PenTool },
    { title: "Success!", icon: Trophy },
  ];

  // Load templates
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/templates`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      const data = await response.json();
      if (data.templates) {
        setTemplates(data.templates);
        if (data.templates.length > 0) {
          setSelectedTemplate(data.templates[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load templates:", error);
    }
  };

  const handleNext = async () => {
    if (currentStep === steps.length - 2) {
      // Last step before success - create the certificate
      await createCertificate();
    }
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSkipStep = () => {
    if (currentStep === steps.length - 1) {
      // Last step - complete onboarding
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const createCertificate = async () => {
    setIsLoading(true);
    try {
      // 1. Update organization settings (logo, secondaryLogo, color, and signatories)
      const settingsPayload: any = {};

      if (logo) {
        settingsPayload.logo = logo;
      }

      if (secondaryLogo) {
        settingsPayload.secondaryLogo = secondaryLogo;
      }

      if (primaryColor !== "#ea580c") {
        settingsPayload.primaryColor = primaryColor;
      }

      if (signatories.length > 0) {
        settingsPayload.signatories = signatories;
      }

      if (Object.keys(settingsPayload).length > 0) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/organizations/${organizationId}/settings`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(settingsPayload),
          },
        );
      }

      // 2. Create program
      const programResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/programs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            organizationId,
            program: {
              name: courseTitle,
              description: description || "My first program on Certifyer",
              template: selectedTemplate,
              settings: {
                emailRestriction: enableEmailRestriction,
              },
            },
          }),
        },
      );

      const programData = await programResponse.json();

      if (!programResponse.ok || !programData.program?.id) {
        console.error("Failed to create program:", programData);
        toast.error("Failed to create program", {
          description:
            programData.error || "There was an error creating your program.",
        });
        throw new Error(programData.error || "Failed to create program");
      }

      const programId = programData.program.id;

      // 3. Create certificate with proper backend format
      const certificatePayload = {
        organizationId: organizationId,
        certificateHeader: programHeader,
        courseName: courseTitle,
        courseDescription:
          description || "Congratulations on completing this program!",
        completionDate: new Date().toISOString().split("T")[0],
        template: selectedTemplate,
        // DO NOT send students array - this creates a shareable link without pre-filled name
        students: undefined,
      };

      // Add signatories if provided
      if (signatories.length > 0) {
        certificatePayload.signatories = signatories.map((sig) => ({
          name: sig.name,
          title: sig.title,
          signatureUrl: sig.signatureUrl,
        }));
      }

      const certificateResponse = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/certificates`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(certificatePayload),
        },
      );

      const certData = await certificateResponse.json();

      if (certData.certificates && certData.certificates.length > 0) {
        const firstCert = certData.certificates[0];
        setCreatedCertificateId(firstCert.id);
        setCertificateUrl(firstCert.certificateUrl);
        setShowConfetti(true);

        // Show success toast
        toast.success("Certificate saved to your database! 🎉", {
          description:
            "Your first certificate has been successfully created and stored.",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error("Failed to create certificate:", error);
      toast.error("Failed to create certificate", {
        description:
          "There was an error creating your certificate. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = () => {
    onComplete(true); // Pass true to indicate redirect to certificates section
  };

  const handleFileUpload = async (
    file: File,
    type: "logo" | "secondaryLogo",
  ) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "logo") {
        setLogo(base64);
      } else if (type === "secondaryLogo") {
        setSecondaryLogo(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  // Signatory management handlers
  const addSignatory = () => {
    const newSignatory: Signatory = {
      id: `sig-${Date.now()}`,
      name: "",
      title: "",
      signatureUrl: "",
    };
    setSignatories([...signatories, newSignatory]);
  };

  const removeSignatory = (id: string) => {
    setSignatories(signatories.filter((s) => s.id !== id));
  };

  const updateSignatory = (
    id: string,
    field: keyof Signatory,
    value: string,
  ) => {
    setSignatories(
      signatories.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const handleSignatureUpload = async (id: string, file: File) => {
    setUploadingSignature(id);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateSignatory(id, "signatureUrl", base64);
        setUploadingSignature(null);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Failed to upload signature:", error);
      setUploadingSignature(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header with progress */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              Welcome to Certifyer!
            </h2>
            <button
              onClick={onSkip}
              className="text-white/80 hover:text-white transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Step {currentStep + 1} of {steps.length}
              </span>
              <span>
                {Math.round(((currentStep + 1) / steps.length) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex flex-col items-center gap-1 ${
                  index === currentStep
                    ? "text-white"
                    : index < currentStep
                      ? "text-white/80"
                      : "text-white/40"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index === currentStep
                      ? "bg-white text-orange-600"
                      : index < currentStep
                        ? "bg-white/80 text-orange-600"
                        : "bg-white/20"
                  }`}
                >
                  {index < currentStep ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </div>
                <span className="text-xs hidden md:block">{step.title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(90vh-250px)]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {/* Step 0: Welcome */}
              {currentStep === 0 && (
                <div className="text-center space-y-6">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-3xl font-bold text-gray-900">
                    Let's Create Your First Certificate!
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    Welcome to{" "}
                    <span className="font-semibold text-orange-600">
                      {organizationName}
                    </span>
                    ! We'll guide you through creating your first professional
                    certificate in just a few steps.
                  </p>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-orange-800">
                      ✨ <strong>Tip:</strong> You can skip any step and
                      customize everything later from your dashboard!
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1: Choose Template */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Choose a Certificate Template
                    </h3>
                    <p className="text-gray-600">
                      Select a professional template for your certificates
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 rounded-lg border-2 transition text-left ${
                          selectedTemplate === template.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        {/* Preview area */}
                        <div className="bg-gray-50 aspect-[4/3] rounded mb-3 flex items-center justify-center overflow-hidden">
                          <TemplateErrorBoundary>
                            <PreviewWrapper
                              scale={0.4}
                              origin="center"
                              wrapperSize={2}
                            >
                              <CertificateRenderer
                                templateId={template.id}
                                header={programHeader}
                                courseTitle={courseTitle || "Sample Course"}
                                description={
                                  description ||
                                  "For successfully completing the program"
                                }
                                date={new Date().toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })}
                                recipientName="John Doe"
                                isPreview={true}
                                mode="template-selection"
                                organizationName={organizationName}
                                organizationLogo={logo}
                              />
                            </PreviewWrapper>
                          </TemplateErrorBoundary>
                        </div>

                        <h4 className="font-semibold text-gray-900">
                          {template.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {template.description}
                        </p>
                        {template.isPremium && (
                          <span className="inline-block mt-2 text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
                            Premium
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Customize Dashboard */}
              {currentStep === 2 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Customize Your Dashboard
                    </h3>
                    <p className="text-gray-600">
                      Add your logo and choose your brand color
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Logo (Optional)
                      </label>
                      <div className="flex items-center gap-4">
                        {logo && (
                          <img
                            src={logo}
                            alt="Logo preview"
                            className="w-20 h-20 object-contain rounded border border-gray-200"
                          />
                        )}
                        <label className="cursor-pointer">
                          <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition">
                            {logo ? "Change Logo" : "Upload Logo"}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "logo");
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Secondary Logo Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Logo{" "}
                        <span className="text-gray-500 text-xs">
                          (Optional - for collaborations)
                        </span>
                      </label>
                      <div className="flex items-center gap-4">
                        {secondaryLogo && (
                          <img
                            src={secondaryLogo}
                            alt="Secondary logo preview"
                            className="w-20 h-20 object-contain rounded border border-dashed border-gray-300"
                          />
                        )}
                        <label className="cursor-pointer">
                          <div className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300">
                            {secondaryLogo
                              ? "Change Partner Logo"
                              : "Upload Partner Logo"}
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, "secondaryLogo");
                            }}
                          />
                        </label>
                      </div>
                    </div>

                    {/* Color Picker */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Brand Color
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-20 h-12 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg"
                          placeholder="#ea580c"
                        />
                      </div>
                      <div className="mt-3 grid grid-cols-6 gap-2">
                        {[
                          "#ea580c",
                          "#ef4444",
                          "#3b82f6",
                          "#10b981",
                          "#8b5cf6",
                          "#ec4899",
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() => setPrimaryColor(color)}
                            className={`w-full h-10 rounded border-2 transition ${
                              primaryColor === color
                                ? "border-gray-900"
                                : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="mt-6 p-4 rounded-lg border border-gray-200 bg-gray-50">
                      <p className="text-sm font-medium text-gray-700 mb-3">
                        Preview
                      </p>
                      <div
                        className="h-20 rounded flex items-center justify-center text-white font-semibold"
                        style={{
                          backgroundColor: primaryColor,
                        }}
                      >
                        {logo ? (
                          <img
                            src={logo}
                            alt="Logo"
                            className="h-12 object-contain"
                          />
                        ) : (
                          organizationName
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Program Details */}
              {currentStep === 3 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Program Details
                    </h3>
                    <p className="text-gray-600">
                      Tell us about your program or course
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certificate Header
                      </label>
                      <input
                        type="text"
                        value={programHeader}
                        onChange={(e) => setProgramHeader(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Certificate of Completion"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Course/Program Title *
                      </label>
                      <input
                        type="text"
                        value={courseTitle}
                        onChange={(e) => setCourseTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., Web Development Bootcamp"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        rows={3}
                        placeholder="Describe what this certificate represents..."
                      />
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <input
                        type="checkbox"
                        id="emailRestriction"
                        checked={enableEmailRestriction}
                        onChange={(e) =>
                          setEnableEmailRestriction(e.target.checked)
                        }
                        className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                      />
                      <label
                        htmlFor="emailRestriction"
                        className="text-sm text-gray-700"
                      >
                        <span className="font-medium">
                          Enable Email Restriction
                        </span>
                        <p className="text-gray-600 mt-1">
                          Only recipients with pre-approved emails can download
                          certificates
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Add Signatures - Use SignatoryManagement Component */}
              {currentStep === 4 && (
                <div className="space-y-6 max-w-2xl mx-auto">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Add Signatures (Optional)
                    </h3>
                    <p className="text-gray-600">
                      Add authority signatures to your certificates
                    </p>
                  </div>

                  <SignatoryManagement
                    signatories={signatories}
                    onAdd={addSignatory}
                    onRemove={removeSignatory}
                    onUpdate={updateSignatory}
                    onUploadSignature={handleSignatureUpload}
                    uploadingSignature={uploadingSignature}
                  />
                </div>
              )}

              {/* Step 5: Success */}
              {currentStep === 5 && (
                <div className="text-center space-y-6">
                  {showConfetti && (
                    <div className="text-6xl mb-4 animate-bounce">🎊</div>
                  )}
                  <h3 className="text-3xl font-bold text-gray-900">
                    Congratulations! 🎉
                  </h3>
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    You've successfully created your first certificate! Your
                    journey with Certifyer begins now.
                  </p>

                  {certificateUrl && (
                    <div className="space-y-4">
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-6 max-w-md mx-auto">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Your Certificate Link:
                        </p>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={`${window.location.origin}/${certificateUrl}`}
                            readOnly
                            className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm"
                          />
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}/${certificateUrl}`,
                              );
                              toast.success("Certificate link copied!");
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-sm"
                          >
                            Copy
                          </button>
                        </div>
                      </div>

                      <a
                        href={`/${certificateUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition font-medium shadow-lg"
                      >
                        <ExternalLink className="w-5 h-5" />
                        View Certificate
                      </a>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mt-8">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Template Selected</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">
                        Dashboard Customized
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-sm font-medium">Certificate Created</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer with navigation */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between items-center">
          <button
            onClick={handleSkipStep}
            className="text-gray-600 hover:text-gray-800 transition"
          >
            {currentStep === steps.length - 1 ? "Go to Dashboard" : "Skip Step"}
          </button>

          <div className="flex gap-3">
            {currentStep > 0 && currentStep < steps.length - 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}

            {currentStep < steps.length - 1 && (
              <button
                onClick={handleNext}
                disabled={
                  isLoading ||
                  (currentStep === 1 && !selectedTemplate) ||
                  (currentStep === 3 && !courseTitle)
                }
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 2
                      ? "Create Certificate"
                      : "Next"}
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            {currentStep === steps.length - 1 && (
              <button
                onClick={handleComplete}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition flex items-center gap-2"
              >
                Go to Dashboard
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
