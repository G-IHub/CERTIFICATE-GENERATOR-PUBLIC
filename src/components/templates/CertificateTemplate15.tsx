import { useRef, useEffect } from "react";
import medal from "../../assets/iwdAward.png";
import type { Logo } from "../../App";

interface CertificateTemplate15Props {
  header?: string;
  courseTitle?: string;
  description?: string;
  date?: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[];
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate15({
  header = "CERTIFICATE",
  courseTitle = "OF APPRECIATION",
  description = "In recognition of your outstanding participation, dedication, and contribution toward the success of the International Women's Day Conference.",
  date = "2026-03-08",
  recipientName = "Recipient Name",
  isPreview = false,
  organizationName = "Women Techmakers Ogbomoso",
  organizationLogo,
  organizationLogos,
  signatoryName1 = "Boluwatife Adebisi",
  signatoryTitle1 = "WTM Ogbomoso Ambassador",
  signatureUrl1,
  signatoryName2 = "Deborah Opakunle",
  signatoryTitle2 = "WTM IWD'26 Organiser",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate15Props) {
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

  // Determine which logo(s) to use
  const logo1 = organizationLogos && organizationLogos[0]?.url
    ? organizationLogos[0]
    : null;
  const logo2 = organizationLogos && organizationLogos[1]?.url
    ? organizationLogos[1]
    : null;
  const fallbackLogo = organizationLogo;

    return (
    <div
      ref={ref}
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="w-[800px] h-[600px] shadow-lg bg-white relative overflow-hidden font-[Montserrat] flex justify-center items-center py-16">
        {/* middle curve */}
        <svg viewBox="0 0 1000 400" className="absolute top-10 left-0 w-full">
          <path d="M0,250 Q500,25 1000,250 L1000,0 L0,0 Z" fill="#E8E8E7" />
        </svg>
        {/* top curves */}
        <svg viewBox="0 0 1000 300" className="absolute top-3 left-0 w-full">
          <path d="M0,100 Q500,250 1000,100 L1000,0 L0,0 Z" fill="#E8E8E7" />
        </svg>
        <svg viewBox="0 0 1000 300" className="absolute top-1 left-0 w-full">
          <path d="M0,100 Q500,250 1000,100 L1000,0 L0,0 Z" fill="#929292" />
        </svg>
        <svg viewBox="0 0 1000 300" className="absolute top-0 left-0 w-full">
          <defs>
            <linearGradient id="topGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#24296C" />
              <stop offset="50%" stopColor="#20225C" />
              <stop offset="100%" stopColor="#1D1F55" />
            </linearGradient>
          </defs>
          <path
            d="M0,100 Q500,250 1000,100 L1000,0 L0,0 Z"
            fill="url(#topGradient)"
          />
        </svg>
        {/* bottom curve */}
        <svg viewBox="0 0 1000 300" className="absolute bottom-4 left-0 w-full">
          <path
            d="M0,100 Q500,350 1000,100 L1000,300 L0,300 Z"
            fill="#E8E8E7"
          />
        </svg>
        <svg viewBox="0 0 1000 300" className="absolute bottom-0 left-0 w-full">
          <path
            d="M0,100 Q500,350 1000,100 L1000,300 L0,300 Z"
            fill="#93C5A7"
          />
        </svg>

        <div className="relative z-10 h-full flex flex-col justify-between max-w-lg text-center">
          <div>
            <div className="text-white uppercase text-center">
              <h1 className="text-6xl/10 font-bold">{header.split(" ")[0]}</h1>
              <p className="text-2xl tracking-widest font-bold">
                {header.split(" ")[1]} {header.split(" ")[2]}
              </p>
            </div>
            <div className="mt-12">
              <p className="font-semibold text-xs">
                Volunteer Service Award - IWD 2026 Conference
              </p>
              {/* <div className="bg-linear-to-l from-[#E4B34A] to-[#FEF7B1] px-6 py-2 text-sm shadow-md shadow-gray-500 font-semibold tracking-wide">
                PROUDLY PRESENTED TO
              </div> */}
              <svg viewBox="0 10 300 80" className="w-60 mx-auto">
                <defs>
                  <linearGradient
                    id="ribbonGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="0%"
                  >
                    <stop offset="0%" stopColor="#FEF7B1" />
                    <stop offset="100%" stopColor="#E4B34A" />
                  </linearGradient>
                </defs>
                <path
                  className="shadow-md shadow-gray-500"
                  d="M20,20 L280,20 L260,40 L280,60 L20,60 L40,40 Z"
                  fill="url(#ribbonGradient)"
                />

                <text
                  x="50%"
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
          <div className="space-y-4">
            <p className="font-bold pb-2 text-gray-800 text-3xl border-b border-black w-auto uppercase">
              {recipientName}
            </p>
            <p className="leading-3.5 text-xs text-center">
              {description} <b>{courseTitle}</b>. Your behind-the-scenes
              commitment was instrumental in making this event a massive success
              and empowering our community to{" "}
              <span className="text-[#1D1F55] font-semibold">
                #Break the Pattern
              </span>
            </p>
          </div>

          {/* FOOTER */}
          <div className="flex justify-between items-end text-center mb-18 relative">
            {/* SIGNATORY 1 */}
            <div>
              <div className="mx-auto mb-1 h-12 w-32 border-b border-gray-400 flex items-end justify-center">
                {signatureUrl1 && (
                  <img
                    src={signatureUrl1}
                    alt={signatoryName1}
                    className="w-24 h-12 object-contain"
                    style={{ marginBottom: -8 }}
                  />
                )}
              </div>
              <p className="text-sm tracking-wide font-semibold">
                {signatoryName1}
              </p>
              <p className="text-[9px] tracking-tighter text-gray-500">
                {signatoryTitle1}
              </p>
            </div>

            <div className="w-[22%] absolute aspect-square flex left-50 -bottom-14 z-60 items-center justify-center font-[Montserrat]">
              <svg
                viewBox="0 0 200 200"
                className="absolute inset-0 w-full h-full"
              >
                <path
                  id="circlePath"
                  d="M 100,100
        m -85,0
        a 85,85 0 1,1 170,0
        a 85,85 0 1,1 -170,0"
                  fill="transparent"
                />
                <text
                  fill="#3B82F6"
                  fontSize="12"
                  fontWeight="600"
                  letterSpacing="2"
                >
                  <textPath
                    href="#circlePath"
                    startOffset="50%"
                    textAnchor="end"
                  >
                    INTERNATIONAL WOMEN'S DAY
                  </textPath>
                </text>
              </svg>
              <div className="w-[70%] aspect-square rounded-full bg-radial from-[#F6F3DE] to-[#F7E595] flex items-center justify-center shadow-inner">
                <img
                  alt="medalsvg"
                  src={medal}
                  className="absolute -bottom-3 w-11/12 h-full object-contain"
                />
          <div className="flex">
            {/* First Logo */}
            {logo1 ? (
              <div className="flex items-center">
                <img
                  src={logo1.url}
                  alt={logo1.name || "Logo"}
                  className="absolute inset-[29.5%] w-[42%] h-[43%] object-contain"
                  
                />
              </div>
            ) : fallbackLogo ? (
              <img
                src={fallbackLogo}
                alt="Logo"
                className="absolute inset-[29.5%] w-[42%] h-[43%] object-contain"
                
              />
            ) : null}

            {/* Second Logo */}
            {logo2 ? (
              <div className="flex items-center ml-2">
                <img
                  src={logo2.url}
                  alt="Logo"
                  className="absolute inset-[29.5%] w-[42%] h-[43%] object-contain"
                  
                />
              </div>
            ) : (
              <div className="hidden"></div>
            )}
          </div>
              </div>
            </div>
            {/* SIGNATORY 2 */}
            <div>
              <div className="mx-auto mb-1 h-12 w-32 border-b border-gray-400 flex items-end justify-center">
                {signatureUrl2 && (
                  <img
                    src={signatureUrl2}
                    alt={signatoryName2}
                    className="w-24 h-12 object-contain"
                    style={{ marginBottom: -8 }}
                  />
                )}
              </div>
              <p className="text-sm tracking-wide font-semibold">
                {signatoryName2}
              </p>
              <p className="text-[9px] tracking-tighter text-gray-500">
                {signatoryTitle2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}