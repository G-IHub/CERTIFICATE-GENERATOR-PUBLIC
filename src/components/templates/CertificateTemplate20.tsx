import React, { useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
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
  themeColors?: ThemeColors;
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
  themeColors,
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

  const logosToDisplay = organizationLogos || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="relative flex flex-col justify-between shadow-lg overflow-hidden"
        style={{
          width: "800px",
          height: "600px",
          background:
            "linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0a0e27 100%)",
          fontFamily: "'Rajdhani', sans-serif",
        }}
      >
        {/* Cyber Grid Background */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `repeating-linear-gradient(0deg, #00ffff 0px, transparent 1px, transparent 30px),
                            repeating-linear-gradient(90deg, #00ffff 0px, transparent 1px, transparent 30px)`,
              backgroundSize: "30px 30px",
            }}
          ></div>
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

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "14px" : "0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logosToDisplay.map((logo, index) => (
              <div className="flex flex-col items-center gap-2">
                <div
                  key={index}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "5px",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "0.5px solid rgba(59, 130, 246, 0.4)",
                    display: "flex",
                    // flexDirection: "column",
                    // color: "white",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "5px",
                    boxShadow: "0 0 7px rgba(59, 130, 246, 0.2)",
                  }}
                >
                  <img
                    src={logo.url}
                    alt={`Logo ${index + 1}`}
                    style={{
                      maxWidth: "100%",
                      maxHeight: "100%",
                      objectFit: "contain",
                    }}
                  />
                </div>
                <p className="text-xs font-thin text-white">{logo.name} </p>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div className=" z-10 flex flex-col items-center justify-center flex-1 px-12 py-10 text-center">
          {/* Organization Name */}
          {/* <div className="mb-4 -mt-30">
            <div
              className="text-cyan-400 text-xs font-semibold tracking-widest uppercase"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {organizationName}
            </div>
          </div> */}

          {/* Certificate Header */}
          <div className="-mt-35">
            <h1
              className="text-4xl font-black uppercase tracking-wider mb-1 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {header}
            </h1>
            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>
          </div>

          {/* Presented To */}
          <div className="my-4 ">
            <p className="text-gray-400 text-sm uppercase tracking-widest mb-1">
              Presented to
            </p>
            <h2
              className="text-2xl font-bold text-white mb-1"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {recipientName}
            </h2>
          </div>

          {/* Course Title */}
          <div className="mb-3 ">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">
              For completing
            </p>
            <h3
              className="text-lg font-bold text-cyan-300 mb-2"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              {courseTitle}
            </h3>
            {/* Description */}
            {description && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "14px",
                  color: "white",
                  margin: "10px 20px",
                  lineHeight: "1.4",
                  wordWrap: "break-word",
                  marginLeft: "auto",
                  marginRight: "auto",
                  maxWidth: "85%",
                }}
              >
                {description ||
                  "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio commodi incidunt harum, doloremque reprehenderit voluptas aspernatu"}
              </p>
            )}
          </div>
        </div>

        {/* Bottom Section */}
        <div
          style={{
            position: "absolute",
            bottom: "27px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            padding: "0 57px",
          }}
        >
          {/* Date */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "8px",
                color: "rgba(148, 163, 184, 0.8)",
                marginBottom: "5px",
                fontWeight: 500,
                letterSpacing: "0.7px",
                textTransform: "uppercase",
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {"// date"}
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#60a5fa",
                fontWeight: 600,
                fontFamily: "'Fira Code', monospace",
              }}
            >
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
              })}
            </div>
          </div>

          {/* Signatory 1 */}
          {signatoryName1 && (
            <div style={{ textAlign: "center" }}>
              {signatureUrl1 && (
                <div style={{ marginBottom: "6px" }}>
                  <img
                    src={signatureUrl1}
                    alt="Signature 1"
                    className="w-32 h-16"
                    style={{
                      marginBottom: -20,
                      marginLeft: "25px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "87px",
                  height: "0.5px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  color: "#e2e8f0",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                {signatoryName1}
              </div>
              {signatoryTitle1 && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "rgba(148, 163, 184, 0.8)",
                    fontWeight: 400,
                  }}
                >
                  {signatoryTitle1}
                </div>
              )}
            </div>
          )}

          {/* Signatory 2 */}
          {signatoryName2 && (
            <div style={{ textAlign: "center" }}>
              {signatureUrl2 && (
                <div style={{ marginBottom: "6px" }}>
                  <img
                    src={signatureUrl2}
                    alt="Signature 2"
                    className="w-32 h-16"
                    style={{
                      marginBottom: -20,
                      marginLeft: "25px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "87px",
                  height: "0.5px",
                  background:
                    "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent)",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  color: "#e2e8f0",
                  fontWeight: 600,
                  marginBottom: "2px",
                }}
              >
                {signatoryName2}
              </div>
              {signatoryTitle2 && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "rgba(148, 163, 184, 0.8)",
                    fontWeight: 400,
                  }}
                >
                  {signatoryTitle2}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Tech Pattern */}
        <div className="absolute bottom-0 left-0 right-0 h-12 opacity-20">
          <svg width="100%" height="100%" viewBox="0 0 640 50">
            <path
              d="M0,25 L640,25"
              stroke="#00ffff"
              strokeWidth="0.5"
              fill="none"
            />
            <path
              d="M0,30 L640,30"
              stroke="#00ffff"
              strokeWidth="0.3"
              fill="none"
              opacity="0.5"
            />
            <path
              d="M0,20 L640,20"
              stroke="#00ffff"
              strokeWidth="0.3"
              fill="none"
              opacity="0.5"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
