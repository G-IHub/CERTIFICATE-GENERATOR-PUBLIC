import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { isOrgPremium } from "../utils/subscriptionUtils";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { useIsMobile } from "./ui/use-mobile";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  Award,
  Users,
  Share2,
  TrendingUp,
  Building2,
  Plus,
  Shield,
  ChevronDown,
  Globe,
  Zap,
  Eye,
  Download,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Upload,
  Camera,
  Video,
  Star,
  Heart,
  Play,
  CheckCircle,
  ExternalLink,
  PieChart,
  Calendar,
  Clock,
  Target,
  Search,
  Filter,
  MoreHorizontal,
  Copy,
  Send,
  RefreshCw,
  Trash2,
  Edit,
  Mail,
  User,
  FileCheck,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Palette,
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import CertificateTemplate from "./CertificateTemplate";
import CertificateRenderer from "./CertificateRenderer";
import TemplatesPage from "./TemplatesPage";
import CertificateGenerationModal from "./CertificateGenerationModal";
import { Skeleton } from "./ui/skeleton";
import TestimonialsSkeleton from "./skeletons/TestimonialsSkeleton";
import AnalyticsSkeleton from "./skeletons/AnalyticsSkeleton";
import SettingsSkeleton from "./skeletons/SettingsSkeleton";
import BillingSkeleton from "./skeletons/BillingSkeleton";

// Lazy-load heavy/dashboard tab components to improve initial render performance
const BillingPage = React.lazy(() => import("./BillingPage"));
const TemplateBuilderPage = React.lazy(() => import("./TemplateBuilderPage"));
const TestimonialsView = React.lazy(() => import("./TestimonialsView"));
const AnalyticsView = React.lazy(() => import("./AnalyticsView"));
const OrganizationSettings = React.lazy(() => import("./OrganizationSettings"));
import type { Program, Subsidiary, UserProfile } from "../App";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell,
} from "recharts";
import { copyToClipboard } from "../utils/clipboard";
import { certificateApi } from "../utils/api";
import { projectId } from "../utils/supabase/info";
import {
  generateSecureCertificateUrl,
  generateCertificateId,
  buildFullCertificateUrl,
  normalizeCertificateUrl,
} from "../utils/certificateUtils";
import logo from "../assets/logo.svg";
// import Footer from "../components/landing/Footer";

// Organization is the new name for Subsidiary
type Organization = Subsidiary;

// Figma asset imports are not available at runtime in this environment.
// Use stable placeholder URLs for the logos. Replace with local public assets
// (for example '/images/default-org-logo.png') if you add them to the public folder.
const defaultOrgLogo = "https://via.placeholder.com/256x256.png?text=Org+Logo";
const certifyerLogo = logo;

interface AdminDashboardProps {
  user: UserProfile;
  subsidiaries: Organization[]; // Will rename to organizations
  userProfiles: UserProfile[];
  onLogout: () => void;
  onUpdateSubsidiary: (
    organizationId: string,
    updates: Partial<Organization>
  ) => void;
  onAddProgram: (organizationId: string, newProgram: Program) => void;
  onUpdateProgramStats: (
    organizationId: string,
    programId: string,
    certificateCount: number
  ) => void;
  onUpdateProgram: (
    organizationId: string,
    programId: string,
    updates: Partial<Program>
  ) => void;
  onCreateOrganization?: (name: string) => void;
  accessToken: string | null;
}

interface ExtendedProgram extends Program {
  organizationName?: string;
  organizationId?: string;
}

interface GeneratedCertificate {
  id: string;
  studentName?: string; // Legacy field - for old certificates
  email?: string; // Legacy field - for old certificates
  courseName?: string; // New field - for new certificate links
  certificateHeader?: string; // New field - for new certificate links
  courseDescription?: string; // New field - for new certificate links
  completionDate?: string; // New field - for new certificate links
  generatedAt: string;
  certificateUrl: string;
  program?: Program;
  organization?: Organization;
  status?: "active" | "revoked" | "expired";
  emailSent?: boolean;
  lastAccessed?: string;
  downloadCount?: number;
}

interface TestimonialData {
  id: string;
  studentName: string;
  email?: string;
  program: Program;
  organization: Organization;
  rating: number;
  text: string;
  imageUrl?: string;
  videoUrl?: string;
  isPublic: boolean;
  submittedAt: string;
  certificateId?: string;
}

