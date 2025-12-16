import React from 'react';
import { SparklesIcon, AurekaLogo } from './Icons';

interface LandingProps {
  onStart: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart }) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-[#2E1065] via-[#5B21B6] to-[#7C3AED] flex flex-col items-center justify-center text-white overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 text-white/10 animate-pulse text-4xl">●</div>
      <div className="absolute top-20 right-20 text-white/10 animate-pulse delay-75 text-2xl">◆</div>
      <div className="absolute bottom-32 left-1/4 text-white/10 animate-pulse delay-150 text-5xl">▲</div>
      
      {/* Big Gradient Orb in Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-fuchsia-500/20 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 text-center px-6 animate-fade-in-up flex flex-col items-center">
        <div className="mb-8 scale-150 p-6 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 shadow-2xl">
            <AurekaLogo textClassName="text-white" />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-violet-200">
          Holiday Party
        </h1>
        <p className="text-xl md:text-2xl font-light tracking-widest text-violet-200 mb-12">
          Official Companion App
        </p>

        <button
          onClick={onStart}
          className="group relative bg-white text-violet-700 px-10 py-5 rounded-2xl font-bold text-xl md:text-2xl shadow-xl transition-all transform hover:scale-105 active:scale-95 hover:shadow-2xl hover:bg-violet-50"
        >
          <span className="flex items-center gap-3">
            Start the Party
            <SparklesIcon className="w-6 h-6 animate-spin-slow" />
          </span>
          
          {/* Button Glow Effect */}
          <div className="absolute inset-0 rounded-2xl ring-4 ring-white/30 group-hover:ring-white/50 transition-all"></div>
        </button>
        
        <p className="mt-8 text-sm text-violet-200/60 font-medium">
          Powered by Gemini AI
        </p>
      </div>
    </div>
  );
};