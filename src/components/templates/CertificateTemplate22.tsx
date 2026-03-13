import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate22Props {
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

export default function CertificateTemplate22({
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
}: CertificateTemplate22Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  useEffect(() => {
    const id = "space-grotesk-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";

  // Get logos to display
  const logosToDisplay = organizationLogos?.filter((logo) => logo.selected) || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        ref={ref}
        style={{
          width: "800px",
          height: "600px",
          position: "relative",
          backgroundColor: "#0a0e27",
          fontFamily: "'Space Grotesk', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Animated gradient mesh background */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(circle at 20% 30%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)
            `,
          }}
        />

        {/* Geometric pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `
              linear-gradient(30deg, rgba(99, 102, 241, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.03) 87.5%, rgba(99, 102, 241, 0.03)),
              linear-gradient(150deg, rgba(99, 102, 241, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.03) 87.5%, rgba(99, 102, 241, 0.03)),
              linear-gradient(30deg, rgba(99, 102, 241, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.03) 87.5%, rgba(99, 102, 241, 0.03)),
              linear-gradient(150deg, rgba(99, 102, 241, 0.03) 12%, transparent 12.5%, transparent 87%, rgba(99, 102, 241, 0.03) 87.5%, rgba(99, 102, 241, 0.03))
            `,
            backgroundSize: "15px 26px",
            backgroundPosition: "0 0, 0 0, 7.5px 13px, 7.5px 13px",
          }}
        />

        {/* Top border with gradient */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6, #ec4899, #f59e0b)",
          }}
        />

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "20px",
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
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(99, 102, 241, 0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  backdropFilter: "blur(10px)",
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
            top: hasLogos ? "60px" : "30px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 300,
            color: "#ffffff",
            letterSpacing: "1.5px",
            textTransform: "uppercase",
          }}
        >
          {organizationName}
        </div>

        {/* Main Content Container */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "560px",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 500,
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "16px",
              letterSpacing: "1px",
              textTransform: "uppercase",
            }}
          >
            {header}
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: "80px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #6366f1, transparent)",
              margin: "0 auto 20px",
            }}
          />

          {/* Awarded to text */}
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.5)",
              fontWeight: 300,
              marginBottom: "8px",
              letterSpacing: "1.2px",
              textTransform: "uppercase",
            }}
          >
            This Certifies That
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "20px",
              letterSpacing: "0.5px",
              textShadow: "0 0 12px rgba(99, 102, 241, 0.5)",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255, 255, 255, 0.6)",
              fontWeight: 300,
              marginBottom: "6px",
              letterSpacing: "0.8px",
            }}
          >
            has successfully completed
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "18px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #ffffff 0%, #a5b4fc 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "12px",
              letterSpacing: "0.3px",
              lineHeight: "1.3",
            }}
          >
            {courseTitle}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "8px",
                color: "rgba(255, 255, 255, 0.5)",
                fontWeight: 300,
                marginBottom: "16px",
                maxWidth: "440px",
                margin: "0 auto 16px",
                lineHeight: "1.6",
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
            bottom: "36px",
            left: 0,
            right: 0,
            display: "flex",
            justifyContent: "space-around",
            alignItems: "flex-end",
            padding: "0 60px",
          }}
        >
          {/* Date */}
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontSize: "8px",
                color: "rgba(255, 255, 255, 0.4)",
                marginBottom: "4px",
                letterSpacing: "0.6px",
                textTransform: "uppercase",
              }}
            >
              Date
            </div>
            <div
              style={{
                fontSize: "10px",
                color: "#ffffff",
                fontWeight: 600,
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
                <div style={{ marginBottom: "6px" }}>
                  <img
                    src={signatureUrl1}
                    alt="Signature 1"
                    style={{ height: "24px", maxWidth: "80px", objectFit: "contain" }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "80px",
                  height: "1px",
                  background: "rgba(99, 102, 241, 0.5)",
                  margin: "0 auto 4px",
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  color: "#ffffff",
                  fontWeight: 500,
                  marginBottom: "2px",
                }}
              >
                {signatoryName1}
              </div>
              {signatoryTitle1 && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontWeight: 300,
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
                    style={{ height: "24px", maxWidth: "80px", objectFit: "contain" }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "80px",
                  height: "1px",
                  background: "rgba(139, 92, 246, 0.5)",
                  margin: "0 auto 4px",
                }}
              />
              <div
                style={{
                  fontSize: "10px",
                  color: "#ffffff",
                  fontWeight: 500,
                  marginBottom: "2px",
                }}
              >
                {signatoryName2}
              </div>
              {signatoryTitle2 && (
                <div
                  style={{
                    fontSize: "8px",
                    color: "rgba(255, 255, 255, 0.5)",
                    fontWeight: 300,
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
              bottom: "12px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "6px",
              color: "rgba(255, 255, 255, 0.3)",
              letterSpacing: "0.8px",
              fontWeight: 300,
            }}
          >
            ID: {certificateId}
          </div>
        )}

        {/* Bottom gradient border */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "2px",
            background: "linear-gradient(90deg, #f59e0b, #ec4899, #8b5cf6, #6366f1)",
          }}
        />
      </div>
    </div>
  );
}