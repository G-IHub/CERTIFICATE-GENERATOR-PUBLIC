import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate31Props {
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

export default function CertificateTemplate31({
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
}: CertificateTemplate31Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "pacifico-montserrat-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Pacifico&family=Montserrat:wght@300;400;500;600;700;800&display=swap";
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
        background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)",
        fontFamily: "'Montserrat', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Watercolor splash effects */}
      <div
        style={{
          position: "absolute",
          top: "-46px",
          left: "-46px",
          width: "205px",
          height: "205px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(236, 72, 153, 0.2) 0%, transparent 70%)",
          filter: "blur(14px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "68px",
          right: "-68px",
          width: "251px",
          height: "251px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-57px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "228px",
          height: "228px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(14, 165, 233, 0.2) 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
      />

      {/* Colorful geometric shapes */}
      <div
        style={{
          position: "absolute",
          top: "34px",
          left: "27px",
          width: "41px",
          height: "41px",
          background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "91px",
          right: "34px",
          width: "50px",
          height: "50px",
          background: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)",
          borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
          opacity: 0.4,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "46px",
          left: "46px",
          width: "46px",
          height: "46px",
          background: "linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)",
          borderRadius: "30% 70% 53% 47% / 53% 30% 70% 47%",
          opacity: 0.4,
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "23px",
          background: "rgba(255, 255, 255, 0.92)",
          borderRadius: "11px",
          backdropFilter: "blur(5px)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          boxShadow: "0 7px 21px rgba(0, 0, 0, 0.15), inset 0 0 14px rgba(255, 255, 255, 0.5)",
        }}
      >
        {/* Colorful confetti dots */}
        <div style={{ position: "absolute", inset: "9px" }}>
          {[...Array(30)].map((_, i) => {
            const colors = ["#ec4899", "#8b5cf6", "#0ea5e9", "#f59e0b", "#10b981"];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomX = Math.random() * 100;
            const randomY = Math.random() * 100;
            const randomSize = 2 + Math.random() * 3;
            
            return (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: `${randomX}%`,
                  top: `${randomY}%`,
                  width: `${randomSize}px`,
                  height: `${randomSize}px`,
                  borderRadius: "50%",
                  background: randomColor,
                  opacity: 0.3,
                }}
              />
            );
          })}
        </div>

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "15px" : "0",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            {logosToDisplay.map((logo, index) => (
              <div
                key={index}
                style={{
                  width: "35px",
                  height: "35px",
                  borderRadius: "7px",
                  background: "linear-gradient(135deg, #ffffff 0%, #fef3c7 100%)",
                  border: "1px solid #f59e0b",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 3px 9px rgba(245, 158, 11, 0.25)",
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
            top: hasLogos ? "64px" : "25px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #0ea5e9 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "1.1px",
            textTransform: "uppercase",
            zIndex: 1,
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
            width: "661px",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "26px",
              fontWeight: 400,
              color: "#ec4899",
              marginBottom: "15px",
              letterSpacing: "0.9px",
              fontFamily: "'Pacifico', cursive",
            }}
          >
            {header}
          </div>

          {/* Paint brush strokes decoration */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "11px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "2px",
                background: "linear-gradient(90deg, transparent, #ec4899, #8b5cf6)",
                borderRadius: "2px",
                opacity: 0.6,
              }}
            />
            <div style={{ fontSize: "14px" }}>🎨</div>
            <div
              style={{
                width: "80px",
                height: "2px",
                background: "linear-gradient(90deg, #8b5cf6, #0ea5e9, transparent)",
                borderRadius: "2px",
                opacity: 0.6,
              }}
            />
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: 500,
              marginBottom: "13px",
              letterSpacing: "0.9px",
              textTransform: "uppercase",
            }}
          >
            This Creative Certificate is Awarded To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 400,
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #0ea5e9 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "18px",
              letterSpacing: "0.5px",
              fontFamily: "'Pacifico', cursive",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: 500,
              marginBottom: "11px",
              letterSpacing: "0.7px",
            }}
          >
            For Outstanding Achievement In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 800,
              color: "#1f2937",
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
                color: "#4b5563",
                fontWeight: 400,
                maxWidth: "570px",
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
            zIndex: 1,
          }}
        >
          {/* Date */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "25px",
                height: "25px",
                margin: "0 auto 6px",
                background: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 3px 9px rgba(236, 72, 153, 0.3)",
              }}
            >
              <div style={{ fontSize: "13px" }}>📅</div>
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#9ca3af",
                marginBottom: "4px",
                fontWeight: 600,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Date
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#1f2937",
                fontWeight: 700,
              }}
            >
              {new Date(date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
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
                  background: "linear-gradient(90deg, transparent, #ec4899, transparent)",
                  borderRadius: "2px",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1f2937",
                  fontWeight: 700,
                  marginBottom: "3px",
                }}
              >
                {signatoryName1}
              </div>
              {signatoryTitle1 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#6b7280",
                    fontWeight: 500,
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
                  background: "linear-gradient(90deg, transparent, #0ea5e9, transparent)",
                  borderRadius: "2px",
                  margin: "0 auto 5px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1f2937",
                  fontWeight: 700,
                  marginBottom: "3px",
                }}
              >
                {signatoryName2}
              </div>
              {signatoryTitle2 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#6b7280",
                    fontWeight: 500,
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
              color: "#9ca3af",
              letterSpacing: "0.7px",
              fontWeight: 500,
              zIndex: 1,
            }}
          >
            Certificate ID: {certificateId}
          </div>
        )}
      </div>
    </div>
  );
}