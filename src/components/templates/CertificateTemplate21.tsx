import React, { useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate21Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
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

export default function CertificateTemplate21({
  header,
  courseTitle,
  description = "For outstanding achievement in healthcare excellence, medical innovation, and patient care.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  organizationName = "Medical Institute",
  organizationLogo,
  organizationLogos,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
}: CertificateTemplate21Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const id = "lato-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700;900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const logo1 = organizationLogos?.[0];
  const logo2 = organizationLogos?.[1];

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="relative flex flex-col justify-between shadow-xl bg-white overflow-hidden"
        style={{
          width: "800px",
          height: "600px",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {/* Medical Cross Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="absolute" style={{
              left: `${(i % 4) * 25}%`,
              top: `${Math.floor(i / 4) * 33}%`,
              width: '40px',
              height: '40px',
            }}>
              <div className="absolute w-4 h-16 bg-teal-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute w-16 h-4 bg-teal-600 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
          ))}
        </div>

        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-500"></div>
        
        {/* Side Medical Symbol */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 opacity-10">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#0d9488" strokeWidth="3" />
            <rect x="52" y="30" width="16" height="60" fill="#0d9488" />
            <rect x="30" y="52" width="60" height="16" fill="#0d9488" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-20 py-16">
          {/* Logo Section */}
          <div className="mb-8">
            {(logo1 || logo2) && (
              <div className="flex gap-6 items-center justify-center mb-4">
                {logo1 && (
                  <img src={logo1.url} alt={logo1.name} className="h-20 object-contain" />
                )}
                {logo2 && (
                  <img src={logo2.url} alt={logo2.name} className="h-20 object-contain" />
                )}
              </div>
            )}
            {organizationLogo && !logo1 && !logo2 && (
              <img src={organizationLogo} alt="Logo" className="h-20 mx-auto mb-4" />
            )}
            <div className="text-teal-700 text-xl font-bold tracking-wide uppercase">
              {organizationName}
            </div>
          </div>

          {/* Medical Symbol Divider */}
          <div className="mb-6 flex items-center gap-4">
            <div className="h-px w-24 bg-gradient-to-r from-transparent to-teal-500"></div>
            <svg width="40" height="40" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="18" fill="#0d9488" />
              <rect x="17" y="10" width="6" height="20" fill="white" />
              <rect x="10" y="17" width="20" height="6" fill="white" />
            </svg>
            <div className="h-px w-24 bg-gradient-to-l from-transparent to-teal-500"></div>
          </div>

          {/* Certificate Header */}
          <div className="mb-8 text-center">
            <h1 className="text-5xl font-black uppercase text-teal-700 mb-2 tracking-wide">
              {header}
            </h1>
          </div>

          {/* Presented To */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-widest mb-3 font-semibold">This certifies that</p>
            <h2 className="text-4xl font-bold text-gray-800 mb-1">
              {recipientName}
            </h2>
            <div className="h-0.5 w-96 mx-auto bg-gradient-to-r from-transparent via-teal-500 to-transparent mt-3"></div>
          </div>

          {/* Course Title */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-widest mb-3 font-semibold">has successfully completed</p>
            <h3 className="text-3xl font-bold text-teal-600 mb-4">
              {courseTitle}
            </h3>
            {description && (
              <p className="text-gray-700 text-base max-w-2xl mx-auto leading-relaxed italic">
                {description}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="mb-10 mt-6">
            <div className="inline-block px-8 py-3 border-2 border-teal-500 rounded-full">
              <p className="text-teal-700 text-base font-bold tracking-wide">{formattedDate}</p>
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-center gap-24 w-full max-w-3xl mt-4">
            {signatoryName1 && (
              <div className="flex flex-col items-center">
                {signatureUrl1 && (
                  <img src={signatureUrl1} alt="Signature" className="h-16 mb-2" />
                )}
                <div className="h-0.5 w-52 bg-teal-600 mb-2"></div>
                <p className="text-gray-800 font-bold text-sm">{signatoryName1}</p>
                {signatoryTitle1 && (
                  <p className="text-gray-600 text-xs uppercase tracking-wide mt-1">{signatoryTitle1}</p>
                )}
              </div>
            )}
            {signatoryName2 && (
              <div className="flex flex-col items-center">
                {signatureUrl2 && (
                  <img src={signatureUrl2} alt="Signature" className="h-16 mb-2" />
                )}
                <div className="h-0.5 w-52 bg-teal-600 mb-2"></div>
                <p className="text-gray-800 font-bold text-sm">{signatoryName2}</p>
                {signatoryTitle2 && (
                  <p className="text-gray-600 text-xs uppercase tracking-wide mt-1">{signatoryTitle2}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-cyan-500 via-teal-500 to-teal-600"></div>

        {/* Corner Accents */}
        <div className="absolute top-8 left-8 w-20 h-20 border-l-4 border-t-4 border-teal-500 opacity-50"></div>
        <div className="absolute top-8 right-8 w-20 h-20 border-r-4 border-t-4 border-teal-500 opacity-50"></div>
        <div className="absolute bottom-8 left-8 w-20 h-20 border-l-4 border-b-4 border-teal-500 opacity-50"></div>
        <div className="absolute bottom-8 right-8 w-20 h-20 border-r-4 border-b-4 border-teal-500 opacity-50"></div>
      </div>
    </div>
  );
}