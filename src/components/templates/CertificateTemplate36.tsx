import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate36Props {
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

export default function CertificateTemplate36({
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
}: CertificateTemplate36Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "roboto-mono-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap";
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
        background: "#000000",
        fontFamily: "'Roboto Mono', monospace",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Matrix-style grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "14px 14px",
        }}
      />

      {/* Cyber glow effects */}
      <div
        style={{
          position: "absolute",
          top: "-46px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "274px",
          height: "274px",
          background: "radial-gradient(circle, rgba(0, 255, 65, 0.2) 0%, transparent 60%)",
          filter: "blur(23px)",
        }}
      />

      {/* Binary code decorations */}
      <div
        style={{
          position: "absolute",
          top: "27px",
          left: "18px",
          fontSize: "7px",
          color: "rgba(0, 255, 65, 0.2)",
          fontFamily: "'Roboto Mono', monospace",
          lineHeight: "1.6",
          writingMode: "vertical-lr",
        }}
      >
        01001001<br />01010011<br />01010011<br />01010101
      </div>
      <div
        style={{
          position: "absolute",
          top: "27px",
          right: "18px",
          fontSize: "7px",
          color: "rgba(0, 255, 65, 0.2)",
          fontFamily: "'Roboto Mono', monospace",
          lineHeight: "1.6",
          writingMode: "vertical-lr",
        }}
      >
        01000101<br />01000100<br />01010110<br />01010010
      </div>

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "21px",
          border: "1px solid #00ff41",
          background: "linear-gradient(135deg, rgba(0, 30, 10, 0.95) 0%, rgba(0, 20, 8, 0.95) 100%)",
          boxShadow: "0 0 14px rgba(0, 255, 65, 0.4), inset 0 0 18px rgba(0, 255, 65, 0.05)",
        }}
      >
        {/* Scan lines effect */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 1px,
              rgba(0, 255, 65, 0.02) 1px,
              rgba(0, 255, 65, 0.02) 2px
            )`,
            pointerEvents: "none",
          }}
        />

        {/* Corner brackets */}
        {[
          { top: "0", left: "0", style: "border-top: 1px solid #00ff41; border-left: 1px solid #00ff41;" },
          { top: "0", right: "0", style: "border-top: 1px solid #00ff41; border-right: 1px solid #00ff41;" },
          { bottom: "0", left: "0", style: "border-bottom: 1px solid #00ff41; border-left: 1px solid #00ff41;" },
          { bottom: "0", right: "0", style: "border-bottom: 1px solid #00ff41; border-right: 1px solid #00ff41;" },
        ].map((corner, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              ...corner,
              width: "57px",
              height: "57px",
            }}
          />
        ))}

        {/* Shield icon */}
        <div
          style={{
            position: "absolute",
            top: "-16px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "46px",
            height: "46px",
            background: "#000000",
            border: "1px solid #00ff41",
            clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 11px rgba(0, 255, 65, 0.6)",
          }}
        >
          <div style={{ fontSize: "21px" }}>🛡️</div>
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
              gap: logosToDisplay.length > 1 ? "15px" : "0",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {logosToDisplay.map((logo, index) => (
              <div
                key={index}
                style={{
                  width: "33px",
                  height: "33px",
                  background: "rgba(0, 30, 10, 0.8)",
                  border: "1px solid #00ff41",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 0 7px rgba(0, 255, 65, 0.4)",
                  clipPath: "polygon(0% 15%, 15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%)",
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
            top: hasLogos ? "84px" : "41px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "16px",
            fontWeight: 900,
            color: "#00ff41",
            letterSpacing: "2.7px",
            textTransform: "uppercase",
            fontFamily: "'Orbitron', sans-serif",
            textShadow: "0 0 5px rgba(0, 255, 65, 0.8)",
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
              position: "relative",
              display: "inline-block",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "8px",
                color: "#00ff41",
                fontFamily: "'Roboto Mono', monospace",
                marginBottom: "2px",
                letterSpacing: "1.8px",
              }}
            >
              {"[VERIFIED]"}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 900,
                color: "#00ff41",
                letterSpacing: "2.3px",
                textTransform: "uppercase",
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 0 7px rgba(0, 255, 65, 0.6)",
              }}
            >
              {header}
            </div>
          </div>

          {/* Cyber decoration */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              marginBottom: "16px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#00ff41" }}>▶</div>
            <div
              style={{
                width: "91px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #00ff41)",
                boxShadow: "0 0 2px rgba(0, 255, 65, 0.6)",
              }}
            />
            <div
              style={{
                width: "18px",
                height: "18px",
                border: "1px solid #00ff41",
                clipPath: "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)",
                boxShadow: "0 0 5px rgba(0, 255, 65, 0.6)",
              }}
            />
            <div
              style={{
                width: "91px",
                height: "1px",
                background: "linear-gradient(90deg, #00ff41, transparent)",
                boxShadow: "0 0 2px rgba(0, 255, 65, 0.6)",
              }}
            />
            <div style={{ fontSize: "11px", color: "#00ff41" }}>◀</div>
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "10px",
              color: "#70ff70",
              fontWeight: 600,
              marginBottom: "13px",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
            }}
          >
            Security Certificate Granted To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "31px",
              fontWeight: 900,
              color: "#ffffff",
              marginBottom: "17px",
              letterSpacing: "0.5px",
              fontFamily: "'Orbitron', sans-serif",
              textShadow: "0 0 9px rgba(0, 255, 65, 0.5)",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "#70ff70",
              fontWeight: 600,
              marginBottom: "11px",
              letterSpacing: "1.1px",
              textTransform: "uppercase",
            }}
          >
            For Successful Completion Of
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "20px",
              fontWeight: 800,
              color: "#00ff41",
              marginBottom: "15px",
              letterSpacing: "0.5px",
              lineHeight: "1.3",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {courseTitle}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: "10px",
                color: "#90ff90",
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
                padding: "7px 13px",
                border: "1px solid #00ff41",
                background: "rgba(0, 30, 10, 0.8)",
                boxShadow: "0 0 7px rgba(0, 255, 65, 0.4)",
                clipPath: "polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)",
              }}
            >
              <div
                style={{
                  fontSize: "8px",
                  color: "#00ff41",
                  marginBottom: "3px",
                  fontWeight: 700,
                  letterSpacing: "0.9px",
                  fontFamily: "'Roboto Mono', monospace",
                }}
              >
                {"[DATE]"}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  color: "#ffffff",
                  fontWeight: 800,
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </div>
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
                    style={{ height: "21px", maxWidth: "91px", objectFit: "contain", filter: "brightness(2)" }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "91px",
                  height: "1px",
                  background: "#00ff41",
                  margin: "0 auto 5px",
                  boxShadow: "0 0 2px rgba(0, 255, 65, 0.6)",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#00ff41",
                  fontWeight: 800,
                  marginBottom: "3px",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {signatoryName1}
              </div>
              {signatoryTitle1 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#70ff70",
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
                <div style={{ marginBottom: "6px" }}>
                  <img
                    src={signatureUrl2}
                    alt="Signature 2"
                    style={{ height: "21px", maxWidth: "91px", objectFit: "contain", filter: "brightness(2)" }}
                  />
                </div>
              )}
              <div
                style={{
                  width: "91px",
                  height: "1px",
                  background: "#00ff41",
                  margin: "0 auto 5px",
                  boxShadow: "0 0 2px rgba(0, 255, 65, 0.6)",
                }}
              />
              <div
                style={{
                  fontSize: "11px",
                  color: "#00ff41",
                  fontWeight: 800,
                  marginBottom: "3px",
                  fontFamily: "'Orbitron', sans-serif",
                }}
              >
                {signatoryName2}
              </div>
              {signatoryTitle2 && (
                <div
                  style={{
                    fontSize: "9px",
                    color: "#70ff70",
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
              bottom: "11px",
              left: "50%",
              transform: "translateX(-50%)",
              fontSize: "7px",
              color: "#00ff41",
              letterSpacing: "0.9px",
              fontWeight: 700,
              fontFamily: "'Roboto Mono', monospace",
            }}
          >
            {"[ID:"} {certificateId}{"]"}
          </div>
        )}
      </div>
    </div>
  );
}