import React, { useRef } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";
import patternURL from "../../assets/HEXAGON.png";
import stampURL from "../../assets/purple_stamp.png";

interface CertificateTemplate9Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[];
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
  themeColors?: ThemeColors;
}

export default function CertificateTemplate9({
  header,
  courseTitle,
  description = "This certificate acknowledges your outstanding contribution and dedication to the Design project, showcasing your commitment to excellence, innovation, and teamwork.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  organizationLogos,
  signatoryName1 = "Bryan Lee",
  signatoryTitle1 = "MANAGER, CTO",
  signatureUrl1,
  signatoryName2 = "Sarah Kim",
  signatoryTitle2 = "CEO, Founder",
  signatureUrl2,
  mode = "student",
  themeColors,
}: CertificateTemplate9Props) {
  // scale for preview vs student mode
  const ref = useRef<HTMLDivElement>(null);
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  // formatted date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine which logo(s) to use
  const logo1 = organizationLogos && organizationLogos[0]?.url
    ? organizationLogos[0]
    : null;
  const logo2 = organizationLogos && organizationLogos[1]?.url
    ? organizationLogos[1]
    : null;
  const fallbackLogo = organizationLogo;

    return (
    <div
      ref={ref}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
      className="w-200 h-150 flex shadow-sm relative overflow-hidden bg-transparent py-10 px-10"
    >
      <img
        src={patternURL}
        alt=""
        className="absolute w-full h-full top-0 opacity-70"
      />
      <div className="w-20 h-full absolute -left-6 top-0 bg-[#330066] z-10 skew-x-2"></div>
      <div className="w-20 h-full absolute left-10 top-0 bg-[#ff35ff] z-0"></div>
      <div className="flex-col items-center justify-center h-full">
          <div className="flex">
            {/* First Logo */}
            {logo1 ? (
              <div className="flex items-center">
                <img
                  src={logo1.url}
                  alt={logo1.name || "Logo"}
                  className="absolute top-50 left-10 w-40 z-20"
                />
              </div>
            ) : fallbackLogo ? (
              <img
                src={fallbackLogo}
                alt="Logo"
                className="absolute top-50 left-10 w-40 z-20"
              />
            ) : null}

            {/* Second Logo */}
            {logo2 ? (
              <div className="flex items-center ml-2">
                <img
                  src={logo2.url}
                  alt="Logo"
                  className="absolute top-50 left-10 w-40 z-20"
                />
              </div>
            ) : (
              <div className="hidden"></div>
            )}
          </div>
        <img
          src={organizationLogo}
          alt=""
          className="absolute -top-24 -right-24 w-100 z-10 opacity-10"
        />
      </div>

      <div className="flex flex-col gap-10 z-30 w-9/12 ml-40">
        <div className="">
          <h1 className="text-7xl text-purple-950 font-semibold tracking-tighter">
            {header?.split(" ")[0] || "CERTIFICATE"}
          </h1>
          <p className="text-2xl uppercase tracking-widest">
            {header?.split(" ").slice(1).join(" ") || "OF COMPLETION"}
          </p>
        </div>

        <div className="space-y-2">
          <p className="font-medium text-xs text-purple-950 uppercase mt-4 mb-4">
            This Certificate is Presented to:
          </p>
          <p className="w-full border-b-2 border-purple-950 font-semibold text-4xl tracking-wider">
            {recipientName}
          </p>
          <p className="text-sm">For successfully participating in the program:</p>
          <p className="text-lg font-bold -mt-2 -mb-0.5Te">{courseTitle}</p>
          <p className="text-sm">
            {description}
          </p>
        </div>

        <div className="flex gap-10 w-full items-center justify-between -ml-16">
          {signatoryName1 && (
            <div className="flex flex-col items-center">
              <div className="border-b border-purple-950 w-40 flex justify-center min-h-16 pb-2">
                {signatureUrl1 && (
                  <img
                    src={signatureUrl1}
                    alt={signatoryName1}
                    className="w-24 h-16 object-contain"
                    style={{ marginBottom: -12 }}
                  />
                )}
              </div>
              <p className="text-center text-xs font-medium text-purple-950">
                {signatoryName1}
              </p>
              <p className="text-center text-[9px] italic font-medium">
                {signatoryTitle1}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-2 justify-center items-center">
            <img src={stampURL} alt="" className="w-1/3" />
            <p className="text-sm text-purple-950 font-bold">{formattedDate}</p>
          </div>

          {signatoryName2 && (
            <div className="flex flex-col items-center">
              <div className="border-b border-purple-950 w-40 flex justify-center min-h-16 pb-2">
                {signatureUrl2 && (
                  <img
                    src={signatureUrl2}
                    alt={signatoryName2}
                    className="w-24 h-16 object-contain"
                    style={{ marginBottom: -12 }}
                  />
                )}
              </div>
              <p className="text-center text-xs font-medium text-purple-950">
                {signatoryName2}
              </p>
              <p className="text-center text-[9px] italic font-medium">
                {signatoryTitle2}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
