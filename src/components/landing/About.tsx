import React from "react";
import { CheckCircle } from 'lucide-react';
import about_img from "../../assets/about.svg";

interface KeyBenefit {
  id: number;
  text: string;
}

const About: React.FC = () => {
  const keyBenefits: KeyBenefit[] = [
    {
      id: 1,
      text: "Instant generation and delivery of certificates.",
    },
    {
      id: 2,
      text: "Monetization of certificates and digital products.",
    },
    {
      id: 3,
      text: "Analytics for performance and impact tracking.",
    },
    {
      id: 4,
      text: "Scalable, multi-tenant system.",
    },
  ];

  return (
    <section className="bg-[#FAFAFA] py-10 md:py-16 px-6 md:px-28">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-10">
        <div className="w-full md:w-1/2 space-y-6">
          <div className="space-y-4">
            <h2 className="font-extrabold text-3xl md:text-4xl">About</h2>
            <p className="leading-7 text-sm md:text-base text-gray-700">
              Certifyer helps training institutes,
              universities, and organizations issue beautiful, secure, and
              trackable certificates. Each certificate includes unique IDs,
              shareable URLs, and testimonial collection features, allowing you
              to turn your learners' achievements into brand visibility.
              You can also turn your certificates and digital products into revenue. Certifyer helps you monetize your certificates and digital products by providing a platform to display your certificates and digital products, track your sales and get paid for your products.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-xl md:text-2xl tracking-tight">
              Key Benefit
            </h3>

            <div className="space-y-3 text-gray-700">
              {keyBenefits.map((benefit) => (
                <div
                  key={benefit.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <CheckCircle className="text-[#22C55E] w-5 h-5" />
                  <span>{benefit.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex justify-center md:justify-end">
          <img
            src={about_img}
            alt="About illustration"
            className="w-full max-w-xs sm:max-w-sm md:max-w-md h-auto rounded-lg"
          />
        </div>
      </div>
    </section>
  );
};

export default About;
