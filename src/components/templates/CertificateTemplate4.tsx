import React from "react";
import type { ThemeColors } from "../../types/theme";
import upperUrl from "../../assets/UpperShape.png";
import bottomUrl from "../../assets/BottomShape.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/RIBBON.png";
import deleteSign from "../../assets/delete.png";
import type { Logo } from "../../App";

interface CertificateTemplate4Props {
  header?: string;
  header1?: string;
  subheader?: string;
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

export default function CertificateTemplate4({
  header,
  header1 = "CERTIFICATE",
  subheader,
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
}: CertificateTemplate4Props) {
  // scale for preview vs student mode
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

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
        {/* Upper Shape - Colorized with Secondary Theme Color */}
        <div
          className="absolute top-0 left-0 w-56 h-56 z-10"
          style={{
            backgroundColor: themeColors?.secondary ?? "#fdba74",
            WebkitMaskImage: `url(${upperUrl})`,
            maskImage: `url(${upperUrl})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />

        {/* Bottom Shape - Colorized with Secondary Theme Color */}
        <div
          className="absolute bottom-0 -right-15 w-56 h-56 z-10"
          style={{
            backgroundColor: themeColors?.secondary ?? "#fdba74",
            WebkitMaskImage: `url(${bottomUrl})`,
            maskImage: `url(${bottomUrl})`,
            WebkitMaskSize: "contain",
            maskSize: "contain",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
          }}
        />

        <img
          src={patternUrl}
          alt="Pattern"
          className="absolute z-0 top-0 w-full h-full opacity-70"
        />

        <div
          className="text-center flex flex-col gap-5 items-center w-full z-40 border-2 p-2"
          style={{ borderColor: themeColors?.secondary ?? "#fdba74" }}
        >
          {/* <img src={organizationLogo} alt="logo" className="w-1/9" /> */}
          <div className="flex">
            {/* First Logo */}
            {logo1 ? (
              <div className="flex items-center">
                <div>
                  <img
                    src={logo1.url}
                    alt="Logo"
                    className="w-16 h-16 object-contain"
                    style={{ width: 60, height: 60 }}
                  />
                  <p className="text-xs font-thin text-black">{logo1.name} </p>
                </div>
              </div>
            ) : (
              <div>
                <img
                src={organizationLogo}
                alt="Logo"
                className="w-16 h-16 object-contain"
                style={{ width: 60, height: 60 }}
              />
              <p className="text-xs font-thin text-black">{organizationName} </p>
              </div>
            )}

            {/* Second Logo */}
            {logo2 ? (
              <div className="flex items-center">
                <p className="text-2xl font-bold text-black">
                  <img src={deleteSign} alt="X" className="w-3 -mt-4 mr-3" />
                </p>
                <div>
                  <img
                    src={logo2.url}
                    alt="Logo"
                    className="w-16 h-16 object-contain"
                    style={{ width: 60, height: 60 }}
                  />
                  <p className="text-xs font-thin text-black">{logo2.name} </p>
                </div>
              </div>
            ) : (
              <div className="hidden"></div>
            )}
          </div>
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-4xl font-medium uppercase">
              {header?.split(" ")[0] || "CERTIFICATE"}
            </h1>
            <p className="text-lg uppercase font-bold tracking-widest">
              {header?.split(" ").slice(1).join(" ") || "OF ACHIEVEMENT"}
            </p>
          </div>
          <p className="font-bold tracking-tighter text-sm uppercase">
            This Certificate is Proudly Presented to:
          </p>
          <p
            className="w-1/2 text-center border-b font-semibold text-3xl tracking-wider"
            style={{ borderColor: themeColors?.primary ?? "#f97316" }}
          >
            {recipientName}
          </p>
          <p className="text-xs -mt-2 -mb-2 text-black">
            {/* For participating in the program: */}
          </p>
          <p className="text-2xl -mt-2 -mb-4 font-bold text-black">
            {courseTitle}
          </p>
          <p className="max-w-xl text-lg">{description}</p>

          <p className="font-bold text-lg text-black -mt-5 mb-24">
            Date: {formattedDate}{" "}
          </p>

          <div className="flex gap-10 w-full items-center justify-center z-50 -mt-5">
            <div className="space-y-2">
              <div className="border-b w-40 flex justify-center items-center">
                <img
                  src={signatureUrl1}
                  alt=""
                  className="w-24 h-16 object-contain"
                  style={{ marginBottom: -12 }}
                />
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

            <div className="w-16 h-16 relative">
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: themeColors?.primary ?? "#f97316",
                  WebkitMaskImage: `url(${ribbonUrl})`,
                  maskImage: `url(${ribbonUrl})`,
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                }}
              />
            </div>

            <div className="space-y-2">
              <div className="border-b w-40 flex justify-center items-center">
                <img
                  src={signatureUrl2}
                  alt=""
                  className="w-24 h-16 object-contain"
                  style={{ marginBottom: -12 }}
                />
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