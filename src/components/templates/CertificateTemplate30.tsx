import { useRef, useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";

interface CertificateTemplate30Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[];
  organizationSlogan?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
  certificateId?: string;
  themeColors?: ThemeColors;
}

export default function CertificateTemplate30({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  organizationLogos,
  organizationSlogan = "slogan text here",
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
  certificateId,
  themeColors,
}: CertificateTemplate30Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "playfair-lato-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800&family=Lato:wght@300;400;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const logosToDisplay = organizationLogos || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        height: "600px",
        position: "relative",
        background: "#ffffff",
        fontFamily: "'Lato', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Medical cross pattern background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
            radial-gradient(circle, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "34px 34px",
          backgroundPosition: "0 0, 17px 17px",
        }}
      />

      {/* Left accent bar with medical cross */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "11px",
          background: "linear-gradient(180deg, #10b981 0%, #059669 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: "18px",
            color: "#ffffff",
            writingMode: "vertical-rl",
            letterSpacing: "5px",
          }}
        >
          ✚
        </div>
      </div>

      {/* Right accent bar */}
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: "11px",
          background: "linear-gradient(180deg, #3b82f6 0%, #2563eb 100%)",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(180deg)",
            fontSize: "18px",
            color: "#ffffff",
            writingMode: "vertical-rl",
            letterSpacing: "5px",
          }}
        >
          ✚
        </div>
      </div>

      {/* Top decorative border */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "11px",
          right: "11px",
          height: "7px",
          background: "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
        }}
      />

      {/* Bottom decorative border */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: "11px",
          right: "11px",
          height: "7px",
          background: "linear-gradient(90deg, #3b82f6 0%, #10b981 100%)",
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "32px 46px",
        }}
      >
        {/* Top decorative emblem */}
        <div
          style={{
            position: "absolute",
            top: "-16px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "57px",
            height: "57px",
            background: "radial-gradient(circle, #ffffff 0%, #f0fdf4 100%)",
            borderRadius: "50%",
            border: "2px solid #10b981",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 3px 11px rgba(16, 185, 129, 0.2)",
          }}
        >
          <div
            style={{
              fontSize: "27px",
              color: "#10b981",
            }}
          >
            ⚕
          </div>
        </div>

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "52px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "16px" : "0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logosToDisplay.map((logo, index) => (
              <div
                key={index}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "#ffffff",
                  border: "1px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  boxShadow: "0 2px 7px rgba(16, 185, 129, 0.15)",
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

        {/* Organization Name */}
        <div
          style={{
            position: "absolute",
            top: hasLogos ? "96px" : "55px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 700,
            color: "#065f46",
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            fontFamily: "'Playfair Display', serif",
          }}
        >
          {organizationName}
        </div>

        {/* Main content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "615px",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "23px",
              fontWeight: 800,
              color: "#10b981",
              marginBottom: "14px",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {header}
          </div>

          {/* Decorative separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              marginBottom: "15px",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #10b981)",
              }}
            />
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "1px solid #10b981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#ffffff",
              }}
            >
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10b981",
                }}
              />
            </div>
            <div
              style={{
                width: "68px",
                height: "1px",
                background: "linear-gradient(90deg, #10b981, transparent)",
              }}
            />
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: 400,
              marginBottom: "11px",
              letterSpacing: "0.9px",
            }}
          >
            This is to certify that
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "31px",
              fontWeight: 700,
              color: "#047857",
              marginBottom: "17px",
              letterSpacing: "0.2px",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: 400,
              marginBottom: "10px",
              letterSpacing: "0.7px",
            }}
          >
            Has successfully completed the program
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 700,
              color: "#1f2937",
              marginBottom: "15px",
              letterSpacing: "0.2px",
              lineHeight: "1.3",
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {courseTitle}
          </div>

          {/* Description */}
          {description && (
            <p
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "black",
                margin: "10px 20px",
                lineHeight: "1.4",
                wordWrap: "break-word",
              }}
            >
              {description ||
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio commodi incidunt harum, doloremque reprehenderit voluptas aspernatu"}
            </p>
          )}
        </div>

        {/* Bottom Section */}
        <div
          style={{
            position: "absolute",
            bottom: "23px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            padding: "0 23px",
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
                    color: "#6b7280",
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
                    color: "#6b7280",
                    fontWeight: 400,
                  }}
                >
                  {signatoryTitle2}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Certificate ID */}
        {certificateId && (
          <div
            style={{
              position: "absolute",
              bottom: "7px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "7px",
              color: "#9ca3af",
              letterSpacing: "0.7px",
              fontWeight: 400,
            }}
          >
            Certificate ID: {certificateId}
          </div>
        )}
      </div>
    </div>
  );
}
