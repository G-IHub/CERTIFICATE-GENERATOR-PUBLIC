import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Calendar,
  Building2,
  Award,
  User,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import SEOHead from "./SEOHead";

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-a611b057`;

interface VerificationResult {
  valid: boolean;
  certificate?: {
    id: string;
    courseName: string;
    certificateHeader: string;
    courseDescription?: string;
    completionDate: string;
    issuedDate: string;
    studentName?: string;
    template: string;
    signatories: any[];
  };
  organization?: {
    name: string;
    logo?: string;
  };
  course?: {
    name: string;
    description?: string;
  };
  message: string;
  error?: string;
}

export default function CertificateVerification() {
  const { certificateId } = useParams<{ certificateId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [result, setResult] = useState<VerificationResult | null>(null);

  useEffect(() => {
    console.log(
      "CertificateVerification mounted, certificateId:",
      certificateId,
    );
    console.log("Current URL:", window.location.href);
    console.log("Current hash:", window.location.hash);
    if (certificateId) {
      verifyCertificate();
    } else {
      console.error("No certificateId found in URL params");
      setIsLoading(false);
    }
  }, [certificateId]);

  const verifyCertificate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/certificates/${certificateId}/verify`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error("Verification error:", error);
      setResult({
        valid: false,
        message: "Failed to verify certificate. Please try again later.",
        error: String(error),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <>
        <SEOHead
          title="Verifying Certificate - Certifyer"
          description="Certificate verification in progress. Please wait..."
        />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Verifying Certificate</h2>
              <p className="text-muted-foreground">
                Please wait while we verify the authenticity of this
                certificate...
              </p>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!result) {
    return (
      <>
        <SEOHead
          title="Verification Failed - Certifyer"
          description="Certificate verification failed. The certificate ID may be invalid."
        />
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardContent className="p-12 text-center">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
              <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
              <p className="text-muted-foreground">
                Unable to verify certificate. Please try again.
              </p>
              <Button onClick={() => navigate("/")} className="mt-6">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Go to Homepage
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Generate SEO info based on verification result
  const seoTitle = result.valid
    ? `Verified: ${result.certificate?.courseName || "Certificate"} - ${result.organization?.name || "Organization"}`
    : "Invalid Certificate - Certifyer";

  const seoDescription = result.valid
    ? `Official certificate verification for ${result.certificate?.courseName || "course"} issued by ${result.organization?.name || "organization"}. Student: ${result.certificate?.studentName || "N/A"}. Issued: ${formatDate(result.certificate?.issuedDate || "")}.`
    : "This certificate could not be verified. It may be invalid or expired.";

  return (
    <>
      <SEOHead title={seoTitle} description={seoDescription} type="article" />
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Homepage
            </Button>
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-3xl font-bold">Certificate Verification</h1>
                <p className="text-muted-foreground">
                  Verify the authenticity of certificates issued on Certifyer
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Verification Result */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Card className="overflow-hidden">
            {/* Status Banner */}
            <div
              className={`p-6 ${
                result.valid
                  ? "bg-green-50 border-b border-green-200"
                  : "bg-red-50 border-b border-red-200"
              }`}
            >
              <div className="flex items-start gap-4">
                {result.valid ? (
                  <CheckCircle2 className="w-12 h-12 text-green-600 flex-shrink-0" />
                ) : (
                  <XCircle className="w-12 h-12 text-red-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <h2
                    className={`text-2xl font-bold mb-2 ${
                      result.valid ? "text-green-900" : "text-red-900"
                    }`}
                  >
                    {result.valid
                      ? "✓ Certificate Verified"
                      : "✗ Certificate Not Verified"}
                  </h2>
                  <p
                    className={`text-lg ${
                      result.valid ? "text-green-700" : "text-red-700"
                    }`}
                  >
                    {result.message}
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Details */}
            {result.valid && result.certificate && (
              <CardContent className="p-8 space-y-6">
                {/* Organization Info */}
                {result.organization && (
                  <div className="flex items-start gap-4 pb-6 border-b">
                    {result.organization.logo ? (
                      <img
                        src={result.organization.logo}
                        alt={result.organization.name}
                        className="w-16 h-16 object-contain rounded-lg border"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Issued By
                        </span>
                      </div>
                      <h3 className="text-xl font-bold">
                        {result.organization.name}
                      </h3>
                    </div>
                  </div>
                )}

                {/* Certificate Info */}
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Certificate ID */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Certificate ID
                      </span>
                    </div>
                    <p className="font-mono text-sm bg-gray-50 p-2 rounded border">
                      {result.certificate.id}
                    </p>
                  </div>

                  {/* Student Name */}
                  {result.certificate.studentName && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Awarded To
                        </span>
                      </div>
                      <p className="font-semibold text-lg">
                        {result.certificate.studentName}
                      </p>
                    </div>
                  )}

                  {/* Course Name */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Course
                      </span>
                    </div>
                    <p className="font-semibold">
                      {result.certificate.courseName}
                    </p>
                  </div>

                  {/* Completion Date */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Completion Date
                      </span>
                    </div>
                    <p className="font-semibold">
                      {formatDate(result.certificate.completionDate)}
                    </p>
                  </div>

                  {/* Issued Date */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-5 h-5 text-orange-500" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Issued Date
                      </span>
                    </div>
                    <p className="font-semibold">
                      {formatDate(result.certificate.issuedDate)}
                    </p>
                  </div>

                  {/* Certificate Header */}
                  {result.certificate.certificateHeader && (
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="w-5 h-5 text-orange-500" />
                        <span className="text-sm font-medium text-muted-foreground">
                          Certificate Type
                        </span>
                      </div>
                      <p className="font-semibold">
                        {result.certificate.certificateHeader}
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {result.certificate.courseDescription && (
                  <div className="pt-6 border-t">
                    <h4 className="font-semibold mb-2">Course Description</h4>
                    <p className="text-muted-foreground">
                      {result.certificate.courseDescription}
                    </p>
                  </div>
                )}

                {/* Signatories */}
                {result.certificate.signatories &&
                  result.certificate.signatories.length > 0 && (
                    <div className="pt-6 border-t">
                      <h4 className="font-semibold mb-4">
                        Authorized Signatories
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        {result.certificate.signatories.map(
                          (signatory: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg"
                            >
                              {signatory.signature ? (
                                <img
                                  src={signatory.signature}
                                  alt={signatory.name}
                                  className="w-20 h-12 object-contain"
                                />
                              ) : (
                                <div className="w-20 h-12 bg-white rounded border flex items-center justify-center">
                                  <User className="w-6 h-6 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">
                                  {signatory.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {signatory.title}
                                </p>
                              </div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
              </CardContent>
            )}

            {/* Error Details */}
            {!result.valid && result.error && (
              <CardContent className="p-8">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    <strong>Error:</strong> {result.error}
                  </p>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Additional Info */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>
              This verification page confirms the authenticity of certificates
              issued through Certifyer.
            </p>
            <p className="mt-2">
              For questions or concerns, please contact the issuing organization
              directly.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}