# 📖 Guía (How-To): Ejecutar y Compilar en Modo Escritorio (Electron)

**Problema:** Deseas ejecutar la aplicación como una ventana de escritorio nativa multiplataforma utilizando Electron.

---

## 🛠️ Pasos de Ejecución

### Modo Desarrollo Híbrido (Next.js + Electron)
Asegúrate de que los puertos de Ollama (`11434`) y Python (`8000`) estén corriendo. Luego ejecuta:

```bash
npm run dev
```

Este comando ejecuta `concurrently`:
1. Inicia Next.js en `http://localhost:3000`.
2. Compila el proceso principal de Electron (`electron/main.ts` -> `dist-electron/main.js`).
3. Inicia la ventana nativa de escritorio conectada a Next.js.

---

## 🏗️ Verificación y Compilación para Producción

1. **Compilar procesos TypeScript de Electron**:
   ```bash
   npm run build:electron
   ```

2. **Build Completo de Producción**:
   ```bash
   npm run build
   ```
