'use client';

import React, { useState } from 'react';
import {
  Compass,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  Gamepad2,
  Play,
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

  // Initial state: NULL (No pre-defined fake words)
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
        throw new Error('Gemma 4 no devolvió una palabra válida.');
      }

      setWordData(data);
      setPoints((prev) => prev + 10);
      setCelebrationMsg(`¡Gemma 4 descubrió la palabra ${data.palabra_completa}! 🎉`);
      if (audioUnlocked) speakWord(`¡Encontramos ${data.palabra_completa}!`);
    } catch (err) {
      console.error('Error enviando imagen a Gemma 4:', err);
      setErrorMessage(
        `Error al comunicar con Gemma 4: ${(err as Error).message}`
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
        setCelebrationMsg(`🎉 ¡Correcto! Encontraste la letra ${letter}! (+15 pts)`);
        if (audioUnlocked) speakWord(`¡Muy bien! Encontraste la letra ${letter}`);
        setGameChallengeLetter(null);
      } else {
        setCelebrationMsg(`Casi... esa es la letra ${letter}. ¡Busca la letra ${gameChallengeLetter}!`);
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
    const randomLetter = wordData.letras[Math.floor(Math.random() * wordData.letras.length)];
    setGameChallengeLetter(randomLetter);
    setCelebrationMsg(`🎮 Desafío: ¿Puedes tocar la letra "${randomLetter}"?`);
    if (audioUnlocked) speakWord(`Encuentra y toca la letra ${randomLetter}`);
  };

  return (
    <div className="min-h-screen bg-dot-grid text-slate-800 font-fredoka pb-24 select-none">
      {/* Sky Blue Header */}
      <header className="sticky top-0 z-30 bg-[#009bf3] text-white px-3 md:px-6 py-2.5 shadow-md flex items-center justify-between">
        {/* Left Header: Compass Icon & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#ffd23f] border-2 border-white text-slate-900 flex items-center justify-center shadow-sm shrink-0">
            <Compass className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div className="leading-tight">
            <h1 className="font-fredoka font-bold text-lg md:text-xl text-white tracking-tight flex flex-col md:flex-row md:gap-1">
              <span>Mi Explorador</span>
              <span className="text-sm md:text-xl">de Palabras</span>
            </h1>
          </div>
        </div>

        {/* Right Header: Points Badge & Sound Toggle Badge */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Trophy Badge */}
          <div className="bg-[#ffd23f] text-slate-900 px-3 md:px-4 py-1 rounded-2xl flex items-center gap-1.5 shadow-sm border border-amber-300">
            <Trophy className="w-5 h-5 text-slate-900 fill-amber-500 stroke-[2]" />
            <div className="flex flex-col items-start leading-none">
              <span className="font-bold text-base md:text-lg leading-none">{points}</span>
              <span className="text-[10px] md:text-xs font-semibold leading-none text-slate-800">Puntos</span>
            </div>
          </div>

          {/* Sound Toggle Badge */}
          <button
            onClick={toggleAudioEngine}
            className="bg-[#1d3557] text-white px-2.5 md:px-3 py-1 rounded-2xl flex items-center gap-2 shadow-sm border border-slate-700 hover:bg-[#162942] transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-[#2ec4b6] flex items-center justify-center text-white shrink-0">
              {audioUnlocked ? <Volume2 className="w-3.5 h-3.5 stroke-[2.5]" /> : <VolumeX className="w-3.5 h-3.5 stroke-[2.5]" />}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold hidden sm:inline">Sonido:</span>
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${audioUnlocked ? 'bg-[#2ec4b6]' : 'bg-slate-500'}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${audioUnlocked ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="text-xs font-bold">{audioUnlocked ? 'Sí' : 'No'}</span>
            </div>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl mx-auto px-3 md:px-4 pt-4 md:pt-6 space-y-4">
        {/* Main Card Container */}
        <div className="bg-white rounded-[28px] md:rounded-[36px] shadow-xl p-4 md:p-6 border border-slate-100 space-y-6">
          {/* Camera View Section */}
          <section>
            <CameraView onCapture={handleCaptureImage} isAnalyzing={isAnalyzing} />
          </section>

          {/* Error Message Display */}
          {errorMessage && (
            <div className="bg-rose-50 text-rose-800 border-2 border-rose-200 rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
              <p className="font-medium text-sm md:text-base">{errorMessage}</p>
            </div>
          )}

          {/* Celebration / Toast Banner */}
          {celebrationMsg && (
            <div className="bg-emerald-500 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 animate-rebote">
              <div className="flex items-center gap-2.5">
                <Award className="w-7 h-7 text-amber-300 shrink-0" />
                <p className="font-bold text-sm md:text-base">{celebrationMsg}</p>
              </div>
              <button
                onClick={() => setCelebrationMsg(null)}
                className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 font-semibold shrink-0"
              >
                OK
              </button>
            </div>
          )}

          {/* SECTION: Initial State (Waiting for Photo) OR Discovered Word Details */}
          {!wordData ? (
            /* Waiting for Photo View */
            <section className="text-center py-4 space-y-3">
              {/* Yellow Circular Question Mark Button */}
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full bg-[#ffd23f] text-slate-900 font-bold text-2xl md:text-3xl flex items-center justify-center mx-auto shadow-md border-2 border-amber-300">
                ?
              </div>

              {/* Header Text */}
              <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                ¡Esperando tu foto!
              </h2>

              {/* Description Body */}
              <p className="text-sm md:text-base text-slate-600 max-w-sm mx-auto font-quicksand leading-snug">
                Toma una foto de algo real en casa. Gemma (nuestro súper cerebro local) te dirá su nombre y cómo se escribe.
              </p>
            </section>
          ) : (
            /* Discovered Word View */
            <section className="space-y-6 pt-2">
              {/* Object Header */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#009bf3] flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Objeto detectado por Gemma 4
                    </span>
                    <h2 className="font-bold text-xl md:text-2xl text-slate-900 capitalize leading-tight">
                      {wordData.objeto_detectado}
                    </h2>
                  </div>
                </div>

                <button
                  onClick={handleFullWordTap}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#009bf3] hover:bg-[#0086d4] text-white font-bold text-xs md:text-sm shadow-sm transition-colors"
                >
                  <Volume2 className="w-4 h-4" /> Escuchar
                </button>
              </div>

              {/* Giant Touchable Letters */}
              <div className="text-center space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-sky-50 py-1 px-3 rounded-full inline-block">
                  👇 Toca cada letra para escuchar su sonido
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 md:gap-4 py-2">
                  {wordData.letras.map((letter, idx) => {
                    const isChallenge =
                      gameChallengeLetter &&
                      letter.toUpperCase() === gameChallengeLetter.toUpperCase();

                    return (
                      <button
                        key={`${letter}-${idx}`}
                        onClick={() => handleLetterTap(letter, idx)}
                        className={`giant-letter w-16 h-20 md:w-20 md:h-24 flex items-center justify-center font-bold text-3xl md:text-5xl cursor-pointer ${
                          activeLetterIdx === idx ? 'active animate-rebote' : ''
                        } ${isChallenge ? 'ring-4 ring-amber-400 animate-pulse' : ''}`}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Syllables & Actions */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <span className="text-xs font-bold text-slate-500 uppercase shrink-0 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-[#009bf3]" /> Sílabas:
                  </span>
                  {wordData.silabas.map((syllable, idx) => (
                    <button
                      key={`${syllable}-${idx}`}
                      onClick={() => handleSyllableTap(syllable, idx)}
                      className={`px-3.5 py-1.5 rounded-xl border-2 font-bold text-base md:text-lg transition-all ${
                        activeSyllableIdx === idx
                          ? 'bg-[#ffd23f] border-amber-400 text-slate-900'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-sky-50'
                      }`}
                    >
                      {syllable}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={handleSpellWordSlowly}
                    className="flex-1 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-slate-900" /> Deletrear despacio
                  </button>

                  <button
                    onClick={startLetterFindGame}
                    className="flex-1 py-2.5 rounded-2xl bg-[#2ec4b6] hover:bg-[#25a89c] text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" /> Desafío de Letra
                  </button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 px-2 py-1.5 flex items-center justify-around z-30 shadow-lg">
        {/* Tab 1: Explora (Blue) */}
        <button
          onClick={() => setActiveTab('explora')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'explora' ? 'text-[#009bf3] font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Search className={`w-6 h-6 stroke-[2.2] ${activeTab === 'explora' ? 'text-[#009bf3]' : 'text-[#009bf3]/70'}`} />
          <span className="text-[11px] mt-0.5">Explora</span>
        </button>

        {/* Tab 2: Palabras (Yellow) */}
        <button
          onClick={() => setActiveTab('palabras')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'palabras' ? 'text-amber-500 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BookOpen className={`w-6 h-6 stroke-[2.2] ${activeTab === 'palabras' ? 'text-amber-500' : 'text-amber-500/70'}`} />
          <span className="text-[11px] mt-0.5">Palabras</span>
        </button>

        {/* Tab 3: Desafíos (Green) */}
        <button
          onClick={() => setActiveTab('desafios')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'desafios' ? 'text-[#2ec4b6] font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Star className={`w-6 h-6 stroke-[2.2] ${activeTab === 'desafios' ? 'text-[#2ec4b6]' : 'text-[#2ec4b6]/70'}`} />
          <span className="text-[11px] mt-0.5">Desafíos</span>
        </button>

        {/* Tab 4: Progreso (Purple) */}
        <button
          onClick={() => setActiveTab('progreso')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'progreso' ? 'text-[#8b5cf6] font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart3 className={`w-6 h-6 stroke-[2.2] ${activeTab === 'progreso' ? 'text-[#8b5cf6]' : 'text-[#8b5cf6]/70'}`} />
          <span className="text-[11px] mt-0.5">Progreso</span>
        </button>

        {/* Tab 5: Perfil (Pink) */}
        <button
          onClick={() => setActiveTab('perfil')}
          className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all ${
            activeTab === 'perfil' ? 'text-[#ec4899] font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <User className={`w-6 h-6 stroke-[2.2] ${activeTab === 'perfil' ? 'text-[#ec4899]' : 'text-[#ec4899]/70'}`} />
          <span className="text-[11px] mt-0.5">Perfil</span>
        </button>
      </nav>
    </div>
  );
}
