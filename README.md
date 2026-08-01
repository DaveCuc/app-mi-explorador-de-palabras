# Mi Explorador de Palabras 🎈

Aplicación educativa interactiva construida con **Next.js 16 (App Router)**, **React 19** y **Electron**, diseñada para ayudar a los niños a descubrir objetos del mundo real y aprender fonética, letras y sílabas mediante visión por computadora asistida por **Gemma 4**.

> [!NOTE]
> Esta aplicación combina captura multimedia en tiempo real, síntesis fonética por voz y juegos de desafío para fomentar el aprendizaje temprano de lectura y escritura.

---

## 🌟 Características Principales

- 📸 **Captura de Cámara en Tiempo Real**: Permite tomar fotografías con la cámara del dispositivo o subir imágenes de objetos cotidianos.
- 🧠 **Análisis de Objetos con Gemma 4**: Conexión con modelo local/backend para detectar objetos en imágenes y devolver la palabra, división silábica y desglose de letras.
- 🔊 **Síntesis Fonética y Deletreo**: Reproducción de sonidos individuales por letra (fonemas) y lectura pausada de palabras completas.
- 🎮 **Desafíos Interactivos y Gamificación**: Sistema de puntos, insignias y minijuegos de búsqueda de letras ("¿Puedes encontrar la letra A?").
- 💻 **Multiplataforma (Web & Desktop)**: Ejecución flexible tanto en navegador web como en aplicación de escritorio nativa mediante **Electron**.
- ⚙️ **CI/CD Integrado**: Validación automática de linting y compilación TypeScript en cada actualización con **GitHub Actions**.

---

## 🛠️ Tecnologías Utilizadas

- **Framework Web**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack) + [React 19](https://react.dev/)
- **Escritorio**: [Electron 43](https://www.electronjs.org/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/) + [Lucide React Icons](https://lucide.dev/)
- **Lenguaje**: TypeScript
- **Integración CI/CD**: GitHub Actions

---

## 🚀 Guía de Inicio Rápido

### Requisitos Previos

- [Node.js 20.x](https://nodejs.org/) o superior
- `npm` v10 o superior

### Instalación

1. Clona este repositorio:
   ```bash
   git clone https://github.com/tu-usuario/hackday.git
   cd hackday
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

### Desarrollo Local

- **Modo Next.js (Web)**:
  ```bash
  npm run dev:next
  ```
  Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

- **Modo Híbrido (Web + Electron)**:
  ```bash
  npm run dev
  ```

### Verificación y Build de Producción

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
