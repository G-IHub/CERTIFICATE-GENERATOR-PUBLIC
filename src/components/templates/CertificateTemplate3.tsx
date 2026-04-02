import React, { useRef, useEffect } from "react";
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
  header,
  courseTitle,
  description,
  date = "March, 2026",
  recipientName,
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1 = "Bryan Luke",
  signatoryTitle1 = "Founder & CEO",
  signatureUrl1,
  signatoryName2 = "Sarah Kim",
  signatoryTitle2 = "Director",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate3Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  useEffect(() => {
    const fontId = "great-vibes-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

   const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  // const logosToDisplay = organizationLogos || [];
  // const hasLogos = logosToDisplay.length > 0;

  return (
    <div
    ref={ref}
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        className="w-200 h-150 flex justify-center items-center shadow-sm rounded-sm relative overflow-hidden bg-[#fbfbfb] py-10 px-4"
      >
        <img
          src={patternUrl}
          alt="Pattern"
          className="absolute z-0 top-0 w-full h-full opacity-80"
        />
        <img
          src={leftDecorUrl}
          alt="Decoration Left"
          className="absolute top-0 left-0 h-full"
        />
        <img
          src={rightDecorUrl}
          alt="Decoration Right"
          className="absolute top-0 right-0 h-full"
        />

        <div className="absolute top-2 left-18 flex items-center z-20">
          <img
            src={organizationLogo}
            alt={organizationName}
            className="h-20 w-20 object-contain"
          />
          <div className="flex flex-col gap-0 justify-center">
            <p className="m-0 font-semibold text-lg leading-4">
              {organizationName.split(" ")[0]}
            </p>
            <p className="m-0 font-semibold text-lg">
              {organizationName?.split(" ")[1]} {organizationName?.split(" ")[2]}{" "}
              {organizationName?.split(" ")[3]}
            </p>
          </div>
        </div>

        <div className="z-30 flex flex-col gap-6 items-center w-full p-8 mt-8">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-7xl text-purple-950 tracking-wider uppercase">
              {header?.split(" ")[0]}
            </h1>
            <div className="relative w-full flex justify-center items-center">
              <p className="text-2xl uppercase font-medium tracking-widest bg-transparent italic text-white px-4 py-2 z-30 relative">
                {header?.split(" ")[1]} {header?.split(" ")[2]}
              </p>
              <img
                src={ribbonUrl}
                alt="Ribbon"
                className="mx-auto z-0 absolute w-9/12"
              />
            </div>
          </div>

          <p className="font-semibold">This certificate is presented to</p>

          <div className="flex flex-col gap-4 items-center text-center">
            <p
              className="w-auto border-b-2 border-purple-950 text-purple-900 text-5xl"
              style={{ fontFamily: "Great Vibes, cursive" }}
            >
              {recipientName}
            </p>
            <p className="max-w-md font-semibold text-center text-sm">
              {description} {courseTitle} Organized by {organizationName}.
            </p>

            <p className="text-purple-900 p-2 text-sm border border-purple-900 font-medium">
              Held on: {formattedDate}
            </p>
          </div>

          <div className="flex gap-10 w-full items-center justify-center">
            {signatoryName1 && (
              <div className="flex flex-col items-center gap-2">
                <div className="border-b-2 border-green-950 w-40 flex justify-center min-h-10">
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-center text-sm font-medium">
                    {signatoryName1}
                  </p>
                  <p className="text-center text-[9px] italic font-medium">
                    {signatoryTitle1}
                  </p>
                </div>
              </div>
            )}

            {signatoryName2 && (
              <div className="flex flex-col items-center gap-2">
                <div className="border-b-2 border-green-950 w-40 flex justify-center min-h-10">
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                </div>
                <div>
                  <p className="text-center text-sm font-medium">
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
