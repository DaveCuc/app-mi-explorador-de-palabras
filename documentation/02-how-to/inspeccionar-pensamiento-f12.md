# 📖 Guía (How-To): Inspeccionar el Pensamiento Interno de Gemma 4 en F12

**Problema:** Quieres observar qué está pensando el modelo (**Thinking Mode**) paso a paso antes de emitir la palabra y sílabas detectadas.

---

## 🛠️ Pasos para Habilitar y Ver la Consola F12

### Paso 1: Activar la Variable en `.env`
En el archivo `.env` del proyecto, asegúrate de tener:
```env
MOSTRAR_PENSAMIENTO=true
```

### Paso 2: Iniciar el Servidor Backend
Inicia el servidor en la terminal:
```bash
python -m uvicorn agent.backend.main:app --reload --port 8000
```

### Paso 3: Abrir las Herramientas de Desarrollador (DevTools)
1. Inicia la aplicación web (`npm run dev:next`) o la app de escritorio (`npm run dev`).
2. Presiona la tecla **F12** en tu teclado (o haz clic derecho y selecciona **Inspeccionar**).
3. Selecciona la pestaña **Console**.

---

## 🧠 ¿Qué Verás en la Consola?

Al capturar una foto con la cámara, la consola imprimirá un bloque violeta destacado:

```text
🧠 [PENSAMIENTO DE GEMMA 4 - CONSOLA F12]
"Veo un objeto rectangular en la imagen con teclado numérico y botones de navegación. Es un control remoto de televisión. Generando palabra en mayúsculas CONTROL y división silábica CON-TROL..."
```

> **Nota:** Si deseas desactivarlo en cualquier momento para producción, simplemente cambia la variable a `MOSTRAR_PENSAMIENTO=false` en el archivo `.env`.
