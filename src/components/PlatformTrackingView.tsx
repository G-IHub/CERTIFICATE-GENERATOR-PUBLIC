import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import {
  Download,
  Clock,
  TrendingUp,
  Building2,
  Activity,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { publicAnonKey, projectId } from "../utils/supabase/info";

interface PlatformTrackingViewProps {
  accessToken: string | null;
}

interface OrgTrackingData {
  organizationId: string;
  organizationName: string;
  totalDownloads: number;
  totalTimeSeconds: number;
  totalTimeFormatted: string;
  totalCertificates: number;
}

export default function PlatformTrackingView({
  accessToken,
}: PlatformTrackingViewProps) {
  const [loading, setLoading] = useState(true);
  const [trackingData, setTrackingData] = useState<OrgTrackingData[]>([]);
  const [totals, setTotals] = useState({
    downloads: 0,
    timeSpent: { hours: 0, minutes: 0 },
    certificates: 0,
  });

  useEffect(() => {
    fetchTrackingData();
  }, [accessToken]);

  const fetchTrackingData = async () => {
    try {
      const authHeader = accessToken ?? publicAnonKey;
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-a611b057/admin/tracking-data`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${authHeader}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to load tracking data");
      }

      const data = await response.json();

      // Handle error response even with 200 status
      if (data.error) {
        console.error("Server returned error:", data.error);
        toast.error("Warning: " + data.error);
      }

      // Process tracking data with fallback
      const processedData: OrgTrackingData[] = Array.isArray(data.trackingData)
        ? data.trackingData
        : [];
      setTrackingData(processedData);

      // Calculate totals
      const totalDownloads = processedData.reduce(
        (sum, org) => sum + (org.totalDownloads || 0),
        0,
      );
      const totalSeconds = processedData.reduce(
        (sum, org) => sum + (org.totalTimeSeconds || 0),
        0,
      );
      const totalCertificates = processedData.reduce(
        (sum, org) => sum + (org.totalCertificates || 0),
        0,
      );

      setTotals({
        downloads: totalDownloads,
        timeSpent: {
          hours: Math.floor(totalSeconds / 3600),
          minutes: Math.floor((totalSeconds % 3600) / 60),
        },
        certificates: totalCertificates,
      });
    } catch (error: any) {
      console.error("Error loading tracking data:", error);
      toast.error("Failed to load tracking data: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Platform-wide Activity Tracking
          </CardTitle>
          <CardDescription>
            Monitor certificate downloads and tutor active time across all
            organizations
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Platform Totals */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Platform Totals
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Downloads
              </CardTitle>
              <Download className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.downloads.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all organizations
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Time
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.timeSpent.hours}h {totals.timeSpent.minutes}m
              </div>
              <p className="text-xs text-muted-foreground">
                Cumulative tutor time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Certificates
              </CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totals.certificates.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Platform-wide certificates
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Per Organization Tracking */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-gray-700" />
          Organization Breakdown ({trackingData.length} Organizations)
        </h3>

        {trackingData.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-gray-900">
                  No Organizations Found
                </h3>
                <p className="text-gray-600">
                  No organizations exist in the database yet
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trackingData.map((org) => {
              const downloadRate =
                org.totalCertificates > 0
                  ? Math.round(
                      (org.totalDownloads / org.totalCertificates) * 100,
                    )
                  : 0;

              return (
                <Card
                  key={org.organizationId}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-900 mb-1">
                          {org.organizationName}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {org.organizationId}
                        </p>
                      </div>
                      {downloadRate > 0 && (
                        <Badge
                          variant="secondary"
                          className="bg-blue-50 text-blue-700"
                        >
                          {downloadRate}% download rate
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Download className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {org.totalDownloads.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Downloads</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {org.totalTimeFormatted}
                          </p>
                          <p className="text-xs text-gray-500">Active Time</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                          <Award className="w-5 h-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-gray-900">
                            {org.totalCertificates.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">Certificates</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                About Platform Tracking
              </h4>
              <p className="text-sm text-blue-800">
                <strong>Downloads:</strong> Tracks every certificate download by
                students across all organizations. Helps identify engagement
                levels.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Active Time:</strong> Automatically tracks tutor time
                spent on the platform. Updated every 2 minutes and on session
                end.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}