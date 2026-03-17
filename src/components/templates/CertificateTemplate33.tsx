import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate33Props {
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

export default function CertificateTemplate33({
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
}: CertificateTemplate33Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "oswald-barlow-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Barlow:wght@300;400;500;600;700;800&display=swap";
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
        background: "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
        fontFamily: "'Barlow', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Dynamic diagonal stripes */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 27px,
            rgba(239, 68, 68, 0.08) 27px,
            rgba(239, 68, 68, 0.08) 55px
          )`,
        }}
      />

      {/* Energy burst top left */}
      <div
        style={{
          position: "absolute",
          top: "-68px",
          left: "-68px",
          width: "182px",
          height: "182px",
          background:
            "radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, transparent 60%)",
          filter: "blur(18px)",
        }}
      />

      {/* Energy burst bottom right */}
      <div
        style={{
          position: "absolute",
          bottom: "-68px",
          right: "-68px",
          width: "205px",
          height: "205px",
          background:
            "radial-gradient(circle, rgba(249, 115, 22, 0.3) 0%, transparent 60%)",
          filter: "blur(18px)",
        }}
      />

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "23px",
          border: "1px solid",
          borderImage: "linear-gradient(135deg, #ef4444 0%, #f97316 100%) 1",
          background: "rgba(23, 23, 23, 0.95)",
          boxShadow:
            "0 0 18px rgba(239, 68, 68, 0.4), inset 0 0 23px rgba(239, 68, 68, 0.05)",
        }}
      >
        {/* Speed lines decoration */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: `${34 + i * 57}px`,
              left: 0,
              width: "41px",
              height: "1px",
              background: `linear-gradient(90deg, rgba(239, 68, 68, 0.${8 - i}) 0%, transparent 100%)`,
              transform: "skewY(-2deg)",
            }}
          />
        ))}

        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            width: "68px",
            height: "68px",
            borderTop: "1px solid #ef4444",
            borderLeft: "1px solid #ef4444",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "0",
            right: "0",
            width: "68px",
            height: "68px",
            borderTop: "1px solid #f97316",
            borderRight: "1px solid #f97316",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "68px",
            height: "68px",
            borderBottom: "1px solid #f97316",
            borderLeft: "1px solid #f97316",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "0",
            right: "0",
            width: "68px",
            height: "68px",
            borderBottom: "1px solid #ef4444",
            borderRight: "1px solid #ef4444",
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
                  width: "34px",
                  height: "34px",
                  background:
                    "linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)",
                  border: "1px solid #ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 0 9px rgba(239, 68, 68, 0.4)",
                  clipPath: "polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%)",
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
            fontSize: "17px",
            fontWeight: 800,
            background: "linear-gradient(135deg, #ef4444 0%, #f97316 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "2.3px",
            textTransform: "uppercase",
            fontFamily: "'Oswald', sans-serif",
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
          {/* Header */}
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "17px",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "2.7px",
                textTransform: "uppercase",
                fontFamily: "'Oswald', sans-serif",
                textShadow: "0 0 7px rgba(239, 68, 68, 0.6)",
              }}
            >
              {header}
            </div>
            <div
              style={{
                position: "absolute",
                bottom: "-5px",
                left: "0",
                right: "0",
                height: "2px",
                background:
                  "linear-gradient(90deg, transparent, #ef4444, #f97316, transparent)",
              }}
            />
          </div>

          {/* Dynamic separator */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#ef4444" }}>◢</div>
            <div
              style={{
                width: "103px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #ef4444)",
              }}
            />
            <div style={{ fontSize: "14px", color: "#f97316" }}>⚡</div>
            <div
              style={{
                width: "103px",
                height: "1px",
                background: "linear-gradient(90deg, #f97316, transparent)",
              }}
            />
            <div style={{ fontSize: "11px", color: "#ef4444" }}>◣</div>
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "11px",
              color: "#9ca3af",
              fontWeight: 600,
              marginBottom: "13px",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
            }}
          >
            Champion Certificate Awarded To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "32px",
              fontWeight: 800,
              background:
                "linear-gradient(135deg, #ffffff 0%, #f87171 50%, #fb923c 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "18px",
              letterSpacing: "0.7px",
              fontFamily: "'Oswald', sans-serif",
              textShadow: "0 0 9px rgba(239, 68, 68, 0.3)",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "11px",
              color: "#9ca3af",
              fontWeight: 600,
              marginBottom: "11px",
              letterSpacing: "1.1px",
              textTransform: "uppercase",
            }}
          >
            For Excellence In
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "#ffffff",
              marginBottom: "15px",
              letterSpacing: "0.5px",
              lineHeight: "1.3",
              fontFamily: "'Oswald', sans-serif",
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
              color: "#6b7280",
              letterSpacing: "0.9px",
              fontWeight: 600,
              fontFamily: "'Oswald', sans-serif",
            }}
          >
            ID: {certificateId}
          </div>
        )}
      </div>
    </div>
  );
}
