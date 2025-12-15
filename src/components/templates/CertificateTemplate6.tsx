import React from "react";
import { Award, Star } from "lucide-react";

interface CertificateTemplate6Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
  // Legacy props for backwards compatibility
  programName?: string;
  issueDate?: string;
  primaryColor?: string;
  signatories?: Array<{
    name: string;
    title: string;
    signatureUrl?: string;
  }>;
}

export default function CertificateTemplate6({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
  // Legacy props
  programName,
  issueDate,
  primaryColor = "#ea580c",
  signatories = [],
}: CertificateTemplate6Props) {
  // Use legacy props if provided, otherwise use new standard props
  const displayProgramName = programName || courseTitle;
  const displayIssueDate = issueDate || date;
  const displayRecipientName = recipientName;

  // Format date
  const formattedDate = new Date(displayIssueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      {/* Certificate Container */}
      <div
        className="relative w-full bg-white overflow-hidden"
        style={{ width: "1056px", height: "600px" }}
      >
        {/* Dark Brown Corner Decorations */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 100,0 L 0,100 Z" fill="#3d2817" />
          </svg>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 100,0 L 100,100 Z" fill="#3d2817" />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,0 L 0,100 L 100,100 Z" fill="#3d2817" />
          </svg>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <path d="M 0,100 L 100,100 L 100,0 Z" fill="#3d2817" />
          </svg>
        </div>

        {/* Orange Border Frame */}
        <div className="absolute inset-0 m-4">
          <div className="absolute inset-0 border-4 border-[#ea580c]" />
        </div>

        {/* Inner White Content Area */}
        <div className="absolute inset-0 m-12 bg-white flex flex-col items-center justify-center p-12">
          {/* Gold Badge and Title Section */}
          <div className="flex items-start gap-8 mb-8">
            <div className="flex flex-col items-center">
              {/* Organization Logo */}
              {organizationLogo && (
                <img
                  src={organizationLogo}
                  alt="Organization Logo"
                  className="w-20 h-20 object-contain mb-4"
                />
              )}
            </div>
            {/* Title Section */}
            <div className="flex-1 text-left pt-4">
              <h1
                className="text-5xl tracking-wider mb-2"
                style={{
                  fontFamily: "serif",
                  color: "#4a4a4a",
                  letterSpacing: "0.1em",
                }}
              >
                CERTIFICATE
              </h1>
              <h2 className="text-xl tracking-widest text-gray-600 uppercase">
                OF APPRECIATION
              </h2>
            </div>
          </div>

          {/* Presentation Text */}
          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 uppercase tracking-wide mb-4">
              This certificate is proudly presented to
            </p>

            {/* Recipient Name */}
            <div className="mb-6">
              <h3
                className="text-4xl mb-2"
                style={{
                  fontFamily: "cursive",
                  color: "#2d2d2d",
                }}
              >
                {displayRecipientName}
              </h3>
              <div className="w-full max-w-md mx-auto h-px bg-gray-800" />
            </div>

            {/* Company/Program Name */}
            <p className="text-sm uppercase tracking-wider text-gray-700 mb-4">
              {courseTitle || "Course Title"}
            </p>

            {/* Description */}
            <p className="text-xs text-gray-600 leading-relaxed max-w-2xl mx-auto">
              {description ||
                `In recognition of outstanding achievement and exceptional dedication to ${displayProgramName}. This certificate acknowledges your commitment to excellence and significant contributions that have made a lasting impact on our organization and community.`}
            </p>
          </div>

          {/* Bottom Section */}
          {/* Signatures - Support up to 2 */}
          <div className="mt-20 flex justify-between items-end">
            <div className="flex gap-8 justify-center items-center mt-5">
              {/* Signature 1 - Always show if name is provided */}
              {signatoryName1 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                  {!signatureUrl1 && (
                    <div className="w-32 border-b-2 border-gray-400 mb-2" />
                  )}
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#4D4D4D" }}
                  >
                    {signatoryName1}
                  </div>
                  {signatoryTitle1 && (
                    <div className="text-xs font-medium">{signatoryTitle1}</div>
                  )}
                </div>
              )}

              {/* Signature 2 - Always show if name is provided */}
              {signatoryName2 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                  {!signatureUrl2 && (
                    <div className="w-32 border-b-2 border-gray-400 mb-2" />
                  )}
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#4D4D4D" }}
                  >
                    {signatoryName2}
                  </div>
                  {signatoryTitle2 && (
                    <div className="text-xs font-medium">{signatoryTitle2}</div>
                  )}
                </div>
              )}

              {/* Date display */}
              {date && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 mt-8 mb-2" />
                  <div className="text-xs font-bold ">Date</div>
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#4D4D4D" }}
                  >
                    {formattedDate || "DATE"}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
