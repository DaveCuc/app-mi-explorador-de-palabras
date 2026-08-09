# Mi Explorador de Palabras 🎈

Aplicación educativa interactiva construida con **Next.js 16 (App Router)** y **React 19**, diseñada para ayudar a los niños a descubrir objetos del mundo real y aprender fonética, letras y sílabas mediante visión por computadora asistida por **Gemma 4**.

> [!NOTE]
> Esta aplicación combina captura multimedia en tiempo real, síntesis fonética por voz y juegos de desafío para fomentar el aprendizaje temprano de lectura y escritura.

---

## 🌟 Características Principales

- 📸 **Captura de Cámara en Tiempo Real**: Permite tomar fotografías con la cámara del dispositivo o subir imágenes de objetos cotidianos.
- 🧠 **Análisis de Objetos con Gemma 4**: Conexión con modelo local/backend para detectar objetos en imágenes y devolver la palabra, división silábica y desglose de letras.
- 🔊 **Síntesis Fonética y Deletreo**: Reproducción de sonidos individuales por letra (fonemas) y lectura pausada de palabras completas.
- 🎮 **Desafíos Interactivos y Gamificación**: Sistema de puntos, insignias y minijuegos de búsqueda de letras ("¿Puedes encontrar la letra A?").
- 💻 **Web Nativa**: Ejecución fluida en cualquier navegador web moderno.
- ⚙️ **CI/CD Integrado**: Validación automática de linting y compilación TypeScript en cada actualización con **GitHub Actions**.

---

## 🛠️ Tecnologías Utilizadas

- **Framework Web**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack) + [React 19](https://react.dev/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Lenguaje**: TypeScript
- **Integración CI/CD**: GitHub Actions

---

## 🏗️ Arquitectura del Sistema

```mermaid
flowchart TD
    subgraph Client ["💻 Capa de Cliente (Next.js 16 / React 19)"]
        UI["📸 CameraView Component"] -->|Imagen Base64| Frontend["React 19 / Next.js 16"]
        Frontend -->|Lectura de Fonemas y Sílabas| Speaker["🔊 Web Speech API (es-MX)"]
        Console["🧠 F12 Developer Console"] <==|MOSTRAR_PENSAMIENTO| Frontend
    end

    subgraph Backend ["⚡ Servidor Python FastAPI (:8000)"]
        API["/api/descubrir-palabra"] --> Preprocess["Sanitizador & Decodificador Base64"]
        Preprocess --> Strategy{"¿Proveedor Local o Cloud?"}
        
        Strategy -->|USE_OLLAMA_FALLBACK=true| OllamaEngine["Ollama GPU Engine (:11434)<br>gemma4:e2b"]
        Strategy -->|GEMINI_API_KEY activa| GeminiCloud["Google AI Studio API<br>gemma-4-31b-it"]
        
        OllamaEngine --> Extract["Extractor <think> + Parser JSON Regex"]
        GeminiCloud --> Extract
        
        Extract --> Response["Respuesta Pydantic (WordData)"]
    end

    Frontend -->|POST /api/descubrir-palabra| API
    Response -->|JSON (palabra, silabas, letras, pensamiento)| Frontend
```

---

## 📚 Documentación Estructurada (Diátaxis)

Toda la documentación detallada del proyecto está organizada bajo el marco **[Diátaxis](file:///C:/Users/davec/Projects/hackday/documentation/README.md)** en la carpeta [`documentation/`](file:///C:/Users/davec/Projects/hackday/documentation/README.md):

- 🎓 **[Tutoriales](file:///C:/Users/davec/Projects/hackday/documentation/01-tutorials/primer-descubrimiento.md)**: Guía de aprendizaje paso a paso para capturar tu primer objeto.
- 📖 **[Guías de Uso (How-To)](file:///C:/Users/davec/Projects/hackday/documentation/02-how-to/configurar-ollama-local.md)**: Recetas prácticas para configurar Ollama o activar el modo pensamiento (F12).
- 🔬 **[Referencia Técnica](file:///C:/Users/davec/Projects/hackday/documentation/03-reference/api-endpoints.md)**: Diccionario técnico de endpoints, esquemas JSON y variables `.env`.
- 🧠 **[Explicación y Arquitectura](file:///C:/Users/davec/Projects/hackday/documentation/04-explanation/arquitectura-y-pipeline.md)**: Análisis a fondo del diseño del pipeline multimodal y diagramas de flujo.

---

## 🚀 Guía Paso a Paso para Ejecutar la Aplicación

### 1. Requisitos Previos

- [Node.js 20.x](https://nodejs.org/) o superior y `npm` v10+
- [Python 3.10+](https://www.python.org/) para el backend de análisis visual
- [Ollama](https://ollama.com/) instalado en el sistema

---

### 2. Instalación de Dependencias

1. **Instalar dependencias del proyecto Frontend**:
   ```bash
   npm install
   ```

2. **Instalar dependencias del Backend de Python**:
   ```bash
   pip install -r agent/backend/requirements.txt
   ```

---

### 3. Configuración de Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto (o copia `.env.example`) con la siguiente configuración para forzar el uso de Ollama Local:

```env
# Modelo seleccionado para Ollama Local
OLLAMA_MODEL=gemma4:e2b

# Forzar el uso del motor local Ollama en lugar de la API en la nube
USE_OLLAMA_FALLBACK=true

# Mostrar razonamiento/pensamiento interno de Gemma 4 en consola (F12)
MOSTRAR_PENSAMIENTO=true
```

> 💡 **Tip de Depuración**: Al presionar **F12** en el navegador, la pestaña **Console** mostrará en tiempo real el pensamiento interno de Gemma 4 si `MOSTRAR_PENSAMIENTO=true` está activado.

---

### 4. Secuencia de Inicio (3 Pasos Necesarios)

Para que la aplicación funcione al 100%, debes tener corriendo los siguientes 3 servicios:

#### **Paso 4.1: Iniciar el Servidor de Ollama** (Terminal 1)
```bash
ollama serve
```
> *(Descarga el modelo si no lo tienes instalado ejecutando: `ollama pull gemma4:e2b`).*

#### **Paso 4.2: Iniciar el Backend de Visión en Python** (Terminal 2)
```bash
python -m uvicorn agent.backend.main:app --reload --port 8000
```
> *(Este servidor recibe las fotos enviadas por la cámara y las procesa con Gemma 4).*

#### **Paso 4.3: Iniciar la Aplicación Web (Next.js)** (Terminal 3)
```bash
npm run dev
```
*(Abre [http://localhost:3000](http://localhost:3000) en tu navegador).*

---

### 🛠️ Verificación y Build de Producción

- **Verificar Linting**:
  ```bash
  npm run lint
  ```

- **Compilación Completa (TypeScript + Next.js + Electron)**:
  ```bash
  npm run build
  ```

---

## 📂 Estructura del Proyecto

```text
├── .github/
│   └── workflows/
│       └── ci.yml            # Pipeline de CI/CD para GitHub Actions
├── electron/
│   ├── main.ts               # Proceso principal de Electron
│   └── preload.ts            # Script preload para Electron
├── src/
│   ├── app/                  # Páginas y rutas de Next.js App Router
│   ├── components/           # Componentes de UI (CameraView, etc.)
│   └── lib/                  # Utilidades y síntesis de audio fonético
├── eslint.config.mjs         # Configuración de ESLint
├── next.config.ts            # Configuración de Next.js
├── tsconfig.json             # Configuración de TypeScript para la Web
└── tsconfig.electron.json    # Configuración de TypeScript para Electron
```
