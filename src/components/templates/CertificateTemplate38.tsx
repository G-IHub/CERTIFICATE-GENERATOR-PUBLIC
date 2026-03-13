import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate38Props {
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
}

export default function CertificateTemplate38({
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
}: CertificateTemplate38Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "merriweather-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&family=Open+Sans:wght@300;400;600;700;800&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const logosToDisplay =
    organizationLogos?.filter((logo) => logo.selected) || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        height: "600px",
        position: "relative",
        background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        fontFamily: "'Open Sans', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Professional grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(148, 163, 184, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(148, 163, 184, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "23px 23px",
        }}
      />

      {/* Subtle corner gradients */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "182px",
          height: "182px",
          background:
            "radial-gradient(circle at top left, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "182px",
          height: "182px",
          background:
            "radial-gradient(circle at bottom right, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "23px",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          boxShadow: "0 9px 23px rgba(0, 0, 0, 0.5)",
        }}
      >
        {/* Professional borders */}
        <div
          style={{
            position: "absolute",
            inset: "11px",
            border: "1px solid #cbd5e1",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "3px",
              border: "0.25px solid #e2e8f0",
            }}
          />
        </div>

        {/* Corner accents */}
        {[
          { top: "7px", left: "7px" },
          { top: "7px", right: "7px" },
          { bottom: "7px", left: "7px" },
          { bottom: "7px", right: "7px" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: "27px",
              height: "27px",
              border: "1px solid #3b82f6",
              borderRight: i % 2 === 0 ? "none" : undefined,
              borderLeft: i % 2 === 1 ? "none" : undefined,
              borderBottom: i < 2 ? "none" : undefined,
              borderTop: i >= 2 ? "none" : undefined,
            }}
          />
        ))}

        {/* Professional seal */}
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "41px",
            height: "41px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "50%",
            border: "2px solid #f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 11px rgba(59, 130, 246, 0.4)",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              border: "1px solid rgba(255, 255, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "19px",
            }}
          >
            🏆
          </div>
        </div>

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "41px",
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
                  width: "35px",
                  height: "35px",
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 2px 7px rgba(0, 0, 0, 0.1)",
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
            top: hasLogos ? "87px" : "41px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 800,
            color: "#1e293b",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            fontFamily: "'Merriweather', serif",
          }}
        >
          {organizationName}
        </div>

        {/* Divider line */}
        <div
          style={{
            position: "absolute",
            top: hasLogos ? "109px" : "64px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "137px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, #3b82f6, transparent)",
          }}
        />

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
              fontSize: "24px",
              fontWeight: 900,
              color: "#1e40af",
              marginBottom: "16px",
              letterSpacing: "2.7px",
              textTransform: "uppercase",
              fontFamily: "'Merriweather', serif",
            }}
          >
            {header}
          </div>

          {/* Professional separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "0.5px",
                background: "linear-gradient(90deg, transparent, #94a3b8)",
              }}
            />
            <div
              style={{
                width: "16px",
                height: "16px",
                background: "#3b82f6",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "0.5px",
                background: "linear-gradient(90deg, #94a3b8, transparent)",
              }}
            />
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "10px",
              color: "#475569",
              fontWeight: 600,
              marginBottom: "13px",
              letterSpacing: "1.1px",
              textTransform: "uppercase",
            }}
          >
            This Certificate is Proudly Presented To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "31px",
              fontWeight: 900,
              color: "#1e293b",
              marginBottom: "18px",
              letterSpacing: "0.5px",
              fontFamily: "'Merriweather', serif",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "#475569",
              fontWeight: 600,
              marginBottom: "11px",
              letterSpacing: "0.9px",
            }}
          >
            For Distinguished Achievement In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 700,
              color: "#1e40af",
              marginBottom: "15px",
              letterSpacing: "0.2px",
              lineHeight: "1.3",
            }}
          >
            {courseTitle}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "10px",
                color: "#64748b",
                fontWeight: 500,
                maxWidth: "525px",
                margin: "0 auto",
                lineHeight: "1.8",
              }}
            >
              {description}
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            padding: "0 64px",
          }}
        >
          {/* Date */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                padding: "8px 15px",
                background: "#ffffff",
                border: "1px solid #cbd5e1",
                boxShadow: "0 2px 7px rgba(0, 0, 0, 0.1)",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  color: "#64748b",
                  marginBottom: "3px",
                  fontWeight: 700,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Date Issued
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 800,
                  fontFamily: "'Merriweather', serif",
                }}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Signatory 1 */}
          {signatoryName1 && (
            <div style={{ textAlign: "center" }}>
              {signatureUrl1 && (
                <div style={{ marginBottom: "7px" }}>
                  <img
                    src={signatureUrl1}
                    alt="Signature 1"
                    style={{
                      height: "23px",
                      maxWidth: "96px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "96px",
                  height: "1px",
                  background: "#94a3b8",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "3px",
                  fontFamily: "'Merriweather', serif",
                }}
              >
                {signatoryName1}
              </div>
              {signatoryTitle1 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#64748b",
                    fontWeight: 600,
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
                <div style={{ marginBottom: "7px" }}>
                  <img
                    src={signatureUrl2}
                    alt="Signature 2"
                    style={{
                      height: "23px",
                      maxWidth: "96px",
                      objectFit: "contain",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "96px",
                  height: "1px",
                  background: "#94a3b8",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "3px",
                  fontFamily: "'Merriweather', serif",
                }}
              >
                {signatoryName2}
              </div>
              {signatoryTitle2 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#64748b",
                    fontWeight: 600,
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
              bottom: "14px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "8px",
              color: "#94a3b8",
              letterSpacing: "0.9px",
              fontWeight: 600,
            }}
          >
            Certificate ID: {certificateId}
          </div>
        )}

        {/* Professional badge bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "-11px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "34px",
            height: "34px",
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            borderRadius: "50%",
            border: "2px solid #f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 11px rgba(59, 130, 246, 0.4)",
          }}
        >
          <div
            style={{
              fontSize: "16px",
            }}
          >
            ✓
          </div>
        </div>
      </div>
    </div>
  );
}