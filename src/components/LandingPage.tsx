import React from "react";
import SEOHead from "./SEOHead";
import Navbar from "./landing/Navbar";
import Hero from "./landing/Hero";
import About from "./landing/About";
import CoreFeatures from "./landing/CoreFeatures";
import Work from "./landing/Work";
import Price from "./landing/Price";
import Testimonial from "./landing/Testimonial";
import FAQ from "./landing/FAQ";
import Footer from "./landing/Footer";
import BlogSection from "./landing/BlogSection";
import TemplateDisplay from "./landing/TemplateDisplay";

export default function LandingPage() {
  return (
    <>
      <SEOHead
        title="Certifyer - Professional Certificate Management Platform"
        description="Generate, manage, and verify professional certificates for your organization. Multi-tenant SaaS with customizable templates, real-time previews, secure verification, and bulk email distribution."
        type="website"
      />
      <div className="bg-linear-to-b from-[#FFCB9E52] to-[#FFFBF8] font-['Inter'] min-h-screen relative overflow-hidden">
        <div className="">
          <div className="absolute blur-sm -top-26 -left-30 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
          <div className="absolute blur-sm top-20 -left-40 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
          <div className="absolute blur-sm -top-10 -left-33 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
          <div className="absolute blur-sm -top-37 -left-21 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
          <div className="absolute blur-sm -top-37 left-5 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 -rotate-45" />
          <div className="absolute blur-sm -top-26 -right-30 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
          <div className="absolute blur-sm top-20 -right-40 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
          <div className="absolute blur-sm -top-10 -right-33 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
          <div className="absolute blur-sm -top-37 -right-21 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
          <div className="absolute blur-sm -top-37 right-5 bg-linear-to-b from-[#FF7700D9] via-[#FF77003D] to-[#FFF0E22E] h-100 w-12 rotate-45" />
        </div>
        <div className="relative z-40">
          <Navbar />
          <section id="hero">
            <Hero />
          </section>
          <About />
          <section id="features">
            <CoreFeatures />
          </section>
          <section id="work">
            <Work />
          </section>
          <TemplateDisplay />
          {/* <section id="prices">
          <Price />
        </section> */}
          <section id="testimonials">
            <Testimonial />
          </section>
          <section id="blog">
            <BlogSection />
          </section>
          <FAQ />
          <Footer />
        </div>
      </div>
    </>
  );
}