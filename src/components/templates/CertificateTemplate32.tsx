import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate32Props {
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

export default function CertificateTemplate32({
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
}: CertificateTemplate32Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "nunito-eco-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800&family=Raleway:wght@300;400;500;600;700&display=swap";
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
        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
        fontFamily: "'Raleway', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Organic leaf patterns */}
      <div
        style={{
          position: "absolute",
          top: "-23px",
          left: "-23px",
          width: "160px",
          height: "160px",
          borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
          background:
            "radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-34px",
          right: "-34px",
          width: "182px",
          height: "182px",
          borderRadius: "63% 37% 54% 46% / 55% 48% 52% 45%",
          background:
            "radial-gradient(circle, rgba(34, 197, 94, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Leaf icons decoration */}
      <div
        style={{
          position: "absolute",
          top: "46px",
          left: "23px",
          fontSize: "27px",
          opacity: 0.15,
          transform: "rotate(-25deg)",
        }}
      >
        🌿
      </div>
      <div
        style={{
          position: "absolute",
          top: "114px",
          right: "27px",
          fontSize: "32px",
          opacity: 0.12,
          transform: "rotate(30deg)",
        }}
      >
        🍃
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "68px",
          left: "34px",
          fontSize: "25px",
          opacity: 0.13,
          transform: "rotate(15deg)",
        }}
      >
        🌱
      </div>

      {/* Main container */}
      <div
        style={{
          position: "absolute",
          inset: "27px",
          background: "#ffffff",
          borderRadius: "8px",
          border: "2px solid #10b981",
          boxShadow:
            "0 7px 18px rgba(16, 185, 129, 0.2), inset 0 0 23px rgba(236, 253, 245, 0.8)",
        }}
      >
        {/* Eco-friendly corner decorations */}
        <div
          style={{
            position: "absolute",
            top: "-1px",
            left: "-1px",
            width: "91px",
            height: "91px",
            borderTopLeftRadius: "8px",
            background: "linear-gradient(135deg, #10b981 0%, transparent 60%)",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "-1px",
            right: "-1px",
            width: "91px",
            height: "91px",
            borderTopRightRadius: "8px",
            background: "linear-gradient(-135deg, #22c55e 0%, transparent 60%)",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-1px",
            left: "-1px",
            width: "91px",
            height: "91px",
            borderBottomLeftRadius: "8px",
            background: "linear-gradient(45deg, #059669 0%, transparent 60%)",
            opacity: 0.15,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-1px",
            right: "-1px",
            width: "91px",
            height: "91px",
            borderBottomRightRadius: "8px",
            background: "linear-gradient(-45deg, #14b8a6 0%, transparent 60%)",
            opacity: 0.15,
          }}
        />

        {/* Earth icon at top */}
        <div
          style={{
            position: "absolute",
            top: "-18px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "46px",
            height: "46px",
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            borderRadius: "50%",
            border: "2px solid #ffffff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 5px 11px rgba(16, 185, 129, 0.3)",
          }}
        >
          <div style={{ fontSize: "23px" }}>🌍</div>
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
              gap: logosToDisplay.length > 1 ? "16px" : "0",
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
                  borderRadius: "6px",
                  background:
                    "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)",
                  border: "1px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "5px",
                  boxShadow: "0 2px 8px rgba(16, 185, 129, 0.2)",
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
            top: hasLogos ? "87px" : "41px",
            left: 0,
            right: 0,
            textAlign: "center",
            fontSize: "17px",
            fontWeight: 800,
            color: "#047857",
            letterSpacing: "1.6px",
            textTransform: "uppercase",
            fontFamily: "'Nunito', sans-serif",
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
              fontSize: "24px",
              fontWeight: 800,
              color: "#10b981",
              marginBottom: "16px",
              letterSpacing: "2.3px",
              textTransform: "uppercase",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {header}
          </div>

          {/* Leaf divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "9px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, transparent, #10b981)",
                borderRadius: "1px",
              }}
            />
            <div style={{ fontSize: "13px" }}>🌿</div>
            <div style={{ fontSize: "15px", color: "#10b981" }}>●</div>
            <div style={{ fontSize: "13px" }}>🌿</div>
            <div
              style={{
                width: "80px",
                height: "1px",
                background: "linear-gradient(90deg, #10b981, transparent)",
                borderRadius: "1px",
              }}
            />
          </div>

          {/* Awarded text */}
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: 500,
              marginBottom: "13px",
              letterSpacing: "0.9px",
              textTransform: "uppercase",
            }}
          >
            Certificate Awarded To
          </div>

          {/* Recipient Name */}
          <div
            style={{
              fontSize: "31px",
              fontWeight: 800,
              color: "#047857",
              marginBottom: "18px",
              letterSpacing: "0.5px",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {recipientName}
          </div>

          {/* Achievement text */}
          <div
            style={{
              fontSize: "10px",
              color: "#6b7280",
              fontWeight: 500,
              marginBottom: "11px",
              letterSpacing: "0.7px",
            }}
          >
            For Completing The Program
          </div>

          {/* Course Title */}
          <div
            style={{
              fontSize: "21px",
              fontWeight: 700,
              color: "#065f46",
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

        {/* Certificate ID with recycle symbol */}
        {certificateId && (
          <div
            style={{
              position: "absolute",
              bottom: "11px",
              left: "50%",
              transform: "translateX(-50%)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <div style={{ fontSize: "9px" }}>♻️</div>
            <div
              style={{
                fontSize: "8px",
                color: "#059669",
                letterSpacing: "0.7px",
                fontWeight: 600,
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
