import { useRef, useEffect } from "react";
import type { Logo } from "../../App";
import type { ThemeColors } from "../../types/theme";

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
  themeColors?: ThemeColors;
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
  themeColors,
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
            background: `linear-gradient(90deg, ${themeColors?.primary ?? "#6366f1"}, ${themeColors?.secondary ?? themeColors?.primary ?? "#8b5cf6"}, #ec4899, #f59e0b)`,
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
              <div className="flex flex-col items-center gap-2" >
                <div
                  key={index}
                  style={{
                    width: "50px",
                    height: "50px",
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
                <p className="text-xs font-thin text-white">{logo.name} </p>
              </div>
            ))}
          </div>
        )}

        {/* Organization Name */}
        {/* <div
          style={{
            position: "absolute",
            top: hasLogos ? "59px" : "23px",
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
        </div> */}

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
              fontSize: "30px",
              fontWeight: 500,
              background: `linear-gradient(135deg, ${themeColors?.primary ?? "#6366f1"} 0%, ${themeColors?.secondary ?? themeColors?.primary ?? "#8b5cf6"} 50%, #ec4899 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: "16px",
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginTop: "-20px",
            }}
          >
            {header}
          </div>

          {/* Decorative line */}
          <div
            style={{
              width: "80px",
              height: "1px",
              background: `linear-gradient(90deg, transparent, ${themeColors?.primary ?? "#6366f1"}, transparent)`,
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
            background: `linear-gradient(90deg, #f59e0b, #ec4899, ${themeColors?.secondary ?? themeColors?.primary ?? "#8b5cf6"}, ${themeColors?.primary ?? "#6366f1"})`,
          }}
        />
      </div>
    </div>
  );
}
