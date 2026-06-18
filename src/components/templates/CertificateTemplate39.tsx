import { useRef, useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";

interface CertificateTemplate39Props {
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
  signatoryName3?: string;
  signatoryTitle3?: string;
  signatureUrl3?: string;
  mode?: "student" | "template-selection";
  certificateId?: string;
  themeColors?: ThemeColors;
}

export default function CertificateTemplate39({
  header,
  courseTitle,
  description,
  date,
  recipientName,
  isPreview = false,
  organizationName,
  organizationLogos,
  organizationLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  signatoryName3,
  signatoryTitle3,
  signatureUrl3,
  themeColors,
}: CertificateTemplate39Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const id = "greatvibes-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.href =
        "https://fonts.googleapis.com/css2?family=Great+Vibes:wght@400&display=swap";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }
  }, []);

  const logosToDisplay = organizationLogos || [];

  // Theme support
  const primary = themeColors?.primary ?? "#80183D";
  const secondary = themeColors?.secondary ?? "#673A8D";
  const darkPrimary = themeColors?.primary ? `${themeColors.primary}cc` : "#651C30";
  const background = themeColors?.background ?? "#1a1a1a";
  const text = themeColors?.text ?? "#ffffff";

  return (
    <div
      ref={ref}
      style={{
        width: "800px",
        height: "600px",
        position: "relative",
        background: background,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        overflow: "hidden",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        borderRadius: "8px",
      }}
    >
      {/* Header Logo and Organization Name */}
      <div className="absolute top-10 left-10 z-40 flex gap-3 justify-center items-center">
        {organizationLogo && (
          <img
            src={organizationLogo}
            alt="Organization"
            className="w-10 h-10 object-contain"
          />
        )}
        {logosToDisplay.length > 0 && (
          <img
            src={logosToDisplay[0].url}
            alt="Organization"
            className="w-10 h-10 object-contain"
          />
        )}
        {/* <div className="text-center">
          <p
            className="text-sm font-bold tracking-wide m-0"
            style={{ color: text }}
          >
            {organizationName}
          </p>
        </div> */}
      </div>

      {/* Decorative triangles - Right side */}
      <div style={{ position: "absolute", right: 20, top: 0, zIndex: 20 }}>
        {/* Triangle 1 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `80px solid ${secondary}`,
            right: 20,
            top: 0,
          }}
        />
        {/* Triangle 2 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `80px solid ${primary}`,
            transform: "rotate(180deg)",
            right: 20,
            top: 80,
          }}
        />
        {/* Triangle 3 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `80px solid ${darkPrimary}`,
            right: -30,
            top: 80,
          }}
        />
        {/* Triangle 4 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `80px solid ${primary}`,
            transform: "rotate(180deg)",
            right: 70,
            top: 0,
          }}
        />
        {/* Triangle 5 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: `50px solid ${secondary}`,
            right: 160,
            top: 8,
          }}
        />
        {/* Triangle 6 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "40px solid transparent",
            borderRight: "40px solid transparent",
            borderBottom: `50px solid ${secondary}`,
            transform: "rotate(180deg)",
            right: 0,
            top: 200,
          }}
        />
        {/* Triangle 7 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "20px solid transparent",
            borderRight: "20px solid transparent",
            borderBottom: `30px solid ${secondary}`,
            transform: "rotate(180deg)",
            right: 40,
            top: 256,
          }}
        />
      </div>

      {/* Decorative triangles - Bottom/Left side */}
      <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 20 }}>
        {/* Bottom right triangles */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: `40px solid ${primary}`,
            transform: "rotate(180deg)",
            right: -40,
            bottom: 120,
          }}
        />
        {/* Triangle - left bottom */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: `40px solid ${secondary}`,
            transform: "rotate(180deg)",
            left: 216,
            bottom: 32,
          }}
        />
        {/* Triangle - large left bottom 1 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${secondary}`,
            transform: "rotate(180deg)",
            left: -49,
            bottom: 60,
          }}
        />
        {/* Triangle - left bottom 2 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${secondary}`,
            transform: "rotate(180deg)",
            left: 50,
            bottom: 60,
          }}
        />
        {/* Triangle - left bottom 3 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${primary}`,
            left: 100,
            bottom: 60,
          }}
        />
        {/* Triangle - left bottom 4 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${primary}`,
            left: 50,
            bottom: 120,
          }}
        />
        {/* Triangle - left bottom 5 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${darkPrimary}`,
            transform: "rotate(180deg)",
            left: 0,
            bottom: 120,
          }}
        />
        {/* Triangle - left bottom 6 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${secondary}`,
            left: -52,
            bottom: 240,
          }}
        />
        {/* Triangle - left bottom 7 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${primary}`,
            transform: "rotate(180deg)",
            left: -52,
            bottom: 180,
          }}
        />
        {/* Triangle - left bottom 8 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${primary}`,
            transform: "rotate(180deg)",
            left: -52,
            bottom: 300,
          }}
        />
        {/* Triangle - left bottom 9 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${darkPrimary}`,
            left: 50,
            bottom: 0,
          }}
        />
        {/* Triangle - left bottom 10 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${secondary}`,
            left: -49,
            bottom: 0,
          }}
        />
        {/* Triangle - left bottom 11 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "50px solid transparent",
            borderRight: "50px solid transparent",
            borderBottom: `60px solid ${primary}`,
            transform: "rotate(180deg)",
            left: 0,
            bottom: 0,
          }}
        />
        {/* Triangle - left middle 1 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: `40px solid ${primary}`,
            left: 40,
            top: 192,
          }}
        />
        {/* Triangle - left middle 2 */}
        <div
          style={{
            position: "absolute",
            width: 0,
            height: 0,
            borderLeft: "30px solid transparent",
            borderRight: "30px solid transparent",
            borderBottom: `40px solid ${secondary}`,
            left: 40,
            bottom: 200,
          }}
        />
      </div>

      {/* Main Content - centered */}
      <div className="absolute inset-10 flex flex-col justify-center items-center text-center gap-10 z-30">
        {/* Certificate Title */}
        <div>
          <p
            className="text-5xl font-medium tracking-widest uppercase mb-2"
            style={{ color: text }}
          >
            {header?.split(" ")[0] || "CERTIFICATE"}
          </p>
          <p className="text-4xl font-bold uppercase" style={{ color: text }}>
            {header?.split(" ").slice(1).join(" ") || "OF ACHIEVEMENT"}
          </p>
        </div>

        {/* Subtitle */}
        <p className="text-sm" style={{ color: text }}>
          This Certificate is Presented to:
        </p>

        {/* Recipient Info */}
        <div className="flex flex-col gap-4 items-center text-center w-full">
          {/* Student Name with underline */}
          <div
            className="w-full border-b-2 pb-2"
            style={{ borderColor: primary }}
          >
            <div
              style={{
                fontSize: "40px",
                fontFamily: "'Great Vibes', cursive",
                color: text,
              }}
              className="m-0"
            >
              {recipientName}
            </div>
          </div>

          {/* Description */}
          <p
            className="max-w-4/5 text-xs font-bold text-center leading-relaxed"
            style={{ color: text }}
          >
            {description}{" "}
            <span style={{ color: primary }}>
              {courseTitle ||
                ""}
            </span>{" "}
            Organized by {organizationName}.
          </p>

          {/* Date */}
          <p
            className="text-xs font-semibold border px-4 py-2"
            style={{ color: text, borderColor: text }}
          >
            Held on: {date}
          </p>
        </div>

        {/* Signatures */}
        <div className="flex gap-10 ml-10 w-full justify-center items-center">
          {/* Signature 1 */}
          <div className="flex flex-col gap-2 items-center">
            <div
              className="border-b w-40 text-center min-h-10"
              style={{ borderColor: secondary }}
            >
              {signatureUrl1 && (
                <img
                  src={signatureUrl1}
                  alt="Signature 1"
                  className="h-16 ml-5 object-contain"
                />
              )}
            </div>
            <div
              className="text-center text-xs font-semibold"
              style={{ color: text }}
            >
              <p className="uppercase m-0 mb-0.5">{signatoryName1}</p>
              <p className="m-0">{signatoryTitle1}</p>
            </div>
          </div>

          {/* Signature 2 */}
          <div className="flex flex-col gap-2 items-center">
            <div
              className="border-b w-40 text-center min-h-10"
              style={{ borderColor: secondary }}
            >
              {signatureUrl2 && (
                <img
                  src={signatureUrl2}
                  alt="Signature 2"
                  className="h-16 ml-5 object-contain"
                />
              )}
            </div>
            <div
              className="text-center text-xs font-semibold"
              style={{ color: text }}
            >
              <p className="uppercase m-0 mb-0.5">{signatoryName2}</p>
              <p className="m-0">{signatoryTitle2}</p>
            </div>
          </div>

          {/* Signature 3 */}
          <div className="flex flex-col gap-2 items-center">
            <div
              className="border-b w-40 text-center min-h-10"
              style={{ borderColor: secondary }}
            >
              {signatureUrl3 && (
                <img
                  src={signatureUrl3}
                  alt="Signature 3"
                  className="h-16 ml-5 object-contain"
                />
              )}
            </div>
            <div
              className="text-center text-xs font-semibold"
              style={{ color: text }}
            >
              <p className="uppercase m-0 mb-0.5">{signatoryName3}</p>
              <p className="m-0">{signatoryTitle3}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
