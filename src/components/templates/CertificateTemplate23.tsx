import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate23Props {
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

export default function CertificateTemplate23({
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
}: CertificateTemplate23Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  useEffect(() => {
    const id = "playfair-display-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600&display=swap";
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
  const logosToDisplay = organizationLogos || [];
  const hasLogos = logosToDisplay.length > 0;

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        ref={ref}
        style={{
          width: "800px",
          height: "600px",
          position: "relative",
          backgroundColor: "#faf8f5",
          fontFamily: "'Playfair Display', serif",
          overflow: "hidden",
        }}
      >
        {/* Elegant border frame */}
        <div
          style={{
            position: "absolute",
            inset: "18px",
            border: "2px solid #d4af37",
            borderRadius: "4px",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: "22px",
            border: "1px solid #d4af37",
            borderRadius: "3px",
          }}
        />

        {/* Corner ornaments */}
        {[
          { top: "14px", left: "14px", rotate: "0deg" },
          { top: "14px", right: "14px", rotate: "90deg" },
          { bottom: "14px", left: "14px", rotate: "270deg" },
          { bottom: "14px", right: "14px", rotate: "180deg" },
        ].map((pos, idx) => (
          <div
            key={idx}
            style={{
              position: "absolute",
              ...pos,
              width: "32px",
              height: "32px",
              transform: `rotate(${pos.rotate})`,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 32 32">
              <path
                d="M 0 0 Q 0 16 16 16 M 0 0 Q 16 0 16 16"
                stroke="#d4af37"
                strokeWidth="1"
                fill="none"
              />
              <circle cx="3" cy="3" r="1.5" fill="#d4af37" />
              <path
                d="M 4 0 L 6 0 M 0 4 L 0 6"
                stroke="#d4af37"
                strokeWidth="1"
              />
            </svg>
          </div>
        ))}

        {/* Watermark pattern */}
        <div
          style={{
            position: "absolute",
            inset: "36px",
            backgroundImage: `radial-gradient(circle at center, rgba(212, 175, 55, 0.03) 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }}
        />

        {/* Logo Section */}
        {hasLogos && (
          <div
            style={{
              position: "absolute",
              top: "18px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              gap: logosToDisplay.length > 1 ? "14px" : "0",
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
                  borderRadius: "5px",
                  background: "rgba(59, 130, 246, 0.1)",
                  border: "0.5px solid rgba(59, 130, 246, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 0 7px rgba(59, 130, 246, 0.2)",
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
            top: hasLogos ? "59px" : "23px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 400,
            color: "#2c2c2c",
            letterSpacing: "2.2px",
            textTransform: "uppercase",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          {organizationName}
        </div>

        {/* Decorative divider */}
        <div
          style={{
            position: "absolute",
            top: hasLogos ? "96px" : "60px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "linear-gradient(90deg, transparent, #d4af37)",
            }}
          />
          <div
            style={{
              width: "4px",
              height: "4px",
              background: "#d4af37",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              width: "40px",
              height: "1px",
              background: "linear-gradient(90deg, #d4af37, transparent)",
            }}
          />
        </div>

        {/* Main Content */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
            width: "520px",
          }}
        >
          {/* Header */}
          <div
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#d4af37",
              marginBottom: "12px",
              letterSpacing: "1.2px",
              marginTop: "-30px",
            }}
          >
            {header}
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: "10px",
              color: "#6b6b6b",
              fontWeight: 400,
              marginBottom: "16px",
              fontStyle: "italic",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            This is to certify that
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: 800,
              color: "#2c2c2c",
              marginBottom: "16px",
              letterSpacing: "0.4px",
              position: "relative",
              display: "inline-block",
            }}
          >
            {recipientName}
            <div
              style={{
                position: "absolute",
                bottom: "-4px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "120%",
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent, #d4af37, transparent)",
              }}
            />
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "#6b6b6b",
              fontWeight: 400,
              marginTop: "20px",
              marginBottom: "10px",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            has successfully completed the
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "16px",
              fontWeight: 700,
              color: "#2c2c2c",
              marginBottom: "12px",
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

        {/* Certificate ID with seal */}
        {certificateId && (
          <div
            style={{
              position: "absolute",
              bottom: "18px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                borderRadius: "50%",
                border: "1px solid #d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "8px",
                color: "#d4af37",
                fontWeight: 700,
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontSize: "6px",
                color: "#6b6b6b",
                letterSpacing: "0.6px",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 400,
              }}
            >
              Certificate ID: {certificateId}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
