import React, { useEffect } from "react";
import vector from "../../assets/Vector (8).svg";
import path from "../../assets/path2646.svg";
import wrapper from "../../assets/Wrapper.svg";

interface CertificateTemplate13Props {
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
}

export default function CertificateTemplate13({
  header,
  courseTitle,
  description = "For demonstrating exceptional skills and dedication in completing the program with outstanding performance and commitment to excellence.",
  date,
  recipientName = "Name Surname",
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
}: CertificateTemplate13Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href =
      "https://fonts.googleapis.com/css2?family=Island+Moments&display=swap";
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine signature count
  const hasSignature1 = signatoryName1 || signatoryTitle1 || signatureUrl1;
  const hasSignature2 = signatoryName2 || signatoryTitle2 || signatureUrl2;

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="shadow-md rounded flex items-center justify-center relative overflow-hidden py-16 px-4"
        style={{ width: "1056px", height: "600px" }}
      >
        <img src={vector} alt="" className="absolute w-11/12" />
        <div className="flex flex-col items-center gap-4 text-center z-40">
          {/* Organization Logo */}
          {organizationLogo && (
            <img
              src={organizationLogo}
              alt="Organization Logo"
              className="w-16 h-16 object-contain"
            />
          )}

          {/* Header */}
          <div
            className="flex flex-col items-center gap-4 mb-6"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            <h1 className="text-3xl font-bold uppercase">
              {header || "Achievement"}
            </h1>
            <div className="flex gap-4 items-center">
              <img src={path} alt="" className="size-4" />
              <img src={path} alt="" className="size-4" />
              <img src={path} alt="" className="size-4" />
              <img src={path} alt="" className="size-4" />
            </div>
          </div>

          <div>
            {/* Presented to */}
            <p className="text-xs text-gray-500 mb-2 font-semibold uppercase">
              This is proudly presented to
            </p>

            {/* Recipient Name */}
            <div>
              <p
                className="text-6xl"
                style={{
                  fontFamily: "'Island Moments', cursive",
                  color: "#835A2A",
                }}
              >
                {recipientName}
              </p>
              <img src={wrapper} alt="" />
              <p
                className="font-medium text-2xl"
                style={{ fontFamily: "cursive" }}
              >
                {" "}
                {courseTitle || "Course Title"}{" "}
              </p>
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 max-w-md">{description}</p>
          </div>

          {/* Signatures Section */}
          <div className="mt-5 flex justify-between items-end">
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