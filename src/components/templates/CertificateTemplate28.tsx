import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate28Props {
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

export default function CertificateTemplate28({
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
}: CertificateTemplate28Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "bebas-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Roboto:wght@300;400;500;700&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // Get logos to display
  const logosToDisplay = organizationLogos || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        height: "600px",
        position: "relative",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        fontFamily: "'Roboto', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Diagonal stripe pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 23px,
            rgba(255, 255, 255, 0.03) 23px,
            rgba(255, 255, 255, 0.03) 46px
          )`,
        }}
      />

      {/* Top left geometric accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "182px",
          height: "182px",
          background:
            "linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, transparent 70%)",
          clipPath: "polygon(0 0, 100% 0, 0 100%)",
        }}
      />

      {/* Bottom right geometric accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "205px",
          height: "205px",
          background:
            "linear-gradient(135deg, transparent 30%, rgba(59, 130, 246, 0.12) 100%)",
          clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
        }}
      />

      {/* Main content card */}
      <div
        style={{
          position: "absolute",
          inset: "41px",
          background: "#ffffff",
          borderRadius: "7px",
          boxShadow: "0 7px 18px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* Card top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "5px",
            background:
              "linear-gradient(90deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)",
            borderTopLeftRadius: "7px",
            borderTopRightRadius: "7px",
          }}
        />

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "23px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "23px" : "0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logosToDisplay.map((logo, index) => (
              <div
                key={index}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "5px",
                  background:
                    "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
                  border: "1px solid #3b82f6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  boxShadow: "0 2px 7px rgba(59, 130, 246, 0.15)",
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
            fontWeight: 700,
            color: "#1e3a8a",
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            fontFamily: "'Bebas Neue', sans-serif",
          }}
        >
          {organizationName}
        </div>

        {/* Main Content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "570px",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "25px",
              fontWeight: 400,
              color: "#2563eb",
              marginBottom: "16px",
              marginTop: "-50px",
              letterSpacing: "2.7px",
              textTransform: "uppercase",
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            {header}
          </div>

          {/* Decorative element */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginBottom: "21px",
            }}
          >
            <div
              style={{
                width: "68px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #3b82f6)",
              }}
            />
            <div
              style={{
                width: "9px",
                height: "9px",
                background: "#2563eb",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
              }}
            />
            <div
              style={{
                width: "68px",
                height: "1px",
                background: "linear-gradient(90deg, #3b82f6, transparent)",
              }}
            />
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: 400,
              marginBottom: "13px",
              letterSpacing: "0.9px",
              textTransform: "uppercase",
            }}
          >
            Proudly Presented To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "33px",
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: "22px",
              letterSpacing: "0.5px",
              fontFamily: "'Bebas Neue', sans-serif",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "11px",
              color: "#64748b",
              fontWeight: 400,
              marginBottom: "10px",
              marginTop: "-20px",
              letterSpacing: "0.7px",
            }}
          >
            For Successfully Completing The Program
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "16px",
              letterSpacing: "0.2px",
              lineHeight: "1.2",
            }}
          >
            {courseTitle}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                textAlign: "center",
                fontSize: "12px",
                color: "black",
                margin: "10px 20px",
                lineHeight: "1.4",
                wordWrap: "break-word",
                // maxWidth: "28%",
                marginLeft: "auto",
                marginRight: "auto",
                marginTop: "-10px",
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
                width: "23px",
                height: "23px",
                margin: "0 auto 7px",
                background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
                borderRadius: "3px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 7px rgba(37, 99, 235, 0.3)",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  color: "#ffffff",
                  fontWeight: 700,
                  fontFamily: "'Bebas Neue', sans-serif",
                }}
              >
                📅
              </div>
            </div>
            <div
              style={{
                fontSize: "9px",
                color: "#64748b",
                marginBottom: "5px",
                fontWeight: 500,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
              }}
            >
              Date
            </div>
            <div
              style={{
                fontSize: "11px",
                color: "#1e293b",
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
                <div style={{ marginBottom: "7px" }}>
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
                  width: "91px",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #2563eb, transparent)",
                  margin: "0 auto 6px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 600,
                  marginBottom: "3px",
                }}
              >
                {signatoryName1}
              </div>
              {signatoryTitle1 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#64748b",
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
                <div style={{ marginBottom: "7px" }}>
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
                  width: "91px",
                  height: "1px",
                  background:
                    "linear-gradient(90deg, transparent, #3b82f6, transparent)",
                  margin: "0 auto 6px",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#1e293b",
                  fontWeight: 600,
                  marginBottom: "3px",
                }}
              >
                {signatoryName2}
              </div>
              {signatoryTitle2 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#64748b",
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
              bottom: "14px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "7px",
              color: "#94a3b8",
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
