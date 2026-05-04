import React from "react";
import { useNavigate } from "react-router-dom";
import hero_img from "../../assets/hero.svg";
import { TbLocationFilled } from "react-icons/tb";

const Hero: React.FC = () => {
  const navigate = useNavigate();


  return (
    <section className="flex flex-col justify-center mt-8 md:mt-0 md:mb-12 items-center md:flex-row px-6 md:px-28">
      <div className="space-y-3 max-w-lg md:max-w-md">
        <h2 className="font-medium text-4xl md:text-5xl tracking-tight">
          Generate, Issue & Manage Your Certificates with Ease.
        </h2>
        <p className="text-[#696969] text-xl md:text-lg">
          A modern multi-tenant platform for organizations and educators to
          issue branded digital certificates, collect testimonials, and track
          performance.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="mt-4 bg-linear-to-r from-[#DC8FFF] via-[#77C3FF] to-[#89F4D8] p-0.5 rounded-full cursor-pointer hover:scale-105 transition duration-300"
        >
          <span className="flex items-center space-x-2 bg-linear-to-b from-[#151515] to-[#2E2D2D] text-white rounded-full px-4 py-2 text-lg">
            <span>Try For Free</span>
            <div className="bg-white/90 w-4 h-4 rounded-full flex items-center justify-center">
              <TbLocationFilled className="size-2 text-orange-500" />
            </div>
          </span>
        </button>
      </div>

      <div className="mt-6 md:mt-10 md:ml-20 relative w-full md:w-11/12">
        <img
          src={hero_img}
          alt="hero"
          className="border-5 border-[#FFE0C6] rounded-lg w-1/2 h-auto md:w-full hidden md:block"
        />
        <div className="z-20 hidden md:block">
          <TbLocationFilled className="text-[#850704] absolute bottom-0 -left-3 size-5" />
          <div className="absolute -bottom-6 -left-20 rounded-full text-xs px-3 py-2 bg-[#FFD2CE] text-[#B92014] rotate-1">
            Achieve
          </div>
          <TbLocationFilled className="text-[#057D47] absolute -bottom-1 right-10 size-5 -rotate-90" />
          <div className="absolute -right-8 -bottom-10 rounded-full text-xs px-3 py-2 bg-[#DAFFEE] text-[#057D47] rotate-3">
            Success
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;