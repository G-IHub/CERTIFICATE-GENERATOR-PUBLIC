import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Plus, Trash2, Upload, User } from "lucide-react";
import type { Signatory } from "../App";

interface SignatoryManagementProps {
  signatories: Signatory[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Signatory, value: string) => void;
  onUploadSignature?: (id: string, file: File) => Promise<void>;
  uploadingSignature?: string | null;
}

export default function SignatoryManagement({
  signatories,
  onAdd,
  onRemove,
  onUpdate,
  onUploadSignature,
  uploadingSignature,
}: SignatoryManagementProps) {
  const handleFileUpload = async (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadSignature) return;

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

    await onUploadSignature(id, file);
  };

  return (
    <div className="space-y-4">
      {signatories.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <User className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-600 mb-4">No signatories added yet</p>
          <Button onClick={onAdd} variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Signatory
          </Button>
        </div>
      ) : (
        <>
          {signatories.map((signatory, index) => (
            <div key={signatory.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">
                  {signatory.name.trim() || `Signatory ${index + 1}`}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(signatory.id)}
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
                      onUpdate(signatory.id, "name", e.target.value)
                    }
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Title / Position</Label>
                  <Input
                    value={signatory.title}
                    onChange={(e) =>
                      onUpdate(signatory.id, "title", e.target.value)
                    }
                    placeholder="Program Director"
                  />
                </div>
              </div>

              {onUploadSignature && (
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
                            <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mr-2" />
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
                            onUpdate(signatory.id, "signatureUrl", "")
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
                      onChange={(e) => handleFileUpload(signatory.id, e)}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}

          <Button onClick={onAdd} variant="outline" className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Signatory
          </Button>
        </>
      )}
    </div>
  );
}