import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate25Props {
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

export default function CertificateTemplate25({
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
}: CertificateTemplate25Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "poppins-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  // Get logos to display
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
          "linear-gradient(to bottom, #ffffff 0%, #f0f9ff 50%, #ffffff 100%)",
        fontFamily: "'Poppins', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Watercolor splash effects */}
      <div
        style={{
          position: "absolute",
          top: "-45px",
          right: "-45px",
          width: "275px",
          height: "275px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
          filter: "blur(23px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-70px",
          left: "-70px",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
          filter: "blur(27px)",
        }}
      />

      {/* Top wave decoration */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "91px",
        }}
        viewBox="0 0 800 91"
        preserveAspectRatio="none"
      >
        <path
          d="M0,23 Q200,46 400,23 T800,23 L800,0 L0,0 Z"
          fill="url(#topGradient)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="topGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Bottom wave decoration */}
      <svg
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          height: "91px",
        }}
        viewBox="0 0 800 91"
        preserveAspectRatio="none"
      >
        <path
          d="M0,68 Q200,45 400,68 T800,68 L800,91 L0,91 Z"
          fill="url(#bottomGradient)"
          opacity="0.3"
        />
        <defs>
          <linearGradient id="bottomGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      {/* Decorative circles */}
      <div
        style={{
          position: "absolute",
          top: "46px",
          left: "34px",
          width: "23px",
          height: "23px",
          borderRadius: "50%",
          border: "1px solid rgba(59, 130, 246, 0.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "80px",
          right: "46px",
          width: "34px",
          height: "34px",
          borderRadius: "50%",
          border: "1px solid rgba(16, 185, 129, 0.2)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "68px",
          left: "57px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "rgba(59, 130, 246, 0.1)",
        }}
      />

      {/* Logo Section */}
      {hasLogos && (
        <div
          style={{
            position: "absolute",
            top: "46px",
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
                width: "41px",
                height: "41px",
                borderRadius: "50%",
                background: "#ffffff",
                border: "1px solid #3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "7px",
                boxShadow: "0 2px 9px rgba(59, 130, 246, 0.15)",
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
          top: hasLogos ? "96px" : "55px",
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: "16px",
          fontWeight: 600,
          background: "linear-gradient(135deg, #3b82f6 0%, #10b981 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "1.4px",
          textTransform: "uppercase",
          marginBottom: "-10px",
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
          width: "615px",
        }}
      >
        {/* Header */}
        <div
          style={{
            fontSize: "23px",
            fontWeight: 700,
            color: "#1e293b",
            marginTop: "-50px",
            marginBottom: "5px",
            letterSpacing: "0.7px",
            textTransform: "uppercase",
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
            gap: "6px",
            marginBottom: "21px",
          }}
        >
          <div
            style={{
              width: "57px",
              height: "1px",
              borderRadius: "0.5px",
              background: "linear-gradient(90deg, transparent, #3b82f6)",
            }}
          />
          <div
            style={{
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #3b82f6, #10b981)",
            }}
          />
          <div
            style={{
              width: "57px",
              height: "1px",
              borderRadius: "0.5px",
              background: "linear-gradient(90deg, #10b981, transparent)",
            }}
          />
        </div>

        {/* Awarded text */}
        <div
          style={{
            fontSize: "11px",
            color: "#64748b",
            fontWeight: 400,
            marginBottom: "11px",
            letterSpacing: "0.9px",
          }}
        >
          This is proudly presented to
        </div>

        {/* Recipient Name */}
        <div
          style={{
            fontSize: "32px",
            fontWeight: 700,
            background: "linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            marginBottom: "21px",
            letterSpacing: "0.2px",
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
            letterSpacing: "0.7px",
          }}
        >
          in recognition of successful completion of
        </div>

        {/* Course Title */}
        <div
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: "#1e293b",
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
          bottom: "46px",
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          alignItems: "flex-end",
          padding: "0 73px",
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

      {/* Certificate ID with badge */}
      {certificateId && (
        <div
          style={{
            position: "absolute",
            bottom: "18px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            padding: "5px 11px",
            background: "rgba(59, 130, 246, 0.05)",
            borderRadius: "11px",
            border: "0.5px solid rgba(59, 130, 246, 0.2)",
          }}
        >
          <div
            style={{
              fontSize: "8px",
              color: "#64748b",
              letterSpacing: "0.5px",
              fontWeight: 500,
            }}
          >
            Certificate ID: {certificateId}
          </div>
        </div>
      )}
    </div>
  );
}