export default function AdminDashboard({
  user,
  subsidiaries: organizations,
  userProfiles,
  onLogout,
  onUpdateSubsidiary: onUpdateOrganization,
  onAddProgram,
  onUpdateProgramStats,
  onUpdateProgram,
  onCreateOrganization,
  accessToken,
}: AdminDashboardProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentOrganization, setCurrentOrganization] =
    useState<Organization | null>(user.subsidiary);
  const [showOnboardingModal, setShowOnboardingModal] =
    useState<boolean>(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [navCollapsed, setNavCollapsed] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showGenerateModal, setShowGenerateModal] = useState<boolean>(false);
  const [showNewProgramModal, setShowNewProgramModal] =
    useState<boolean>(false);
  const isMobile = useIsMobile();

  // Subscription state
  const [subscription, setSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);

  // Search and filter states
  const [certificateSearch, setCertificateSearch] = useState("");
  const [certificateFilter, setCertificateFilter] = useState("all");
  const [selectedCertificates, setSelectedCertificates] = useState<string[]>(
    []
  );

  // Certificate Generation Page States
  const [genActiveTab, setGenActiveTab] = useState("setup");
  const [genCertificateHeader, setGenCertificateHeader] = useState(
    "Certificate of Completion"
  );
  const [genProgramName, setGenProgramName] = useState("");
  const [genProgramDescription, setGenProgramDescription] = useState("");
  const [genCompletionDate, setGenCompletionDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [genSelectedTemplate, setGenSelectedTemplate] = useState("");
  const [genSelectedTemplateName, setGenSelectedTemplateName] = useState("");
  const [genCustomTemplateConfig, setGenCustomTemplateConfig] =
    useState<any>(null);
  const [genStudentName, setGenStudentName] = useState("");
  const [genStudentEmail, setGenStudentEmail] = useState("");
  const [genCustomMessage, setGenCustomMessage] = useState("");
  const [genBulkStudents, setGenBulkStudents] = useState("");
  const [genGeneratedCertificates, setGenGeneratedCertificates] = useState<
    any[]
  >([]); // Current session only
  const [allCertificates, setAllCertificates] = useState<any[]>([]); // Full history from backend
  const [genIsGenerating, setGenIsGenerating] = useState(false);
  const [genShowTemplateSelector, setGenShowTemplateSelector] = useState(false);
  const [genGenerationType, setGenGenerationType] = useState<
    "individual" | "bulk"
  >("individual");
  const [isRefreshingCertificates, setIsRefreshingCertificates] =
    useState(false);
  const [hasLoadedCertificates, setHasLoadedCertificates] = useState(false);

  // Auto-load certificates when component mounts or when switching to certificates tab
  useEffect(() => {
    const loadCertificates = async () => {
      // Only load if we have the necessary data and haven't loaded yet
      if (!accessToken || !currentOrganization || hasLoadedCertificates) {
        return;
      }

      // Only load when on certificates tab or when component first mounts
      if (activeTab !== "certificates" && hasLoadedCertificates) {
        return;
      }

      setIsRefreshingCertificates(true);

      try {
        console.log(
          "📜 Loading certificates from backend for org:",
          currentOrganization.id
        );

        const response = await certificateApi.getForOrganization(
          accessToken,
          currentOrganization.id
        );

        console.log(
          "✅ Loaded certificates from backend:",
          response.certificates?.length || 0
        );

        if (response.certificates) {
          // Convert backend certificates to use encrypted URLs
          const certificatesWithEncryptedUrls = response.certificates.map(
            (cert: any) => {
              // If certificate already has an encrypted URL (starts with 'certificate/' and looks encrypted), use it
              if (cert.certificateUrl && cert.certificateUrl.includes("%")) {
                return cert;
              }

              // Otherwise, generate encrypted URL from certificate data
              const programSlug =
                cert.courseName?.toLowerCase().replace(/\s+/g, "-") ||
                cert.programId ||
                "program";
              const encryptedUrl = generateSecureCertificateUrl(
                cert.organizationId,
                programSlug,
                cert.id,
                365
              );
              const encryptedPath = encryptedUrl.replace(
                `${window.location.origin}/#/`,
                ""
              );

              return {
                ...cert,
                certificateUrl: encryptedPath,
              };
            }
          );

          setAllCertificates(certificatesWithEncryptedUrls); // Load into allCertificates, NOT genGeneratedCertificates
          setHasLoadedCertificates(true);
        } else {
          setAllCertificates([]);
          setHasLoadedCertificates(true);
        }
      } catch (error: any) {
        // Don't show toast on auto-load failures to avoid annoying users
        // The refresh button is still available if they want to manually retry
        setHasLoadedCertificates(true); // Mark as loaded even on error to prevent infinite retries
      } finally {
        setIsRefreshingCertificates(false);
      }
    };

    loadCertificates();
  }, [accessToken, currentOrganization, activeTab, hasLoadedCertificates]);

  // Reset hasLoadedCertificates when organization changes to force reload
  useEffect(() => {
    setHasLoadedCertificates(false);
  }, [currentOrganization?.id]);

  // Load subscription status
  useEffect(() => {
    const loadSubscription = async () => {
      if (!accessToken || !currentOrganization) {
        setLoadingSubscription(false);
        return;
      }

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/billing/subscription/${currentOrganization.id}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        } else {
          // Failed to load subscription, default to free
          setSubscription({
            organizationId: currentOrganization.id,
            plan: "free",
            planName: "Free Plan",
            status: "active",
          });
        }
      } catch (error) {
        console.error("Failed to load subscription:", error);
        // Default to free on error
        setSubscription({
          organizationId: currentOrganization.id,
          plan: "free",
          planName: "Free Plan",
          status: "active",
        });
      } finally {
        setLoadingSubscription(false);
      }
    };

    loadSubscription();
  }, [accessToken, currentOrganization?.id]);

  // Handle navigation from Template Builder "Use" button - CHECK ON EVERY MOUNT
  useEffect(() => {
    // Check sessionStorage for pending template selection
    const pendingSelection = sessionStorage.getItem("pendingTemplateSelection");

    console.log(
      "🔍 AdminDashboard mounted - checking for pending template selection..."
    );
    console.log("   SessionStorage value:", pendingSelection);

    if (pendingSelection) {
      try {
        const data = JSON.parse(pendingSelection);

        console.log("   Parsed data:", data);

        if (data.openGenerate && data.selectedTemplate) {
          console.log(
            "✅ Template Builder: Applying pending template selection",
            data
          );

          // Switch to generate tab
          setActiveTab("generate");

          // Pre-select the template
          setGenSelectedTemplate(data.selectedTemplate);
          setGenSelectedTemplateName(
            data.selectedTemplateName || "Custom Template"
          );

          // If template has a config, store it
          if (data.templateConfig) {
            console.log("   Loading template config:", data.templateConfig);
            setGenCustomTemplateConfig(data.templateConfig);
          }

          // Clear the pending selection
          sessionStorage.removeItem("pendingTemplateSelection");
          console.log("   ✅ Cleared sessionStorage");

          // Show success message
          toast.success(`Template "${data.selectedTemplateName}" selected!`);
        }
      } catch (error) {
        console.error("❌ Failed to parse pending template selection:", error);
        sessionStorage.removeItem("pendingTemplateSelection");
      }
    } else {
      console.log("   No pending template selection found");
    }

    // Also check location.state for react-router navigation (backup method)
    const state = location.state as any;
    if (state?.openGenerate && state?.selectedTemplate) {
      console.log("📝 Using location.state fallback method");
      // Switch to generate tab
      setActiveTab("generate");

      // Pre-select the template
      setGenSelectedTemplate(state.selectedTemplate);
      setGenSelectedTemplateName(
        state.selectedTemplateName || "Custom Template"
      );

      // Clear the navigation state to prevent re-triggering
      window.history.replaceState({}, document.title);
    }
  }, []); // Empty dependency array = run only once on mount

  // Handle payment callback - switch to billing tab when returning from Paystack
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const reference = urlParams.get("reference") || urlParams.get("trxref");
    const tabParam = urlParams.get("tab");

    // If we have a payment reference and tab=billing, switch to billing tab
    if (reference && tabParam === "billing") {
      console.log("💳 Payment callback detected - switching to billing tab");
      setActiveTab("billing");

      // Clean up URL params after a short delay to allow BillingPage to detect them
      setTimeout(() => {
        const newUrl =
          window.location.pathname + window.location.hash.split("?")[0];
        window.history.replaceState({}, document.title, newUrl);
      }, 2000);
    }
  }, []); // Run once on mount

  // Handle template selection from TemplatesPage (CRITICAL FIX - was missing!)
  const handleGenTemplateSelection = (template: any) => {
    // Store template ID
    setGenSelectedTemplate(template.id);
    setGenSelectedTemplateName(template.name);

    // For custom templates, store the full config
    if (template.type === "custom" && template.config) {
      console.log("   - Storing custom template config");
      setGenCustomTemplateConfig(template.config);
    }
    // For default templates, extract templateStyle from config
    else if (template.config?.templateStyle) {
      console.log(
        "   - Using default template style:",
        template.config.templateStyle
      );
      setGenCustomTemplateConfig(null); // Clear custom config
      // The template.id will be fetched later to get the templateStyle
    } else {
      console.log("   - No special config needed");
      setGenCustomTemplateConfig(null);
    }

    // Close the template selector dialog
    setGenShowTemplateSelector(false);

    toast.success(`Template "${template.name}" selected!`);
  };

  // Handle certificates generated (CRITICAL FIX - was missing!)
  const handleCertificatesGenerated = (
    certificates: any[],
    organization: any,
    program: any
  ) => {
    // Add to generated certificates list
    setGenGeneratedCertificates((prev) => [...prev, ...certificates]);

    // Also add to all certificates if from current organization
    if (organization.id === currentOrganization?.id) {
      setAllCertificates((prev) => [...prev, ...certificates]);
    }

    toast.success(
      `${certificates.length} certificate(s) generated successfully!`
    );
  };

  // Handle template selection from Templates tab (CRITICAL FIX - was missing!)
  const handleTemplateSelection = (template: any) => {
    console.log("🎨 Template selected in Templates tab:", template);

    // Show success message
    toast.success(
      `Template "${template.name}" selected! You can now use it to generate certificates.`
    );

    // Optionally navigate to generate tab with this template pre-selected
    setGenSelectedTemplate(template.id);
    setGenSelectedTemplateName(template.name);

    if (template.type === "custom" && template.config) {
      setGenCustomTemplateConfig(template.config);
    } else {
      setGenCustomTemplateConfig(null);
    }

    // Navigate to generate tab so user can immediately use the template
    setActiveTab("generate");
    toast.info(
      "Navigate to Generate tab to create certificates with this template"
    );
  };

  // ==================== REAL DATA - NO MOCK DATA ====================
  // All certificates are loaded from backend via useEffect (lines 290-380)
  // which fetches from certificateApi.getForOrganization() and stores in allCertificates

  // Testimonials are loaded via TestimonialsView component which fetches from backend
  // Programs and stats are from organizations prop which comes from backend

  // Filter real certificate data based on user permissions and search/filter criteria
  const getFilteredCertificates = () => {
    // Start with real certificates loaded from backend
    let filtered = allCertificates;

    // Filter by user's organization (already done by the API, but double-check)
    if (currentOrganization) {
      filtered = filtered.filter(
        (cert) => cert.organizationId === currentOrganization.id
      );
    }

    // Apply search filter
    if (certificateSearch) {
      filtered = filtered.filter((cert) => {
        const searchLower = certificateSearch.toLowerCase();
        return (
          cert.studentName?.toLowerCase().includes(searchLower) ||
          cert.email?.toLowerCase().includes(searchLower) ||
          cert.id?.toLowerCase().includes(searchLower) ||
          cert.courseName?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Apply status filter
    if (certificateFilter !== "all") {
      filtered = filtered.filter((cert) => cert.status === certificateFilter);
    }

    return filtered;
  };

  const filteredCertificates = getFilteredCertificates();

  // Helper function to normalize certificate URLs (backwards compatible with old formats)
  // Note: normalizeCertificateUrl and buildFullCertificateUrl are now imported from utils/certificateUtils

  // Certificate management functions
  const handleResendCertificate = (certificateId: string) => {
    toast.success(`Certificate email resent for ${certificateId}`);
  };

  const handleRevokeCertificate = (certificateId: string) => {
    toast.success(`Certificate ${certificateId} has been revoked`);
  };

  const handleRegenerateCertificate = (certificateId: string) => {
    toast.success(`Certificate ${certificateId} has been regenerated`);
  };

  // Calculate statistics based on current view
  const getStats = () => {
    // Users see their organization's data
    const targetOrg = currentOrganization;
    if (!targetOrg) {
      return {
        totalCertificates: 0,
        totalTestimonials: 0,
        totalPrograms: 0,
        averageEngagement: 0,
      };
    }

    return {
      totalCertificates: targetOrg.programs.reduce(
        (sum: number, p: Program) => sum + p.certificates,
        0
      ),
      totalTestimonials: targetOrg.programs.reduce(
        (sum: number, p: Program) => sum + p.testimonials,
        0
      ),
      totalPrograms: targetOrg.programs.length,
      averageEngagement: Math.floor(
        (targetOrg.programs.reduce(
          (sum: number, p: Program) => sum + p.testimonials,
          0
        ) /
          Math.max(
            targetOrg.programs.reduce(
              (sum: number, p: Program) => sum + p.certificates,
              0
            ),
            1
          )) *
          100
      ),
    };
  };

  const stats = getStats();

  // Get programs to display
  const getDisplayPrograms = (): ExtendedProgram[] => {
    // Users see their own organization's programs
    return currentOrganization?.programs || [];
  };

  const displayPrograms = getDisplayPrograms();

  // Helper function to navigate to generate page and reset workflow
  const navigateToGenerate = () => {
    setActiveTab("generate");
    setGenActiveTab("setup");
    // Optionally reset other generation state if needed
  };

  // Handle program-specific certificate generation
  const handleProgramCertificateGeneration = (program: ExtendedProgram) => {
    // If program has organizationId, use that organization
    if (program.organizationId) {
      const organization = organizations.find(
        (o) => o.id === program.organizationId
      );
      setCurrentOrganization(organization || null);
    }
    // Pre-fill the program details and navigate to generate tab
    setGenProgramName(program.name);
    setGenProgramDescription(program.description || "");
    setGenSelectedTemplate(program.template || "modern");
    setActiveTab("generate");
  };

  // Student Experience Preview Functions
  const demoOrganization = currentOrganization || organizations[0];
  const demoProgram = demoOrganization?.programs[0];

  const handleProceedToTestimonial = () => {
    if (!studentName.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setCurrentStep("testimonial");
    toast.success("Ready to share your experience!");
  };

  const handleTestimonialSubmit = () => {
    if (!testimonialData.text.trim()) {
      toast.error("Please write a testimonial");
      return;
    }

    setIsGenerating(true);

    // Simulate certificate generation after testimonial
    setTimeout(() => {
      setIsGenerating(false);
      setCurrentStep("certificate");
      toast.success("Thank you for your feedback! Your certificate is ready.");
    }, 1500);
  };

  // Certificate Generation Page Functions
  const genCurrentUserOrganization =
    currentOrganization || (organizations.length > 0 ? organizations[0] : null);

  // Note: generateCertificateId is now imported from utils/certificateUtils

  // Generate secure encrypted certificate URL
  const generateCertificateUrlSecure = (certificateId: string) => {
    if (!genCurrentUserOrganization) {
      console.error("❌ No organization selected for certificate generation");
      return "";
    }

    const programSlug = genProgramName.toLowerCase().replace(/\s+/g, "-");

    // Use encrypted URL format - more secure with expiration
    const encryptedUrl = generateSecureCertificateUrl(
      genCurrentUserOrganization.id,
      programSlug,
      certificateId,
      365 // Valid for 1 year
    );

    // Remove the origin and hash from the URL to get just the path
    return encryptedUrl.replace(`${window.location.origin}/#/`, "");
  };

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

  const genGenerateIndividualCertificate = async () => {
    if (!genProgramName.trim() || !genCertificateHeader.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!accessToken || !genCurrentUserOrganization) {
      toast.error("Please sign in to generate certificates");
      return;
    }

    setGenIsGenerating(true);

    try {
      console.log("🔄 Generating certificate with data:", {
        organizationId: genCurrentUserOrganization.id,
        courseName: genProgramName.trim(),
        certificateHeader: genCertificateHeader.trim(),
        template: genSelectedTemplate,
      });

      const response = await certificateApi.generate(accessToken, {
        organizationId: genCurrentUserOrganization.id,
        programId: undefined,
        certificateHeader: genCertificateHeader.trim(),
        courseName: genProgramName.trim(),
        courseDescription: genProgramDescription.trim(),
        completionDate: genCompletionDate,
        template: genSelectedTemplate, // Add template
        students: undefined,
      } as any);

      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("✅ CERTIFICATE GENERATION SUCCESSFUL");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━");
      console.log("📦 Response:", response);
      console.log("📊 Certificate count:", response.certificates?.length || 0);

      // Check if response has certificates
      if (!response.certificates || response.certificates.length === 0) {
        throw new Error("No certificate data returned from server");
      }

      const backendCert = response.certificates[0];
      console.log("📄 Backend certificate data:");
      console.log("   - ID:", backendCert.id);
      console.log("   - URL (backend):", backendCert.certificateUrl);
      console.log("   - Template:", backendCert.template);
      console.log("   - Course Name:", backendCert.courseName);
      console.log("   - Organization ID:", backendCert.organizationId);

      // Generate encrypted certificate URL for better security
      const programSlug = genProgramName
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-");
      const encryptedCertUrl = generateSecureCertificateUrl(
        backendCert.organizationId,
        programSlug,
        backendCert.id,
        365 // Valid for 1 year
      );

      // Extract just the path (remove origin and hash)
      const encryptedPath = encryptedCertUrl.replace(
        `${window.location.origin}/#/`,
        ""
      );
      console.log("🔐 Generated encrypted URL path:", encryptedPath);

      const certificate = {
        ...response.certificates[0],
        certificateUrl: encryptedPath, // Use encrypted URL instead of plain backend URL
        courseName: genProgramName.trim(),
        certificateHeader: genCertificateHeader.trim(),
        courseDescription: genProgramDescription.trim(),
        program: {
          id: "gen-" + Date.now(),
          name: genProgramName,
          description: genProgramDescription,
          template: genSelectedTemplate,
          certificates: 0,
          testimonials: 0,
        },
        organization: genCurrentUserOrganization,
      };

      console.log("📝 Final certificate object for UI:");
      console.log("   - ID:", certificate.id);
      console.log("   - Certificate URL:", certificate.certificateUrl);
      console.log(
        "   - Certificate URL type:",
        typeof certificate.certificateUrl
      );
      console.log(
        "   - Certificate URL length:",
        certificate.certificateUrl?.length || 0
      );
      console.log(
        "   - Full certificate object:",
        JSON.stringify(certificate, null, 2)
      );
      console.log(
        "   - Full URL:",
        buildFullCertificateUrl(certificate.certificateUrl)
      );
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      // Add to current session results (for Results tab)
      console.log("💾 Adding certificate to genGeneratedCertificates state");
      setGenGeneratedCertificates([certificate]);
      // Also add to full history (for Certificates tab)
      setAllCertificates((prev) => [certificate, ...prev]);
      setHasLoadedCertificates(true); // Mark as loaded since we just added it

      setGenIsGenerating(false);
      toast.success("Certificate link generated successfully!");
      setGenActiveTab("results");

      setGenProgramName("");
      setGenProgramDescription("");
      setGenCertificateHeader("Certificate of Completion");
      setGenCompletionDate(new Date().toISOString().split("T")[0]);
    } catch (error: any) {
      console.error("❌ Error generating certificate:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        name: error.name,
      });
      setGenIsGenerating(false);

      // Show more detailed error message
      const errorMessage = error.message || "Failed to generate certificate";
      toast.error(errorMessage);

      // If it's a network error, provide additional guidance
      if (
        error.message?.includes("Failed to fetch") ||
        error.name === "TypeError"
      ) {
        toast.error(
          "Network error: Please check your connection and try again",
          { duration: 5000 }
        );
      }
    }
  };

  const genGenerateBulkCertificates = () => {
    if (!genProgramName.trim() || !genBulkStudents.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const students = parseBulkStudents(genBulkStudents);
    if (students.length === 0) {
      toast.error("No valid student data found");
      return;
    }

    setGenIsGenerating(true);

    const generateAndSave = async () => {
      try {
        // Generate certificate data
        const certificates = students.map((student) => {
          const certificateId = generateCertificateId();
          const certificateUrl = generateCertificateUrlSecure(certificateId);

          return {
            id: certificateId,
            studentName: student.name,
            email: student.email,
            generatedAt: new Date().toISOString(),
            certificateUrl: certificateUrl,
            programName: genProgramName,
            programDescription: genProgramDescription,
            templateId: genSelectedTemplate,
            organizationId: genCurrentUserOrganization?.id,
            customMessage: genCustomMessage.trim(),
            completionDate: genCompletionDate,
            // Keep legacy program object for backwards compatibility
            program: {
              id: "gen-" + Date.now(),
              name: genProgramName,
              description: genProgramDescription,
              template: genSelectedTemplate,
              certificates: 0,
              testimonials: 0,
            },
            organization: genCurrentUserOrganization,
          };
        });

        console.log("💾 Saving certificates to backend...", {
          count: certificates.length,
          organizationId: genCurrentUserOrganization?.id,
        });

        // Save to backend if we have an access token and organization
        if (accessToken && genCurrentUserOrganization?.id) {
          try {
            // Use the generate API with students array
            const response = await certificateApi.generate(accessToken, {
              organizationId: genCurrentUserOrganization.id,
              certificateHeader: genCertificateHeader.trim(),
              courseName: genProgramName.trim(),
              courseDescription: genProgramDescription.trim(),
              completionDate: genCompletionDate,
              template: genSelectedTemplate,
              customTemplateConfig: genCustomTemplateConfig,
              students: students.map((s) => ({
                name: s.name,
                email: s.email,
                completionDate: s.completionDate || genCompletionDate,
              })),
            });

            console.log("✅ Certificates saved to backend:", response);

            // Use backend-confirmed data
            const savedCertificates = response.certificates || certificates;

            // Add to current session results (for Results tab)
            setGenGeneratedCertificates(savedCertificates);
            // Also add to full history (for Certificates tab)
            setAllCertificates((prev) => [...savedCertificates, ...prev]);
            setHasLoadedCertificates(true);
          } catch (error: any) {
            console.error("❌ Failed to save certificates to backend:", error);
            toast.error("Certificates generated but failed to save to backend");

            // Still show certificates in UI even if backend save failed
            setGenGeneratedCertificates(certificates);
            setAllCertificates((prev) => [...certificates, ...prev]);
            setHasLoadedCertificates(true);
          }
        } else {
          console.log(
            "⚠️ No access token or organization - certificates not saved to backend"
          );

          // Add to local state only
          setGenGeneratedCertificates(certificates);
          setAllCertificates((prev) => [...certificates, ...prev]);
          setHasLoadedCertificates(true);
        }

        setGenIsGenerating(false);
        toast.success(
          `${certificates.length} certificates generated successfully!`
        );
        setGenActiveTab("results");

        setGenBulkStudents("");
        setGenCustomMessage("");
      } catch (error: any) {
        console.error("❌ Certificate generation error:", error);
        setGenIsGenerating(false);
        toast.error("Failed to generate certificates");
      }
    };

    // Simulate a brief generation delay then save
    setTimeout(generateAndSave, 2000);
  };

  const genCopyCertificateUrl = async (url: string) => {
    const fullUrl = buildFullCertificateUrl(url);
    const success = await copyToClipboard(fullUrl);
    if (success) {
      toast.success("Certificate URL copied to clipboard!");
    } else {
      toast.error("Failed to copy URL");
    }
  };

  const genExportCertificateList = () => {
    const csvHeader =
      "Student Name,Email,Certificate ID,Certificate URL,Generated At\n";
    const csvRows = genGeneratedCertificates
      .map(
        (cert) =>
          `"${cert.studentName}","${cert.email}","${cert.id}","${
            cert.certificateUrl
          }","${new Date(cert.generatedAt).toLocaleString()}"`
      )
      .join("\n");

    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `certificates-${genProgramName || "export"}-${
      new Date().toISOString().split("T")[0]
    }.csv`;
    a.click();

    URL.revokeObjectURL(url);
    toast.success("Certificate list exported successfully!");
  };

  // Certificate Management Functions
  const toggleCertificateSelection = (certId: string) => {
    setSelectedCertificates((prev) =>
      prev.includes(certId)
        ? prev.filter((id) => id !== certId)
        : [...prev, certId]
    );
  };

  const selectAllCertificates = () => {
    setSelectedCertificates(allCertificates.map((cert) => cert.id));
  };

  const clearCertificateSelection = () => {
    setSelectedCertificates([]);
  };

  const deleteCertificate = async (certId: string) => {
    if (!accessToken) {
      toast.error("Please sign in to delete certificates");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this certificate?")) {
      return;
    }

    try {
      console.log("🗑️ Deleting certificate:", certId);
      await certificateApi.delete(accessToken, certId);

      // Update local state after successful deletion
      setAllCertificates((prev) => prev.filter((cert) => cert.id !== certId));
      setSelectedCertificates((prev) => prev.filter((id) => id !== certId));
      setHasLoadedCertificates(true); // Keep as loaded since we just updated it

      console.log("✅ Certificate deleted successfully");
      toast.success("Certificate deleted successfully");
    } catch (error: any) {
      console.error("❌ Error deleting certificate:", error);
      toast.error(error.message || "Failed to delete certificate");
    }
  };

  const deleteSelectedCertificates = async () => {
    if (!accessToken) {
      toast.error("Please sign in to delete certificates");
      return;
    }

    if (selectedCertificates.length === 0) {
      toast.error("No certificates selected");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete ${selectedCertificates.length} certificate(s)?`
      )
    ) {
      return;
    }

    try {
      console.log("🗑️ Bulk deleting certificates:", selectedCertificates);
      const response = await certificateApi.deleteBulk(
        accessToken,
        selectedCertificates
      );

      console.log("✅ Bulk delete response:", response);

      // Update local state after successful deletion
      setAllCertificates((prev) =>
        prev.filter((cert) => !selectedCertificates.includes(cert.id))
      );
      setSelectedCertificates([]);
      setHasLoadedCertificates(true); // Keep as loaded since we just updated it

      if (response.errors && response.errors.length > 0) {
        toast.warning(
          `Deleted ${response.deletedCount} certificate(s). ${response.errors.length} failed.`
        );
      } else {
        toast.success(
          `${response.deletedCount} certificate(s) deleted successfully`
        );
      }
    } catch (error: any) {
      console.error("❌ Error deleting certificates:", error);
      toast.error(error.message || "Failed to delete certificates");
    }
  };

  const copyCertificateLink = async (url: string) => {
    const success = await copyToClipboard(url);
    if (success) {
      toast.success("Certificate link copied to clipboard!");
    } else {
      toast.error("Failed to copy link");
    }
  };

  const refreshCertificates = async () => {
    if (!accessToken || !currentOrganization) {
      toast.error("Please sign in to refresh certificates");
      return;
    }

    setIsRefreshingCertificates(true);

    try {
      console.log(
        "🔄 Manually refreshing certificates for organization:",
        currentOrganization.id
      );
      const response = await certificateApi.getForOrganization(
        accessToken,
        currentOrganization.id
      );
      console.log("🔄 Refresh response:", response);

      if (response.certificates) {
        console.log(
          `🔄 Loaded ${response.certificates.length} certificate(s) from backend`
        );
        setAllCertificates(response.certificates); // Use allCertificates for full history
        setHasLoadedCertificates(true);
        toast.success(
          `Refreshed! Found ${response.certificates.length} certificate(s)`
        );
      } else {
        console.log("🔄 No certificates in response");
        setAllCertificates([]); // Use allCertificates for full history
        setHasLoadedCertificates(true);
        toast.success("Refreshed! No certificates found");
      }
    } catch (error: any) {
      console.error("❌ Error refreshing certificates:", error);
      toast.error(error.message || "Failed to refresh certificates");
    } finally {
      setIsRefreshingCertificates(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  // Analytics data is now fetched from backend via AnalyticsView component

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        {/* Left Sidebar Navigation - Hidden on Mobile */}
        <aside
          className={`${
            navCollapsed ? "w-20" : "w-64"
          } bg-white border-r border-gray-200 flex-col transition-all duration-300 ease-in-out relative hidden md:flex overflow-y-auto`}
        >
          {/* Logo and Company Info */}
          <div className="p-6 border-b border-gray-200">
            <div
              className={`flex items-center ${
                navCollapsed ? "justify-center" : "gap-3"
              } mb-4`}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center cursor-default overflow-hidden flex-shrink-0">
                    <img
                      src={certifyerLogo}
                      alt="Certifyer"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Certifyer Certificate Platform</p>
                </TooltipContent>
              </Tooltip>
              {!navCollapsed && (
                <div className="overflow-hidden">
                  <h1 className="font-bold text-gray-900 truncate">
                    Certifyer
                  </h1>
                  <p className="text-xs text-gray-500 truncate">
                    Certificate Platform
                  </p>
                </div>
              )}
            </div>

            {/* User Info */}
            {!navCollapsed && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.username}
                  </p>
                  <div className="flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-primary flex-shrink-0" />
                    <p className="text-xs text-gray-500 truncate">
                      {currentOrganization?.name || user.company}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Toggle Button - Positioned at top of sidebar */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setNavCollapsed(!navCollapsed)}
                className={`absolute ${
                  navCollapsed ? "-right-1" : "right-4"
                } top-8 z-20 p-1 hover:bg-white/10 rounded transition-all duration-300`}
                aria-label={
                  navCollapsed ? "Expand navigation" : "Collapse navigation"
                }
              >
                {navCollapsed ? (
                  <ChevronRight className="w-5 h-5 text-black hover:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-5 h-5 text-black hover:text-gray-400" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>
                {navCollapsed ? "Expand navigation" : "Collapse navigation"}
              </p>
            </TooltipContent>
          </Tooltip>

          {/* Navigation Menu */}
          <nav className="flex-1 p-4 space-y-1">
            {[
              {
                id: "overview",
                name: "Overview",
                icon: LayoutDashboard,
              },
              {
                id: "templates",
                name: "Templates",
                icon: Palette,
              },
              {
                id: "certificates",
                name: "Certificates",
                icon: FileText,
              },
              {
                id: "testimonials",
                name: "Testimonials",
                icon: MessageSquare,
              },
              {
                id: "analytics",
                name: "Analytics",
                icon: BarChart3,
              },
              {
                id: "billing",
                name: "Billing",
                icon: CreditCard,
              },
              {
                id: "settings",
                name: "Settings",
                icon: Settings,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleTabChange(item.id)}
                      className={`w-full flex items-center ${
                        navCollapsed ? "justify-center" : "gap-3"
                      } px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/5 text-primary"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      {!navCollapsed && (
                        <span className="truncate">{item.name}</span>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t border-gray-200">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors ${
                    navCollapsed ? "px-2" : ""
                  }`}
                  onClick={() => {
                    if (window.confirm("Are you sure you want to sign out?")) {
                      toast.success("Signing out...");
                      setTimeout(() => {
                        onLogout();
                      }, 500);
                    }
                  }}
                >
                  <LogOut
                    className={`w-4 h-4 ${
                      navCollapsed ? "" : "mr-2"
                    } flex-shrink-0`}
                  />
                  {!navCollapsed && <span>Sign Out</span>}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Sign out of admin dashboard</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </aside>

        {/* Mobile Navigation Sheet */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72 p-0">
            <div className="flex flex-col h-full bg-white">
              {/* Logo and Company Info */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                    <img
                      src={certifyerLogo}
                      alt="Certifyer"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <div>
                    <h1 className="font-bold text-gray-900">Certifyer</h1>
                    <p className="text-xs text-gray-500">
                      Certificate Platform
                    </p>
                  </div>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.username}
                    </p>
                    <div className="flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-primary flex-shrink-0" />
                      <p className="text-xs text-gray-500 truncate">
                        {currentOrganization?.name || user.company}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Navigation Menu */}
              <nav className="flex-1 p-4 space-y-1">
                {[
                  {
                    id: "overview",
                    name: "Overview",
                    icon: LayoutDashboard,
                  },
                  {
                    id: "templates",
                    name: "Templates",
                    icon: Palette,
                  },
                  {
                    id: "certificates",
                    name: "Certificates",
                    icon: FileText,
                  },
                  {
                    id: "testimonials",
                    name: "Testimonials",
                    icon: MessageSquare,
                  },
                  {
                    id: "analytics",
                    name: "Analytics",
                    icon: BarChart3,
                  },
                  {
                    id: "billing",
                    name: "Billing",
                    icon: CreditCard,
                  },
                  {
                    id: "settings",
                    name: "Settings",
                    icon: Settings,
                  },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        activeTab === item.id
                          ? "bg-primary/5 text-primary"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Sign Out Button */}
              <div className="p-4 border-t border-gray-200">
                <Button
                  variant="outline"
                  className="w-full text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to sign out?")) {
                      toast.success("Signing out...");
                      setTimeout(() => {
                        onLogout();
                      }, 500);
                    }
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Top Header Bar */}
          <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 sticky top-0 z-50">
            <div className="flex items-center justify-between">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6 text-gray-600" />
              </button>

              <div className="flex-1 md:flex-none">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 truncate">
                  {activeTab === "overview" && "Dashboard Overview"}
                  {activeTab === "templates" && "Certificate Templates"}
                  {activeTab === "certificates" && "Certificate Management"}
                  {activeTab === "testimonials" && "Student Testimonials"}
                  {activeTab === "analytics" && "Analytics & Reports"}
                  {activeTab === "billing" && "Billing & Subscription"}
                  {activeTab === "settings" && "Platform Settings"}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 mt-1 truncate">
                  {currentOrganization?.name || "Loading..."}
                </p>
              </div>

              {currentOrganization && (
                <div className="hidden md:flex items-center gap-2">
                  <img
                    src={currentOrganization.logo}
                    alt={currentOrganization.name}
                    className="h-10 w-auto rounded"
                  />
                </div>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="p-4 md:p-8">
            {/* Tab Content */}
            {activeTab === "overview" && (
              <div className="space-y-4 md:space-y-6">
                {/* Welcome Card */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 truncate">
                          Welcome, {user.username}
                        </h2>
                        <p className="text-muted-foreground mb-2 text-sm md:text-base">
                          {currentOrganization
                            ? `Managing certificate programs for ${currentOrganization.name}`
                            : organizations.length > 0
                            ? `Managing certificate programs for your organization`
                            : "Get started by creating your organization and first program"}
                        </p>
                        {currentOrganization && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="cursor-default">
                                  <Shield className="w-4 h-4" />
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Organization administrator access</p>
                              </TooltipContent>
                            </Tooltip>
                            <span className="text-xs md:text-sm">
                              Organization Administrator
                            </span>
                          </div>
                        )}
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-default hidden md:block">
                            <Award className="w-16 h-16 text-primary opacity-10" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Certificate Management System</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>

                {/* Organization Setup Prompt - Only show if user has no organization */}
                {!currentOrganization && (
                  <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-primary" />
                          </div>
                        </div>
                        <div className="flex-1 text-center md:text-left">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Complete Your Setup
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Add your organization name to get started with
                            creating certificate programs and issuing
                            professional certificates.
                          </p>
                          <Button
                            onClick={() => setActiveTab("settings")}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            Add Organization Name
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Stats and Quick Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                  {/* Stats Cards */}
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                      <CardTitle className="text-xs md:text-sm font-medium truncate">
                        Total Certificates
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-default flex-shrink-0">
                            <Award className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Total certificates issued</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                      <div className="text-xl md:text-2xl font-bold">
                        {stats.totalCertificates.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {currentOrganization
                          ? "Your organization"
                          : "Your certificates"}
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 md:p-6">
                      <CardTitle className="text-xs md:text-sm font-medium truncate">
                        Testimonials
                      </CardTitle>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-default flex-shrink-0">
                            <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Student feedback received</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 pt-0">
                      <div className="text-xl md:text-2xl font-bold">
                        {stats.totalTestimonials.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {Math.floor(
                          (stats.totalTestimonials /
                            Math.max(stats.totalCertificates, 1)) *
                            100
                        )}
                        % response rate
                      </p>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-xs md:text-sm">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="cursor-default">
                              <Zap className="w-4 h-4 md:w-5 md:h-5" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Quick actions and shortcuts</p>
                          </TooltipContent>
                        </Tooltip>
                        Quick Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={navigateToGenerate}
                            className="w-full h-12 flex items-center justify-center gap-2 bg-[rgba(196,117,76,0.915)] bg-[rgb(246,98,20)]"
                            size="sm"
                          >
                            <Award className="w-4 h-4" />
                            Generate Certificates
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate new certificates for students</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => setActiveTab("analytics")}
                            className="w-full h-12 flex items-center justify-center gap-2"
                            size="sm"
                          >
                            <BarChart3 className="w-4 h-4" />
                            View Analytics
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View detailed analytics and reports</p>
                        </TooltipContent>
                      </Tooltip>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Get started with common tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Generate Certificate */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={navigateToGenerate}
                            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }40, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }60)`,
                              }}
                            >
                              <Zap
                                className="w-6 h-6"
                                style={{
                                  color:
                                    (currentOrganization || user.subsidiary)
                                      ?.primaryColor || "#6366f1",
                                }}
                              />
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold mb-1">
                                Generate Certificate
                              </h3>
                              <p className="text-sm text-gray-600">
                                Create new certificates
                              </p>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate certificates for your students</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Browse Templates */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActiveTab("templates")}
                            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }40, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }60)`,
                              }}
                            >
                              <FileText
                                className="w-6 h-6"
                                style={{
                                  color:
                                    (currentOrganization || user.subsidiary)
                                      ?.primaryColor || "#6366f1",
                                }}
                              />
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold mb-1">
                                Browse Templates
                              </h3>
                              <p className="text-sm text-gray-600">
                                Explore certificate designs
                              </p>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View and select certificate templates</p>
                        </TooltipContent>
                      </Tooltip>

                      {/* Create Custom Template */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            disabled
                            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-lg relative overflow-hidden opacity-60 cursor-not-allowed"
                          >
                            {/* Coming Soon overlay */}
                            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-sm flex items-center justify-center z-10">
                              <div className="text-center">
                                <Sparkles className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                <p className="text-white font-semibold text-lg">
                                  Coming Soon
                                </p>
                                <p className="text-gray-300 text-xs mt-1">
                                  In Development
                                </p>
                              </div>
                            </div>

                            {/* Premium badge */}
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-gradient-to-r from-amber-500 to-orange-600 text-white text-xs px-2 py-0.5">
                                Premium
                              </Badge>
                            </div>
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }40, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }60)`,
                              }}
                            >
                              <Palette
                                className="w-6 h-6"
                                style={{
                                  color:
                                    (currentOrganization || user.subsidiary)
                                      ?.primaryColor || "#6366f1",
                                }}
                              />
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold mb-1">
                                Create Custom Template
                              </h3>
                              <p className="text-sm text-gray-600">
                                Design your own certificate
                              </p>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>
                            Build a custom certificate template with our visual
                            editor
                          </p>
                        </TooltipContent>
                      </Tooltip>

                      {/* View Analytics */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => setActiveTab("certificates")}
                            className="flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-lg hover:border-primary hover:bg-primary/5 transition-all group"
                          >
                            <div
                              className="w-12 h-12 rounded-lg flex items-center justify-center"
                              style={{
                                background: `linear-gradient(135deg, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }40, ${
                                  (currentOrganization || user.subsidiary)
                                    ?.primaryColor || "#6366f1"
                                }60)`,
                              }}
                            >
                              <Award
                                className="w-6 h-6"
                                style={{
                                  color:
                                    (currentOrganization || user.subsidiary)
                                      ?.primaryColor || "#6366f1",
                                }}
                              />
                            </div>
                            <div className="text-center">
                              <h3 className="font-semibold mb-1">
                                View Certificates
                              </h3>
                              <p className="text-sm text-gray-600">
                                Browse all certificates
                              </p>
                            </div>
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View certificate generation statistics</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "generate" && (
              <div className="space-y-4 md:space-y-6">
                {/* Page Header */}
                <Card className="border-l-4 border-l-primary">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl md:text-2xl font-bold mb-2 truncate">
                          Generate Certificates
                        </h2>
                        <p className="text-muted-foreground mb-2 text-sm md:text-base">
                          Create beautiful, professional certificates for your
                          students
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Certificate Generation Workflow */}
                <Tabs
                  value={genActiveTab}
                  onValueChange={setGenActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="setup">Setup</TabsTrigger>
                    <TabsTrigger
                      value="generation"
                      disabled={!genSelectedTemplate}
                    >
                      Generation
                    </TabsTrigger>
                    <TabsTrigger
                      value="results"
                      disabled={genGeneratedCertificates.length === 0}
                    >
                      Results
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="setup" className="space-y-6 mt-6">
                    {/* Choose Template */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-indigo-600" />
                          Choose Template
                        </CardTitle>
                        <CardDescription>
                          Select a certificate template to get started
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-2">
                          <Label>Certificate Template *</Label>
                          <div
                            onClick={() => setGenShowTemplateSelector(true)}
                            className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50/30 cursor-pointer transition-all group"
                          >
                            {genSelectedTemplate ? (
                              <>
                                <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                                  <FileText className="w-6 h-6 text-indigo-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900">
                                    {genSelectedTemplateName ||
                                      "Selected Template"}
                                  </p>
                                  <p className="text-sm text-gray-500 capitalize">
                                    {genSelectedTemplate} style
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setGenShowTemplateSelector(true);
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
                              setGenActiveTab("generation");
                              // Clear previous results when starting new generation
                              setGenGeneratedCertificates([]);
                            }}
                            disabled={!genSelectedTemplate}
                          >
                            Next: Enter Certificate Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="generation" className="space-y-6 mt-6">
                    {/* Certificate Information */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-indigo-600" />
                          Certificate Information
                        </CardTitle>
                        <CardDescription>
                          Enter all the details for the certificate - these will
                          be displayed on the generated certificates
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Certificate Header */}
                        <div className="space-y-2">
                          <Label htmlFor="genCertificateHeader">
                            Certificate Header{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="genCertificateHeader"
                            value={genCertificateHeader}
                            onChange={(e) =>
                              setGenCertificateHeader(e.target.value)
                            }
                            placeholder="e.g., Certificate of Completion"
                          />
                          <p className="text-xs text-gray-500">
                            The main title that appears on the certificate
                          </p>
                        </div>

                        {/* Program/Course Name */}
                        <div className="space-y-2">
                          <Label htmlFor="genCourseTitle">
                            Program/Course Name{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="genCourseTitle"
                            value={genProgramName}
                            onChange={(e) => setGenProgramName(e.target.value)}
                            placeholder="e.g., Advanced Data Analytics Program"
                          />
                          <p className="text-xs text-gray-500">
                            The name of the program or course
                          </p>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="genDescription">
                            Description (optional)
                          </Label>
                          <Textarea
                            id="genDescription"
                            value={genProgramDescription}
                            onChange={(e) =>
                              setGenProgramDescription(e.target.value)
                            }
                            placeholder="Additional details about the achievement or program..."
                            rows={3}
                          />
                          <p className="text-xs text-gray-500">
                            Optional additional information about the program
                          </p>
                        </div>

                        {/* Completion Date */}
                        <div className="space-y-2">
                          <Label htmlFor="genCompletionDateGen">
                            Completion Date{" "}
                            <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="genCompletionDateGen"
                            type="date"
                            value={genCompletionDate}
                            onChange={(e) =>
                              setGenCompletionDate(e.target.value)
                            }
                          />
                          <p className="text-xs text-gray-500">
                            The date when the program was completed
                          </p>
                        </div>

                        {/* Live Certificate Preview */}
                        {genProgramName &&
                          genSelectedTemplate &&
                          currentOrganization && (
                            <div className="pt-6">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                  <Eye className="w-4 h-4 text-indigo-600" />
                                  <h4 className="font-medium">Live Preview</h4>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {genSelectedTemplateName ||
                                    genSelectedTemplate}
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
                                        templateId={genSelectedTemplate}
                                        header={genCertificateHeader}
                                        courseTitle={genProgramName}
                                        description={genProgramDescription}
                                        date={genCompletionDate}
                                        recipientName="Sample Student Name"
                                        isPreview={true}
                                        mode="template-selection"
                                        organizationName={
                                          currentOrganization.name
                                        }
                                        organizationLogo={
                                          currentOrganization.logo
                                        }
                                        customTemplateConfig={
                                          genCustomTemplateConfig
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
                              setGenActiveTab("setup");
                              // Clear previous results when going back to start new generation
                              setGenGeneratedCertificates([]);
                            }}
                            className="flex-1"
                          >
                            Back to Template
                          </Button>
                          <Button
                            onClick={genGenerateIndividualCertificate}
                            disabled={
                              genIsGenerating ||
                              !genCertificateHeader.trim() ||
                              !genProgramName.trim()
                            }
                            className="flex-1"
                          >
                            {genIsGenerating ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
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

                  <TabsContent value="results" className="space-y-6 mt-6">
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-green-600" />
                              Certificate Links Generated Successfully
                            </CardTitle>
                            <CardDescription>
                              {genGeneratedCertificates.length} certificate
                              link(s) created. Share these with students to
                              access their certificates.
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              onClick={genExportCertificateList}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Export List
                            </Button>
                            <Button
                              onClick={() => {
                                setGenActiveTab("setup");
                                setGenGeneratedCertificates([]);
                                setGenCertificateHeader(
                                  "Certificate of Completion"
                                );
                                setGenProgramName("");
                                setGenProgramDescription("");
                                setGenCompletionDate(
                                  new Date().toISOString().split("T")[0]
                                );
                                setGenSelectedTemplate("");
                                setGenSelectedTemplateName("");
                                setGenStudentName("");
                                setGenStudentEmail("");
                                setGenBulkStudents("");
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Generate More
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {genGeneratedCertificates.map((cert, index) => (
                            <Card key={cert.id}>
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-bold truncate">
                                      {cert.courseName}
                                    </h3>
                                    <p className="text-sm text-muted-foreground truncate">
                                      {cert.certificateHeader}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Certificate ID: {cert.id}
                                    </p>
                                  </div>
                                  <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        console.log(
                                          "📋 Copy URL clicked for cert:",
                                          {
                                            id: cert.id,
                                            certificateUrl: cert.certificateUrl,
                                          }
                                        );
                                        genCopyCertificateUrl(
                                          cert.certificateUrl
                                        );
                                      }}
                                    >
                                      <Copy className="w-4 h-4 mr-2" />
                                      Copy URL
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={(e) => {
                                        const fullUrl = buildFullCertificateUrl(
                                          cert.certificateUrl
                                        );
                                        console.log(
                                          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                                        );
                                        console.log(
                                          "🖱️ VIEW BUTTON CLICKED (Results Tab)"
                                        );
                                        console.log(
                                          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                                        );
                                        console.log(
                                          "📄 Certificate object:",
                                          cert
                                        );
                                        console.log(
                                          "🔗 Certificate URL field:",
                                          cert.certificateUrl
                                        );
                                        console.log("🌐 Full URL:", fullUrl);
                                        console.log(
                                          "🌐 Navigating directly with window.location.href..."
                                        );
                                        console.log(
                                          "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                                        );

                                        // Navigate in the same tab - hash routing works this way!
                                        window.location.href = fullUrl;
                                      }}
                                    >
                                      <ExternalLink className="w-4 h-4 mr-2" />
                                      View
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Templates Tab */}
            {activeTab === "templates" && currentOrganization && (
              <TemplatesPage
                onSelectTemplate={(template) => {
                  console.log("📋 Template selected:", template);
                  // Store selected template for certificate generation
                  setGenSelectedTemplate(template.id);
                  setGenSelectedTemplateName(template.name);
                  if (!template.isDefault) {
                    setGenCustomTemplateConfig(template.config);
                  } else {
                    setGenCustomTemplateConfig(null);
                  }
                  toast.success(`Template "${template.name}" selected!`);
                  // Optionally navigate to generate tab
                  setActiveTab("generate");
                }}
                organization={currentOrganization}
                showBuilderButton={true}
                accessToken={accessToken}
                isPremiumUser={isOrgPremium(currentOrganization)}
              />
            )}

            {activeTab === "certificates" && (
              <div className="space-y-6">
                {/* Certificate Management Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      <h2 className="text-xl">Certificate Management</h2>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      View, manage, and track all issued certificates
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab("generate")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Certificates
                  </Button>
                </div>

                <Card>
                  <CardContent className="p-6">
                    {/* Search and Action Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between">
                      <div className="relative flex-1 w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search certificates..."
                          value={certificateSearch}
                          onChange={(e) => setCertificateSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={refreshCertificates}
                          disabled={isRefreshingCertificates}
                        >
                          <RefreshCw
                            className={`w-4 h-4 mr-2 ${
                              isRefreshingCertificates ? "animate-spin" : ""
                            }`}
                          />
                          {isRefreshingCertificates
                            ? "Refreshing..."
                            : "Refresh"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTab("generate")}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          New Certificate
                        </Button>
                      </div>
                    </div>

                    {/* Bulk Actions Bar */}
                    {allCertificates.length > 0 && (
                      <div className="flex flex-col sm:flex-row gap-3 mb-6 items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex gap-2 items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={deleteSelectedCertificates}
                            disabled={selectedCertificates.length === 0}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Selected ({selectedCertificates.length})
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={selectAllCertificates}
                          >
                            Select All
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearCertificateSelection}
                          >
                            Clear
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Certificate Grid */}
                    {allCertificates.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {allCertificates
                          .filter(
                            (cert) =>
                              cert.courseName
                                ?.toLowerCase()
                                .includes(certificateSearch.toLowerCase()) ||
                              cert.certificateHeader
                                ?.toLowerCase()
                                .includes(certificateSearch.toLowerCase()) ||
                              cert.studentName
                                ?.toLowerCase()
                                .includes(certificateSearch.toLowerCase()) ||
                              cert.email
                                ?.toLowerCase()
                                .includes(certificateSearch.toLowerCase()) ||
                              cert.id
                                .toLowerCase()
                                .includes(certificateSearch.toLowerCase())
                          )
                          .map((cert) => (
                            <Card
                              key={cert.id}
                              className="relative hover:shadow-md transition-shadow"
                            >
                              <CardContent className="p-5">
                                {/* Checkbox in top right */}
                                <div className="absolute top-4 right-4">
                                  <input
                                    type="checkbox"
                                    checked={selectedCertificates.includes(
                                      cert.id
                                    )}
                                    onChange={() =>
                                      toggleCertificateSelection(cert.id)
                                    }
                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                  />
                                </div>

                                {/* Certificate Info */}
                                <div className="space-y-3 pr-6">
                                  <div>
                                    <h3 className="font-semibold text-gray-900">
                                      {cert.courseName ||
                                        cert.program?.name ||
                                        "Certificate of Completion"}
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                      {cert.certificateHeader ||
                                        cert.studentName ||
                                        "Certificate Link"}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar className="w-3 h-3" />
                                    <span>
                                      {new Date(
                                        cert.generatedAt
                                      ).toLocaleDateString("en-US", {
                                        month: "numeric",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={(e) => {
                                      const fullUrl = buildFullCertificateUrl(
                                        cert.certificateUrl
                                      );
                                      console.log(
                                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                                      );
                                      console.log(
                                        "🖱️ VIEW BUTTON CLICKED (Certificates Tab)"
                                      );
                                      console.log(
                                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                                      );
                                      console.log(
                                        "📄 Certificate object:",
                                        cert
                                      );
                                      console.log(
                                        "🔗 Certificate URL field:",
                                        cert.certificateUrl
                                      );
                                      console.log("🌐 Full URL:", fullUrl);
                                      console.log(
                                        "🌐 Navigating directly with window.location.href..."
                                      );
                                      console.log(
                                        "━━━━━━━━━━━━━━━━���━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━"
                                      );

                                      // Navigate in the same tab - hash routing works this way!
                                      window.location.href = fullUrl;
                                    }}
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() =>
                                      copyCertificateLink(
                                        buildFullCertificateUrl(
                                          cert.certificateUrl
                                        )
                                      )
                                    }
                                  >
                                    <Copy className="w-3 h-3 mr-1" />
                                    Copy
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => deleteCertificate(cert.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2 text-gray-900">
                          No Certificates Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Get started by generating your first certificate
                        </p>
                        <Button onClick={() => setActiveTab("generate")}>
                          <Plus className="w-4 h-4 mr-2" />
                          Generate Certificate
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "testimonials" && currentOrganization && (
              <React.Suspense fallback={<TestimonialsSkeleton />}>
                <TestimonialsView
                  organizationId={currentOrganization.id}
                  accessToken={accessToken}
                />
              </React.Suspense>
            )}

            {activeTab === "analytics" && currentOrganization && (
              <React.Suspense fallback={<AnalyticsSkeleton />}>
                <AnalyticsView
                  organizationId={currentOrganization.id}
                  accessToken={accessToken}
                />
              </React.Suspense>
            )}

            {/* Templates tab is rendered above inside the Tabs component; avoid duplicate rendering here. */}

            {activeTab === "settings" && currentOrganization && (
              <React.Suspense fallback={<SettingsSkeleton />}>
                <div className="px-4 md:px-8 py-6">
                  <OrganizationSettings
                    organization={currentOrganization}
                    accessToken={accessToken!}
                    onSettingsUpdated={onUpdateOrganization}
                  />
                </div>
              </React.Suspense>
            )}

            {activeTab === "settings" && !currentOrganization && (
              <div className="px-4 md:px-8 py-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      Organization Settings
                    </CardTitle>
                    <CardDescription>
                      Create an organization to customize certificates with your
                      logo and signatures
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Building2 className="h-4 w-4" />
                      <AlertDescription>
                        You need to create an organization to access settings.
                        Create one from the Overview tab.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === "billing" && currentOrganization && (
              <React.Suspense fallback={<BillingSkeleton />}>
                <BillingPage
                  organizationId={currentOrganization.id}
                  organizationName={currentOrganization.name}
                  userEmail={user.id}
                  accessToken={accessToken}
                />
              </React.Suspense>
            )}

            {/* Billing Tab - No Organization */}
            {activeTab === "billing" && !currentOrganization && (
              <div className="px-4 md:px-8 py-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Billing & Subscription
                    </CardTitle>
                    <CardDescription>
                      Manage your premium subscription and payment methods
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Alert>
                      <Building2 className="h-4 w-4" />
                      <AlertDescription>
                        You need to create an organization to access billing
                        features. Create one from the Overview tab.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Template Builder Tab */}
            {activeTab === "template-builder" && currentOrganization && (
              <React.Suspense
                fallback={
                  <div className="p-6">Loading template builder...</div>
                }
              >
                <TemplateBuilderPage
                  organization={currentOrganization}
                  isPremiumUser={isOrgPremium(currentOrganization)}
                  onBack={() => setActiveTab("overview")}
                />
              </React.Suspense>
            )}
          </div>
          <div className="flex-1 md:flex-none bg-black text-white p-6 mr-6 ">
            <img src={certifyerLogo} alt="Certifyer Logo" />
            <p className="text-sm md:text-base mt-2">
              Empowering educators to create and manage certificates with ease.
            </p>
          </div>
        </main>

        {/* Modals */}
        <CertificateGenerationModal
          isOpen={showGenerateModal}
          onClose={() => setShowGenerateModal(false)}
          user={user}
          subsidiaries={organizations}
          currentSubsidiary={currentOrganization}
          onUpdateProgramStats={onUpdateProgramStats}
          onCertificatesGenerated={handleCertificatesGenerated}
          customTemplateConfig={genCustomTemplateConfig}
        />

        {/* Template Picker Dialog for Generate Tab */}
        <Dialog
          open={genShowTemplateSelector}
          onOpenChange={setGenShowTemplateSelector}
        >
          <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
            <DialogHeader className="p-6 pb-4 shrink-0">
              <DialogTitle>Choose Certificate Template</DialogTitle>
              <DialogDescription>
                Browse and select from our collection of professional
                certificate templates
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto scrollbar-hide px-6 pb-6 flex-1">
              {currentOrganization && (
                <TemplatesPage
                  onSelectTemplate={handleGenTemplateSelection}
                  organization={currentOrganization}
                  showBuilderButton={false}
                  accessToken={accessToken}
                  isPremiumUser={isOrgPremium(currentOrganization)}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
