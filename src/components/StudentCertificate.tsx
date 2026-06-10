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
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import CertificateTemplate from "./CertificateTemplate";
import CertificateRenderer from "./CertificateRenderer";
import type { Subsidiary, Logo } from "../App";
import { copyToClipboard } from "../utils/clipboard";
import { certificateApi, templateApi } from "../utils/api";
import {
  decryptCertificateData,
  getCertificateLinkTimeRemaining,
} from "../utils/encryption";
import { toJpeg } from "html-to-image";
import PaystackPaymentModal from "./PaystackPaymentModal";
import { certificatePaymentApi } from "../utils/monetizationApi";

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
  monetizationEnabled?: boolean; // NEW: Whether payment is required
  certificatePriceMinor?: number; // NEW: Price in kobo (NGN)
  certificatePriceUSDMinor?: number; // NEW: Price in cents (USD)
  certificateCurrency?: string; // legacy field kept for compatibility
  paymentStatus?: string; // NEW: Payment status (paid/unpaid)
  themeColors?: any; // Theme colors
  linkedProductId?: string; // Linked digital product
  linkedProductOrgId?: string; // Org ID for linked product
  logos?: Logo[]; // Organization logos
}

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
        const out = canvas.toDataURL("image/jpeg", 50.92);
        resolve(out);
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = (e) => reject(new Error("Failed to load generated image"));
    img.crossOrigin = "anonymous";
    img.src = dataUrl;
  });
};

