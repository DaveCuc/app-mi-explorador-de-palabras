'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Sparkles, Image as ImageIcon, Volume2 } from 'lucide-react';
import RobotGemma from '@/components/RobotGemma';
import { speakWord } from '@/lib/phonics';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  isAnalyzing: boolean;
}

export default function CameraView({ onCapture, isAnalyzing }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const videoElem = videoRef.current;

    const requestCamera = async () => {
      try {
        setPermissionError(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'environment',
          },
          audio: false,
        });

        if (videoElem && isMounted) {
          videoElem.srcObject = stream;
          setStreamActive(true);
        }
      } catch (err) {
        console.warn('Permiso de cámara:', err);
        if (isMounted) {
          setStreamActive(false);
          setPermissionError('Presiona el botón de galería o concede permiso a la cámara.');
        }
      }
    };

    requestCamera();

    return () => {
      isMounted = false;
      if (videoElem && videoElem.srcObject) {
        const stream = videoElem.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleTakeSnapshot = () => {
    if (videoRef.current && streamActive) {
      const canvas = document.createElement('canvas');
      const maxDim = 640;
      let w = videoRef.current.videoWidth || 640;
      let h = videoRef.current.videoHeight || 480;

      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, w, h);
        const base64 = canvas.toDataURL('image/jpeg', 0.7);
        onCapture(base64);
      }
    } else {
      // Open gallery fallback
      handleOpenGallery();
    }
  };

  const handleOpenGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleGalleryFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new Image();
    const reader = new FileReader();
    reader.onload = (event) => {
      const src = event.target?.result as string;
      if (!src) return;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 640;
        let w = img.width;
        let h = img.height;

        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }

        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          const base64 = canvas.toDataURL('image/jpeg', 0.7);
          onCapture(base64);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative w-full space-y-3">
      {/* Hidden Gallery Input */}
      <input
        type="file"
        accept="image/*"
        ref={galleryInputRef}
        onChange={handleGalleryFileChange}
        className="hidden"
      />

      {/* Mascot Speech Bubble Prompt */}
      <div className="flex justify-center">
        <RobotGemma message="¡Apunta tu tablet a un objeto real!" size="md" />
      </div>

      {/* Main Viewfinder Box */}
      <div className="relative w-full bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-900">
        {/* Banner Top Overlay */}
        <div className="absolute top-0 inset-x-0 z-10 py-2.5 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-center gap-2">
          <span className="font-playful text-[#ffd23f] text-2xl md:text-3xl font-bold tracking-wide drop-shadow-md">
            ¡Busca un objeto! 🍎 🪑
          </span>
          <button
            onClick={() => speakWord("¡Busca un objeto!")}
            className="w-7 h-7 rounded-full bg-white text-slate-900 flex items-center justify-center border border-slate-900 shadow-sm"
          >
            <Volume2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Video Frame */}
        <div
          onClick={handleTakeSnapshot}
          className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-black overflow-hidden flex items-center justify-center cursor-pointer group"
        >
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
          />

          {!streamActive && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-2">
              <div className="w-16 h-16 rounded-full bg-[#009bf3] flex items-center justify-center border-2 border-white shadow-md">
                <Camera className="w-8 h-8 text-white stroke-[2.5]" />
              </div>
              <p className="font-bold text-lg text-amber-300">
                {permissionError ? 'Acceso a Cámara' : '¡Cámara Lista!'}
              </p>
              <p className="text-xs text-slate-300 max-w-xs font-quicksand font-bold">
                {permissionError || 'Toca abajo el botón verde para capturar o subir de tu galería'}
              </p>
            </div>
          )}

          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center text-white z-20 space-y-3">
              <Sparkles className="w-16 h-16 text-[#ffd23f] animate-spin" />
              <h3 className="text-2xl md:text-3xl font-bold font-fredoka text-amber-300">
                ¡Gemma pensando! 🤔
              </h3>
              <p className="text-sm text-slate-200 font-bold uppercase tracking-wider">
                Descubriendo la palabra...
              </p>
            </div>
          )}
        </div>

        {/* Bottom Shutter Action Button "¡PULSA!" */}
        <div className="p-3 bg-slate-900 border-t-2 border-slate-800 flex items-center justify-center gap-3">
          <button
            onClick={handleTakeSnapshot}
            disabled={isAnalyzing}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#2ec4b6] hover:bg-[#25a89c] text-white font-fredoka font-black text-xl md:text-2xl border-3 border-slate-900 shadow-[0_5px_0_#0f172a] active:translate-y-1 active:shadow-none transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Camera className="w-7 h-7 stroke-[2.5]" />
            <span>¡PULSA! 📸</span>
            <span className="text-2xl animate-bounce">👆</span>
          </button>
        </div>
      </div>

      {/* Gallery Button */}
      <div className="flex items-center justify-center">
        <button
          onClick={handleOpenGallery}
          disabled={isAnalyzing}
          className="w-full max-w-md py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 border-2 border-slate-900 text-slate-900 font-bold text-sm shadow-[0_3px_0_#0f172a] active:translate-y-0.5 active:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ImageIcon className="w-5 h-5 stroke-[2.5]" />
          <span>🖼️ Elegir foto de Galería</span>
        </button>
      </div>
    </div>
  );
}
