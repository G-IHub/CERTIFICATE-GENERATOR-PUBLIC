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

export default function CertificateTemplate40({
  header = "Certificate of Excellence",
  courseTitle = "Advanced Leadership Programme",
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
  signatoryTitle2 = "Academic Director",
  signatureUrl2,
  mode = "student",
  themeColors,
}: Props) {
  const gold = themeColors?.primary ?? "#D4AF37";
  const goldDark = themeColors?.secondary ?? "#A07C10";
  const bg = themeColors?.background ?? "#0B0B0B";
  const textCol = themeColors?.text ?? "#FFFFFF";

  useEffect(() => {
    const id = "playfair-font-t40";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,600;1,400&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const logos = organizationLogos ?? [];

  return (
    <div style={{
      width: 800, height: 600, position: "relative",
      background: bg, overflow: "hidden",
      fontFamily: "'Cormorant Garamond', Georgia, serif",
    }}>

      {/* Outer gold border */}
      <div style={{
        position: "absolute", inset: 10,
        border: `2px solid ${gold}`,
        pointerEvents: "none",
      }} />
      {/* Inner gold border */}
      <div style={{
        position: "absolute", inset: 18,
        border: `1px solid ${goldDark}`,
        pointerEvents: "none",
      }} />

      {/* Corner ornaments — TL */}
      {[
        { top: 8, left: 8 },
        { top: 8, right: 8, left: "auto" },
        { bottom: 8, left: 8, top: "auto" },
        { bottom: 8, right: 8, top: "auto", left: "auto" },
      ].map((pos, i) => (
        <div key={i} style={{
          position: "absolute", width: 40, height: 40, ...pos,
          borderTop: i < 2 ? `3px solid ${gold}` : undefined,
          borderBottom: i >= 2 ? `3px solid ${gold}` : undefined,
          borderLeft: i === 0 || i === 2 ? `3px solid ${gold}` : undefined,
          borderRight: i === 1 || i === 3 ? `3px solid ${gold}` : undefined,
        }} />
      ))}

      {/* Top decorative bar */}
      <div style={{
        position: "absolute", top: 28, left: 28, right: 28, height: 1,
        background: `linear-gradient(to right, transparent, ${gold}, ${goldDark}, ${gold}, transparent)`,
      }} />

      {/* Bottom decorative bar */}
      <div style={{
        position: "absolute", bottom: 28, left: 28, right: 28, height: 1,
        background: `linear-gradient(to right, transparent, ${gold}, ${goldDark}, ${gold}, transparent)`,
      }} />

      {/* Central medallion circle */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 500, height: 500,
        borderRadius: "50%",
        border: `1px solid ${goldDark}22`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 560, height: 560,
        borderRadius: "50%",
        border: `1px solid ${gold}11`,
        pointerEvents: "none",
      }} />

      {/* Org section — top */}
      <div style={{
        position: "absolute", top: 38, left: 0, right: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
      }}>
        {(organizationLogo || logos[0]) && (
          <img
            src={organizationLogo ?? logos[0]?.url}
            alt="org"
            style={{ height: 32, objectFit: "contain", filter: "brightness(0) invert(1) sepia(1) saturate(3) hue-rotate(5deg)" }}
          />
        )}
        <p style={{ color: gold, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", margin: 0 }}>
          {organizationName}
        </p>
      </div>

      {/* Main content */}
      <div style={{
        position: "absolute", inset: 60,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", gap: 10,
      }}>
        {/* Header */}
        <p style={{ color: gold, fontSize: 11, letterSpacing: 6, textTransform: "uppercase", margin: 0 }}>
          {header}
        </p>

        {/* Gold rule */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, width: "60%" }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold})` }} />
          <div style={{ width: 6, height: 6, background: gold, transform: "rotate(45deg)" }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold})` }} />
        </div>

        {/* Presented to */}
        <p style={{ color: `${textCol}99`, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
          Presented to
        </p>

        {/* Name */}
        <p style={{
          color: gold,
          fontSize: 46,
          fontFamily: "'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          margin: 0,
          lineHeight: 1.1,
        }}>
          {recipientName}
        </p>

        {/* Gold rule */}
        <div style={{ width: "50%", height: 1, background: `linear-gradient(to right, transparent, ${goldDark}, transparent)` }} />

        {/* Body text */}
        <p style={{ color: `${textCol}cc`, fontSize: 12, lineHeight: 1.7, maxWidth: 500, margin: 0 }}>
          In recognition of the successful completion of{" "}
          <span style={{ color: textCol, fontWeight: 600 }}>{courseTitle}</span>.
          {description ? ` ${description}` : " This achievement reflects outstanding dedication and commitment to excellence."}
        </p>

        {/* Date */}
        <p style={{ color: gold, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
          {date}
        </p>
      </div>

      {/* Signatures */}
      <div style={{
        position: "absolute", bottom: 38, left: 50, right: 50,
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
      }}>
        {[
          { name: signatoryName1, title: signatoryTitle1, url: signatureUrl1 },
          { name: signatoryName2, title: signatoryTitle2, url: signatureUrl2 },
        ].map((sig, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, width: 180 }}>
            {sig.url && <img src={sig.url} alt="sig" style={{ height: 36, objectFit: "contain" }} />}
            <div style={{ width: "100%", height: 1, background: `linear-gradient(to right, transparent, ${gold}, transparent)` }} />
            <p style={{ color: gold, fontSize: 10, textTransform: "uppercase", letterSpacing: 1, margin: 0, textAlign: "center" }}>{sig.name}</p>
            <p style={{ color: `${textCol}88`, fontSize: 9, margin: 0, textAlign: "center" }}>{sig.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
