import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Sparkles, 
  ArrowLeft,
  Crown,
  Check,
  Palette,
  Type,
  Layout,
  Image as ImageIcon
} from 'lucide-react';
import TemplateBuilder from './TemplateBuilder';
import type { Organization } from '../App';

interface TemplateBuilderPageProps {
  organization: Organization;
  isPremiumUser?: boolean;
  onBack?: () => void;
}

interface CustomTemplateConfig {
  id: string;
  name: string;
  description: string;
  layout: any;
  colors: any;
  typography: any;
  elements: any;
}

const TemplateBuilderPage: React.FC<TemplateBuilderPageProps> = ({
  organization,
  isPremiumUser = false,
  onBack
}) => {
  const [showBuilder, setShowBuilder] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplateConfig[]>([]);

  const handleSaveTemplate = (template: CustomTemplateConfig) => {
    setCustomTemplates(prev => {
      const existing = prev.findIndex(t => t.id === template.id);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = template;
        return updated;
      }
      return [...prev, template];
    });
    setShowBuilder(false);
  };

  if (showBuilder) {
    return (
      <TemplateBuilder
        organization={organization}
        isPremiumUser={isPremiumUser}
        onSave={handleSaveTemplate}
        onCancel={() => setShowBuilder(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <div>
                <h1 className="text-2xl">Custom Templates</h1>
                <p className="text-gray-600">
                  Create and manage your custom certificate templates
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isPremiumUser ? (
                <Badge variant="secondary" className="text-orange-600">
                  <Crown className="w-4 h-4 mr-1" />
                  Pro Feature
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-green-600">
                  <Check className="w-4 h-4 mr-1" />
                  Pro Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Feature Overview */}
        {!isPremiumUser && (
          <Card className="mb-6 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <Crown className="w-5 h-5 text-orange-600" />
                Unlock Custom Templates with Pro
              </CardTitle>
              <CardDescription className="text-orange-700">
                Create unlimited custom templates with our visual builder
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg">
                  <Palette className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className="font-medium mb-1">Custom Colors</h3>
                  <p className="text-sm text-gray-600">
                    Match your exact brand colors
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Type className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className="font-medium mb-1">Typography</h3>
                  <p className="text-sm text-gray-600">
                    Choose fonts and sizes
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Layout className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className="font-medium mb-1">Layout Control</h3>
                  <p className="text-sm text-gray-600">
                    Adjust spacing and borders
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <Sparkles className="w-6 h-6 text-orange-600 mb-2" />
                  <h3 className="font-medium mb-1">Elements</h3>
                  <p className="text-sm text-gray-600">
                    Add seals and decorations
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <Button size="lg" className="bg-orange-600 hover:bg-orange-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade to Pro - $29/month
                </Button>
                <div className="text-sm text-orange-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    10 custom templates
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Visual template builder
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    Export & import templates
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Template Builder CTA */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Template Builder
                </CardTitle>
                <CardDescription>
                  Design custom certificate templates to match your brand
                </CardDescription>
              </div>
              <Button 
                onClick={() => setShowBuilder(true)}
                disabled={!isPremiumUser}
              >
                {isPremiumUser ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create New Template
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    Upgrade to Create
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          {isPremiumUser && (
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg hover:border-orange-600 transition-colors cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded mb-3 flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="font-medium mb-1">Start from Scratch</h3>
                  <p className="text-sm text-gray-600">
                    Build a completely custom template
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:border-orange-600 transition-colors cursor-pointer">
                  <div className="h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded mb-3 flex items-center justify-center">
                    <Palette className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="font-medium mb-1">Use a Preset</h3>
                  <p className="text-sm text-gray-600">
                    Start from a built-in template
                  </p>
                </div>

                <div className="p-4 border rounded-lg hover:border-orange-600 transition-colors cursor-pointer">
                  <label className="cursor-pointer">
                    <div className="h-32 bg-gradient-to-br from-green-50 to-emerald-50 rounded mb-3 flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-green-400" />
                    </div>
                    <h3 className="font-medium mb-1">Import Template</h3>
                    <p className="text-sm text-gray-600">
                      Upload a JSON template file
                    </p>
                  </label>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Saved Templates */}
        {isPremiumUser && customTemplates.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Custom Templates</CardTitle>
              <CardDescription>
                {customTemplates.length} of 10 templates created
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                {customTemplates.map((template) => (
                  <div key={template.id} className="border rounded-lg p-4">
                    <div className="h-32 bg-gray-100 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">Preview</span>
                    </div>
                    <h3 className="font-medium mb-1">{template.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {template.description}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => setShowBuilder(true)}
                      >
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1">
                        Use
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* How It Works */}
        {!customTemplates.length && (
          <Card>
            <CardHeader>
              <CardTitle>How Custom Templates Work</CardTitle>
              <CardDescription>
                Create professional certificates that match your brand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-orange-600">1</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Open the Template Builder</h3>
                    <p className="text-sm text-gray-600">
                      Start from scratch or use one of our preset templates as a starting point
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-orange-600">2</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Customize Your Template</h3>
                    <p className="text-sm text-gray-600">
                      Adjust colors, fonts, layout, borders, and decorative elements with live preview
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-orange-600">3</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Save and Use</h3>
                    <p className="text-sm text-gray-600">
                      Save your template and use it when generating certificates for any program
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <span className="font-medium text-orange-600">4</span>
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Export & Share</h3>
                    <p className="text-sm text-gray-600">
                      Export templates as JSON files to backup or share across organizations
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TemplateBuilderPage;
