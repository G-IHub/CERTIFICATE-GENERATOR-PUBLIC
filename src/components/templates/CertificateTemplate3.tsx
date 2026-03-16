import React, { useEffect } from "react";
import patternUrl from "../../assets/Pattern.png";
import leftDecorUrl from "../../assets/ins_left.png";
import rightDecorUrl from "../../assets/ins_right.png";
import ribbonUrl from "../../assets/ins_ribbon.png";

interface CertificateTemplate3Props {
  header?: string;
  courseTitle?: string;
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

export default function CertificateTemplate3({
  header = "Of Completion",
  header1 = "CERTIFICATE",
  courseTitle = "PERSONALIZED RESEARCH TRAINING IN TRANSCRIPTOMICS",
  description =
    "This Is To Certify That The Above-Mentioned Individual Has Completed A Three-Months Training In PERSONALIZED RESEARCH TRAINING IN TRANSCRIPTOMINCS Organized by Genomac Services & Consult.",
  date = "March, 2026",
  recipientName = "Adeade Favour Ololade",
  isPreview = false,
  organizationName = "Genomac Institute Inc",
  organizationLogo,
  signatoryName1 = "Oluwaseyi Abraham Olawale",
  signatoryTitle1 = "Founder & CEO",
  signatureUrl1,
  signatoryName2 = "Agboola Oluwaseun",
  signatoryTitle2 = "Director",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate3Props) {
  const scale = mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  // useEffect(() => {
  //   const fontId = "great-vibes-font";
  //   if (!document.getElementById(fontId)) {
  //     const link = document.createElement("link");
  //     link.id = fontId;
  //     link.rel = "stylesheet";
  //     link.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap";
  //     document.head.appendChild(link);
  //   }
  // }, []);

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={containerClass} style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}>
      <div className="w-800 h-[600px] flex justify-center shadow-sm rounded-sm relative overflow-hidden bg-[#fbfbfb] py-10 px-4">
        <img src={patternUrl} alt="Pattern" className="absolute z-0 top-0 w-full h-full opacity-80" />
        <img src={leftDecorUrl} alt="Decoration Left" className="absolute top-0 left-0 h-full" />
        <img src={rightDecorUrl} alt="Decoration Right" className="absolute top-0 right-0 h-full" />

        <div className="absolute top-6 left-16 flex items-center gap-2 z-20">
          {organizationLogo ? (
            <img src={organizationLogo} alt={organizationName} className="h-12 object-contain" />
          ) : (
            <img src="/assets/GenomacInstitute.png" alt="Logo" className="h-12 object-contain" />
          )}
          <p className="font-bold text-black text-base leading-tight" style={{ fontFamily: "Inter, sans-serif" }}>
            {organizationName ?? "Genomac"}
            <br />Institute Inc
          </p>
        </div>

        <div className="z-30 flex flex-col gap-8 items-center w-full p-8 mt-10">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-6xl -mt-10 text-purple-950 tracking-wider">{header1}</h1>
            <div className="relative w-full flex justify-center items-center">
              <p className="text-xl uppercase font-medium tracking-widest bg-transparent italic text-white px-4 py-2 z-30 relative">
                {header }
              </p>
              <img src={ribbonUrl} alt="Ribbon" className="mx-auto z-0 absolute w-9/12" />
            </div>
          </div>

          <p className="text-sm font-semibold text-black -mt-6">This certificate is presented to</p>

          <div className="space-y-4 flex flex-col items-center text-center">
            <p className="w-full border-b-2 border-purple-900 text-purple-900 text-4xl" style={{ fontFamily: "Great Vibes, cursive" }}>
              {recipientName}
            </p>
            <p className="max-w-xl text-xs text-center text-black">{description}</p>
            <p className="-mt-3 text-purple-900 text-xl font-bold">{courseTitle}</p>
            <p className="text-purple-900 p-2 text-xs border border-purple-900 font-medium">Held on: {formattedDate}</p>
          </div>

          <div className="flex gap-10 w-full items-center justify-center mt-10">
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
