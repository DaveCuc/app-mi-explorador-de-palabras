import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  checkOllamaStatus: () => ipcRenderer.invoke('ollama:check-status'),
  listModels: () => ipcRenderer.invoke('ollama:list-models'),
  chatStream: (params: { model: string; messages: Array<{ role: string; content: string }> }) =>
    ipcRenderer.invoke('ollama:chat-stream', params),
  onStreamChunk: (callback: (data: { text: string; done: boolean }) => void) => {
    const handler = (_event: unknown, data: { text: string; done: boolean }) => callback(data);
    ipcRenderer.on('ollama:stream-chunk', handler);
    return () => ipcRenderer.removeListener('ollama:stream-chunk', handler);
  },
  onStreamDone: (callback: (data: { done: boolean }) => void) => {
    const handler = (_event: unknown, data: { done: boolean }) => callback(data);
    ipcRenderer.on('ollama:stream-done', handler);
    return () => ipcRenderer.removeListener('ollama:stream-done', handler);
  },
  onStreamError: (callback: (data: { error: string }) => void) => {
    const handler = (_event: unknown, data: { error: string }) => callback(data);
    ipcRenderer.on('ollama:stream-error', handler);
    return () => ipcRenderer.removeListener('ollama:stream-error', handler);
  },
});
