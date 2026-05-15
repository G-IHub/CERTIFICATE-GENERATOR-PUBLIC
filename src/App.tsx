import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router";
import LandingPage from "./components/LandingPage";
import Story from "./components/Story";
import Privacy from "./components/Privacy";
import Terms from "./components/Terms";
import PaymentVerifyPage from "./components/PaymentVerifyPage";
import InvoicePage from "./components/InvoicePage";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import PlatformAdminPanel from "./components/PlatformAdminPanel";
import StudentCertificate from "./components/StudentCertificate";
import CertificateVerification from "./components/CertificateVerification";
import BackendHealthCheck from "./components/BackendHealthCheck";
import DeploymentGuide from "./components/DeploymentGuide";
import NotFound from "./components/NotFound";
import TemplateBuilderPage from "./components/TemplateBuilderPage";
import QueryPremiumOrgs from "./components/QueryPremiumOrgs";
import AdminUtilities from "./components/AdminUtilities";
import ResetPasswordPage from "./components/ResetPasswordPage";
import BlogList from "./components/BlogList";
import BlogDetails from "./components/BlogDetails";
import OnboardingWizard from "./components/OnboardingWizard";
import CertificateRedirect from "./components/CertificateRedirect";
import { organizationApi, authApi } from "./utils/api";
import { publicAnonKey, projectId } from "./utils/supabase/info";
import { toast, Toaster } from "sonner";
import { isAdminEmail } from "./utils/adminConfig";
import { isOrgPremium } from "./utils/subscriptionUtils";
import { isTokenExpired, getTokenRemainingTime } from "./utils/tokenUtils";
import SEOTestPage from "./components/SEOTestPage";
import SEOHead from "./components/SEOHead";
import VerificationPage from "./components/VerificationPage";
import StorefrontPage from "./components/StorefrontPage";
import ProductAccessPage from "./components/ProductAccessPage";

const defaultOrgLogo = "https://via.placeholder.com/256x256.png?text=Org+Logo";



interface Signatory {
  id: string;
  name: string;
  title: string;
  signatureUrl?: string;
}

export interface Logo {
  id: string;
  url: string;
  name: string;
}

interface OrganizationSettings {
  logo: string;
  secondaryLogo?: string;
  primaryColor: string;
  signatories: Signatory[];
  logos?: Logo[]; // New: Array of organization logos
}

interface Organization {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  ownerId: string;
  settings?: OrganizationSettings;
  courses: Course[];
}

export interface Course {
  id: string;
  name: string;
  description: string;
  template?: string;
  certificates: number;
  testimonials: number;
  createdAt: string;
  createdBy: string;
  duration?: string; // Optional field for certificate display
}

interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  userType: "company";
  organizationName?: string;
  organizationId?: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  username: string;
  role: "admin" | "user";
  company: string;
  subsidiary: Organization | null;
  canSwitchSubsidiaries: boolean;
  permissions: string[];
}

// Export types for use in other components
export type {
  Organization,
  UserAccount,
  Signatory,
  OrganizationSettings,
  Course,
};

export type Subsidiary = Organization;

// Scroll to top component to fix navigation positioning
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

