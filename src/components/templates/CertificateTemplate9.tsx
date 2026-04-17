import React, { useRef } from "react";
import type { ThemeColors } from "../../types/theme";
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
  signatoryName1 = "Signature",
  signatoryTitle1 = "MANAGER, CTO",
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
  themeColors,
}: CertificateTemplate9Props) {
  // scale for preview vs student mode
  const ref = useRef<HTMLDivElement>(null);
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[800px] flex justify-center items-center";

  // formatted date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        ref={ref}
        className="w-[800px] h-[600px] flex justify-center shadow-sm rounded relative overflow-hidden bg-transparent py-20 px-10"
      >
        <img
          src={patternURL}
          alt=""
          className="absolute w-full h-full top-0 opacity-70"
        />
        <div className="w-20 h-full absolute -left-6 top-0 bg-[#330066] z-10 skew-x-2"></div>
        <div className="w-20 h-full absolute left-10 top-0 bg-[#ff35ff] z-0"></div>
        <div className="flex-col items-center justify-center h-full">
          <img
            src={organizationLogo}
            alt=""
            className="absolute top-50 left-12 w-1/6 z-20"
          />
          <img
            src={organizationLogo}
            alt=""
            className="absolute -top-14 -right-16 w-1/3 z-10 opacity-10"
          />
        </div>

        <div className="flex flex-col gap-10 z-30 w-9/12 ml-40">
          <h1 className="text-6xl text-purple-950 font-semibold">{header}</h1>

          <div className="space-y-4">
            <p className="font-medium text-xs text-purple-900 uppercase -mt-4 mb-6">
              This Certificate is Presented to:
            </p>
            <p className="w-full border-b-2 border-purple-900 font-semibold text-4xl tracking-wider">
              {recipientName}
            </p>
            <p className="text-xs " >For successfully participating in the program: </p>
            <p className="text-lg font-bold -mt-2 -mb-1 " >{courseTitle} </p>
            <p className="max-w-xl text-xs font-semibold">{description}</p>
          </div>

          <div className="flex gap-10 w-full items-center justify-center mt-4">
            {signatoryName1 && (
              <div className="space-y-2">
                <p className="border-b w-40 text-center tracking-wide font-[Great_Vibes]">
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                </p>
                <div className="space-y-0">
                  <p className="text-center text-sm font-medium text-purple-500">
                    {signatoryName1}
                  </p>
                  <p className="text-center text-[9px] italic font-medium">
                    {signatoryTitle1}
                  </p>
                </div>
              </div>
            )}

            {signatoryName2 && (
              <div className="space-y-2">
                <p className="border-b w-40 text-center tracking-wide font-[Great_Vibes]">
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                </p>
                <div className="space-y-0">
                  <p className="text-center text-sm font-medium text-purple-500">
                    {signatoryName2}
                  </p>
                  <p className="text-center text-[9px] italic font-medium">
                    {signatoryTitle2}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
