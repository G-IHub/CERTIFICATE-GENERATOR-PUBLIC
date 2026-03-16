import React, { useRef } from "react";

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
        className="w-200 h-150 flex justify-center shadow-sm rounded relative overflow-hidden bg-transparent py-20 px-10"
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
            <p className="font-medium text-xs text-purple-900 uppercase mb-4">
              This Certificate is Presented to:
            </p>
            <p className="w-full border-b-2 border-purple-900 font-semibold text-5xl tracking-wider">
              {recipientName}
            </p>
            <p className="max-w-xl text-xs font-semibold">{description}</p>
          </div>
          <div className="flex gap-10 w-full items-center mt-20">
            <div className="flex flex-col gap-2 items-center">
              <p className="border-b w-40 text-center tracking-wide font-[momo_signature]">
                {signatoryName1 || "signature"}
              </p>
              <div className="space-y-0">
                <p className="text-center text-xs font-medium text-purple-950">
                  {signatoryName1}
                </p>
                <p className="text-center text-[9px] italic font-medium">
                  {signatoryTitle1}
                </p>
              </div>
            </div>
            <img src={stampURL} alt="" className="w-1/7" />
            <div className="flex flex-col gap-2 items-center">
              <p className="border-b w-40 text-center tracking-wide font-[momo_signature]">
                {signatoryName2 || "signature"}
              </p>
              <div className="space-y-0">
                <p className="text-center text-xs font-medium text-purple-950">
                  {signatoryName2}
                </p>
                <p className="text-center text-[9px] italic font-medium">
                  {signatoryTitle2}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
