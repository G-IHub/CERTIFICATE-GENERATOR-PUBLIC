import { useRef, useEffect } from "react";
import vector2 from "../../assets/Vector (2).svg";
import vecto from "../../assets/Vecto.svg";

interface CertificateTemplate1Props {
  header: string;
  courseTitle: string;
  description?: string;
  date: string;
  recipientName?: string;
  isPreview?: boolean;
  organizationName?: string;
  organizationLogo?: string;
  organizationSlogan?: string;
  signatoryName1?: string;
  signatoryTitle1?: string;
  signatureUrl1?: string;
  signatoryName2?: string;
  signatoryTitle2?: string;
  signatureUrl2?: string;
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate1({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  organizationSlogan = "slogan text here",
  signatoryName1 = "John Smith",
  signatoryTitle1 = "Director",
  signatureUrl1,
  signatoryName2 = "Sammi Smith",
  signatoryTitle2 = "President",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate1Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  // Load Cinzel Decorative font (Google Fonts) once when this component mounts
  useEffect(() => {
    const id = "cinzel-decorative-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible"
    : "min-w-[1056px] flex justify-center items-center ";

  const certificateClass = isPreview
    ? "flex flex-col justify-center items-center relative shadow-lg"
    : "flex flex-col justify-center items-center relative";

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        ref={ref}
        className={certificateClass}
        style={{ backgroundColor: "#faf8f3" }}
      >
        {/* Main Certificate Container - Landscape A4 proportions */}
        <div className="shadow-xl w-3xl px-20 space-y-4 py-10 rounded-lg mt-10">
          <div className="flex justify-between items-center p-4">
            <img src={vector2} alt="" className="w-40" style={ {width: 80} } />
            <div className="flex flex-col items-end text-[#5D5D5D]">
              <h2
                className="font-bold text-3xl uppercase"
                style={{ fontFamily: "'Cinzel Decorative', serif" }}
              >
                Certificate
              </h2>
              <p className="text-lg font-semibold">Appreciation</p>
            </div>
            <div className="flex flex-col items-center text-[#BE8C2C]">
              <img
                src={organizationLogo || vecto}
                className="w-40" style={{width: 30}}
                alt={organizationName}
              />
              <h3 className="font-bold text-lg">{organizationName}</h3>
              {/* <small>{organizationSlogan}</small> */}
            </div>
          </div>

          <p className="text-center font-bold uppercase text-[#5d5d5d]">
            This Certificate is proudly presented <br /> for honourable
            achievement to
          </p>

          <p
            className="text-[#9B6327] uppercase text-center text-2xl border-b-2 pb-2"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {recipientName}
          </p>
            <p className="text-center font-bold uppercase text-sm text-[#5d5d5d]">
                for successfully completing the course <br /> titled
            </p>

          <p
            className="text-center text-xl font-semibold"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {courseTitle}
          </p>

          <p className="text-center mb-40 ">
            {description ||
              "Lorem ipsum dolor sit amet consectetur adipisicing elit. Odio commodi incidunt harum, doloremque reprehenderit voluptas aspernatu"}
          </p>

          <div className="mt-20 flex justify-between px-52 items-end">
            <div className="space-y-4 text-center">
              <div className="border-b-2 w-40 mx-auto" />
              <p className="text-center text-sm font-medium">{date}</p>
            </div>

            <div className="space-y-6 text-center">
              {/* Primary signature block */}
              <div>
                <div className="w-40 mx-auto">
                  {signatureUrl1 ? (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-full object-contain"
                    />
                  ) : (
                    <div className="border-b-2 w-full" />
                  )}
                </div>
                <p className="text-center text-sm font-medium mt-2">
                  {signatoryName1}
                </p>
              </div>

              {/* Optional second signature */}
              {/* {signatoryName2 || signatureUrl2 ? (
                <div>
                  <div className="w-40 mx-auto">
                    {signatureUrl2 ? (
                      <img
                        src={signatureUrl2}
                        alt={signatoryName2}
                        className="w-full object-contain"
                      />
                    ) : (
                      <div className="border-b-2 w-full" />
                    )}
                  </div>
                  {signatoryName2 && (
                    <p className="text-center text-sm font-medium mt-2">
                      {signatoryName2}
                    </p>
                  )}
                </div>
              ) : null} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
