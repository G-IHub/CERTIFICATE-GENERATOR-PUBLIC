import React from "react";
import { CheckCircle } from "lucide-react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import logo from "../../assets/logo.png";
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
        <Navbar />

        {/* Hero Section */}
        <section className="flex flex-col justify-center items-center py-16 md:py-24 px-10 md:px-28 gap-10 mt-20">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4 flex flex-col items-center">
              <img src={logo} alt="logo" className="w-16" />
              <h1 className="font-extrabold text-5xl md:text-6xl tracking-tight text-gray-900">
                Our Story
              </h1>
              <p className="text-[#696969] text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                From a simple idea to a global platform empowering organizations
                to celebrate achievements through beautiful, secure
                certificates.
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

          {/* How Certifyer Began */}

          <div className="max-w-4xl mx-auto text-center space-y-8 py-10">
            <div className="space-y-4">
              <h1 className="font-extrabold text-4xl md:text-6xl tracking-tight text-gray-900">
                How Certifyer Began
              </h1>
              <p className="text-[#696969] text-left text-lg md:text-xl leading-relaxed max-w-7xl mx-auto">
                Certifyer was born out of a simple but recurring challenge:
                issuing certificates should not be stressful. Across trainings,
                workshops, webinars, and community programs, we repeatedly
                encountered the same problem — creating certificates was
                time-consuming, inconsistent, and often dependent on manual
                design tools or external designers. What should have been a
                moment of recognition and celebration often became a bottleneck.
                We saw an opportunity to simplify this process and build a
                solution that works for modern educators, trainers, and
                organizations.
              </p>
            </div>
          </div>

          {/* The Journey */}

          <div className="max-w-4xl mx-auto text-center space-y-8 py-10">
            <div className="space-y-4">
              <h1 className="font-extrabold text-4xl md:text-6xl tracking-tight text-gray-900">
                The Journey
              </h1>
              <div className="text-[#696969] text-left text-lg md:text-xl leading-relaxed max-w-7xl mx-auto">
                <p className="mb-4 text-left">
                  The journey of Certifyer started with a clear goal: make
                  certificate generation fast, professional, and accessible to
                  everyone.
                </p>
                <p>
                  We began by observing how individuals and organizations
                  currently handled certificates — from manually editing
                  templates to reusing outdated designs. These insights shaped
                  our decision to focus on:
                </p>
                <ul className="list-disc pl-6 space-y-2 marker:text-[#696969]">
                  <li>
                    <strong>Speed and simplicity</strong>
                  </li>
                  <li>
                    <strong>Professional, ready-made templates</strong>
                  </li>
                  <li>
                    <strong>A workflow that requires no design skills</strong>
                  </li>
                </ul>
                <p>
                  Using a lean, MVP-first approach, we built Certifyer to solve
                  the most important problem first — generating certificates
                  efficiently — while leaving room to grow based on real user
                  feedback.
                </p>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <section className="py-10 md:py-16 px-4 md:px-28">
            <div className="max-w-5xl mx-auto">
              <h2 className="font-extrabold text-3xl md:text-4xl text-center mb-4">
                Our Core Values
              </h2>
              <p className="text-[#696969] text-base text-center md:text-lg">
                These principles guide everything we do
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
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

          {/* Mission & Vision Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-16 w-full max-w-4xl py-10">
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
                powerful tools for learner empowerment and organizational
                growth.
              </p>
            </div>
          </div>

          {/* The Process */}

          <div className="max-w-4xl py-10 mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="font-extrabold text-4xl md:text-6xl tracking-tight text-gray-900">
                The Process
              </h1>
              <div className="text-[#696969] text-left text-lg md:text-xl leading-relaxed max-w-7xl mx-auto">
                <p className="mb-4 text-left">
                  Certifyer was developed using a thoughtful and iterative
                  process:
                </p>

                <ol className="list-decimal pl-6 space-y-2 marker:text-[#696969]">
                  <li className="mb-2">
                    <strong>Research & Ideation:</strong> We identified the core
                    needs of trainers, educators, and event organizers and
                    defined the essential features required for a reliable
                    certificate platform.
                  </li>
                  <li className="mb-2">
                    <strong>Design & User Experience:</strong> We focused on
                    clean layouts, clear typography, and a simple interface to
                    ensure certificates look credible and official, while the
                    platform remains easy to use.
                  </li>
                  <li className="mb-2">
                    <strong>Development & Testing:</strong> Built with modern
                    web technologies, Certifyer was tested across devices to
                    ensure performance, responsiveness, and reliability.
                  </li>
                  <li className="mb-2">
                    <strong>Feedback & Improvement:</strong> Early users and
                    internal testing helped refine the platform, improve
                    usability, and prepare it for launch.
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* The Team */}

          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h1 className="font-extrabold text-4xl md:text-6xl tracking-tight text-gray-900">
                The Team
              </h1>
              <div className="text-[#696969] text-left text-lg md:text-xl leading-relaxed max-w-7xl mx-auto">
                <p className="mb-4 text-left">
                  Certifyer is built by a small but dedicated team passionate
                  about education, technology, and digital innovation.
                </p>

                <p>We combine experience in:</p>

                <ol className="list-decimal pl-6 space-y-2 marker:text-[#696969]">
                  <li className="mb-2">
                    <strong>Software Engineering</strong>
                  </li>
                  <li className="mb-2">
                    <strong>Product Developemnt</strong>
                  </li>
                  <li className="mb-2">
                    <strong>Digital education and training</strong>
                  </li>
                  <li className="mb-2">
                    <strong>Community building</strong>
                  </li>
                </ol>

                <p>
                  Backed by Genomac Holdings and supported by the innovation
                  ecosystem at G‑iHub, our team is committed to building tools
                  that empower learning, recognition, and professional growth.
                </p>
              </div>
            </div>
          </div>

          {/* Why We're Building Certifyer */}
          <div className="max-w-4xl mx-auto text-left py-20 space-y-8 mt-10">
            <div className="space-y-4">
              <h1 className="font-extrabold text-center text-4xl md:text-6xl tracking-tight text-gray-900">
                Why We’re Building Certifyer
              </h1>
              <p>Why We’re Building Certifyer</p>
              <p className="">
                Certificates are more than documents — they represent effort,
                learning, and achievement. Certifyer exists to help individuals
                and organizations deliver that recognition with clarity,
                professionalism, and ease.
              </p>
              <p>
                As we continue to grow, our focus remains on building reliable
                tools that support digital learning, skill development, and
                scalable education systems.
              </p>
            </div>
          </div>

          {/* Looking Ahead */}
          <div className="max-w-4xl mx-auto text-left py-20 space-y-8 mt-10">
            <div className="space-y-4">
              <h1 className="font-extrabold text-center text-4xl md:text-6xl tracking-tight text-gray-900">
                Looking Ahead
              </h1>
              <p>Certifyer is just getting started.</p>
              <p className="">
                Our roadmap includes expanding features, supporting larger
                organizations, and integrating deeper tools for verification,
                branding, and automation. We’re building with the future of
                digital learning in mind — and we’re excited to have you along
                on this journey.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}

        <Footer />
      </div>
    </div>
  );
};

export default Story;
