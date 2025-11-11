import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AlertCircle, CheckCircle, Copy, ExternalLink, Terminal } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

export default function DeploymentGuide() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h1 className="text-3xl">Edge Function Not Deployed</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Your Certificate Generator Platform backend needs to be deployed to Supabase. This is a one-time setup that takes about 2 minutes.
          </p>
        </div>

        {/* Quick Fix Card */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-orange-600" />
              <CardTitle className="text-orange-900">⚡ Quick Fix - One Command</CardTitle>
            </div>
            <CardDescription>Run this command in your terminal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
              <code>supabase functions deploy server</code>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyToClipboard('supabase functions deploy server')}
                className="text-green-400 hover:text-green-300 hover:bg-gray-800"
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center">
                1
              </div>
              <div>
                <p className="text-gray-900">Wait 60 seconds for deployment to complete</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 w-6 h-6 bg-orange-600 text-white rounded-full flex items-center justify-center">
                2
              </div>
              <div>
                <p className="text-gray-900">Refresh this page</p>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-green-700">You're ready to use the platform! 🎉</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Setup Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Don't Have Supabase CLI?</CardTitle>
            <CardDescription>Install it first, then deploy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Step 1</Badge>
                <span className="text-sm">Install Supabase CLI</span>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                <code>npm install -g supabase</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('npm install -g supabase')}
                  className="text-green-400 hover:text-green-300 hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Step 2 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Step 2</Badge>
                <span className="text-sm">Login to Supabase</span>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                <code>supabase login</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('supabase login')}
                  className="text-green-400 hover:text-green-300 hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Step 3</Badge>
                <span className="text-sm">Link your project</span>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                <code>supabase link --project-ref YOUR_PROJECT_ID</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('supabase link --project-ref YOUR_PROJECT_ID')}
                  className="text-green-400 hover:text-green-300 hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 ml-1">
                Replace YOUR_PROJECT_ID with your actual project ID from Supabase Dashboard
              </p>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Step 4</Badge>
                <span className="text-sm">Deploy the Edge Function</span>
              </div>
              <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm flex items-center justify-between">
                <code>supabase functions deploy server</code>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard('supabase functions deploy server')}
                  className="text-green-400 hover:text-green-300 hover:bg-gray-800"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card>
          <CardHeader>
            <CardTitle>Need More Help?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-between"
                onClick={() => window.open('/START_HERE.md', '_blank')}
              >
                <span>Quick Start Guide</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="justify-between"
                onClick={() => window.open('/DEPLOY_NOW.md', '_blank')}
              >
                <span>Deployment Guide</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="justify-between"
                onClick={() => window.open('/VISUAL_DEPLOY_GUIDE.md', '_blank')}
              >
                <span>Visual Guide</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                className="justify-between"
                onClick={() => window.open('/#/health-check', '_blank')}
              >
                <span>Health Check</span>
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Get */}
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-900">What You'll Get After Deployment</CardTitle>
            <CardDescription>Features included in this platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Multi-tenant SaaS architecture</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>10 beautiful certificate templates</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Custom template builder</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Real-time certificate previews</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Unique encrypted certificate URLs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Analytics dashboard</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Testimonial collection</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Platform admin panel</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Billing integration (Paystack)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                <span>Organization branding</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
