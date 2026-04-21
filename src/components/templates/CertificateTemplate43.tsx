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

export default function CertificateTemplate43({
  header = "Certificate of Completion",
  courseTitle = "Creative Excellence Programme",
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
  signatoryTitle2 = "Programme Lead",
  signatureUrl2,
  mode = "student",
  themeColors,
}: Props) {
  const p1 = themeColors?.primary ?? "#7C3AED";
  const p2 = themeColors?.secondary ?? "#EC4899";
  const textCol = themeColors?.text ?? "#1F1235";
  const bg = themeColors?.background ?? "#FDFBFF";

  useEffect(() => {
    const id = "inter-font-t43";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&family=Fraunces:ital,wght@0,300;1,400;1,600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const logos = organizationLogos ?? [];

  return (
    <div style={{
      width: 800, height: 600, position: "relative",
      background: bg, overflow: "hidden",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* Gradient arc — top */}
      <div style={{
        position: "absolute", top: -160, left: -80, width: 500, height: 400,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${p1}22 0%, ${p2}11 50%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Gradient arc — bottom right */}
      <div style={{
        position: "absolute", bottom: -120, right: -60, width: 400, height: 360,
        borderRadius: "50%",
        background: `radial-gradient(ellipse, ${p2}22 0%, ${p1}11 50%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      {/* Top gradient ribbon */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 6,
        background: `linear-gradient(to right, ${p1}, ${p2}, ${p1})`,
      }} />

      {/* Bottom gradient ribbon */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(to right, ${p2}, ${p1})`,
        opacity: 0.5,
      }} />

      {/* Header bar */}
      <div style={{
        position: "absolute", top: 6, left: 0, right: 0, height: 64,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {(organizationLogo || logos[0]) ? (
            <img
              src={organizationLogo ?? logos[0]?.url}
              alt="org"
              style={{ height: 36, objectFit: "contain" }}
            />
          ) : (
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: `linear-gradient(135deg, ${p1}, ${p2})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "white", fontWeight: 700, fontSize: 16,
            }}>
              {organizationName.charAt(0)}
            </div>
          )}
          <p style={{ color: textCol, fontWeight: 600, fontSize: 13, margin: 0 }}>{organizationName}</p>
        </div>
        <p style={{ color: `${textCol}55`, fontSize: 10, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
          Official Document
        </p>
      </div>

      {/* Thin separator */}
      <div style={{
        position: "absolute", top: 72, left: 40, right: 40, height: 1,
        background: `linear-gradient(to right, ${p1}33, ${p2}33, transparent)`,
      }} />

      {/* Main content */}
      <div style={{
        position: "absolute", top: 82, left: 50, right: 50, bottom: 80,
        display: "flex", flexDirection: "column", justifyContent: "center", gap: 14,
      }}>
        {/* Header label */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 3, height: 20, background: `linear-gradient(to bottom, ${p1}, ${p2})`, borderRadius: 2 }} />
          <p style={{ color: `${textCol}88`, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", margin: 0 }}>
            {header}
          </p>
        </div>

        <p style={{ color: `${textCol}66`, fontSize: 12, margin: 0 }}>
          This is to certify that
        </p>

        {/* Name */}
        <p style={{
          fontSize: 44,
          fontFamily: "'Fraunces', Georgia, serif",
          fontStyle: "italic",
          fontWeight: 600,
          margin: 0,
          lineHeight: 1.1,
          background: `linear-gradient(135deg, ${p1}, ${p2})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          {recipientName}
        </p>

        {/* Underline */}
        <div style={{ width: 280, height: 2, background: `linear-gradient(to right, ${p1}, ${p2})`, borderRadius: 1 }} />

        {/* Body */}
        <p style={{ color: textCol, fontSize: 12, lineHeight: 1.75, maxWidth: 560, margin: 0 }}>
          has successfully completed{" "}
          <span style={{ fontWeight: 600 }}>{courseTitle}</span>.{" "}
          {description ?? "This achievement reflects exceptional effort, creativity, and a commitment to continuous growth and learning."}
        </p>

        {/* Date */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 16, height: 16, borderRadius: "50%", background: `linear-gradient(135deg, ${p1}, ${p2})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white" }} />
          </div>
          <p style={{ color: `${textCol}99`, fontSize: 11, margin: 0 }}>
            Date awarded: <strong style={{ color: textCol }}>{date}</strong>
          </p>
        </div>
      </div>

      {/* Signatures */}
      <div style={{
        position: "absolute", bottom: 16, left: 50, right: 50,
        display: "flex", justifyContent: "space-between",
      }}>
        {[
          { name: signatoryName1, title: signatoryTitle1, url: signatureUrl1 },
          { name: signatoryName2, title: signatoryTitle2, url: signatureUrl2 },
        ].map((sig, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 3, width: 180 }}>
            {sig.url && <img src={sig.url} alt="sig" style={{ height: 28, objectFit: "contain" }} />}
            <div style={{ height: 1, background: `linear-gradient(to right, ${p1}66, ${p2}33)` }} />
            <p style={{ color: textCol, fontSize: 10, fontWeight: 600, margin: 0 }}>{sig.name}</p>
            <p style={{ color: `${textCol}66`, fontSize: 9, margin: 0 }}>{sig.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
