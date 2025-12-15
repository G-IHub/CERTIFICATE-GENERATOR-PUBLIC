import React, { useEffect } from "react";
import Vector from "../../assets/Vector (1).svg";
import Flag from "../../assets/Flag.svg";

interface CertificateTemplate11Props {
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

export default function CertificateTemplate11({
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
}: CertificateTemplate11Props) {
  // scale for preview vs student mode
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
      "https://fonts.googleapis.com/css2?family=Momo+Signature&display=swap";
    document.head.appendChild(link2);

    const link3 = document.createElement("link");
    link3.rel = "stylesheet";
    link3.href =
      "https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900";
    document.head.appendChild(link3);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
      document.head.removeChild(link3);
    };
  }, []);

  // formatted date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="flex justify-center items-center shadow-md rounded-md relative overflow-hidden bg-white"
        style={{
          width: "1056px",
          height: "600px",
          paddingRight: "80px",
          paddingLeft: "80px",
          fontFamily: "'Noto Serif', serif",
        }}
      >
        <img src={Vector} alt="" className="absolute z-0 opacity-80" />
        <img src={Flag} alt="" className="absolute top-0 right-5" />
        <div className="flex flex-col items-center gap-10 z-10">
          <div className="flex flex-col gap-10 text-center">
            <div
              className="space-y-2"
              style={{ fontFamily: "'Libre Baskerville', serif" }}
            >
              {/* <p className="text-2xl text-gray-700">CERTIFICATE OF</p> */}
              <p className="text-4xl text-[#1A1815] uppercase">
                {header || "Certificate of Completion"}{" "}
              </p>
            </div>

            <p className="">
              {description ||
                "This certificate acknowledges your outstanding contribution and dedication to the project"}
            </p>
            <div className="space-y-1">
              <p>This is proudly presented to</p>
              <p
                className="text-amber-800 text-4xl"
                style={{ fontFamily: "'Libre Baskerville', serif" }}
              >
                {recipientName}
              </p>
              <p className="font-medium text-2xl" style={{fontFamily: 'cursive'}} > {courseTitle || "Course Title"} </p>
            </div>
          </div>

          <div className="mt-20 flex justify-between items-end">
            <div className="flex gap-8 justify-center items-center mt-5">
              {/* Signature 1 - Always show if name is provided */}
              {signatoryName1 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
                  {signatoryTitle1 && (
                    <div className="text-xs font-medium">{signatoryTitle1}</div>
                  )}

                  <div
                    className="text-sm font-bold"
                    style={{ color: "#4D4D4D" }}
                  >
                    {signatoryName1}
                  </div>
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-24 h-16 object-contain"
                      style={{ marginTop: -12 }}
                    />
                  )}
                  {!signatureUrl1 && (
                    <div className="w-32 border-b-2 border-gray-400 mb-2" />
                  )}
                </div>
              )}

              {/* Signature 2 - Always show if name is provided */}
              {signatoryName2 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
                  {signatoryTitle2 && (
                    <div className="text-xs font-medium">{signatoryTitle2}</div>
                  )}

                  <div
                    className="text-sm font-bold"
                    style={{ color: "#4D4D4D" }}
                  >
                    {signatoryName2}
                  </div>
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-24 h-16 object-contain"
                      style={{ marginTop: -12 }}
                    />
                  )}
                  {!signatureUrl2 && (
                    <div className="w-32 border-b-2 border-gray-400 mb-2" />
                  )}
                </div>
              )}

              {/* Date display */}
              {date && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 mt-2 mb-5" />
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
