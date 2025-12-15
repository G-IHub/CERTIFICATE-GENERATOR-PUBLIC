import React from "react";
import container from "../../assets/Container2.svg";

interface CertificateTemplate3Props {
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

export default function CertificateTemplate3({
  header = "CERTIFICATE",
  courseTitle = "Sample Course",
  description = "",
  date = "",
  recipientName = "Name Surname",
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
}: CertificateTemplate3Props) {
  const transformClass =
    mode === "student" ? "transform scale-[0.3]" : "transform scale-100";
  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible flex justify-center"
    : "min-w-[1056px] flex justify-center items-center";

  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={`${containerClass} ${transformClass}`}>
      <div
        className="flex justify-center items-center shadow-md px-16 rounded-sm relative overflow-hidden text-[#4D4D4D]"
        style={{
          width: "1056px",
          height: "600px",
          paddingTop: "80px",
          paddingBottom: "80px",
        }}
      >
        <div className="z-0">
          <div
            className="bg-black w-full absolute left-0"
            style={{
              top: "-30px",
              height: "70px",
              transform: "skewY(4deg)",
              zIndex: 5,
            }}
          ></div>
          <div
            className="w-1/4 rounded absolute z-10"
            style={{
              background: "#FBB33A",
              top: "-70px",
              right: "20px",
              height: "100px",
              transform: "rotate(25deg)",
              zIndex: 10,
            }}
          ></div>
          <div
            className="bg-gray-200 w-1/2 absolute"
            style={{
              transform: "rotate(-4deg)",
              height: "40px",
              left: "-16px",
              top: "10px",
              zIndex: 0,
            }}
          ></div>
          <div
            className="bg-black w-full absolute left-0"
            style={{
              bottom: "-24px",
              zIndex: 5,
              height: "60px",
              transform: "skewY(2deg)",
            }}
          ></div>
          <div
            className="bg-gray-200 w-full h-4 absolute left-0  z-0"
            style={{ bottom: "36px", transform: "skewY(2deg)" }}
          ></div>
          <div
            className="w-1/4 h-10 rounded absolute z-0"
            style={{
              background: "#FBB33A",
              right: "-16px",
              bottom: "12px",
              transform: "skewX(-10deg) skewY(-10deg)",
              zIndex: 0,
            }}
          ></div>
          {/* <div
            className="bg-black w-1/2 h-10 -skew-y-2 -skew-x-60 absolute -right-10 -bottom-5 z-5"
            style={{transform: "skewX(-60deg) skewY(-2deg)",}}
          ></div> */}
          <img
            src={container}
            alt=""
            className="absolute z-10"
            style={{ width: "10%", top: "30px", right: "20px" }}
          />
        </div>
        <div className="p-6 w-full flex flex-col items-center gap-6 z-40">
          <p className="text-3xl tracking-wider font-bold uppercase">
            {" "}
            {header || "Certificate of Appreciation"}{" "}
          </p>

          <p className="uppercase">This certificate is proudly presented to</p>

          <p
            className="text-5xl font-bold border-b-2 border-b-gray-500 pb-2 text-[#FFB145] text-center"
            style={{ fontFamily: "Tangerine, serif" }}
          >
            {recipientName}
          </p>

          <p className="font-medium text-2xl" style={{ fontFamily: "cursive" }}>
            {" "}
            {courseTitle || "Course Title"}{" "}
          </p>

          <p className="text-center max-w-2xl">
            {description ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
          </p>

          <div className="mt-10 flex justify-between items-end w-full">
            <div
              className="flex w-full justify-between items-center"
              style={{ justifyContent: "space-between" }}
            >
              {/* Signature 1 - Always show if name is provided */}
              {signatoryName1 && (
                <div
                  className="flex flex-col items-center text-center gap-1"
                  style={{ marginTop: -20 }}
                >
                  {signatureUrl1 && (
                    <img
                      src={signatureUrl1}
                      alt={signatoryName1}
                      className="w-full h-14 object-contain border-b-2 pb-1"
                      // style={{ marginBottom: -12 }}
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
                  className="flex flex-col items-center text-center gap-1"
                  style={{ marginTop: -20 }}
                >
                  {signatureUrl2 && (
                    <img
                      src={signatureUrl2}
                      alt={signatoryName2}
                      className="w-full h-14 object-contain border-b-2 pb-1"
                      // style={{ marginBottom: -12 }}
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
