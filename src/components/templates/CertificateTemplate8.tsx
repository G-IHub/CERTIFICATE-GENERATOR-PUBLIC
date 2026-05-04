import React, { useRef, useEffect } from "react";
import medal from "../../assets/iwdAward.png";

interface CertificateTemplate8Props {
  header?: string;
  courseTitle?: string;
  description?: string;
  date?: string;
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

export default function CertificateTemplate8({
  header = "CERTIFICATE OF ATTENDANCE",
  courseTitle = "Certificate Program",
  description = "This certificate is awarded in recognition of your active participation and dedication to excellence.",
  date = "2026-04-18",
  recipientName = "Recipient Name",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1 = "Boluwatife Adebisi",
  signatoryTitle1 = "WTM Ogbomoso Ambassador",
  signatureUrl1,
  signatoryName2 = "Deborah Opakunle",
  signatoryTitle2 = "WTM IWD'26 Organiser",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate8Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[850px] flex justify-center items-center";

  useEffect(() => {
    const id = "Montserrat-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={ref}
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="relative w-[800px] h-[600px] shadow-sm rounded bg-white overflow-hidden bg-linear-to-b from-[#406DBA] via-[#20365C] to-[#0D1524]">
        <div className="absolute top-50 h-50 w-20 right-0 z-20 bg-white flex">
          <div className="flex self-center bg-[#04BFA6] w-10 h-5 absolute right-0"></div>
        </div>
        <div className="w-0.5 h-20 bg-white absolute bottom-60 left-30"></div>
        <div className="absolute bottom-10 left-10 w-[20%] aspect-square flex items-center justify-center font-[Montserrat]">
          <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
            <path
              id="circlePath"
              d="
              M 100, 100
              m -80, 0
              a 80,80 0 1,1 160,0
              a 80,80 0 1,1 -160,0
            "
              fill="transparent"
            />
            <text
              fill="#3B82F6"
              fontSize="16"
              fontWeight="600"
              letterSpacing="2"
            >
              <textPath
                href="#circlePath"
                startOffset="50%"
                textAnchor="middle"
              >
                INTERNATIONAL WOMEN'S DAY CONFERENCE
              </textPath>
            </text>
          </svg>
          <div className="w-[60%] aspect-square rounded-full bg-gray-100 flex items-center justify-center shadow-inner">
            <div className="w-[80%] aspect-square rounded-full bg-gray-100 flex items-center justify-center border-2 border-dotted border-gray-700">
              <img
                alt="medalsvg"
                src={medal}
                className="absolute -bottom-4 w-9/12 h-full object-contain"
              />
              <img
                alt="Organization Logo"
                src={organizationLogo}
                className="absolute inset-[31%] w-[37%] h-[40%] object-contain"
              />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 flex">
          <div className="w-[20%]" />

          <div className="w-[200%] p-10 border-l-10 border-b-10 rounded-bl-full bg-white">
            <div className="flex flex-col justify-between ml-30 border-2 h-full rounded-bl-full rounded border-black border-s-transparent border-b-0 p-10">
              <div className="flex items-end justify-between gap-4 font-[Montserrat]">
                <div>
                  <div className="text-[#5691F7] uppercase">
                    <h1 className="text-7xl/14 font-extrabold">
                      {header.split(" ")[0]}
                    </h1>
                    <p className="text-4xl tracking-widest font-bold">
                      {header.split(" ")[1]} {header.split(" ")[2]}
                    </p>
                  </div>
                  {/* <p className="mt-2 inline-block bg-linear-to-r from-[#B0FAFF] to-[#4CE4CD] px-4 py-1 shadow-lg font-bold text-xs">
                    PROUDLY PRESENTED TO
                  </p> */}
                  <svg viewBox="10 10 350 80" className="w-60">
                    <defs>
                      <linearGradient
                        id="ribbonGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#B0FAFF" />
                        <stop offset="100%" stopColor="#4CE4CD" />
                      </linearGradient>
                    </defs>
                    <path
                      className="shadow-lg shadow-gray-500"
                      d="M20,20 L270,20 L260,40 L270,60 L20,60 L30,40 Z"
                      fill="url(#ribbonGradient)"
                    />

                    <text
                      x="42%"
                      y="50%"
                      dominantBaseline="middle"
                      textAnchor="middle"
                      fill="black"
                      fontSize="14"
                      fontWeight="600"
                      letterSpacing="1"
                    >
                      PROUDLY PRESENTED TO
                    </text>
                  </svg>
                </div>
              </div>

              <div className="space-y-6 font-[Montserrat]">
                <div className="border-b border-black">
                  <h2
                    style={{ fontSize: "clamp(18px, 2.5vw, 32px)" }}
                    className="font-semibold text-gray-800 uppercase"
                  >
                    {recipientName || "Recipient Name"}
                  </h2>
                </div>

                <div className="space-y-3">
                  <p className="text-sm/4">
                    {description} <b>{courseTitle}</b>. Thank you for joining
                    our community to learn, connect, and help us{" "}
                    <span className="text-[#04B8A0] font-semibold">
                      #BreakThePattern
                    </span>{" "}
                    in the technology industry.
                  </p>
                </div>
              </div>

              <div className="space-y-4 flex flex-col items-end">
                <div className="flex justify-between gap-10 items-center">
                  <div className="flex-1 min-w-42.5 text-center">
                    <div className="mx-auto mb-2 h-16 w-32 border-b border-black flex items-end justify-center">
                      {signatureUrl1 && (
                        <img
                          src={signatureUrl1}
                          alt={signatoryName1}
                          className="w-24 h-16 object-contain"
                          style={{ marginBottom: -12 }}
                        />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {signatoryName1}
                    </p>
                    <p className="text-[9px] tracking-tight text-slate-500">
                      {signatoryTitle1}
                    </p>
                  </div>

                  <div className="flex-1 min-w-42.5 text-center">
                    <div className="mx-auto mb-2 h-16 w-32 border-b border-black flex items-end justify-center">
                      {signatureUrl2 && (
                        <img
                          src={signatureUrl2}
                          alt={signatoryName2}
                          className="w-24 h-16 object-contain"
                          style={{ marginBottom: -12 }}
                        />
                      )}
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {signatoryName2}
                    </p>
                    <p className="text-[9px] tracking-tight text-slate-500">
                      {signatoryTitle2}
                    </p>
                  </div>
                </div>

                <div className="flex self-end">
                  <p className="text-xs text-[#04B8A0]">
                    {formattedDate} | Ogbomoso, Oyo State
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}