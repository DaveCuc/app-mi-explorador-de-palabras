// Web Audio & Speech Synthesis Engine for El Explorador de Palabras

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioCtx) audioCtx = new AudioCtx();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Unlock audio on first touch/click
if (typeof window !== 'undefined') {
  const unlock = () => {
    getAudioContext();
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('click', unlock);
  window.addEventListener('touchstart', unlock);
}

export function speakWord(text: string, rate: number = 0.85) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
  utterance.lang = 'es-MX';
  utterance.rate = rate;
  utterance.pitch = 1.05;

  const voices = window.speechSynthesis.getVoices();
  const esVoice = voices.find(
    (v) => v.lang.includes('es-MX') || v.lang.includes('es-ES') || v.lang.includes('es')
  );
  if (esVoice) utterance.voice = esVoice;

  window.speechSynthesis.speak(utterance);
}

// Play pleasant game synth tone for letter taps
export function playPhonemeSynth(letter: string) {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Map letter to pitch frequency for playful musical feedback
    const charCode = letter.toUpperCase().charCodeAt(0);
    const baseFreq = 300 + (charCode % 20) * 25; // 300Hz - 800Hz

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (err) {
    console.warn('Audio synth error:', err);
  }
}

export function speakPhoneme(letter: string) {
  const char = letter.toUpperCase();
  playPhonemeSynth(char);

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    // Nombres oficiales y claros de las letras del abecedario en español
    const phonemeSounds: Record<string, string> = {
      A: 'a',
      B: 'be',
      C: 'ce',
      D: 'de',
      E: 'e',
      F: 'efe',
      G: 'ge',
      H: 'hache',
      I: 'i',
      J: 'jota',
      K: 'ka',
      L: 'ele',
      M: 'eme',
      N: 'ene',
      Ñ: 'eñe',
      O: 'o',
      P: 'pe',
      Q: 'cu',
      R: 'ere',
      S: 'ese',
      T: 'te',
      U: 'u',
      V: 've',
      W: 'doble ve',
      X: 'equis',
      Y: 'ye',
      Z: 'zeta',
    };

    const speechText = phonemeSounds[char] || char;
    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'es-MX';
    utterance.rate = 1.0;
    utterance.pitch = 1.1;

    const voices = window.speechSynthesis.getVoices();
    const esVoice = voices.find(
      (v) => v.lang.includes('es-MX') || v.lang.includes('es-ES') || v.lang.includes('es')
    );
    if (esVoice) utterance.voice = esVoice;

    window.speechSynthesis.speak(utterance);
  }
}
