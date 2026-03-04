import { useRef } from "react";
import logo from "../../assets/ginsti.png";
import sign1 from "../../assets/sign1.png";
import sign2 from "../../assets/signInsti.png";
import award from "../../assets/award.png";
import award1 from "../../assets/purpleribbon.png";
import watermark from "../../assets/watermark.png";

interface CertificateTemplate18Props {
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
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
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
        <div className="relative w-full h-full border-[15px] border-purple-500 overflow-hidden">
          <div className="flex flex-col h-full p-6 justify-between">
            {/* Header with Logo */}
            <div className="flex text-center mx-auto pl-[200px] ">
              <p className="mr-2">
                <img
                  src={organizationLogo || logo}
                  alt="logo"
                  className="w-[80px]"
                />
              </p>
              <p className="w-[1px] h-[50px] bg-purple-600 mt-4"></p>
              <p className="mt-5 pr-16 font-bold text-black text-xs w-[200px]">
                {organizationName}
                <p className="-ml-2 text-black">| USA Incorporated</p>
              </p>
            </div>

            {/* Certificate Title */}
            <div className="text-center ml-32">
              <p className="uppercase font-semibold text-3xl text-black">
                {header || "certificate of attendance"}
              </p>
              <p className="text-center italic text-black font-bold">
                this certificate is awarded to:
              </p>
            </div>

            {/* Student Info Section */}
            <div className="text-center pt-5 pb-10 w-[800px] h-[200px] mt-5">
              <p className="text-3xl text-purple-800 font-semibold border-b-2 mx-[200px] pb-2 mb-3 border-purple-800 border-dashed">
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
                      className="text-sm font-bold"
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
                      className="text-sm font-bold"
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

                {/* Date display */}
                {date && (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-32 mt-7 mb-2" />
                    <div className="text-xs font-bold ">Date</div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: "#4D4D4D" }}
                    >
                      {formattedDate || "DATE"}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Purple Ribbon Award */}
            <div className="w-[150px] absolute top-8 left-14">
              <img src={award1} alt="award" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
