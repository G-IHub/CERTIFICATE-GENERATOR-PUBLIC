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
  Search,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Layout,
  Mail,
  FileText,
  Crown,
  Activity,
  BarChart3,
  Download,
  Eye,
} from "lucide-react";
import { publicAnonKey, projectId } from "../utils/supabase/info";

interface OrganizationAnalytics {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  ownerEmail: string;
  createdAt: string;
  isPremium: boolean;

  // Activity metrics
  totalCertificates: number;
  totalPrograms: number;
  totalTestimonials: number;

  // Template usage
  mostUsedTemplate: string;
  templateUsage: { [key: string]: number };

  // Time metrics
  lastActive: string;
  daysActive: number;

  // Engagement metrics
  certificatesThisWeek: number;
  certificatesThisMonth: number;
  averageCertificatesPerDay: number;

  // Growth metrics
  growthRate: number; // percentage
}

interface UserAnalytics {
  id: string;
  fullName: string;
  email: string;
  organizationName: string;
  organizationLogo: string;
  createdAt: string;

  // Activity metrics
  totalCertificatesGenerated: number;
  totalProgramsCreated: number;

  // Time metrics
  lastLogin: string;
  daysActive: number;

  // Engagement
  certificatesThisWeek: number;
  certificatesThisMonth: number;
  mostActiveDay: string;
}

interface PlatformAnalyticsProps {
  accessToken: string | null;
}

