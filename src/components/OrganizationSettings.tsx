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
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Upload,
  Trash2,
  Plus,
  Save,
  Palette,
  Building2,
  User,
  ImageIcon,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import SettingsSkeleton from "./skeletons/SettingsSkeleton";
import { Skeleton } from "./ui/skeleton";
import type { Organization, Signatory, OrganizationSettings } from "../App";
import { organizationApi } from "../utils/api";

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
    primaryColor: organization.primaryColor || "#ea580c",
    signatories: [],
  });

  const [organizationName, setOrganizationName] = useState(
    organization.name || ""
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSignature, setUploadingSignature] = useState<string | null>(
    null
  );
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
      setSettings(data.settings);
      setOrganizationName(organization.name || "");
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load organization settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    try {
      setUploadingLogo(true);

      const data = await organizationApi.uploadFile(
        accessToken,
        file,
        "logo",
        organization.id
      );
      setSettings((prev) => ({ ...prev, logo: data.url }));
      setHasUnsavedChanges(true);
      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSignatureUpload = async (
    signatoryId: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size must be less than 2MB");
      return;
    }

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

      const data = await organizationApi.updateSettings(
        accessToken,
        organization.id,
        settings
      );

      // Update parent component with all changes including organization name
      onSettingsUpdated(organization.id, {
        name: organizationName,
        logo: settings.logo,
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

      {/* Logo Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Organization Logo
          </CardTitle>
          <CardDescription>
            Upload your organization's logo. This will appear on all
            certificates.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
              {settings.logo ? (
                <img
                  src={settings.logo}
                  alt="Organization logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <ImageIcon className="w-12 h-12 text-gray-400" />
              )}
            </div>

            <div className="flex-1 space-y-2">
              <Label htmlFor="logo-upload">Upload Logo</Label>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  disabled={uploadingLogo}
                  onClick={() =>
                    document.getElementById("logo-upload")?.click()
                  }
                >
                  {uploadingLogo ? (
                    <>
                      <Skeleton className="h-4 w-4 mr-2 rounded-full inline-block" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </>
                  )}
                </Button>
                {settings.logo && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setSettings((prev) => ({ ...prev, logo: "" }));
                      setHasUnsavedChanges(true);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                )}
              </div>
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
              <p className="text-xs text-gray-500">
                Recommended: PNG or SVG, max 5MB
              </p>
            </div>
          </div>
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
        <CardContent className="space-y-4">
          {settings.signatories.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <User className="w-12 h-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600 mb-4">No signatories added yet</p>
              <Button onClick={addSignatory} variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Signatory
              </Button>
            </div>
          ) : (
            <>
              {settings.signatories.map((signatory, index) => (
                <div
                  key={signatory.id}
                  className="p-4 border rounded-lg space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">
                      {signatory.name.trim() || `Signatory ${index + 1}`}
                    </h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSignatory(signatory.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input
                        value={signatory.name}
                        onChange={(e) =>
                          updateSignatory(signatory.id, "name", e.target.value)
                        }
                        placeholder="Dr. Jane Smith"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Title / Position</Label>
                      <Input
                        value={signatory.title}
                        onChange={(e) =>
                          updateSignatory(signatory.id, "title", e.target.value)
                        }
                        placeholder="Program Director"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Signature Image (Optional)</Label>
                    <div className="flex items-center gap-4">
                      {signatory.signatureUrl && (
                        <div className="w-32 h-16 bg-gray-50 rounded border flex items-center justify-center overflow-hidden">
                          <img
                            src={signatory.signatureUrl}
                            alt="Signature"
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={uploadingSignature === signatory.id}
                          onClick={() =>
                            document
                              .getElementById(`signature-${signatory.id}`)
                              ?.click()
                          }
                        >
                          {uploadingSignature === signatory.id ? (
                            <>
                              <Skeleton className="h-4 w-4 mr-2 rounded-full inline-block" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {signatory.signatureUrl ? "Change" : "Upload"}
                            </>
                          )}
                        </Button>

                        {signatory.signatureUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              updateSignatory(signatory.id, "signatureUrl", "")
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <input
                        id={`signature-${signatory.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleSignatureUpload(signatory.id, e)}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG or JPG, transparent background recommended, max 2MB
                    </p>
                  </div>
                </div>
              ))}

              <Button
                onClick={addSignatory}
                variant="outline"
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Another Signatory
              </Button>
            </>
          )}
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