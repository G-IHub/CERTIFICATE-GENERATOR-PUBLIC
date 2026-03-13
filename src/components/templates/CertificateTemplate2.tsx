import { useEffect } from "react";
import topShapeUrl from "../../assets/upper_shape.png";
import centerLogoUrl from "../../assets/logo2b.png";
import patternUrl from "../../assets/Pattern.png";
import ribbonUrl from "../../assets/Ribbon.png";

interface CertificateTemplate2Props {
  header1?: string;
  subheader?: string;
  recipientName?: string;
  description?: string;
  date: string;
  isPreview?: boolean;
  topShapeUrl?: string;
  centerLogoUrl?: string;
  patternUrl?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  ribbonUrl?: string;
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate2({
  header1 = "CERTIFICATE",
  subheader = "Of Excellence",
  recipientName = "Name Surname",
  description,
  date,
  isPreview = false,
  signatoryName1 = "Oluwaseyi Abraham Olawale",
  signatoryTitle1 = "CEO of Genomac Holdings",
  signatoryName2 = "Gloria Adegbole",
  signatoryTitle2 = "Director of G-I Hub",
  mode = "student",
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
    : "min-w-[1056px] flex justify-center items-center";

  return (
    <div className={containerClass} style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}>
      <div className="w-200 h-150 flex justify-center shadow-sm rounded relative overflow-hidden bg-[#fbfbfb] py-20 px-10">
        <img src={topShapeUrl} alt="Top Shape" className="absolute w-full top-0 z-10" />
        <img src={centerLogoUrl} alt="Logo" className="absolute top-6 w-1/6 left-1/2 -translate-x-1/2 z-10" />
        <img src={patternUrl} alt="Pattern" className="absolute z-0 top-0 w-full h-full opacity-70" />

        <div className="text-center flex flex-col gap-8 items-center w-full z-30 mt-14">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl font-medium">{header1}</h1>
            <p className="text-xl uppercase font-bold tracking-widest">{subheader}</p>
          </div>

          <p className="font-medium uppercase text-sm">This Certificate is Proudly Presented to:</p>

          <p className="w-1/2 text-center border-b border-orange-500 font-semibold text-3xl tracking-wider">{recipientName}</p>

          <p className="max-w-xl text-sm text-center px-4">
            {description ??
              "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Doloremque tempora nobis eligendi molestias amet nam sint minima aliquid rerum accusamus."}
          </p>

          <div className="flex gap-10 w-full items-center justify-center">
            <div className="space-y-2">
              <p className="border-b w-40 text-center tracking-wide font-[Great_Vibes]">signature</p>
              <div className="space-y-0">
                <p className="text-center text-sm font-medium text-orange-500">{signatoryName1}</p>
                <p className="text-center text-[9px] italic font-medium">{signatoryTitle1}</p>
              </div>
            </div>

            <div className="w-1/12">
              <img src={ribbonUrl} alt="Ribbon" className="mx-auto" />
            </div>

            <div className="space-y-2">
              <p className="border-b w-40 text-center tracking-wide font-[Great_Vibes]">signature</p>
              <div className="space-y-0">
                <p className="text-center text-sm font-medium text-orange-500">{signatoryName2}</p>
                <p className="text-center text-[9px] italic font-medium">{signatoryTitle2}</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </div>
    </div>
  );
}
