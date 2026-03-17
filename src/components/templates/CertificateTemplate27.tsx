import { useRef, useEffect } from "react";
import type { Logo } from "../../App";

interface CertificateTemplate27Props {
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

export default function CertificateTemplate27({
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
}: CertificateTemplate27Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  useEffect(() => {
    const id = "archivo-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Archivo:wght@300;400;500;600;700;800;900&display=swap";
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
        background: "#ffffff",
        fontFamily: "'Archivo', sans-serif",
        overflow: "hidden",
        transform: `scale(${scale})`,
        transformOrigin: "top left",
      }}
    >
      {/* Left vertical color strip */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "18px",
          background:
            "linear-gradient(180deg, #ff6b6b 0%, #ee5a6f 25%, #c44569 50%, #8e44ad 75%, #6c5ce7 100%)",
        }}
      />

      {/* Top horizontal accent */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: "18px",
          right: 0,
          height: "3px",
          background: "linear-gradient(90deg, #ff6b6b 0%, #6c5ce7 100%)",
        }}
      />

      {/* Geometric pattern background */}
      <div
        style={{
          position: "absolute",
          inset: "3px 0 0 18px",
          backgroundImage: `
            linear-gradient(0deg, transparent 24%, rgba(108, 92, 231, .02) 25%, rgba(108, 92, 231, .02) 26%, transparent 27%, transparent 74%, rgba(108, 92, 231, .02) 75%, rgba(108, 92, 231, .02) 76%, transparent 77%, transparent),
            linear-gradient(90deg, transparent 24%, rgba(108, 92, 231, .02) 25%, rgba(108, 92, 231, .02) 26%, transparent 27%, transparent 74%, rgba(108, 92, 231, .02) 75%, rgba(108, 92, 231, .02) 76%, transparent 77%, transparent)
          `,
          backgroundSize: "18px 18px",
        }}
      />

      {/* Modern corner accent */}
      <div
        style={{
          position: "absolute",
          top: "3px",
          right: 0,
          width: "137px",
          height: "137px",
          background:
            "radial-gradient(circle at top right, rgba(108, 92, 231, 0.05) 0%, transparent 60%)",
        }}
      />

      {/* Logo Section */}
      {hasLogos && (
        <div
          style={{
            position: "absolute",
            top: "34px",
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
                width: "39px",
                height: "39px",
                background: "#ffffff",
                border: "1px solid #6c5ce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "6px",
                boxShadow: "0 2px 9px rgba(108, 92, 231, 0.15)",
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
          top: hasLogos ? "82px" : "41px",
          left: "18px",
          right: 0,
          textAlign: "center",
          fontSize: "16px",
          fontWeight: 800,
          color: "#2d3436",
          letterSpacing: "1.8px",
          textTransform: "uppercase",
        }}
      >
        {organizationName}
      </div>

      {/* Main Content Area */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          textAlign: "left",
          width: "615px",
          paddingLeft: "23px",
        }}
      >
        {/* Header with modern styling */}
        <div
          style={{
            fontSize: "27px",
            fontWeight: 900,
            color: "#6c5ce7",
            marginBottom: "14px",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
            lineHeight: "1.1",
            marginTop: "-50px",
          }}
        >
          {header}
        </div>

        {/* Accent bar */}
        <div
          style={{
            width: "114px",
            height: "2px",
            background: "linear-gradient(90deg, #ff6b6b, #6c5ce7)",
            marginBottom: "21px",
            borderRadius: "1px",
          }}
        />

        {/* Awarded text */}
        <div
          style={{
            fontSize: "12px",
            color: "#636e72",
            fontWeight: 500,
            marginBottom: "11px",
            letterSpacing: "0.7px",
            textTransform: "uppercase",
          }}
        >
          This Certificate is Presented to
        </div>

        {/* Recipient Name */}
        <div
          style={{
            fontSize: "35px",
            fontWeight: 900,
            color: "#2d3436",
            marginBottom: "18px",
            letterSpacing: "0.2px",
          }}
        >
          {recipientName}
        </div>

        {/* Achievement text */}
        <div
          style={{
            fontSize: "11px",
            color: "#636e72",
            fontWeight: 400,
            marginBottom: "9px",
            letterSpacing: "0.5px",
          }}
        >
          in recognition of successful completion of
        </div>

        {/* Course Title */}
        <div
          style={{
            fontSize: "22px",
            fontWeight: 700,
            color: "#2d3436",
            marginBottom: "15px",
            letterSpacing: "0px",
            lineHeight: "1.2",
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
              color: "black",
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
          bottom: "41px",
          left: "87px",
          right: "46px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {/* Date */}
        <div>
          <div
            style={{
              fontSize: "9px",
              color: "#636e72",
              marginBottom: "5px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            Date
          </div>
          <div
            style={{
              width: "87px",
              height: "1px",
              background: "#6c5ce7",
              margin: "0 0 5px 0",
            }}
          />
          <div
            style={{
              fontSize: "11px",
              color: "#2d3436",
              fontWeight: 700,
            }}
          >
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Signatory 1 */}
        {signatoryName1 && (
          <div>
            {signatureUrl1 && (
              <div style={{ marginBottom: "6px" }}>
                <img
                  src={signatureUrl1}
                  alt="Signature 1"
                  className="w-24 h-16"
                  style={{
                    marginBottom: -20,
                    marginLeft: "5px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <div
              style={{
                width: "91px",
                height: "1px",
                background: "#ff6b6b",
                margin: "0 0 5px 0",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                color: "#2d3436",
                fontWeight: 700,
                marginBottom: "2px",
              }}
            >
              {signatoryName1}
            </div>
            {signatoryTitle1 && (
              <div
                style={{
                  fontSize: "9px",
                  color: "#636e72",
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
          <div>
            {signatureUrl2 && (
              <div style={{ marginBottom: "6px" }}>
                <img
                  src={signatureUrl2}
                  alt="Signature 2"
                  className="w-24 h-16"
                  style={{
                    marginBottom: -20,
                    marginLeft: "5px",
                    objectFit: "contain",
                  }}
                />
              </div>
            )}
            <div
              style={{
                width: "91px",
                height: "1px",
                background: "#c44569",
                margin: "0 0 5px 0",
              }}
            />
            <div
              style={{
                fontSize: "11px",
                color: "#2d3436",
                fontWeight: 700,
                marginBottom: "2px",
              }}
            >
              {signatoryName2}
            </div>
            {signatoryTitle2 && (
              <div
                style={{
                  fontSize: "9px",
                  color: "#636e72",
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
            bottom: "18px",
            left: "87px",
            fontSize: "7px",
            color: "#b2bec3",
            letterSpacing: "0.7px",
            fontWeight: 500,
          }}
        >
          ID: {certificateId}
        </div>
      )}

      {/* Bottom right modern accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "0",
          height: "0",
          borderLeft: "68px solid transparent",
          borderBottom: "68px solid rgba(108, 92, 231, 0.08)",
        }}
      />
    </div>
  );
}
