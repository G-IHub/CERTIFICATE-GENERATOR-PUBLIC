import { useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import upperUrl from "../../assets/UpperShape.png";
import bottomUrl from "../../assets/BottomShape.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/RIBBON.png";
import type { Logo } from "../../App";

interface CertificateTemplate7Props {
  header?: string;
  header1?: string;
  // courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  courseTitle?: string;
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
  themeColors?: ThemeColors;
}

export default function CertificateTemplate7({
  header,
  header1 = "CERTIFICATE",
  // courseTitle,
  description = "This certificate acknowledges your outstanding contribution and dedication to the Design project, showcasing your commitment to excellence, innovation, and teamwork.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  courseTitle = "Course Title",
  organizationName = "Your Organization",
  organizationLogo,
  organizationLogos,
  signatoryName1,
  signatoryTitle1 = "MANAGER, CTO",
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
  themeColors,
}: CertificateTemplate7Props) {
  // scale for preview vs student mode
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const fontId = "bodoni";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // formatted date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Determine which logo(s) to use
  const logo1 =
    organizationLogos && organizationLogos[0]?.url
      ? organizationLogos[0]
      : null;
  const logo2 =
    organizationLogos && organizationLogos[1]?.url
      ? organizationLogos[1]
      : null;
  const fallbackLogo = organizationLogo;

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="w-[800px] h-[600px] flex justify-center shadow-sm rounded relative overflow-hidden bg-[#fbfbfb] py-10 px-8">
        <img
          src={upperUrl}
          alt="Upper shape"
          className="absolute top-0 left-0 w-[240px] z-30"
        />
        <img
          src={bottomUrl}
          alt="Bottom shape"
          className="absolute bottom-0 right-0 w-[240px] z-30"
        />
        <img
          src={patternUrl}
          alt="Pattern"
          className="absolute z-0 top-0 w-full h-full opacity-90"
        />

        <div
          className="text-center flex flex-col gap-4 items-center w-full z-20 border-2 p-2"
          style={{ borderColor: themeColors?.secondary ?? "#fdba74" }}
        >
          {/* <img src={organizationLogo} alt="logo" className="w-1/9" /> */}
          <div className="flex">
            {/* First Logo */}
            {logo1 ? (
              <div className="flex items-center">
                <img
                  src={logo1.url}
                  alt={logo1.name || "Logo"}
                  className="w-16 h-16 object-contain"
                  style={{ width: 100, height: 100 }}
                />
              </div>
            ) : (
              <img
                src={organizationLogo}
                alt="Logo"
                className="w-16 h-16 object-contain"
                style={{ width: 100, height: 100 }}
              />
            )}

            {/* Second Logo */}
            {logo2 ? (
              <div className="flex items-center">
                <img
                  src={logo2.url}
                  alt="Logo"
                  className="w-16 h-16 object-contain"
                  style={{ width: 100, height: 100 }}
                />
              </div>
            ) : (
              <div className="hidden"></div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-medium uppercase">
              {header?.split(" ")[0] || "CERTIFICATE"}
            </h1>
            <p className="text-xl uppercase font-bold tracking-widest">
              {header?.split(" ").slice(1).join(" ") || "Of Completion"}
            </p>
          </div>
          <p className="font-bold tracking-tighter text-sm uppercase">
            This Certificate is Proudly Presented to:
          </p>
          <p
            className="w-auto text-center border-b-2 font-semibold text-5xl tracking-wider font-[bodoni]"
            style={{ borderColor: themeColors?.primary ?? "#f97316" }}
          >
            {recipientName}
          </p>

          <p className="max-w-xl text-lg">
            {description}{" "}
            <span className="font-bold text-black">{courseTitle}</span>{" "}
            organized by <b>{organizationName}</b>{" "}
          </p>

          <p className="font-bold text-black -mt-4">Date: {formattedDate} </p>

          <div className="flex gap-10 w-full items-center justify-center z-50 mt-4">
            <div className="space-y-2">
              <div className="border-b w-40 flex justify-center items-center">
                {signatureUrl1 && (
                  <img
                    src={signatureUrl1}
                    alt={signatoryName1}
                    className="w-24 h-16 object-contain"
                    style={{ marginBottom: -12 }}
                  />
                )}
              </div>
              <div className="space-y-0">
                <p
                  className="text-center text-sm font-medium"
                  style={{ color: themeColors?.primary ?? "#f97316" }}
                >
                  {signatoryName1 || "Oluwaseyi Abraham Olawale"}
                </p>
                <p className="text-center text-[9px] italic font-medium">
                  {signatoryTitle1 || "CEO of Genomac Holdings"}
                </p>
              </div>
            </div>

            <div className="w-1/12">
              <img src={ribbonUrl} alt="" />
            </div>

            <div className="space-y-2">
              <div className="border-b w-40 flex justify-center items-center">
                {signatureUrl2 && (
                  <img
                    src={signatureUrl2}
                    alt={signatoryName2}
                    className="w-24 h-16 object-contain"
                    style={{ marginBottom: -12 }}
                  />
                )}
              </div>
              <div className="space-y-0">
                <p
                  className="text-center text-sm font-medium"
                  style={{ color: themeColors?.primary ?? "#f97316" }}
                >
                  {signatoryName2 || "Gloria Adegbole"}
                </p>
                <p className="text-center text-[9px] italic font-medium">
                  {signatoryTitle2 || "Director of G-I Hub"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
