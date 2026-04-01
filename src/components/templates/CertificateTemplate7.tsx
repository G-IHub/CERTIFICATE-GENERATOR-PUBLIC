import React, { useRef } from "react";
import upperUrl from "../../assets/UpperShape.png";
import bottomUrl from "../../assets/BottomShape.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/RIBBON.png";

interface CertificateTemplate7Props {
  header?: string;
  courseTitle?: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate7({
  header = "CERTIFICATE OF Excellence",
  courseTitle = "Course Title",
  description = "This certificate acknowledges your outstanding contribution and dedication to the Design project, showcasing your commitment to excellence, innovation, and teamwork.",
  date,
  recipientName = "Name Surname",
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1 = "John Doe",
  signatoryTitle1 = "Manager",
  signatureUrl1,
  signatoryName2 = "Sarah Kim",
  signatoryTitle2 = "Director",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate7Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 1 : 1;

  // formatted date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      ref={ref}
      className="w-200 h-150 flex justify-center shadow-sm rounded relative overflow-hidden bg-[#fbfbfb] py-10 px-8"
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <img
        src={upperUrl}
        alt="Upper shape"
        className="absolute top-0 left-0 w-54 z-40"
      />
      <img
        src={bottomUrl}
        alt="Bottom shape"
        className="absolute bottom-0 right-0 w-54 z-40"
      />
      <img
        src={patternUrl}
        alt="Pattern"
        className="absolute z-0 top-0 w-full h-full opacity-70"
      />

      <div className="text-center flex flex-col gap-4 items-center w-full z-20 border-2 border-orange-300 p-2">
        {organizationLogo && (
          <img src={organizationLogo} alt="logo" className="w-1/12" />
        )}
        <div className="flex flex-col items-center">
          <h1 className="text-5xl font-medium uppercase">
            {header?.split(" ")[0]}
          </h1>
          <p className="text-xl uppercase font-bold tracking-widest">
            {header?.split(" ")[1]} {header?.split(" ")[2]}
          </p>
        </div>
        <p className="font-bold tracking-tighter text-sm uppercase">
          This Certificate is Proudly Presented to:
        </p>
        <p className="w-auto text-center border-b-2 border-orange-500 font-semibold text-3xl tracking-wider">
          {recipientName}
        </p>
        <p className="text-sm text-center max-w-sm px-4">
          {description} {courseTitle} organized by {organizationName}
        </p>
        <p className="font-bold text-sm">Date: {formattedDate} </p>

        <div className="flex gap-10 w-full items-center justify-center">
          {signatoryName1 && (
            <div className="flex flex-col items-center gap-2">
              <div className="border-b w-40 flex justify-center min-h-10">
                {signatureUrl1 && (
                  <img
                    src={signatureUrl1}
                    alt={signatoryName1}
                    className="w-24 h-16 object-contain"
                    style={{ marginBottom: -12 }}
                  />
                )}
              </div>
              <div>
                <p className="text-center text-sm font-medium text-orange-500">
                  {signatoryName1}
                </p>
                <p className="text-center text-[9px] italic font-medium">
                  {signatoryTitle1}
                </p>
              </div>
            </div>
          )}

          <div className="w-1/12">
            <img src={ribbonUrl} alt="" />
          </div>

          {signatoryName2 && (
            <div className="flex flex-col items-center gap-2">
              <div className="border-b w-40 flex justify-center min-h-10">
                {signatureUrl2 && (
                  <img
                    src={signatureUrl2}
                    alt={signatoryName2}
                    className="w-24 h-16 object-contain"
                    style={{ marginBottom: -12 }}
                  />
                )}
              </div>
              <div>
                <p className="text-center text-sm font-medium text-orange-500">
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
  );
}
