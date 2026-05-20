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

export default function CertificateTemplate42({
  header = "Certificate of Achievement",
  courseTitle = "Academic Excellence Programme",
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
  const burgundy = themeColors?.primary ?? "#6B1C25";
  const gold = themeColors?.secondary ?? "#C9A93F";
  const textCol = themeColors?.text ?? "#3B2A1A";
  const bg = themeColors?.background ?? "#F5F0E4";

  useEffect(() => {
    const id = "eb-garamond-t42";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=Cinzel:wght@400;600;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const logos = organizationLogos ?? [];

  return (
    <div className=""  style={{
      width: "800px", height: "600px",
      position: "relative",
      background: bg, overflow: "hidden",
      fontFamily: "'EB Garamond', Georgia, serif",
    }}>

      {/* Outer border */}
      <div style={{ position: "absolute", inset: 8, border: `3px double ${burgundy}`, pointerEvents: "none" }} />
      {/* Inner border */}
      <div style={{ position: "absolute", inset: 15, border: `1px solid ${gold}`, pointerEvents: "none" }} />
      {/* Innermost thin border */}
      <div style={{ position: "absolute", inset: 20, border: `1px solid ${burgundy}33`, pointerEvents: "none" }} />

      {/* Corner rosettes - pure CSS diamonds */}
      {[
        { top: 4, left: 4 }, { top: 4, right: 4, left: "auto" },
        { bottom: 4, left: 4, top: "auto" }, { bottom: 4, right: 4, top: "auto", left: "auto" },
      ].map((pos, i) => (
        <div key={i} style={{ position: "absolute", ...pos, width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ width: 10, height: 10, background: gold, transform: "rotate(45deg)" }} />
        </div>
      ))}

      {/* Top ornamental header band */}
      <div style={{
        position: "absolute", top: 24, left: 24, right: 24, height: 60,
        background: `linear-gradient(135deg, ${burgundy}18, ${burgundy}08)`,
        borderBottom: `1px solid ${gold}55`,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 16,
      }}>
        {(organizationLogo || logos[0]) && (
          <img src={organizationLogo ?? logos[0]?.url} alt="org" style={{ height: 36, objectFit: "contain" }} />
        )}
        <div style={{ textAlign: "center" }}>
          <p style={{
            color: burgundy, fontSize: 14, fontFamily: "'Cinzel', serif",
            letterSpacing: 3, margin: 0, textTransform: "uppercase",
          }}>
            {organizationName}
          </p>
        </div>
      </div>

      {/* Ornamental dividers */}
      {[86, 510].map((top, i) => (
        <div key={i} style={{
          position: "absolute", top, left: 40, right: 40,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${gold})` }} />
          <div style={{ width: 8, height: 8, background: gold, transform: "rotate(45deg)" }} />
          <div style={{ width: 5, height: 5, background: burgundy, transform: "rotate(45deg)" }} />
          <div style={{ width: 8, height: 8, background: gold, transform: "rotate(45deg)" }} />
          <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${gold})` }} />
        </div>
      ))}

      {/* Main content */}
      <div style={{
        position: "absolute", top: 60, left: 40, right: 40, bottom: 90,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        textAlign: "center", gap: 12,
      }}>
        {/* Header */}
        <p style={{
          color: burgundy, fontSize: 22, fontFamily: "'Cinzel', serif",
          letterSpacing: 4, textTransform: "uppercase", fontWeight: 700, margin: 0,
        }}>
          {header}
        </p>

        <p style={{ color: `${textCol}99`, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
          This is to proudly certify that
        </p>

        {/* Recipient name */}
        <p style={{
          color: burgundy,
          fontSize: 44,
          fontStyle: "italic",
          fontFamily: "'EB Garamond', Georgia, serif",
          margin: 0, lineHeight: 1.1,
        }}>
          {recipientName}
        </p>

        {/* Thin rule */}
        <div style={{ width: 200, height: 1, background: `linear-gradient(to right, transparent, ${gold}, transparent)` }} />

        {/* Body */}
        <p style={{ color: textCol, fontSize: 13, lineHeight: 1.8, maxWidth: 520, margin: 0 }}>
          has successfully completed all requirements for{" "}
          <strong style={{ fontStyle: "italic" }}>{courseTitle}</strong>.
          {" "}{description ?? "This certificate is conferred in recognition of exemplary dedication and outstanding scholarly achievement."}
        </p>

        {/* Date */}
        <p style={{ color: `${textCol}aa`, fontSize: 12, letterSpacing: 1, margin: 0 }}>
          Conferred on this day, <strong style={{ color: textCol }}>{date}</strong>
        </p>
      </div>

      {/* Signatures footer */}
      <div style={{
        position: "absolute", bottom: 40, left: 50, right: 50,
        display: "flex", justifyContent: "space-around",
      }}>
        {[
          { name: signatoryName1, title: signatoryTitle1, url: signatureUrl1 },
          { name: signatoryName2, title: signatoryTitle2, url: signatureUrl2 },
        ].map((sig, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, width: 180 }}>
            {sig.url && <img src={sig.url} alt="sig" style={{ height: 32, objectFit: "contain" }} />}
            <div style={{ width: "100%", height: 1, background: burgundy }} />
            <p style={{ color: burgundy, fontSize: 10, fontFamily: "'Cinzel', serif", letterSpacing: 1, textTransform: "uppercase", margin: 0, textAlign: "center" }}>{sig.name}</p>
            <p style={{ color: `${textCol}88`, fontSize: 9, margin: 0, textAlign: "center" }}>{sig.title}</p>
          </div>
        ))}
      </div>

      {/* Subtle background watermark text */}
      <div style={{
        position: "absolute", bottom: 24, left: 0, right: 0,
        textAlign: "center",
        color: `${gold}33`, fontSize: 9, letterSpacing: 6, textTransform: "uppercase",
        fontFamily: "'Cinzel', serif",
      }}>
        Official Certificate of Record
      </div>
    </div>
  );
}