export default function PlatformAnalytics({
  accessToken,
}: PlatformAnalyticsProps) {
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState<OrganizationAnalytics[]>(
    []
  );
  const [users, setUsers] = useState<UserAnalytics[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"organizations" | "users">(
    "organizations"
  );
  const [sortBy, setSortBy] = useState<
    "activity" | "certificates" | "date" | "engagement"
  >("activity");
  const [filterPremium, setFilterPremium] = useState<
    "all" | "premium" | "free"
  >("all");

  // Overall platform stats
  const [platformStats, setPlatformStats] = useState({
    totalOrganizations: 0,
    totalUsers: 0,
    totalCertificates: 0,
    avgCertificatesPerOrg: 0,
    avgCertificatesPerUser: 0,
    activeOrganizationsThisWeek: 0,
    activeUsersThisWeek: 0,
    topTemplate: "",
    templateBreakdown: {} as { [key: string]: number },
  });

  // Load analytics data
  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const authHeader = accessToken ?? publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/analytics`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authHeader}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load analytics data");
      }

      const data = await response.json();

      setOrganizations(data.organizations || []);
      setUsers(data.users || []);
      setPlatformStats(data.platformStats || platformStats);
    } catch (error) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  // Filter and sort logic
  const filteredOrganizations = organizations
    .filter((org) => {
      const matchesSearch =
        org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        org.ownerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPremium =
        filterPremium === "all" ||
        (filterPremium === "premium" && org.isPremium) ||
        (filterPremium === "free" && !org.isPremium);
      return matchesSearch && matchesPremium;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "certificates":
          return b.totalCertificates - a.totalCertificates;
        case "engagement":
          return b.certificatesThisMonth - a.certificatesThisMonth;
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "activity":
        default:
          return (
            new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
          );
      }
    });

  const filteredUsers = users
    .filter((user) => {
      return (
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "certificates":
          return b.totalCertificatesGenerated - a.totalCertificatesGenerated;
        case "engagement":
          return b.certificatesThisMonth - a.certificatesThisMonth;
        case "date":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "activity":
        default:
          return (
            new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime()
          );
      }
    });

  const formatDate = (dateString: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  const getTemplateDisplayName = (template: string) => {
    if (template.startsWith("template")) {
      return `Template ${template.replace("template", "")}`;
    }
    return template || "Unknown";
  };

  const exportToCSV = () => {
    if (viewMode === "organizations") {
      const headers = [
        "Organization Name",
        "Email",
        "Status",
        "Created",
        "Total Certificates",
        "Programs",
        "Testimonials",
        "Most Used Template",
        "Last Active",
        "Certificates This Week",
        "Certificates This Month",
        "Avg Per Day",
      ];

      const rows = filteredOrganizations.map((org) => [
        org.name,
        org.ownerEmail,
        org.isPremium ? "Premium" : "Free",
        org.createdAt,
        org.totalCertificates,
        org.totalPrograms,
        org.totalTestimonials,
        getTemplateDisplayName(org.mostUsedTemplate),
        org.lastActive,
        org.certificatesThisWeek,
        org.certificatesThisMonth,
        org.averageCertificatesPerDay.toFixed(2),
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `organizations-analytics-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    } else {
      const headers = [
        "User Name",
        "Email",
        "Organization",
        "Created",
        "Certificates Generated",
        "Programs Created",
        "Last Login",
        "Certificates This Week",
        "Certificates This Month",
      ];

      const rows = filteredUsers.map((user) => [
        user.fullName,
        user.email,
        user.organizationName,
        user.createdAt,
        user.totalCertificatesGenerated,
        user.totalProgramsCreated,
        user.lastLogin,
        user.certificatesThisWeek,
        user.certificatesThisMonth,
      ]);

      const csvContent = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(","))
        .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `users-analytics-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Platform Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Organizations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats.totalOrganizations}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {platformStats.activeOrganizationsThisWeek} active this week
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats.totalUsers}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {platformStats.activeUsersThisWeek} active this week
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Certificates</p>
                <p className="text-2xl font-bold text-gray-900">
                  {platformStats.totalCertificates}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {platformStats.avgCertificatesPerOrg.toFixed(1)} avg per org
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Top Template</p>
                <p className="text-2xl font-bold text-gray-900">
                  {getTemplateDisplayName(platformStats.topTemplate)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Most popular choice
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Layout className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Template Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Template Usage Breakdown</CardTitle>
          <CardDescription>
            Most popular certificate templates across all organizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(platformStats.templateBreakdown)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([template, count]) => {
                const percentage =
                  (count / platformStats.totalCertificates) * 100;
                return (
                  <div key={template}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">
                        {getTemplateDisplayName(template)}
                      </span>
                      <span className="text-sm text-gray-500">
                        {count} uses ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "organizations" ? "default" : "outline"}
            onClick={() => setViewMode("organizations")}
            size="sm"
          >
            <Building2 className="w-4 h-4 mr-2" />
            Organizations
          </Button>
          <Button
            variant={viewMode === "users" ? "default" : "outline"}
            onClick={() => setViewMode("users")}
            size="sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </Button>
        </div>

        <div className="relative flex-1 w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
          <SelectTrigger className="w-[180px] h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="activity">Last Active</SelectItem>
            <SelectItem value="certificates">Total Certificates</SelectItem>
            <SelectItem value="engagement">Monthly Activity</SelectItem>
            <SelectItem value="date">Date Created</SelectItem>
          </SelectContent>
        </Select>

        {viewMode === "organizations" && (
          <Select
            value={filterPremium}
            onValueChange={(value: any) => setFilterPremium(value)}
          >
            <SelectTrigger className="w-[150px] h-9 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="premium">Premium Only</SelectItem>
              <SelectItem value="free">Free Only</SelectItem>
            </SelectContent>
          </Select>
        )}

        <Button variant="outline" size="sm" onClick={exportToCSV}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Organizations View */}
      {viewMode === "organizations" && (
        <div className="space-y-3">
          {filteredOrganizations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No organizations found</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrganizations.map((org) => (
              <Card
                key={org.id}
                className={
                  org.isPremium ? "border-primary/30 bg-primary/5" : ""
                }
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Logo */}
                    <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {org.logo ? (
                        <img
                          src={org.logo}
                          alt={org.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-8 h-8 text-gray-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-900 truncate">
                          {org.name}
                        </h3>
                        {org.isPremium && (
                          <Badge className="bg-primary text-white flex items-center gap-1">
                            <Crown className="w-3 h-3" />
                            Premium
                          </Badge>
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm text-gray-900 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {org.ownerEmail}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Created
                          </p>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formatDate(org.createdAt)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Last Active
                          </p>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {formatDate(org.lastActive)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Top Template
                          </p>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Layout className="w-3 h-3 text-gray-400" />
                            {getTemplateDisplayName(org.mostUsedTemplate)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Certificates
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {org.totalCertificates}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Programs
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {org.totalPrograms}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Testimonials
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {org.totalTestimonials}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            This Week
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {org.certificatesThisWeek}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            This Month
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {org.certificatesThisMonth}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Avg/Day
                          </p>
                          <p className="text-lg font-bold text-purple-600">
                            {org.averageCertificatesPerDay.toFixed(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Users View */}
      {viewMode === "users" && (
        <div className="space-y-3">
          {filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-10">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No users found</p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Organization Logo */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                      {user.organizationLogo ? (
                        <img
                          src={user.organizationLogo}
                          alt={user.organizationName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-gray-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-gray-900">
                          {user.fullName}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Email</p>
                          <p className="text-sm text-gray-900 truncate flex items-center gap-1">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {user.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Organization
                          </p>
                          <p className="text-sm text-gray-900 truncate flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-gray-400" />
                            {user.organizationName}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Last Login
                          </p>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            {formatDate(user.lastLogin)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">
                            Member Since
                          </p>
                          <p className="text-sm text-gray-900 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formatDate(user.createdAt)}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Certificates
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {user.totalCertificatesGenerated}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Programs
                          </p>
                          <p className="text-lg font-bold text-gray-900">
                            {user.totalProgramsCreated}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            This Week
                          </p>
                          <p className="text-lg font-bold text-green-600">
                            {user.certificatesThisWeek}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            This Month
                          </p>
                          <p className="text-lg font-bold text-blue-600">
                            {user.certificatesThisMonth}
                          </p>
                        </div>
                        <div className="bg-white rounded-lg p-2 border border-gray-200">
                          <p className="text-xs text-gray-500 mb-0.5">
                            Days Active
                          </p>
                          <p className="text-lg font-bold text-purple-600">
                            {user.daysActive}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}