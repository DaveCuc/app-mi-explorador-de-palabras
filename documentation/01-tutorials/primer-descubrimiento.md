# 🎓 Tutorial: Tu Primer Descubrimiento de Objeto con Gemma 4

**Objetivo:** Guiar a un usuario o desarrollador nuevo en la captura y análisis de su primer objeto físico utilizando la cámara y **Gemma 4**.

---

## 📋 Requisitos Previos

Asegúrate de tener corriendo los servidores locales antes de iniciar:
1. **Ollama** activo en `http://localhost:11434`.
2. **Backend Python** en `http://localhost:8000`.
3. **Frontend Next.js/Electron** en `http://localhost:3000`.

---

## 🚀 Pasos para Realizar el Descubrimiento

### Paso 1: Permitir Acceso a la Cámara
Al abrir la aplicación en tu navegador o ventana de Electron, verás una ventana emergente solicitando permisos de cámara. 
- Haz clic en **"Permitir"** (*Allow*).

### Paso 2: Encuadrar un Objeto Físico
Busca un objeto claro en tu escritorio o habitación (ejemplos excelentes: `CELULAR`, `TAZA`, `TECLADO`, `RELOJ`, `CUADERNO`, `ZAPATO`).
- Coloca el objeto bien iluminado frente a la cámara web.

### Paso 3: Tomar la Foto 📸
- Haz clic en el botón circular **"Tomar Foto"**.
- Observarás que el botón cambia su estado a **"Analizando..."** con la animación del asistente Robot Gemma.

### Paso 4: Explorar el Resultado Pedagógico
En cuestión de segundos, la interfaz mostrará:
1. **El nombre del objeto**: Ej. `CELULAR`.
2. **Las sílabas**: `CE` - `LU` - `LAR` (puedes tocar cada sílaba para escuchar su locución).
3. **Las letras en fichas individuales**: `C`, `E`, `L`, `U`, `L`, `A`, `R` (al tocar cada una se reproducirá el nombre exacto en español: *"ce"*, *"e"*, *"ele"*, *"u"*, *"ele"*, *"a"*, *"ere"*).

---

## 🎉 ¡Felicidades!
Has completado tu primer ciclo de aprendizaje con visión multimodal y síntesis fonética en tiempo real.
