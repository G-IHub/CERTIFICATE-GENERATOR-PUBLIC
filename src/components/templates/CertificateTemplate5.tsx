import React, { useEffect } from "react";
import ribbonUrl from "../../assets/RIBBON.png";
import gNaturesLogo from "../../assets/g-natures_logo.png";
import medalUrl from "../../assets/medal.png";

interface CertificateTemplate5Props {
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

export default function CertificateTemplate5({
  header = "CERTIFICATE",
  courseTitle = "Of Completion",
  description = "This Certificate is Presented to:",
  date,
  recipientName = "Noor ul ain Fatima",
  isPreview = false,
  organizationName = "G-Natures",
  organizationLogo,
  signatoryName1 = "Oluwaseyi Abraham Olawale",
  signatoryTitle1 = "Founder & CEO of Genomac Holdings",
  signatureUrl1,
  signatoryName2 = "Praise Ayomide Olawale",
  signatoryTitle2 = "Director, G-Natures",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate5Props) {
  const scale = mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  // useEffect(() => {
  //   const fontId = "manufacturing-consent-font";
  //   if (!document.getElementById(fontId)) {
  //     const link = document.createElement("link");
  //     link.id = fontId;
  //     link.rel = "stylesheet";
  //     link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap";
  //     document.head.appendChild(link);
  //   }
  // }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  return (
    <div className={containerClass} style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}>
      <div className="w-200 h-150 shadow-sm rounded-sm relative overflow-hidden bg-[#fbfbfb] px-10">
        <div className="w-full h-20 bg-linear-to-r from-green-950 via-green-600 to-green-600 absolute top-0 left-0 z-0" />
        <div className="w-40 h-full bg-linear-to-b from-green-950 to-green-600 absolute top-0 right-0 rounded-bl-full z-0" />

        <img src={organizationLogo || gNaturesLogo} alt="Logo" className="absolute left-10 top-8 z-10 w-1/12 object-contain" />
        <img src={medalUrl} alt="Medal" className="absolute right-0 top-20 z-10 w-1/4 object-contain" />

        <div className="flex flex-col gap-8 z-30 w-9/12 mt-30">
          <div>
            <h1 className="text-4xl text-green-950" style={{ fontFamily: "'Manufacturing Consent', sans-serif" }}>
              {header}
            </h1>
            <p className="text-3xl font-semibold tracking-tight">{courseTitle}</p>
          </div>

          <p className="font-medium -mt-5 text-xs px-4 py-2 bg-linear-to-r from-green-950 to-green-600 text-white w-1/2">
            This certificate is presented to
          </p>

          <div className="space-y-2">
            <p className="w-full border-b-2 border-green-600 font-semibold text-4xl tracking-wider">{recipientName}</p>
            <p className="max-w-xl text-sm">{description}</p>
            <div className="text-sm text-black font-bold">{formattedDate}</div>
          </div>

          <div className="flex gap-10 w-full items-center justify-center -mt-4">
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
                  <p className="text-center text-sm font-medium text-green-950">
                    {signatoryName1}
                  </p>
                  <p className="text-center text-[9px] italic font-medium">
                    {signatoryTitle1}
                  </p>
                </div>
              </div>
            )}

            <div className="w-1/12">
              <img src={ribbonUrl} alt="Ribbon" className="mx-auto" style={{ color: "green" }} />
            </div>

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
                  <p className="text-center text-sm font-medium text-green-950">
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
