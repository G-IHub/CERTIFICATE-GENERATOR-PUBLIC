import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate34Props {
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

export default function CertificateTemplate34({
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
}: CertificateTemplate34Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "cormorant-cinzel-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600;700&family=Cinzel:wght@400;500;600;700;800&display=swap";
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
        background: "#0a0a0a",
        fontFamily: "'Cormorant Garamond', serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Luxury gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 30% 40%, rgba(212, 175, 55, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(255, 215, 0, 0.08) 0%, transparent 50%)",
        }}
      />

      {/* Ornamental patterns */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle, rgba(212, 175, 55, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "23px 23px",
        }}
      />

      {/* Main border frame */}
      <div
        style={{
          position: "absolute",
          inset: "18px",
          border: "2px solid",
          borderImage:
            "linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%) 1",
          background: "linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)",
          boxShadow:
            "0 0 23px rgba(212, 175, 55, 0.3), inset 0 0 34px rgba(212, 175, 55, 0.05)",
        }}
      >
        {/* Inner decorative border */}
        <div
          style={{
            position: "absolute",
            inset: "14px",
            border: "0.5px solid rgba(212, 175, 55, 0.4)",
          }}
        />

        {/* Corner ornaments */}
        {[
          { top: "0", left: "0", rotate: "0deg" },
          { top: "0", right: "0", rotate: "90deg" },
          { bottom: "0", right: "0", rotate: "180deg" },
          { bottom: "0", left: "0", rotate: "270deg" },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...pos,
              width: "57px",
              height: "57px",
              transform: `rotate(${pos.rotate})`,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                borderTop: "1px solid #d4af37",
                borderLeft: "1px solid #d4af37",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "7px",
                left: "7px",
                fontSize: "18px",
                color: "#d4af37",
              }}
            >
              ❖
            </div>
          </div>
        ))}

        {/* Top crown decoration */}
        <div
          style={{
            position: "absolute",
            top: "-14px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "50px",
            height: "50px",
            background: "radial-gradient(circle, #0a0a0a 0%, #1a1a1a 100%)",
            borderRadius: "50%",
            border: "2px solid #d4af37",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 14px rgba(212, 175, 55, 0.5)",
          }}
        >
          <div style={{ fontSize: "25px" }}>👑</div>
        </div>

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "48px",
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
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, #1a1a1a 0%, #0a0a0a 100%)",
                  border: "1px solid #d4af37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "6px",
                  boxShadow: "0 0 9px rgba(212, 175, 55, 0.3)",
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
            top: hasLogos ? "96px" : "50px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "17px",
            fontWeight: 700,
            color: "#d4af37",
            letterSpacing: "2.7px",
            textTransform: "uppercase",
            fontFamily: "'Cinzel', serif",
            textShadow: "0 0 7px rgba(212, 175, 55, 0.5)",
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
              fontSize: "25px",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #d4af37 0%, #ffd700 50%, #d4af37 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "16px",
              letterSpacing: "3.2px",
              textTransform: "uppercase",
              fontFamily: "'Cinzel', serif",
              textShadow: "0 0 9px rgba(212, 175, 55, 0.3)",
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
              gap: "11px",
              marginBottom: "17px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#d4af37" }}>◈</div>
            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #d4af37)",
              }}
            />
            <div
              style={{
                width: "18px",
                height: "18px",
                border: "1px solid #d4af37",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0a0a0a",
              }}
            >
              <div
                style={{
                  width: "9px",
                  height: "9px",
                  background: "#d4af37",
                  borderRadius: "50%",
                }}
              />
            </div>
            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, #d4af37, transparent)",
              }}
            />
            <div style={{ fontSize: "11px", color: "#d4af37" }}>◈</div>
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "11px",
              color: "#a8a8a8",
              fontWeight: 400,
              marginBottom: "13px",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
            }}
          >
            This Distinguished Certificate is Presented To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "33px",
              fontWeight: 600,
              color: "#d4af37",
              marginBottom: "19px",
              letterSpacing: "0.7px",
              fontFamily: "'Cinzel', serif",
              textShadow: "0 0 11px rgba(212, 175, 55, 0.4)",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "11px",
              color: "#a8a8a8",
              fontWeight: 400,
              marginBottom: "11px",
              letterSpacing: "1.1px",
            }}
          >
            For Demonstrating Excellence In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: "16px",
              letterSpacing: "0.5px",
              lineHeight: "1.3",
              fontFamily: "'Cinzel', serif",
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
              bottom: "14px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "8px",
              color: "#6b6b6b",
              letterSpacing: "0.9px",
              fontWeight: 500,
            }}
          >
            Certificate ID: {certificateId}
          </div>
        )}
      </div>
    </div>
  );
}
