import React, { useState, useEffect } from "react";
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
  Calendar,
  Users,
  Award,
  Activity,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { analyticsApi } from "../utils/api";
import { toast } from "sonner";
import AnalyticsSkeleton from "./skeletons/AnalyticsSkeleton";

interface TrackingViewProps {
  organizationId: string;
  accessToken: string | null;
}

interface TrackingData {
  downloads: {
    total: number;
    byMonth: Record<string, number>;
    byProgram: Record<string, number>;
  };
  timeSpent: {
    totalSeconds: number;
    totalHours: number;
    totalMinutes: number;
    byMonth: Record<string, number>;
    byUser: Record<string, number>;
  };
  totalCertificates: number;
}

const COLORS = ["#f97316", "#fb923c", "#fdba74", "#fed7aa", "#ffedd5"];

export default function TrackingView({
  organizationId,
  accessToken,
}: TrackingViewProps) {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingData = async () => {
      if (!accessToken || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await analyticsApi.getForOrganization(
          accessToken,
          organizationId,
        );

        setTrackingData({
          downloads: response.analytics.downloads || {
            total: 0,
            byMonth: {},
            byProgram: {},
          },
          timeSpent: response.analytics.timeSpent || {
            totalSeconds: 0,
            totalHours: 0,
            totalMinutes: 0,
            byMonth: {},
            byUser: {},
          },
          totalCertificates: response.analytics.totalCertificates || 0,
        });
      } catch (error: any) {
        toast.error(error.message || "Failed to load tracking data");
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, [organizationId, accessToken]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!trackingData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                No Tracking Data Available
              </h3>
              <p className="text-gray-600">
                Start generating and downloading certificates to see tracking
                data
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate download rate
  const downloadRate =
    trackingData.totalCertificates > 0
      ? Math.round(
          (trackingData.downloads.total / trackingData.totalCertificates) * 100,
        )
      : 0;

  // Format monthly download data for chart
  const monthlyDownloadData = Object.entries(
    trackingData.downloads.byMonth || {},
  )
    .map(([month, count]) => ({
      month,
      downloads: count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  // Format monthly time data for chart
  const monthlyTimeData = Object.entries(trackingData.timeSpent.byMonth || {})
    .map(([month, seconds]) => ({
      month,
      hours: Math.round((seconds / 3600) * 10) / 10, // Round to 1 decimal
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-6); // Last 6 months

  // Format program download data for pie chart
  const programDownloadData = Object.entries(
    trackingData.downloads.byProgram || {},
  )
    .map(([program, count]) => ({
      name: program.substring(0, 20) + (program.length > 20 ? "..." : ""),
      value: count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5 programs

  // Calculate average time per session (assuming ~2 min sync intervals)
  const avgSessionMinutes =
    trackingData.timeSpent.totalSeconds > 0
      ? Math.round(trackingData.timeSpent.totalSeconds / 60)
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Tracking Dashboard
          </CardTitle>
          <CardDescription>
            Monitor certificate downloads and tutor active time on the platform
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics - Downloads */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Download className="w-5 h-5 text-blue-600" />
          Download Statistics
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
                {trackingData.downloads.total.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                All-time certificate downloads
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Download Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{downloadRate}%</div>
              <p className="text-xs text-muted-foreground">
                Downloads per certificate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Programs Tracked
              </CardTitle>
              <Award className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(trackingData.downloads.byProgram || {}).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Programs with downloads
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Key Metrics - Time Spent */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Time Tracking Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Active Time
              </CardTitle>
              <Clock className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {trackingData.timeSpent.totalHours}h{" "}
                {trackingData.timeSpent.totalMinutes}m
              </div>
              <p className="text-xs text-muted-foreground">
                Cumulative tutor time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Minutes
              </CardTitle>
              <Calendar className="h-4 w-4 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {avgSessionMinutes.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">
                Minutes on platform
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
              <Users className="h-4 w-4 text-pink-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.keys(trackingData.timeSpent.byUser || {}).length}
              </div>
              <p className="text-xs text-muted-foreground">Users tracked</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Downloads Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Downloads by Month</CardTitle>
            <CardDescription>
              Certificate download trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyDownloadData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={monthlyDownloadData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Bar dataKey="downloads" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No monthly data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Time Spent Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Active Time by Month</CardTitle>
            <CardDescription>
              Tutor active hours over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyTimeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyTimeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#9333ea"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-gray-500">
                No monthly data available yet
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Program Downloads Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Downloads by Program (Top 5)
          </CardTitle>
          <CardDescription>
            Which programs have the most certificate downloads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {programDownloadData.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={programDownloadData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} (${(percent * 100).toFixed(0)}%)`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {programDownloadData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3">
                <h4 className="font-semibold text-sm text-gray-700">
                  Program Breakdown
                </h4>
                {programDownloadData.map((program, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <span className="text-sm">{program.name}</span>
                    </div>
                    <Badge variant="secondary">{program.value} downloads</Badge>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-gray-500">
              No program download data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">
                About Activity Tracking
              </h4>
              <p className="text-sm text-blue-800">
                <strong>Downloads:</strong> Tracks every time a student
                downloads a certificate. Helps you understand certificate
                engagement and popular programs.
              </p>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Time Tracking:</strong> Automatically tracks your active
                time on the platform. Time is synced every 2 minutes and when
                you close the tab.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}