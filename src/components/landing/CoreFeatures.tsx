import React from "react";
import certificate from "../../assets/certificate.svg";
// import kaban from "../../assets/kaban.svg";
import airplay from "../../assets/airplay.svg";
import gauge from "../../assets/gauge.svg";
import shield from "../../assets/shield.svg"
import { IoCheckmark } from "react-icons/io5";

interface Feature {
  icon: string;
  title: string;
  checklist: string[];
}

const CoreFeatures: React.FC = () => {
  const features: Feature[] = [
    {
      icon: certificate,
      title: "Certificate Templates",
      checklist: [
        "Impact, Professional, and Advanced templates",
        "Custom logos, signatories, PDF downloads",
        "Future upgrades: Template builder, bulk generation, QR code generation",
      ],
    },
    {
      icon: airplay,
      title: "Organization Management",
      checklist: [
        "Support for multiple organizations",
        "Centralized branding control",
        "Signatory, name, and color configuration",
      ],
    },
    {
      icon: certificate,
      title: "Certificate Generation",
      checklist: [
        "Fast issuance",
        "Auto-assigned unique IDs",
        "Publicly verifiable and secure URLs",
      ],
    },
    {
      icon: airplay,
      title: "Testimonial System",
      checklist: [
        "Text feedback",
        "Option to download testimonials as JSON or CSV",
        "Admin dashboard for moderation",
      ],
    },
    {
      icon: gauge,
      title: "Analytics Dashboard",
      checklist: [
        "Issuance metrics, program performance",
        "Testimonial response rates",
        "Monthly trends and growth visualization",
      ],
    },
    {
      icon: shield,
      title: "Security & Authentication",
      checklist: [
        // "Supabase Auth (email & social login)",
        "JWT-based API protection",
        "Role-based access control",
      ],
    },
  ];

  return (
    <section className="bg-white py-10 px-4 md:px-28 md:py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="font-extrabold text-2xl sm:text-3xl md:text-4xl">
            Core Features
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 justify-items-center">
          {features.map((feature: Feature, index: number) => (
            <div
              key={index}
              className="bg-[#FAFAFA] shadow-sm rounded-md p-4 md:p-5 space-y-5 w-full max-w-sm min-h-64"
            >
              <div className="rounded-full bg-[#FFF7F0] h-12 w-12 flex items-center justify-center">
                <img
                  src={feature.icon}
                  alt={`${feature.title} icon`}
                  className="w-6 h-6"
                />
              </div>
              <div className="">
                <h3 className="font-semibold text-lg tracking-tight mb-3">
                  {feature.title}
                </h3>
                <ul className="text-sm/6 text-gray-700 space-y-4">
                  {feature.checklist.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span>
                        <IoCheckmark className="text-[#22C55E] size-6" />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;