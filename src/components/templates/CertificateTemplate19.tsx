import React, { useEffect } from "react";
import medal from "../../assets/gold-seal.png";
import medal2 from "../../assets/red-star-stamp.png";

interface CertificateTemplate19Props {
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

export default function CertificateTemplate19({
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
}: CertificateTemplate19Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const id = "libre-baskerville-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="relative flex justify-center shadow-sm rounded overflow-hidden py-4 px-10"
        style={{
          width: "1056px",
          height: "600px",
          fontFamily: "'Libre Baskerville', serif",
        }}
      >
        {/* decorative red shapes */}
        <div className="z-0">
            {/* Top design */}
          <div className="w-80 h-20 bg-gradient-to-b from-red-300 to-red-100 absolute -left-10 -top-14 -rotate-25"></div>
          <div className="w-50 h-5 bg-red-800 absolute -left-4 -top-7 -rotate-25"></div>
          <div className="w-50 h-6 bg-gradient-to-r from-red-300 via-red-500 to-red-600 absolute -left-4 top-0 -rotate-25"></div>
          <div className="w-80 h-8 bg-red-800 absolute -left-6 top-0 -rotate-25"></div>
          <div className="w-60 h-8 bg-gradient-to-b from-red-400 to-red-200 absolute left-5 top-5 -rotate-25 -skew-x-30"></div>
          <div className="w-10 h-0.5 bg-red-200 absolute -left-5 top-34 -rotate-25 rounded"></div>
          <div className="w-15 h-0.5 bg-red-200 absolute left-50 top-5 -rotate-25 rounded"></div>
          <div className="w-20 h-0.5 bg-red-200 absolute left-45 top-10 -rotate-25 rounded"></div>
            {/* Bottom design */}
          <div className="w-80 h-20 bg-gradient-to-b from-red-300 to-red-100 absolute -right-10 -bottom-14 -rotate-25"></div>
          <div className="w-50 h-5 bg-red-800 absolute -right-4 -bottom-7 -rotate-25"></div>
          <div className="w-50 h-6 bg-gradient-to-r from-red-300 via-red-500 to-red-600 absolute -right-4 bottom-0 -rotate-25"></div>
          <div className="w-80 h-8 bg-red-800 absolute -right-6 bottom-0 -rotate-25"></div>
          <div className="w-70 h-8 bg-gradient-to-t from-red-400 to-red-200 absolute right-14 -bottom-2 -rotate-25 -skew-x-30"></div>
          <div className="w-10 h-0.5 bg-red-200 absolute -right-5 bottom-34 -rotate-25 rounded"></div>
          <div className="w-20 h-0.5 bg-red-200 absolute -right-5 bottom-28 -rotate-25 rounded"></div>
          <div className="w-30 h-0.5 bg-red-200 absolute right-60 bottom-8 -rotate-25 rounded"></div>
          <img src={medal} alt="" className="absolute w-1/9 right-20 top-20" />
        </div>

        {/* content */}
        <div className="text-center flex flex-col gap-8 items-center w-full">
          <div className="flex flex-col items-center gap-2">
          <div className="flex gap-4">
              <div>
              {organizationLogo ? (
                <img
                  src={organizationLogo}
                  alt="logo"
                  className="w-20 mx-auto"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2"></div>
              )}
            </div>
              <div>
              {organizationLogo ? (
                <img
                  src={organizationLogo}
                  alt="logo"
                  className="w-20 mx-auto"
                />
              ) : (
                <div className="w-20 h-20 bg-gray-300 rounded-full mx-auto mb-2"></div>
              )}
            </div>
          </div>
            <h1 className="text-4xl/14 font-extrabold uppercase max-w-xl">
              {header}
            </h1>
          </div>
          <p className="font-bold">This Certificate is Proudly Presented to:</p>
          <p className="text-yellow-600 w-1/2 text-center border-b border-yellow-600 font-semibold text-3xl p-1 tracking-wider">
            {recipientName}
          </p>
          <p className="max-w-xl text-sm">{description}</p>
          <p className="text-xl uppercase font-bold tracking-widest">
            {courseTitle}
          </p>

          <div className="flex gap-10 w-full items-center justify-center">
            <div className="space-y-2">
              <p className="border-b border-yellow-600 w-40 text-center font-medium tracking-wide">
                {formattedDate}
              </p>
              <p className="text-center text-sm font-medium">DATE</p>
            </div>
            <div className="w-1/10">
              <img src={medal2} alt="" />
            </div>
            <div className="space-y-2">
              <p className="border-b border-yellow-600 w-40 text-center font-medium tracking-wide">
                {signatoryName1 || "Awarder"}
              </p>
              <p className="text-center text-sm font-medium">SIGNATURE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}