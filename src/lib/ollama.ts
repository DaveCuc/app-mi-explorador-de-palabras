export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  model?: string;
  isStreaming?: boolean;
}

export interface OllamaStatus {
  online: boolean;
  version: string | null;
  models: string[];
}

// Fetch client for local Ollama server status
export async function fetchOllamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch('http://localhost:11434/api/tags');
    if (!res.ok) throw new Error('Ollama offline');
    const data = await res.json();
    return {
      online: true,
      version: '0.32.6',
      models: data.models?.map((m: { name: string }) => m.name) || [],
    };
  } catch {
    return {
      online: false,
      version: null,
      models: [],
    };
  }
}

// Simulates Gemma 4 response when model is downloading or testing UI
export async function streamMockGemma4Response(
  userPrompt: string,
  onChunk: (text: string) => void,
  onDone: () => void
) {
  const responses = [
    `¡Hola! Estoy listo para asistirte en tu entorno de desarrollo con **Gemma 4**.\n\nActualmente, estás utilizando el **Modo de Prueba de Arquitectura Gemma 4**, diseñado para verificar que Electron, Next.js y la tubería IPC de streaming funcionen de manera óptima.\n\nHere is a code preview:\n\`\`\`typescript\n// Electron IPC Bridge for Gemma 4\nexport async function queryGemma4(prompt: string) {\n  const response = await fetch('http://localhost:11434/api/generate', {\n    method: 'POST',\n    body: JSON.stringify({ model: 'gemma4:e2b', prompt })\n  });\n  return response.body;\n}\n\`\`\`\n\nEn cuanto finalice la descarga del modelo \`gemma 4 e2b\` en Ollama, la aplicación se conectará automáticamente al motor local real sin necesidad de reiniciar.`,
  ];

  const fullText = responses[0];
  const words = fullText.split(' ');

  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    onChunk(chunk);
    await new Promise((resolve) => setTimeout(resolve, 30));
  }

  onDone();
}
