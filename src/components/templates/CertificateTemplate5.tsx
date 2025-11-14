import React, { useEffect } from "react";
import secondaryAsset from "../../assets/2nd.svg";


interface CertificateTemplate5Props {
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

export default function CertificateTemplate5({
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
}: CertificateTemplate5Props) {
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
      style={{ transform: `scale(${scale})`, backgroundColor: "transparent" }}
    >
      <div className="flex justify-center bg-gradient-to-l from-[#161BA0] to-[#AC06F2] items-center shadow-md w-3xl p-10 rounded-sm relative text-[#4D4D4D] font-['Montserrat'] overflow-hidden">
        <div>
          <div className="w-20 h-20 border-2 [border-image:linear-gradient(to_bottom,#DDB4FB,#6E21E0)_1] absolute left-0 bottom-0 rotate-45 z-40" />
          <div className="w-10 h-10 border-2 [border-image:linear-gradient(to_bottom,#DDB4FB,#6E21E0)_1] absolute left-0 bottom-12 rotate-45 z-40" />
          <div className="w-14 h-14 border-2 [border-image:linear-gradient(to_bottom,#DDB4FB,#6E21E0)_1] absolute left-14 bottom-4 rotate-45 z-40" />
          <div className="w-16 h-50 border-2 [border-image:linear-gradient(to_bottom,#FA54CE,#6E21E0)_1] absolute -left-4 -top-4 rotate-50 z-20" />
          <div className="w-12 h-50 border-2 [border-image:linear-gradient(to_top,#FA54CE,#6E21E0)_1] absolute left-70 -top-20 rotate-70 z-0" />
          <div className="w-30 h-80 bg-gradient-to-b from-[#D604DA] to-[#6013AA] absolute left-2 -top-36 rotate-50 z-10" />
          <div className="w-30 h-80 bg-[#C162FF] absolute -left-4 -top-26 rotate-50 z-0" />
          <div className="w-50 h-50 bg-[#C162FF] absolute rotate-30 -right-10 -bottom-20 z-0" />
          <div className="w-30 h-50 bg-gradient-to-b from-[#AC06F2] to-[#6013AA] absolute rotate-30 -right-10 -bottom-20 z-10" />
          <div className="w-16 h-50 border-2 [border-image:linear-gradient(to_top,#FA54CE,#6E21E0)_1] absolute right-30 -bottom-12 rotate-50 z-20" />
        </div>

        <div className="bg-gradient-to-b from-[#DDB4FB] to-[#FFFFFF] rounded space-y-6 relative p-10 w-full z-30">
          <div className="bg-gradient-to-l from-[#161BA0] to-[#AC06F2] w-full h-6 absolute left-0 top-4" />
          <div className="bg-gradient-to-b from-[#161BA0] to-[#AC06F2] h-full w-6 absolute right-4 top-0" />
          {secondaryAsset && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={String(secondaryAsset)}
              className="absolute -top-5 -right-5"
              alt="decoration"
            />
          )}
          <div className="mt-6">
            <h3 className="font-bold text-2xl bg-clip-text text-transparent bg-gradient-to-b from-[#FA54CE] to-[#6E21E0]">
              {header}
            </h3>
            <p className="text-[#161BA069] font-medium">diberikan kepada</p>
          </div>
          <h2 className="text-[#6E21E0] font-bold text-3xl">{recipientName}</h2>
          <div>
            <p className="text-[#161BA069] font-medium">
              Selamat atas pencapaian sebagai
            </p>
            <h3 className="text-[#60B3FF] font-bold tracking-tighter text-2xl">
              {courseTitle || "Achievement"}
            </h3>
          </div>
          <p className="text-[#161BA069] font-medium">{description || ""}</p>
          <div className="mt-10 flex justify-between items-center px-10">
            <div className="space-y-4">
              <div className="border-b-2 w-50 text-center text-[#161BA069] font-bold text-lg">
                Hormat kami
              </div>
              <p className="text-center bg-clip-text text-transparent bg-gradient-to-b from-[#FA54CE] to-[#AC06F2] text-sm font-medium">
                {date || "DATE"}
              </p>
            </div>
            <div className="space-y-4">
              <div className="border-b-2 w-50 text-center text-[#161BA069] font-bold text-lg">
                Hormat kami
              </div>
              <p className="text-center bg-clip-text text-transparent bg-gradient-to-b from-[#FA54CE] to-[#AC06F2] text-sm font-medium">
                {signatoryName1 || "SIGNATURE"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
