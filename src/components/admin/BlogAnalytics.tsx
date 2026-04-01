import { useState, useEffect } from "react";
import {
  analyticsApi,
  BlogAnalytics as BlogAnalyticsType,
  OverviewAnalytics,
} from "../../utils/analytics";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Eye,
  Users,
  Clock,
  TrendingUp,
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface BlogAnalyticsProps {
  blogId?: string;
  blogTitle?: string;
}

export default function BlogAnalytics({
  blogId,
  blogTitle,
}: BlogAnalyticsProps) {
  const [analytics, setAnalytics] = useState<
    BlogAnalyticsType | OverviewAnalytics | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month");
  const [activeReaders, setActiveReaders] = useState(0);

  useEffect(() => {
    fetchAnalytics();
    fetchActiveReaders();

    // Refresh active readers every 30 seconds
    const interval = setInterval(fetchActiveReaders, 30000);
    return () => clearInterval(interval);
  }, [blogId, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);

      const endDate = new Date().toISOString().split("T")[0];
      let startDate: string | undefined;

      if (timeRange === "week") {
        const date = new Date();
        date.setDate(date.getDate() - 7);
        startDate = date.toISOString().split("T")[0];
      } else if (timeRange === "month") {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        startDate = date.toISOString().split("T")[0];
      }

      if (blogId) {
        const data = await analyticsApi.getBlogAnalytics(
          blogId,
          startDate,
          endDate,
        );
        setAnalytics(data);
      } else {
        const data = await analyticsApi.getOverviewAnalytics(
          startDate,
          endDate,
        );
        setAnalytics(data);
      }
    } catch (error: any) {
      console.error("Failed to fetch analytics:", error);
      // Don't show error toast, just show empty state
      setAnalytics(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveReaders = async () => {
    try {
      const data = await analyticsApi.getActiveReaders();
      setActiveReaders(data.active_readers);
    } catch (error) {
      // Silent fail - active readers is a nice-to-have
      setActiveReaders(0);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-200 rounded-lg"></div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 rounded-lg"></div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  const isBlogAnalytics = "blog_id" in analytics;

  // Device breakdown data for pie chart
  const deviceData = isBlogAnalytics
    ? [
        {
          name: "Desktop",
          value: analytics.device_breakdown.desktop,
          color: "#3b82f6",
        },
        {
          name: "Mobile",
          value: analytics.device_breakdown.mobile,
          color: "#10b981",
        },
        {
          name: "Tablet",
          value: analytics.device_breakdown.tablet,
          color: "#f59e0b",
        },
      ].filter((item) => item.value > 0)
    : [];

  // Format reading time
  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {blogTitle || "Blog Analytics Overview"}
          </h2>
          <p className="text-gray-600 mt-1">
            {isBlogAnalytics
              ? "Detailed post analytics"
              : "All blog posts combined"}
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-2">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-2 rounded-lg ${
              timeRange === "week"
                ? "bg-[#FF7700] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-2 rounded-lg ${
              timeRange === "month"
                ? "bg-[#FF7700] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange("all")}
            className={`px-4 py-2 rounded-lg ${
              timeRange === "all"
                ? "bg-[#FF7700] text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Views */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Views</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.total_views.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Eye className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Unique Visitors</p>
              <p className="text-3xl font-bold mt-1">
                {analytics.unique_visitors.toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Avg Reading Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Avg Reading Time</p>
              <p className="text-3xl font-bold mt-1">
                {formatTime(analytics.avg_reading_time)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Active Readers or Posts Viewed */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">
                {isBlogAnalytics ? "Active Now" : "Posts Viewed"}
              </p>
              <p className="text-3xl font-bold mt-1">
                {isBlogAnalytics
                  ? activeReaders.toLocaleString()
                  : "total_posts_viewed" in analytics
                    ? analytics.total_posts_viewed.toLocaleString()
                    : "0"}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          {isBlogAnalytics && activeReaders > 0 && (
            <p className="text-xs text-gray-500 mt-2">👁️ Reading right now</p>
          )}
        </div>
      </div>

      {/* Views Over Time Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Views Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={analytics.views_by_date}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }
            />
            <YAxis />
            <Tooltip
              labelFormatter={(value) => new Date(value).toLocaleDateString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="views"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Total Views"
            />
            <Line
              type="monotone"
              dataKey="unique"
              stroke="#10b981"
              strokeWidth={2}
              name="Unique Visitors"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Device & Referrer Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Device Breakdown */}
        {isBlogAnalytics && deviceData.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Device Breakdown</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <span className="text-sm">
                  Desktop: {analytics.device_breakdown.desktop}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-green-600" />
                <span className="text-sm">
                  Mobile: {analytics.device_breakdown.mobile}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Tablet className="w-4 h-4 text-orange-600" />
                <span className="text-sm">
                  Tablet: {analytics.device_breakdown.tablet}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Top Referrers */}
        {isBlogAnalytics && analytics.top_referrers.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Top Referrers</h3>
            <div className="space-y-3">
              {analytics.top_referrers.slice(0, 10).map((ref, index) => {
                let displayReferrer = ref.referrer;
                try {
                  if (
                    ref.referrer !== "direct" &&
                    ref.referrer !== "internal"
                  ) {
                    const url = new URL(ref.referrer);
                    displayReferrer = url.hostname;
                  }
                } catch (e) {
                  // Keep as is
                }

                const percentage = (
                  (ref.count / analytics.total_views) *
                  100
                ).toFixed(1);

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                      <span className="text-sm truncate">
                        {displayReferrer}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-[#FF7700] h-2 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold w-12 text-right">
                        {ref.count}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Posts (Overview only) */}
        {!isBlogAnalytics &&
          "top_posts" in analytics &&
          analytics.top_posts.length > 0 && (
            <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">
                Top Performing Posts
              </h3>
              <div className="space-y-3">
                {analytics.top_posts.slice(0, 5).map((post, index) => (
                  <div
                    key={post.blog_id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-gray-400">
                          #{index + 1}
                        </span>
                        <span className="font-semibold">{post.blog_title}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-500" />
                        <span>{post.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{post.unique_visitors.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Scroll Depth (Blog Analytics only) */}
      {isBlogAnalytics && analytics.avg_scroll_depth > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Average Scroll Depth</h3>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-6 relative">
                <div
                  className="bg-gradient-to-r from-[#FF7700] to-[#FF9900] h-6 rounded-full flex items-center justify-center text-white text-sm font-semibold"
                  style={{ width: `${analytics.avg_scroll_depth}%` }}
                >
                  {Math.round(analytics.avg_scroll_depth)}%
                </div>
              </div>
            </div>
            <span className="text-2xl font-bold">
              {Math.round(analytics.avg_scroll_depth)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            On average, readers scroll through{" "}
            {Math.round(analytics.avg_scroll_depth)}% of the post
          </p>
        </div>
      )}
    </div>
  );
}