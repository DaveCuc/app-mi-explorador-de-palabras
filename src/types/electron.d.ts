export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
  details?: {
    format: string;
    family: string;
    parameter_size: string;
    quantization_level: string;
  };
}

export interface ElectronAPI {
  checkOllamaStatus: () => Promise<{ online: boolean; version: string | null }>;
  listModels: () => Promise<OllamaModel[]>;
  chatStream: (params: {
    model: string;
    messages: Array<{ role: string; content: string }>;
  }) => Promise<{ success: boolean }>;
  onStreamChunk: (callback: (data: { text: string; done: boolean }) => void) => () => void;
  onStreamDone: (callback: (data: { done: boolean }) => void) => () => void;
  onStreamError: (callback: (data: { error: string }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
