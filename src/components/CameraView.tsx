'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, Sparkles } from 'lucide-react';

interface CameraViewProps {
  onCapture: (base64Image: string) => void;
  isAnalyzing: boolean;
}

export default function CameraView({ onCapture, isAnalyzing }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [streamActive, setStreamActive] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const videoElem = videoRef.current;

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'environment' },
          audio: false,
        });
        if (videoElem && isMounted) {
          videoElem.srcObject = stream;
          setStreamActive(true);
        }
      } catch {
        if (isMounted) {
          setStreamActive(false);
        }
      }
    };

    startCamera();

    return () => {
      isMounted = false;
      if (videoElem && videoElem.srcObject) {
        const stream = videoElem.srcObject as MediaStream;
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleOpenCameraOrSnapshot = () => {
    if (streamActive && videoRef.current) {
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
        return;
      }
    }

    // Trigger Native HTML5 Camera Capture
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleMobileFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div className="relative w-full">
      {/* Hidden Native Mobile Rear Camera Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleMobileFileCapture}
        className="hidden"
      />

      {/* Main Camera Outer Box */}
      <div className="relative w-full bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-inner border border-slate-800">
        {/* Banner "Primeras palabras" */}
        <div className="absolute top-0 inset-x-0 z-10 py-3 bg-gradient-to-b from-black/80 via-black/40 to-transparent text-center">
          <span className="font-playful text-white text-2xl md:text-3xl font-bold tracking-wide drop-shadow-md">
            Primeras palabras
          </span>
        </div>

        {/* Video / Dark Placeholder Area */}
        <div className="relative aspect-[4/3] md:aspect-[16/10] w-full bg-black overflow-hidden flex items-center justify-center">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full object-cover ${streamActive ? 'block' : 'hidden'}`}
          />

          {!streamActive && (
            <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 flex items-center justify-center mb-2">
                <Camera className="w-8 h-8 text-slate-400" />
              </div>
            </div>
          )}

          {/* Analyzing Overlay */}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
              <Sparkles className="w-12 h-12 text-[#ffd23f] animate-spin mb-3" />
              <h3 className="text-xl md:text-2xl font-bold font-fredoka mb-1">Gemma 4 analizando foto...</h3>
              <p className="text-xs md:text-sm text-slate-300">Descubriendo la palabra en tiempo real</p>
            </div>
          )}
        </div>

        {/* Centered Circular White Camera Button Overlapping at the bottom */}
        <div className="absolute bottom-3 inset-x-0 flex justify-center z-10">
          <button
            onClick={handleOpenCameraOrSnapshot}
            disabled={isAnalyzing}
            aria-label="Tomar foto"
            className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white hover:bg-slate-100 border-2 border-slate-300 shadow-lg active:scale-95 transition-all flex items-center justify-center text-slate-900 disabled:opacity-50"
          >
            <Camera className="w-8 h-8 md:w-10 md:h-10 text-slate-800 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>
  );
}

