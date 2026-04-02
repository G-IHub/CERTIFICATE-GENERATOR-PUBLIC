import topShapeUrl from "../../assets/upper_shape.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/RIBBON.png";

interface CertificateTemplate2Props {
  header?: string;
  courseTitle?: string;
  recipientName?: string;
  description?: string;
  date: string;
  isPreview?: boolean;
  topShapeUrl?: string;
  centerLogoUrl?: string;
  organizationName?: string;
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
}

export default function CertificateTemplate2({
  header,
  courseTitle,
  recipientName = "Name Surname",
  description,
  date,
  organizationName = "Your Organization",
  organizationLogo,
  organizationLogos,
  isPreview = false,
  signatoryName1 = "Bryan Luke",
  signatoryTitle1 = "Founder & CEO",
  signatureUrl1,
  signatoryName2 = "Sarah Kim",
  signatoryTitle2 = "Director",
  signatureUrl2,
  mode = "student",
  certificateId,
}: CertificateTemplate2Props) {
  const scale = mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

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
          className="absolute z-0 top-0 w-full h-full opacity-70"
        />

        <div className="text-center flex flex-col gap-8 items-center w-full z-30 mt-14">
          <div className="flex flex-col items-center">
            <h1 className="text-5xl font-medium uppercase">{header?.split(" ")[0]}</h1>
            <p className="text-xl uppercase font-bold tracking-widest">
              {header?.split(" ")[1]}{" "} {header?.split(" ")[2]}
            </p>
          </div>

          <p className="font-medium uppercase text-sm">
            This Certificate is Proudly Presented to:
          </p>

          <p className="w-auto text-center border-b border-orange-500 font-semibold text-3xl tracking-wider">
            {recipientName}
          </p>

          <p className="max-w-xl text-sm text-center px-4 -mt-5">
            {description}{" "}{courseTitle} Organized By {organizationName}
          </p>

          <p className="text-sm text-gray-500 -mt-7 font-bold">{formattedDate}</p>

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

            <div className="w-1/12 object-contain">
              <img src={ribbonUrl} alt="Ribbon" className="mx-auto" />
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
    </div>
  );
}