import React, { useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate20Props {
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

export default function CertificateTemplate20({
  header,
  courseTitle,
  description = "For exceptional achievement in cybersecurity, blockchain technology, and digital innovation.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  organizationName = "Tech Academy",
  organizationLogo,
  organizationLogos,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
}: CertificateTemplate20Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const id = "orbitron-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap";
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
        className="relative flex flex-col justify-between shadow-lg overflow-hidden"
        style={{
          width: "800px",
          height: "600px",
          background: "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)",
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(0deg, #00ffff 0px, transparent 1px, transparent 30px),
                            repeating-linear-gradient(90deg, #00ffff 0px, transparent 1px, transparent 30px)`,
            backgroundSize: '30px 30px'
          }}></div>
        </div>

        {/* Neon Glow Effects */}
        <div className="absolute top-0 left-0 w-60 h-60 bg-cyan-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-purple-500 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-10"></div>

        {/* Top Border with Neon Effect */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
        <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-transparent via-cyan-400 to-transparent"></div>
        <div className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-transparent via-purple-400 to-transparent"></div>

        {/* Corner Accents */}
        <div className="absolute top-5 left-5 w-10 h-10 border-l-2 border-t-2 border-cyan-400"></div>
        <div className="absolute top-5 right-5 w-10 h-10 border-r-2 border-t-2 border-cyan-400"></div>
        <div className="absolute bottom-5 left-5 w-10 h-10 border-l-2 border-b-2 border-purple-400"></div>
        <div className="absolute bottom-5 right-5 w-10 h-10 border-r-2 border-b-2 border-purple-400"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-12 py-10 text-center">
          {/* Logo Section */}
          <div className="mb-4">
            {(logo1 || logo2) && (
              <div className="flex gap-3 items-center justify-center mb-2">
                {logo1 && (
                  <img src={logo1.url} alt={logo1.name} className="h-8 object-contain" />
                )}
                {logo2 && (
                  <img src={logo2.url} alt={logo2.name} className="h-8 object-contain" />
                )}
              </div>
            )}
            {organizationLogo && !logo1 && !logo2 && (
              <img src={organizationLogo} alt="Logo" className="h-8 mx-auto mb-2" />
            )}
            <div className="text-cyan-400 text-xs font-semibold tracking-widest uppercase" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {organizationName}
            </div>
          </div>

          {/* Certificate Header */}
          <div className="mb-3">
            <h1 className="text-2xl font-black uppercase tracking-wider mb-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
                style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {header}
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>

          {/* Presented To */}
          <div className="mb-4">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Presented to</p>
            <h2 className="text-xl font-bold text-white mb-1" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {recipientName}
            </h2>
          </div>

          {/* Course Title */}
          <div className="mb-3">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">For completing</p>
            <h3 className="text-lg font-bold text-cyan-300 mb-2" style={{ fontFamily: "'Orbitron', sans-serif" }}>
              {courseTitle}
            </h3>
            {description && (
              <p className="text-gray-300 text-xs max-w-md mx-auto leading-relaxed">
                {description}
              </p>
            )}
          </div>

          {/* Date */}
          <div className="mb-4">
            <p className="text-cyan-400 text-xs font-medium tracking-wide">{formattedDate}</p>
          </div>

          {/* Signatures */}
          <div className="flex justify-center gap-10 w-full max-w-lg">
            {signatoryName1 && (
              <div className="flex flex-col items-center">
                {signatureUrl1 && (
                  <img src={signatureUrl1} alt="Signature" className="h-10 mb-1" />
                )}
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-cyan-400 to-transparent mb-1"></div>
                <p className="text-white font-semibold text-xs">{signatoryName1}</p>
                {signatoryTitle1 && (
                  <p className="text-gray-400 text-[10px] uppercase tracking-wide">{signatoryTitle1}</p>
                )}
              </div>
            )}
            {signatoryName2 && (
              <div className="flex flex-col items-center">
                {signatureUrl2 && (
                  <img src={signatureUrl2} alt="Signature" className="h-10 mb-1" />
                )}
                <div className="h-px w-24 bg-gradient-to-r from-transparent via-purple-400 to-transparent mb-1"></div>
                <p className="text-white font-semibold text-xs">{signatoryName2}</p>
                {signatoryTitle2 && (
                  <p className="text-gray-400 text-[10px] uppercase tracking-wide">{signatoryTitle2}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Tech Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 640 50">
            <path d="M0,25 L640,25" stroke="#00ffff" strokeWidth="0.5" fill="none" />
            <path d="M0,30 L640,30" stroke="#00ffff" strokeWidth="0.3" fill="none" opacity="0.5" />
            <path d="M0,20 L640,20" stroke="#00ffff" strokeWidth="0.3" fill="none" opacity="0.5" />
          </svg>
        </div>
      </div>
    </div>
  );
}