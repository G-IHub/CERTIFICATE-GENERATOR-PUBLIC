import React, { useState, useEffect } from "react";
import Navbar from "./landing/Navbar";
import Hero from "./landing/Hero";
import About from "./landing/About";
import CoreFeatures from "./landing/CoreFeatures";
import Work from "./landing/Work";
import Price from "./landing/Price";
import Testimonial from "./landing/Testimonial";
import FAQ from "./landing/FAQ";
import Footer from "./landing/Footer";
import Partners from "./landing/Partners";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import bell from "../assets/bell.jpg";

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(true);
  }, []);

  return (
    <div className="bg-gradient-to-b from-[#FFCB9E52] to-[#FFFBF8] font-['Inter'] min-h-screen relative overflow-hidden">
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
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent>
            <DialogHeader>
              <div className="w-1/2 mx-auto">
                <img src={bell} alt="" />
              </div>
              <DialogTitle className="text-center text-lg font-bold">Early Access Notice</DialogTitle>
              <DialogDescription className="text-center mt-2 text-base text-gray-600">
                Certifyer is currently in early access. We're opening core
                features to help creators and institutions adopt the platform
                ahead of our full commercial launch in March.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
        <Navbar />
        <section id="hero">
          <Hero />
        </section>
        <About />
        <section id="partners">
          <Partners />
        </section>
        <section id="features">
          <CoreFeatures />
        </section>
        <section id="work">
          <Work />
        </section>
        {/* <section id="prices">
          <Price />
        </section> */}
        <section id="testimonials">
          <Testimonial />
        </section>
        <FAQ />
        <Footer />
      </div>
    </div>
  );
}
