import React from "react";
import award from "../../assets/award.png";
import watermark from "../../assets/watermark.png";

interface CertificateTemplate6Props {
  header: string;
  courseTitle: string;
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
  // Legacy props for backwards compatibility
  programName?: string;
  issueDate?: string;
  primaryColor?: string;
  signatories?: Array<{
    name: string;
    title: string;
    signatureUrl?: string;
  }>;
}

export default function CertificateTemplate6({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1 = "Bryan Luke",
  signatoryTitle1 = "Founde & CEO",
  signatureUrl1,
  signatoryName2 = "Sarah Kim",
  signatoryTitle2 = "Co-founder",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate6Props) {
  const ref = React.useRef<HTMLDivElement>(null);
  const scale =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";

  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[800px] flex justify-center items-center";

  return (
    <div ref={ref}
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="w-200 h-150 flex justify-center shadow-sm rounded overflow-hidden bg-transparent relative">
        <img
          src={watermark}
          alt="watermark"
          className="absolute w-full h-full z-0 opacity-14 -bottom-10"
        />
        <div className="w-50 bg-linear-to-t from-green-900 to-green-600 h-full relative flex justify-center">
          {organizationLogo && (
            <img
              src={organizationLogo}
              alt="Organization"
              className="w-20 h-20 object-contain absolute top-4 left-4 z-20"
            />
          ) }
        </div>

        <div className="flex flex-col gap-12 py-10 px-4 items-center text-center z-50 w-full">
          <h2 className="text-2xl py-1 text-white bg-green-900 uppercase w-full">
            {header}
          </h2>
          <p className="text-xs italic">This Certificate is Presented to:</p>
          <div className="w-11/12 border-b-2 pb-2 border-green-900 text-green-900 font-semibold text-xl tracking-wider text-center">
            {recipientName}
          </div>
          <p className="font-medium text-xs">
            {description} Titled: {courseTitle} Organized By {organizationName}.
          </p>
          <p className="font-bold text-sm uppercase">{formattedDate}</p>

          <div className="flex w-full justify-center items-center">
            <div className="flex flex-col gap-1 items-center">
              <div className="border-b border-green-950 w-40 flex justify-center min-h-10">
                {signatureUrl1 && (
                  <img
                    src={signatureUrl1}
                    alt={signatoryName1}
                    className="w-24 h-16 object-contain"
                  />
                )}
              </div>
              <p className="text-center text-xs font-medium">
                {signatoryName1}
              </p>
              <p className="text-center text-[9px] italic font-medium">
                {signatoryTitle1}
              </p>
            </div>
            <img src={award} alt="" className="w-40" />
            <div className="flex flex-col gap-1 items-center">
              <div className="border-b border-green-950 w-40 flex justify-center min-h-10">
                {signatureUrl2 && (
                  <img
                    src={signatureUrl2}
                    alt={signatoryName2}
                    className="w-24 h-16 object-contain"
                  />
                )}
              </div>
              <p className="text-center text-xs font-medium">
                {signatoryName2}
              </p>
              <p className="text-center text-[9px] italic font-medium">
                {signatoryTitle2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