// Password Reset Redirect Component
function PasswordResetRedirect() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fullPath = location.pathname + location.search + location.hash;

    // Check if this looks like a password reset URL
    const hasAccessToken = fullPath.includes("access_token=");
    const hasRecoveryType = fullPath.includes("type=recovery");

    if (hasAccessToken && hasRecoveryType) {
      console.log(
        "🔐 Recovery token detected in path, redirecting to reset password page",
      );
      console.log("📍 Current location:", {
        pathname: location.pathname,
        search: location.search,
        hash: location.hash,
        fullPath,
      });

      // Extract the access token and refresh token from the path
      const accessTokenMatch = fullPath.match(/access_token=([^&]+)/);
      const refreshTokenMatch = fullPath.match(/refresh_token=([^&]+)/);

      const accessToken = accessTokenMatch ? accessTokenMatch[1] : null;
      const refreshToken = refreshTokenMatch ? refreshTokenMatch[1] : null;

      if (accessToken) {
        console.log("✅ Access token extracted, length:", accessToken.length);
        if (refreshToken) {
          console.log(
            "✅ Refresh token extracted, length:",
            refreshToken.length,
          );
        } else {
          console.log("⚠️ No refresh token found");
        }
        // Navigate to reset password page with both tokens in React Router state
        navigate("/reset-password", {
          state: {
            resetToken: accessToken,
            refreshToken: refreshToken,
          },
          replace: true,
        });
      } else {
        console.log("❌ Could not extract access token from path");
      }
    }
  }, [navigate, location]);

  return null;
}

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null); // null = checking, true = healthy, false = unhealthy
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingData, setOnboardingData] = useState<{
    organizationId: string;
    organizationName: string;
  } | null>(null);
  const [refreshCertificates, setRefreshCertificates] = useState(false);

  // Check for existing session on mount — runs immediately, does NOT wait for health check
  useEffect(() => {
    const checkSession = async () => {
      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          const response = await authApi.getSession(token);
          setAccessToken(token);
          setCurrentUser(response.user);

          if (response.user && isAdminEmail(response.user.email)) {
            setIsPlatformAdmin(true);
          } else {
            await loadOrganizations(token);
          }
        } catch (error: any) {
          if (
            !error.message?.includes("Failed to fetch") &&
            !error.name?.includes("AbortError") &&
            error.message
          ) {
            localStorage.removeItem("accessToken");
          }
        }
      }

      setIsLoadingSession(false);
    };

    checkSession();
  }, []);

  // Health check runs in the background — never blocks app loading
  useEffect(() => {
    const runHealthCheck = async () => {
      const maxRetries = 3;
      const retryDelay = 4000;

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);

          const healthResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/health`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            },
          );
          clearTimeout(timeoutId);

          if (healthResponse.ok) {
            setServerHealthy(true);
            return;
          }
        } catch (_err) {
          // ignore individual attempt errors
        }

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        }
      }

      setServerHealthy(false);
    };

    runHealthCheck();
  }, []);

  // User activity tracking for session management
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  useEffect(() => {
    const handleActivity = () => {
      setLastActivity(Date.now());
    };

    // Track common user interactions
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("mousedown", handleActivity);
    window.addEventListener("keypress", handleActivity);
    window.addEventListener("scroll", handleActivity);
    window.addEventListener("touchstart", handleActivity);

    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("mousedown", handleActivity);
      window.removeEventListener("keypress", handleActivity);
      window.removeEventListener("scroll", handleActivity);
      window.removeEventListener("touchstart", handleActivity);
    };
  }, []);

  // Auto-logout and session extension when token expires
  useEffect(() => {
    if (!accessToken) {
      return; // No token, nothing to monitor
    }

    // Function to check session status and possibly refresh
    const checkSession = async () => {
      if (!accessToken) return;

      // Check if token is already expired
      if (isTokenExpired(accessToken)) {
        console.log("🔒 Token is expired, logging out...");
        toast.error("Your session has expired. Please sign in again.", {
          duration: 5000,
        });
        handleLogout();
        return;
      }

      const remainingTime = getTokenRemainingTime(accessToken);
      const minutesRemaining = Math.floor(remainingTime / 1000 / 60);

      // Refresh logic: If token expires in less than 10 minutes AND user was active in last 5 minutes
      const fiveMinutesInMs = 5 * 60 * 1000;
      const userWasActiveRecently = Date.now() - lastActivity < fiveMinutesInMs;

      if (minutesRemaining <= 10 && userWasActiveRecently) {
        console.log("🔄 Session near expiration but user is active. Refreshing session...");
        try {
          const response = await authApi.getSession(accessToken);
          if (response.accessToken) {
            console.log("✅ Session refreshed successfully");
            localStorage.setItem("accessToken", response.accessToken);
            setAccessToken(response.accessToken);
            
            // Optional: Update current user if returned
            if (response.user) {
              setCurrentUser(response.user);
            }
          }
        } catch (error) {
          console.error("❌ Failed to refresh session:", error);
          // If refresh fails and we are very close to expiration, we'll let the auto-logout handle it
        }
      }

      // Show warning 5 minutes before expiration if we couldn't refresh
      if (minutesRemaining === 5) {
        toast.warning(
          "Your session will expire in 5 minutes. Please save your work!",
          {
            id: "session-warning", // Prevent duplicate toasts
            duration: 10000,
          },
        );
      }
    };

    // Run initial check
    checkSession();

    // Set up a periodic check every 1 minute
    const intervalId = setInterval(checkSession, 60 * 1000);

    // Legacy auto-logout fallback for absolute safety
    const remainingTime = getTokenRemainingTime(accessToken);
    const logoutTimeout = setTimeout(() => {
      if (isTokenExpired(accessToken)) {
        console.log("🔒 Absolute safety timeout: logging out...");
        handleLogout();
      }
    }, remainingTime + 1000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(logoutTimeout);
    };
  }, [accessToken, lastActivity]); // Re-run when token or lastActivity changes

  // Load organizations for the current user
  const loadOrganizations = async (token: string) => {
    setIsLoadingOrganizations(true);
    try {
      const response = await organizationApi.getAll(token);
      const orgs = (response.organizations || []).map((org: any) => ({
        ...org,
        courses: org.courses || org.programs || []
      }));
      setOrganizations(orgs);
    } catch (error) {
      // Error loading organizations
      setOrganizations([]);
    } finally {
      setIsLoadingOrganizations(false);
    }
  };

  // Generate a random color for new organizations
  const generateRandomColor = () => {
    const colors = [
      "#ea580c", // Orange
      "#f97316", // Deep Orange
      "#fb923c", // Light Orange
      "#f59e0b", // Amber
      "#10b981", // Emerald
      "#3b82f6", // Blue
      "#ef4444", // Red
      "#14b8a6", // Teal
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Handle user sign up (called from AuthPage after successful backend sign up)
  const handleSignUp = async (userData: {
    fullName: string;
    email: string;
    password: string;
    organizationName: string;
  }) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      setAccessToken(token);

      // Load user session and organizations
      try {
        const response = await authApi.getSession(token);
        setCurrentUser(response.user);

        // Check if this is a platform admin
        if (response.user && isAdminEmail(response.user.email)) {
          setIsPlatformAdmin(true);
        } else {
          // Load organizations for regular users
          await loadOrganizations(token);

          // Show onboarding wizard for new users
          if (response.user.organizationId && response.user.organizationName) {
            setOnboardingData({
              organizationId: response.user.organizationId,
              organizationName: response.user.organizationName,
            });
            setShowOnboarding(true);
          }
        }
      } catch (error) {
        // Error loading session
      }
    }
  };

  // Handle user login (called from AuthPage after successful backend login)
  const handleLogin = async (user: UserAccount | UserProfile) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      setAccessToken(token);

      // Handle both new UserAccount and legacy UserProfile types
      if ("fullName" in user) {
        const userAccount = user as UserAccount;
        setCurrentUser(userAccount);

        // Check if this is a platform admin
        if (isAdminEmail(userAccount.email)) {
          setIsPlatformAdmin(true);
        } else {
          await loadOrganizations(token);
        }
      } else {
        // Convert legacy UserProfile to UserAccount for backwards compatibility
        const legacyUser = user as UserProfile;
        const userAccount: UserAccount = {
          id: legacyUser.id,
          fullName: legacyUser.username,
          email: legacyUser.id.includes("@")
            ? legacyUser.id
            : `${legacyUser.id}@example.com`,
          organizationName: legacyUser.subsidiary?.name,
          organizationId: legacyUser.subsidiary?.id,
          userType: "company",
          createdAt: new Date().toISOString(),
        };
        setCurrentUser(userAccount);

        // Check if this is a platform admin
        if (isAdminEmail(userAccount.email)) {
          setIsPlatformAdmin(true);
        } else {
          // Add the organization if it doesn't exist
          if (
            legacyUser.subsidiary &&
            !organizations.find((o) => o.id === legacyUser.subsidiary!.id)
          ) {
            setOrganizations((prev) => [
              ...prev,
              {
                ...legacyUser.subsidiary,
                courses: (legacyUser.subsidiary as any).courses || (legacyUser.subsidiary as any).programs || []
              } as Organization,
            ]);
          }
        }
        setIsLoadingOrganizations(false);
      }
    }
  };

  const handleLogout = async () => {
    try {
      if (accessToken) {
        await authApi.signOut(accessToken);
      }
    } catch (error) {
      // Error during logout
    } finally {
      localStorage.removeItem("accessToken");
      setAccessToken(null);
      setCurrentUser(null);
      setOrganizations([]);
      setIsPlatformAdmin(false);
    }
  };

  // Get current user's organization
  const getCurrentUserOrganization = (): Organization | null => {
    if (!currentUser?.organizationId) return null;
    return (
      organizations.find((org) => org.id === currentUser.organizationId) || null
    );
  };

  // Function to update organization data
  const updateOrganization = async (
    organizationId: string,
    updates: Partial<Organization>,
  ) => {
    if (!accessToken) return;

    try {
      const response = await organizationApi.update(
        accessToken,
        organizationId,
        updates,
      );
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId ? response.organization : org,
        ),
      );
      toast.success("Organization updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update organization");

      // Still update locally for demo purposes
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId ? { ...org, ...updates } : org,
        ),
      );
    }
  };

  // Function to create a new organization
  const createOrganization = async (name: string) => {
    if (!currentUser || !accessToken) return;

    try {
      const response = await organizationApi.create(accessToken, { name });
      const newOrg = {
        ...response.organization,
        logo: defaultOrgLogo, // Add default logo
        courses: [],
      };

      setOrganizations((prev) => [...prev, newOrg]);

      // Update current user with the new organization
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              organizationName: name,
              organizationId: newOrg.id,
            }
          : null,
      );

      toast.success("Organization created successfully!");
    } catch (error: any) {
      console.error("Failed to create organization:", error);
      toast.error(error.message || "Failed to create organization");
    }
  };

  // Convert current user to UserProfile format for backwards compatibility with AdminDashboard
  const getUserProfile = (): UserProfile | null => {
    if (!currentUser) return null;

    const userOrg = getCurrentUserOrganization();

    return {
      id: currentUser.id,
      username: currentUser.fullName,
      role: "admin",
      company: currentUser.organizationName || currentUser.fullName,
      subsidiary: userOrg,
      canSwitchSubsidiaries: false,
      permissions: ["view_all", "manage_all", "analytics_all"],
    };
  };

  // Show loading screen while checking session or loading organizations
  if (
    isLoadingSession ||
    (currentUser && !isPlatformAdmin && isLoadingOrganizations)
  ) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isLoadingSession
              ? "Loading session..."
              : "Loading organization..."}
          </p>
        </div>
      </div>
    );
  }

  // Show deployment guide if server is not healthy and no user is logged in
  if (serverHealthy === false && !currentUser) {
    return <DeploymentGuide />;
  }

  return (
    <Router>
      <ScrollToTop />
      {/* SEO Meta Tags */}
      <SEOHead />

      <PasswordResetRedirect />
      <div className="min-h-screen">
        {/* Toast Notifications */}
        <Toaster position="top-right" richColors closeButton />

        {/* Server Status Banner */}
        {serverHealthy === false && currentUser && (
          <div className="bg-amber-500 text-white px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                  <span className="font-medium">
                    Edge Function Not Responding
                  </span>
                  <span className="text-sm opacity-90">
                    Deploy using: supabase functions deploy server
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => (window.location.href = "/deploy-guide")}
                  className="px-4 py-1.5 bg-white text-amber-600 rounded-md hover:bg-amber-50 transition-colors flex-shrink-0 text-sm"
                >
                  Deploy Guide
                </button>
                <button
                  onClick={() => (window.location.href = "/health-check")}
                  className="px-4 py-1.5 bg-white text-amber-600 rounded-md hover:bg-amber-50 transition-colors flex-shrink-0 text-sm"
                >
                  Diagnose
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-1.5 bg-white text-amber-600 rounded-md hover:bg-amber-50 transition-colors flex-shrink-0"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        )}

        <Routes>
          {/* Sign Up route - Public */}
          <Route
            path="/signup"
            element={
              currentUser ? (
                isPlatformAdmin ? (
                  <Navigate to="/platform-admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <AuthPage
                  onLogin={handleLogin}
                  onSignUp={handleSignUp}
                  defaultTab="signup"
                />
              )
            }
          />

          {/* Sign In / Login route - Public */}
          <Route
            path="/login"
            element={
              currentUser ? (
                isPlatformAdmin ? (
                  <Navigate to="/platform-admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              ) : (
                <AuthPage
                  onLogin={handleLogin}
                  onSignUp={handleSignUp}
                  defaultTab="signin"
                />
              )
            }
          />

          {/* Legacy /auth route - redirect to /login for backwards compatibility */}
          <Route path="/auth" element={<Navigate to="/login" replace />} />

          {/* Password Reset route - Public */}
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Platform Admin Panel - protected, admin only */}
          <Route
            path="/platform-admin"
            element={
              currentUser && isPlatformAdmin ? (
                <PlatformAdminPanel
                  adminEmail={currentUser.email}
                  accessToken={accessToken}
                  onLogout={handleLogout}
                />
              ) : currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Dashboard route - protected, regular users only */}
          <Route
            path="/dashboard"
            element={
              currentUser && !isPlatformAdmin ? (
                <div className="min-h-screen bg-gray-50">
                  <AdminDashboard
                    user={getUserProfile()!}
                    subsidiaries={organizations}
                    userProfiles={[getUserProfile()!]}
                    onLogout={handleLogout}
                    onUpdateSubsidiary={updateOrganization}
                    onCreateOrganization={createOrganization}
                    accessToken={accessToken}
                  />
                </div>
              ) : currentUser && isPlatformAdmin ? (
                <Navigate to="/platform-admin" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Template Builder route - protected, regular users only */}
          <Route
            path="/template-builder"
            element={
              currentUser && !isPlatformAdmin ? (
                <div className="min-h-screen bg-gray-50">
                  <TemplateBuilderPage
                    organization={getCurrentUserOrganization()!}
                    isPremiumUser={isOrgPremium(getCurrentUserOrganization())}
                    onBack={() => (window.location.href = "/dashboard")}
                    accessToken={accessToken}
                  />
                </div>
              ) : currentUser && isPlatformAdmin ? (
                <Navigate to="/platform-admin" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Admin Utilities route - protected, regular users only */}
          <Route
            path="/admin-utilities"
            element={
              currentUser && !isPlatformAdmin ? (
                <div className="min-h-screen bg-gray-50">
                  <AdminUtilities />
                </div>
              ) : currentUser && isPlatformAdmin ? (
                <Navigate to="/platform-admin" replace />
              ) : (
                <Navigate to="/auth" replace />
              )
            }
          />

          {/* Test route to verify routing works */}
          <Route
            path="/test-route"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg">
                  <h1 className="text-2xl font-bold text-green-600 mb-4">
                    ✅ Test Route Works!
                  </h1>
                  <p className="text-gray-600">
                    React Router is working correctly.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Current path: {window.location.pathname}
                  </p>
                  <div className="mt-4 p-4 bg-gray-100 rounded">
                    <p className="text-xs text-gray-700">
                      Hash: {window.location.hash}
                    </p>
                  </div>
                </div>
              </div>
            }
          />

          {/* Simple certificate test route - no encryption */}
          <Route
            path="/test-cert"
            element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-lg max-w-2xl">
                  <h1 className="text-2xl font-bold text-blue-600 mb-4">
                    ✅ Certificate Route Test
                  </h1>
                  <p className="text-gray-600">
                    If you can see this, the certificate routing works!
                  </p>
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-700">
                      <strong>Path:</strong> {window.location.pathname}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Hash:</strong> {window.location.hash}
                    </p>
                    <p className="text-sm text-gray-700">
                      <strong>Full URL:</strong> {window.location.href}
                    </p>
                  </div>
                  <div className="mt-6 space-y-2">
                    <p className="text-sm font-semibold">Test Links:</p>
                    <a
                      href="/test-cert"
                      className="block text-blue-600 hover:underline"
                    >
                      → Test /test-cert
                    </a>
                    <a
                      href="/certificate/test123"
                      className="block text-blue-600 hover:underline"
                      target="_blank"
                    >
                      → Test /certificate/test123 (new tab)
                    </a>
                  </div>
                </div>
              </div>
            }
          />

          {/* Student certificate routes - public */}
          {/* Supports both encrypted and legacy formats:
              - Encrypted: /certificate/{encryptedData}
              - Legacy: /certificate/{orgId}/{courseId}/{certId} */}
          <Route
            path="/certificate/*"
            element={<StudentCertificate subsidiaries={organizations} />}
          />

          {/* Certificate verification route - public */}
          <Route
            path="/verify/:certificateId"
            element={<CertificateVerification />}
          />

          {/* Backend health check - public */}
          <Route path="/health-check" element={<BackendHealthCheck />} />

          {/* Payment verification - Paystack redirects here after checkout */}
          <Route path="/payment/verify" element={<PaymentVerifyPage />} />

          {/* Invoice view */}
          <Route path="/invoice/:id" element={<InvoicePage />} />

          {/* Deployment guide - public */}
          <Route path="/deploy-guide" element={<DeploymentGuide />} />

          {/* Query Premium Organizations - public */}
          <Route path="/query-premium" element={<QueryPremiumOrgs />} />

          {/* SEO Test Page - public */}
          <Route path="/seo-test" element={<SEOTestPage />} />

          {/* Blog pages */}
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blog/:id" element={<BlogDetails />} />

          {/* Certificate verification — public, scannable via QR */}
          <Route path="/verify/:certificateId" element={<VerificationPage />} />

          {/* Digital Products storefront — public */}
          <Route path="/store/:orgId" element={<StorefrontPage />} />

          {/* Digital Products access page — post-payment */}
          <Route path="/access/:reference" element={<ProductAccessPage />} />

          {/* Story page */}
          <Route path="/story" element={<Story />} />

          {/* Privacy Page */}
          <Route path="/privacy" element={<Privacy />} />

          {/* Terms Page */}
          <Route path="/terms" element={<Terms />} />

          {/* Default route - Landing Page or Dashboard */}
          <Route
            path="/"
            element={(() => {
              const hash = window.location.hash;
              const isCertificateUrl = hash.includes("/certificate");

              if (isCertificateUrl) {
                return <CertificateRedirect />;
              }

              // If user is logged in, redirect to their dashboard
              if (currentUser) {
                return isPlatformAdmin ? (
                  <Navigate to="/platform-admin" replace />
                ) : (
                  <Navigate to="/dashboard" replace />
                );
              }

              // Not logged in - show landing page
              return <LandingPage />;
            })()}
          />

          {/* Catch all other routes */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Onboarding Wizard Modal */}
        {showOnboarding && onboardingData && accessToken && (
          <OnboardingWizard
            organizationId={onboardingData.organizationId}
            organizationName={onboardingData.organizationName}
            accessToken={accessToken}
            onComplete={(goToCertificates) => {
              setShowOnboarding(false);
              toast.success("Welcome! Your account is all set up! 🎉");

              // Trigger certificate list refresh
              setRefreshCertificates(true);

              // If goToCertificates is true, navigate to dashboard with certificates section
              if (goToCertificates) {
                // Store the target section in sessionStorage so dashboard knows where to go
                sessionStorage.setItem("dashboardSection", "certificates");
                // Also store refresh flag
                sessionStorage.setItem("refreshCertificates", "true");
              }

              // Reset the refresh trigger after a short delay
              setTimeout(() => setRefreshCertificates(false), 1000);
            }}
            onSkip={() => {
              setShowOnboarding(false);
              toast.info(
                "You can complete these steps later from your dashboard",
              );
            }}
          />
        )}
      </div>
    </Router>
  );
}