import React, { useEffect } from "react";
// Import ribbon and medal assets directly so the bundler resolves them correctly
import ribbon1 from "../../assets/Ribbon (1).svg";
import ribbon2 from "../../assets/Ribbon 2.svg";
import medal from "../../assets/Medal.svg";

interface CertificateTemplate4Props {
  header?: string;
  courseTitle?: string;
  description?: string;
  date?: string;
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

export default function CertificateTemplate4({
  header = "CERTIFICATE",
  courseTitle = "",
  description = "",
  date = "",
  recipientName = "Recipient",
  isPreview = false,
  organizationName,
  organizationLogo,
  signatoryName1,
  signatoryTitle1,
  signatureUrl1,
  signatoryName2,
  signatoryTitle2,
  signatureUrl2,
  mode = "student",
}: CertificateTemplate4Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const id = "rakkas-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Rakkas&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${containerClass} ${transformClass} bg-transparent`}>
      <div
        className="flex justify-center bg-white items-center shadow-md rounded-lg relative overflow-hidden border"
        style={{ width: "1056px", height: "600px", padding: "24px" }}
      >
        <div>
          {ribbon1 && (
            <img
              src={String(ribbon1)}
              alt="ribbon1"
              className="absolute z-10 -top-2 left-0"
              style={{ width: "30%" }}
            />
          )}
          {ribbon2 && (
            <img
              src={String(ribbon2)}
              alt="ribbon2"
              className="absolute z-10 bottom-0 right-0"
              style={{ width: "30%" }}
            />
          )}
        </div>

        <div className="bg-white border-4 border-[#314E854D] p-2 ">
          <div className="bg-white border-2 border-[#314E854D]">
            <div
              className="w-full flex flex-col items-center gap-8"
              style={{ padding: "24px" }}
            >
              <h2
                className="text-3xl tracking-wider font-bold uppercase"
                style={{ fontFamily: "'Rakkas', serif" }}
              >
                {header || "Certificate of Participation"}
              </h2>
              <p className="uppercase">proudly presented to</p>
              <p className="text-4xl font-semibold w-full border-b-2 border-b-[#314E85] pb-4 text-[#314E85] text-center">
                {recipientName}
              </p>
              <p
                className="font-medium text-2xl"
                style={{ fontFamily: "cursive" }}
              >
                {courseTitle || "Course Title"}
              </p>
              <p className="text-center">
                {description ||
                  "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
              </p>

              <div className="flex justify-between items-end">
                <div className="flex gap-10 justify-center items-center">
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
                        <div className="text-xs font-medium">
                          {signatoryTitle1}
                        </div>
                      )}
                    </div>
                  )}

                  <img src={medal} alt="medal" className="w-20" />

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
                        <div className="text-xs font-medium">
                          {signatoryTitle2}
                        </div>
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
      </div>
    </div>
  );
}
