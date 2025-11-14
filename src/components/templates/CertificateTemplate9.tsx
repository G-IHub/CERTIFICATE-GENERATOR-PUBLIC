import React, { useEffect } from "react";
import first from "../../assets/1st.svg";

interface CertificateTemplate9Props {
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
  mode?: "student" | "template-selection";
}

export default function CertificateTemplate9({
  header = "Sertifikat Penghargaan",
  courseTitle = "",
  description = "",
  date = "",
  recipientName = "Recipient Name",
  isPreview = false,
  organizationName,
  organizationLogo,
  signatoryName1 = "Hormat kami",
  signatoryTitle1 = "",
  signatureUrl1,
  mode = "student",
}: CertificateTemplate9Props) {
  const scale = mode === "student" ? 0.3 : 1;

  const containerClass = isPreview
    ? "w-full mx-auto origin-center overflow-visible"
    : "min-w-[1056px] flex justify-center items-center";

  useEffect(() => {
    const id = "rakkas-font";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=Montserrat&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  return (
    <div
      className={containerClass}
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent"}}
    >
      <div
        className="flex justify-center items-center shadow-md w-3xl p-10 rounded-sm relative text-[#4D4D4D] font-['Montserrat'] overflow-hidden"
        style={{
          background: "linear-gradient(to right, #DDB4FB, #FDBA18)",
        }}
      >
        <div>
          <div
            className="w-32 h-32 border-2 absolute bottom-0 rotate-45 z-40"
            style={{
              border: "2px solid",
              left: "-20px",
              borderImage: "linear-gradient(to bottom, #FDBA18, #FA54CE) 1",
            }}
          />
          <div
            className="w-14 h-14 absolute left-0 bottom-14 rotate-45 z-40"
            style={{
              border: "2px solid",
              bottom: "100px",
               borderImage: "linear-gradient(to bottom, #FDBA18, #FA54CE) 1"
            }}
          />
          <div
            className="w-14 h-14 absolute left-14 bottom-4 rotate-45 z-40"
            style={{
              border: "2px solid",
               borderImage: "linear-gradient(to bottom, #FDBA18, #FA54CE) 1"
            }}
          />
          <div
            className="w-16 h-50 absolute -left-4 -top-4 rotate-50 z-20"
            style={{
              border: "2px solid",
              borderImage: "linear-gradient(to top, #FDBA18, #FA54CE) 1"
            }}
          />
          <div
            className="w-12 h-50 absolute left-50 -top-20 rotate-70 z-0"
            style={{
              border: "2px solid",
              borderImage: "linear-gradient(to top, #d604da, #ff9c39) 1",
            }}
          />
          <div
            className="w-30 h-80 absolute left-2 -top-36 rotate-50 z-10"
            style={{
              background: "linear-gradient(to bottom, #FFA246, #D604DA)",
            }}
          />
          <div
            className="w-30 h-80 absolute -left-4 -top-26 rotate-50 z-0"
            style={{ background: "#FAC595" }}
          />
          <div
            className="w-50 h-50 absolute rotate-30 -right-10 -bottom-20 z-0"
            style={{ background: "#DDB4FB" }}
          />
          <div
            className="w-30 h-50 absolute rotate-30 -right-10 -bottom-20 z-10"
            style={{
              background: "linear-gradient(to bottom, #FFA246, #D604DA)",
            }}
          />
          <div
            className="w-16 h-50 absolute right-30 -bottom-12 rotate-50 z-20"
            style={{
              border: "2px solid",
              borderImage: "linear-gradient(to top, #D604DA, #FF9C39) 1",
            }}
          />
        </div>

        <div
          className="rounded space-y-6 relative p-10 w-full z-30"
          style={{
            background: "linear-gradient(to bottom, #DDB4FB, #FFFFFF)",
          }}
        >
          <div
            className="w-full h-6 absolute left-0 top-4"
            style={{
              background: "linear-gradient(to left, #FF9C39, #FA54CE)",
            }}
          />
          <div
            className="h-full w-6 absolute right-4 top-0"
            style={{
             background: "linear-gradient(to left, #FF9C39, #FA54CE)",
            }}
          />
          {first && (
            <img
              src={String(first)}
              className="absolute -top-5 -right-5"
              alt="decoration"
            />
          )}
          <div className="mt-6">
            <h3
              className="font-bold text-2xl"
              style={{
                backgroundImage:
                  "linear-gradient(to bottom, #FDBA18, #D604DA)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {header}
            </h3>
            <p className="font-medium" style={{ color: "#FA54CE80" }}>
              diberikan kepada
            </p>
          </div>
          <h2 className="font-bold text-3xl" style={{ color: "#FD8207" }}>
            {recipientName}
          </h2>
          <div>
            <p className="font-medium" style={{ color: "#FA54CE80" }}>
              Selamat atas pencapaian sebagai
            </p>
            <h3
              className="font-bold tracking-tighter text-2xl"
              style={{ color: "#60B3FF" }}
            >
              {courseTitle || "Achievement"}
            </h3>
          </div>
          <p className="font-medium" style={{ color: "#FA54CE80" }}>
            {description || ""}
          </p>
          <div className="mt-10 flex justify-between items-center px-10">
            <div className="space-y-4">
              <div
                className="border-b-2 w-50 text-center font-bold text-lg"
                style={{ color: "#FA54CE80"}}
              >
                Hormat kami
              </div>
              <p
                className="text-center text-sm font-medium"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #FFA246, #FA54CE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {date || "DATE"}
              </p>
            </div>
            <div className="space-y-4">
              <div
                className="border-b-2 w-50 text-center font-bold text-lg"
                style={{ color: "#161BA069" }}
              >
                Hormat kami
              </div>
              <p
                className="text-center text-sm font-medium"
                style={{
                  backgroundImage: "linear-gradient(to bottom, #FFA246, #FA54CE)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                {signatoryName1 || "SIGNATURE"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
