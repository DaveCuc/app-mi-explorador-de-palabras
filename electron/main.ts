import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as http from 'http';

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#0f172a',
      symbolColor: '#94a3b8',
      height: 38,
    },
    backgroundColor: '#090d16',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  const isDev = process.env.NODE_ENV !== 'production';
  const startUrl = isDev
    ? 'http://localhost:3000'
    : `file://${path.join(__dirname, '../out/index.html')}`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    // Open DevTools in detached window mode if needed
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers for Ollama Integration
ipcMain.handle('ollama:check-status', async () => {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:11434/api/version', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ online: true, version: parsed.version });
        } catch {
          resolve({ online: true, version: '0.32.5' });
        }
      });
    });

    req.on('error', () => {
      resolve({ online: false, version: null });
    });

    req.setTimeout(2000, () => {
      req.destroy();
      resolve({ online: false, version: null });
    });
  });
});

ipcMain.handle('ollama:list-models', async () => {
  return new Promise((resolve) => {
    const req = http.get('http://127.0.0.1:11434/api/tags', (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.models || []);
        } catch {
          resolve([]);
        }
      });
    });

    req.on('error', () => {
      resolve([]);
    });

    req.setTimeout(3000, () => {
      req.destroy();
      resolve([]);
    });
  });
});

// Streaming handler for Ollama Chat
ipcMain.handle('ollama:chat-stream', async (event, { model, messages }) => {
  const window = BrowserWindow.fromWebContents(event.sender);
  if (!window) return;

  const payload = JSON.stringify({
    model: model || 'gemma',
    messages: messages,
    stream: true,
  });

  const options: http.RequestOptions = {
    hostname: '127.0.0.1',
    port: 11434,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      res.setEncoding('utf8');

      res.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.message && parsed.message.content) {
              window.webContents.send('ollama:stream-chunk', {
                text: parsed.message.content,
                done: parsed.done || false,
              });
            }
            if (parsed.done) {
              window.webContents.send('ollama:stream-done', { done: true });
            }
          } catch {
            // Partial JSON chunk line
          }
        }
      });

      res.on('end', () => {
        window.webContents.send('ollama:stream-done', { done: true });
        resolve({ success: true });
      });
    });

    req.on('error', (err) => {
      window.webContents.send('ollama:stream-error', { error: err.message });
      reject(err);
    });

    req.write(payload);
    req.end();
  });
});
