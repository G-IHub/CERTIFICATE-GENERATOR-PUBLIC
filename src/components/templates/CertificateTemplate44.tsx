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

export default function CertificateTemplate44({
  header = "Certificate of Recognition",
  courseTitle = "Leadership & Management Programme",
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
  const teal = themeColors?.primary ?? "#0D9488";
  const navy = themeColors?.secondary ?? "#0F172A";
  const textCol = themeColors?.text ?? "#0F172A";
  const bg = themeColors?.background ?? "#F8FAFC";

  useEffect(() => {
    const id = "dm-serif-t44";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const logos = organizationLogos ?? [];

  return (
    <div style={{
      width: 800, height: 600, position: "relative",
      background: bg, overflow: "hidden",
      fontFamily: "'DM Sans', sans-serif",
    }}>

      {/* Left color strip */}
      <div style={{
        position: "absolute", top: 0, left: 0, width: 8, height: "100%",
        background: `linear-gradient(to bottom, ${teal}, ${teal}88)`,
      }} />

      {/* Top-right decorative hexagon group */}
      {[
        { size: 80, top: -20, right: -20, opacity: 0.08 },
        { size: 50, top: 40, right: 50, opacity: 0.12 },
        { size: 30, top: 70, right: 20, opacity: 0.18 },
      ].map((h, i) => (
        <div key={i} style={{
          position: "absolute", top: h.top, right: h.right,
          width: h.size, height: h.size,
          background: teal, opacity: h.opacity,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }} />
      ))}

      {/* Bottom-left decorative hexagons */}
      {[
        { size: 70, bottom: -15, left: 8, opacity: 0.08 },
        { size: 40, bottom: 45, left: 55, opacity: 0.12 },
      ].map((h, i) => (
        <div key={i} style={{
          position: "absolute", bottom: h.bottom, left: h.left,
          width: h.size, height: h.size,
          background: navy, opacity: h.opacity,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }} />
      ))}

      {/* Top header */}
      <div style={{
        position: "absolute", top: 0, left: 8, right: 0, height: 80,
        background: navy,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {(organizationLogo || logos[0]) ? (
            <img
              src={organizationLogo ?? logos[0]?.url}
              alt="org"
              style={{ height: 40, objectFit: "contain", filter: "brightness(0) invert(1)" }}
            />
          ) : (
            <div style={{
              width: 40, height: 40, borderRadius: 6,
              border: `2px solid ${teal}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: teal, fontWeight: 700, fontSize: 18,
            }}>
              {organizationName.charAt(0)}
            </div>
          )}
          <p style={{ color: "white", fontWeight: 600, fontSize: 14, margin: 0, letterSpacing: 0.5 }}>
            {organizationName}
          </p>
        </div>

        {/* Teal accent badge */}
        <div style={{
          background: teal, borderRadius: 4,
          padding: "4px 14px",
        }}>
          <p style={{ color: "white", fontSize: 10, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
            Official
          </p>
        </div>
      </div>

      {/* Teal top accent line on header */}
      <div style={{
        position: "absolute", top: 80, left: 8, right: 0, height: 3,
        background: teal,
      }} />

      {/* Main content */}
      <div style={{
        position: "absolute", top: 96, left: 50, right: 50, bottom: 85,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 12,
      }}>
        {/* Header */}
        <p style={{
          color: teal, fontSize: 11, letterSpacing: 4,
          textTransform: "uppercase", fontWeight: 600, margin: 0,
        }}>
          {header}
        </p>

        <p style={{ color: `${textCol}77`, fontSize: 12, margin: 0 }}>
          This is to certify that
        </p>

        {/* Recipient name */}
        <p style={{
          color: navy,
          fontSize: 42,
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontStyle: "italic",
          margin: 0, lineHeight: 1.15,
        }}>
          {recipientName}
        </p>

        {/* Teal underline */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          <div style={{ width: 60, height: 3, background: teal, borderRadius: 2 }} />
          <div style={{ width: 20, height: 3, background: `${teal}55`, borderRadius: 2 }} />
          <div style={{ width: 8, height: 3, background: `${teal}33`, borderRadius: 2 }} />
        </div>

        {/* Body */}
        <p style={{ color: textCol, fontSize: 12.5, lineHeight: 1.75, maxWidth: 550, margin: 0 }}>
          has successfully completed all requirements for{" "}
          <strong>{courseTitle}</strong>.{" "}
          {description ?? "This certificate is awarded in recognition of outstanding achievement and dedication to professional excellence."}
        </p>

        {/* Date & ID row */}
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: teal }} />
            <p style={{ color: `${textCol}88`, fontSize: 11, margin: 0 }}>
              Date: <strong style={{ color: textCol }}>{date}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div style={{
        position: "absolute", bottom: 16, left: 50, right: 50,
        display: "flex", justifyContent: "space-between",
        borderTop: `1px solid ${textCol}11`,
        paddingTop: 12,
      }}>
        {[
          { name: signatoryName1, title: signatoryTitle1, url: signatureUrl1 },
          { name: signatoryName2, title: signatoryTitle2, url: signatureUrl2 },
        ].map((sig, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, width: 180 }}>
            {sig.url && <img src={sig.url} alt="sig" style={{ height: 28, objectFit: "contain" }} />}
            <div style={{ width: 130, height: 1, background: `${teal}66` }} />
            <p style={{ color: navy, fontSize: 10, fontWeight: 600, margin: 0 }}>{sig.name}</p>
            <p style={{ color: `${textCol}77`, fontSize: 9, margin: 0 }}>{sig.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
