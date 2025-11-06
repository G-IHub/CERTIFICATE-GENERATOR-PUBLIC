import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LandingPage from "./components/LandingPage";
import AuthPage from "./components/AuthPage";
import AdminDashboard from "./components/AdminDashboard";
import PlatformAdminPanel from "./components/PlatformAdminPanel";
import StudentCertificate from "./components/StudentCertificate";
import BackendHealthCheck from "./components/BackendHealthCheck";
import DeploymentGuide from "./components/DeploymentGuide";
import NotFound from "./components/NotFound";
import TemplateBuilderPage from "./components/TemplateBuilderPage";
import QueryPremiumOrgs from "./components/QueryPremiumOrgs";
import { organizationApi, authApi, programApi } from "./utils/api";
import { publicAnonKey, projectId } from "./utils/supabase/info";
import { toast, Toaster } from "sonner";
import { isAdminEmail } from "./utils/adminConfig";
import { isOrgPremium } from "./utils/subscriptionUtils";

// Figma asset imports are not available at runtime in this environment.
// Use a stable placeholder URL for the default organization logo.
// If you have a local asset, replace the URL below with a path under /public and
// use that path (for example: const defaultOrgLogo = '/images/default-org-logo.png')
const defaultOrgLogo = "https://via.placeholder.com/256x256.png?text=Org+Logo";

// TypeScript interfaces
interface Program {
  id: string;
  name: string;
  template: "impact" | "professional" | "advanced";
  certificates: number;
  testimonials: number;
  description: string;
  duration?: string;
  prerequisites?: string;
  createdAt?: string;
  createdBy?: string;
}

interface Signatory {
  id: string;
  name: string;
  title: string;
  signatureUrl?: string;
}

interface OrganizationSettings {
  logo: string;
  primaryColor: string;
  signatories: Signatory[];
}

interface Organization {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  primaryColor: string;
  programs: Program[];
  ownerId: string;
  settings?: OrganizationSettings;
}

interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  userType: "company"; // All users are organization users
  organizationName?: string; // Optional - can be added later
  organizationId?: string; // Optional - can be added later
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
  Program,
  Organization,
  UserAccount,
  Signatory,
  OrganizationSettings,
};

// For backwards compatibility with existing components that expect "Subsidiary"
export type Subsidiary = Organization;

