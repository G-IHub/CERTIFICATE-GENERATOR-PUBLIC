import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate35Props {
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

export default function CertificateTemplate35({
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
}: CertificateTemplate35Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "dancing-script-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&family=Quicksand:wght@300;400;500;600;700&display=swap";
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
        background:
          "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fbcfe8 100%)",
        fontFamily: "'Quicksand', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Musical note decorations */}
      <div
        style={{
          position: "absolute",
          top: "41px",
          left: "27px",
          fontSize: "36px",
          opacity: 0.12,
          transform: "rotate(-15deg)",
        }}
      >
        🎵
      </div>
      <div
        style={{
          position: "absolute",
          top: "137px",
          right: "41px",
          fontSize: "41px",
          opacity: 0.1,
          transform: "rotate(25deg)",
        }}
      >
        🎶
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "91px",
          left: "46px",
          fontSize: "32px",
          opacity: 0.13,
          transform: "rotate(-20deg)",
        }}
      >
        🎼
      </div>

      {/* Flowing wave patterns */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "68px",
          background:
            "linear-gradient(180deg, rgba(219, 39, 119, 0.1) 0%, transparent 100%)",
          clipPath: "polygon(0 0, 100% 0, 100% 60%, 0 80%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "68px",
          background:
            "linear-gradient(0deg, rgba(147, 51, 234, 0.1) 0%, transparent 100%)",
          clipPath: "polygon(0 100%, 100% 100%, 100% 40%, 0 20%)",
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "23px",
          background: "rgba(255, 255, 255, 0.95)",
          borderRadius: "14px",
          backdropFilter: "blur(2px)",
          border: "1px solid rgba(219, 39, 119, 0.2)",
          boxShadow:
            "0 9px 23px rgba(219, 39, 119, 0.2), inset 0 0 18px rgba(253, 242, 248, 0.8)",
        }}
      >
        {/* Decorative musical staff lines */}
        <div
          style={{
            position: "absolute",
            top: "27px",
            left: "46px",
            right: "46px",
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            opacity: 0.15,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                height: "1px",
                background: "#db2777",
              }}
            />
          ))}
        </div>

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "21px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "14px" : "0",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1,
            }}
          >
            {logosToDisplay.map((logo, index) => (
              <div
                key={index}
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
                  border: "1px solid #db2777",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 3px 9px rgba(219, 39, 119, 0.2)",
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
            top: hasLogos ? "66px" : "27px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #db2777 0%, #9333ea 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "1.4px",
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
            width: "638px",
            zIndex: 1,
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "27px",
              fontWeight: 600,
              color: "#db2777",
              marginBottom: "15px",
              letterSpacing: "0.7px",
              fontFamily: "'Dancing Script', cursive",
            }}
          >
            {header}
          </div>

          {/* Musical decoration */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "16px" }}>🎭</div>
            <div
              style={{
                width: "91px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #db2777)",
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "19px", color: "#9333ea" }}>♪</div>
            <div
              style={{
                width: "91px",
                height: "1px",
                background: "linear-gradient(90deg, #9333ea, transparent)",
                borderRadius: "2px",
              }}
            />
            <div style={{ fontSize: "16px" }}>🎭</div>
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: 600,
              marginBottom: "13px",
              letterSpacing: "0.9px",
              textTransform: "uppercase",
            }}
          >
            This Performance Certificate is Awarded To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "33px",
              fontWeight: 700,
              color: "#db2777",
              marginBottom: "18px",
              letterSpacing: "0.5px",
              fontFamily: "'Dancing Script', cursive",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: 600,
              marginBottom: "11px",
              letterSpacing: "0.7px",
            }}
          >
            For Outstanding Performance In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 700,
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
              bottom: "13px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "8px",
              color: "#9ca3af",
              letterSpacing: "0.7px",
              fontWeight: 600,
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
