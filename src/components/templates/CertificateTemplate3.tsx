import React from "react";

// Optional ribbon asset — may not exist in repo; render only if available
let ribbonSrc: string | null = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // require will resolve if the asset exists; otherwise we fall back to null
  ribbonSrc = require("../../assets/Ribbon.svg");
} catch (e) {
  ribbonSrc = null;
}

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
  const previewMode = isPreview || mode === "template-selection";

  // Main certificate box style: responsive when in previewMode so it fits inside the preview wrapper.
  const mainBoxStyle: React.CSSProperties = previewMode
    ? {
        width: "100%",
        maxWidth: 1056,
        height: "auto",
        padding: "32px",
        boxSizing: "border-box",
      }
    : { width: 1056, height: 816, padding: "64px 64px" };

  return (
    <div style={{ backgroundColor: "transparent" }} className="w-full mx-auto">
      <div
        className="flex justify-center bg-[#FEFEFD] items-center shadow-md rounded-sm relative overflow-hidden text-[#4D4D4D]"
        style={mainBoxStyle}
      >
        <div className="z-0 absolute inset-0">
          <div
            style={{
              background: "#000",
              width: "100%",
              height: previewMode ? 80 : 120,
              transform: "skewY(5deg)",
              position: "absolute",
              left: 0,
              top: previewMode ? "-30px" : -40,
              zIndex: 5,
            }}
          />

          <div
            style={{
              background: "#FBB33A",
              width: "25%",
              height: previewMode ? 90 : 144,
              transform: "rotate(25deg)",
              borderRadius: 6,
              position: "absolute",
              right: previewMode ? "6%" : 40,
              top: previewMode ? "-40px" : -80,
              zIndex: 10,
            }}
          />

          <div
            style={{
              background: "#e5e7eb",
              width: "50%",
              height: previewMode ? 44 : 60,
              transform: "rotate(-4deg)",
              position: "absolute",
              left: previewMode ? "-2%" : -16,
              top: previewMode ? "3%" : 20,
              zIndex: 0,
            }}
          />

          <div
            style={{
              background: "rgba(0,0,0,0.9)",
              width: "100%",
              height: previewMode ? 60 : 80,
              transform: "skewY(-2deg)",
              position: "absolute",
              left: 0,
              bottom: previewMode ? -12 : -20,
              zIndex: 5,
            }}
          />

          <div
            style={{
              background: "#e5e7eb",
              width: "100%",
              height: previewMode ? 28 : 40,
              transform: "skewY(5deg)",
              position: "absolute",
              left: 0,
              bottom: previewMode ? "6%" : 40,
              zIndex: 0,
            }}
          />

          <div
            style={{
              background: "#FBB33A",
              width: "25%",
              height: previewMode ? 28 : 40,
              transform: "skewY(-10deg) skewX(-10deg)",
              position: "absolute",
              right: previewMode ? "-4%" : -16,
              bottom: previewMode ? "8%" : 40,
              zIndex: 0,
            }}
          />

          <div
            style={{
              background: "#000",
              width: "50%",
              height: previewMode ? 56 : 80,
              transform: "skewY(-2deg) skewX(-60deg)",
              position: "absolute",
              right: previewMode ? "-6%" : -40,
              bottom: previewMode ? "-4%" : -20,
              zIndex: 5,
            }}
          />

          {ribbonSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={String(ribbonSrc)}
              alt="ribbon"
              className="absolute"
              style={{
                top: previewMode ? "4%" : 40,
                right: previewMode ? "6%" : 48,
                zIndex: 10,
              }}
            />
          )}

          <div
            style={{
              background: "#fbb33a",
              position: "absolute",
              right: previewMode ? "8%" : 76,
              top: previewMode ? "6%" : 68,
              zIndex: 10,
              border: "1px solid #c77b00",
              width: previewMode ? 36 : 48,
              height: previewMode ? 36 : 48,
              borderRadius: "9999px",
            }}
          />
        </div>

        <div className="p-6 w-full flex flex-col items-center gap-6 relative z-20">
          <div>
            <h2 className="text-4xl tracking-wider font-bold">CERTIFICATE</h2>
            <div className="flex items-center gap-4 text-xl uppercase">
              <span className="w-10 border" />
              <p>of Appreciation</p>
              <span className="w-10 border" />
            </div>
          </div>

          <p className="uppercase">This certificate is proudly presented to</p>

          <p
            className="text-6xl font-bold border-b-2 pb-2 text-[#FFB145] text-center"
            style={{ fontFamily: "Tangerine, serif" }}
          >
            {recipientName}
          </p>

          <p className="text-center max-w-2xl">
            {description ||
              "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."}
          </p>

          <div className="flex gap-10 mt-10 w-full justify-center">
            <div className="flex items-center gap-2">
              <p className="border-b-2 w-40 text-center" />
              <p className="text-center text-sm font-medium">SIGNATURE</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="border-b-2 w-40 text-center" />
              <p className="text-center text-sm font-medium">DATE</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
