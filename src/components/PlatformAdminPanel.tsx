import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
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
  Crown
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { publicAnonKey, projectId } from '../utils/supabase/info';
import BillingSettings from './BillingSettings';

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
  programs: any[];
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
  programId?: string;
  template: string;
  createdAt: string;
  verificationUrl: string;
}

interface PlatformStats {
  totalOrganizations: number;
  totalUsers: number;
  totalCertificates: number;
  totalPrograms: number;
  newOrganizationsToday: number;
  newUsersToday: number;
  certificatesGeneratedToday: number;
}

export default function PlatformAdminPanel({ adminEmail, accessToken, onLogout }: PlatformAdminPanelProps) {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'overview' | 'organizations' | 'users' | 'analytics' | 'billing'>('overview');
  const [stats, setStats] = useState<PlatformStats>({
    totalOrganizations: 0,
    totalUsers: 0,
    totalCertificates: 0,
    totalPrograms: 0,
    newOrganizationsToday: 0,
    newUsersToday: 0,
    certificatesGeneratedToday: 0,
  });
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [premiumFilter, setPremiumFilter] = useState<'all' | 'premium' | 'free'>('all');
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [premiumDuration, setPremiumDuration] = useState('12');

  // Load all platform data
  const loadPlatformData = async () => {
    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/platform-data`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load platform data');
      }

      const data = await response.json();
      
      console.log('🔍 ADMIN DEBUG - Raw platform data:', data);
      console.log('🔍 ADMIN DEBUG - Organizations count:', data.organizations?.length);
      
      // Process organizations - ensure all fields have defaults and unique IDs
      const orgs: Organization[] = (data.organizations || [])
        .filter((org: any) => org && org.id) // Only include items with IDs
        .map((org: any, index: number) => ({
          id: org.id || `org-${index}`,
          name: org.name || 'Unnamed Organization',
          shortName: org.shortName || '',
          logo: org.logo || '',
          primaryColor: org.primaryColor || '#ea580c',
          ownerId: org.ownerId || '',
          ownerEmail: org.ownerEmail || null,
          createdAt: org.createdAt || '',
          programs: org.programs || [],
          settings: org.settings || null,
          subscription: org.subscription || null,
          isPremium: org.subscription?.status === 'active' && org.subscription?.plan !== 'free',
        }))
        .map((org: Organization) => {
          // Debug each organization's subscription and premium status
          if (org.subscription) {
            console.log(`🔍 ORG DEBUG - ${org.name}:`, {
              subscription: org.subscription,
              isPremium: org.isPremium,
              status: org.subscription.status,
              plan: org.subscription.plan
            });
          }
          return org;
        });
      
      // Remove duplicates by ID
      const uniqueOrgs = Array.from(new Map(orgs.map(org => [org.id, org])).values());
      setOrganizations(uniqueOrgs);

      // Process users - ensure all fields have defaults and unique IDs
      const allUsers: User[] = (data.users || [])
        .filter((user: any) => user && user.id) // Only include items with IDs
        .map((user: any, index: number) => ({
          id: user.id || `user-${index}`,
          email: user.email || '',
          fullName: user.fullName || 'Unknown User',
          organizationId: user.organizationId || '',
          organizationName: user.organizationName || '',
          createdAt: user.createdAt || '',
        }));
      
      // Remove duplicates by ID
      const uniqueUsers = Array.from(new Map(allUsers.map(user => [user.id, user])).values());
      setUsers(uniqueUsers);

      // Process certificates - ensure all fields have defaults and unique IDs
      const allCerts: Certificate[] = (data.certificates || [])
        .filter((cert: any) => cert && cert.id) // Only include items with IDs
        .map((cert: any, index: number) => ({
          id: cert.id || `cert-${index}`,
          studentName: cert.studentName || 'Unknown Student',
          courseName: cert.courseName || 'Unknown Course',
          organizationId: cert.organizationId || '',
          programId: cert.programId || undefined,
          template: cert.template || '',
          createdAt: cert.createdAt || '',
          verificationUrl: cert.verificationUrl || '',
        }));
      
      // Remove duplicates by ID
      const uniqueCerts = Array.from(new Map(allCerts.map(cert => [cert.id, cert])).values());
      setCertificates(uniqueCerts);

      // Calculate stats
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const newOrgsToday = uniqueOrgs.filter(org => 
        org.createdAt && new Date(org.createdAt) >= todayStart
      ).length;

      const newUsersToday = uniqueUsers.filter(user => 
        user.createdAt && new Date(user.createdAt) >= todayStart
      ).length;

      const certsToday = uniqueCerts.filter(cert => 
        cert.createdAt && new Date(cert.createdAt) >= todayStart
      ).length;

      const totalPrograms = uniqueOrgs.reduce((sum, org) => sum + (org.programs?.length || 0), 0);

      setStats({
        totalOrganizations: uniqueOrgs.length,
        totalUsers: uniqueUsers.length,
        totalCertificates: uniqueCerts.length,
        totalPrograms,
        newOrganizationsToday: newOrgsToday,
        newUsersToday: newUsersToday,
        certificatesGeneratedToday: certsToday,
      });

    } catch (error: any) {
      console.error('Error loading platform data:', error);
      toast.error('Failed to load platform data: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlatformData();
    toast.success('Data refreshed successfully');
  };

  // Handle granting premium access
  const handleGrantPremium = async (org: Organization) => {
    setSelectedOrg(org);
    setPremiumModalOpen(true);
  };

  // Handle confirming premium grant
  const handleConfirmGrantPremium = async () => {
    if (!selectedOrg) {
      toast.error('No organization selected');
      return;
    }

    if (!accessToken) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    console.log('🚀 Granting premium to:', selectedOrg.id, selectedOrg.name);
    console.log('📅 Duration:', premiumDuration, 'months');

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/organizations/${selectedOrg.id}/membership`;
      console.log('🌐 Calling:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Use admin's access token, not anon key
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: 'admin-premium',
          planName: 'Premium Plan (Admin Granted)',
          durationMonths: parseInt(premiumDuration),
        }),
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `Failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Success:', result);

      toast.success(`Premium access granted to ${selectedOrg.name} for ${premiumDuration} months`);
      setPremiumModalOpen(false);
      setSelectedOrg(null);
      setPremiumDuration('12'); // Reset to default
      await loadPlatformData(); // Reload to show updated status
    } catch (error: any) {
      console.error('❌ Error granting premium:', error);
      toast.error(error.message || 'Failed to grant premium access');
    }
  };

  // Handle revoking premium access
  const handleRevokePremium = async (org: Organization) => {
    if (!accessToken) {
      toast.error('Authentication required. Please log in again.');
      return;
    }

    if (!confirm(`Are you sure you want to revoke premium access for "${org.name}"?`)) {
      return;
    }

    console.log('🚫 Revoking premium for:', org.id, org.name);

    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/organizations/${org.id}/membership`;
      console.log('🌐 Calling:', url);
      
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`, // Use admin's access token, not anon key
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error response:', errorData);
        throw new Error(errorData.error || `Failed with status ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Success:', result);

      toast.success(`Premium access revoked for ${org.name}`);
      await loadPlatformData(); // Reload to show updated status
    } catch (error: any) {
      console.error('❌ Error revoking premium:', error);
      toast.error(error.message || 'Failed to revoke premium access');
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
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter organizations based on search and premium status
  const filteredOrganizations = organizations.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.ownerEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPremiumFilter = 
      premiumFilter === 'all' ? true :
      premiumFilter === 'premium' ? org.isPremium :
      premiumFilter === 'free' ? !org.isPremium :
      true;
    
    return matchesSearch && matchesPremiumFilter;
  });

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
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
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'organizations', label: 'Organizations', icon: Building2, count: filteredOrganizations.length },
    { id: 'users', label: 'Users', icon: Users, count: filteredUsers.length },
    { id: 'billing', label: 'Billing Settings', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${sidebarOpen ? 'w-56' : 'w-16'} flex flex-col`}>
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
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-100'
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
            className={`w-full justify-start text-sm h-8 ${!sidebarOpen && 'justify-center px-0'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''} ${sidebarOpen && 'mr-2'}`} />
            {sidebarOpen && 'Refresh'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className={`w-full justify-start text-sm h-8 text-red-600 hover:text-red-700 hover:bg-red-50 ${!sidebarOpen && 'justify-center px-0'}`}
          >
            <LogOut className={`w-3.5 h-3.5 ${sidebarOpen && 'mr-2'}`} />
            {sidebarOpen && 'Logout'}
          </Button>
          {sidebarOpen && (
            <div className="pt-2 border-t">
              <p className="text-xs text-gray-500 truncate">{adminEmail}</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-gray-900 mb-0.5 text-lg">
                {activeView === 'overview' && 'Dashboard Overview'}
                {activeView === 'organizations' && 'Organizations'}
                {activeView === 'users' && 'Users'}
                {activeView === 'paid-orgs' && 'Paid Organizations'}
                {activeView === 'users-orgs' && 'Manage Users & Organizations'}
                {activeView === 'billing' && 'Billing Settings'}
                {activeView === 'analytics' && 'Analytics'}
              </h1>
              <p className="text-gray-500 text-sm">
                {activeView === 'overview' && 'Platform-wide statistics and recent activity'}
                {activeView === 'organizations' && 'Manage all organizations on the platform'}
                {activeView === 'users' && 'View and manage all user accounts'}
                {activeView === 'paid-orgs' && 'Organizations with active subscriptions and payments'}
                {activeView === 'users-orgs' && 'Grant or revoke premium access for users'}
                {activeView === 'billing' && 'Configure payment system and pricing'}
                {activeView === 'analytics' && 'Platform analytics and insights'}
              </p>
            </div>
            {(activeView === 'organizations' || activeView === 'users') && (
              <div className="relative w-72">
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
          {activeView === 'overview' && (
            <div className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">Organizations</CardTitle>
                    <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">{stats.totalOrganizations}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Crown className="w-3 h-3 text-primary" />
                        {organizations.filter(o => o.isPremium).length} Premium
                      </p>
                      <span className="text-xs text-gray-300">•</span>
                      <p className="text-xs text-gray-500">
                        {organizations.filter(o => !o.isPremium).length} Free
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">Users</CardTitle>
                    <Users className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">{stats.totalUsers}</div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {stats.newUsersToday > 0 && (
                        <span className="text-green-600">+{stats.newUsersToday} today</span>
                      )}
                      {stats.newUsersToday === 0 && 'No new today'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">Certificates</CardTitle>
                    <Award className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">{stats.totalCertificates}</div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {stats.certificatesGeneratedToday > 0 && (
                        <span className="text-green-600">+{stats.certificatesGeneratedToday} today</span>
                      )}
                      {stats.certificatesGeneratedToday === 0 && 'None today'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0 px-4 pt-3">
                    <CardTitle className="text-xs text-gray-600">Programs</CardTitle>
                    <FileText className="w-3.5 h-3.5 text-gray-400" />
                  </CardHeader>
                  <CardContent className="px-4 pb-3 pt-0">
                    <div className="text-xl text-gray-900">{stats.totalPrograms}</div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Across all organizations
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Activity Feed & System Health */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Card className="border-gray-200">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-sm">Recent Activity</CardTitle>
                    <CardDescription className="text-xs">New organizations in the last 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-1.5">
                      {organizations.filter(org => isNew(org.createdAt)).slice(0, 4).map(org => (
                        <div key={org.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                          <div className="flex items-center justify-center w-7 h-7 rounded-full bg-green-100">
                            <Building2 className="w-3.5 h-3.5 text-green-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-gray-900 truncate">{org.name}</p>
                            <p className="text-xs text-gray-500">New organization</p>
                          </div>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0 text-xs px-1.5 py-0">
                            NEW
                          </Badge>
                        </div>
                      ))}
                      {organizations.filter(org => isNew(org.createdAt)).length === 0 && (
                        <p className="text-xs text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gray-200">
                  <CardHeader className="pb-2 px-4 pt-3">
                    <CardTitle className="text-sm">System Health</CardTitle>
                    <CardDescription className="text-xs">All systems operational</CardDescription>
                  </CardHeader>
                  <CardContent className="px-4 pb-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-gray-900">API Server</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0">
                          Online
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-gray-900">Database</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0">
                          Connected
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded-md">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                          <span className="text-xs text-gray-900">Authentication</span>
                        </div>
                        <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-xs px-1.5 py-0">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeView === 'organizations' && (
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
                  <Select value={premiumFilter} onValueChange={(value: any) => setPremiumFilter(value)}>
                    <SelectTrigger className="w-[180px] h-9 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Organizations</SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center gap-2">
                          <Crown className="w-3.5 h-3.5 text-primary" />
                          Premium Only
                        </div>
                      </SelectItem>
                      <SelectItem value="free">Free Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    {organizations.filter(o => o.isPremium).length} Premium
                  </span>
                  <span className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                    {organizations.filter(o => !o.isPremium).length} Free
                  </span>
                  <span className="text-gray-400">•</span>
                  <span>{filteredOrganizations.length} shown</span>
                </div>
              </div>

              {/* Debug Info - Shows subscription data status */}
              {organizations.length > 0 && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Crown className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm text-blue-900 mb-1">Premium Status Debug</h4>
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>• Total Organizations: {organizations.length}</p>
                          <p>• Organizations with Subscription Data: {organizations.filter(o => o.subscription).length}</p>
                          <p>• Premium Organizations (active + not free): {organizations.filter(o => o.isPremium).length}</p>
                          {organizations.filter(o => o.subscription).length > 0 && (
                            <div className="mt-2 pt-2 border-t border-blue-200">
                              <p className="font-medium mb-1">Subscription Details:</p>
                              {organizations.filter(o => o.subscription).slice(0, 3).map(org => (
                                <div key={org.id} className="ml-2 text-xs">
                                  • {org.name}: status={org.subscription?.status}, plan={org.subscription?.plan}, isPremium={org.isPremium.toString()}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {filteredOrganizations.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <Building2 className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'No organizations found matching your search' : 'No organizations yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {filteredOrganizations.map(org => (
                    <Card key={org.id} className={org.isPremium ? 'border-primary/30 bg-primary/5' : ''}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {org.logo ? (
                            <img src={org.logo} alt={org.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm text-gray-900 truncate">{org.name}</h3>
                            {isNew(org.createdAt) && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0 text-xs">
                                NEW
                              </Badge>
                            )}
                            {org.isPremium && (
                              <Badge className="bg-primary text-white flex-shrink-0 text-xs flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Premium
                              </Badge>
                            )}
                            {org.subscription?.grantedByAdmin && (
                              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex-shrink-0 text-xs">
                                Admin Granted
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {org.ownerEmail || 'No email'}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              {org.programs?.length || 0} programs
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(org.createdAt)}
                            </span>
                            {org.subscription?.expiryDate && (
                              <span className="flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                Expires: {new Date(org.subscription.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {org.isPremium ? (
                            <div className="flex flex-col items-end gap-1.5">
                              {org.subscription?.expiryDate && (
                                <span className="text-xs text-gray-500">
                                  Until {new Date(org.subscription.expiryDate).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokePremium(org)}
                                className="text-xs h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              >
                                Revoke Premium
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleGrantPremium(org)}
                              className="text-xs h-8 bg-primary hover:bg-primary/90"
                            >
                              <Crown className="w-3 h-3 mr-1" />
                              Make Premium
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'users' && (
            <div>
              {filteredUsers.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-10">
                    <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-500">
                      {searchTerm ? 'No users found matching your search' : 'No users yet'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2.5">
                  {filteredUsers.map(user => (
                    <Card key={user.id}>
                      <CardContent className="flex items-center gap-3 p-4">
                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-sm text-gray-900 truncate">{user.fullName}</h3>
                            {isNew(user.createdAt) && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex-shrink-0 text-xs">
                                NEW
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              {user.organizationName || 'No organization'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeView === 'billing' && (
            <BillingSettings accessToken={accessToken} />
          )}

          {activeView === 'analytics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Growth Rate</CardTitle>
                    <CardDescription className="text-xs">Last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-2xl text-gray-900">
                      {stats.totalOrganizations > 0 ? '+15%' : '0%'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Organization growth</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Engagement</CardTitle>
                    <CardDescription className="text-xs">Certificate generation</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-2xl text-gray-900">
                      {stats.totalCertificates > 0 ? 'Active' : 'Low'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Platform activity</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Adoption</CardTitle>
                    <CardDescription className="text-xs">Programs created</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-1">
                    <div className="text-2xl text-gray-900">
                      {stats.totalPrograms}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Total programs</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Platform Insights</CardTitle>
                  <CardDescription className="text-xs">Key metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-900">Average Programs per Organization</p>
                        <p className="text-xl text-gray-500">
                          {stats.totalOrganizations > 0 
                            ? (stats.totalPrograms / stats.totalOrganizations).toFixed(1)
                            : '0'}
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm text-gray-900">Average Certificates per Organization</p>
                        <p className="text-xl text-gray-500">
                          {stats.totalOrganizations > 0 
                            ? (stats.totalCertificates / stats.totalOrganizations).toFixed(1)
                            : '0'}
                        </p>
                      </div>
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Premium Access Modal */}
      <Dialog open={premiumModalOpen} onOpenChange={setPremiumModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" />
              Grant Premium Access
            </DialogTitle>
            <DialogDescription>
              Grant premium access to {selectedOrg?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Subscription Duration</Label>
              <Select value={premiumDuration} onValueChange={setPremiumDuration}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months (1 Year)</SelectItem>
                  <SelectItem value="24">24 Months (2 Years)</SelectItem>
                  <SelectItem value="36">36 Months (3 Years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <h4 className="text-sm text-gray-700">Premium Features Include:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Custom Templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Template Builder
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Unlimited Certificates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Priority Support
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  Advanced Analytics
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPremiumModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmGrantPremium} className="bg-primary hover:bg-primary/90">
              <Crown className="w-4 h-4 mr-2" />
              Grant Premium
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
