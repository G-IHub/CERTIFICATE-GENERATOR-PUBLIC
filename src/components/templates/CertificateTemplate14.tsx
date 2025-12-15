import React, { useEffect } from "react";
import vector1 from "../../assets/Vector (9).svg";
import vector2 from "../../assets/Vector (10).svg";
import vector3 from "../../assets/Vector (11).svg";
import vector4 from "../../assets/Vector (12).svg";
import vector6 from "../../assets/Vector (15).svg";
import line from "../../assets/line.svg";

interface CertificateTemplate14Props {
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

export default function CertificateTemplate14({
  header,
  courseTitle,
  description = "For outstanding achievement and remarkable contribution to the program, demonstrating excellence and commitment throughout.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
}: CertificateTemplate14Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href =
      "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap";
    document.head.appendChild(link1);

    return () => {
      document.head.removeChild(link1);
    };
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="flex shadow-md rounded p-10 relative overflow-hidden"
        style={{ width: "1056px", height: "600px" }}
      >
        <div>
          <div
            className="w-80 h-20 absolute z-20 left-0"
            style={{ background: "#FFB016", bottom: "160px" }}
          ></div>
          <div>
            <img
              src={vector6}
              alt=""
              className="absolute top-0 w-1/3 z-30 left-10"
            />
            <div className="text-center flex flex-col items-center space-y-4 z-40 absolute w-1/3 left-6">
              <div className="flex flex-col items-center">
                {/* Organization Logo */}
                {organizationLogo && (
                  <img
                    src={organizationLogo}
                    alt="Organization Logo"
                    className="w-20 h-20 object-contain"
                  />
                )}
              </div>
              {/* Header */}
              <div className="flex flex-col gap-4 justify-center items-center text-white text-center">
                <div className="w-40 h-2 bg-white"></div>
                <h1 className="text-xl tracking-widest uppercase font-bold">
                  {header || "Excellence"}
                </h1>
                <div className="w-40 h-2 bg-white"></div>
              </div>
            </div>
          </div>
          <div
            className="flex flex-col gap-4 absolute left-14"
            style={{ bottom: "40px" }}
          >
            <div
              className="rounded-full w-2 h-2 border"
              style={{ background: "#FFB016" }}
            ></div>
            <div className="flex gap-4">
              <div
                className="rounded-full w-2 h-2 border"
                style={{ background: "#FFB016" }}
              ></div>
              <div
                className="rounded-full w-2 h-2 border"
                style={{ background: "#FFB016" }}
              ></div>
              <div
                className="rounded-full w-2 h-2 border"
                style={{ background: "#FFB016" }}
              ></div>
              <div
                className="rounded-full w-2 h-2 border"
                style={{ background: "#FFB016" }}
              ></div>
            </div>
          </div>
          <img
            src={vector2}
            alt=""
            className="absolute bottom-0 w-1/3"
            style={{ left: "100px" }}
          />
          <img
            src={vector1}
            alt=""
            className="absolute bottom-0"
            style={{ left: "230px" }}
          />
          <img src={vector4} alt="" className="absolute right-0 top-30" />
          <img
            src={vector3}
            alt=""
            className="absolute top-0"
            style={{ right: "200px" }}
          />
          <div
            className="w-40 h-10 absolute top-0 right-0 border"
            style={{ background: "#FF5A59" }}
          ></div>
          <div className="z-0 w-full h-full opacity-50">
            {Array.from({ length: 50 }).map((_, i) => (
              <img
                key={i}
                src={line}
                alt=""
                className="absolute w-full left-0"
                style={{ bottom: `${(i - 6) * 8}px` }}
              />
            ))}
          </div>
          <div className="z-0 w-full h-full opacity-50">
            {Array.from({ length: 22 }).map((_, i) => (
              <img
                key={i}
                src={line}
                alt=""
                className="absolute w-full -right-10"
                style={{ top: `${(i + 40) * 8}px` }}
              />
            ))}
          </div>
        </div>
        <div
          className="w-1/2 text-center absolute z-50 flex flex-col"
          style={{ top: "140px", right: "50px", gap: "60px" }}
        >
          <div className="flex flex-col gap-10">
            {/* Presented to */}
            <p className="text-sm uppercase">
              This certificate is proudly awarded to
            </p>

            {/* Recipient Name */}
            <p className="w-full font-bold text-2xl border-b-2 pb-4 text-center">
              {recipientName}
            </p>

            <p
              className="font-medium text-md"
              style={{ fontFamily: "cursive", marginTop: -20 }}
            >
              {courseTitle || "Course Title"}
            </p>

            {/* Description */}
            <p className="text-xs text-center" style={{ marginTop: -35 }}>
              {description}
            </p>
          </div>

          {/* Signatures Section */}
          <div className="flex justify-between items-end">
            <div
              className="flex gap-1 justify-center items-center"
              style={{ marginTop: -40 }}
            >
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
      </div>
    </div>
  );
}
