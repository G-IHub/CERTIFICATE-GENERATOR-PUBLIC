import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate24Props {
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

export default function CertificateTemplate24({
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
}: CertificateTemplate24Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  useEffect(() => {
    const id = "rajdhani-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Rajdhani:wght@300;400;500;600;700&family=Orbitron:wght@400;500;600;700;800;900&display=swap";
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
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
          fontFamily: "'Rajdhani', sans-serif",
          overflow: "hidden",
        }}
      >
        {/* Animated circuit board pattern */}
        <svg
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: 0.1,
          }}
        >
          <defs>
            <pattern id="circuit24" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
              <circle cx="9" cy="9" r="0.5" fill="#fff" />
              <circle cx="27" cy="9" r="0.5" fill="#fff" />
              <circle cx="9" cy="27" r="0.5" fill="#fff" />
              <circle cx="27" cy="27" r="0.5" fill="#fff" />
              <line x1="9" y1="9" x2="27" y2="9" stroke="#fff" strokeWidth="0.2" />
              <line x1="9" y1="27" x2="27" y2="27" stroke="#fff" strokeWidth="0.2" />
              <line x1="9" y1="9" x2="9" y2="27" stroke="#fff" strokeWidth="0.2" />
              <line x1="27" y1="9" x2="27" y2="27" stroke="#fff" strokeWidth="0.2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit24)" />
        </svg>

        {/* Glowing orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "110px",
            height: "110px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />

        {/* Main content container with frosted glass effect */}
        <div
          style={{
            position: "absolute",
            inset: "28px",
            background: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(20px)",
            borderRadius: "8px",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* Corner tech decorations */}
          {[
            { top: "8px", left: "8px" },
            { top: "8px", right: "8px" },
            { bottom: "8px", left: "8px" },
            { bottom: "8px", right: "8px" },
          ].map((pos, idx) => (
            <div
              key={idx}
              style={{
                position: "absolute",
                ...pos,
                width: "22px",
                height: "22px",
                border: "2px solid rgba(255, 255, 255, 0.4)",
                ...(idx === 0 && {
                  borderRight: "none",
                  borderBottom: "none",
                  borderTopLeftRadius: "4px",
                }),
                ...(idx === 1 && {
                  borderLeft: "none",
                  borderBottom: "none",
                  borderTopRightRadius: "4px",
                }),
                ...(idx === 2 && {
                  borderRight: "none",
                  borderTop: "none",
                  borderBottomLeftRadius: "4px",
                }),
                ...(idx === 3 && {
                  borderLeft: "none",
                  borderTop: "none",
                  borderBottomRightRadius: "4px",
                }),
              }}
            />
          ))}

          {/* Logo Section */}
          {hasLogos && (
            <div
              style={{
                position: "absolute",
                top: "18px",
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: logosToDisplay.length > 1 ? "18px" : "0",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {logosToDisplay.map((logo, index) => (
                <div
                  key={index}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "4px",
                    background: "rgba(255, 255, 255, 0.15)",
                    border: "1px solid rgba(255, 255, 255, 0.3)",
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
              top: hasLogos ? "54px" : "22px",
              left: 0,
              right: 0,
              textAlign: "center",
              fontSize: "13px",
              fontWeight: 600,
              color: "#ffffff",
              letterSpacing: "1.8px",
              textTransform: "uppercase",
              textShadow: "0 0 6px rgba(255, 255, 255, 0.5)",
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
              width: "500px",
            }}
          >
            {/* Header with tech font */}
            <div
              style={{
                fontSize: "18px",
                fontWeight: 900,
                color: "#ffffff",
                marginBottom: "14px",
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                fontFamily: "'Orbitron', sans-serif",
                textShadow: "0 0 8px rgba(255, 255, 255, 0.6)",
              }}
            >
              {header}
            </div>

            {/* Tech divider */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6))",
                }}
              />
              <div
                style={{
                  width: "3px",
                  height: "3px",
                  background: "#ffffff",
                  transform: "rotate(45deg)",
                  boxShadow: "0 0 4px rgba(255, 255, 255, 0.8)",
                }}
              />
              <div
                style={{
                  width: "54px",
                  height: "1px",
                  background: "linear-gradient(90deg, rgba(255,255,255,0.6), transparent)",
                }}
              />
            </div>

            {/* Awarded to text */}
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 400,
                marginBottom: "10px",
                letterSpacing: "1.2px",
                textTransform: "uppercase",
              }}
            >
              Certificate Awarded To
            </div>

            {/* Recipient Name */}
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "18px",
                letterSpacing: "0.6px",
                textShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              {recipientName}
            </div>

            {/* Achievement text */}
            <div
              style={{
                fontSize: "9px",
                color: "rgba(255, 255, 255, 0.8)",
                fontWeight: 400,
                marginBottom: "8px",
                letterSpacing: "0.8px",
              }}
            >
              For Successfully Completing
            </div>

            {/* Course Title */}
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: "#ffffff",
                marginBottom: "12px",
                letterSpacing: "0.4px",
                lineHeight: "1.3",
                textShadow: "0 0 6px rgba(255, 255, 255, 0.4)",
              }}
            >
              {courseTitle}
            </div>

            {/* Description */}
            {description && (
              <div
                style={{
                  fontSize: "8px",
                  color: "rgba(255, 255, 255, 0.75)",
                  fontWeight: 400,
                  maxWidth: "420px",
                  margin: "0 auto",
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
              bottom: "24px",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "space-around",
              alignItems: "flex-end",
              padding: "0 56px",
            }}
          >
            {/* Date */}
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  margin: "0 auto 5px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255, 255, 255, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "8px",
                  color: "#ffffff",
                  fontFamily: "'Orbitron', sans-serif",
                  fontWeight: 700,
                }}
              >
                📅
              </div>
              <div
                style={{
                  fontSize: "7px",
                  color: "rgba(255, 255, 255, 0.7)",
                  marginBottom: "3px",
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                }}
              >
                Date Issued
              </div>
              <div
                style={{
                  fontSize: "9px",
                  color: "#ffffff",
                  fontWeight: 600,
                }}
              >
                {new Date(date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </div>
            </div>

            {/* Signatory 1 */}
            {signatoryName1 && (
              <div style={{ textAlign: "center" }}>
                {signatureUrl1 && (
                  <div style={{ marginBottom: "5px" }}>
                    <img
                      src={signatureUrl1}
                      alt="Signature 1"
                      style={{
                        height: "20px",
                        maxWidth: "76px",
                        objectFit: "contain",
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    width: "76px",
                    height: "1px",
                    background: "rgba(255, 255, 255, 0.5)",
                    margin: "0 auto 4px",
                  }}
                />
                <div
                  style={{
                    fontSize: "9px",
                    color: "#ffffff",
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  {signatoryName1}
                </div>
                {signatoryTitle1 && (
                  <div
                    style={{
                      fontSize: "7px",
                      color: "rgba(255, 255, 255, 0.7)",
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
                  <div style={{ marginBottom: "5px" }}>
                    <img
                      src={signatureUrl2}
                      alt="Signature 2"
                      style={{
                        height: "20px",
                        maxWidth: "76px",
                        objectFit: "contain",
                        filter: "brightness(0) invert(1)",
                      }}
                    />
                  </div>
                )}
                <div
                  style={{
                    width: "76px",
                    height: "1px",
                    background: "rgba(255, 255, 255, 0.5)",
                    margin: "0 auto 4px",
                  }}
                />
                <div
                  style={{
                    fontSize: "9px",
                    color: "#ffffff",
                    fontWeight: 600,
                    marginBottom: "2px",
                  }}
                >
                  {signatoryName2}
                </div>
                {signatoryTitle2 && (
                  <div
                    style={{
                      fontSize: "7px",
                      color: "rgba(255, 255, 255, 0.7)",
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
                bottom: "10px",
                left: "50%",
                transform: "translateX(-50%)",
                fontSize: "6px",
                color: "rgba(255, 255, 255, 0.6)",
                letterSpacing: "0.8px",
                fontFamily: "'Orbitron', sans-serif",
              }}
            >
              ID: {certificateId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}