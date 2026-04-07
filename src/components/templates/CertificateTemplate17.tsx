import { useRef, useEffect } from "react";
import watermark from "../../assets/watermark.png";
import award from "../../assets/award.png";
import barcode from "../../assets/barcode.png";
import nig from "../../assets/nig.png";
import usa from "../../assets/usa.png";

interface CertificateTemplate17Props {
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

export default function CertificateTemplate17({
  header,
  courseTitle,
  description = "For exceptional dedication, outstanding performance, and significant contributions to the successful completion of this program.",
  date,
  recipientName = "Name Surname",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
}: CertificateTemplate17Props) {
    const ref = useRef<HTMLDivElement>(null);
    const scale = mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

  useEffect(() => {
    const link1 = document.createElement("link");
    link1.rel = "stylesheet";
    link1.href =
      "https://fonts.googleapis.com/css2?family=Libre+Baskerville:wght@400;700&display=swap";
    document.head.appendChild(link1);

    const link2 = document.createElement("link");
    link2.rel = "stylesheet";
    link2.href =
      "https://fonts.googleapis.com/css2?family=Momo+Signature&display=swap";
    document.head.appendChild(link2);

    return () => {
      document.head.removeChild(link1);
      document.head.removeChild(link2);
    };
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

    const containerClass = isPreview
        ? "w-full mx-auto origin-center overflow-visible flex justify-center"
        : "min-w-[800px] flex justify-center items-center ";

  // Determine signature count
  const hasSignature1 = signatoryName1 || signatoryTitle1 || signatureUrl1;
  const hasSignature2 = signatoryName2 || signatoryTitle2 || signatureUrl2;

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
          height: "600px",
          paddingLeft: "",
          // paddingRight: "300px",
          background: "white",
          // marginLeft: "-270px",
        }}
      >
        <div className="relative w-[200px] h-[600px] flex flex-col overflow-hidden z-10 bg-gradient-to-b from-pink-400 via-purple-900 to-purple-900">
          <div className="flex pt-4">
            <div className="mx-auto">
              <img src={organizationLogo} alt="logo2" className="w-20" />
            </div>
          </div>
          <div className="px-2 -mt-1">
            <p className="text-white text-center text-[11px] font-medium">
              {organizationName}
            </p>
            <p className="text-white text-center font-thin text-[7px]">
              {/* ...discovering new things, improving life */}
            </p>
          </div>
        </div>

        <div className="w-[856px] h-[600px] relative bg-white overflow-hidden">
          <img
            src={watermark}
            alt="genes"
            className="absolute w-full h-full opacity-20 z-0 object-cover"
          />
          <div className="w-full h-full px-8 py-6 relative z-10 flex flex-col">
            <div className="p-4 bg-purple-900 text-white text-3xl text-center tracking-widest uppercase">
              {header || "CERTIFICATE OF Participation"}
            </div>

            <div className="font-base text-center text-black mt-8 italic text-lg">
              This Certificate is Presented to:
            </div>

            <div
              id="name"
              className="capitalize border-b-4 border-purple-900 pb-2 text-center text-purple-900 mx-[60px] mt-16 text-3xl font-bold"
            >
              {recipientName}
            </div>

            <p className="capitalize h-[160px] py-6 text-center text-black font-base text-sm leading-relaxed">
              {description}
              <span className="font-bold uppercase text-black">
                {" "}
                {courseTitle}{" "}
              </span>
              Organized by {organizationName}
            </p>

            {/* <p className="font-bold mx-auto text-center text-black w-[300px] uppercase text-lg">
                {date}
              </p> */}

            <div className="flex w-full justify-center items-center">
              <div className="w-[40px]">
                <img src={barcode} alt="barcode" className="w-full" />
              </div>
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
    </div>
  );
}