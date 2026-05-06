import { useEffect } from "react";
import type { ThemeColors } from "../../types/theme";
import topShapeUrl from "../../assets/upper_shape.png";
import centerLogoUrl from "../../assets/logo2b.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/RIBBON.png";

interface CertificateTemplate2Props {
  header1?: string;
  courseTitle?: string;
  header?: string;
  subheader?: string;
  recipientName?: string;
  description?: string;
  date: string;
  isPreview?: boolean;
  topShapeUrl?: string;
  centerLogoUrl?: string;
  organizationLogo?: string;
  organizationLogos?: Logo[];
  patternUrl?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  ribbonUrl?: string;
  mode?: "student" | "template-selection";
  certificateId?: string;
  themeColors?: ThemeColors;
}

export default function CertificateTemplate2({
  header,
  courseTitle,
  header1 = "CERTIFICATE",
  subheader = "Of Excellence",
  recipientName = "Name Surname",
  description,
  date,
  organizationLogo,
  organizationLogos,
  isPreview = false,
  signatoryName1 = "Oluwaseyi Abraham Olawale",
  signatoryTitle1 = "CEO of Genomac Holdings",
  signatureUrl1,
  signatoryName2 = "Gloria Adegbole",
  signatoryTitle2 = "Director of G-I Hub",
  signatureUrl2,
  mode = "student",
  certificateId,
  themeColors,
}: CertificateTemplate2Props) {
  const scale = mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  useEffect(() => {
    const fontId = "momo-signature-font";
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap";
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
    : "min-w-[800px] flex justify-center items-center";

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="w-200 h-150 flex justify-center shadow-sm rounded relative overflow-hidden bg-[#fbfbfb] py-20 px-10">
        <img
          src={topShapeUrl}
          alt="Top Shape"
          className="absolute w-full top-0 z-10"
        />
        <img
          src={organizationLogo}
          alt="Logo"
          className="absolute top-6 w-32 left-1/2 -translate-x-1/2 z-10"
        />
        <img
          src={patternUrl}
          alt="Pattern"
          className="absolute z-0 top-0 w-150 h-full opacity-70"
        />

        <div className="text-center flex flex-col gap-8 items-center w-full z-30 mt-14">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-medium">{header1}</h1>
            <p className="text-xl uppercase font-bold tracking-widest">
              {subheader}
            </p>
          </div>

          <p className="font-medium uppercase text-sm">
            This Certificate is Proudly Presented to:
          </p>

          <p className="w-1/2 text-center border-b font-semibold text-3xl tracking-wider" style={{ borderColor: themeColors?.primary ?? '#f97316' }}>
            {recipientName}
          </p>

          <p className="max-w-xl text-sm text-center px-4 -mt-5">
            {description}
          </p>
          <p className="-mt-7 text-xl font-bold">{courseTitle}</p>

          <p className="text-sm text-gray-500 -mt-7 font-bold">{formattedDate}</p>

          <div className="flex gap-10 w-full items-center justify-center">
            {signatoryName1 && (
              <div className="space-y-2">
                <p className="border-b w-40 text-center tracking-wide font-[Great_Vibes]">
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                </p>
                <div className="space-y-0">
                  <p className="text-center text-sm font-medium" style={{ color: themeColors?.primary ?? '#f97316' }}>
                    {signatoryName1}
                  </p>
                  <p className="text-center text-[9px] italic font-medium">
                    {signatoryTitle1}
                  </p>
                </div>
              </div>
            )}

            <div className="w-1/12">
              <img src={ribbonUrl} alt="Ribbon" className="mx-auto" />
            </div>

            {signatoryName2 && (
              <div className="space-y-2">
                <p className="border-b w-40 text-center tracking-wide font-[Great_Vibes]">
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-24 h-16 object-contain"
                      style={{ marginBottom: -12 }}
                    />
                  )}
                </p>
                <div className="space-y-0">
                  <p className="text-center text-sm font-medium" style={{ color: themeColors?.primary ?? '#f97316' }}>
                    {signatoryName2}
                  </p>
                  <p className="text-center text-[9px] italic font-medium">
                    {signatoryTitle2}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}