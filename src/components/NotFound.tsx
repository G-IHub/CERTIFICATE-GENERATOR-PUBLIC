import React from "react";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center relative overflow-hidden font-serif">
      {/* Header-like minimalist elements */}
      <div className="absolute top-0 left-0 w-full p-8 flex justify-between items-center pointer-events-none">
        <div className="w-10 h-10 flex items-center justify-center">
          <img src={logo} alt="logo" className="w-full h-full" />
        </div>
        <div className="flex gap-1 h-4">
          <div className="w-[1px] h-full bg-black/20" />
          <div className="w-[1px] h-full bg-black/20" />
          <div className="w-[1px] h-full bg-black/20" />
        </div>
      </div>

      {/* Massive Background 404 - Structural Typography */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
        <div className="flex items-center justify-center gap-[2vw] opacity-[0.05]">
          <span className="text-[35vw] font-bold text-orange-500 leading-none">4</span>
          <div className="w-[20vw] h-[20vw] border-[1.5vw] border-orange-500 rounded-full" />
          <span className="text-[35vw] font-bold text-orange-500 leading-none">4</span>
        </div>
      </div>

      {/* Main Content - Centered Block */}
      <div className="relative z-10 text-center px-6 max-w-2xl animate-in fade-in duration-1000">
        <h2 className="text-4xl md:text-7xl text-orange-900 mb-6 font-normal tracking-tight leading-tight">
          Page Not Available
        </h2>
        
        <div className="w-12 h-[1px] bg-black/20 mx-auto mb-8" />

        <p className="text-sm md:text-lg text-black/60 mb-12 max-w-md mx-auto leading-relaxed">
          The section you are looking for has been archived or relocated. 
          Please return to our main sanctuary.
        </p>

        <button
          onClick={() => (window.location.href = "/")}
          className="group relative inline-flex items-center gap-4 px-12 py-5 bg-white cursor-pointer border border-black rounded-full text-black hover:bg-orange-500 hover:text-white transition-all duration-700 ease-in-out shadow-sm hover:shadow-xl transform hover:-translate-y-1"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
          <span className="text-xs uppercase tracking-[0.3em] font-medium">Explore Home</span>
        </button>
      </div>

      {/* Subtle architectural markers */}
      <div className="absolute bottom-12 left-12 hidden lg:flex flex-col gap-2">
        <span className="text-[10px] uppercase tracking-[0.4em] text-black/30 font-sans">NotFound Page 404</span>
        <div className="w-20 h-[1px] bg-black/10" />
      </div>

      <div className="absolute bottom-12 right-12 hidden lg:flex flex-col items-end gap-2">
        <span className="text-[10px] uppercase tracking-[0.4em] text-black/30 font-sans">Certifyer / 2025</span>
        <div className="w-20 h-[1px] bg-black/10" />
      </div>
      
      {/* Background grain/texture effect overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/felt.png')]" />
    </div>
  );
}
