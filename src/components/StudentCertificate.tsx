import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  Download,
  Share2,
  ExternalLink,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Mail,
  Copy,
  CheckCircle,
  Award,
  Eye,
  Heart,
  Star,
  Globe,
  Shield,
  Calendar,
  User,
  Building2,
  AlertCircle,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import CertificateTemplate from "./CertificateTemplate";
import CertificateRenderer from "./CertificateRenderer";
import type { Subsidiary, Program } from "../App";
import { copyToClipboard } from "../utils/clipboard";
import { certificateApi, templateApi } from "../utils/api";
import {
  decryptCertificateData,
  getCertificateLinkTimeRemaining,
} from "../utils/encryption";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface StudentCertificateProps {
  subsidiaries: Subsidiary[];
}

interface CertificateData {
  id: string;
  studentName?: string; // Optional for new format certificates
  email?: string;
  program?: Program;
  subsidiary?: Subsidiary;
  organization?: Subsidiary; // Backend returns organization instead of subsidiary
  courseName?: string; // New format field
  certificateHeader?: string; // New format field
  courseDescription?: string; // New format field
  completionDate: string;
  issuedDate?: string;
  generatedAt?: string; // Backend field
  status?: "valid" | "revoked" | "expired" | "active";
  verificationCode?: string;
  downloadCount?: number;
  lastAccessed?: string;
  programId?: string;
  organizationId?: string;
  customTemplateConfig?: any; // Custom template configuration
  template?: string; // Template name/style
  signatories?: {
    name: string;
    title: string;
    signatureUrl: string;
  }[];
}

