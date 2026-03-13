import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate37Props {
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

export default function CertificateTemplate37({
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
}: CertificateTemplate37Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "poppins-space-grotesk-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700;800&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const logosToDisplay = organizationLogos?.filter((logo) => logo.selected) || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        height: "600px",
        position: "relative",
        background: "#ffffff",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Colorful geometric shapes background */}
      <div
        style={{
          position: "absolute",
          top: "-46px",
          left: "-46px",
          width: "160px",
          height: "160px",
          borderRadius: "40% 60% 60% 40% / 40% 40% 60% 60%",
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          opacity: 0.15,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "91px",
          right: "-34px",
          width: "137px",
          height: "137px",
          borderRadius: "50%",
          background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
          opacity: 0.12,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-46px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "182px",
          height: "182px",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
          opacity: 0.13,
        }}
      />

      {/* Abstract geometric decorations */}
      <div
        style={{
          position: "absolute",
          top: "46px",
          left: "34px",
          width: "34px",
          height: "34px",
          background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
          clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
          opacity: 0.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "137px",
          right: "41px",
          width: "41px",
          height: "41px",
          background: "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          opacity: 0.25,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "80px",
          left: "46px",
          width: "32px",
          height: "32px",
          background: "linear-gradient(135deg, #14b8a6 0%, #10b981 100%)",
          clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
          opacity: 0.25,
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "25px",
          background: "#ffffff",
          border: "1px solid transparent",
          backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #14b8a6 100%)",
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          borderRadius: "9px",
          boxShadow: "0 7px 18px rgba(99, 102, 241, 0.15)",
        }}
      >
        {/* Colorful top accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "25%",
            right: "25%",
            height: "2px",
            background: "linear-gradient(90deg, #6366f1 0%, #ec4899 50%, #14b8a6 100%)",
            borderTopLeftRadius: "9px",
            borderTopRightRadius: "9px",
          }}
        />

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "21px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "15px" : "0",
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
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 50%, #f0fdfa 100%)",
                  border: "1px solid",
                  borderImage: "linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #14b8a6 100%) 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 3px 9px rgba(99, 102, 241, 0.15)",
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
            top: hasLogos ? "68px" : "27px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "17px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #14b8a6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            fontFamily: "'Space Grotesk', sans-serif",
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
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "25px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "16px",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {header}
          </div>

          {/* Modern geometric separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "23px",
                height: "23px",
                background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                clipPath: "polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #6366f1)",
                borderRadius: "2px",
              }}
            />
            <div
              style={{
                width: "27px",
                height: "27px",
                background: "linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)",
                borderRadius: "50%",
              }}
            />
            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, #14b8a6, transparent)",
                borderRadius: "2px",
              }}
            />
            <div
              style={{
                width: "23px",
                height: "23px",
                background: "linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: 600,
              marginBottom: "13px",
              letterSpacing: "1.1px",
              textTransform: "uppercase",
            }}
          >
            Design Certificate Awarded To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              background: "linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #14b8a6 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "18px",
              letterSpacing: "0.5px",
              fontFamily: "'Space Grotesk', sans-serif",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: 600,
              marginBottom: "11px",
              letterSpacing: "0.9px",
            }}
          >
            For Creative Excellence In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 700,
              color: "#1e293b",
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
                color: "#475569",
                fontWeight: 500,
                maxWidth: "547px",
                margin: "0 auto",
                lineHeight: "1.7",
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
            bottom: "30px",
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
                padding: "8px 14px",
                background: "linear-gradient(135deg, #f0f9ff 0%, #fdf4ff 50%, #f0fdfa 100%)",
                border: "1px solid transparent",
                backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #14b8a6 100%)",
                backgroundOrigin: "border-box",
                backgroundClip: "padding-box, border-box",
                borderRadius: "5px",
                boxShadow: "0 3px 9px rgba(99, 102, 241, 0.15)",
              }}
            >
              <div
                style={{
                  fontSize: "9px",
                  background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  marginBottom: "3px",
                  fontWeight: 700,
                  letterSpacing: "0.7px",
                  textTransform: "uppercase",
                }}
              >
                Date
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 800,
                  fontFamily: "'Space Grotesk', sans-serif",
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
                    style={{ height: "22px", maxWidth: "91px", objectFit: "contain" }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "91px",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #6366f1, transparent)",
                  borderRadius: "2px",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "3px",
                  fontFamily: "'Space Grotesk', sans-serif",
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
                    style={{ height: "22px", maxWidth: "91px", objectFit: "contain" }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "91px",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, #14b8a6, transparent)",
                  borderRadius: "2px",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 700,
                  marginBottom: "3px",
                  fontFamily: "'Space Grotesk', sans-serif",
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
              bottom: "13px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "8px",
              color: "#94a3b8",
              letterSpacing: "0.7px",
              fontWeight: 600,
            }}
          >
            Certificate ID: {certificateId}
          </div>
        )}

        {/* Colorful bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "25%",
            right: "25%",
            height: "2px",
            background: "linear-gradient(90deg, #14b8a6 0%, #ec4899 50%, #6366f1 100%)",
            borderBottomLeftRadius: "9px",
            borderBottomRightRadius: "9px",
          }}
        />
      </div>
    </div>
  );
}