import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate26Props {
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

export default function CertificateTemplate26({
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
}: CertificateTemplate26Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "crimson-text-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Crimson+Text:wght@400;600;700&family=Lato:wght@300;400;700&display=swap";
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
        background: "#1a1a2e",
        fontFamily: "'Crimson Text', serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Dark sophisticated gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(circle at 30% 40%, rgba(255, 215, 0, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 70% 60%, rgba(192, 192, 192, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Luxury border frame */}
      <div
        style={{
          position: "absolute",
          inset: "27px",
          border: "1px solid",
          borderImage: "linear-gradient(135deg, #ffd700, #c0c0c0, #ffd700) 1",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "32px",
          border: "0.5px solid rgba(255, 215, 0, 0.3)",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: "33px",
          border: "0.5px solid rgba(192, 192, 192, 0.2)",
        }}
      />

      {/* Corner embellishments */}
      {[
        { top: "23px", left: "23px", rotation: "0" },
        { top: "23px", right: "23px", rotation: "90" },
        { bottom: "23px", left: "23px", rotation: "270" },
        { bottom: "23px", right: "23px", rotation: "180" },
      ].map((pos, idx) => (
        <div
          key={idx}
          style={{
            position: "absolute",
            ...pos,
            width: "46px",
            height: "46px",
          }}
        >
          <svg
            width="46"
            height="46"
            viewBox="0 0 200 200"
            style={{ transform: `rotate(${pos.rotation}deg)` }}
          >
            <defs>
              <linearGradient
                id={`goldGrad${idx}`}
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#ffd700" />
                <stop offset="50%" stopColor="#c0c0c0" />
                <stop offset="100%" stopColor="#ffd700" />
              </linearGradient>
            </defs>
            <path
              d="M 0 0 L 0 80 C 0 40, 40 0, 80 0 Z"
              fill={`url(#goldGrad${idx})`}
              opacity="0.6"
            />
            <circle cx="0" cy="0" r="15" fill="#ffd700" />
            <line
              x1="0"
              y1="20"
              x2="0"
              y2="60"
              stroke="#ffd700"
              strokeWidth="2"
            />
            <line
              x1="20"
              y1="0"
              x2="60"
              y2="0"
              stroke="#ffd700"
              strokeWidth="2"
            />
          </svg>
        </div>
      ))}

      {/* Logo Section */}
      {hasLogos && (
        <div
          style={{
            position: "absolute",
            top: "50px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            gap: logosToDisplay.length > 1 ? "27px" : "0",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {logosToDisplay.map((logo, index) => (
            <div
              key={index}
              style={{
                width: "46px",
                height: "46px",
                borderRadius: "50%",
                background: "rgba(255, 215, 0, 0.1)",
                border: "1px solid #ffd700",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "8px",
                boxShadow: "0 0 9px rgba(255, 215, 0, 0.3)",
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
          top: hasLogos ? "105px" : "59px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "16px",
          fontWeight: 400,
          background:
            "linear-gradient(135deg, #ffd700 0%, #ffffff 50%, #c0c0c0 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "3.2px",
          textTransform: "uppercase",
          fontFamily: "'Lato', sans-serif",
        }}
      >
        {organizationName}
      </div>

      {/* Decorative line */}
      <div
        style={{
          position: "absolute",
          top: hasLogos ? "130px" : "84px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "137px",
          height: "0.5px",
          background:
            "linear-gradient(90deg, transparent, #ffd700, transparent)",
        }}
      />

      {/* Main Content */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          width: "593px",
          marginTop: "-20px",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #ffd700 0%, #ffffff 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "18px",
            letterSpacing: "1.1px",
          }}
        >
          {header}
        </div>

        {/* Ornamental divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "23px",
          }}
        >
          <div
            style={{ width: "46px", height: "0.5px", background: "#ffd700" }}
          />
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#ffd700",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{
              width: "9px",
              height: "9px",
              background: "linear-gradient(135deg, #ffd700, #c0c0c0)",
              borderRadius: "50%",
            }}
          />
          <div
            style={{
              width: "7px",
              height: "7px",
              background: "#c0c0c0",
              transform: "rotate(45deg)",
            }}
          />
          <div
            style={{ width: "46px", height: "0.5px", background: "#c0c0c0" }}
          />
        </div>

        {/* Awarded text */}
        <div
          style={{
            fontSize: "12px",
            color: "#c0c0c0",
            fontWeight: 400,
            marginBottom: "14px",
            letterSpacing: "1.8px",
            textTransform: "uppercase",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          Is Hereby Awarded To
        </div>

        {/* Recipient Name */}
        <div
          style={{
            fontSize: "33px",
            fontWeight: 700,
            background:
              "linear-gradient(135deg, #ffd700 0%, #ffffff 50%, #ffd700 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "23px",
            letterSpacing: "0.7px",
            textShadow: "0 0 14px rgba(255, 215, 0, 0.5)",
          }}
        >
          {recipientName}
        </div>

        {/* Achievement text */}
        <div
          style={{
            fontSize: "11px",
            color: "#a0a0a0",
            fontWeight: 400,
            marginBottom: "10px",
            letterSpacing: "1.1px",
            fontFamily: "'Lato', sans-serif",
          }}
        >
          For Outstanding Achievement In
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
              color: "white",
              margin: "10px 20px",
              lineHeight: "1.4",
              wordWrap: "break-word",
              // maxWidth: "28%",
              marginLeft: "auto",
              marginRight: "auto",
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
          bottom: "50px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
          padding: "0 82px",
        }}
      >
        {/* Date with seal */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "27px",
              height: "27px",
              margin: "0 auto 7px",
              borderRadius: "50%",
              border: "1px solid #ffd700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 215, 0, 0.1)",
              position: "relative",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                color: "#ffd700",
                fontWeight: 700,
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {new Date(date).getFullYear()}
            </div>
            <div
              style={{
                position: "absolute",
                inset: "2px",
                border: "0.5px solid rgba(255, 215, 0, 0.4)",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              fontSize: "10px",
              color: "#c0c0c0",
              marginBottom: "5px",
              fontFamily: "'Lato', sans-serif",
              letterSpacing: "0.7px",
            }}
          >
            ISSUED
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#ffffff",
              fontWeight: 600,
              fontFamily: "'Lato', sans-serif",
            }}
          >
            {new Date(date).toLocaleDateString("en-US", {
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
                width: "96px",
                height: "0.5px",
                background:
                  "linear-gradient(90deg, transparent, #ffd700, transparent)",
                margin: "0 auto 6px",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                color: "#ffffff",
                fontWeight: 600,
                marginBottom: "3px",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {signatoryName1}
            </div>
            {signatoryTitle1 && (
              <div
                style={{
                  fontSize: "9px",
                  color: "#c0c0c0",
                  fontWeight: 400,
                  fontFamily: "'Lato', sans-serif",
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
                width: "96px",
                height: "0.5px",
                background:
                  "linear-gradient(90deg, transparent, #c0c0c0, transparent)",
                margin: "0 auto 6px",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                color: "#ffffff",
                fontWeight: 600,
                marginBottom: "3px",
                fontFamily: "'Lato', sans-serif",
              }}
            >
              {signatoryName2}
            </div>
            {signatoryTitle2 && (
              <div
                style={{
                  fontSize: "9px",
                  color: "#c0c0c0",
                  fontWeight: 400,
                  fontFamily: "'Lato', sans-serif",
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
            bottom: "21px",
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: "8px",
            color: "rgba(255, 215, 0, 0.5)",
            letterSpacing: "1.1px",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 300,
          }}
        >
          CERTIFICATE № {certificateId}
        </div>
      )}
    </div>
  );
}
