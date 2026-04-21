import { useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";

interface Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[];
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

export default function CertificateTemplate41({
  header = "Certificate of Completion",
  courseTitle = "Professional Development Programme",
  description,
  date = "2024-01-01",
  recipientName = "Full Name Here",
  organizationName = "Your Organisation",
  organizationLogo,
  organizationLogos,
  signatoryName1 = "Director",
  signatoryTitle1 = "Chief Executive Officer",
  signatureUrl1,
  signatoryName2 = "Registrar",
  signatoryTitle2 = "Programme Director",
  signatureUrl2,
  mode = "student",
  themeColors,
}: Props) {
  const primary = themeColors?.primary ?? "#0F4C81";
  const accent = themeColors?.secondary ?? "#1A8FD1";
  const textCol = themeColors?.text ?? "#1a2744";
  const bg = themeColors?.background ?? "#FFFFFF";
  const scale = mode === "student" ? 1 : 0.7;

  useEffect(() => {
    const id = "montserrat-font-t41";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const logos = organizationLogos ?? [];

  return (
    <div style={{
      width: 800, height: 600, position: "relative",
      background: bg, overflow: "hidden",
      transform: `scale(${scale})`, transformOrigin: "top left",
      fontFamily: "'Montserrat', sans-serif",
    }}>

      {/* Diagonal left panel */}
      <div style={{
        position: "absolute",
        top: 0, left: 0, width: 260, height: "100%",
        background: `linear-gradient(160deg, ${primary} 0%, ${accent} 100%)`,
        clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
      }} />

      {/* Diagonal accent line */}
      <div style={{
        position: "absolute",
        top: 0, left: 250, width: 8, height: "100%",
        background: `linear-gradient(to bottom, ${accent}44, ${accent}00)`,
        clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
      }} />

      {/* Left panel content */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 210, height: "100%",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: 14,
        padding: "40px 20px",
      }}>
        {(organizationLogo || logos[0]) ? (
          <img
            src={organizationLogo ?? logos[0]?.url}
            alt="org"
            style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 8, background: "rgba(255,255,255,0.1)", padding: 6 }}
          />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "white", fontSize: 22, fontWeight: 700 }}>
              {organizationName.charAt(0)}
            </span>
          </div>
        )}

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "white", fontSize: 13, fontWeight: 700, letterSpacing: 1, margin: 0 }}>
            {organizationName}
          </p>
        </div>

        {/* Decorative dots */}
        <div style={{ display: "flex", gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: `rgba(255,255,255,${0.4 + i * 0.2})` }} />
          ))}
        </div>

        {/* Side label */}
        <p style={{
          color: "rgba(255,255,255,0.7)", fontSize: 9, letterSpacing: 3,
          textTransform: "uppercase", margin: 0, writingMode: "vertical-rl",
          transform: "rotate(180deg)",
        }}>
          Official Certificate
        </p>
      </div>

      {/* Right content area */}
      <div style={{
        position: "absolute", top: 0, left: 255, right: 0, height: "100%",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "40px 40px 40px 20px",
        gap: 14,
      }}>
        {/* Top accent bar */}
        <div style={{ width: 50, height: 4, background: accent, borderRadius: 2 }} />

        {/* Header */}
        <div>
          <p style={{ color: `${textCol}99`, fontSize: 10, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            {header}
          </p>
        </div>

        {/* Presented to */}
        <p style={{ color: `${textCol}88`, fontSize: 11, margin: 0 }}>
          This is to certify that
        </p>

        {/* Recipient name */}
        <p style={{
          color: primary,
          fontSize: 36,
          fontFamily: "'Libre Baskerville', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 700,
          margin: 0,
          lineHeight: 1.15,
          borderBottom: `2px solid ${accent}44`,
          paddingBottom: 10,
        }}>
          {recipientName}
        </p>

        {/* Body text */}
        <p style={{ color: textCol, fontSize: 12, lineHeight: 1.7, margin: 0, maxWidth: 430 }}>
          has successfully completed{" "}
          <strong>{courseTitle}</strong>.{" "}
          {description ?? "This certificate is awarded in recognition of commitment, perseverance, and academic achievement."}
        </p>

        {/* Date pill */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 20, height: 2, background: accent }} />
          <p style={{ color: `${textCol}99`, fontSize: 11, margin: 0 }}>
            Awarded on: <strong style={{ color: textCol }}>{date}</strong>
          </p>
        </div>

        {/* Signatures */}
        <div style={{ display: "flex", gap: 32, marginTop: 8 }}>
          {[
            { name: signatoryName1, title: signatoryTitle1, url: signatureUrl1 },
            { name: signatoryName2, title: signatoryTitle2, url: signatureUrl2 },
          ].map((sig, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {sig.url && <img src={sig.url} alt="sig" style={{ height: 30, objectFit: "contain" }} />}
              <div style={{ width: 120, height: 1, background: `${textCol}33` }} />
              <p style={{ color: textCol, fontSize: 10, fontWeight: 600, margin: 0 }}>{sig.name}</p>
              <p style={{ color: `${textCol}77`, fontSize: 9, margin: 0 }}>{sig.title}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom accent strip */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 4,
        background: `linear-gradient(to right, ${primary}, ${accent}, ${primary})`,
      }} />
    </div>
  );
}