const StudentCertificate: React.FC<StudentCertificateProps> = ({
  subsidiaries,
}) => {
  const params = useParams();
  const location = useLocation();

  // Handle both encrypted and legacy URL formats
  // Encrypted: /certificate/{encryptedData}
  // Legacy: /certificate/{orgId}/{programId}/{certId}
  const { subsidiaryId, programId, certificateId } = params;
  const wildcardParam = params["*"]; // Catches everything after /certificate/

  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [enteredName, setEnteredName] = useState("");
  const [enteredTestimonial, setEnteredTestimonial] = useState("");
  const [showNameForm, setShowNameForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateConfig, setTemplateConfig] = useState<any>(null); // Template config from backend
  const certificateRef = useRef<HTMLDivElement>(null); // Ref for PNG download
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎓 STUDENT CERTIFICATE PAGE - Loading Certificate");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🔍 Current URL:", window.location.href);
      console.log("🔍 URL params:", {
        subsidiaryId,
        programId,
        certificateId,
        wildcardParam,
      });

      let actualCertificateId: string | null = null;
      let decryptedData: any = null;

      // Try to decrypt if we have a single encrypted parameter
      if (wildcardParam && !subsidiaryId && !programId) {
        console.log("🔐 Attempting to decrypt certificate URL...");
        console.log("   - Raw wildcardParam:", wildcardParam);
        console.log("   - wildcardParam length:", wildcardParam.length);
        console.log("   - Has % characters:", wildcardParam.includes("%"));
        console.log("   - Has + characters:", wildcardParam.includes("+"));
        console.log("   - First 50 chars:", wildcardParam.substring(0, 50));

        // React Router may have already decoded the URL, so we need to check
        // If it contains %, it's still encoded. If not, it's already decoded.
        const isAlreadyDecoded = !wildcardParam.includes("%");
        console.log(
          "   - Already URL-decoded by React Router?",
          isAlreadyDecoded
        );

        // Pass the parameter as-is if already decoded, or pass it encoded
        const paramToDecrypt = isAlreadyDecoded
          ? encodeURIComponent(wildcardParam)
          : wildcardParam;
        console.log("   - Param to decrypt:", paramToDecrypt.substring(0, 50));

        decryptedData = decryptCertificateData(paramToDecrypt);

        if (decryptedData) {
          console.log("✅ Successfully decrypted certificate data:");
          console.log("   - Organization ID:", decryptedData.organizationId);
          console.log("   - Program ID:", decryptedData.programId);
          console.log("   - Certificate ID:", decryptedData.certificateId);

          // Check expiration
          const timeRemaining = getCertificateLinkTimeRemaining(wildcardParam);
          if (timeRemaining !== null) {
            const daysRemaining = Math.floor(
              timeRemaining / (1000 * 60 * 60 * 24)
            );
            console.log(`⏰ Link valid for ${daysRemaining} more days`);
          }

          actualCertificateId = decryptedData.certificateId;
        } else {
          console.error(
            "❌ Failed to decrypt certificate URL - link may be invalid or expired"
          );
          toast.error("Invalid or expired certificate link");
          setLoading(false);
          return;
        }
      } else if (certificateId) {
        // Legacy format: /certificate/{orgId}/{programId}/{certId}
        console.log("📄 Using legacy URL format");
        actualCertificateId = certificateId;
      } else {
        console.log("⚠️ No certificate ID or encrypted data provided");
        console.log("⚠️ URL params:", {
          subsidiaryId,
          programId,
          certificateId,
          wildcardParam,
        });
        setLoading(false);
        return;
      }

      if (!actualCertificateId) {
        console.error("❌ Could not determine certificate ID");
        setLoading(false);
        return;
      }

      console.log("🔍 Fetching certificate ID:", actualCertificateId);
      setLoading(true);

      try {
        // Fetch certificate from backend
        console.log("📡 Calling API to get certificate...");
        const response = await certificateApi.getById(actualCertificateId);
        console.log("📡 API Response received:");
        console.log("   - Has certificate:", !!response.certificate);
        console.log("   - Has organization:", !!response.organization);
        console.log("   - Has program:", !!response.program);

        if (response.certificate) {
          console.log("✅ Certificate data received from backend");
          const cert = response.certificate;
          const org = response.organization;
          const prog = response.program;
          console.log("📄 Certificate details:");
          console.log("   - ID:", cert.id);
          console.log(
            "   - Student Name:",
            cert.studentName || "(none - will prompt)"
          );
          console.log("   - Course Name:", cert.courseName);
          console.log("   - Certificate Header:", cert.certificateHeader);
          console.log("   - Template:", cert.template);
          console.log("   - Organization ID:", cert.organizationId);
          console.log("   - Organization Name:", org?.name || "(not found)");
          console.log("   - Program ID:", cert.programId);
          console.log("   - Program Name:", prog?.name || "(not found)");
          console.log("   - Completion Date:", cert.completionDate);

          // Map backend response to CertificateData format
          const certificateData: CertificateData = {
            id: cert.id,
            studentName: cert.studentName, // May be undefined for new format
            email: cert.email,
            courseName: cert.courseName, // New format
            certificateHeader: cert.certificateHeader, // New format
            courseDescription: cert.courseDescription, // New format
            program: prog,
            subsidiary: org,
            organization: org,
            completionDate: cert.completionDate,
            issuedDate: cert.generatedAt,
            generatedAt: cert.generatedAt,
            status: cert.status === "active" ? "valid" : cert.status,
            verificationCode: "VER-" + cert.id.slice(-8),
            downloadCount: cert.downloadCount || 0,
            lastAccessed: new Date().toISOString(),
            programId: cert.programId,
            organizationId: cert.organizationId,
            template: cert.template, // Template ID from backend
            customTemplateConfig: cert.customTemplateConfig, // Custom template config if exists
            signatories: cert.signatories || [], // Signatories from backend
          };

          console.log("📋 Template Info:", {
            templateId: cert.template,
            hasCustomConfig: !!cert.customTemplateConfig,
          });

          setCertificate(certificateData);
          console.log("✅ Certificate state updated successfully");
          console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

          // IMPORTANT: Check if certificate already has customTemplateConfig
          // If it does, DON'T load from global library (would overwrite saved design)
          if (cert.customTemplateConfig) {
            console.log(
              "🎨 Certificate has customTemplateConfig - using saved design"
            );
            console.log(
              "🎨 Custom config keys:",
              Object.keys(cert.customTemplateConfig)
            );
            console.log(
              "⚠️ NOT loading template from global library (would overwrite)"
            );
            // Don't load from global library - certificate already has the config
          } else if (cert.template && cert.template.match(/^template\d+$/)) {
            // Only load from global library if no customTemplateConfig
            console.log(
              "📋 No customTemplateConfig - loading template from backend:",
              cert.template
            );
            try {
              const templateResponse = await templateApi.getById(cert.template);
              if (templateResponse.template) {
                setTemplateConfig(templateResponse.template.config);
                console.log(
                  "✅ Template config loaded from global library:",
                  templateResponse.template.name
                );
              }
            } catch (error) {
              console.error("❌ Failed to load template config:", error);
              // Not critical - will fall back to default
            }
          }

          // Check if this is a new format certificate without a student name
          if (!cert.studentName) {
            console.log("📝 No student name - showing name entry form");
            setShowNameForm(true);
          } else {
            console.log("✅ Student name present:", cert.studentName);
            console.log(
              "📄 Will display certificate directly (no name entry needed)"
            );
          }
        } else {
          console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.error("❌ CERTIFICATE NOT FOUND");
          console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
          console.error("Response has no certificate property");
          console.error("Full response:", response);
          toast.error(
            "Certificate not found - this certificate may not exist in the database"
          );
        }
      } catch (error: any) {
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("❌ ERROR FETCHING CERTIFICATE");
        console.error("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
        console.error("Certificate ID:", certificateId);
        console.error("Error message:", error.message);
        console.error("Error type:", error.name);
        if (error.stack) console.error("Stack trace:", error.stack);

        let errorMessage = "Failed to load certificate";
        if (error.message.includes("not found")) {
          errorMessage =
            "Certificate not found. It may not have been saved to the database.";
        } else if (error.message.includes("fetch")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else {
          errorMessage = error.message;
        }

        toast.error(errorMessage, { duration: 5000 });
      } finally {
        setLoading(false);
        console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      }
    };

    fetchCertificate();
  }, [certificateId]);

  const handleDownloadPNG = async () => {
    if (!certificateRef.current) {
      toast.error("Certificate not ready for download");
      return;
    }

    setIsDownloading(true);
    toast.info("Generating PNG image...");

    try {
      // Render a full-size, non-preview certificate off-screen and capture it.
      const container = document.createElement("div");
      container.id = `certificate-capture-${Date.now()}`;
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "1056px";
      container.style.height = "816px";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <div style={{ backgroundColor: "#ffffff" }}>
          <CertificateRenderer
            templateId={
              certificate!.template || progData?.template || "template1"
            }
            header={
              certificate!.certificateHeader || "Certificate of Completion"
            }
            courseTitle={certificate!.courseName || progData?.name || "Course"}
            description={
              certificate!.courseDescription || progData?.description || ""
            }
            date={certificate!.completionDate}
            recipientName={displayName}
            isPreview={false}
            mode="student"
            organizationName={orgData?.name}
            organizationLogo={orgData?.logo}
            customTemplateConfig={certificate!.customTemplateConfig}
            signatoryName1={certificate!.signatories?.[0]?.name}
            signatoryTitle1={certificate!.signatories?.[0]?.title}
            signatureUrl1={certificate!.signatories?.[0]?.signatureUrl}
            signatoryName2={certificate!.signatories?.[1]?.name}
            signatoryTitle2={certificate!.signatories?.[1]?.title}
            signatureUrl2={certificate!.signatories?.[1]?.signatureUrl}
          />
        </div>
      );

      // Wait briefly for images/fonts to load. This is conservative but avoids race conditions.
      await new Promise((res) => setTimeout(res, 550));

      const canvas = await html2canvas(container, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        onclone: (clonedDoc) => {
          try {
            // Remove cloned stylesheets and <style> tags so html2canvas won't parse CSS
            // functions (like oklch) that it doesn't support.
            const styleEls = clonedDoc.querySelectorAll(
              'link[rel="stylesheet"], style'
            );
            styleEls.forEach((el) => el.parentNode?.removeChild(el));
          } catch (err) {
            // Best-effort: if cloning modifications fail, continue without them
            // eslint-disable-next-line no-console
            console.warn("onclone style copy failed:", err);
          }
        },
      });

      root.unmount();
      document.body.removeChild(container);

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const courseName =
            certificate?.courseName ||
            certificate?.program?.name ||
            "Certificate";
          const fileName = `${courseName.replace(
            /\s+/g,
            "_"
          )}_${displayName.replace(/\s+/g, "_")}.png`;

          const link = document.createElement("a");
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);

          toast.success("Certificate downloaded as PNG!");
        } else {
          toast.error("Failed to create PNG image");
        }
        setIsDownloading(false);
      }, "image/png");
    } catch (error) {
      console.error("Error generating PNG:", error);
      toast.error("Failed to generate PNG image. Please try again.");
      setIsDownloading(false);
    }
  };

  const handleDownload = async () => {
    if (!certificateRef.current) {
      toast.error("Certificate not ready for download");
      return;
    }

    setIsDownloading(true);
    toast.info("Generating PDF...");

    try {
      // Render a full-size, non-preview certificate off-screen and capture it.
      const container = document.createElement("div");
      container.style.position = "fixed";
      container.style.left = "-9999px";
      container.style.top = "-9999px";
      container.style.width = "1056px";
      container.style.height = "816px";
      container.style.pointerEvents = "none";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <div style={{ backgroundColor: "#ffffff" }}>
          <CertificateRenderer
            templateId={
              certificate!.template || progData?.template || "template1"
            }
            header={
              certificate!.certificateHeader || "Certificate of Completion"
            }
            courseTitle={certificate!.courseName || progData?.name || "Course"}
            description={
              certificate!.courseDescription || progData?.description || ""
            }
            date={certificate!.completionDate}
            recipientName={displayName}
            isPreview={false}
            mode="student"
            organizationName={orgData?.name}
            organizationLogo={orgData?.logo}
            customTemplateConfig={certificate!.customTemplateConfig}
            signatoryName1={certificate!.signatories?.[0]?.name}
            signatoryTitle1={certificate!.signatories?.[0]?.title}
            signatureUrl1={certificate!.signatories?.[0]?.signatureUrl}
            signatoryName2={certificate!.signatories?.[1]?.name}
            signatoryTitle2={certificate!.signatories?.[1]?.title}
            signatureUrl2={certificate!.signatories?.[1]?.signatureUrl}
          />
        </div>
      );

      await new Promise((res) => setTimeout(res, 550));

      const canvas = await html2canvas(container, {
        scale: 3,
        backgroundColor: "#ffffff",
        logging: false,
        useCORS: true,
        allowTaint: true,
        onclone: (clonedDoc) => {
          try {
            // Remove cloned stylesheets and <style> tags so html2canvas won't parse CSS
            // functions (like oklch) that it doesn't support.
            const styleEls = clonedDoc.querySelectorAll(
              'link[rel="stylesheet"], style'
            );
            styleEls.forEach((el) => el.parentNode?.removeChild(el));

            const cloned = clonedDoc.getElementById(container.id!);
            if (!cloned) return;
            const originals = container.querySelectorAll<HTMLElement>("*");
            const clones = cloned.querySelectorAll<HTMLElement>("*");
            const length = Math.min(originals.length, clones.length);
            for (let i = 0; i < length; i++) {
              const o = originals[i];
              const c = clones[i];
              const cs = window.getComputedStyle(o);
              if (cs.color) c.style.setProperty("color", cs.color, "important");
              if (cs.backgroundColor)
                c.style.setProperty(
                  "background-color",
                  cs.backgroundColor,
                  "important"
                );
              if (cs.borderTopColor)
                c.style.setProperty(
                  "border-top-color",
                  cs.borderTopColor,
                  "important"
                );
              if (cs.borderRightColor)
                c.style.setProperty(
                  "border-right-color",
                  cs.borderRightColor,
                  "important"
                );
              if (cs.borderBottomColor)
                c.style.setProperty(
                  "border-bottom-color",
                  cs.borderBottomColor,
                  "important"
                );
              if (cs.borderLeftColor)
                c.style.setProperty(
                  "border-left-color",
                  cs.borderLeftColor,
                  "important"
                );
              if (cs.boxShadow)
                c.style.setProperty("box-shadow", cs.boxShadow, "important");
              if (cs.outlineColor)
                c.style.setProperty(
                  "outline-color",
                  cs.outlineColor,
                  "important"
                );
              if (cs.fill) c.style.setProperty("fill", cs.fill, "important");
              if (cs.stroke)
                c.style.setProperty("stroke", cs.stroke, "important");
            }
          } catch (err) {
            // eslint-disable-next-line no-console
            console.warn("onclone style copy failed:", err);
          }
        },
      });

      root.unmount();
      document.body.removeChild(container);

      // Get canvas dimensions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Calculate PDF dimensions (A4 landscape or custom size based on aspect ratio)
      const imgData = canvas.toDataURL("image/png");

      // Use landscape A4 (297mm x 210mm) or custom size
      const pdfWidth = 297; // A4 landscape width in mm
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;

      // Create PDF
      const pdf = new jsPDF({
        orientation: pdfWidth > pdfHeight ? "landscape" : "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      // Add image to PDF
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Download PDF
      const courseName =
        certificate?.courseName || certificate?.program?.name || "Certificate";
      const fileName = `${courseName.replace(
        /\s+/g,
        "_"
      )}_${displayName.replace(/\s+/g, "_")}.pdf`;

      pdf.save(fileName);

      toast.success("Certificate downloaded as PDF!");
      setIsDownloading(false);
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF. Please try again.");
      setIsDownloading(false);
    }
  };

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const courseName =
      certificate?.courseName || certificate?.program?.name || "Course";
    const orgName =
      certificate?.subsidiary?.name ||
      certificate?.organization?.name ||
      "Organization";
    const text = `I've completed the ${courseName} at ${orgName}! 🎓 #Certificate #Achievement`;

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl
        )}&summary=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(
          text + " " + shareUrl
        )}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(
          "My Certificate Achievement"
        )}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`;
        break;
    }

    if (url) {
      window.open(url, "_blank", "width=600,height=400");
      toast.success(`Opening ${platform} to share your certificate!`);
    }
  };

  const handleCopyLink = async () => {
    const success = await copyToClipboard(window.location.href);
    if (success) {
      setShareUrlCopied(true);
      toast.success("Certificate link copied to clipboard!");
      setTimeout(() => setShareUrlCopied(false), 3000);
    } else {
      toast.error("Failed to copy link");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading certificate...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!certificate) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="text-center p-8">
            <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Certificate Not Found
            </h2>
            <p className="text-gray-600 mb-4">
              The certificate you're looking for doesn't exist or may have been
              removed.
            </p>
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show name entry form for new format certificates (without pre-filled student name)
  if (showNameForm) {
    const orgName =
      certificate.subsidiary?.name ||
      certificate.organization?.name ||
      "this organization";
    const courseName =
      certificate.courseName || certificate.program?.name || "this course";

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!enteredName.trim()) {
        toast.error("Please enter your name");
        return;
      }

      setIsSubmitting(true);

      try {
        // Save testimonial to backend if provided
        if (enteredTestimonial.trim()) {
          const response = await certificateApi.submitTestimonial({
            certificateId: certificate.id,
            studentName: enteredName.trim(),
            testimonial: enteredTestimonial.trim(),
            courseName: courseName,
            organizationId: certificate.organizationId || "",
            programId: certificate.programId || "",
          });

          if (response.success) {
            console.log("✅ Testimonial saved successfully");
          }
        }

        setShowNameForm(false);
        toast.success(
          enteredTestimonial.trim()
            ? "Thank you for your feedback!"
            : "Certificate personalized with your name!"
        );
      } catch (error) {
        console.error("Failed to save testimonial:", error);
        // Still show the certificate even if testimonial save fails
        setShowNameForm(false);
        toast.success("Certificate personalized with your name!");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
        key="name-form-container"
      >
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Certificate
              </h2>
              <p className="text-gray-600">
                For <span className="font-semibold">{courseName}</span> from{" "}
                {orgName}
              </p>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="space-y-4"
              key="certificate-name-form"
            >
              <div>
                <label
                  htmlFor="studentName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="studentName"
                  type="text"
                  value={enteredName}
                  onChange={(e) => setEnteredName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label
                  htmlFor="testimonial"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Feedback (Optional)
                </label>
                <textarea
                  id="testimonial"
                  value={enteredTestimonial}
                  onChange={(e) => setEnteredTestimonial(e.target.value)}
                  placeholder="Share your experience with this course..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your feedback helps improve the course for future students
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!enteredName.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </>
                ) : (
                  "View My Certificate"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get the display name (either from certificate data or entered by user)
  const displayName = certificate.studentName || enteredName || "Student";
  const orgData = certificate.subsidiary || certificate.organization;
  const progData = certificate.program;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                {orgData?.logo && (
                  <img
                    src={orgData.logo}
                    alt={orgData.name}
                    className="h-10 w-auto"
                  />
                )}
                <div>
                  <h1 className="text-lg font-bold text-gray-900">
                    {orgData?.name || "Certificate"}
                  </h1>
                  <p className="text-sm text-gray-500">Digital Certificate</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={getStatusColor(certificate.status || "valid")}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {(certificate.status || "valid").toUpperCase()}
                </Badge>
                <Badge variant="outline">
                  <Globe className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Certificate Display */}
            <div className="lg:col-span-3">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div ref={certificateRef} className="w-full">
                    <CertificateRenderer
                      templateId={
                        certificate.template ||
                        progData?.template ||
                        "template1"
                      }
                      header={
                        certificate.certificateHeader ||
                        "Certificate of Completion"
                      }
                      courseTitle={
                        certificate.courseName || progData?.name || "Course"
                      }
                      description={
                        certificate.courseDescription ||
                        progData?.description ||
                        ""
                      }
                      date={certificate.completionDate}
                      recipientName={displayName}
                      isPreview={true}
                      mode="student"
                      organizationName={orgData?.name}
                      organizationLogo={orgData?.logo}
                      customTemplateConfig={certificate.customTemplateConfig}
                      signatoryName1={certificate.signatories?.[0]?.name}
                      signatoryTitle1={certificate.signatories?.[0]?.title}
                      signatureUrl1={certificate.signatories?.[0]?.signatureUrl}
                      signatoryName2={certificate.signatories?.[1]?.name}
                      signatoryTitle2={certificate.signatories?.[1]?.title}
                      signatureUrl2={certificate.signatories?.[1]?.signatureUrl}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Actions */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Actions
                  </h3>
                  <div className="space-y-3">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDownloadPNG}
                          disabled={isDownloading}
                          className="w-full"
                        >
                          {isDownloading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <ImageIcon className="w-4 h-4 mr-2" />
                              Download PNG
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download as PNG image</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          onClick={handleDownload}
                          disabled={isDownloading}
                          variant="outline"
                          className="w-full"
                        >
                          {isDownloading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download as high-quality PDF</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={handleCopyLink}
                          className="w-full"
                        >
                          {shareUrlCopied ? (
                            <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4 mr-2" />
                          )}
                          {shareUrlCopied ? "Copied!" : "Copy Link"}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Copy certificate link to clipboard</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => setShowFullDetails(!showFullDetails)}
                          className="w-full"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          {showFullDetails ? "Hide" : "Show"} Details
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Toggle certificate details</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share Achievement
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare("facebook")}
                        >
                          <Facebook className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on Facebook</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare("twitter")}
                        >
                          <Twitter className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on Twitter</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare("linkedin")}
                        >
                          <Linkedin className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on LinkedIn</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare("whatsapp")}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share on WhatsApp</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleShare("email")}
                          className="col-span-2"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Email
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Share via email</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </CardContent>
              </Card>

              {/* Certificate Info */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <Award className="w-4 h-4" />
                    Certificate Info
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Student:</span>
                      <span className="font-medium">{displayName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Organization:</span>
                      <span className="font-medium">
                        {orgData?.shortName || orgData?.name || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Completed:</span>
                      <span className="font-medium">
                        {formatDate(certificate.completionDate)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Certificate ID:</span>
                      <span className="font-mono text-xs">
                        {certificate.id}
                      </span>
                    </div>
                  </div>

                  {showFullDetails && (
                    <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">
                          Course Description:
                        </span>
                        <p className="mt-1 text-gray-800">
                          {certificate.courseDescription ||
                            progData?.description ||
                            "N/A"}
                        </p>
                      </div>
                      {certificate.issuedDate && (
                        <div>
                          <span className="text-gray-600">Issued Date:</span>
                          <p className="font-medium">
                            {formatDate(certificate.issuedDate)}
                          </p>
                        </div>
                      )}
                      {certificate.verificationCode && (
                        <div>
                          <span className="text-gray-600">
                            Verification Code:
                          </span>
                          <p className="font-mono text-xs">
                            {certificate.verificationCode}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-600">Downloads:</span>
                        <p className="font-medium">
                          {certificate.downloadCount || 0} times
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Verification */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-bold text-green-800">
                      Verified Certificate
                    </h3>
                  </div>
                  <p className="text-sm text-green-700">
                    This certificate has been verified and is authentic.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                © 2024 {orgData?.name || "Certificate Platform"}. All rights
                reserved.
              </p>
              <p className="text-sm text-gray-500">
                This digital certificate is powered by a secure verification
                platform
              </p>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
};

export default StudentCertificate;