import React, { useEffect } from "react";
// Import ribbon and medal assets directly so the bundler resolves them correctly
import ribbon1 from "../../assets/Ribbon (1).svg";
import ribbon2 from "../../assets/Ribbon 2.svg";
import medal from "../../assets/Medal.svg";

interface CertificateTemplate4Props {
  header?: string;
  courseTitle?: string;
  description?: string;
  date?: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate4({
  header = "CERTIFICATE",
  courseTitle = "",
  description = "",
  date = "",
  recipientName = "Recipient",
  isPreview = false,
  organizationName,
  organizationLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  mode = "student",
}: CertificateTemplate4Props) {
  const previewMode = isPreview || mode === "template-selection";

  // Ensure the Rakkas font is loaded for this template
  useEffect(() => {
    const id = "rakkas-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Rakkas&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const mainBoxStyle: React.CSSProperties = previewMode
    ? {
        width: "100%",
        maxWidth: 1056,
        padding: "16px",
        boxSizing: "border-box",
      }
    : { width: 1056, padding: "24px" };

  return (
    <div style={{ backgroundColor: "transparent" }} className="w-full mx-auto">
      <div
        className="flex justify-center bg-white items-center shadow-md w-3xl p-6 rounded-sm relative overflow-hidden"
        style={mainBoxStyle}
      >
        <div>
          {ribbon1 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={String(ribbon1)}
              alt="ribbon1"
              className="absolute z-10 -top-5 left-0"
            />
          )}
          {ribbon2 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={String(ribbon2)}
              alt="ribbon2"
              className="absolute z-10 -bottom-6 right-0"
            />
          )}
        </div>

        <div className="bg-white border-4 border-[#314E854D] p-2 w-full">
          <div className="bg-white border-2 border-[#314E854D] px-8 py-10 relative">
            <div className="p-6 w-full flex flex-col items-center gap-10">
              <div className="flex flex-col items-center gap-2">
                <h2 className="text-5xl tracking-wider font-bold"
                style={{ fontFamily: "'Rakkas', serif" }}>
                  CERTIFICATE
                </h2>
                <p className="uppercase text-center text-[#314E85]">
                  of Achievement
                </p>
              </div>
              <p className="uppercase">proudly presented to</p>
              <p className="text-6xl font-semibold w-full border-b-2 border-b-[#314E85] pb-4 text-[#314E85] text-center">
                {recipientName}
              </p>
              <p className="text-center max-w-2xl">
                {description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </p>
              <div className="flex gap-10 w-full items-center justify-center">
                <div className="space-y-2">
                  <p className="border-b-1 border-b-[#314E85] w-40 text-center font-medium tracking-wide">
                    {date || "August 26, 2022"}
                  </p>
                  <p className="text-center text-sm font-medium">DATE</p>
                </div>
                <div className="w-1/6">
                  {/* Optional medal graphic if available in assets */}
                  {medal ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={String(medal)} alt="medal" />
                  ) : null}
                </div>
                <div className="space-y-2">
                  <p className="border-b-1 border-b-[#314E85] w-40 text-center font-medium tracking-wide">
                    {signatoryName1 || "Awarder"}
                  </p>
                  <p className="text-center text-sm font-medium">SIGNATURE</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
