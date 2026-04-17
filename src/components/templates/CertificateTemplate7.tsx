import React from "react";
import type { ThemeColors } from "../../types/theme";
import upperUrl from "../../assets/UpperShape.png";
import bottomUrl from "../../assets/BottomShape.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/RIBBON.png";

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


  // formatted date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="w-[800px] h-[600px] flex justify-center shadow-sm rounded relative overflow-hidden bg-[#fbfbfb] py-10 px-8">
        <img
          src={upperUrl}
          alt="Upper shape"
          className="absolute top-0 left-0 w-56 z-10"
        />
        <img
          src={bottomUrl}
          alt="Bottom shape"
          className="absolute bottom-0 right-0 w-56 z-10"
        />
        <img
          src={patternUrl}
          alt="Pattern"
          className="absolute z-0 top-0 w-full h-full opacity-70"
        />

        <div className="text-center flex flex-col gap-5 items-center w-full z-40 border-2 p-2" style={{ borderColor: themeColors?.secondary ?? '#fdba74' }}>
          <img src={organizationLogo} alt="logo" className="w-1/9" />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-medium">{header1 || "CERTIFICATE"}</h1>
            <p className="text-xl uppercase font-bold tracking-widest">
              {header}
            </p>
          </div>
          <p className="font-bold tracking-tighter text-sm uppercase">
            This Certificate is Proudly Presented to:
          </p>
          <p className="w-1/2 text-center border-b font-semibold text-3xl tracking-wider" style={{ borderColor: themeColors?.primary ?? '#f97316' }}>
            {recipientName}
          </p>
          <p className="text-xs -mt-2 -mb-2 text-black">
            {/* For participating in the program: */}
          </p>
          <p className="text-xs -mt-2 -mb-4 font-bold text-lg text-black">
            {courseTitle}
          </p>
          <p className="max-w-xl text-sm">{description}</p>

          <p className="font-bold text-black -mt-5" >Date: {formattedDate} </p>

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
                <p className="text-center text-sm font-medium" style={{ color: themeColors?.primary ?? '#f97316' }}>
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
                <img
                  src={signatureUrl2}
                  alt=""
                  className="w-24 h-16 object-contain"
                  style={{ marginBottom: -12 }}
                />
              </div>
              <div className="space-y-0">
                <p className="text-center text-sm font-medium" style={{ color: themeColors?.primary ?? '#f97316' }}>
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
