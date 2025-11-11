import React, { useState, useRef } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Slider } from './ui/slider';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { 
  Palette, 
  Type, 
  Sparkles, 
  Save, 
  Eye,
  Crown,
  Award,
  Shield,
  Star,
  Hexagon,
  Download,
  Upload,
  RotateCcw,
  Check,
  Settings,
  X,
  Plus,
  Image as ImageIcon,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import type { Organization, Program } from '../App';

interface CustomTemplateConfig {
  id: string;
  name: string;
  description: string;
  
  // Layout
  layout: {
    margins: number;
    padding: number;
    borderWidth: number;
    borderStyle: 'solid' | 'double' | 'dashed' | 'dotted';
    borderRadius: number;
  };
  
  // Colors
  colors: {
    background: string;
    backgroundType: 'solid' | 'gradient';
    gradientFrom?: string;
    gradientTo?: string;
    gradientDirection?: string;
    accentColor: string;
    textColor: string;
    borderColor: string;
  };
  
  // Typography
  typography: {
    headingFont: string;
    bodyFont: string;
    headingSize: string;
    bodySize: string;
    headingWeight: string;
    bodyWeight: string;
  };
  
  // Content - Editable text
  content: {
    title: string;
    subtitle: string;
    recipientLabel: string;
    completionText: string;
  };
  
  // Elements - Toggle features
  elements: {
    showLogo: boolean;
    showCorners: boolean;
    showSeal: boolean;
    showWatermark: boolean;
    cornerStyle: string;
    sealIcon: 'award' | 'shield' | 'star' | 'crown' | 'hexagon';
    sealPosition: 'bottom-right' | 'bottom-left' | 'top-right' | 'center';
    watermarkOpacity: number;
    signatureCount: 1 | 2 | 3;
  };
}

interface TemplateBuilderProps {
  organization: Organization;
  onSave?: (template: CustomTemplateConfig) => void;
  onCancel?: () => void;
  existingTemplate?: CustomTemplateConfig;
  isPremiumUser?: boolean;
}

const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  organization,
  onSave,
  onCancel,
  existingTemplate,
  isPremiumUser = false
}) => {
  // Default configuration
  const defaultConfig: CustomTemplateConfig = {
    id: existingTemplate?.id || `custom-${Date.now()}`,
    name: existingTemplate?.name || 'My Custom Template',
    description: existingTemplate?.description || 'A custom certificate template',
    layout: {
      margins: 40,
      padding: 60,
      borderWidth: 4,
      borderStyle: 'solid',
      borderRadius: 12,
      ...existingTemplate?.layout,
    },
    colors: {
      background: '#ffffff',
      backgroundType: 'gradient',
      gradientFrom: '#dbeafe',
      gradientTo: '#bfdbfe',
      gradientDirection: 'to-br',
      accentColor: '#ea580c',
      textColor: '#1f2937',
      borderColor: '#d1d5db',
      ...existingTemplate?.colors,
    },
    typography: {
      headingFont: 'serif',
      bodyFont: 'sans-serif',
      headingSize: '3xl',
      bodySize: 'base',
      headingWeight: '700',
      bodyWeight: '400',
      ...existingTemplate?.typography,
    },
    content: {
      title: 'CERTIFICATE OF COMPLETION',
      subtitle: 'This is to certify that',
      recipientLabel: 'has successfully completed',
      completionText: 'Sample Program',
      ...existingTemplate?.content,
    },
    elements: {
      showLogo: true,
      showCorners: true,
      showSeal: true,
      showWatermark: false,
      cornerStyle: 'rounded',
      sealIcon: 'award',
      sealPosition: 'bottom-right',
      watermarkOpacity: 5,
      signatureCount: 2,
      ...existingTemplate?.elements,
    },
  };

  const [config, setConfig] = useState<CustomTemplateConfig>(defaultConfig);
  const [saved, setSaved] = useState(false);
  const [editingText, setEditingText] = useState<string | null>(null);

  // Sample program for preview
  const sampleProgram: Program = {
    id: 'sample-1',
    name: config.content.completionText,
    template: 'modern',
    certificates: 0,
    testimonials: 0,
    description: 'This is a preview of your custom template',
  };

  // Update config helper
  const updateConfig = (section: keyof CustomTemplateConfig, updates: any) => {
    setConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        ...updates
      }
    }));
    setSaved(false);
  };

  // Handle save
  const handleSave = () => {
    if (onSave) {
      onSave(config);
    }
    setSaved(true);
    toast.success('Template saved successfully!');
  };

  // Handle export
  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${config.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    link.click();
    toast.success('Template exported!');
  };

  // Handle import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setConfig(imported);
        toast.success('Template imported!');
      } catch (error) {
        toast.error('Failed to import template');
      }
    };
    reader.readAsText(file);
  };

  // Preset color schemes
  const colorPresets = [
    { name: 'Ocean', from: '#dbeafe', to: '#bfdbfe', accent: '#3b82f6' },
    { name: 'Sunset', from: '#fed7aa', to: '#fdba74', accent: '#ea580c' },
    { name: 'Forest', from: '#d1fae5', to: '#a7f3d0', accent: '#059669' },
    { name: 'Royal', from: '#e9d5ff', to: '#d8b4fe', accent: '#9333ea' },
    { name: 'Rose', from: '#fce7f3', to: '#fbcfe8', accent: '#ec4899' },
    { name: 'Minimal', from: '#f9fafb', to: '#f3f4f6', accent: '#1f2937' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
              <div>
                <h1>Template Builder</h1>
                <p className="text-sm text-gray-600">
                  Click on any element in the preview to edit it
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {saved && (
                <Badge variant="secondary" className="text-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Saved
                </Badge>
              )}
              <Button variant="outline" size="sm" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <label>
                <Button variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="w-4 h-4 mr-2" />
                    Import
                  </span>
                </Button>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImport}
                />
              </label>
              <Button variant="outline" size="sm" onClick={() => setConfig(defaultConfig)}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              {onCancel && (
                <Button variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                Save Template
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Side by Side */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid lg:grid-cols-[400px,1fr] gap-6">
          
          {/* Quick Settings Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Template Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Template Name</Label>
                  <Input
                    value={config.name}
                    onChange={(e) => setConfig(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="My Custom Template"
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={config.description}
                    onChange={(e) => setConfig(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Template description"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color Presets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {colorPresets.map(preset => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => updateConfig('colors', {
                        backgroundType: 'gradient',
                        gradientFrom: preset.from,
                        gradientTo: preset.to,
                        accentColor: preset.accent,
                      })}
                      className="h-auto py-3 flex flex-col items-center gap-1"
                    >
                      <div className="flex gap-1 mb-1">
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ background: preset.from }}
                        />
                        <div 
                          className="w-4 h-4 rounded-full border"
                          style={{ background: preset.to }}
                        />
                      </div>
                      <span className="text-xs">{preset.name}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Elements</CardTitle>
                <CardDescription>Toggle certificate elements</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Organization Logo</Label>
                  <Switch
                    checked={config.elements.showLogo}
                    onCheckedChange={(checked) => updateConfig('elements', { showLogo: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Decorative Corners</Label>
                  <Switch
                    checked={config.elements.showCorners}
                    onCheckedChange={(checked) => updateConfig('elements', { showCorners: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Certificate Seal</Label>
                  <Switch
                    checked={config.elements.showSeal}
                    onCheckedChange={(checked) => updateConfig('elements', { showSeal: checked })}
                  />
                </div>
                {config.elements.showSeal && (
                  <div>
                    <Label className="text-xs text-gray-500">Seal Icon</Label>
                    <div className="grid grid-cols-5 gap-1 mt-2">
                      {(['award', 'shield', 'star', 'crown', 'hexagon'] as const).map(icon => (
                        <Button
                          key={icon}
                          variant={config.elements.sealIcon === icon ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => updateConfig('elements', { sealIcon: icon })}
                          className="p-2 h-auto"
                        >
                          {icon === 'award' && <Award className="w-4 h-4" />}
                          {icon === 'shield' && <Shield className="w-4 h-4" />}
                          {icon === 'star' && <Star className="w-4 h-4" />}
                          {icon === 'crown' && <Crown className="w-4 h-4" />}
                          {icon === 'hexagon' && <Hexagon className="w-4 h-4" />}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <Separator />
                <div>
                  <Label className="text-sm">Number of Signatures</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {[1, 2, 3].map(num => (
                      <Button
                        key={num}
                        variant={config.elements.signatureCount === num ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('elements', { signatureCount: num })}
                      >
                        {num}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Layout</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm">Border Width: {config.layout.borderWidth}px</Label>
                  <Slider
                    value={[config.layout.borderWidth]}
                    onValueChange={([value]) => updateConfig('layout', { borderWidth: value })}
                    min={0}
                    max={20}
                    step={1}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm">Border Radius: {config.layout.borderRadius}px</Label>
                  <Slider
                    value={[config.layout.borderRadius]}
                    onValueChange={([value]) => updateConfig('layout', { borderRadius: value })}
                    min={0}
                    max={50}
                    step={2}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Interactive Live Preview */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>
                  Click on any text or element to edit it directly
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-6 rounded-lg">
                  {/* Certificate Preview */}
                  <div 
                    className="bg-white rounded-lg shadow-xl overflow-hidden relative"
                    style={{
                      margin: `${config.layout.margins}px`,
                      padding: `${config.layout.padding}px`,
                      borderWidth: `${config.layout.borderWidth}px`,
                      borderStyle: config.layout.borderStyle,
                      borderColor: config.colors.borderColor,
                      borderRadius: `${config.layout.borderRadius}px`,
                      background: config.colors.backgroundType === 'gradient'
                        ? `linear-gradient(${config.colors.gradientDirection}, ${config.colors.gradientFrom}, ${config.colors.gradientTo})`
                        : config.colors.background,
                    }}
                  >
                    {/* Decorative Corners */}
                    {config.elements.showCorners && (
                      <>
                        <div 
                          className="absolute top-4 left-4 w-12 h-12 opacity-20"
                        >
                          <div 
                            className={`w-full h-full border-t-4 border-l-4 ${
                              config.elements.cornerStyle === 'rounded' ? 'rounded-tl-2xl' : ''
                            }`}
                            style={{ borderColor: config.colors.accentColor }}
                          />
                        </div>
                        <div 
                          className="absolute top-4 right-4 w-12 h-12 opacity-20"
                        >
                          <div 
                            className={`w-full h-full border-t-4 border-r-4 ${
                              config.elements.cornerStyle === 'rounded' ? 'rounded-tr-2xl' : ''
                            }`}
                            style={{ borderColor: config.colors.accentColor }}
                          />
                        </div>
                      </>
                    )}

                    <div className="relative min-h-[400px] flex flex-col items-center justify-center text-center p-8">
                      {/* Organization Header with Logo Toggle */}
                      <div className="mb-6">
                        {config.elements.showLogo && organization.logo ? (
                          <div className="relative group">
                            <img 
                              src={organization.logo} 
                              alt={organization.name}
                              className="h-12 w-auto mx-auto mb-3"
                            />
                            <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0 rounded-full"
                                onClick={() => updateConfig('elements', { showLogo: false })}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ) : (
                          config.elements.showLogo && (
                            <div 
                              onClick={() => toast.info('Upload a logo in Organization Settings')}
                              className="h-12 w-32 mx-auto mb-3 border-2 border-dashed border-gray-300 rounded flex items-center justify-center cursor-pointer hover:border-orange-400 transition-colors"
                            >
                              <ImageIcon className="w-6 h-6 text-gray-400" />
                            </div>
                          )
                        )}
                        
                        {/* Organization Name - Editable */}
                        <Popover>
                          <PopoverTrigger asChild>
                            <h2 
                              className="cursor-pointer hover:opacity-75 transition-opacity group relative"
                              style={{ 
                                fontFamily: config.typography.headingFont,
                                fontSize: `var(--text-${config.typography.headingSize})`,
                                fontWeight: config.typography.headingWeight,
                                color: config.colors.textColor
                              }}
                            >
                              {organization.name}
                              <Edit2 className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                            </h2>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <h4>Typography Settings</h4>
                              <div>
                                <Label className="text-xs">Font Family</Label>
                                <Select
                                  value={config.typography.headingFont}
                                  onValueChange={(value) => updateConfig('typography', { headingFont: value })}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="serif">Serif</SelectItem>
                                    <SelectItem value="sans-serif">Sans Serif</SelectItem>
                                    <SelectItem value="monospace">Monospace</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Certificate Content */}
                      <div className="space-y-4">
                        {/* Title - Editable */}
                        <Popover open={editingText === 'title'} onOpenChange={(open) => setEditingText(open ? 'title' : null)}>
                          <PopoverTrigger asChild>
                            <h1 
                              className="cursor-pointer hover:bg-gray-100/50 px-4 py-2 rounded transition-all group relative"
                              style={{ 
                                fontFamily: config.typography.headingFont,
                                fontSize: `var(--text-${config.typography.headingSize})`,
                                fontWeight: config.typography.headingWeight,
                                color: config.colors.accentColor
                              }}
                            >
                              {config.content.title}
                              <Edit2 className="w-4 h-4 inline ml-2 opacity-0 group-hover:opacity-50" />
                            </h1>
                          </PopoverTrigger>
                          <PopoverContent className="w-96">
                            <div className="space-y-3">
                              <h4>Edit Title</h4>
                              <Input
                                value={config.content.title}
                                onChange={(e) => updateConfig('content', { title: e.target.value })}
                                placeholder="CERTIFICATE OF COMPLETION"
                              />
                              <div>
                                <Label className="text-xs">Font Size</Label>
                                <Select
                                  value={config.typography.headingSize}
                                  onValueChange={(value) => updateConfig('typography', { headingSize: value })}
                                >
                                  <SelectTrigger className="h-8 text-sm">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="xl">XL</SelectItem>
                                    <SelectItem value="2xl">2XL</SelectItem>
                                    <SelectItem value="3xl">3XL</SelectItem>
                                    <SelectItem value="4xl">4XL</SelectItem>
                                    <SelectItem value="5xl">5XL</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label className="text-xs">Accent Color</Label>
                                <Input
                                  type="color"
                                  value={config.colors.accentColor}
                                  onChange={(e) => updateConfig('colors', { accentColor: e.target.value })}
                                  className="h-10"
                                />
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Subtitle - Editable */}
                        <Popover open={editingText === 'subtitle'} onOpenChange={(open) => setEditingText(open ? 'subtitle' : null)}>
                          <PopoverTrigger asChild>
                            <p 
                              className="cursor-pointer hover:bg-gray-100/50 px-4 py-1 rounded transition-all group"
                              style={{ 
                                fontFamily: config.typography.bodyFont,
                                fontSize: `var(--text-${config.typography.bodySize})`,
                                fontWeight: config.typography.bodyWeight,
                                color: config.colors.textColor
                              }}
                            >
                              {config.content.subtitle}
                              <Edit2 className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                            </p>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <h4>Edit Subtitle</h4>
                              <Input
                                value={config.content.subtitle}
                                onChange={(e) => updateConfig('content', { subtitle: e.target.value })}
                                placeholder="This is to certify that"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Recipient Name */}
                        <h2 
                          className="text-gray-400 italic"
                          style={{ 
                            fontFamily: config.typography.headingFont,
                            fontSize: `var(--text-${config.typography.headingSize})`,
                            fontWeight: config.typography.headingWeight,
                          }}
                        >
                          [Recipient Name]
                        </h2>
                        
                        {/* Completion Label - Editable */}
                        <Popover open={editingText === 'completion'} onOpenChange={(open) => setEditingText(open ? 'completion' : null)}>
                          <PopoverTrigger asChild>
                            <p 
                              className="cursor-pointer hover:bg-gray-100/50 px-4 py-1 rounded transition-all group"
                              style={{ 
                                fontFamily: config.typography.bodyFont,
                                fontSize: `var(--text-${config.typography.bodySize})`,
                                fontWeight: config.typography.bodyWeight,
                                color: config.colors.textColor
                              }}
                            >
                              {config.content.recipientLabel}
                              <Edit2 className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                            </p>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <h4>Edit Completion Label</h4>
                              <Input
                                value={config.content.recipientLabel}
                                onChange={(e) => updateConfig('content', { recipientLabel: e.target.value })}
                                placeholder="has successfully completed"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                        
                        {/* Program Name - Editable */}
                        <Popover open={editingText === 'program'} onOpenChange={(open) => setEditingText(open ? 'program' : null)}>
                          <PopoverTrigger asChild>
                            <h3 
                              className="cursor-pointer hover:bg-gray-100/50 px-4 py-1 rounded transition-all group"
                              style={{ 
                                fontFamily: config.typography.headingFont,
                                fontWeight: config.typography.headingWeight,
                                color: config.colors.accentColor
                              }}
                            >
                              {config.content.completionText}
                              <Edit2 className="w-3 h-3 inline ml-2 opacity-0 group-hover:opacity-50" />
                            </h3>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <h4>Edit Program/Course Name</h4>
                              <Input
                                value={config.content.completionText}
                                onChange={(e) => updateConfig('content', { completionText: e.target.value })}
                                placeholder="Professional Development Program"
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>

                      {/* Signatures */}
                      <div className={`mt-12 grid gap-8 ${
                        config.elements.signatureCount === 1 ? 'grid-cols-1' :
                        config.elements.signatureCount === 2 ? 'grid-cols-2' :
                        'grid-cols-3'
                      }`}>
                        {Array.from({ length: config.elements.signatureCount }).map((_, i) => (
                          <div key={i} className="text-center">
                            <div className="border-t-2 border-gray-800 w-full mb-2"></div>
                            <p className="text-xs" style={{ color: config.colors.textColor }}>
                              Signature {i + 1}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Seal - Repositionable */}
                      {config.elements.showSeal && (
                        <Popover>
                          <PopoverTrigger asChild>
                            <div 
                              className={`absolute cursor-move hover:ring-2 hover:ring-orange-400 rounded-full transition-all ${
                                config.elements.sealPosition === 'bottom-right' ? 'bottom-4 right-4' :
                                config.elements.sealPosition === 'bottom-left' ? 'bottom-4 left-4' :
                                config.elements.sealPosition === 'top-right' ? 'top-4 right-4' :
                                'bottom-4 right-1/2 translate-x-1/2'
                              }`}
                            >
                              <div 
                                className="w-16 h-16 rounded-full flex items-center justify-center border-4"
                                style={{ 
                                  backgroundColor: `${config.colors.accentColor}15`,
                                  borderColor: config.colors.accentColor 
                                }}
                              >
                                {config.elements.sealIcon === 'award' && <Award className="w-8 h-8" style={{ color: config.colors.accentColor }} />}
                                {config.elements.sealIcon === 'shield' && <Shield className="w-8 h-8" style={{ color: config.colors.accentColor }} />}
                                {config.elements.sealIcon === 'star' && <Star className="w-8 h-8" style={{ color: config.colors.accentColor }} />}
                                {config.elements.sealIcon === 'crown' && <Crown className="w-8 h-8" style={{ color: config.colors.accentColor }} />}
                                {config.elements.sealIcon === 'hexagon' && <Hexagon className="w-8 h-8" style={{ color: config.colors.accentColor }} />}
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-64">
                            <div className="space-y-3">
                              <h4>Seal Position</h4>
                              <div className="grid grid-cols-2 gap-2">
                                <Button
                                  variant={config.elements.sealPosition === 'bottom-right' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateConfig('elements', { sealPosition: 'bottom-right' })}
                                >
                                  Bottom Right
                                </Button>
                                <Button
                                  variant={config.elements.sealPosition === 'bottom-left' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateConfig('elements', { sealPosition: 'bottom-left' })}
                                >
                                  Bottom Left
                                </Button>
                                <Button
                                  variant={config.elements.sealPosition === 'top-right' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateConfig('elements', { sealPosition: 'top-right' })}
                                >
                                  Top Right
                                </Button>
                                <Button
                                  variant={config.elements.sealPosition === 'center' ? 'default' : 'outline'}
                                  size="sm"
                                  onClick={() => updateConfig('elements', { sealPosition: 'center' })}
                                >
                                  Center
                                </Button>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="w-full"
                                onClick={() => updateConfig('elements', { showSeal: false })}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Remove Seal
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>💡 Interactive Editor:</strong> Click on any text to edit it. Click on the seal to move it. 
                    Use the toggles on the left to show/hide elements like logo, corners, and signatures.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TemplateBuilder;
