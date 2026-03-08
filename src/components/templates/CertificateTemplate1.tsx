import { useRef, useEffect } from "react";
import badge from "../../assets/best.svg";
import vecto from "../../assets/Vecto.svg";
import type { Logo } from "../../App";

interface CertificateTemplate1Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string; // Deprecated: kept for backward compatibility
  organizationLogos?: Logo[]; // NEW: Array of organization logos
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

export default function CertificateTemplate1({
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
}: CertificateTemplate1Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  useEffect(() => {
    const id = "cinzel-decorative-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[800px] flex justify-center items-center ";

  // Determine which logos to use (new logos array or fallback to legacy)
  const logo1 =
    organizationLogos && organizationLogos[0]?.url
      ? organizationLogos[0]
      : null;
  const logo2 =
    organizationLogos && organizationLogos[1]?.url
      ? organizationLogos[1]
      : null;
  const fallbackLogo = organizationLogo || vecto;

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        ref={ref}
        className="shadow-sm bg-white py-10 rounded-sm flex items-center justify-center relative"
        style={{
          width: "800px",
          height: "500px",
          paddingLeft: "64px",
          paddingRight: "64px",
        }}
      >
        {/* Main Certificate Container - Landscape A4 proportions */}
        <div className="flex flex-col h-full" style={{ gap: "32px" }}>
          <div className="flex gap-4 justify-between items-center">
            {/* Left section: Badge or Logo 1 */}
            {logo1 ? (
              <div className="flex flex-col items-center">
                <img
                  src={logo1.url}
                  alt={logo1.name || "Organization Logo"}
                  className="object-contain"
                  style={{ width: 50, height: 50 }}
                />
              </div>
            ) : (
              <img src={badge} alt="" className="" style={{ width: "20%" }} />
            )}

            <h2
              className="font-bold text-3xl uppercase text-center text-gray-600"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              {header || "Certificate of Completion"}
            </h2>

            {/* Right section: Logo 2 or fallback logo */}
            <div className="flex flex-col items-center text-[#BE8C2C]">
              <div className="flex flex-col items-center">
                <img
                  src={logo2?.url || (logo1 ? vecto : fallbackLogo)}
                  className="w-52 object-contain"
                  style={{ width: 50, height: 50 }}
                  alt={logo2?.name || organizationName}
                />
                <h3 className="font-bold text-xs text-center">
                  {organizationName}
                </h3>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <p
              className="text-center font-bold uppercase"
              style={{ color: "#5d5d5d" }}
            >
              This Certificate is proudly presented <br /> for honourable
              achievement to
            </p>

            <p
              className="uppercase text-center text-2xl pb-2 tracking-wider"
              style={{
                fontFamily: "'Cinzel Decorative', serif",
                color: "#9B6327",
                borderBottom: "solid #9B6327",
              }}
            >
              {recipientName}
            </p>
            <p className="text-center text-xs" style={{ color: "#5d5d5d" }}>
              for successfully completing the course titled
            </p>

            <p
              className="text-center text-xl font-semibold"
              style={{ fontFamily: "'Cinzel Decorative', serif" }}
            >
              {courseTitle}
            </p>

            <p
              className="text-center text-xs"
              style={{ marginLeft: 10, marginRight: 10 }}
            >
              {description ||
                "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio commodi incidunt harum, doloremque reprehenderit voluptas aspernatu"}
            </p>
          </div>

          <div
            className="flex justify-between items-end"
            style={{ marginTop: "32px" }}
          >
            <div className="flex gap-8 justify-center items-center">
              {/* Signature 1 - Always show if name is provided */}
              {signatoryName1 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                  {!signatureUrl1 && (
                    <div className="w-32 border-b-2 border-gray-400 mb-2" />
                  )}
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#4D4D4D" }}
                  >
                    {signatoryName1}
                  </div>
                  {signatoryTitle1 && (
                    <div className="text-xs font-medium">{signatoryTitle1}</div>
                  )}
                </div>
              )}

              {/* Signature 2 - Always show if name is provided */}
              {signatoryName2 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                  {!signatureUrl2 && (
                    <div className="w-32 border-b-2 border-gray-400 mb-2" />
                  )}
                  <div
                    className="text-sm font-bold"
                    style={{ color: "#4D4D4D" }}
                  >
                    {signatoryName2}
                  </div>
                  {signatoryTitle2 && (
                    <div className="text-xs font-medium">{signatoryTitle2}</div>
                  )}
                </div>
              )}

              {/* Date display */}
              {date && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 mt-5 mb-2" />
                  <div
                    className="text-sm font-medium"
                    style={{ color: "#4D4D4D" }}
                  >
                    {formattedDate || "DATE"}
                  </div>
                  <div className="text-xs font-bold">Date</div>
                </div>
              )}
            </div>
          </div>

          {/* Verification Link */}
          {certificateId && mode === "student" && (
            <div className="text-center" style={{ marginTop: "16px" }}>
              <p className="text-xs text-gray-500">
                Verify this certificate at:{" "}
                <span className="font-mono text-orange-600">
                  certifyer.online/#/verify/{certificateId}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}