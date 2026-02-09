import { useState, useEffect } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner";
// Force cache refresh - certificateApi.update is available
import { certificateApi } from "../utils/api";
import { projectId, publicAnonKey } from "../utils/supabase/info";

// TEMPORARY WORKAROUND: Define update function inline to bypass cache issues
const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

const updateCertificate = async (
  token: string,
  certificateId: string,
  data: {
    organizationId: string;
    certificateHeader?: string;
    courseName?: string;
    courseDescription?: string;
    completionDate?: string;
    template?: string;
    signatories?: any[];
    restrictDownload?: boolean;
    allowedEmails?: string[];
  },
) => {
  console.log("📤 Sending certificate update request:", {
    certificateId,
    organizationId: data.organizationId,
    ...data,
  });

  const response = await fetch(
    `${API_BASE_URL}/certificates/${certificateId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    },
  );

  if (!response.ok) {
    let errorDetails;
    try {
      errorDetails = await response.json();
    } catch (e) {
      errorDetails = {
        error: `Server returned ${response.status}: ${response.statusText}`,
      };
    }
    throw new Error(errorDetails.error || "Failed to update certificate");
  }

  const result = await response.json();
  console.log("📥 Certificate update response:", result);
  return result;
};

interface EditCertificateModalProps {
  certificate: any;
  accessToken: string;
  onClose: () => void;
  onUpdate: (updatedCertificate: any) => void;
  availableSignatories: any[];
}

export function EditCertificateModal({
  certificate,
  accessToken,
  onClose,
  onUpdate,
  availableSignatories,
}: EditCertificateModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [programName, setProgramName] = useState("");
  const [programDescription, setProgramDescription] = useState("");
  const [certificateHeader, setCertificateHeader] = useState("");
  const [completionDate, setCompletionDate] = useState("");
  const [selectedSignatories, setSelectedSignatories] = useState<string[]>([]);
  const [restrictDownload, setRestrictDownload] = useState(false);
  const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
  const [emailInput, setEmailInput] = useState("");

  // Load certificate data into form
  useEffect(() => {
    if (certificate) {
      setProgramName(certificate.courseName || "");
      setProgramDescription(certificate.courseDescription || "");
      setCertificateHeader(
        certificate.certificateHeader || "Certificate of Completion",
      );
      setCompletionDate(
        certificate.completionDate?.split("T")[0] ||
          new Date().toISOString().split("T")[0],
      );
      setRestrictDownload(certificate.restrictDownload || false);
      setAllowedEmails(certificate.allowedEmails || []);

      // Load signatories
      if (certificate.signatories && certificate.signatories.length > 0) {
        const signatoryIds = certificate.signatories.map(
          (sig: any) => sig.id || sig,
        );
        setSelectedSignatories(signatoryIds);
      }
    }
  }, [certificate]);

  const handleAddEmail = () => {
    const email = emailInput.trim().toLowerCase();
    if (!email) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (allowedEmails.includes(email)) {
      toast.error("Email already in the list");
      return;
    }

    setAllowedEmails([...allowedEmails, email]);
    setEmailInput("");
    toast.success("Email added");
  };

  const handleRemoveEmail = (email: string) => {
    setAllowedEmails(allowedEmails.filter((e) => e !== email));
    toast.success("Email removed");
  };

  const handleSubmit = async () => {
    // Validation
    if (!programName.trim()) {
      toast.error("Program name is required");
      return;
    }

    if (restrictDownload && allowedEmails.length === 0) {
      toast.error(
        "Please add at least one allowed email or disable download restrictions",
      );
      return;
    }

    setIsLoading(true);

    try {
      // Prepare signatories data
      const signatories = selectedSignatories
        .filter((id) => id && id !== "none")
        .map((id) => availableSignatories.find((s: any) => s.id === id))
        .filter(Boolean);

      // Update certificate using inline function (bypasses cache issues)
      const response = await updateCertificate(accessToken, certificate.id, {
        organizationId: certificate.organizationId,
        certificateHeader: certificateHeader.trim(),
        courseName: programName.trim(),
        courseDescription: programDescription.trim(),
        completionDate,
        template: certificate.template,
        signatories: signatories.length > 0 ? signatories : undefined,
        restrictDownload,
        allowedEmails,
      });

      if (!response.certificates || response.certificates.length === 0) {
        throw new Error("No certificate data returned from server");
      }

      const updatedCert = {
        ...response.certificates[0],
        certificateUrl: certificate.certificateUrl, // Keep the original URL
        courseName: programName.trim(),
        certificateHeader: certificateHeader.trim(),
        courseDescription: programDescription.trim(),
        program: certificate.program,
        organization: certificate.organization,
      };

      toast.success("Certificate updated successfully!");
      onUpdate(updatedCert);
      onClose();
    } catch (error: any) {
      console.error("Failed to update certificate:", error);
      toast.error(error.message || "Failed to update certificate");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">Edit Certificate</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Update certificate details. The certificate link will remain the
                same.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Program Name */}
            <div>
              <Label htmlFor="programName">
                Program Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="programName"
                value={programName}
                onChange={(e) => setProgramName(e.target.value)}
                placeholder="e.g., Web Development Bootcamp"
                disabled={isLoading}
              />
            </div>

            {/* Certificate Header */}
            <div>
              <Label htmlFor="certificateHeader">Certificate Header</Label>
              <Input
                id="certificateHeader"
                value={certificateHeader}
                onChange={(e) => setCertificateHeader(e.target.value)}
                placeholder="e.g., Certificate of Completion"
                disabled={isLoading}
              />
            </div>

            {/* Program Description */}
            <div>
              <Label htmlFor="programDescription">Program Description</Label>
              <Textarea
                id="programDescription"
                value={programDescription}
                onChange={(e) => setProgramDescription(e.target.value)}
                placeholder="Brief description of the program"
                rows={3}
                disabled={isLoading}
              />
            </div>

            {/* Completion Date */}
            <div>
              <Label htmlFor="completionDate">Completion Date</Label>
              <Input
                id="completionDate"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Signatories */}
            <div>
              <Label>Signatories</Label>
              <div className="space-y-2 mt-2">
                {availableSignatories.map((signatory: any) => (
                  <label
                    key={signatory.id}
                    className="flex items-center gap-2 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSignatories.includes(signatory.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSignatories([
                            ...selectedSignatories,
                            signatory.id,
                          ]);
                        } else {
                          setSelectedSignatories(
                            selectedSignatories.filter(
                              (id) => id !== signatory.id,
                            ),
                          );
                        }
                      }}
                      disabled={isLoading}
                      className="w-4 h-4"
                    />
                    <div className="flex-1">
                      <p className="font-medium">{signatory.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {signatory.title}
                      </p>
                    </div>
                  </label>
                ))}
                {availableSignatories.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No signatories available. You can add them in Settings.
                  </p>
                )}
              </div>
            </div>

            {/* Download Restrictions */}
            <div className="border rounded-lg p-4 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={restrictDownload}
                  onChange={(e) => setRestrictDownload(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium">Restrict Certificate Downloads</p>
                  <p className="text-sm text-muted-foreground">
                    Only approved students can download this certificate
                  </p>
                </div>
              </label>

              {restrictDownload && (
                <div className="space-y-3 pt-3 border-t">
                  <Label>Approved Student Emails</Label>
                  <div className="flex gap-2">
                    <Input
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleAddEmail()}
                      placeholder="student@example.com"
                      disabled={isLoading}
                    />
                    <Button onClick={handleAddEmail} disabled={isLoading}>
                      Add
                    </Button>
                  </div>

                  {allowedEmails.length > 0 && (
                    <div className="space-y-2">
                      {allowedEmails.map((email) => (
                        <div
                          key={email}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <span className="text-sm">{email}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveEmail(email)}
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Update Certificate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
