import { useRef } from "react";
import type { ThemeColors } from "../../types/theme";
import type { Logo } from "../../App";
import logo from "../../assets/ginsti.png";
import sign1 from "../../assets/sign1.png";
import sign2 from "../../assets/signInsti.png";
import watermark from "../../assets/watermark.png";
import award from "../../assets/award.png";

interface CertificateTemplate18Props {
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
  themeColors?: ThemeColors;
}

export default function CertificateTemplate18({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Genomac Institute Inc.",
  organizationLogo,
  organizationLogos,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
  themeColors,
}: CertificateTemplate18Props) {
  const ref = useRef<HTMLDivElement>(null);
  // const scale = mode === "student" ? 0.3 : 1;
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[800px] flex justify-center items-center";

  // Determine which logo(s) to use
  const logo1 = organizationLogos && organizationLogos[0]?.url
    ? organizationLogos[0]
    : null;
  const logo2 = organizationLogos && organizationLogos[1]?.url
    ? organizationLogos[1]
    : null;
  const fallbackLogo = organizationLogo;

    return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        ref={ref}
        className="shadow-sm bg-white rounded-sm flex items-center justify-center relative"
        style={{
          width: "800px",
          height: "600px",
          background: "white",
        }}
      >
        {/* Watermark */}
        <img
          src={watermark}
          alt="watermark"
          className="absolute w-full h-full opacity-30 z-0 object-cover"
        />

        {/* Main Certificate Container with Border */}
        <div className="relative w-full h-full border-[5px] border-purple-500 overflow-hidden">
          <div className="flex flex-col h-full p-6 justify-between">
            {/* Header with Logo */}
            <div className="flex text-center mx-auto items-center gap-4 mt-10">
              <p className="ml-6">
          <div className="flex">
            {logo1 ? (
              <div className="flex items-center">
                <img src={logo1.url} alt={logo1.name || "Logo"} className="w-[80px]"  />
              </div>
            ) : fallbackLogo ? (
              <img src={fallbackLogo} alt="Logo" className="w-[80px]"  />
            ) : null}
            {logo2 ? (
              <div className="flex items-center ml-2">
                <img src={logo2.url} alt="Logo" className="w-[80px]"  />
              </div>
            ) : null}
          </div>
              </p>
              <div className="text-center ml-3 mt-5">
                <p className="uppercase font-semibold text-5xl text-purple-700">
                  {header || "certificate of attendance"}
                </p>
                <p className="text-center uppercase text-black font-thin text-lg">
                  this certificate is awarded to:
                </p>
              </div>
            </div>

            {/* Certificate Title */}

            {/* Student Info Section */}
            <div className="text-center pt-5 pb-10 w-[800px] h-[200px] -mt-20">
              <p className="text-5xl text-purple-800 font-semibold border-b-2 mx-[200px] pb-2 mb-3 border-purple-800">
                {recipientName}
              </p>
              <p className="text-black text-lg font-semibold">
                For successfully participating in the fully funded program on:
              </p>
              <p className="uppercase text-xl text-purple-800 font-bold">
                {courseTitle}
              </p>
              {description && (
                <p className="mx-28 text-lg font-semibold text-black">
                  {description}
                </p>
              )}
              {/* Date display */}
              {date && (
                <div className="flex flex-col items-center text-center -mt-7">
                  <div className="w-32 mt-7 mb-2" />
                  {/* <div className="text-xs font-bold text-lg">Date</div> */}
                  <div
                    className="text-lg font-bold"
                    // style={{ color: "#4D4D4D" }}
                  >
                    {formattedDate || "DATE"}
                  </div>
                </div>
              )}
              {/* <p className="font-bold text-black">{date}</p> */}
            </div>

            {/* Signatures Section */}
            <div className="flex justify-between items-end">
              <div className="flex gap-1 justify-center items-center">
                {/* Signature 1 - Always show if name is provided */}
                {signatoryName1 && (
                  <div className="flex flex-col items-center text-center px-20 mx-16">
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
                      className="text-lg text-purple-600 font-bold"
                      style={{ color: "#4D4D4D" }}
                    >
                      {signatoryName1}
                    </div>
                    {signatoryTitle1 && (
                      <div className="text-xs font-medium">
                        {signatoryTitle1}
                      </div>
                    )}
                  </div>
                )}

                <div className="absolute left-[600px]">
                  <img
                    src={award}
                    alt="Award"
                    className="w-78 object-contain" 
                  />
                </div>

                {/* Signature 2 - Always show if name is provided */}
                {signatoryName2 && (
                  <div className="flex flex-col items-center text-center">
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
                      className="text-lg text-purple-600 font-bold"
                      style={{ color: "#4D4D4D" }}
                    >
                      {signatoryName2}
                    </div>
                    {signatoryTitle2 && (
                      <div className="text-xs font-medium">
                        {signatoryTitle2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
