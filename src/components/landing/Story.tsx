import React from "react";
import { CheckCircle } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

const Story: React.FC = () => {
  const navigate = useNavigate();

  const milestones = [
    // {
    //   year: "2023",
    //   title: "The Beginning",
    //   description:
    //     "We recognized a gap in the market for simple, elegant certificate solutions. Certifyer was born from the vision of empowering organizations to celebrate achievements.",
    //   icon: "🚀",
    // },
    // {
    //   year: "2024",
    //   title: "Growth & Innovation",
    //   description:
    //     "We launched our first suite of templates and expanded to support thousands of certificates. Our platform became the trusted choice for training institutes and universities.",
    //   icon: "⚡",
    // },
    {
      year: "2025",
      title: "Global Expansion",
      description:
        "Now serving organizations worldwide, we continue innovating with AI-powered analytics and enhanced customization features to meet growing demands.",
      icon: "🌍",
    },
  ];

  const values = [
    {
      title: "Simplicity",
      description: "Making certificate generation effortless for everyone",
      icon: "✨",
    },
    {
      title: "Security",
      description: "Protecting your certificates with advanced encryption",
      icon: "🔒",
    },
    {
      title: "Scalability",
      description:
        "Growing with your organization, from startups to enterprises",
      icon: "📈",
    },
    {
      title: "Impact",
      description: "Turning learner achievements into brand visibility",
      icon: "🎯",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-[#FFCB9E52] to-[#FFFBF8] font-['Inter'] min-h-screen relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="">
        <div className="absolute blur-sm -top-26 -left-30 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
        <div className="absolute blur-sm top-20 -left-40 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
        <div className="absolute blur-sm -top-10 -left-33 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
        <div className="absolute blur-sm -top-37 -left-21 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
        <div className="absolute blur-sm -top-37 left-5 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
        <div className="absolute blur-sm -top-26 -right-30 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
        <div className="absolute blur-sm top-20 -right-40 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
        <div className="absolute blur-sm -top-10 -right-33 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
        <div className="absolute blur-sm -top-37 -right-21 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
        <div className="absolute blur-sm -top-37 right-5 bg-gradient-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
      </div>

      <div className="relative z-40">
        {/* <Navbar /> */}

        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center py-16 md:py-24 px-10 md:px-28 gap-10 mt-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="font-extrabold text-5xl md:text-6xl tracking-tight text-gray-900">
                Our Story
              </h1>
              <p className="text-[#696969] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                From a simple idea to a global platform empowering organizations
                to celebrate achievements through beautiful, secure certificates.
              </p>
            </div>

            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => navigate("/signup")}
                className="bg-linear-to-r from-[#DC8FFF] via-[#77C3FF] to-[#89F4D8] p-0.5 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <span className="flex items-center space-x-2 bg-linear-to-b from-[#151515] to-[#2E2D2D] text-white rounded-full px-6 py-3 text-sm font-semibold">
                  <span>Get Started</span>
                </span>
              </button>
              <button
                onClick={() => navigate("/")}
                className="border-2 border-orange-400 text-[#FF7700] px-6 py-3 rounded-full cursor-pointer hover:scale-105 transition-transform duration-300 font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 w-full max-w-4xl">
            <div className="space-y-4 p-8 rounded-lg bg-white border-2 border-[#FFE0C6] hover:border-[#FF7700] transition-colors duration-300">
              <h2 className="font-extrabold text-2xl text-gray-900">
                Our Mission
              </h2>
              <p className="text-[#696969] text-base leading-relaxed">
                To empower organizations worldwide to celebrate and showcase
                learner achievements through beautiful, secure, and trackable
                certificates that drive visibility, credibility, and impact.
              </p>
            </div>

            <div className="space-y-4 p-8 rounded-lg bg-white border-2 border-[#FFE0C6] hover:border-[#FF7700] transition-colors duration-300">
              <h2 className="font-extrabold text-2xl text-gray-900">
                Our Vision
              </h2>
              <p className="text-[#696969] text-base leading-relaxed">
                A world where every achievement is celebrated, verified, and
                leveraged to create opportunities. We envision certificates as
                powerful tools for learner empowerment and organizational growth.
              </p>
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-10 md:py-16 px-4 md:px-28">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-extrabold text-3xl md:text-4xl mb-12 text-center">
              Our Journey
            </h2>

            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex gap-8 items-start">
                  <div className="flex flex-col items-center">
                    <div className="text-4xl">{milestone.icon}</div>
                    {index < milestones.length - 1 && (
                      <div className="w-1 h-32 bg-gradient-to-b from-[#FF7700D9] to-[#FFE0C6] mt-4" />
                    )}
                  </div>

                  <div className="flex-1 pt-2">
                    <div className="text-sm font-semibold text-[#FF7700] mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3">
                      {milestone.title}
                    </h3>
                    <p className="text-[#696969] leading-relaxed">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="bg-[#FAFAFA] py-10 md:py-16 px-4 md:px-28">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-extrabold text-3xl md:text-4xl mb-4">
              Our Core Values
            </h2>
            <p className="text-[#696969] mb-12 text-base md:text-lg">
              These principles guide everything we do
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
                <div
                  key={index}
                  className="bg-white p-6 rounded-lg border-2 border-[#FFE0C6] hover:border-[#FF7700] transition-colors duration-300"
                >
                  <div className="text-3xl mb-3">{value.icon}</div>
                  <h3 className="text-xl font-extrabold text-gray-900 mb-2">
                    {value.title}
                  </h3>
                  <p className="text-[#696969] leading-relaxed text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}

        {/* <Footer /> */}
      </div>
    </div>
  );
};

export default Story;
