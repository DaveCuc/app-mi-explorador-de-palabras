'use client';

import React from 'react';
import { Volume2 } from 'lucide-react';
import { speakWord } from '@/lib/phonics';

export default function VisualGuideSteps() {
  const speakStep = (text: string) => {
    speakWord(text);
  };

  return (
    <div className="bg-white rounded-3xl p-4 border-3 border-slate-900 shadow-[0_6px_0_#0f172a] my-4 space-y-3">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b-2 border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xl">⭐</span>
          <h3 className="font-bold text-base md:text-lg text-slate-900 uppercase tracking-tight">
            ¿CÓMO JUGAR? (3 PASOS FÁCILES)
          </h3>
        </div>
        <button
          onClick={() => speakWord("¿Cómo jugar? Paso 1: Busca un objeto. Paso 2: Pulsa el botón verde. Paso 3: Escucha y aprende.")}
          className="w-8 h-8 rounded-full bg-[#009bf3] text-white flex items-center justify-center border-2 border-slate-900 shadow-sm"
          title="Escuchar guía completa"
        >
          <Volume2 className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* 3 Step Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Step 1: Blue Card */}
        <div
          onClick={() => speakStep("Paso 1: ¡Busca un objeto y apunta con tu tablet!")}
          className="bg-sky-50 border-3 border-[#009bf3] rounded-2xl p-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-full bg-[#009bf3] text-white font-bold text-sm flex items-center justify-center border border-slate-900">
              1
            </span>
            <button className="w-7 h-7 rounded-full bg-white text-[#009bf3] flex items-center justify-center border border-slate-900 shadow-xs">
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl mx-auto mb-1">📱 🍎</div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tight">
              ¡BUSCA UN OBJETO!
            </h4>
            <p className="text-xs text-slate-600 font-quicksand font-bold">
              Apunta la tablet a un objeto real
            </p>
          </div>
        </div>

        {/* Step 2: Green Card */}
        <div
          onClick={() => speakStep("Paso 2: ¡PULSA el botón verde para tomar la foto!")}
          className="bg-emerald-50 border-3 border-[#2ec4b6] rounded-2xl p-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-full bg-[#2ec4b6] text-white font-bold text-sm flex items-center justify-center border border-slate-900">
              2
            </span>
            <button className="w-7 h-7 rounded-full bg-white text-[#2ec4b6] flex items-center justify-center border border-slate-900 shadow-xs">
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl mx-auto mb-1">📸 👆</div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tight">
              ¡PULSA!
            </h4>
            <p className="text-xs text-slate-600 font-quicksand font-bold">
              Toca el botón circular para capturar
            </p>
          </div>
        </div>

        {/* Step 3: Yellow Card */}
        <div
          onClick={() => speakStep("Paso 3: ¡ESCUCHA Y APRENDE! Gemma te dirá el nombre y las letras.")}
          className="bg-amber-50 border-3 border-[#ffd23f] rounded-2xl p-3 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer relative overflow-hidden flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="w-7 h-7 rounded-full bg-[#ffd23f] text-slate-900 font-bold text-sm flex items-center justify-center border border-slate-900">
              3
            </span>
            <button className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center border border-slate-900 shadow-xs">
              <Volume2 className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          <div className="text-center py-2 space-y-1">
            <div className="text-4xl mx-auto mb-1">🔊 🔤</div>
            <h4 className="font-bold text-slate-900 text-sm md:text-base uppercase tracking-tight">
              ¡ESCUCHA Y APRENDE!
            </h4>
            <p className="text-xs text-slate-600 font-quicksand font-bold">
              Escucha la palabra y toca sus letras
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
