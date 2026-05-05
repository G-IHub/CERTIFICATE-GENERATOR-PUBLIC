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
import { Separator } from "./ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Building2,
  Users,
  Award,
  FileText,
  Search,
  LogOut,
  Calendar,
  TrendingUp,
  Shield,
  Mail,
  Activity,
  CheckCircle,
  RefreshCw,
  LayoutDashboard,
  Settings,
  BarChart3,
  Menu,
  X,
  CreditCard,
  UserCog,
  Crown,
  MessageCircle,
  BookOpen,
  Trash2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { publicAnonKey, projectId } from "../utils/supabase/info";
import BillingSettings from "./BillingSettings";
import AdminEmailsView from "./AdminEmailsView";
import PlatformAnalytics from "./PlatformAnalytics";
import PlatformTrackingView from "./PlatformTrackingView";
import TemplateVisibilityManager from "./TemplateVisibilityManager";
import { BlogManagement } from "./admin/BlogManagement";
import AdminPayoutManagement from "./AdminPayoutManagement";
import MonetizationPage from "./MonetizationPage";

interface PlatformAdminPanelProps {
  adminEmail: string;
  accessToken: string | null;
  onLogout: () => void;
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
  courses: any[];
  settings?: any;
  subscription?: {
    plan: string;
    status: string;
    expiryDate?: string;
    grantedByAdmin?: boolean;
  };
  isPremium?: boolean;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  organizationId: string;
  organizationName: string;
  createdAt: string;
}

interface Certificate {
  id: string;
  studentName: string;
  courseName: string;
  organizationId: string;
  courseId?: string;
  template: string;
  createdAt: string;
  verificationUrl: string;
}

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalCertificates: number;
  totalTestimonials: number;
  newOrganizationsToday: number;
  newUsersToday: number;
  certificatesGeneratedToday: number;
}

