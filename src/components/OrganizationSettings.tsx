import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Save,
  Palette,
  Building2,
  User,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import SettingsSkeleton from "./skeletons/SettingsSkeleton";
import { Skeleton } from "./ui/skeleton";
import type { Organization, Signatory, OrganizationSettings, Logo } from "../App";
import { organizationApi } from "../utils/api";
import SignatoryManagement from "./SignatoryManagement";
import LogoManagement from "./LogoManagement";

// For compatibility, keep the existing interface name
interface OrganizationSettingsData extends OrganizationSettings {}

interface OrganizationSettingsProps {
  organization: Organization;
  accessToken: string;
  onSettingsUpdated: (
    organizationId: string,
    updates: Partial<Organization>
  ) => void;
}

export default function OrganizationSettings({
  organization,
  accessToken,
  onSettingsUpdated,
}: OrganizationSettingsProps) {
  const [settings, setSettings] = useState<OrganizationSettingsData>({
    logo: organization.logo || "",
    secondaryLogo: "",
    primaryColor: organization.primaryColor || "#ea580c",
    signatories: [],
    logos: [], // New: Logos array
  });

  const [organizationName, setOrganizationName] = useState(
    organization.name || ""
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState<string | null>(
    null
  );
  const [uploadingLogo, setUploadingLogo] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load settings from backend
  useEffect(() => {
    loadSettings();
  }, [organization.id]);

  // Update local organization name when organization prop changes
  useEffect(() => {
    setOrganizationName(organization.name || "");
  }, [organization.name]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await organizationApi.getSettings(
        accessToken,
        organization.id
      );
      
      // Migrate old logo/secondaryLogo to new logos array if needed
      let logos: Logo[] = data.settings.logos || [];
      if (logos.length === 0) {
        // Migration: Convert old logo/secondaryLogo to new logos array
        if (data.settings.logo) {
          logos.push({
            id: `logo-primary-${Date.now()}`,
            url: data.settings.logo,
            name: "Primary Logo",
          });
        }
        if (data.settings.secondaryLogo) {
          logos.push({
            id: `logo-secondary-${Date.now()}`,
            url: data.settings.secondaryLogo,
            name: "Secondary Logo",
          });
        }
      }

      setSettings({
        ...data.settings,
        signatories: data.settings.signatories || [],
        logos: logos,
      });
      setOrganizationName(organization.name || "");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load organization settings");
    } finally {
      setIsLoading(false);
    }
  };

  // Logo Management Functions
  const addLogo = () => {
    const newLogo: Logo = {
      id: `logo-${Date.now()}`,
      url: "",
      name: "",
    };

    setSettings((prev) => ({
      ...prev,
      logos: [...(prev.logos || []), newLogo],
    }));

    setHasUnsavedChanges(true);
  };

  const removeLogo = (logoId: string) => {
    setSettings((prev) => ({
      ...prev,
      logos: (prev.logos || []).filter((logo) => logo.id !== logoId),
    }));

    setHasUnsavedChanges(true);
  };

  const updateLogo = (
    logoId: string,
    field: keyof Logo,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      logos: (prev.logos || []).map((logo) =>
        logo.id === logoId ? { ...logo, [field]: value } : logo
      ),
    }));

    setHasUnsavedChanges(true);
  };

  const handleLogoUpload = async (logoId: string, file: File) => {
    try {
      setUploadingLogo(logoId);

      const data = await organizationApi.uploadFile(
        accessToken,
        file,
        "logo",
        organization.id
      );

      setSettings((prev) => ({
        ...prev,
        logos: (prev.logos || []).map((logo) =>
          logo.id === logoId ? { ...logo, url: data.url } : logo
        ),
      }));

      setHasUnsavedChanges(true);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(null);
    }
  };

  // Signatory Management Functions
  const handleSignatureUpload = async (signatoryId: string, file: File) => {
    try {
      setUploadingSignature(signatoryId);

      const data = await organizationApi.uploadFile(
        accessToken,
        file,
        "signature",
        organization.id
      );

      setSettings((prev) => ({
        ...prev,
        signatories: prev.signatories.map((s) =>
          s.id === signatoryId ? { ...s, signatureUrl: data.url } : s
        ),
      }));

      setHasUnsavedChanges(true);
      toast.success("Signature uploaded successfully");
    } catch (error) {
      console.error("Error uploading signature:", error);
      toast.error("Failed to upload signature");
    } finally {
      setUploadingSignature(null);
    }
  };

  const addSignatory = () => {
    const newSignatory: Signatory = {
      id: `sig-${Date.now()}`,
      name: "",
      title: "",
      signatureUrl: "",
    };

    setSettings((prev) => ({
      ...prev,
      signatories: [...prev.signatories, newSignatory],
    }));

    setHasUnsavedChanges(true);
  };

  const removeSignatory = (signatoryId: string) => {
    setSettings((prev) => ({
      ...prev,
      signatories: prev.signatories.filter((s) => s.id !== signatoryId),
    }));

    setHasUnsavedChanges(true);
  };

  const updateSignatory = (
    signatoryId: string,
    field: keyof Signatory,
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      signatories: prev.signatories.map((s) =>
        s.id === signatoryId ? { ...s, [field]: value } : s
      ),
    }));

    setHasUnsavedChanges(true);
  };

  const handleColorChange = (color: string) => {
    setSettings((prev) => ({ ...prev, primaryColor: color }));
    setHasUnsavedChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);

      // Ensure we have the logos array in settings
      const settingsToSave = {
        ...settings,
        logos: settings.logos || [],
        // Keep legacy logo field for backward compatibility (use first logo)
        logo: settings.logos && settings.logos.length > 0 ? settings.logos[0].url : settings.logo,
      };

      const data = await organizationApi.updateSettings(
        accessToken,
        organization.id,
        settingsToSave
      );

      // Update parent component with all changes including organization name
      onSettingsUpdated(organization.id, {
        name: organizationName,
        logo: settingsToSave.logo,
        primaryColor: settings.primaryColor,
        settings: data.settings,
      });

      setHasUnsavedChanges(false);
      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const predefinedColors = [
    { name: "Orange", value: "#ea580c" },
    { name: "Blue", value: "#3b82f6" },
    { name: "Teal", value: "#14b8a6" },
    { name: "Emerald", value: "#10b981" },
    { name: "Black", value: "#171717" },
    { name: "Amber", value: "#f59e0b" },
    { name: "Red", value: "#ef4444" },
    { name: "Pink", value: "#ec4899" },
  ];

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {hasUnsavedChanges && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Organization Name */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Information
          </CardTitle>
          <CardDescription>
            Basic information about your organization that will appear on
            certificates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="org-name">Organization Name</Label>
            <Input
              id="org-name"
              type="text"
              value={organizationName}
              onChange={(e) => {
                setOrganizationName(e.target.value);
                setHasUnsavedChanges(true);
              }}
              placeholder="Enter your organization name"
              className="max-w-md"
            />
            <p className="text-xs text-gray-500">
              This will be displayed on all certificates issued by your
              organization
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Logo Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Logos
          </CardTitle>
          <CardDescription>
            Upload up to 2 logos to display on your certificates (e.g., your organization logo and a partner logo).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogoManagement
            logos={settings.logos || []}
            onAdd={addLogo}
            onRemove={removeLogo}
            onUpdate={updateLogo}
            onUploadLogo={handleLogoUpload}
            uploadingLogo={uploadingLogo}
            maxLogos={2}
          />
        </CardContent>
      </Card>

      {/* Brand Color Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Brand Color
          </CardTitle>
          <CardDescription>
            Choose a primary color for your certificates. This will be used for
            borders, accents, and text highlights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleColorChange(color.value)}
                  className={`
                    relative h-16 rounded-lg border-2 transition-all hover:scale-105
                    ${
                      settings.primaryColor === color.value
                        ? "border-gray-900 ring-2 ring-gray-400"
                        : "border-gray-200"
                    }
                  `}
                  style={{ backgroundColor: color.value }}
                >
                  {settings.primaryColor === color.value && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white drop-shadow-lg" />
                    </div>
                  )}
                  <span className="absolute bottom-1 left-0 right-0 text-center text-xs text-white font-medium drop-shadow">
                    {color.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-color">Custom Color</Label>
            <div className="flex gap-2">
              <Input
                id="custom-color"
                type="color"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="w-20 h-10 cursor-pointer"
              />
              <Input
                type="text"
                value={settings.primaryColor}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#ea580c"
                className="flex-1"
              />
            </div>
            <p className="text-xs text-gray-500">
              Or enter a custom hex color code
            </p>
          </div>

          {/* Color Preview */}
          <div
            className="p-4 rounded-lg border-2"
            style={{ borderColor: settings.primaryColor }}
          >
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full"
                style={{ backgroundColor: settings.primaryColor }}
              />
              <div>
                <p
                  className="text-sm font-medium"
                  style={{ color: settings.primaryColor }}
                >
                  Certificate Preview
                </p>
                <p className="text-xs text-gray-500">
                  This is how your brand color will appear
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Signatories Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Certificate Signatories
          </CardTitle>
          <CardDescription>
            Add authorized signatories who will appear on certificates. You can
            upload their signature images.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignatoryManagement
            signatories={settings.signatories}
            onAdd={addSignatory}
            onRemove={removeSignatory}
            onUpdate={updateSignatory}
            onUploadSignature={handleSignatureUpload}
            uploadingSignature={uploadingSignature}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3 sticky bottom-0 bg-gradient-to-t from-white via-white to-transparent pt-6 pb-4">
        {hasUnsavedChanges && (
          <Button variant="outline" onClick={loadSettings}>
            Discard Changes
          </Button>
        )}
        <Button
          onClick={handleSaveSettings}
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <>
              <Skeleton className="h-4 w-4 mr-2 rounded-full inline-block" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </>
          )}
        </Button>
      </div>
    </div>
  );
}