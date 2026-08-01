'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakWord } from '@/lib/phonics';

interface RobotGemmaProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  showSpeaker?: boolean;
}

export default function RobotGemma({
  message = '¡Hola! Soy Gemma, tu súper cerebro local.',
  size = 'md',
  showSpeaker = true,
}: RobotGemmaProps) {
  const handleSpeak = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    speakWord(message);
  };

  // Dimensions based on size prop
  const robotSize = size === 'sm' ? 'w-12 h-12' : size === 'lg' ? 'w-24 h-24' : 'w-16 h-16';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base md:text-lg' : 'text-sm md:text-base';

  return (
    <div className="flex items-center gap-3 my-2 animate-bounce-gentle">
      {/* Friendly Robot SVG Mascot */}
      <div
        onClick={handleSpeak}
        className={`${robotSize} shrink-0 bg-gradient-to-b from-sky-400 to-[#009bf3] p-2 rounded-2xl border-3 border-slate-900 shadow-[0_4px_0_#0f172a] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform relative group`}
        title="Toca para escuchar a Robot Gemma"
      >
        {/* Antenna */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-amber-400 rounded-full border border-slate-900 flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-300 animate-ping absolute" />
          <div className="w-2 h-2 rounded-full bg-amber-300 border border-slate-900" />
        </div>

        {/* Robot Face SVG */}
        <svg viewBox="0 0 64 64" className="w-full h-full drop-shadow-sm">
          {/* Head Body */}
          <rect x="8" y="12" width="48" height="40" rx="14" fill="#ffffff" stroke="#0f172a" strokeWidth="4" />
          {/* Visor Area */}
          <rect x="16" y="20" width="32" height="18" rx="8" fill="#1e293b" />
          {/* Glowing Happy Eyes */}
          <circle cx="25" cy="29" r="4" fill="#2ec4b6" />
          <circle cx="27" cy="27" r="1.5" fill="#ffffff" />
          <circle cx="39" cy="29" r="4" fill="#2ec4b6" />
          <circle cx="41" cy="27" r="1.5" fill="#ffffff" />
          {/* Cheeks */}
          <circle cx="18" cy="33" r="2.5" fill="#f472b6" opacity="0.8" />
          <circle cx="46" cy="33" r="2.5" fill="#f472b6" opacity="0.8" />
          {/* Cheerful Smile */}
          <path d="M 26 44 Q 32 50 38 44" fill="none" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Speech Bubble */}
      {message && (
        <div
          onClick={handleSpeak}
          className="relative bg-white border-3 border-slate-900 rounded-2xl px-3.5 py-2 shadow-[0_4px_0_#0f172a] cursor-pointer hover:bg-amber-50 transition-colors flex items-center gap-2 max-w-xs md:max-w-md"
        >
          {/* Arrow pointing left to robot */}
          <div className="absolute -left-3 top-1/2 -translate-y-1/2 border-y-8 border-y-transparent border-r-8 border-r-slate-900" />
          <div className="absolute -left-[9px] top-1/2 -translate-y-1/2 border-y-[7px] border-y-transparent border-r-[7px] border-r-white" />

          <p className={`font-bold font-fredoka text-slate-900 tracking-tight leading-snug ${textSize}`}>
            {message}
          </p>

          {showSpeaker && (
            <div className="w-7 h-7 rounded-full bg-[#2ec4b6] text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-900">
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
