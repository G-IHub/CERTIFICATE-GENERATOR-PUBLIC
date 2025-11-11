import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { BarChart3, TrendingUp, Star, Eye, Award, MessageSquare } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { analyticsApi } from '../utils/api';
import { toast } from 'sonner';
import AnalyticsSkeleton from './skeletons/AnalyticsSkeleton';

interface AnalyticsViewProps {
  organizationId: string;
  accessToken: string | null;
}

interface Analytics {
  totalCertificates: number;
  totalTestimonials: number;
  engagementRate: number;
  coursePerformance: Array<{
    name: string;
    certificates: number;
    testimonials: number;
  }>;
  monthlyData: Array<{
    month: string;
    certificates: number;
    testimonials: number;
  }>;
  recentActivity: Array<any>;
}

export default function AnalyticsView({ organizationId, accessToken }: AnalyticsViewProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!accessToken || !organizationId) {
        setLoading(false);
        return;
      }

      try {
        const response = await analyticsApi.getForOrganization(accessToken, organizationId);
        setAnalytics(response.analytics);
      } catch (error: any) {
        toast.error(error.message || 'Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [organizationId, accessToken]);

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">No Analytics Available</h3>
              <p className="text-gray-600">
                Start generating certificates to see analytics
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Analytics Dashboard
          </CardTitle>
          <CardDescription>
            Comprehensive insights into certificate generation and student engagement
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalCertificates}</div>
            <p className="text-xs text-muted-foreground">
              Certificates generated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTestimonials}</div>
            <p className="text-xs text-muted-foreground">
              Student feedback received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.engagementRate}%</div>
            <p className="text-xs text-muted-foreground">
              Testimonials per certificate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      {analytics.monthlyData.length > 0 || analytics.coursePerformance.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trend */}
          {analytics.monthlyData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Certificate Trend</CardTitle>
                <CardDescription>Certificate generation and testimonial submission over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <RechartsTooltip />
                      <Line type="monotone" dataKey="certificates" stroke="#ea580c" strokeWidth={2} name="Certificates" />
                      <Line type="monotone" dataKey="testimonials" stroke="#525252" strokeWidth={2} name="Testimonials" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Course Performance */}
          {analytics.coursePerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Course Performance</CardTitle>
                <CardDescription>Certificate and testimonial counts by course</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.coursePerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                      />
                      <YAxis />
                      <RechartsTooltip />
                      <Bar dataKey="certificates" fill="#ea580c" name="Certificates" />
                      <Bar dataKey="testimonials" fill="#525252" name="Testimonials" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">Not Enough Data Yet</h3>
              <p className="text-gray-600">
                Generate more certificates to see detailed analytics and trends
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {analytics.recentActivity && analytics.recentActivity.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
            <CardDescription>Latest certificate generations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.recentActivity.slice(0, 5).map((cert, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Award className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{cert.studentName}</p>
                      <p className="text-sm text-gray-600">{cert.courseName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(cert.generatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}