export default function PlatformAdminPanel({
  adminEmail,
  accessToken,
  onLogout,
}: PlatformAdminPanelProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<
    | "overview"
    | "organizations"
    | "analytics"
    | "tracking"
    | "billing"
    | "emails"
    | "blog"
    | "templates"
    | "payouts"
  >("overview");
  const [stats, setStats] = useState<PlatformStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalCertificates: 0,
    totalTestimonials: 0,
    newOrganizationsToday: 0,
    newUsersToday: 0,
    certificatesGeneratedToday: 0,
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [adminStats, setAdminStats] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activityFilter, setActivityFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortOrder, setSortOrder] = useState<
    "newest" | "oldest" | "name" | "most_certificates"
  >("newest");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<Organization | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Load all platform data
  const loadPlatformData = async () => {
    try {
      const authHeader = accessToken ?? publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/platform-data`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authHeader}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to load platform data");
      }

      const data = await response.json();

      console.log("🔍 ADMIN DEBUG - Raw platform data:", data);
      console.log(
        "🔍 ADMIN DEBUG - Organizations count:",
        data.organizations?.length,
      );

      // Process organizations - ensure all fields have defaults and unique IDs
      const orgs: Organization[] = (data.organizations || [])
        .filter((org: any) => org && org.id) // Only include items with IDs
        .map((org: any, index: number) => ({
          id: org.id || `org-${index}`,
          name: org.name || "Unnamed Organization",
          shortName: org.shortName || "",
          logo: org.logo || "",
          primaryColor: org.primaryColor || "#ea580c",
          ownerId: org.ownerId || "",
          ownerEmail: org.ownerEmail || null,
          createdAt: org.createdAt || "",
          courses: org.courses || [],
          settings: org.settings || null,
          subscription: org.subscription || null,
          isPremium:
            org.subscription?.status === "active" &&
            org.subscription?.plan !== "free",
        }))
        .map((org: Organization) => {
          // Debug each organization's subscription and premium status
          if (org.subscription) {
            console.log(`🔍 ORG DEBUG - ${org.name}:`, {
              subscription: org.subscription,
              isPremium: org.isPremium,
              status: org.subscription.status,
              plan: org.subscription.plan,
            });
          }
          return org;
        });

      // Remove duplicates by ID
      const uniqueOrgs = Array.from(
        new Map(orgs.map((org) => [org.id, org])).values(),
      );
      setOrganizations(uniqueOrgs);

      // Process users - ensure all fields have defaults and unique IDs
      const allUsers: User[] = (data.users || [])
        .filter((user: any) => user && user.id) // Only include items with IDs
        .map((user: any, index: number) => ({
          id: user.id || `user-${index}`,
          email: user.email || "",
          fullName: user.fullName || "Unknown User",
          organizationId: user.organizationId || "",
          organizationName: user.organizationName || "",
          createdAt: user.createdAt || "",
        }));

      // Remove duplicates by ID
      const uniqueUsers = Array.from(
        new Map(allUsers.map((user) => [user.id, user])).values(),
      );
      setUsers(uniqueUsers);

      // Process certificates - ensure all fields have defaults and unique IDs
      const allCerts: Certificate[] = (data.certificates || [])
        .filter((cert: any) => cert && cert.id) // Only include items with IDs
        .map((cert: any, index: number) => ({
          id: cert.id || `cert-${index}`,
          studentName: cert.studentName || "Unknown Student",
          courseName: cert.courseName || "Unknown Course",
          organizationId: cert.organizationId || "",
          courseId: cert.courseId || undefined,
          template: cert.template || "",
          createdAt: cert.createdAt || "",
          verificationUrl: cert.verificationUrl || "",
        }));

      // Remove duplicates by ID
      const uniqueCerts = Array.from(
        new Map(allCerts.map((cert) => [cert.id, cert])).values(),
      );
      setCertificates(uniqueCerts);

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const newOrgsToday = uniqueOrgs.filter(
        (org) => org.createdAt && new Date(org.createdAt) >= todayStart,
      ).length;

      const newUsersToday = uniqueUsers.filter(
        (user) => user.createdAt && new Date(user.createdAt) >= todayStart,
      ).length;

      const certsToday = uniqueCerts.filter(
        (cert) => cert.createdAt && new Date(cert.createdAt) >= todayStart,
      ).length;



      setStats({
        totalOrganizations: uniqueOrgs.length,
        totalUsers: uniqueUsers.length,
        totalCertificates: uniqueCerts.length,
        totalTestimonials: data.testimonials?.length || 0,
        newOrganizationsToday: newOrgsToday,
        newUsersToday: newUsersToday,
        certificatesGeneratedToday: certsToday,
      });

      // After loading platform data, also refresh aggregated admin stats
      try {
        await loadAdminStats();
      } catch (err) {
        console.warn(
          "Could not load admin stats after platform data load",
          err,
        );
      }
    } catch (error: any) {
      console.error("Error loading platform data:", error);
      toast.error("Failed to load platform data: " + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [accessToken]);

  // Load aggregated admin stats from backend
  const loadAdminStats = async () => {
    try {
      const authHeader = accessToken ?? publicAnonKey;
      console.log(
        "🔐 loadAdminStats: adminEmail=",
        adminEmail,
        "hasAccessToken=",
        !!accessToken,
      );
      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/stats`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authHeader}`,
            "Content-Type": "application/json",
          },
        },
      );
      console.log("📡 Admin stats response status:", res.status);
      if (!res.ok) {
        let errData: any = null;
        try {
          errData = await res.json();
        } catch (e) {
          // ignore
        }
        console.error("Admin stats fetch failed", res.status, errData);
        toast.error(
          `Failed to load analytics: ${errData?.error || res.status}`,
        );
        return;
      }

      const data = await res.json();
      console.log("✅ Admin stats fetched:", data);
      console.log("➡️ adminStats payload:", data?.stats);
      if (data?.stats) {
        setAdminStats(data.stats);
      } else {
        console.warn("Admin stats response missing stats payload", data);
      }
    } catch (error: any) {
      console.error("Failed to load admin stats:", error);
    }
  };

  useEffect(() => {
    loadAdminStats();
  }, [accessToken]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlatformData();
    toast.success("Data refreshed successfully");
  };



  // Handle deleting an organization
  const handleDeleteOrganization = async (org: Organization) => {
    setOrgToDelete(org);
    setDeleteDialogOpen(true);
  };

  // Confirm delete organization
  const handleConfirmDelete = async () => {
    if (!orgToDelete || !accessToken) {
      toast.error("Unable to delete organization");
      return;
    }

    setDeleting(true);

    try {
      console.log(
        "🗑️ Deleting organization:",
        orgToDelete.id,
        orgToDelete.name,
      );

      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/organizations/${orgToDelete.id}`;
      console.log("🌐 DELETE URL:", url);

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 Response status:", response.status);
      console.log("📡 Response ok:", response.ok);

      // Try to get response body regardless of status
      let errorData;
      try {
        errorData = await response.json();
        console.log("📄 Response data:", errorData);
      } catch (e) {
        console.error("❌ Failed to parse response as JSON:", e);
        const text = await response.text().catch(() => "");
        console.log("📄 Response text:", text);
        throw new Error(
          `Server returned ${response.status}: ${text || "No response body"}`,
        );
      }

      if (!response.ok) {
        const errorMessage =
          errorData.error ||
          errorData.message ||
          `Failed with status ${response.status}`;
        console.error("❌ Server error:", errorMessage);
        throw new Error(errorMessage);
      }

      console.log("✅ Organization deleted successfully:", errorData);

      toast.success(`${orgToDelete.name} has been deleted successfully`);
      setDeleteDialogOpen(false);
      setOrgToDelete(null);
      await loadPlatformData(); // Reload data
    } catch (error: any) {
      console.error("❌ Error deleting organization:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
        orgId: orgToDelete.id,
        orgName: orgToDelete.name,
      });
      toast.error(error.message || "Failed to delete organization");
    } finally {
      setDeleting(false);
    }
  };

  // Helper to check if created in last 24 hours
  const isNew = (createdAt: string) => {
    if (!createdAt) return false;
    const created = new Date(createdAt);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return created >= oneDayAgo;
  };

  // Helper to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Filter organizations based on search and activity, then sort
  const filteredOrganizations = organizations
    .filter((org) => {
      const matchesSearch =
        org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());

      const hasCertificates = certificates.some((c) => c.organizationId === org.id);
      const matchesActivityFilter =
        activityFilter === "all"
          ? true
          : activityFilter === "active"
            ? hasCertificates
            : activityFilter === "inactive"
              ? !hasCertificates
              : true;

      return matchesSearch && matchesActivityFilter;
    })
    .sort((a, b) => {
      if (sortOrder === "newest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      } else if (sortOrder === "oldest") {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      } else if (sortOrder === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortOrder === "most_certificates") {
        const countA = certificates.filter((c) => c.organizationId === a.id).length;
        const countB = certificates.filter((c) => c.organizationId === b.id).length;
        return countB - countA;
      }
      return 0;
    });

  // Filter users based on search
  const filteredUsers = users.filter(
    (user) =>
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading platform data...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "organizations",
      label: "Organizations",
      icon: Building2,
      count: filteredOrganizations.length,
    },
    { id: "templates", label: "Template Visibility", icon: FileText },
    { id: "billing", label: "Billing Settings", icon: CreditCard },
    { id: "payouts", label: "Monetization", icon: Wallet },
    { id: "emails", label: "Email Addresses", icon: Mail },
    { id: "blog", label: "Blog", icon: BookOpen },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "tracking", label: "Activity Tracking", icon: Activity },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Desktop Sidebar - Hidden on Mobile */}
      <aside
        className={`hidden md:flex bg-white border-r border-gray-200 transition-all duration-300 ${
          sidebarOpen ? "w-56" : "w-16"
        } flex-col`}
      >
        {/* Sidebar Header */}
        <div className="h-14 border-b border-gray-200 flex items-center justify-between px-3">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-gray-900 text-sm">Platform Admin</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className="w-7 h-7 p-0"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="w-7 h-7 p-0 mx-auto"
            >
              <Menu className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`w-full flex items-center gap-2 px-2.5 py-2 rounded-lg transition-colors text-sm ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        <Separator />

        {/* User Section */}
        <div className="p-3 space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className={`w-full justify-start text-sm h-8 ${
              !sidebarOpen && "justify-center px-0"
            }`}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""} ${
                sidebarOpen && "mr-2"
              }`}
            />
            {sidebarOpen && "Refresh"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className={`w-full justify-start text-sm h-8 text-red-600 hover:text-red-700 hover:bg-red-50 ${
              !sidebarOpen && "justify-center px-0"
            }`}
          >
            <LogOut className={`w-3.5 h-3.5 ${sidebarOpen && "mr-2"}`} />
            {sidebarOpen && "Logout"}
          </Button>
          {sidebarOpen && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Navigation Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col h-full bg-white">
            {/* Logo and Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-primary" />
                </div>
                <span className="text-gray-900 text-sm">Platform Admin</span>
              </div>
              <div className="text-xs text-gray-500">{adminEmail}</div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as any);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.count !== undefined && (
                      <Badge variant="secondary" className="ml-auto text-xs">
                        {item.count}
                      </Badge>
                    )}
                  </button>
                );
              })}
            </nav>

            <Separator />

            {/* Actions */}
            <div className="p-4 space-y-2 border-t border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleRefresh();
                  setMobileMenuOpen(false);
                }}
                disabled={refreshing}
                className="w-full justify-start text-sm"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
                />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>

            <div className="flex-1">
              <h1 className="text-gray-900 mb-0.5 text-lg">
                {activeView === "overview" && "Dashboard Overview"}
                {activeView === "organizations" && "Organizations"}
                {activeView === "templates" && "Template Visibility"}
                {activeView === "billing" && "Billing Settings"}
                {activeView === "payouts" && "Monetization"}
                {activeView === "emails" && "Email Addresses"}
                {activeView === "blog" && "Blog Management"}
                {activeView === "analytics" && "Analytics"}
                {activeView === "tracking" && "Activity Tracking"}
              </h1>
              <p className="text-gray-500 text-sm hidden md:block">
                {activeView === "overview" &&
                  "Platform-wide statistics and recent activity"}
                {activeView === "organizations" &&
                  "Manage all organizations on the platform"}
                {activeView === "templates" &&
                  "Configure template visibility for organizations"}
                {activeView === "billing" &&
                  "Configure payment system and pricing"}
                {activeView === "payouts" &&
                  "Platform-wide transactions, seller earnings, payouts and settings"}
                {activeView === "emails" &&
                  "Collected student email addresses from testimonials"}
                {activeView === "blog" &&
                  "Create and manage blog posts for the Certifyer platform"}
                {activeView === "analytics" &&
                  "Platform analytics and insights"}
                {activeView === "tracking" &&
                  "Track recent activities and changes"}
              </p>
            </div>
            {activeView === "organizations" && (
              <div className="relative w-72 hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={`Search ${activeView}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-9 text-sm"
                />
              </div>
            )}
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6">
          {activeView === "overview" && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">
                      Organizations
                    </CardTitle>
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">
                      {stats.totalOrganizations}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        {stats.newOrganizationsToday > 0 && (
                          <span className="text-green-600">
                            +{stats.newOrganizationsToday} today
                          </span>
                        )}
                        {stats.newOrganizationsToday === 0 && "No new today"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">
                      Users
                    </CardTitle>
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">
                      {stats.totalUsers}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {stats.newUsersToday > 0 && (
                        <span className="text-green-600">
                          +{stats.newUsersToday} today
                        </span>
                      )}
                      {stats.newUsersToday === 0 && "No new today"}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">
                      Certificates
                    </CardTitle>
                    <Award className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">
                      {stats.totalCertificates}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {stats.certificatesGeneratedToday > 0 && (
                        <span className="text-green-600">
                          +{stats.certificatesGeneratedToday} today
                        </span>
                      )}
                      {stats.certificatesGeneratedToday === 0 && "None today"}
                    </p>
                  </CardContent>
                </Card>



                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">
                      Testimonials
                    </CardTitle>
                    <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">
                      {stats.totalTestimonials}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Feedback received
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed & System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="border-gray-200">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                    <CardDescription className="text-xs">
                      New organizations in the last 24 hours
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-1.5">
                      {organizations
                        .filter((org) => isNew(org.createdAt))
                        .slice(0, 4)
                        .map((org) => (
                          <div
                            key={org.id}
                            className="flex items-center gap-2 p-2 bg-gray-50 rounded-md"
                          >
                            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
                              <Building2 className="w-3.5 h-3.5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-900 truncate">
                                {org.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                New organization
                              </p>
                            </div>
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 flex-shrink-0 text-xs px-1.5 py-0"
                            >
                              NEW
                            </Badge>
                          </div>
                        ))}
                      {organizations.filter((org) => isNew(org.createdAt))
                        .length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">
                          No recent activity
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-sm">System Health</CardTitle>
                    <CardDescription className="text-xs">
                      All systems operational
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-gray-900">
                            API Server
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0"
                        >
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-gray-900">
                            Database
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0"
                        >
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-gray-900">
                            Authentication
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0"
                        >
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === "organizations" && (
            <div>
              {/* Filter Controls */}
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search organizations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 h-9 text-sm"
                    />
                  </div>
                  <Select
                    value={activityFilter}
                    onValueChange={(value: any) => setActivityFilter(value)}
                  >
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Filter Activity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      <SelectItem value="active">Active (Generated Certs)</SelectItem>
                      <SelectItem value="inactive">Inactive (No Certs)</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={sortOrder}
                    onValueChange={(value: any) => setSortOrder(value)}
                  >
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                      <SelectItem value="most_certificates">Most Certificates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    {organizations.filter((o) => certificates.some((c) => c.organizationId === o.id)).length} Active
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    {organizations.filter((o) => !certificates.some((c) => c.organizationId === o.id)).length} Inactive
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{filteredOrganizations.length} shown</span>
                </div>
              </div>



              {filteredOrganizations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchTerm
                        ? "No organizations found matching your search"
                        : "No organizations yet"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {filteredOrganizations.map((org) => (
                    <Card
                      key={org.id}
                      className="border-gray-200 hover:border-gray-300 transition-colors"
                    >
                      <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
                          {org.logo ? (
                            <img
                              src={org.logo}
                              alt={org.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {org.name}
                            </h3>
                            {isNew(org.createdAt) && (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 border-green-200 flex-shrink-0 text-xs px-2"
                              >
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-gray-400" />
                              {org.ownerEmail || "No email"}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Award className="w-3.5 h-3.5 text-gray-400" />
                              {certificates.filter((c) => c.organizationId === org.id).length} certificate(s)
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-gray-400" />
                              Joined {formatDate(org.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOrganization(org)}
                            className="text-xs h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
                            title="Delete organization"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Users view removed — no longer needed */}

          {activeView === "billing" && (
            <BillingSettings accessToken={accessToken} />
          )}

          {activeView === "payouts" && (
            <MonetizationPage
              accessToken={accessToken!}
              isAdmin={true}
              adminOnly={true}
              organizationId={undefined}
              userId={adminEmail}
            />
          )}

          {activeView === "templates" && (
            <TemplateVisibilityManager
              accessToken={accessToken}
              organizations={organizations}
            />
          )}

          {activeView === "emails" && (
            <AdminEmailsView accessToken={accessToken} />
          )}

          {activeView === "blog" && (
            <BlogManagement
              currentUser={{
                name: "Platform Admin",
                email: adminEmail,
              }}
            />
          )}

          {activeView === "analytics" && (
            <PlatformAnalytics accessToken={accessToken} />
          )}

          {activeView === "tracking" && (
            <PlatformTrackingView accessToken={accessToken} />
          )}
        </div>
      </main>



      {/* Delete Organization Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete {orgToDelete?.name}?
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {orgToDelete?.name}? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={deleting}
            >
              {deleting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}