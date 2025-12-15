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
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
}: CertificateTemplate2Props) {
  const ref = useRef<HTMLDivElement>(null);
  const scale =
    mode === "student" ? "transform-scale-[0.3]" : "transform-scale-100";

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
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  // Normalize signatory data into a single array so we can render uniformly
  const mergedSignatories: Array<{
    src?: string;
    name?: string;
    title?: string;
  }> = [
    { src: signatureUrl1, name: signatoryName1, title: signatoryTitle1 },
    { src: signatureUrl2, name: signatoryName2, title: signatoryTitle2 },
  ];

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
      <div
        className="flex justify-center bg-[#FEFEFD] items-center shadow-md px-16 py-10 relative overflow-hidden text-[#4D4D4D]"
        style={{
          width: "1056px",
          height: "500px",
        }}
      >
        {/* Repeating wavy background */}
        <div className="z-0">
          {Array.from({ length: 32 }).map((_, i) => (
            <img
              key={i}
              src={wavy}
              alt=""
              className="absolute w-full left-0"
              style={{ top: `${i * 20}px` }}
            />
          ))}
        </div>

        {/* Corner decorations */}
        <div className="z-10">
          <img
            src={rect}
            alt=""
            className="absolute"
            style={{ width: "65%", top: "0px", right: "-4px" }}
          />
          <img
            src={rect2}
            alt=""
            className="absolute"
            style={{
              width: "36%",
              bottom: "-1px",
              right: "-1px",
            }}
          />
          <img
            src={rect3}
            alt=""
            className="absolute"
            style={{ width: "65%", bottom: "-1px", left: "-4px" }}
          />
          <img
            src={rect4}
            alt=""
            className="absolute top-0 left-0"
            style={{ width: "36%" }}
          />
        </div>

        <div className="flex items-center justify-center w-20 h-20 overflow-hidden absolute right-10 top-4">
          {organizationLogo ? (
            <img
              src={organizationLogo}
              alt={organizationName}
              className="w-1/2 h-1/2 object-contain"
            />
          ) : (
            <p className="uppercase text-sm text-center px-2">
              {organizationName || "Brand Award"}
            </p>
          )}
        </div>

        <div className="bg-transparent rounded p-6 w-full z-40 flex flex-col items-center gap-8">
          <h2
            className="text-3xl font-bold text-center"
            style={{ fontFamily: "'Cinzel Decorative', serif" }}
          >
            {header || "CERTIFICATE"}
          </h2>

          <p className="text-center font-medium">
            THIS CERTIFICATE IS PROUDLY PRESENTED TO
          </p>

          <p
            className="text-4xl text-center font-bold pb-2"
            style={{
              width: "75%",
              fontFamily: "'Tangerine', cursive",
              borderBottom: "2px solid #4D4D4D",
            }}
          >
            {recipientName}
          </p>

          <p className="font-medium text-2xl" style={{ fontFamily: "cursive" }}>
            {courseTitle || "Course Title"}{" "}
          </p>

          <p className="text-center">
            {description ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat."}
          </p>

          <div className="mt-10 flex justify-between items-end">
            <div className="flex gap-8 justify-center items-center mt-5">
              {/* Signature 1 - Always show if name is provided */}
              {signatoryName1 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
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
                    <div className="text-xs font-medium">{signatoryTitle1}</div>
                  )}
                </div>
              )}

              {/* Signature 2 - Always show if name is provided */}
              {signatoryName2 && (
                <div
                  className="flex flex-col items-center text-center"
                  style={{ marginTop: -20 }}
                >
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
                    <div className="text-xs font-medium">{signatoryTitle2}</div>
                  )}
                </div>
              )}

              {/* Date display */}
              {date && (
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 mt-8 mb-2" />
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
        </div>
      </div>
    </div>
  );
}
