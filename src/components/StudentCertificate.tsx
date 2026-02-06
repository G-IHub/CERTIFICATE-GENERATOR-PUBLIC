import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { useParams, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
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
import { toJpeg } from "html-to-image";
import logo from "../assets/logo.png";

interface StudentCertificateProps {
  subsidiaries: Subsidiary[];
}

// Platform promo settings (change the URL and name as needed)
const PLATFORM_NAME = "Certifyer";
const PLATFORM_URL = "https://certifyer.online";

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
  restrictDownload?: boolean; // NEW: Whether downloads are restricted
  allowedEmails?: string[]; // NEW: List of allowed student emails
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
  const [enteredEmail, setEnteredEmail] = useState("");
  const [showNameForm, setShowNameForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [templateConfig, setTemplateConfig] = useState<any>(null); // Template config from backend
  const certificateRef = useRef<HTMLDivElement>(null); // Ref for PNG download
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchCertificate = async () => {
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
          isAlreadyDecoded,
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
              timeRemaining / (1000 * 60 * 60 * 24),
            );
            console.log(`⏰ Link valid for ${daysRemaining} more days`);
          }

          actualCertificateId = decryptedData.certificateId;
        } else {
          console.error(
            "❌ Failed to decrypt certificate URL - link may be invalid or expired",
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
            cert.studentName || "(none - will prompt)",
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
            restrictDownload: cert.restrictDownload || false, // Download restriction flag
            allowedEmails: cert.allowedEmails || [], // List of allowed emails
          };

          console.log("📋 Template Info:", {
            templateId: cert.template,
            hasCustomConfig: !!cert.customTemplateConfig,
          });

          console.log("🔒 Restriction Info:", {
            restrictDownload: cert.restrictDownload || false,
            allowedEmailsCount: cert.allowedEmails?.length || 0,
            allowedEmails: cert.allowedEmails || [],
          });

          setCertificate(certificateData);
          if (cert.customTemplateConfig) {
            console.log(
              "🎨 Certificate has customTemplateConfig - using saved design",
            );
            console.log(
              "🎨 Custom config keys:",
              Object.keys(cert.customTemplateConfig),
            );
            console.log(
              "⚠️ NOT loading template from global library (would overwrite)",
            );
            // Don't load from global library - certificate already has the config
          } else if (cert.template && cert.template.match(/^template\d+$/)) {
            // Only load from global library if no customTemplateConfig
            console.log(
              "📋 No customTemplateConfig - loading template from backend:",
              cert.template,
            );
            try {
              const templateResponse = await templateApi.getById(cert.template);
              if (templateResponse.template) {
                setTemplateConfig(templateResponse.template.config);
                console.log(
                  "✅ Template config loaded from global library:",
                  templateResponse.template.name,
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
              "📄 Will display certificate directly (no name entry needed)",
            );
          }
        } else {
          toast.error(
            "Certificate not found - this certificate may not exist in the database",
          );
        }
      } catch (error: any) {
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
      }
    };

    fetchCertificate();
  }, [certificateId]);

  // Helper function to wait for images to load
  const waitForImages = async (container: HTMLElement) => {
    const imgs = Array.from(container.querySelectorAll("img"));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            if ((img as HTMLImageElement).complete) return resolve();
            (img as HTMLImageElement).addEventListener(
              "load",
              () => resolve(),
              { once: true },
            );
            (img as HTMLImageElement).addEventListener(
              "error",
              () => resolve(),
              { once: true },
            );
          }),
      ),
    );
  };

  // Replace or set crossOrigin on images to avoid canvas tainting during export
  const sanitizeImagesForExport = async (container: HTMLElement) => {
    const TRANSPARENT_PNG =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    const imgs = Array.from(
      container.querySelectorAll("img"),
    ) as HTMLImageElement[];

    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((resolve) => {
            try {
              // If src is absolute and cross-origin, try to request it with anonymous CORS
              const src = img.src || "";
              const isAbsolute = /^https?:\/\//i.test(src);
              const sameOrigin = src.startsWith(window.location.origin);

              if (isAbsolute && !sameOrigin) {
                img.crossOrigin = "anonymous";
                // Force a reload with cache-bust to attempt CORS fetch
                const cacheBusted =
                  src + (src.includes("?") ? "&" : "?") + "_cb=" + Date.now();
                const onload = () => {
                  img.removeEventListener("error", onerror);
                  resolve();
                };
                const onerror = () => {
                  // Replace problematic image with a 1x1 transparent pixel so canvas isn't tainted
                  try {
                    img.src = TRANSPARENT_PNG;
                  } catch (_) {
                    // ignore
                  }
                  img.removeEventListener("load", onload);
                  resolve();
                };

                img.addEventListener("load", onload, { once: true });
                img.addEventListener("error", onerror, { once: true });
                // Reassign to trigger CORS-enabled request
                try {
                  img.src = cacheBusted;
                } catch {
                  // ignore
                }
                // Safety timeout in case neither load nor error fires
                setTimeout(() => resolve(), 2500);
              } else {
                // Local or data URIs are fine
                resolve();
              }
            } catch (e) {
              resolve();
            }
          }),
      ),
    );
  };

  // Disable cross-origin stylesheets temporarily to avoid SecurityError when
  // html-to-image tries to read cssRules from remote stylesheets (e.g., Google
  // Fonts). Returns a list of sheets that were disabled so they can be re-enabled.
  const disableCrossOriginStyleSheets = (): CSSStyleSheet[] => {
    const disabled: CSSStyleSheet[] = [];
    try {
      const sheets = Array.from(document.styleSheets as any) as CSSStyleSheet[];
      sheets.forEach((sheet: any) => {
        try {
          const href = sheet?.href;
          if (href) {
            const sheetOrigin = new URL(href, window.location.href).origin;
            if (sheetOrigin !== window.location.origin) {
              // Disable the stylesheet to prevent cssRules access
              if (sheet.disabled !== undefined) {
                sheet.disabled = true;
                disabled.push(sheet as CSSStyleSheet);
              }
            }
          }
        } catch (e) {
          // ignore any access errors and continue
        }
      });
    } catch (e) {
      // ignore
    }
    return disabled;
  };

  // Render certificate offscreen at fixed size
  const renderCertificateOffscreen = useCallback(async (): Promise<string> => {
    if (!certificate) throw new Error("No certificate data");

    // Offscreen container (render in viewport but invisible for reliable layout)
    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.width = "1000px"; // design width
    container.style.height = "600px"; // design height
    // container.style.background = "#ffffff";
    container.style.padding = "0";
    container.style.margin = "0";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    const root = createRoot(container);
    const cleanup = () => {
      try {
        root.unmount();
      } catch {
        // offscreen root unmount error
      }
      try {
        container.remove();
      } catch {
        // offscreen container remove error
      }
    };

    try {
      root.render(
        <div
          id="export-root"
          style={{
            width: "1000px",
            height: "600px",
            background: "#ffffff",
            overflow: "hidden",
          }}
        >
          <CertificateRenderer
            templateId={
              certificate.template || progData?.template || "template1"
            }
            header={
              certificate.certificateHeader || "Certificate of Completion"
            }
            courseTitle={certificate.courseName || progData?.name || "Course"}
            description={
              certificate.courseDescription || progData?.description || ""
            }
            date={certificate.completionDate}
            recipientName={certificate.studentName || enteredName || "Student"}
            isPreview={false}
            mode="template-selection"
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
        </div>,
      );

      // Let React paint
      await new Promise((r) => setTimeout(r, 50));

      // Ensure fonts and images are ready
      type DocumentWithFonts = Document & {
        fonts?: { ready?: Promise<unknown> };
      };
      const docWithFonts = document as DocumentWithFonts;
      if (docWithFonts.fonts?.ready) {
        try {
          await docWithFonts.fonts.ready;
        } catch {
          // fonts.ready wait failed
        }
      }
      const target =
        (container.querySelector(
          '#export-root [class*="w-[1000px]"][class*="h-[600px]"]',
        ) as HTMLElement) ||
        (container.querySelector("#export-root") as HTMLElement) ||
        container;
      try {
        await sanitizeImagesForExport(target as HTMLElement);
      } catch (e) {
        // sanitization failed — continue and attempt to wait for images
      }

      await waitForImages(target as HTMLElement);

      // Measure the actual rendered size of the certificate inside the offscreen container
      const measuredRect = (target as HTMLElement).getBoundingClientRect();
      const measuredWidth = Math.max(1, Math.round(measuredRect.width));
      const measuredHeight = Math.max(1, Math.round(measuredRect.height));

      // Ensure the offscreen container matches the measured size to avoid extra whitespace
      container.style.width = `${measuredWidth}px`;
      container.style.height = `${measuredHeight}px`;

      let dataUrl: string;
      try {
        // Disable cross-origin stylesheets so html-to-image doesn't try to
        // access cssRules on remote sheets (which throws SecurityError).
        const disabled = disableCrossOriginStyleSheets();
        try {
          const pr = Math.min(2, window.devicePixelRatio || 1);
          dataUrl = await toJpeg(target as HTMLElement, {
            cacheBust: true,
            backgroundColor: "#ffffff",
            width: measuredWidth,
            height: measuredHeight,
            pixelRatio: pr,
          });

          // Attempt to crop to the inner certificate element if present
          const cropElem =
            (target.querySelector(":scope > *") as HTMLElement) || target;
          if (cropElem && cropElem !== target) {
            const containerRect = (
              target as HTMLElement
            ).getBoundingClientRect();
            const cropRect = cropElem.getBoundingClientRect();
            const offsetX = cropRect.left - containerRect.left;
            const offsetY = cropRect.top - containerRect.top;
            try {
              dataUrl = await cropDataUrl(
                dataUrl,
                offsetX * pr,
                offsetY * pr,
                cropRect.width * pr,
                cropRect.height * pr,
              );
            } catch (e) {
              // If cropping fails, fall back to full image
              console.warn("Cropping offscreen image failed:", e);
            }
          }
        } finally {
          // Re-enable any disabled stylesheets
          try {
            disabled.forEach((s) => (s.disabled = false));
          } catch (_) {
            // ignore
          }
        }
      } catch (err: any) {
        console.error("Error generating image in offscreen render:", err);
        throw err;
      }
      return dataUrl;
    } finally {
      cleanup();
    }
  }, [certificate]);

  // Crop a dataURL image to the specified rectangle (coordinates relative to the
  // full image). Returns a new dataURL for the cropped area.
  const cropDataUrl = async (
    dataUrl: string,
    cropX: number,
    cropY: number,
    cropW: number,
    cropH: number,
  ): Promise<string> => {
    return await new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = Math.max(1, Math.round(cropW));
          canvas.height = Math.max(1, Math.round(cropH));
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas context unavailable"));
          ctx.drawImage(
            img,
            Math.round(cropX),
            Math.round(cropY),
            Math.round(cropW),
            Math.round(cropH),
            0,
            0,
            Math.round(cropW),
            Math.round(cropH),
          );
          const out = canvas.toDataURL("image/jpeg", 0.92);
          resolve(out);
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(new Error("Failed to load generated image"));
      // Ensure same-origin for canvas usage
      img.crossOrigin = "anonymous";
      img.src = dataUrl;
    });
  };

  // Capture the on-screen certificate by normalizing transforms/sizes temporarily
  const captureOnscreenNormalized = useCallback(async (): Promise<string> => {
    const root = certificateRef.current as HTMLElement | null;
    if (!root) throw new Error("No onscreen certificate ref");

    // Try to locate the inner certificate canvas
    const target =
      (root.querySelector(
        '[class*="w-[1000px]"][class*="h-[600px]"]',
      ) as HTMLElement) || root;

    // Save previous inline styles to restore later
    const prev: Record<string, string> = {
      transform: target.style.transform,
      width: target.style.width,
      height: target.style.height,
      marginLeft: target.style.marginLeft,
    };
    const child = target.firstElementChild as HTMLElement | null;
    const prevChild: Record<string, string> = child
      ? {
          transform: child.style.transform,
          width: child.style.width,
          height: child.style.height,
          marginLeft: child.style.marginLeft,
        }
      : {};

    try {
      // Neutralize preview scaling/offsets so the capture area is exact
      target.style.marginLeft = "0";
      // Calculate actual sizes from the DOM so capture matches the visible certificate
      const targetRect = target.getBoundingClientRect();
      const targetWidth = Math.round(targetRect.width);
      const targetHeight = Math.round(targetRect.height);
      if (child) {
        child.style.transform = "none";
        child.style.width = `${targetWidth}px`;
        child.style.height = `${targetHeight}px`;
        child.style.marginLeft = "0";
      }

      // Ensure assets ready
      type DocumentWithFonts = Document & {
        fonts?: { ready?: Promise<unknown> };
      };
      const docWithFonts = document as DocumentWithFonts;
      if (docWithFonts.fonts?.ready) {
        try {
          await docWithFonts.fonts.ready;
        } catch {
          // fonts.ready wait failed (onscreen)
        }
      }
      try {
        await sanitizeImagesForExport(target);
      } catch (e) {
        // ignore
      }

      await waitForImages(target);

      let dataUrl: string;
      try {
        // Disable cross-origin stylesheets to prevent SecurityError during
        // css inlining by html-to-image, then re-enable afterwards.
        const disabled = disableCrossOriginStyleSheets();
        try {
          const pr = Math.min(2, window.devicePixelRatio || 1);
          dataUrl = await toJpeg(target, {
            cacheBust: true,
            backgroundColor: "#ffffff",
            width: targetWidth,
            height: targetHeight,
            pixelRatio: pr,
          });

          // Crop to inner certificate element if available (remove surrounding whitespace)
          const cropElem =
            (target.querySelector(":scope > *") as HTMLElement) || target;
          if (cropElem && cropElem !== target) {
            const containerRect = (
              target as HTMLElement
            ).getBoundingClientRect();
            const cropRect = cropElem.getBoundingClientRect();
            const offsetX = cropRect.left - containerRect.left;
            const offsetY = cropRect.top - containerRect.top;
            try {
              dataUrl = await cropDataUrl(
                dataUrl,
                offsetX * pr,
                offsetY * pr,
                cropRect.width * pr,
                cropRect.height * pr,
              );
            } catch (e) {
              console.warn("Cropping onscreen image failed:", e);
            }
          }
        } finally {
          try {
            disabled.forEach((s) => (s.disabled = false));
          } catch (_) {
            // ignore
          }
        }
      } catch (err: any) {
        console.error("Error generating image from onscreen capture:", err);
        throw err;
      }
      return dataUrl;
    } finally {
      // Restore styles
      target.style.transform = prev.transform;
      target.style.width = prev.width;
      target.style.height = prev.height;
      target.style.marginLeft = prev.marginLeft;
      if (child) {
        child.style.transform = prevChild.transform || "";
        child.style.width = prevChild.width || "";
        child.style.height = prevChild.height || "";
        child.style.marginLeft = prevChild.marginLeft || "";
      }
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!certificate) {
      toast.error("Certificate not ready for download");
      return;
    }

    setIsDownloading(true);
    toast.info("Generating image...");

    // Try on-screen capture first (usually more robust), then offscreen fallback
    captureOnscreenNormalized()
      .catch((err) => {
        console.warn(
          "Onscreen capture failed, falling back to offscreen:",
          err,
        );
        return renderCertificateOffscreen();
      })
      .then((dataUrl) => {
        const courseName =
          certificate?.courseName ||
          certificate?.program?.name ||
          "Certificate";
        const namePart = (
          certificate.studentName ||
          enteredName ||
          "Student"
        ).replace(/\s+/g, "_");
        const fileName = `${courseName.replace(/\s+/g, "_")}_${namePart}.jpeg`;

        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        toast.success("Certificate downloaded as image!");
      })
      .catch((err) => {
        console.error("Error generating certificate image:", err);
        const msg =
          err?.message ||
          "An error occurred while generating your certificate. Please try again.";
        toast.error(msg);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, [certificate, captureOnscreenNormalized, renderCertificateOffscreen]);

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
          shareUrl,
        )}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          text,
        )}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          shareUrl,
        )}&summary=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(
          text + " " + shareUrl,
        )}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent(
          "My Certificate Achievement",
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
    const orgLogo =
      certificate.subsidiary?.logo || certificate.organization?.logo;

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!enteredName.trim()) {
        toast.error("Please enter your name");
        return;
      }

      // NEW: Check if download is restricted and validate email
      if (certificate.restrictDownload) {
        console.log("🔒 Download restriction check:");
        console.log("  - Restrict Download:", certificate.restrictDownload);
        console.log("  - Allowed Emails:", certificate.allowedEmails);

        if (!enteredEmail.trim()) {
          toast.error("Email address is required for this certificate");
          return;
        }

        const emailLower = enteredEmail.trim().toLowerCase();
        const allowedEmails = certificate.allowedEmails || [];

        console.log("  - Entered Email (lowercased):", emailLower);
        console.log("  - Allowed Emails Array:", allowedEmails);
        console.log(
          "  - Is email in allowed list?",
          allowedEmails.includes(emailLower),
        );

        if (!allowedEmails.includes(emailLower)) {
          toast.error(
            "Sorry, you are not authorized to access this certificate. Please contact your instructor if you believe this is an error.",
          );
          return;
        }

        console.log("✅ Email validation passed!");
      }

      setIsSubmitting(true);

      try {
        // Save testimonial to backend if provided
        if (enteredTestimonial.trim()) {
          const response = await certificateApi.submitTestimonial({
            certificateId: certificate.id,
            studentName: enteredName.trim(),
            email: enteredEmail.trim() || undefined,
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
            : "Certificate personalized with your name!",
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
              {orgLogo ? (
                <img
                  src={orgLogo}
                  alt={`${orgName} logo`}
                  className="w-16 h-16 object-contain mx-auto mb-4"
                />
              ) : (
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Complete Your Certificate
              </h2>
              <p className="text-gray-600">
                For <span className="font-semibold">{courseName}</span> from{" "}
                {orgName}
              </p>
            </div>

            {certificate.restrictDownload && (
              <Alert className="mb-4 border-orange-300 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-800">
                  This certificate has restricted access. You must use an
                  approved email address to view and download it.
                </AlertDescription>
              </Alert>
            )}

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
                  htmlFor="studentEmail"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Email Address{" "}
                  {certificate.restrictDownload && (
                    <span className="text-red-500">*</span>
                  )}
                  {!certificate.restrictDownload && "(Optional)"}
                </label>
                <input
                  id="studentEmail"
                  type="email"
                  value={enteredEmail}
                  onChange={(e) => setEnteredEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isSubmitting}
                  required={certificate.restrictDownload}
                />
                {certificate.restrictDownload ? (
                  <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Email verification required - only approved students can
                    access this certificate
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    {/* Your email will only be visible to course administrators */}
                  </p>
                )}
              </div>

              {/* <div>
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
              </div> */}

              <Button
                type="submit"
                className="w-full"
                disabled={
                  !enteredName.trim() ||
                  isSubmitting ||
                  (certificate.restrictDownload && !enteredEmail.trim())
                }
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
              <Card className="w-full overflow-x-auto">
                <CardContent className="p-0">
                  <div
                    ref={certificateRef}
                    className="flex justify-center min-w-max"
                    // style={{ minWidth: "1056px", minHeight: "600px" }}
                  >
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

              {/* Promo Card: small advertisement and invite */}
              <div className="mt-4">
                <Card>
                  <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <img
                        src={logo}
                        alt="Certifyer Logo"
                        className="w-6 h-6"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-center">{PLATFORM_NAME}</h4>
                      <p className="text-sm text-center text-gray-600">
                        You want to create, issue and verify professional
                        certificates effortlessly and speedily? Try Certifyer
                        for free today.
                      </p>
                    </div>
                    <div>
                      <a
                        href={PLATFORM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button size="sm">
                          Try Certifyer
                          <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
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
                          onClick={handleDownload}
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
                              <Download className="w-4 h-4 mr-2" />
                              Download Image
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Download as high-quality image</p>
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
                        {orgData?.name || "N/A"}
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
                © 2025 {orgData?.name || "Certificate Platform"}. All rights
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