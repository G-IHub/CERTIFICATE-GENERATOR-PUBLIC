import React, { useEffect } from "react";

import DecorImg from "../../assets/Decor.svg";
import Medal2Img from "../../assets/Medal2.svg";
import Path2646 from "../../assets/path2646.svg";
import VectorImg from "../../assets/Vector.svg";

interface CertificateTemplate7Props {
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

export default function CertificateTemplate7({
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
}: CertificateTemplate7Props) {
  // scale for preview vs student mode
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

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
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        className="flex shadow-md rounded-sm relative overflow-hidden bg-white"
        style={{ width: "1056px", height: "600px" }}
      >
        <div className="flex flex-col gap-10 items-start w-3/4 p-10">
          <div
            className="space-y-2"
            style={{ fontFamily: "'Libre Baskerville', serif" }}
          >
            <h2 className="font-bold text-4xl uppercase">
              {header || "Certificate"}{" "}
            </h2>
            {/* <p>OF ACHIEVEMENT</p> */}
            <div className="flex gap-4">
              {/* Decorative repeated small paths */}
              <img src={Path2646} alt="" />
              <img src={Path2646} alt="" />
              <img src={Path2646} alt="" />
              <img src={Path2646} alt="" />
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-gray-400 uppercase font-medium">
              This is proudly presented to
            </p>
            <p
              className="font-bold text-amber-900 text-3xl border-b border-[#6F6A5B] w-3/4"
              style={{ fontFamily: "'Momo Signature', cursive" }}
            >
              {recipientName}
            </p>
            <p
              className="font-medium text-2xl"
              style={{ fontFamily: "cursive" }}
            >
              {courseTitle || "Course Title"}
            </p>

            <p className="text-[#5A5549] text-sm max-w-sm">
              {description ||
                "lorem ipsum dolor sit amet, consectetur adipiscing elit."}
            </p>
          </div>

          {signatoryName1 && (
            <div
              className="flex items-end absolute"
              style={{ gap: "80px", bottom: "60px" }}
            >
              <div className="flex flex-col gap-2 text-sm">
                <img
                  src={signatureUrl1}
                  alt={signatoryName1}
                  className="w-24 h-16 object-contain"
                  style={{ marginBottom: -12 }}
                />
                <p className="font-bold border-b border-[#6F6A5B]">
                  {signatoryName1}
                </p>
                <p className="text-sm">{signatoryTitle1}</p>
              </div>
              {/* Date Display */}
              {date && (
                <div className="flex flex-col items-end gap-2 text-sm">
                  <img src={VectorImg} alt="" className="w-1/3" />
                  <p className="uppercase">Presented on</p>
                  <p>{formattedDate || "DATE"}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right side decorations */}
        <div className="">
          <img
            src={DecorImg}
            alt=""
            className="absolute right-0 top-0 h-full object-cover"
          />
          <img
            src={Medal2Img}
            alt=""
            className="absolute"
            style={{ right: "150px", top: "80px", width: "25%" }}
          />
        </div>
      </div>
    </div>
  );
}
