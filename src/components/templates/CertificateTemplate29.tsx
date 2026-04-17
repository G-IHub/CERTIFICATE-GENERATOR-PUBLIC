import { useRef, useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";

interface CertificateTemplate29Props {
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

export default function CertificateTemplate29({
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
}: CertificateTemplate29Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "fira-code-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap";
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
        background: "#0a0e27",
        fontFamily: "'Inter', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Animated gradient background */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%)",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "18px 18px",
        }}
      />

      {/* Code-like decorative elements */}
      <div
        style={{
          position: "absolute",
          top: "23px",
          left: "23px",
          fontSize: "6px",
          color: "rgba(59, 130, 246, 0.3)",
          fontFamily: "'Fira Code', monospace",
          lineHeight: "1.8",
        }}
      >
        {`{`}
        <br />
        &nbsp;&nbsp;"achievement": true,
        <br />
        &nbsp;&nbsp;"verified": ✓<br />
        {`}`}
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "23px",
          right: "23px",
          fontSize: "6px",
          color: "rgba(168, 85, 247, 0.3)",
          fontFamily: "'Fira Code', monospace",
          lineHeight: "1.8",
        }}
      >
        {`<certificate />`}
        <br />
        {`<!-- validated -->`}
      </div>

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "27px",
          border: "0.5px solid rgba(59, 130, 246, 0.3)",
          borderRadius: "9px",
          background:
            "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
          backdropFilter: "blur(2px)",
          boxShadow:
            "0 0 23px rgba(59, 130, 246, 0.2), inset 0 0 18px rgba(59, 130, 246, 0.03)",
        }}
      >
        {/* Top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "30%",
            right: "30%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #3b82f6, #a855f7, transparent)",
          }}
        />

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

        {/* Organization Name */}
        <div
          style={{
            position: "absolute",
            top: hasLogos ? "59px" : "23px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 700,
            color: "#e0e7ff",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
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
            width: "638px",
            marginTop: "-30px",
          }}
        >
          {/* Header with bracket decoration */}
          <div style={{ position: "relative", marginBottom: "18px" }}>
            <div
              style={{
                fontSize: "7px",
                color: "rgba(59, 130, 246, 0.6)",
                fontFamily: "'Fira Code', monospace",
                marginBottom: "3px",
              }}
            >
              {"<"}
            </div>
            <div
              style={{
                fontSize: "22px",
                fontWeight: 800,
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                letterSpacing: "1.4px",
                textTransform: "uppercase",
              }}
            >
              {header}
            </div>
            <div
              style={{
                fontSize: "7px",
                color: "rgba(168, 85, 247, 0.6)",
                fontFamily: "'Fira Code', monospace",
                marginTop: "3px",
              }}
            >
              {"/>"}
            </div>
          </div>

          {/* Decorative separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "10px", color: "rgba(59, 130, 246, 0.5)" }}>
              ◆
            </div>
            <div
              style={{
                width: "91px",
                height: "0.5px",
                background:
                  "linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.5), transparent)",
              }}
            />
            <div style={{ fontSize: "10px", color: "rgba(168, 85, 247, 0.5)" }}>
              ◆
            </div>
            <div
              style={{
                width: "91px",
                height: "0.5px",
                background:
                  "linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.5), transparent)",
              }}
            />
            <div style={{ fontSize: "10px", color: "rgba(59, 130, 246, 0.5)" }}>
              ◆
            </div>
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "10px",
              color: "rgba(226, 232, 240, 0.7)",
              fontWeight: 400,
              marginBottom: "11px",
              letterSpacing: "0.9px",
            }}
          >
            THIS CERTIFICATE IS PROUDLY AWARDED TO
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "30px",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "16px",
              letterSpacing: "0.5px",
              textShadow: "0 0 9px rgba(59, 130, 246, 0.4)",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "rgba(226, 232, 240, 0.7)",
              fontWeight: 400,
              marginBottom: "10px",
              letterSpacing: "0.7px",
            }}
          >
            For Exceptional Achievement In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "19px",
              fontWeight: 700,
              background:
                "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #a855f7 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "14px",
              letterSpacing: "0.2px",
              lineHeight: "1.3",
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
                color: "white",
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

        {/* Certificate ID */}
        {certificateId && (
          <div
            style={{
              position: "absolute",
              bottom: "11px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "7px",
              color: "rgba(100, 116, 139, 0.6)",
              letterSpacing: "0.9px",
              fontWeight: 400,
              fontFamily: "'Fira Code', monospace",
            }}
          >
            ID: {certificateId}
          </div>
        )}

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "30%",
            right: "30%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #a855f7, #3b82f6, transparent)",
          }}
        />
      </div>
    </div>
  );
}
