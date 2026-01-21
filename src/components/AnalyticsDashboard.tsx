import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Share2,
  MessageSquare,
  Download,
  Eye,
  Calendar,
  Target
} from 'lucide-react';

interface AnalyticsDashboardProps {
  subsidiary: any;
  stats: any;
}

// Mock analytics data
const monthlyData = [
  { month: 'Jan', certificates: 45, testimonials: 18, shares: 67 },
  { month: 'Feb', certificates: 52, testimonials: 23, shares: 89 },
  { month: 'Mar', certificates: 48, testimonials: 19, shares: 78 },
  { month: 'Apr', certificates: 61, testimonials: 28, shares: 105 },
  { month: 'May', certificates: 58, testimonials: 25, shares: 98 },
  { month: 'Jun', certificates: 73, testimonials: 32, shares: 134 }
];

const socialShareData = [
  { name: 'LinkedIn', value: 45, color: '#0077B5' },
  { name: 'Facebook', value: 30, color: '#1877F2' },
  { name: 'Twitter', value: 15, color: '#1DA1F2' },
  { name: 'WhatsApp', value: 10, color: '#25D366' }
];

const programPerformance = [
  { program: 'Bioinformatics Bootcamp', certificates: 245, engagement: 78, testimonials: 89 },
  { program: 'AI Fundamentals', certificates: 156, engagement: 82, testimonials: 67 },
  { program: 'Data Science Basics', certificates: 89, engagement: 65, testimonials: 34 },
  { program: 'Machine Learning', certificates: 67, engagement: 71, testimonials: 28 }
];

export default function AnalyticsDashboard({ subsidiary, stats }: AnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Certificates</CardTitle>
            <Award className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCertificates}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+12%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testimonials</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTestimonials}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+8%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card> */}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Social Shares</CardTitle>
            <Share2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalShares}</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+23%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Rate</CardTitle>
            <Target className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.engagementRate}%</div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span className="text-green-500">+5%</span>
              <span>from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity Trends</CardTitle>
            <CardDescription>
              Certificates issued, testimonials collected, and social shares
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="certificates" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  name="Certificates"
                />
                <Line 
                  type="monotone" 
                  dataKey="testimonials" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Testimonials"
                />
                <Line 
                  type="monotone" 
                  dataKey="shares" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Shares"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Social Media Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media Shares</CardTitle>
            <CardDescription>
              Distribution of certificate shares across platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={socialShareData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {socialShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Program Performance Overview</CardTitle>
          <CardDescription>
            Detailed breakdown by program showing certificates, engagement, and testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programPerformance.map((program, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <h4 className="font-semibold">{program.program}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {program.certificates} certificates
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      {program.testimonials} testimonials
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Engagement Rate</p>
                    <p className="font-semibold">{program.engagement}%</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {program.engagement >= 80 && (
                      <Badge className="bg-green-100 text-green-800">Excellent</Badge>
                    )}
                    {program.engagement >= 70 && program.engagement < 80 && (
                      <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
                    )}
                    {program.engagement < 70 && (
                      <Badge className="bg-orange-100 text-orange-800">Needs Improvement</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest certificate generations and testimonial submissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">5 new certificates generated</p>
                <p className="text-sm text-gray-600">Bioinformatics Bootcamp • 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">New testimonial with video</p>
                <p className="text-sm text-gray-600">AI Fundamentals Course • 4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <Share2 className="w-4 h-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Certificate shared on LinkedIn</p>
                <p className="text-sm text-gray-600">Bioinformatics Bootcamp • 6 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}