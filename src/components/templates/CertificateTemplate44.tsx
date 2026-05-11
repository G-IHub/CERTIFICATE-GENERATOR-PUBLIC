import { useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";
import { color } from "motion/react";
import deleteSign from "../../assets/delete.png";

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
  // Dynamic theme values — must stay as inline style (Tailwind can't resolve runtime values)
  const teal = themeColors?.primary ?? "#0D9488";
  const navy = themeColors?.secondary ?? "#0F172A";
  const textCol = themeColors?.text ?? "white";
  const bg = themeColors?.background ?? "#F8FAFC";

  useEffect(() => {
    const id = "dm-serif-t44";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const logo1 =
    organizationLogos && organizationLogos[0]?.url
      ? organizationLogos[0]
      : null;
  const logo2 =
    organizationLogos && organizationLogos[1]?.url
      ? organizationLogos[1]
      : null;
  const fallbackLogo = organizationLogo;

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    // Fixed 800×600 canvas — width/height must stay inline (Tailwind has no w-[800px] preset)
    <div
      className="relative overflow-hidden"
      style={{
        width: 800,
        height: 600,
        background: bg,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Left color strip — dynamic teal gradient, must be inline */}
      <div
        className="absolute top-0 left-0 h-full"
        style={{
          width: 8,
          background: `linear-gradient(to bottom, ${teal}, ${teal}88)`,
        }}
      />

      {/* Top-right decorative hexagon group */}
      {[
        { size: 80, top: -20, right: -20, opacity: 0.08 },
        { size: 50, top: 40, right: 50, opacity: 0.12 },
        { size: 30, top: 70, right: 20, opacity: 0.18 },
      ].map((h, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: h.top,
            right: h.right,
            width: h.size,
            height: h.size,
            background: teal,
            opacity: h.opacity,
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
      ))}

      {/* Bottom-left decorative hexagons */}
      {[
        { size: 70, bottom: -15, left: 8, opacity: 0.08 },
        { size: 40, bottom: 45, left: 55, opacity: 0.12 },
      ].map((h, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            bottom: h.bottom,
            left: h.left,
            width: h.size,
            height: h.size,
            background: navy,
            opacity: h.opacity,
            clipPath:
              "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
          }}
        />
      ))}

      {/* Top header bar */}
      <div
        className="absolute top-0 right-0 flex items-center justify-between px-10"
        style={{ left: 8, height: 80, background: navy }}
      >
        {/* Logos */}
        <div className="flex">
          {logo1 ? (
            <div className="flex items-center gap-2">
              <img
                src={logo1.url}
                alt={logo1.name || "Logo"}
                className="w-16 object-contain"
              />
              <p
                className="text-sm font-medium m-0"
                style={{ color: "white" }}
              >
                {logo1.name}
              </p>
            </div>
          ) : fallbackLogo ? (
            <img
              src={fallbackLogo}
              alt="Logo"
              className="w-16 object-contain"
            />
          ) : null}

          {logo2 ? (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-white font-semibold">
                <p className="text-2xl font-bold text-white">
                  <div className="w-3 mr-3"
                    style={{
                      backgroundColor: "white",
                      WebkitMaskImage: `url(${deleteSign})`,
                      maskImage: `url(${deleteSign})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                  }}> </div>
                </p>
              </span>
              <img src={logo2.url} alt="Logo" className="w-16 object-contain" />
              <p className="text-white text-sm font-medium m-0">{logo2.name}</p>
            </div>
          ) : null}
        </div>

        {/* Teal accent badge */}
        <div className="rounded px-3 py-1" style={{ background: teal }}>
          <p className="text-white text-[10px] font-semibold tracking-widest uppercase m-0">
            {/* Official */}
          </p>
        </div>
      </div>

      {/* Teal accent line below header */}
      <div
        className="absolute right-0 h-[3px]"
        style={{ top: 80, left: 8, background: teal }}
      />

      {/* Main content area */}
      <div
        className="absolute flex flex-col justify-center gap-3"
        style={{ top: 96, left: 50, right: 50, bottom: 85 }}
      >
        {/* Certificate header label */}
        <p
          className="text-[25px] font-bold uppercase tracking-[4px] m-0"
          style={{ color: teal }}
        >
          {header}
        </p>

        {/* Sub-label */}
        <p className="text-md m-0" style={{ color: "black" }}>
          Presented to:
        </p>

        {/* Recipient name */}
        <p
          className="text-[42px] italic m-0 leading-[1.15]"
          style={{
            color: navy,
            fontFamily: "'DM Serif Display', Georgia, serif",
          }}
        >
          {recipientName}
        </p>

        {/* Teal underline bars */}
        <div className="flex items-center gap-1">
          <div
            className="h-[3px] w-[60px] rounded-sm"
            style={{ background: teal }}
          />
          <div
            className="h-[3px] w-[20px] rounded-sm"
            style={{ background: `${teal}55` }}
          />
          <div
            className="h-[3px] w-[8px] rounded-sm"
            style={{ background: `${teal}33` }}
          />
        </div>

        {/* Description */}
        <p
          className="text-[12.5px] leading-[1.75] max-w-[550px] m-0"
          style={{ color: "#0F172A" }}
        >
          {description ??
            "This certificate is awarded in recognition of outstanding achievement and dedication to professional excellence."}
        </p>

        {/* Course title */}
        <strong className="font-extrabold text-2xl" style={{ color: navy }}>
          {courseTitle}
        </strong>

        {/* Date row */}
        <div className="flex items-center gap-6 mt-1">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: teal }}
            />
            <p className="text-[11px] m-0" style={{ color: "black" }}>
              Date: <strong style={{ color: "black" }}>{formattedDate}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Signatures */}
      <div
        className="absolute flex justify-between pt-3"
        style={{
          bottom: 16,
          left: 50,
          right: 50,
          borderTop: `1px solid ${textCol}11`,
        }}
      >
        {[
          { name: signatoryName1, title: signatoryTitle1, url: signatureUrl1 },
          { name: signatoryName2, title: signatoryTitle2, url: signatureUrl2 },
        ].map((sig, i) => (
          <div key={i} className="flex flex-col gap-[3px] w-[180px]">
            {sig.url && (
              <img
                src={sig.url}
                alt="sig"
                className="mr-20 object-contain"
                style={{ height: 60 }}
              />
            )}
            <div
              className="w-[130px] h-px -mt-[10px]"
              style={{ background: `${teal}66` }}
            />
            <p
              className="text-[10px] font-semibold m-0"
              style={{ color: navy }}
            >
              {sig.name}
            </p>
            <p className="text-[9px] m-0" style={{ color: `${textCol}77` }}>
              {sig.title}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
