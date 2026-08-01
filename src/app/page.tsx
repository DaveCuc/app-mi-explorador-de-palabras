'use client';

import React, { useState } from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Trophy,
  Gamepad2,
  Layers,
  Award,
  AlertCircle,
  Search,
  BookOpen,
  Star,
  BarChart3,
  User,
} from 'lucide-react';
import CameraView from '@/components/CameraView';
import RobotGemma from '@/components/RobotGemma';
import VisualGuideSteps from '@/components/VisualGuideSteps';
import { speakWord, speakPhoneme, playPhonemeSynth } from '@/lib/phonics';

interface WordData {
  objeto_detectado: string;
  palabra_completa: string;
  silabas: string[];
  letras: string[];
}

export default function WordExplorerApp() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [points, setPoints] = useState(0);
  const [activeLetterIdx, setActiveLetterIdx] = useState<number | null>(null);
  const [activeSyllableIdx, setActiveSyllableIdx] = useState<number | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(true);
  const [gameChallengeLetter, setGameChallengeLetter] = useState<string | null>(null);
  const [celebrationMsg, setCelebrationMsg] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'explora' | 'palabras' | 'desafios' | 'progreso' | 'perfil'>('explora');

  const [wordData, setWordData] = useState<WordData | null>(null);

  const toggleAudioEngine = () => {
    if (!audioUnlocked) {
      playPhonemeSynth('A');
      speakWord('Sonido activado');
      setAudioUnlocked(true);
    } else {
      setAudioUnlocked(false);
    }
  };

  const handleCaptureImage = async (base64Image: string) => {
    if (!base64Image || base64Image.trim().length === 0) {
      setErrorMessage("Por favor toma una foto primero.");
      return;
    }

    setIsAnalyzing(true);
    setCelebrationMsg(null);
    setGameChallengeLetter(null);
    setErrorMessage(null);

    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : '127.0.0.1';
      const apiUrl = `http://${host}:8000/api/descubrir-palabra`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imagen_b64: base64Image }),
      });

      if (!response.ok) {
        let errDetail = `Error en servidor backend (${response.status})`;
        try {
          const errData = await response.json();
          if (errData.detail) errDetail = errData.detail;
        } catch {
          // ignore json parse error
        }
        throw new Error(errDetail);
      }

      const data: WordData = await response.json();

      if (!data || !data.palabra_completa) {
        throw new Error('Gemma no devolvió una palabra válida.');
      }

      setWordData(data);
      setPoints((prev) => prev + 10);
      setCelebrationMsg(`¡SÚPER, LO LOGRASTE! 🎉`);
      if (audioUnlocked) speakWord(`¡Súper, lo lograste! Encontramos la palabra ${data.palabra_completa}`);
    } catch (err) {
      console.error('Error enviando imagen a Gemma:', err);
      setErrorMessage(
        `Error al comunicar con Gemma: ${(err as Error).message}`
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLetterTap = (letter: string, idx: number) => {
    setActiveLetterIdx(idx);
    if (audioUnlocked) speakPhoneme(letter);

    if (gameChallengeLetter) {
      if (letter.toUpperCase() === gameChallengeLetter.toUpperCase()) {
        setPoints((prev) => prev + 15);
        setCelebrationMsg(`🎉 ¡CORRECTO! LETRA ${letter.toUpperCase()} (+15 pts)`);
        if (audioUnlocked) speakWord(`¡Muy bien! Encontraste la letra ${letter}`);
        setGameChallengeLetter(null);
      } else {
        setCelebrationMsg(`Busca la letra ${gameChallengeLetter.toUpperCase()}`);
      }
    }

    setTimeout(() => setActiveLetterIdx(null), 600);
  };

  const handleSyllableTap = (syllable: string, idx: number) => {
    setActiveSyllableIdx(idx);
    if (audioUnlocked) speakWord(syllable, 0.75);
    setTimeout(() => setActiveSyllableIdx(null), 600);
  };

  const handleFullWordTap = () => {
    if (!wordData) return;
    if (audioUnlocked) speakWord(wordData.palabra_completa, 0.8);
  };

  const handleSpellWordSlowly = async () => {
    if (!wordData) return;
    if (audioUnlocked) speakWord(`Deletreando ${wordData.palabra_completa}`);
    for (let i = 0; i < wordData.letras.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setActiveLetterIdx(i);
      if (audioUnlocked) speakPhoneme(wordData.letras[i]);
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
    setActiveLetterIdx(null);
    if (audioUnlocked) speakWord(wordData.palabra_completa);
  };

  const startLetterFindGame = () => {
    if (!wordData || wordData.letras.length === 0) return;
    const randomLetter = wordData.letras[Math.floor(Math.random() * wordData.letras.length)].toUpperCase();
    setGameChallengeLetter(randomLetter);
    setCelebrationMsg(`🎮 ¿DÓNDE ESTÁ LA LETRA "${randomLetter}"?`);
    if (audioUnlocked) speakWord(`Encuentra y toca la letra ${randomLetter}`);
  };

  return (
    <div className="min-h-screen bg-dot-grid text-slate-800 font-fredoka pb-24 select-none">
      {/* Sky Blue Header */}
      <header className="sticky top-0 z-30 bg-[#009bf3] border-b-4 border-slate-900 text-white px-3 md:px-6 py-2 shadow-md flex items-center justify-between">
        {/* Left Header: Compass Icon & Title */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#ffd23f] border-2 border-slate-900 text-slate-900 flex items-center justify-center shadow-sm shrink-0">
            <Compass className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="leading-tight">
            <h1 className="font-fredoka font-black text-lg md:text-xl text-white tracking-tight">
              MI EXPLORADOR DE PALABRAS
            </h1>
          </div>
        </div>

        {/* Right Header: Points Badge & Sound Toggle Badge */}
        <div className="flex items-center gap-2">
          {/* Trophy Badge */}
          <div className="bg-[#ffd23f] text-slate-900 px-3 py-1 rounded-2xl flex items-center gap-1.5 shadow-sm border-2 border-slate-900">
            <Trophy className="w-5 h-5 text-slate-900 fill-amber-500 stroke-[2]" />
            <span className="font-black text-base md:text-lg leading-none">{points}</span>
          </div>

          {/* Sound Toggle Badge */}
          <button
            onClick={toggleAudioEngine}
            className="bg-[#1d3557] text-white px-2.5 py-1 rounded-2xl flex items-center gap-1.5 shadow-sm border-2 border-slate-900 hover:bg-[#162942] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#2ec4b6] flex items-center justify-center text-white shrink-0 border border-slate-900">
              {audioUnlocked ? <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <VolumeX className="w-3.5 h-3.5 stroke-[2.5]" />}
            </div>
            <span className="text-xs font-black">{audioUnlocked ? 'SÍ' : 'NO'}</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-3 md:px-4 pt-3 md:pt-4 space-y-4">
        {/* 3-Step Visual Guide Component */}
        <VisualGuideSteps />

        {/* Main Card Container */}
        <div className="bg-white rounded-3xl shadow-xl p-4 md:p-6 border-3 border-slate-900 space-y-5">
          {/* Camera View Section */}
          <section>
            <CameraView onCapture={handleCaptureImage} isAnalyzing={isAnalyzing} />
          </section>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-rose-50 text-rose-800 border-2 border-slate-900 rounded-2xl p-3 shadow-sm flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <p className="font-bold text-sm md:text-base">{errorMessage}</p>
            </div>
          )}

          {/* Celebration / Toast Banner */}
          {celebrationMsg && (
            <div className="bg-[#2ec4b6] text-white rounded-2xl p-3 border-2 border-slate-900 shadow-md flex items-center justify-between gap-2 animate-rebote">
              <div className="flex items-center gap-2">
                <Award className="w-7 h-7 text-[#ffd23f] shrink-0" />
                <p className="font-black text-sm md:text-base">{celebrationMsg}</p>
              </div>
              <button
                onClick={() => setCelebrationMsg(null)}
                className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-xl hover:bg-slate-800 font-bold"
              >
                OK
              </button>
            </div>
          )}

          {/* SECTION: Discovered Word View OR Initial State */}
          {!wordData ? (
            /* Waiting State */
            <section className="text-center py-3 space-y-3">
              <RobotGemma message="¡Toma una foto de algo en casa y pulsa el botón verde!" size="lg" />
            </section>
          ) : (
            /* LEARNING VIEW (Discovered Word) */
            <section className="space-y-5 pt-2">
              {/* Mascot Success Toast */}
              <RobotGemma message={`¡SÚPER, LO LOGRASTE! Es una ${wordData.objeto_detectado.toUpperCase()}`} size="lg" />

              {/* GIANT DISCOVERED WORD DISPLAY WITH SPEAKER */}
              <div
                onClick={handleFullWordTap}
                className="bg-amber-100 border-4 border-slate-900 rounded-3xl p-4 text-center cursor-pointer hover:bg-amber-200 transition-colors shadow-[0_6px_0_#0f172a] space-y-2 relative group"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 bg-white py-1 px-3 rounded-full border border-slate-900 inline-block">
                  PALABRA DESCUBIERTA 🌟
                </span>

                <div className="flex items-center justify-center gap-3">
                  <h2 className="font-black text-4xl md:text-6xl text-slate-900 uppercase tracking-wide">
                    {wordData.palabra_completa}
                  </h2>
                  <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#009bf3] text-white flex items-center justify-center border-3 border-slate-900 shadow-md group-hover:scale-110 transition-transform">
                    <Volume2 className="w-7 h-7 stroke-[2.5]" />
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-700">
                  🔊 Toca aquí para escuchar la palabra completa
                </p>
              </div>

              {/* Giant Touchable Letters for Phonemes */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 bg-sky-100 py-1 px-3 rounded-full border border-slate-900">
                    👇 TOCA CADA LETRA Y ESCUCHA
                  </span>
                  <button
                    onClick={() => speakWord("Toca cada letra para escuchar su sonido")}
                    className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center border border-slate-900"
                  >
                    <Volume2 className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 py-2">
                  {wordData.letras.map((letter, idx) => {
                    const isChallenge =
                      gameChallengeLetter &&
                      letter.toUpperCase() === gameChallengeLetter.toUpperCase();

                    return (
                      <button
                        key={`${letter}-${idx}`}
                        onClick={() => handleLetterTap(letter, idx)}
                        className={`giant-letter w-16 h-20 md:w-20 md:h-24 flex items-center justify-center font-black text-3xl md:text-5xl border-3 border-slate-900 shadow-[0_5px_0_#0f172a] ${
                          activeLetterIdx === idx ? 'active animate-rebote' : ''
                        } ${isChallenge ? 'ring-4 ring-amber-400 animate-pulse bg-amber-200' : ''}`}
                      >
                        {letter.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Syllables */}
              <div className="pt-2 border-t-2 border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-black text-slate-600 uppercase shrink-0 flex items-center gap-1">
                    <Layers className="w-4 h-4 text-[#009bf3]" /> SÍLABAS:
                  </span>
                  {wordData.silabas.map((syllable, idx) => (
                    <button
                      key={`${syllable}-${idx}`}
                      onClick={() => handleSyllableTap(syllable, idx)}
                      className={`px-4 py-2 rounded-2xl border-3 border-slate-900 font-black text-lg md:text-xl transition-all shadow-[0_3px_0_#0f172a] ${
                        activeSyllableIdx === idx
                          ? 'bg-[#ffd23f] text-slate-900'
                          : 'bg-slate-50 text-slate-900 hover:bg-sky-50'
                      }`}
                    >
                      {syllable.toUpperCase()}
                    </button>
                  ))}
                </div>

                {/* Big Action Button "¡ESCUCHA Y APRENDE!" */}
                <div className="flex flex-col md:flex-row items-center gap-2 pt-2">
                  <button
                    onClick={handleSpellWordSlowly}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#009bf3] hover:bg-[#0086d4] border-3 border-slate-900 text-white font-black text-lg md:text-xl shadow-[0_4px_0_#0f172a] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-6 h-6 stroke-[2.5]" />
                    <span>¡ESCUCHA Y APRENDE! 🔊</span>
                  </button>

                  <button
                    onClick={startLetterFindGame}
                    className="w-full py-3.5 px-4 rounded-2xl bg-[#ffd23f] hover:bg-[#eab308] border-3 border-slate-900 text-slate-900 font-black text-lg md:text-xl shadow-[0_4px_0_#0f172a] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-6 h-6 stroke-[2.5]" />
                    <span>¡JUGAR CON LETRAS! 🎮</span>
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t-3 border-slate-900 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
        {/* Tab 1: Explora (Blue) */}
        <button
          onClick={() => {
            setActiveTab('explora');
            speakWord("Explora");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'explora' ? 'text-[#009bf3] font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search className={`w-6 h-6 stroke-[2.5] ${activeTab === 'explora' ? 'text-[#009bf3]' : 'text-slate-400'}`} />
          <span className="text-[11px] mt-0.5 uppercase tracking-tight">Explora</span>
        </button>

        {/* Tab 2: Palabras (Yellow) */}
        <button
          onClick={() => {
            setActiveTab('palabras');
            speakWord("Palabras");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'palabras' ? 'text-amber-500 font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className={`w-6 h-6 stroke-[2.5] ${activeTab === 'palabras' ? 'text-amber-500' : 'text-slate-400'}`} />
          <span className="text-[11px] mt-0.5 uppercase tracking-tight">Palabras</span>
        </button>

        {/* Tab 3: Desafíos (Green) */}
        <button
          onClick={() => {
            setActiveTab('desafios');
            speakWord("Desafíos");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'desafios' ? 'text-[#2ec4b6] font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Star className={`w-6 h-6 stroke-[2.5] ${activeTab === 'desafios' ? 'text-[#2ec4b6]' : 'text-slate-400'}`} />
          <span className="text-[11px] mt-0.5 uppercase tracking-tight">Desafíos</span>
        </button>

        {/* Tab 4: Progreso (Purple) */}
        <button
          onClick={() => {
            setActiveTab('progreso');
            speakWord("Progreso");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'progreso' ? 'text-[#8b5cf6] font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 className={`w-6 h-6 stroke-[2.5] ${activeTab === 'progreso' ? 'text-[#8b5cf6]' : 'text-slate-400'}`} />
          <span className="text-[11px] mt-0.5 uppercase tracking-tight">Progreso</span>
        </button>

        {/* Tab 5: Perfil (Pink) */}
        <button
          onClick={() => {
            setActiveTab('perfil');
            speakWord("Perfil");
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'perfil' ? 'text-[#ec4899] font-black scale-105' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className={`w-6 h-6 stroke-[2.5] ${activeTab === 'perfil' ? 'text-[#ec4899]' : 'text-slate-400'}`} />
          <span className="text-[11px] mt-0.5 uppercase tracking-tight">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