export default function App() {
  // Authentication state
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isLoadingOrganizations, setIsLoadingOrganizations] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [serverHealthy, setServerHealthy] = useState<boolean | null>(null); // null = checking, true = healthy, false = unhealthy
  const [isPlatformAdmin, setIsPlatformAdmin] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      // Check if the server is running (with extended timeout for cold starts)

      // Try health check with retries to handle Edge Function cold starts
      let healthCheckSucceeded = false;
      const maxRetries = 4; // Increased to 4 retries
      const retryDelay = 3000; // 3 seconds between retries

      for (
        let attempt = 1;
        attempt <= maxRetries && !healthCheckSucceeded;
        attempt++
      ) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 20000); // Increased to 20 second timeout

          // Supabase Edge Functions require the anon key for authentication
          const healthResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/health`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
                "Content-Type": "application/json",
              },
              signal: controller.signal,
            }
          );
          clearTimeout(timeoutId);

          if (healthResponse.ok) {
            const data = await healthResponse.json();
            healthCheckSucceeded = true;
            setServerHealthy(true);
          } else {
            // Try to read error response
            let errorDetail = "";
            try {
              const errorData = await healthResponse.text();
              errorDetail = errorData;
            } catch (e) {
              errorDetail = "Could not read error details";
            }

            if (attempt < maxRetries) {
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }
        } catch (healthError: any) {
          if (attempt < maxRetries) {
            await new Promise((resolve) => setTimeout(resolve, retryDelay));
          }
        }
      }

      if (!healthCheckSucceeded) {
        setServerHealthy(false);
      }

      const token = localStorage.getItem("accessToken");

      if (token) {
        try {
          // Only check session if server is healthy
          if (healthCheckSucceeded) {
            const response = await authApi.getSession(token);
            setAccessToken(token);
            setCurrentUser(response.user);

            // Check if this is a platform admin
            if (response.user && isAdminEmail(response.user.email)) {
              setIsPlatformAdmin(true);
            } else {
              // Load user's organizations for regular users
              await loadOrganizations(token);
            }
          } else {
            // Server not available - remove token to force fresh login
            localStorage.removeItem("accessToken");
          }
        } catch (error: any) {
          // Silently clear invalid/expired tokens - user will see login screen
          // Don't log these errors as they're expected for expired sessions
          if (
            !error.message?.includes("Failed to fetch") &&
            !error.name?.includes("AbortError") &&
            error.message
          ) {
            // Only clear token for actual auth errors
            localStorage.removeItem("accessToken");
          }
        }
      }

      setIsLoadingSession(false);
    };

    checkSession();
  }, []);

  // Load organizations for the current user
  const loadOrganizations = async (token: string) => {
    setIsLoadingOrganizations(true);
    try {
      const response = await organizationApi.getAll(token);
      setOrganizations(response.organizations || []);
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
              legacyUser.subsidiary as Organization,
            ]);
          }
        }
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
    updates: Partial<Organization>
  ) => {
    if (!accessToken) return;

    try {
      const response = await organizationApi.update(
        accessToken,
        organizationId,
        updates
      );
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId ? response.organization : org
        )
      );
      toast.success("Organization updated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to update organization");

      // Still update locally for demo purposes
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId ? { ...org, ...updates } : org
        )
      );
    }
  };

  // Function to add new program
  const addProgramToOrganization = async (
    organizationId: string,
    newProgram: Program
  ) => {
    if (!accessToken) {
      // Still update locally for immediate feedback
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId
            ? { ...org, programs: [...org.programs, newProgram] }
            : org
        )
      );
      return;
    }

    try {
      // Use programApi instead of direct fetch
      const data = await programApi.create(accessToken, {
        organizationId,
        program: newProgram,
      });

      // Update local state with backend-confirmed data
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId
            ? { ...org, programs: [...org.programs, data.program] }
            : org
        )
      );

      toast.success("Program saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save program");

      // Still update locally as fallback
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId
            ? { ...org, programs: [...org.programs, newProgram] }
            : org
        )
      );
    }
  };

  // Function to update program statistics
  const updateProgramStats = async (
    organizationId: string,
    programId: string,
    certificateCount: number
  ) => {
    // Update locally immediately for responsiveness
    setOrganizations((prev) =>
      prev.map((org) =>
        org.id === organizationId
          ? {
              ...org,
              programs: org.programs.map((prog) =>
                prog.id === programId
                  ? {
                      ...prog,
                      certificates: prog.certificates + certificateCount,
                    }
                  : prog
              ),
            }
          : org
      )
    );

    // Backend is updated automatically when certificates are generated
    // The certificate generation API updates the program stats
  };

  // Function to update program details
  const updateProgram = async (
    organizationId: string,
    programId: string,
    updates: Partial<Program>
  ) => {
    if (!accessToken) {
      // Still update locally
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId
            ? {
                ...org,
                programs: org.programs.map((prog) =>
                  prog.id === programId ? { ...prog, ...updates } : prog
                ),
              }
            : org
        )
      );
      return;
    }

    try {
      // Use programApi instead of direct fetch
      const data = await programApi.update(
        accessToken,
        organizationId,
        programId,
        updates
      );

      // Update local state with backend-confirmed data
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId
            ? {
                ...org,
                programs: org.programs.map((prog) =>
                  prog.id === programId ? data.program : prog
                ),
              }
            : org
        )
      );
    } catch (error: any) {
      // Still update locally as fallback
      setOrganizations((prev) =>
        prev.map((org) =>
          org.id === organizationId
            ? {
                ...org,
                programs: org.programs.map((prog) =>
                  prog.id === programId ? { ...prog, ...updates } : prog
                ),
              }
            : org
        )
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
          : null
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
                  onClick={() => (window.location.href = "/#/deploy-guide")}
                  className="px-4 py-1.5 bg-white text-amber-600 rounded-md hover:bg-amber-50 transition-colors flex-shrink-0 text-sm"
                >
                  Deploy Guide
                </button>
                <button
                  onClick={() => (window.location.href = "/#/health-check")}
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
                    onAddProgram={addProgramToOrganization}
                    onUpdateProgramStats={updateProgramStats}
                    onUpdateProgram={updateProgram}
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
                    onBack={() => (window.location.href = "/#/dashboard")}
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
                      href="/#/test-cert"
                      className="block text-blue-600 hover:underline"
                    >
                      → Test /#/test-cert
                    </a>
                    <a
                      href="/#/certificate/test123"
                      className="block text-blue-600 hover:underline"
                      target="_blank"
                    >
                      → Test /#/certificate/test123 (new tab)
                    </a>
                  </div>
                </div>
              </div>
            }
          />

          {/* Student certificate routes - public */}
          {/* Supports both encrypted and legacy formats:
              - Encrypted: /certificate/{encryptedData}
              - Legacy: /certificate/{orgId}/{programId}/{certId} */}
          <Route
            path="/certificate/*"
            element={<StudentCertificate subsidiaries={organizations} />}
          />

          {/* Backend health check - public */}
          <Route path="/health-check" element={<BackendHealthCheck />} />

          {/* Deployment guide - public */}
          <Route path="/deploy-guide" element={<DeploymentGuide />} />

          {/* Query Premium Organizations - public */}
          <Route path="/query-premium" element={<QueryPremiumOrgs />} />

          {/* Default route - Landing Page or Dashboard */}
          <Route
            path="/"
            element={(() => {
              const hash = window.location.hash;
              const isCertificateUrl = hash.includes("/certificate");

              if (isCertificateUrl) {
                // Use window.location.replace() instead of <Navigate>
                // This is the SAME approach that makes the View button work!
                const fullUrl = `${window.location.origin}${hash}`;
                window.location.replace(fullUrl);

                // Return a loading state while the redirect happens
                return (
                  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading certificate...</p>
                    </div>
                  </div>
                );
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
      </div>
    </Router>
  );
}

// Export types for use in other components
export type { Program, Organization as Subsidiary, UserProfile, UserAccount };
