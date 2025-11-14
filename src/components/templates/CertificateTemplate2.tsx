import { useRef, useEffect } from "react";
import wavy from "../../assets/Wavy.svg";
import rect4 from "../../assets/Rect4.svg";
import rect from "../../assets/Rect.svg";
import rect2 from "../../assets/Rect2.svg";
import rect3 from "../../assets/Rect3.svg";

interface CertificateTemplate2Props {
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

export default function CertificateTemplate2({
  header,
  courseTitle,
  description,
  date,
  recipientName = "Student Name",
  isPreview = false,
  organizationName = "Your Organization",
  organizationLogo,
  signatoryName1 = "John Smith",
  signatoryTitle1 = "Director",
  signatureUrl1,
  signatoryName2 = "Sammi Smith",
  signatoryTitle2 = "President",
  signatureUrl2,
  mode = "student",
}: CertificateTemplate2Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale = mode === "student" ? 0.3 : 1;

  // Load decorative fonts used by this template
  useEffect(() => {
    const id1 = "cinzel-decorative-font";
    const id2 = "tangerine-font";
    if (!document.getElementById(id1)) {
      const link = document.createElement("link");
      link.id = id1;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&display=swap";
      document.head.appendChild(link);
    }
    if (!document.getElementById(id2)) {
      const link2 = document.createElement("link");
      link2.id = id2;
      link2.rel = "stylesheet";
      link2.href =
        "https://fonts.googleapis.com/css2?family=Tangerine:wght@700&display=swap";
      document.head.appendChild(link2);
    }
  }, []);

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible"
    : "min-w-[1056px] flex justify-center items-center";

  const certificateClass = isPreview
    ? "flex flex-col justify-center items-center relative w-[100px] shadow-lg"
    : "flex flex-col justify-center items-center relative";

  // Normalize signatory data into a single array so we can render uniformly
  const mergedSignatories: Array<{
    src?: string;
    name?: string;
    title?: string;
  }> = [
    { src: signatureUrl1, name: signatoryName1, title: signatoryTitle1 },
    { src: signatureUrl2, name: signatoryName2, title: signatoryTitle2 },
  ];

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div
        ref={ref}
        className={certificateClass}
        style={{ backgroundColor: "#FEFEFD" }}
      >
        <div className="flex justify-center bg-[#FEFEFD] items-center w-3xl shadow-md px-16 py-10 rounded-lg relative overflow-hidden text-[#4D4D4D]">
          {/* Repeating wavy background */}
          <div className="z-0 relative w-full h-full">
            {Array.from({ length: 30 }).map((_, i) => (
              <img
                key={i}
                src={wavy}
                alt=""
                className="absolute w-full left-0"
                style={{ top: `${i * 5}px`, opacity: 0.12 }}
              />
            ))}
          </div>

          {/* Corner decorations */}
          <div className="z-10">
            <div className="absolute top-0 left-0">
              <img src={rect4} alt="" className="w-80" />
            </div>
            <div className="absolute top-0 right-0">
              <img src={rect} alt="" className="w-80" />
            </div>
            <div className="absolute bottom-0 right-0">
              <img src={rect2} alt="" className="w-80" />
            </div>
            <div className="absolute bottom-0 left-0">
              <img src={rect3} alt="" className="w-80" />
            </div>
          </div>

          <div className="bg-transparent rounded p-6 w-full z-40">
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-10 items-center">
                <div className="flex items-center justify-center w-24 h-auto rounded-full overflow-hidden">
                  {organizationLogo ? (
                    <img
                      src={organizationLogo}
                      alt={organizationName}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <p className="uppercase text-sm text-center px-2">
                      {organizationName || "Brand Award"}
                    </p>
                  )}
                </div>

                <div className="flex flex-col text-center items-start space-y-2">
                  <h2
                    className="text-2xl font-bold"
                    style={{ fontFamily: "'Cinzel Decorative', serif" }}
                  >
                    {header || "CERTIFICATE"}
                  </h2>
                  {/* <p className="text-xl font-medium text-center">OF APPRECIATION</p> */}
                </div>
              </div>

              <p className="text-center mt-4 font-medium">
                THIS CERTIFICATE IS PROUDLY PRESENTED TO
              </p>

              <p
                className="text-4xl text-center"
                style={{
                  fontFamily: "'Tangerine', cursive",
                  fontWeight: 700,
                  borderBottom: "2px solid #000",
                  paddingBottom: "8px",
                  paddingLeft: "220px",
                  paddingRight: "220px",
                }}
              >
                {/* {recipientName} */}John Doe
              </p>

              <p className="text-center max-w-2xl px-8">
                {description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat."}
              </p>

              <div className="flex items-center justify-between w-full mt-10">
                <div className="flex gap-10 items-center">
                  <div className="text-center">
                    <div className="border-b-2 w-40 text-center" />
                    <p className="mt-2">{date}</p>
                  </div>
                  {/* <div className="text-center">
                    <div className="border-b-2 w-40 text-center" />
                    <p className="mt-2">{signatureUrl1 || "SIGNATURE"}</p>
                  </div> */}

                  <div className="flex gap-4 items-center">
                    {mergedSignatories.map((s, idx) =>
                      s.src ? (
                        <div
                          key={idx}
                          className="flex flex-col items-center text-center"
                        >
                          <img
                            src={s.src}
                            alt={`sig-${idx}`}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {s.name && (
                            <div className="text-sm mt-1">{s.name}</div>
                          )}
                          {s.title && (
                            <div className="text-xs text-gray-600">
                              {s.title}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div
                          key={idx}
                          className="w-10 h-10 rounded-full bg-gray-600"
                        />
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
