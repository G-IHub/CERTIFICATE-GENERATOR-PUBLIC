import React, { useEffect } from "react";

import DecorImg from "../../assets/Decor2.svg";
import badge from "../../assets/Badge.svg";

interface CertificateTemplate12Props {
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

export default function CertificateTemplate12({
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
}: CertificateTemplate12Props) {
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

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
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
        className="flex shadow-md rounded-sm relative overflow-hidden bg-white"
        style={{ width: "1056px", height: "600px" }}
      >
        <div className="flex flex-col gap-10 items-start w-5/6 p-10">
          <div className="space-y-2">
            <div className="flex gap-4">
              <img
                src={organizationLogo}
                alt="organization_logo"
                className="w-10"
              />
              {/* <h1 className="text-4xl font-ectrabold tracking-widest">SQ</h1> */}
            </div>
            <h3
              className=""
              style={{ fontFamily: "'Libre Baskerville', serif" }}
            >
              {organizationName}
            </h3>
          </div>

          <div className="space-y-2 mt-4">
            <h2
              className="text-2xl font-medium uppercase"
              style={{ fontFamily: "'Libre Baskerville', serif" }}
            >
              {header || "CERTIFICATE OF EXCELLENCE "} TO
            </h2>
            <div
              className="border-b-2 w-1/2"
              style={{ border: "1px solid #CEAD6A" }}
            ></div>
          </div>
          <div className="space-y-2">
            <p
              className="text-3xl font-light w-2/4 uppercase"
              style={{
                fontFamily: "'Libre Baskerville', serif",
                color: "#CEAD6A",
              }}
            >
              {recipientName}
            </p>
            <p
              className="font-medium text-xl"
              style={{ fontFamily: "cursive" }}
            >
              {" "}
              {courseTitle || "Course Title"}{" "}
            </p>
            <p className="text-[#5A5549] max-w-lg">
              {description ||
                "This certificate acknowledges your outstanding contribution and dedication to the project"}
            </p>
          </div>

          <div className="mt-20 flex justify-between items-end">
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

              <img
                src={badge}
                alt="badge"
                className="w-10 h-10 object-contain"
              />

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

        {/* Right side decorations */}
        <div className="h-full">
          <img
            src={DecorImg}
            alt=""
            className="absolute -right-40 object-cover"
          />
        </div>
      </div>
    </div>
  );
}
