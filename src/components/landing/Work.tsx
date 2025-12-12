import React from "react";
import work from "../../assets/work.svg";

const Work: React.FC = () => {
  return (
    <section className="py-10 px-6 md:px-28 md:py-16 bg-[#F9F9F9]">
      <div className="text-center md:space-y-4 mb-4 md:mb-12">
        <h2 className="font-extrabold text-3xl md:text-4xl">How It Works</h2>
        <p className="leading-6 text-sm md:text-base text-gray-700">
          Certifyer makes issuing and managing certificates simple and
          efficient. <br /> Follow these easy steps to get started:
        </p>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-12 items-center">
        <div className="block md:w-1/2 shadow-sm">
          <img src={work} alt="certificates" className="w-full rounded-md" />
        </div>

        <div className="md:w-1/2 space-y-8">
          <div className="flex gap-4 items-start">
            <span className="flex items-center text-sm justify-center w-8 h-8 px-3.5 py-2 rounded-full bg-[#FFF7F0] text-orange-500 font-semibold">
              1
            </span>
            <div className="space-y-2">
              <h4 className="font-semibold">Sign Up / Log In</h4>
              <p className="text-gray-700 text-sm">
                Easily create your account or set up your organization, it only
                takes a moment to get started.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="flex items-center text-sm justify-center w-8 h-8 px-3.5 py-2 rounded-full bg-[#FFF7F0] text-orange-500 font-semibold">
              2
            </span>
            <div className="space-y-2">
              <h4 className="font-semibold">Brand Your Organization</h4>
              <p className="text-gray-700 text-sm">
                In the Settings tab, upload your logo, and add
                signatories to complete your setup.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="flex items-center text-sm justify-center w-8 h-8 px-3.5 py-2 rounded-full bg-[#FFF7F0] text-orange-500 font-semibold">
              3
            </span>
            <div className="space-y-2">
              <h4 className="font-semibold">Generate Certificates</h4>
              <p className="text-gray-700 text-sm">
                Pick your preferred template, enter the certificate details, pick a signature and we handle the rest!
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start">
            <span className="flex items-center text-sm justify-center w-8 h-8 px-3.5 py-2 rounded-full bg-[#FFF7F0] text-orange-500 font-semibold">
              4
            </span>
            <div className="space-y-2">
              <h4 className="font-semibold">Share and Track</h4>
              <p className="text-gray-700 text-sm">
                Get and share unique URLs, collect testimonials, and analyze engagement.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Work;