const StudentCertificate: React.FC<StudentCertificateProps> = ({
  subsidiaries,
}) => {
  const params = useParams();
  const location = useLocation();

  // Handle both encrypted and legacy URL formats
  // Encrypted: /certificate/{encryptedData}
  // Legacy 1: /certificate/{orgId}/{courseId}/{certId}
  // Legacy 2: /certificate/{orgId}/{certId}
  const wildcardParam = params["*"];
  
  let subsidiaryId = params.subsidiaryId;
  let certificateId = params.certificateId;
  let courseId = params.courseId;

  let decryptedData: any = null;

  // Attempt decryption first if we have a wildcard parameter and no explicit certificate ID
  if (wildcardParam && !certificateId) {
    console.log("🔐 Component Level: Attempting to decrypt wildcardParam...");
    const isAlreadyDecoded = !wildcardParam.includes("%");
    const paramToDecrypt = isAlreadyDecoded
      ? encodeURIComponent(wildcardParam)
      : wildcardParam;

    decryptedData = decryptCertificateData(paramToDecrypt);

    if (decryptedData) {
      console.log("✅ Component Level: Decryption successful!");
      subsidiaryId = decryptedData.organizationId;
      certificateId = decryptedData.certificateId;
    } else {
      console.log("ℹ️ Component Level: Decryption failed, falling back to legacy path parsing");
      // Fallback: Split by '/' if it's the legacy route
      const parts = wildcardParam.split("/").filter(Boolean);
      if (parts.length === 3) {
        // orgId/courseId/certId
        subsidiaryId = parts[0];
        courseId = parts[1];
        certificateId = parts[2];
      } else if (parts.length === 2) {
        // orgId/certId
        subsidiaryId = parts[0];
        certificateId = parts[1];
      }
    }
  }

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
  const [fontsLoaded, setFontsLoaded] = useState(false); // Track font loading

  // New testimonial fields
  const [enteredTitle, setEnteredTitle] = useState("");
  const [enteredOrganization, setEnteredOrganization] = useState("");
  const [enteredImpact, setEnteredImpact] = useState("");

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryRef, setRecoveryRef] = useState("");
  const [recovering, setRecovering] = useState(false);

  // Security state
  const [devToolsOpen, setDevToolsOpen] = useState(false);

  const displayName = certificate?.studentName || enteredName || "Student";
  const orgData = certificate?.subsidiary || certificate?.organization;

  // Preload fonts to prevent text shift on first download
  useEffect(() => {
    const preloadFonts = async () => {
      type DocumentWithFonts = Document & {
        fonts?: {
          ready?: Promise<unknown>;
          load?: (font: string) => Promise<unknown>;
        };
      };
      const docWithFonts = document as DocumentWithFonts;

      if (docWithFonts.fonts?.ready) {
        try {
          // Wait for all fonts to be ready
          await docWithFonts.fonts.ready;

          // Additionally, explicitly load common certificate fonts
          const fontsToLoad = [
            '16px "Great Vibes"',
            '16px "Playfair Display"',
            '16px "Cinzel"',
            '16px "Cormorant Garamond"',
            '16px "EB Garamond"',
            '16px "Libre Baskerville"',
            '16px "Merriweather"',
            '16px "Lora"',
            '16px "Crimson Text"',
            '16px "Dancing Script"',
          ];

          if (docWithFonts.fonts?.load) {
            await Promise.all(
              fontsToLoad.map((font) =>
                docWithFonts.fonts!.load!(font).catch(() => {
                  // Ignore font load errors
                }),
              ),
            );
          }

          // Small delay to ensure fonts are fully applied
          await new Promise((resolve) => setTimeout(resolve, 100));
          setFontsLoaded(true);
        } catch (error) {
          console.warn("Font preloading failed:", error);
          // Set to true anyway to not block the UI
          setFontsLoaded(true);
        }
      } else {
        // No font API support, set to true
        setFontsLoaded(true);
      }
    };

    preloadFonts();
  }, []);

  // ── Security: Block print-to-PDF (Ctrl+P / browser print)
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'cert-print-block';
    style.innerHTML = `@media print { body { display: none !important; } }`;
    document.head.appendChild(style);
    return () => {
      document.getElementById('cert-print-block')?.remove();
    };
  }, []);

  // ── Security: Soft DevTools detection (window size heuristic)
  useEffect(() => {
    const THRESHOLD = 160;
    const check = () => {
      const open =
        window.outerWidth - window.innerWidth > THRESHOLD ||
        window.outerHeight - window.innerHeight > THRESHOLD;
      setDevToolsOpen((prev) => {
        if (open && !prev) {
          toast.warning(
            "⚠️ Developer tools detected. Certificate content is protected.",
            { duration: 4000, id: 'devtools-warn' }
          );
        }
        return open;
      });
    };
    check();
    const id = setInterval(check, 2000);
    return () => clearInterval(id);
  }, []);

  // ── Security: Block common developer tools shortcuts & print screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
      }
      // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
      if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
        e.preventDefault();
      }
      // Ctrl+U (View Source)
      if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        try {
          navigator.clipboard.writeText('');
        } catch (err) {}
        toast.warning("Screenshots are disabled for security reasons.");
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const fetchCertificate = async () => {
      let actualCertificateId: string | null = null;

      if (decryptedData) {
        console.log("✅ Using decrypted certificate ID:", decryptedData.certificateId);
        actualCertificateId = decryptedData.certificateId;

        // Check expiration (wildcardParam should exist when decryptedData is set)
        if (wildcardParam) {
          const timeRemaining = getCertificateLinkTimeRemaining(
            wildcardParam.includes("%")
              ? wildcardParam
              : encodeURIComponent(wildcardParam),
          );
          if (timeRemaining !== null) {
            const daysRemaining = Math.floor(
              timeRemaining / (1000 * 60 * 60 * 24),
            );
            console.log(`⏰ Link valid for ${daysRemaining} more days`);
          }
        }
      } else if (certificateId) {
        // Legacy format: /certificate/{orgId}/{certId}
        console.log("📄 Using legacy URL format");
        actualCertificateId = certificateId;
      } else if (wildcardParam) {
        // Decryption failed and legacy parsing failed (or empty)
        console.error(
          "❌ Failed to decrypt certificate URL - link may be invalid or expired",
        );
        toast.error("Invalid or expired certificate link");
        setLoading(false);
        return;
      } else {
        console.log("⚠️ No certificate ID or encrypted data provided");
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

        // Check if payment is required
        if (response.paymentRequired) {
          console.log("💰 Payment required for certificate");
          const cert = response.certificate;

          // Set minimal certificate data to show the payment form
          const certificateData: CertificateData = {
            id: cert.id,
            courseName: cert.courseName,
            certificateHeader: cert.certificateHeader,
            completionDate: new Date().toISOString(),
            monetizationEnabled: true,
            certificatePriceMinor: cert.certificatePriceMinor,
            certificatePriceUSDMinor: cert.certificatePriceUSDMinor,
            certificateCurrency: cert.certificateCurrency,
            paymentStatus: "unpaid",
          };

          setCertificate(certificateData);
          setShowNameForm(true); // Show name form which will then lead to payment
          setLoading(false);
          return;
        }

        if (response.certificate) {
          console.log("✅ Certificate data received from backend");
          const cert = response.certificate;
          const org = response.organization;
          console.log("📄 Certificate details:");
          console.log("   - ID:", cert.id);
          console.log(
            "   - Student Name:",
            cert.studentName || "(none - will prompt)",
          );
          console.log("   - Course Name:", cert.courseName);
          console.log("   - Certificate Header:", cert.certificateHeader);
          console.log("   - Organization ID:", cert.organizationId);
          console.log("   - Organization Name:", org?.name || "(not found)");
          console.log("   - Completion Date:", cert.completionDate);

          // Map backend response to CertificateData format
          const certificateData: CertificateData = {
            id: cert.id,
            studentName: cert.studentName, // May be undefined for new format
            email: cert.email,
            courseName: cert.courseName, // New format
            certificateHeader: cert.certificateHeader, // New format
            courseDescription: cert.courseDescription, // New format
            subsidiary: org,
            organization: org,
            completionDate: cert.completionDate,
            issuedDate: cert.generatedAt,
            generatedAt: cert.generatedAt,
            status: cert.status === "active" ? "valid" : cert.status,
            verificationCode: "VER-" + cert.id.slice(-8),
            downloadCount: cert.downloadCount || 0,
            lastAccessed: new Date().toISOString(),

            organizationId: cert.organizationId,
            template: cert.template, // Template ID from backend
            customTemplateConfig: cert.customTemplateConfig, // Custom template config if exists
            signatories: cert.signatories || [], // Signatories from backend
            restrictDownload: cert.restrictDownload || false, // Download restriction flag
            allowedEmails: cert.allowedEmails || [], // List of allowed emails
            monetizationEnabled: cert.monetizationEnabled || false, // Payment requirement flag
            certificatePriceMinor: cert.certificatePriceMinor || 0, // Price in kobo (NGN)
            certificatePriceUSDMinor: cert.certificatePriceUSDMinor || 0, // Price in cents (USD)
            certificateCurrency: cert.certificateCurrency || "NGN", // legacy
            paymentStatus: cert.paymentStatus || "unpaid", // Payment status
            themeColors: cert.themeColors, // Theme colors
            linkedProductId: cert.linkedProductId || undefined,
            linkedProductOrgId: cert.orgId || cert.organizationId || undefined,
            logos: cert.logos || org?.settings?.logos || [],
          };

          setCertificate(certificateData);
          if (cert.customTemplateConfig) {
            // Don't load from global library - certificate already has the config
          } else if (cert.template && cert.template.match(/^template\d+$/)) {
            try {
              const templateResponse = await templateApi.getById(cert.template);
              if (templateResponse.template) {
                setTemplateConfig(templateResponse.template.config);
              }
            } catch (error) {
              console.error("❌ Failed to load template config:", error);
            }
          }

          const isEmailVerified = sessionStorage.getItem(`ctfy_verified_email_${cert.id}`) === "true";
          const needsVerification = cert.restrictDownload && !isEmailVerified;

          if (!cert.studentName || needsVerification) {
            // Prefill student details if available on the certificate
            if (cert.studentName) setEnteredName(cert.studentName);
            if (cert.email) setEnteredEmail(cert.email);

            // Check if returning from a successful Paystack payment for this cert
            const savedCertId = sessionStorage.getItem("ctfy_buyer_cert");
            const savedName = sessionStorage.getItem("ctfy_buyer_name");
            const savedEmail = sessionStorage.getItem("ctfy_buyer_email");
            if (
              cert.paymentStatus === "paid" &&
              savedCertId === cert.id &&
              savedName
            ) {
              setEnteredName(savedName);
              if (savedEmail) setEnteredEmail(savedEmail);
              sessionStorage.removeItem("ctfy_buyer_cert");
              sessionStorage.removeItem("ctfy_buyer_name");
              sessionStorage.removeItem("ctfy_buyer_email");
            } else {
              setShowNameForm(true);
            }
          }
        } else {
          toast.error(
            "Certificate not found - this certificate may not exist in the database",
          );
        }
      } catch (error: any) {
        if (error.message && error.message.includes("Payment is required")) {
          setShowNameForm(true);
          setLoading(false);
          return;
        }

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

  // Prevent layout shift when download starts - always reserve scrollbar space
  useEffect(() => {
    document.documentElement.style.overflowY = "scroll";
    return () => {
      document.documentElement.style.overflowY = "";
    };
  }, []);

  // Lock scroll when downloading to prevent user interaction during generation
  useEffect(() => {
    if (isDownloading) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isDownloading]);

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
              const src = img.src || "";
              const isAbsolute = /^https?:\/\//i.test(src);
              const sameOrigin = src.startsWith(window.location.origin);

              if (isAbsolute && !sameOrigin) {
                img.crossOrigin = "anonymous";
                const cacheBusted =
                  src + (src.includes("?") ? "&" : "?") + "_cb=" + Date.now();
                const onload = () => {
                  img.removeEventListener("error", onerror);
                  resolve();
                };
                const onerror = () => {
                  try {
                    img.src = TRANSPARENT_PNG;
                  } catch (_) {}
                  img.removeEventListener("load", onload);
                  resolve();
                };

                img.addEventListener("load", onload, { once: true });
                img.addEventListener("error", onerror, { once: true });
                try {
                  img.src = cacheBusted;
                } catch {}
                setTimeout(() => resolve(), 2500);
              } else {
                resolve();
              }
            } catch (e) {
              resolve();
            }
          }),
      ),
    );
  };

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
              if (sheet.disabled !== undefined) {
                sheet.disabled = true;
                disabled.push(sheet as CSSStyleSheet);
              }
            }
          }
        } catch (e) {}
      });
    } catch (e) {}
    return disabled;
  };

  // Render certificate offscreen at fixed size
  const renderCertificateOffscreen = useCallback(async (): Promise<string> => {
    if (!certificate) throw new Error("No certificate data");

    const container = document.createElement("div");
    container.style.position = "fixed";
    container.style.left = "0";
    container.style.top = "0";
    container.style.opacity = "0";
    container.style.pointerEvents = "none";
    container.style.width = "1000px";
    container.style.height = "600px";
    container.style.padding = "0";
    container.style.margin = "0";
    container.style.zIndex = "-1";
    document.body.appendChild(container);

    const root = createRoot(container);
    const cleanup = () => {
      try { root.unmount(); } catch {}
      try { container.remove(); } catch {}
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
              certificate.template || "template1"
            }
            header={
              certificate.certificateHeader || "Certificate of Completion"
            }
            courseTitle={certificate.courseName || "Course"}
            description={
              certificate.courseDescription || ""
            }
            date={certificate.completionDate}
            recipientName={displayName}
            isPreview={false}
            mode="student"
            organizationName={orgData?.name}
            organizationLogo={orgData?.logo}
            organizationLogos={certificate.logos || orgData?.settings?.logos}
            customTemplateConfig={certificate.customTemplateConfig}
            signatoryName1={certificate.signatories?.[0]?.name}
            signatoryTitle1={certificate.signatories?.[0]?.title}
            signatureUrl1={certificate.signatories?.[0]?.signatureUrl}
            signatoryName2={certificate.signatories?.[1]?.name}
            signatoryTitle2={certificate.signatories?.[1]?.title}
            signatureUrl2={certificate.signatories?.[1]?.signatureUrl}
            themeColors={certificate.themeColors || templateConfig?.colors || undefined}
            certificateId={certificate.id}
          />
        </div>,
      );

      await new Promise((r) => setTimeout(r, 50));
      const target = (container.querySelector('#export-root [class*="w-[1000px]"][class*="h-[600px]"]') as HTMLElement) || (container.querySelector("#export-root") as HTMLElement) || container;
      try { await sanitizeImagesForExport(target as HTMLElement); } catch (e) {}
      await waitForImages(target as HTMLElement);

      const measuredRect = (target as HTMLElement).getBoundingClientRect();
      const measuredWidth = Math.max(1, Math.round(measuredRect.width));
      const measuredHeight = Math.max(1, Math.round(measuredRect.height));

      container.style.width = `${measuredWidth}px`;
      container.style.height = `${measuredHeight}px`;

      let dataUrl: string;
      try {
        const disabled = disableCrossOriginStyleSheets();
        try {
          const pr = Math.min(200, window.devicePixelRatio || 1);
          dataUrl = await toJpeg(target as HTMLElement, {
            cacheBust: true,
            backgroundColor: "#ffffff",
            width: measuredWidth,
            height: measuredHeight,
            pixelRatio: pr,
            quality: .0,
          });

          const cropElem = (target.querySelector(":scope > *") as HTMLElement) || target;
          if (cropElem && cropElem !== target) {
            const containerRect = (target as HTMLElement).getBoundingClientRect();
            const cropRect = cropElem.getBoundingClientRect();
            const offsetX = cropRect.left - containerRect.left;
            const offsetY = cropRect.top - containerRect.top;
            try {
              dataUrl = await cropDataUrl(dataUrl, offsetX * pr, offsetY * pr, cropRect.width * pr, cropRect.height * pr);
            } catch (e) {
              console.warn("Cropping offscreen image failed:", e);
            }
          }
        } finally {
          try { disabled.forEach((s) => (s.disabled = false)); } catch (_) {}
        }
      } catch (err: any) {
        console.error("Error generating image in offscreen render:", err);
        throw err;
      }
      return dataUrl;
    } finally {
      cleanup();
    }
  }, [certificate, displayName, orgData]);

  const captureOnscreenNormalized = useCallback(async (): Promise<string> => {
    const root = certificateRef.current as HTMLElement | null;
    if (!root) throw new Error("No onscreen certificate ref");

    const target = (root.querySelector('[class*="w-[1000px]"][class*="h-[600px]"]') as HTMLElement) || root;

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
      target.style.marginLeft = "0";
      const targetRect = target.getBoundingClientRect();
      const targetWidth = Math.round(targetRect.width);
      const targetHeight = Math.round(targetRect.height);
      if (child) {
        child.style.transform = "none";
        child.style.width = `${targetWidth}px`;
        child.style.height = `${targetHeight}px`;
        child.style.marginLeft = "0";
      }

      await new Promise((resolve) => setTimeout(resolve, 150));
      try { await sanitizeImagesForExport(target); } catch (e) {}
      await waitForImages(target);

      let dataUrl: string;
      try {
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

          const cropElem = (target.querySelector(":scope > *") as HTMLElement) || target;
          if (cropElem && cropElem !== target) {
            const containerRect = (target as HTMLElement).getBoundingClientRect();
            const cropRect = cropElem.getBoundingClientRect();
            const offsetX = cropRect.left - containerRect.left;
            const offsetY = cropRect.top - containerRect.top;
            try {
              dataUrl = await cropDataUrl(dataUrl, offsetX * pr, offsetY * pr, cropRect.width * pr, cropRect.height * pr);
            } catch (e) {
              console.warn("Cropping onscreen image failed:", e);
            }
          }
        } finally {
          try { disabled.forEach((s) => (s.disabled = false)); } catch (_) {}
        }
      } catch (err: any) {
        console.error("Error generating image from onscreen capture:", err);
        throw err;
      }
      return dataUrl;
    } finally {
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

  const handleDownload = useCallback(async () => {
    if (!certificate) {
      toast.error("Certificate not ready for download");
      return;
    }

    const displayedName = certificate.studentName || enteredName || "Student";

    // ── Security: Name validation gate — prevent buddy punching
    const storedName = certificate.studentName;
    if (storedName) {
      const normalize = (s: string) =>
        s.trim().toLowerCase().replace(/\s+/g, ' ');
      if (normalize(storedName) !== normalize(displayedName)) {
        toast.error(
          "Name mismatch. You can only download this certificate with the name it was issued to."
        );
        return;
      }
    }

    // ── Security: DOM Modification Check
    const root = certificateRef.current;
    if (root && displayedName !== "Student") {
      const textContent = root.textContent || '';
      // A simple check to ensure the original name is still present in the DOM text
      if (!textContent.includes(displayedName)) {
        toast.error("Security alert: Certificate modification detected. Download blocked.");
        return;
      }
    }

    setIsDownloading(true);
    toast.info("Generating image...");

    if (!fontsLoaded) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Security: Force offscreen render to ignore any onscreen DOM modifications
    renderCertificateOffscreen()
      .then((dataUrl) => {
        const courseName = certificate?.courseName || "Certificate";
        const namePart = displayedName.replace(/\s+/g, "_");
        const fileName = `${courseName.replace(/\s+/g, "_")}_${namePart}.jpeg`;

        const link = document.createElement("a");
        link.download = fileName;
        link.href = dataUrl;
        link.click();
        toast.success("Certificate downloaded as image!");
      })
      .catch((err) => {
        console.error("Error generating certificate image:", err);
        const msg = err?.message || "An error occurred while generating your certificate. Please try again.";
        toast.error(msg);
      })
      .finally(() => {
        setIsDownloading(false);
      });
  }, [certificate, enteredName, renderCertificateOffscreen, fontsLoaded]);

  const handleShare = (platform: string) => {
    const shareUrl = window.location.href;
    const courseName = certificate?.courseName || "Course";
    const orgName = certificate?.subsidiary?.name || certificate?.organization?.name || "Organization";
    const text = `I've completed the ${courseName} at ${orgName}! 🎓 #Certificate #Achievement`;

    let url = "";
    switch (platform) {
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(text)}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`;
        break;
      case "whatsapp":
        url = `https://wa.me/?text=${encodeURIComponent(text + " " + shareUrl)}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent("My Certificate Achievement")}&body=${encodeURIComponent(text + "\n\n" + shareUrl)}`;
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
      case "valid": return "bg-green-100 text-green-800";
      case "revoked": return "bg-red-100 text-red-800";
      case "expired": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
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
            <h2 className="text-xl font-bold text-gray-800 mb-2">Certificate Not Found</h2>
            <p className="text-gray-600 mb-4">The certificate you're looking for doesn't exist or may have been removed.</p>
            <Button variant="outline" onClick={() => window.history.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showNameForm) {
    const orgName = certificate.subsidiary?.name || certificate.organization?.name || "this organization";
    const courseName = certificate.courseName || "this course";
    const orgLogo = certificate.subsidiary?.logo || certificate.organization?.logo;

    const handleFormSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!enteredName.trim()) {
        toast.error("Please enter your name");
        return;
      }

      if (certificate.restrictDownload) {
        if (!enteredEmail.trim()) {
          toast.error("Email address is required for this certificate");
          return;
        }
        const emailLower = enteredEmail.trim().toLowerCase();
        const allowedEmails = (certificate.allowedEmails || []).map((e) => e.trim().toLowerCase());
        const certEmailLower = certificate.email?.trim().toLowerCase();

        if (!allowedEmails.includes(emailLower) && certEmailLower !== emailLower) {
          toast.error("Sorry, you are not authorized to access this certificate. Please contact your instructor if you believe this is an error.");
          return;
        }

        // Save verification in session storage to remember across reloads/nav
        sessionStorage.setItem(`ctfy_verified_email_${certificate.id}`, "true");
      }

      setIsSubmitting(true);
      try {
        if (enteredTitle || enteredOrganization || enteredImpact.trim() || enteredTestimonial.trim()) {
          await certificateApi.submitTestimonial({
            certificateId: certificate.id,
            studentName: enteredName.trim(),
            email: enteredEmail.trim() || undefined,
            testimonial: enteredTestimonial.trim(),
            title: enteredTitle || undefined,
            organization: enteredOrganization.trim() || undefined,
            impact: enteredImpact.trim() || undefined,
            courseName: courseName,
            organizationId: certificate.organizationId || "",
          });
        }

        if (certificate.monetizationEnabled && certificate.paymentStatus !== "paid") {
          sessionStorage.setItem("ctfy_buyer_cert", certificate.id);
          sessionStorage.setItem("ctfy_buyer_name", enteredName.trim());
          sessionStorage.setItem("ctfy_buyer_email", enteredEmail.trim());
          setShowNameForm(false);
          setShowPaymentModal(true);
          toast.info("Payment required to access this certificate");
        } else {
          setShowNameForm(false);
          toast.success("Certificate personalized with your name!");
        }
      } catch (error) {
        if (certificate.monetizationEnabled && certificate.paymentStatus !== "paid") {
          setShowNameForm(false);
          setShowPaymentModal(true);
        } else {
          setShowNameForm(false);
          toast.success("Certificate personalized with your name!");
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleRecovery = async () => {
      if (!recoveryRef.trim()) return toast.error("Please enter your payment reference");
      setRecovering(true);
      try {
        await certificatePaymentApi.verify(recoveryRef.trim());
        window.location.reload();
      } catch (e: any) {
        toast.error(e.message || "Could not verify that reference. Please check it and try again.");
      } finally {
        setRecovering(false);
      }
    };

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" key="name-form-container">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              {orgLogo ? (
                <img src={orgLogo} alt={`${orgName} logo`} className="w-16 h-16 object-contain mx-auto mb-4" />
              ) : (
                <Award className="w-16 h-16 text-primary mx-auto mb-4" />
              )}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Certificate</h2>
              <p className="text-gray-600">For <span className="font-semibold">{courseName}</span> from {orgName}</p>
            </div>
            {certificate.restrictDownload && (
              <Alert className="mb-4 border-orange-300 bg-orange-50">
                <Shield className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-sm text-orange-800">
                  This certificate has restricted access. You must use an approved email address to view and download it.
                </AlertDescription>
              </Alert>
            )}
            {certificate.monetizationEnabled && certificate.paymentStatus !== "paid" && (
              <>
                <Alert className="mb-2 border-orange-300 bg-orange-50">
                  <DollarSign className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-800">
                    This certificate requires payment. {certificate.certificatePriceMinor ? `₦${((certificate.certificatePriceMinor) / 100).toLocaleString("en-NG", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : ""}
                  </AlertDescription>
                </Alert>
                {!showRecovery ? (
                  <button type="button" onClick={() => setShowRecovery(true)} className="text-xs text-orange-500 hover:underline mb-3 block">Already paid? Enter your payment reference</button>
                ) : (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
                    <p className="text-xs font-medium text-gray-700">Enter your Paystack reference (starts with CTFY_)</p>
                    <div className="flex gap-2">
                      <input type="text" value={recoveryRef} onChange={e => setRecoveryRef(e.target.value)} placeholder="CTFY_..." className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400" />
                      <button type="button" onClick={handleRecovery} disabled={recovering} className="px-3 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-60">{recovering ? "Checking..." : "Verify"}</button>
                    </div>
                    <button type="button" onClick={() => setShowRecovery(false)} className="text-xs text-gray-400 hover:text-gray-600">Cancel</button>
                  </div>
                )}
              </>
            )}
            <form onSubmit={handleFormSubmit} className="space-y-4" key="certificate-name-form">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">Full Name <span className="text-red-500">*</span></label>
                <input id="studentName" type="text" value={enteredName} onChange={(e) => setEnteredName(e.target.value)} placeholder="Enter your full name" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" autoFocus disabled={isSubmitting} />
              </div>
              <div>
                <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">Email Address {certificate.restrictDownload && <span className="text-red-500">*</span>}</label>
                <input id="studentEmail" type="email" value={enteredEmail} onChange={(e) => setEnteredEmail(e.target.value)} placeholder="your.email@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" disabled={isSubmitting} required={certificate.restrictDownload} />
              </div>
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Your Feedback (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                    <select id="title" value={enteredTitle} onChange={(e) => setEnteredTitle(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white" disabled={isSubmitting}>
                      <option value="">Select title</option>
                      <option value="Mr">Mr</option>
                      <option value="Miss">Miss</option>
                      <option value="Mrs">Mrs</option>
                      <option value="Dr">Dr</option>
                      <option value="Prof">Prof</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">Your Organization/Institution/Affiliation</label>
                    <input id="organization" type="text" value={enteredOrganization} onChange={(e) => setEnteredOrganization(e.target.value)} placeholder="e.g., ABC University, XYZ Corporation" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" disabled={isSubmitting} />
                  </div>
                  <div>
                    <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-2">Impact</label>
                    <textarea id="impact" value={enteredImpact} onChange={(e) => setEnteredImpact(e.target.value)} placeholder="Share your experience..." rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none" disabled={isSubmitting} />
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={!enteredName.trim() || isSubmitting || (certificate.restrictDownload && !enteredEmail.trim())}>
                {isSubmitting ? "Submitting..." : "View My Certificate"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (showPaymentModal && certificate.monetizationEnabled && certificate.paymentStatus !== "paid") {
    return (
      <PaystackPaymentModal
        itemId={certificate.id}
        paymentType="certificate"
        itemName={certificate.courseName || "Certificate"}
        priceKobo={certificate.certificatePriceMinor || 0}
        priceUSDCents={certificate.certificatePriceUSDMinor || 0}
        email={enteredEmail}
        buyerName={enteredName}
        onPaymentComplete={() => {
          setPaymentCompleted(true);
          setShowPaymentModal(false);
          setCertificate((prev) => (prev ? { ...prev, paymentStatus: "paid" } : null));
          toast.success("Payment successful! You can now view your certificate.");
        }}
        onClose={() => {
          setShowPaymentModal(false);
          setShowNameForm(true);
        }}
      />
    );
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-4">
                {orgData?.logo && <img src={orgData.logo} alt={orgData.name} className="h-10 w-auto" />}
                <div>
                  <h1 className="text-lg font-bold text-gray-900">{orgData?.name || "Certificate"}</h1>
                  <p className="text-sm text-gray-500">Digital Certificate</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={getStatusColor(certificate.status || "valid")}>
                  {(certificate.status || "valid").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Card className="">
                <CardContent className="p-0 overflow-hidden">
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {/* Wrapper: right-click blocked, text selection disabled, watermark applied */}
                    <div
                      style={{ position: 'relative', width: '800px', minWidth: '800px', height: '600px', minHeight: '600px', flexShrink: 0 }}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {/* Certificate capture target — watermark is outside this ref */}
                      <div
                        ref={certificateRef}
                        className={`flex justify-center items-center transition-all duration-300 ${devToolsOpen ? 'blur-md select-none opacity-50' : ''}`}
                        style={{
                          width: '800px',
                          height: '600px',
                          userSelect: 'none',
                          WebkitTouchCallout: 'none' as any,
                        }}
                      >
                        <CertificateRenderer
                          templateId={certificate.template || "template1"}
                          header={certificate.certificateHeader || "Certificate of Completion"}
                          courseTitle={certificate.courseName || "Course"}
                          description={certificate.courseDescription || ""}
                          date={certificate.completionDate}
                          recipientName={displayName}
                          isPreview={true}
                          mode="student"
                          organizationName={orgData?.name}
                          organizationLogo={orgData?.logo}
                          organizationLogos={certificate.logos || orgData?.settings?.logos}
                          customTemplateConfig={certificate.customTemplateConfig}
                          signatoryName1={certificate.signatories?.[0]?.name}
                          signatoryTitle1={certificate.signatories?.[0]?.title}
                          signatureUrl1={certificate.signatories?.[0]?.signatureUrl}
                          signatoryName2={certificate.signatories?.[1]?.name}
                          signatoryTitle2={certificate.signatories?.[1]?.title}
                          signatureUrl2={certificate.signatories?.[1]?.signatureUrl}
                          themeColors={certificate.themeColors || templateConfig?.colors || undefined}
                          certificateId={certificate.id}
                        />
                      </div>

                      {/* ── Security: On-screen watermark overlay (NOT captured in download) */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: 'absolute',
                          inset: 0,
                          pointerEvents: 'none',
                          overflow: 'hidden',
                          zIndex: 10,
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'space-around',
                          padding: '20px 0',
                        }}
                      >
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            style={{
                              color: 'rgba(0,0,0,0.10)',
                              fontSize: 15,
                              fontWeight: 700,
                              fontFamily: 'sans-serif',
                              transform: 'rotate(-25deg)',
                              whiteSpace: 'nowrap',
                              userSelect: 'none',
                              letterSpacing: '0.05em',
                            }}
                          >
                            {displayName} &bull; {new Date().toLocaleDateString()} &bull; certifyer.online
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2">Actions</h3>
                  <div className="space-y-3">
                    <Button onClick={handleDownload} disabled={isDownloading} className="w-full">
                      {isDownloading ? "Generating..." : "Download Image"}
                    </Button>
                    <Button variant="outline" onClick={handleCopyLink} className="w-full">Copy Link</Button>
                    <Button variant="outline" onClick={() => setShowFullDetails(!showFullDetails)} className="w-full">
                      {showFullDetails ? "Hide" : "Show"} Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {certificate.linkedProductId && (
                <div style={{ background: "#4f46e5", borderRadius: 12, padding: 20, color: "white" }}>
                  <p style={{ fontWeight: 700 }}>Get the Full Course Bundle</p>
                  <a href={`/store/${certificate.linkedProductOrgId || certificate.organizationId}/${certificate.linkedProductId}`}>View Bundle →</a>
                </div>
              )}

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-bold mb-4">Certificate Info</h3>
                  <div className="space-y-3 text-sm">
                    <p>Student: {displayName}</p>
                    <p>Organization: {orgData?.name || "N/A"}</p>
                    <p>Completed: {formatDate(certificate.completionDate)}</p>
                  </div>
                  {showFullDetails && (
                    <div className="mt-4 pt-4 border-t space-y-3 text-sm">
                      <div>
                        <span className="text-gray-600">Issued On:</span>
                        <p>{formatDate(certificate.issuedDate)}</p>
                      </div>
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