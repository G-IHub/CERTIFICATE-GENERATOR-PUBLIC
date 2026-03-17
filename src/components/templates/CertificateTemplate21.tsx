import React, { useRef, useEffect } from "react";
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
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

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

  const logosToDisplay = organizationLogos || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div>
      <div
        ref={ref}
        style={{
          width: "800px",
          height: "600px",
          position: "relative",
          background: "white",
          fontFamily: "'Inter', sans-serif",
          overflow: "hidden",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {/* Medical Cross Pattern Background */}
        <div className="absolute inset-0 opacity-5">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(i % 4) * 25}%`,
                top: `${Math.floor(i / 4) * 33}%`,
                width: "40px",
                height: "40px",
              }}
            >
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
            <circle
              cx="60"
              cy="60"
              r="50"
              fill="none"
              stroke="#0d9488"
              strokeWidth="3"
            />
            <rect x="52" y="30" width="16" height="60" fill="#0d9488" />
            <rect x="30" y="52" width="60" height="16" fill="#0d9488" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-20 py-16">
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
                <div
                  key={index}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "5px",
                    background: "rgba(59, 130, 246, 0.1)",
                    border: "0.5px solid rgba(59, 130, 246, 0.4)",
                    display: "flex",
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
              ))}
            </div>
          )}
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
            <h1 className="text-3xl font-black uppercase text-teal-700 mb-2 tracking-wide">
              {header}
            </h1>
          </div>

          {/* Presented To */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-widest mb-3 font-semibold">
              This certifies that
            </p>
            <h2 className="text-4xl font-bold text-gray-800 mb-1">
              {recipientName}
            </h2>
            <div className="h-0.5 w-96 mx-auto bg-gradient-to-r from-transparent via-teal-500 to-transparent mt-3"></div>
          </div>

          {/* Course Title */}
          <div className="mb-6 text-center">
            <p className="text-gray-600 text-sm uppercase tracking-widest mb-3 font-semibold">
              has successfully completed
            </p>
            <h3 className="text-3xl font-bold text-teal-600 mb-4">
              {courseTitle}
            </h3>
            {description && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: "12px",
                  color: "black",
                  margin: "10px 20px",
                  lineHeight: "1.4",
                  wordWrap: "break-word",
                  maxWidth: "28%",
                  marginLeft: "auto",
                  marginRight: "auto",
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
                    className="w-24 h-16"
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
                  color: "#1f2937",
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
                    className="w-24 h-16"
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
                  color: "#1f2937",
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
