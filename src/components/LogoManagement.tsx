import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Trash2, Upload, Image as ImageIcon } from "lucide-react";

export interface Logo {
  id: string;
  url: string;
  name: string; // Display name for the logo (e.g., "Primary Logo", "Partner Logo")
}

interface LogoManagementProps {
  logos: Logo[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Logo, value: string) => void;
  onUploadLogo?: (id: string, file: File) => Promise<void>;
  uploadingLogo?: string | null;
  maxLogos?: number;
}

export default function LogoManagement({
  logos,
  onAdd,
  onRemove,
  onUpdate,
  onUploadLogo,
  uploadingLogo,
  maxLogos = 2,
}: LogoManagementProps) {
  const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadLogo) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    await onUploadLogo(id, file);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Organization Logos</h3>
          <p className="text-sm text-gray-600">
            Add up to {maxLogos} logos to display on your certificates
          </p>
        </div>
        {logos.length < maxLogos && (
          <Button onClick={onAdd} variant="outline" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Logo
          </Button>
        )}
      </div>

      {logos.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg bg-gray-50">
          <ImageIcon className="w-16 h-16 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 mb-4">No logos added yet</p>
          <p className="text-sm text-gray-500 mb-6">
            Add your organization and partner logos to display on certificates
          </p>
          <Button onClick={onAdd} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add First Logo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {logos.map((logo, index) => (
            <div key={logo.id} className="p-4 border rounded-lg space-y-4 bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">
                  {logo.name.trim() || `Logo ${index + 1}`}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(logo.id)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Logo Name</Label>
                <Input
                  value={logo.name}
                  onChange={(e) => onUpdate(logo.id, "name", e.target.value)}
                  placeholder={`e.g., ${index === 0 ? "Organization Logo" : "Partner Logo"}`}
                  className="text-sm"
                />
              </div>

              {onUploadLogo && (
                <div className="space-y-2">
                  <Label className="text-xs">Logo Image</Label>
                  <div className="flex flex-col gap-3">
                    {logo.url && (
                      <div className="w-full h-32 bg-gray-50 rounded border flex items-center justify-center overflow-hidden p-3">
                        <img
                          src={logo.url}
                          alt={logo.name || "Logo"}
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(logo.id, e)}
                          className="hidden"
                          disabled={uploadingLogo === logo.id}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full"
                          disabled={uploadingLogo === logo.id}
                          onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                          }}
                        >
                          {uploadingLogo === logo.id ? (
                            <>
                              <div className="w-4 h-4 border-2 border-gray-300 border-t-primary rounded-full animate-spin mr-2" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="w-4 h-4 mr-2" />
                              {logo.url ? "Change Logo" : "Upload Logo"}
                            </>
                          )}
                        </Button>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or SVG (max 5MB). Recommended: 512x512px
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {logos.length >= maxLogos && (
        <div className="text-center py-3 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">
            Maximum of {maxLogos} logos reached. Remove a logo to add another.
          </p>
        </div>
      )}
    </div>
  );
}