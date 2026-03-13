import React, { useEffect, useRef } from "react";
import medal from "../../assets/gold-seal.png";
import medal2 from "../../assets/red-star-stamp.png";
import type { Logo } from "../../App";

interface CertificateTemplate19Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[]; // NEW: Array of organization logos
  secondaryLogo?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
  startDate?: string;
  endDate?: string;
  dateDisplayMode?: "completion" | "range";
}

export default function CertificateTemplate19({
  header,
  courseTitle,
  description = "For outstanding achievement and remarkable contribution to the program, demonstrating excellence and commitment throughout.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  organizationLogos, // NEW: Array of organization logos
  secondaryLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
  startDate,
  endDate,
  dateDisplayMode = "completion",
}: CertificateTemplate19Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[800px] flex justify-center items-center";

  // useEffect(() => {
  //   const id = "libre-baskerville-font";
  //   if (!document.getElementById(id)) {
  //     const link = document.createElement("link");
  //     link.id = id;
  //     link.rel = "stylesheet";
  //     link.href =
  //       "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap";
  //     document.head.appendChild(link);
  //   }
  // }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Format start and end dates if in range mode
  const formattedStartDate = startDate
    ? new Date(startDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const formattedEndDate = endDate
    ? new Date(endDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  // Determine which logos to use (new logos array or fallback to legacy)
    const logo1 =
      organizationLogos && organizationLogos[0]?.url
        ? organizationLogos[0]
        : null;
    const logo2 =
      organizationLogos && organizationLogos[1]?.url
        ? organizationLogos[1]
        : null;
    const fallbackLogo = organizationLogo;

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        ref={ref}
        className="relative flex justify-center shadow-sm rounded overflow-hidden py-4 px-10"
        style={{
          width: "800px",
          height: "600px",
          fontFamily: "'Libre Baskerville', serif",
        }}
      >
        {/* decorative purple shapes */}
        <div className="z-0">
          {/* Top design */}
          <div className="w-80 h-20 bg-gradient-to-b from-purple-300 to-purple-100 absolute -left-10 -top-14 -rotate-25"></div>
          <div className="w-50 h-5 bg-purple-800 absolute -left-4 -top-7 -rotate-25"></div>
          <div className="w-50 h-6 bg-gradient-to-r from-purple-300 via-purple-500 to-purple-600 absolute -left-4 top-0 -rotate-25"></div>
          <div className="w-80 h-8 bg-purple-800 absolute -left-6 top-0 -rotate-25"></div>
          <div className="w-60 h-8 bg-gradient-to-b from-purple-400 to-purple-200 absolute left-5 top-5 -rotate-25 -skew-x-30"></div>
          <div className="w-10 h-0.5 bg-purple-200 absolute -left-5 top-34 -rotate-25 rounded"></div>
          <div className="w-15 h-0.5 bg-purple-200 absolute left-50 top-5 -rotate-25 rounded"></div>
          <div className="w-20 h-0.5 bg-purple-200 absolute left-45 top-10 -rotate-25 rounded"></div>
          {/* Bottom design */}
          <div className="w-80 h-20 bg-gradient-to-b from-purple-300 to-purple-100 absolute -right-10 -bottom-14 -rotate-25"></div>
          <div className="w-50 h-5 bg-purple-800 absolute -right-4 -bottom-7 -rotate-25"></div>
          <div className="w-50 h-6 bg-gradient-to-r from-purple-300 via-purple-500 to-purple-600 absolute -right-4 bottom-0 -rotate-25"></div>
          <div className="w-80 h-8 bg-purple-800 absolute -right-6 bottom-0 -rotate-25"></div>
          <div className="w-70 h-8 bg-gradient-to-t from-purple-400 to-purple-200 absolute right-14 -bottom-2 -rotate-25 -skew-x-30"></div>
          {/* <div className="w-10 h-0.5 bg-purple-200 absolute -right-5 bottom-34 -rotate-25 rounded"></div> */}
          {/* <div className="w-20 h-0.5 bg-purple-200 absolute -right-5 bottom-28 -rotate-25 rounded"></div> */}
          {/* <div className="w-30 h-0.5 bg-purple-200 absolute right-60 bottom-8 -rotate-25 rounded"></div> */}
          <img src={medal} alt="" className="absolute w-1/9 right-20 top-20" />
        </div>

        {/* content */}
        <div className="text-center flex flex-col gap-8 items-center w-full">
          <div className="flex flex-col items-center gap-2">
            <div className="flex">
              {organizationLogo && (
                <img
                  src={organizationLogo}
                  alt="Organization Logo"
                  className="w-16 h-16 object-contain"
                />
              )}
            </div>

            <h1 className="text-4xl/14 font-extrabold uppercase max-w-xl">
              {header}
            </h1>
          </div>
          <p className="font-bold">This Certificate is Proudly Presented to:</p>
          <p className="text-purple-600 w-1/2 text-center border-b border-purple-600 font-semibold text-3xl p-1 tracking-wider">
            {recipientName}
          </p>
          <p className="-my-7">
            has successfully completed and actively participated in the:{" "}
          </p>
          <p className="text-xl uppercase font-bold tracking-widest">
            {courseTitle}
          </p>
          <p className="-my-7">Held on: {formattedDate}</p>
          <p className="max-w-xl text-sm">{description}</p>

          {/* Signatures Section */}
          <div className="flex justify-between items-center">
            <div className="flex gap-1 justify-center items-center">
              {/* Signature 1 - Always show if name is provided */}
              {signatoryName1 && (
                <div className="flex flex-col items-center text-center  ">
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

              <div className="w-1/10">
                <img src={medal2} alt="" />
              </div>

              {/* Signature 2 - Always show if name is provided */}
              {signatoryName2 && (
                <div className="flex flex-col items-center text-center">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}