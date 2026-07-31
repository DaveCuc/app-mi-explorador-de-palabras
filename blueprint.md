# La Búsqueda del Tesoro Matemático — Blueprint Completo
### Build with Gemma · GDG CDMX Hackday · Categoría: El futuro de la educación

> **Pitch en una línea:** El salón de clases es el tablero de juego. Gemma 4 mira el aula a través de la cámara, convierte objetos reales en problemas de matemáticas, y los niños los resuelven caminando, contando y hablando en voz alta — no tocando una pantalla.

---

## 0. Índice

1. [El problema](#1-el-problema)
2. [La solución](#2-la-solución)
3. [Por qué es distinto a cualquier EdTech existente](#3-por-qué-es-distinto-a-cualquier-edtech-existente)
4. [Arquitectura técnica](#4-arquitectura-técnica)
5. [Decisión de runtime](#5-decisión-de-runtime-dónde-corre-gemma-4)
6. [Los prompts](#6-los-prompts)
7. [Las tools de function-calling](#7-las-tools-de-function-calling)
8. [Código esqueleto — Backend](#8-código-esqueleto--backend)
9. [Código esqueleto — Frontend](#9-código-esqueleto--frontend)
10. [Dirección de diseño](#10-dirección-de-diseño)
11. [Plan de ejecución por horas](#11-plan-de-ejecución-por-horas)
12. [División de trabajo](#12-división-de-trabajo)
13. [Guion del demo](#13-guion-del-demo)
14. [Artículo de Kaggle](#14-artículo-de-kaggle-mapeado-a-la-rúbrica)
15. [Checklist de entregables](#15-checklist-de-entregables)
16. [Riesgos y planes B — sección crítica en esta idea](#16-riesgos-y-planes-b--sección-crítica-en-esta-idea)

---

## 1. El problema

**El dato que abre la presentación:** los niños de primaria pasan en promedio más de 4 horas al día frente a una pantalla, y las apps "educativas" son parte del problema — le piden al niño estar quieto, solo, tocando vidrio. Los estudios de desarrollo infantil son consistentes en algo que cualquier maestro de primaria sabe empíricamente: **los niños de 6 a 11 años aprenden matemáticas mejor cuando el cuerpo está involucrado** — contar objetos reales, moverse, hablar en voz alta su razonamiento.

**El problema más fino:** hacer una actividad matemática física y grupal *bien* requiere que un maestro diseñe el reto, lo adapte al salón específico, lo narre, y evalúe la respuesta de cada niño — en tiempo real, para 30+ niños. Nadie tiene tiempo de improvisar eso todos los días con material distinto.

**Lo que proponemos:** que Gemma 4 diseñe el reto sobre la marcha, usando literalmente lo que hay en el salón ese día — no una worksheet genérica, sino "cuenta las patas de las sillas que tienes enfrente".

---

## 2. La solución

Una app de tablet/celular que los niños usan **de pie, en grupo, apuntando la cámara al salón** — no sentados escribiendo.

### Flujo de juego

1. Un niño (o el maestro) apunta la cámara a un objeto o zona del salón y presiona "Generar reto".
2. Gemma 4 (**visión multimodal**) identifica qué hay en la imagen — sillas, mochilas, lápices, ventanas, niños agrupados — y **genera un problema matemático contextual** sobre eso, en tiempo real, ajustado al nivel del grupo.
3. El reto se **narra en voz** (texto→voz) y aparece en pantalla grande/tablet.
4. Los niños resuelven **moviéndose físicamente**: cuentan objetos reales, se agrupan entre ellos, caminan hasta algo.
5. Un niño **dice la respuesta en voz alta** (voz→texto) al micrófono.
6. Gemma 4 valida, y si es necesario **vuelve a mirar la escena** (nueva foto) para confirmar el conteo físico — por ejemplo, si el reto fue "formen grupos de 3 niños", la cámara cuenta cuántos quedaron en cada grupo.
7. Correcto → celebración + siguiente pista, avanzando por una "ruta del tesoro" dibujada en el salón. Incorrecto → mismo diagnóstico de arquetipo de error que ya conocen (procedimiento / conceptual / comprensión / bloqueo), pero la corrección también es física: *"Ve y cuenta otra vez, en voz alta, tocando cada silla."*

### El ciclo completo usa 3 capacidades de Gemma 4 en un solo loop:
**Visión** (leer la escena) → **Generación contextual** (crear el problema) → **Voz** (narrar y escuchar) → **Visión otra vez** (validar el resultado físico)

---

## 3. Por qué es distinto a cualquier EdTech existente

| EdTech típica | Tesoro Matemático |
|---|---|
| Contenido pre-diseñado, igual para todos los salones | El problema se genera **de lo que hay en ESE salón, ESE día** |
| El niño interactúa con la pantalla | La pantalla es el árbitro; el niño interactúa **con el salón y sus compañeros** |
| Silencio, cada quien en su dispositivo | Se resuelve **en voz alta**, en grupo, caminando |
| Corrección = texto en pantalla | Corrección = **instrucción física** que se comprueba con la cámara |
| Un solo sentido (vista, lectura) | Visión + voz + movimiento — tres canales sensoriales a la vez |

Ningún hackathon de un día suele intentar cerrar el loop visión→generación→voz→visión porque parece "demasiado". Esa es exactamente la razón por la que, si lo logran aunque sea de forma acotada, va a ser memorable frente al jurado — nadie más va a tener algo así.

---

## 4. Arquitectura técnica

```
┌──────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
│   Cámara en vivo → Botón "Generar reto" → Narración en pantalla  │
│   → Micrófono para respuesta → Foto de validación → Celebración  │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
           ┌───────────────┴────────────────┐
           ▼                                ▼
  POST /api/generar-reto            POST /api/validar-turno
           │                                │
┌──────────▼────────────────────────────────▼──────────────────────┐
│                       BACKEND (FastAPI)                          │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 1 — PERCEPCIÓN DE ESCENA                            │    │
│  │  Gemma 4 (visión multimodal)                              │    │
│  │  IN:  foto del salón                                      │    │
│  │  OUT: {objetos_detectados: [...], conteos: {...}}         │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 2 — GENERACIÓN DE RETO                              │    │
│  │  Gemma 4 (texto, contexto: objetos + nivel + historial)   │    │
│  │  OUT: {enunciado, tipo_validacion, respuesta_esperada}    │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│              (texto → voz, se narra el reto)                     │
│                           │                                      │
│                    el niño responde hablando                     │
│                           │                                      │
│                    (voz → texto)                                 │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 3 — DIAGNÓSTICO (reutiliza arquetipos ya definidos) │    │
│  │  Gemma 4 + thinking mode                                  │    │
│  │  OUT: {arquetipo, correcto, requiere_validacion_visual}   │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 4 — VALIDACIÓN FÍSICA (solo si aplica)              │    │
│  │  Gemma 4 (visión) sobre una NUEVA foto de la escena       │    │
│  │  IN: foto tras el movimiento físico del niño              │    │
│  │  OUT: {coincide_con_respuesta_esperada: bool}             │    │
│  └────────────────────────┬───────────────────────────────────┘    │
│                           ▼                                      │
│         Router de retroalimentación (function-calling)           │
│         narrar_celebracion() / dar_pista_fisica() / repetir()    │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  CAPA 5 — RUTA DEL TESORO (estado de sesión)              │    │
│  │  Progreso del grupo, siguiente pista, puntaje             │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────┬──────────────────────────────────────────┘
                           ▼
                ┌────────────────────────┐
                │   GEMMA 4 (E4B) local  │
                │   vía Ollama · sin red │
                └────────────────────────┘
```

### Decisión de diseño clave: separar "generación" de "validación física"

Son dos llamadas de visión distintas y deliberadamente separadas:
- **Capa 1** mira el salón **antes** de que los niños se muevan (para inventar el reto).
- **Capa 4** mira el salón **después** de que se movieron (para comprobar si lo resolvieron bien).

Esto es lo que convierte la app en algo que reacciona al mundo físico real y no en un generador de preguntas al azar con una capa de gamificación pegada encima.

---

## 5. Decisión de runtime: dónde corre Gemma 4

Igual que en la versión anterior del proyecto: **estrategia dual**, pero aquí el argumento pesa todavía más porque dependen de la cámara en vivo.

### Para el demo en vivo → **Ollama local, en la laptop/mini-PC más potente del equipo**

- Cero dependencia del wifi del venue — crítico cuando su demo entera depende de fotos en tiempo real.
- Setup idéntico al del proyecto anterior:

```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull gemma4:e4b        # multimodal — confirmar el tag exacto en la web de Ollama
ollama pull gemma4:e2b        # respaldo si la laptop sufre con imágenes
```

⚠️ **Más crítico aún que en el proyecto anterior:** prueben la inferencia con imágenes reales del salón **antes de llegar**, con luz similar a la del venue. La visión es más sensible a latencia que el texto — midan cuántos segundos tarda una llamada con foto, porque eso define su UX (necesitan un estado de "pensando" bien diseñado si tarda más de 2-3 segundos).

### Para el entregable público → **Kaggle Notebook**

Aquí el notebook es aún más valioso que en la versión de texto: no todos los jueces van a poder pararse a jugarlo físicamente. El notebook debe incluir **3-4 fotos de ejemplo pre-cargadas** (tomadas ustedes mismos de un salón/oficina) que reproduzcan el loop completo de punta a punta sin necesitar cámara en vivo — así cualquier juez puede correrlo y ver el resultado.

---

## 6. Los prompts

### 6.1 Prompt de percepción de escena (Capa 1)

```python
SYSTEM_PERCEPCION = """Eres un asistente que analiza fotos de salones de clase de \
primaria para generar retos matemáticos. Tu única tarea es DESCRIBIR lo que hay en \
la imagen de forma útil para diseñar un problema — no propongas el problema todavía.

Identifica:
- Objetos contables y repetidos (sillas, mesas, mochilas, lápices, ventanas, libros)
- Su cantidad aproximada
- Si hay personas, cuántas (sin identificar a nadie, solo el conteo)
- Agrupaciones naturales visibles (objetos en filas, mesas con varias sillas)

Prioriza objetos con cantidades entre 2 y 20 — son los más útiles pedagógicamente \
para primaria. Ignora objetos de los que solo hay uno.

Responde ÚNICAMENTE con JSON, sin markdown:
{
  "objetos": [
    {"nombre": "string", "cantidad": int, "agrupacion_visible": "string o null"}
  ],
  "personas_presentes": int,
  "descripcion_breve": "string, una frase"
}"""
```

### 6.2 Prompt de generación de reto (Capa 2)

```python
SYSTEM_GENERAR_RETO = """Eres un maestro de primaria creativo diseñando un reto de \
matemáticas que los niños deben resolver MOVIÉNDOSE FÍSICAMENTE, no escribiendo.

Recibes: una lista de objetos detectados en el salón, el nivel del grupo, y qué \
conceptos ya se practicaron en la sesión (para variar).

Reglas para un buen reto:
- Usa el objeto y la cantidad EXACTOS que se detectaron — el niño debe poder \
  comprobarlo con sus propios ojos.
- El reto debe requerir una ACCIÓN física para resolverse: contar en voz alta, \
  agruparse, caminar hasta algo, formar equipos.
- Ajusta la dificultad al nivel (primaria bajo: suma/resta simple y conteo; \
  primaria alto: multiplicación, fracciones, agrupaciones).
- Varía el tipo de concepto respecto a los retos anteriores de la sesión.
- El enunciado debe poder LEERSE EN VOZ ALTA de forma natural — nada de símbolos, \
  todo en palabras.

Define también CÓMO se valida la respuesta:
- "verbal": el niño dice un número, se compara contra la respuesta esperada
- "visual": requiere que la cámara vuelva a mirar la escena después del movimiento \
  (ej. "formen grupos de 3" se valida contando personas por grupo en una nueva foto)

Responde ÚNICAMENTE con JSON, sin markdown:
{
  "enunciado": "string, en tono de aventura de búsqueda del tesoro",
  "concepto": "string",
  "tipo_validacion": "verbal" | "visual",
  "respuesta_esperada": "string o número",
  "instruccion_validacion_visual": "string o null, qué debe contar la cámara si aplica"
}"""
```

### 6.3 Prompts de retroalimentación (reutilizando los arquetipos)

Los 4 prompts de estrategia pedagógica (`desglosar_en_pasos`, `ejemplo_visual`, `pregunta_socratica`, `explicar_con_analogia`) del proyecto anterior **se reutilizan tal cual**, con un solo ajuste: la instrucción final siempre debe convertirse en una **acción física**, no en texto para leer.

```python
AJUSTE_FISICO = """\n\nIMPORTANTE: tu respuesta debe terminar en UNA instrucción de \
acción física y concreta que el niño pueda hacer de inmediato con su cuerpo o con \
objetos del salón (ej. "camina hasta la ventana y cuenta cuántas hay", "júntense \
en grupos de 4 y siéntense"). Nunca termines solo con una explicación de texto."""

# Se concatena a cada uno de los 4 prompts de estrategia ya definidos.
```

---

## 7. Las tools de function-calling

```python
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "narrar_celebracion",
            "description": "Genera una narración de celebración cuando el reto se "
                           "resolvió correctamente, y desbloquea la siguiente pista "
                           "de la ruta del tesoro.",
            "parameters": {
                "type": "object",
                "properties": {
                    "concepto_dominado": {"type": "string"},
                    "puntos_otorgados": {"type": "integer"}
                },
                "required": ["concepto_dominado", "puntos_otorgados"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "dar_pista_fisica",
            "description": "Genera una instrucción de movimiento físico como pista, "
                           "sin revelar la respuesta. Se usa cuando el grupo pide ayuda "
                           "o falla dos veces seguidas.",
            "parameters": {
                "type": "object",
                "properties": {
                    "concepto": {"type": "string"},
                    "accion_fisica_sugerida": {"type": "string"}
                },
                "required": ["concepto", "accion_fisica_sugerida"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "solicitar_validacion_visual",
            "description": "Le pide a la cámara una nueva foto de la escena para "
                           "comprobar un resultado físico (ej. contar cuántos niños "
                           "quedaron en cada grupo formado).",
            "parameters": {
                "type": "object",
                "properties": {
                    "que_contar": {"type": "string"},
                    "resultado_esperado": {"type": "string"}
                },
                "required": ["que_contar", "resultado_esperado"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generar_siguiente_reto",
            "description": "Dispara la generación del siguiente reto de la ruta del "
                           "tesoro, evitando repetir el concepto recién practicado.",
            "parameters": {
                "type": "object",
                "properties": {
                    "concepto_a_evitar": {"type": "string"},
                    "dificultad": {"type": "string", "enum": ["igual", "subir", "bajar"]}
                },
                "required": ["concepto_a_evitar", "dificultad"]
            }
        }
    }
]
```

---

## 8. Código esqueleto — Backend

```python
# main.py
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal, Optional
import ollama, json, base64

app = FastAPI(title="La Búsqueda del Tesoro Matemático")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODELO = "gemma4:e4b"   # confirmar tag exacto — necesita soporte de visión

SESIONES: dict[str, dict] = {}   # progreso de la ruta del tesoro por sesión

# ─────────────────────────────────────────────────────────────
# Abstracción del modelo — soporta texto e imagen
# ─────────────────────────────────────────────────────────────

def llamar_gemma(messages, tools=None, think=False, imagen_b64: Optional[str] = None):
    if imagen_b64:
        messages[-1]["images"] = [imagen_b64]
    return ollama.chat(
        model=MODELO,
        messages=messages,
        tools=tools,
        think=think,
        options={"temperature": 0.4},   # un poco más alta: queremos creatividad en los retos
    )

def parsear_json(texto: str) -> dict:
    limpio = texto.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
    return json.loads(limpio)

# ─────────────────────────────────────────────────────────────
# Modelos de datos
# ─────────────────────────────────────────────────────────────

class Reto(BaseModel):
    enunciado: str
    concepto: str
    tipo_validacion: Literal["verbal", "visual"]
    respuesta_esperada: str
    instruccion_validacion_visual: Optional[str] = None

class RespuestaVerbal(BaseModel):
    session_id: str
    reto_id: str
    razonamiento: str            # transcrito de voz a texto en el frontend

# ─────────────────────────────────────────────────────────────
# CAPA 1 + 2 — Percepción de escena y generación de reto
# ─────────────────────────────────────────────────────────────

@app.post("/api/generar-reto")
async def generar_reto(session_id: str, foto: UploadFile):
    imagen_b64 = base64.b64encode(await foto.read()).decode()
    sesion = SESIONES.setdefault(session_id, {"conceptos_vistos": [], "puntos": 0, "paso": 0})

    # Capa 1 — percepción
    r1 = llamar_gemma(
        messages=[{"role": "system", "content": SYSTEM_PERCEPCION},
                  {"role": "user", "content": "Analiza esta foto del salón."}],
        imagen_b64=imagen_b64,
    )
    escena = parsear_json(r1["message"]["content"])

    # Capa 2 — generación del reto
    r2 = llamar_gemma(
        messages=[{"role": "system", "content": SYSTEM_GENERAR_RETO},
                  {"role": "user", "content":
                      f"OBJETOS DETECTADOS: {json.dumps(escena, ensure_ascii=False)}\n"
                      f"CONCEPTOS YA VISTOS: {sesion['conceptos_vistos']}\n"
                      f"NIVEL: primaria 3°-4° grado"}],
    )
    reto = Reto(**parsear_json(r2["message"]["content"]))

    sesion["conceptos_vistos"].append(reto.concepto)
    sesion["reto_actual"] = reto.model_dump()
    sesion["paso"] += 1

    return {"reto": reto, "paso": sesion["paso"], "escena_detectada": escena}

# ─────────────────────────────────────────────────────────────
# CAPA 3 — Diagnóstico de la respuesta verbal (reutiliza arquetipos)
# ─────────────────────────────────────────────────────────────

@app.post("/api/validar-verbal")
def validar_verbal(body: RespuestaVerbal):
    sesion = SESIONES[body.session_id]
    reto = Reto(**sesion["reto_actual"])

    r = llamar_gemma(
        messages=[{"role": "system", "content": SYSTEM_DIAGNOSTICO},  # del proyecto anterior
                  {"role": "user", "content":
                      f"PROBLEMA: {reto.enunciado}\nRESPUESTA ESPERADA: {reto.respuesta_esperada}\n"
                      f"LO QUE DIJO EL NIÑO: {body.razonamiento}"}],
        think=True,
    )
    diag = parsear_json(r["message"]["content"])

    if diag["arquetipo"] == "SIN_ERROR" and reto.tipo_validacion == "visual":
        return {"estado": "requiere_foto", "instruccion": reto.instruccion_validacion_visual}

    if diag["arquetipo"] == "SIN_ERROR":
        sesion["puntos"] += 10
        return {"estado": "correcto", "puntos": sesion["puntos"],
                "mensaje": "¡Excelente! Preparando el siguiente reto…"}

    # Reutiliza el router + prompts de estrategia del proyecto anterior,
    # con AJUSTE_FISICO concatenado al prompt de la estrategia elegida
    estrategia = ROUTER[diag["arquetipo"]]
    r2 = llamar_gemma(
        messages=[{"role": "system", "content": PROMPTS_ESTRATEGIA[estrategia] + AJUSTE_FISICO},
                  {"role": "user", "content":
                      f"PROBLEMA: {reto.enunciado}\nEL NIÑO DIJO: {body.razonamiento}"}],
    )
    return {"estado": "reintentar", "arquetipo": diag["arquetipo"],
            "instruccion_fisica": r2["message"]["content"].strip()}

# ─────────────────────────────────────────────────────────────
# CAPA 4 — Validación visual (después del movimiento físico)
# ─────────────────────────────────────────────────────────────

@app.post("/api/validar-visual")
async def validar_visual(session_id: str, foto: UploadFile):
    sesion = SESIONES[session_id]
    reto = Reto(**sesion["reto_actual"])
    imagen_b64 = base64.b64encode(await foto.read()).decode()

    r = llamar_gemma(
        messages=[{"role": "system", "content":
                      "Cuenta EXACTAMENTE lo que se te pide en la instrucción. "
                      "Responde solo JSON: {\"conteo\": int, \"coincide\": bool}"},
                  {"role": "user", "content":
                      f"INSTRUCCIÓN: {reto.instruccion_validacion_visual}\n"
                      f"RESULTADO ESPERADO: {reto.respuesta_esperada}"}],
        imagen_b64=imagen_b64,
    )
    resultado = parsear_json(r["message"]["content"])

    if resultado["coincide"]:
        sesion["puntos"] += 15   # bonus por la validación física
        return {"estado": "correcto", "puntos": sesion["puntos"]}
    return {"estado": "casi", "conteo_detectado": resultado["conteo"],
            "mensaje": "Casi... revisen de nuevo y cuenten en voz alta juntos."}
```

---

## 9. Código esqueleto — Frontend

```jsx
// App.jsx — flujo simplificado del loop cámara → reto → voz → validación
import { useState, useRef, useCallback } from "react";

const API = "http://localhost:8000";

export default function App() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const [fase, setFase] = useState("inicio"); // inicio | generando | reto | escuchando | validando | celebrando
  const [reto, setReto] = useState(null);
  const [puntos, setPuntos] = useState(0);
  const [mensaje, setMensaje] = useState("");
  const videoRef = useRef(null);

  async function capturarFoto() {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
  }

  const generarReto = useCallback(async () => {
    setFase("generando");
    const foto = await capturarFoto();
    const form = new FormData();
    form.append("foto", foto);
    const res = await fetch(`${API}/api/generar-reto?session_id=${sessionId}`, {
      method: "POST", body: form,
    });
    const data = await res.json();
    setReto(data.reto);
    setFase("reto");
    hablar(data.reto.enunciado);      // texto → voz, Web Speech API o similar
  }, [sessionId]);

  function hablar(texto) {
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = "es-MX";
    speechSynthesis.speak(u);
  }

  function escuchar() {
    setFase("escuchando");
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new R();
    rec.lang = "es-MX";
    rec.onresult = async (e) => {
      const razonamiento = e.results[0][0].transcript;
      await validarRespuesta(razonamiento);
    };
    rec.start();
  }

  async function validarRespuesta(razonamiento) {
    setFase("validando");
    const res = await fetch(`${API}/api/validar-verbal`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, reto_id: "actual", razonamiento }),
    });
    const data = await res.json();

    if (data.estado === "requiere_foto") {
      setMensaje(data.instruccion);
      hablar(data.instruccion);
      // el maestro/niño presiona "Comprobar" cuando ya se movieron
    } else if (data.estado === "correcto") {
      setPuntos(data.puntos);
      setFase("celebrando");
      hablar(data.mensaje);
      setTimeout(generarReto, 3000);
    } else {
      setMensaje(data.instruccion_fisica);
      hablar(data.instruccion_fisica);
      setFase("reto");
    }
  }

  async function comprobarVisualmente() {
    setFase("validando");
    const foto = await capturarFoto();
    const form = new FormData();
    form.append("foto", foto);
    const res = await fetch(`${API}/api/validar-visual?session_id=${sessionId}`, {
      method: "POST", body: form,
    });
    const data = await res.json();
    if (data.estado === "correcto") {
      setPuntos(data.puntos);
      setFase("celebrando");
      setTimeout(generarReto, 3000);
    } else {
      setMensaje(data.mensaje);
      hablar(data.mensaje);
    }
  }

  return (
    <main className={`app fase-${fase}`}>
      <video ref={videoRef} autoPlay muted playsInline className="camara" />

      <div className="hud">
        <span className="puntos">🏆 {puntos} pts</span>
      </div>

      {fase === "inicio" && (
        <button className="boton-grande" onClick={generarReto}>
          🗺️ Empezar la búsqueda
        </button>
      )}

      {fase === "reto" && reto && (
        <div className="tarjeta-reto">
          <p>{reto.enunciado}</p>
          <button onClick={escuchar}>🎤 Responder hablando</button>
        </div>
      )}

      {fase === "escuchando" && <div className="pulso">Escuchando…</div>}
      {fase === "validando" && <div className="pensando">Comprobando…</div>}

      {mensaje && (
        <div className="mensaje-pista">
          {mensaje}
          <button onClick={comprobarVisualmente}>📸 Ya lo hicimos, comprueba</button>
        </div>
      )}

      {fase === "celebrando" && <div className="confeti">🎉 ¡Correcto!</div>}
    </main>
  );
}
```

> **Nota sobre Web Speech API:** funciona bien en Chrome sin dependencias extra — ideal para un hackday. Si el navegador del venue da problemas, el plan B es un botón de "grabar audio" que se manda al backend y se transcribe con Gemma 4 o un modelo de audio ligero — tenerlo listo como respaldo, no como plan A.

---

## 10. Dirección de diseño

**Concepto:** mapa de tesoro dibujado a mano, texturas de papel viejo, brújulas — pero ejecutado con tipografía y color contemporáneos para que no se sienta infantil-genérico. Piensen "cuaderno de explorador", no "clip art de piratas".

**El detalle memorable:** la pantalla casi no importa — es una ventana, no el centro de atención. El diseño debe ser **legible desde lejos y en movimiento** (los niños caminan con la tablet), con estados súper claros: escuchando, pensando, celebrando. Nada de texto pequeño ni UI densa.

```css
:root {
  --pergamino: #EDE0C8;
  --tinta:     #2B2016;
  --dorado:    #C9A24B;
  --exito:     #4A7C4E;
  --alerta:    #B5542F;

  --fuente-display: "Fraunces", Georgia, serif;
  --fuente-texto:   "Karla", sans-serif;
}

.app {
  background: radial-gradient(ellipse at top, #F5EBD3, var(--pergamino));
  color: var(--tinta);
  font-family: var(--fuente-texto);
  min-height: 100vh;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
}

.camara {
  position: fixed; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  filter: sepia(15%) contrast(1.05);   /* le da tono de "mapa antiguo" al video real */
}

.hud {
  position: fixed; top: 1rem; right: 1rem;
  background: var(--tinta); color: var(--pergamino);
  padding: .6rem 1.2rem; border-radius: 999px;
  font-family: var(--fuente-display); font-weight: 700;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0,0,0,.25);
}

.boton-grande {
  font-family: var(--fuente-display);
  font-size: clamp(1.2rem, 4vw, 1.8rem);
  padding: 1.2rem 2.5rem;
  background: var(--dorado);
  border: 3px solid var(--tinta);
  border-radius: 999px;
  box-shadow: 0 6px 0 var(--tinta);
  cursor: pointer;
  transition: transform 120ms ease;
}
.boton-grande:active { transform: translateY(4px); box-shadow: 0 2px 0 var(--tinta); }

.tarjeta-reto {
  background: var(--pergamino);
  border: 3px solid var(--tinta);
  border-radius: 16px;
  padding: 1.5rem 2rem;
  max-width: 90vw;
  font-family: var(--fuente-display);
  font-size: clamp(1.1rem, 3vw, 1.5rem);
  box-shadow: 0 8px 24px rgba(0,0,0,.3);
}

.pulso {
  width: 4rem; height: 4rem; border-radius: 50%;
  background: var(--alerta);
  animation: pulso 1s ease-in-out infinite;
}
@keyframes pulso {
  0%, 100% { transform: scale(1); opacity: .8; }
  50%      { transform: scale(1.3); opacity: 1; }
}

.confeti {
  font-family: var(--fuente-display);
  font-size: clamp(1.5rem, 6vw, 2.5rem);
  color: var(--exito);
  animation: rebote 600ms cubic-bezier(.34,1.56,.64,1);
}
@keyframes rebote {
  0%   { transform: scale(.5); opacity: 0; }
  60%  { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
```

---

## 11. Plan de ejecución por horas

Esta idea tiene más piezas móviles que un chatbot de texto — el plan de horas es más agresivo con los recortes.

| Hora | Objetivo | Quién |
|---|---|---|
| **Antes de llegar** | Ollama + `gemma4:e4b` probado **con imágenes reales**, medir latencia. Web Speech API probada en Chrome. Repo y Vite listos. | Todos, en casa |
| 09:00–09:45 | Registro, kickoff, formación de equipo | Todos |
| 09:45–10:15 | Alineación, repartir tareas, decidir el recorte de alcance del día 1 | Todos |
| 10:15–12:00 | **Capa 1 + 2** — percepción de escena y generación de reto, probado con 5 fotos reales del venue | ML + Backend |
| 10:15–12:00 | UI del "modo explorador": cámara de fondo, botón grande, tarjeta de reto (con datos falsos) | Frontend + Diseño |
| 12:00–13:30 | **Voz** — texto→voz y voz→texto conectados; Capa 3 (diagnóstico) reutilizada del proyecto anterior | ML + Backend |
| 12:00–13:30 | Estados visuales: escuchando / pensando / celebrando, con animaciones | Frontend + Diseño |
| 13:30–14:15 | Comida + **decisión dura de alcance** (ver abajo) | Todos |
| 14:15–15:00 | **Decidir aquí:** ¿da tiempo la Capa 4 (validación visual)? Si sí, implementarla. Si no, **todos los retos se validan por voz**, sin foto de comprobación — el juego sigue siendo completo y divertido sin esa capa. | ML + Backend |
| 14:15–15:30 | Ruta del tesoro: progreso, puntos, celebración, siguiente reto | Backend |
| 14:15–15:30 | Kaggle Notebook con 3-4 fotos de ejemplo pre-cargadas | Backend |
| **15:30** | 🚨 **FEATURE FREEZE.** | Todos |
| 15:30–16:30 | Ensayar el demo físico completo 3 veces, con distintas personas jugando | Todos |
| 16:30–17:30 | Artículo de Kaggle + repo público | 2 personas |
| 17:30–17:45 | **ENVIAR** | Uno designado |
| 17:45–18:00 | Presentación | Todos |

### La decisión dura de las 14:15

Este proyecto tiene una capacidad "de lujo" (Capa 4, validación visual) y un núcleo que ya es ganador sin ella (Capas 1-3: visión para generar el reto + voz para resolverlo). **No sacrifiquen el núcleo por perseguir la capa de lujo.** Si a las 14:15 la Capa 4 no está sólida, sigan sin ella — el proyecto completo funciona igual de bien para el demo.

---

## 12. División de trabajo

**Persona 1 — ML / Python (dueño de percepción y generación)**
Prompts de las Capas 1, 2 y 4 (visión). Es el rol de mayor riesgo técnico — que sea quien más cómodo se sienta con multimodalidad.

**Persona 2 — Backend / APIs**
Endpoints, estado de sesión, ruta del tesoro, reutilización del diagnóstico del proyecto anterior. Kaggle Notebook.

**Persona 3 — Frontend**
Cámara en vivo, integración de Web Speech API, los estados de fase (escuchando/pensando/celebrando).

**Persona 4 — Diseño**
Sistema visual "mapa de explorador", animaciones de celebración, y — igual que antes — dueño del guion y slides desde temprano.

**Persona 5 (si aplica) — Mobile / QA / "niño de pruebas"**
Alguien tiene que literalmente jugarlo caminando por el salón para encontrar dónde se rompe la UX física. Este rol es más valioso aquí que en el proyecto de texto — asígnenlo sin falta.

---

## 13. Guion del demo

**Este es el proyecto con el demo más espectacular posible del hackathon — aprovéchenlo.** Necesitan 2-3 personas del equipo actuando como "los niños" frente al jurado.

**0:00–0:30 — El gancho (actuado, no hablado desde un podio)**
Un miembro del equipo levanta la tablet y apunta a las sillas donde están sentados los jueces:
> *"Esto que estoy haciendo ahora mismo — apuntar la cámara a ustedes — es toda la preparación que necesita un maestro para dar una clase de matemáticas con esto."*

**0:30–2:30 — El demo en vivo, jugado de verdad**
1. Presionan "Generar reto" apuntando a algo del venue (sillas, mesas, gente).
2. Gemma 4 narra el reto en voz alta, en tiempo real, frente al jurado.
3. Dos personas del equipo **resuelven el reto moviéndose físicamente** — contando en voz alta, agrupándose.
4. Si el reto era de validación visual: toman una segunda foto en vivo y el sistema confirma.
5. Celebración, siguiente reto — muestren que el sistema **nunca repite el mismo tipo de problema**, porque cambia con lo que ve.

**2:30–3:15 — El cierre técnico**
> "Cuatro capacidades de Gemma 4 en un solo loop: ve el salón, inventa el problema, lo dice en voz alta, escucha la respuesta, y vuelve a mirar para comprobar que el movimiento físico fue correcto. Todo corriendo local, sin internet, en esta laptop."

**3:15–3:45 — El impacto**
> "No sustituye al maestro dando la clase — sustituye la hora que le tomaría diseñar una actividad física distinta cada día. Y saca a los niños de la pantalla, no los mete más adentro."

**Consejo de presentación:** si el reto que les toca en vivo no sale perfecto (puede pasar con visión en tiempo real), no lo escondan — es parte de la honestidad técnica que valora la rúbrica. Digan: *"Miren, aquí el modelo dudó — por eso separamos la percepción del diagnóstico, para poder mejorar cada pieza por separado."* Convierte un tropiezo en una demostración de que entienden su propia arquitectura.

---

## 14. Artículo de Kaggle (mapeado a la rúbrica)

**Título:** La Búsqueda del Tesoro Matemático: el salón como tablero de juego
**Subtítulo:** Un loop de percepción-generación-voz con Gemma 4 que convierte objetos reales del aula en retos de matemáticas resueltos con el cuerpo, no con una pantalla

| Sección | Palabras | Qué debe lograr | Rúbrica |
|---|---|---|---|
| El problema | 200 | Pantallas vs. aprendizaje físico en primaria; el costo de diseñar actividades físicas a diario | Innovación e Impacto (30%) |
| La solución y su originalidad | 200 | Por qué nadie hace este loop completo en un hackday | Innovación (30%) |
| Arquitectura de 4 capas | 300 | Diagrama + por qué separar percepción de validación | Integración Gemma (30%) |
| Uso específico de Gemma 4 | 350 | **Sean muy concretos:** visión multimodal en Capas 1 y 4, generación contextual en Capa 2, thinking mode + function-calling reutilizados en Capa 3. Expliquen la decisión de dos llamadas de visión separadas. | Integración Gemma (30%) |
| Retos del día | 200 | Sean honestos sobre la latencia de visión, sobre si lograron o no la Capa 4 completa | Presentación (20%) |
| Demo y resultados | 150 | Capturas de los retos generados sobre fotos reales del venue | Funcionalidad (20%) |
| Limitaciones y siguiente paso | 100 | Validación con maestros reales, condiciones de luz, más conceptos matemáticos | Presentación (20%) |

**Argumento diferenciador para el artículo:** dejen explícito que la arquitectura se diseñó **asumiendo que la Capa 4 (validación visual) podía no completarse en un día**, y que por eso el sistema es igual de funcional sin ella. Eso demuestra criterio de ingeniería bajo restricción de tiempo — algo que un jurado de hackathon valora mucho.

---

## 15. Checklist de entregables

Idéntico al del proyecto anterior — no cambia por tratarse de una idea distinta.

- [ ] **Artículo de Kaggle** con el botón "Nuevo artículo"
- [ ] Título + subtítulo + análisis detallado, máximo 1500 palabras
- [ ] **Categoría seleccionada**: El futuro de la educación
- [ ] **Repo público** (GitHub o Kaggle Notebook) — sin login, sin paywall, bien documentado
- [ ] Enlace al repo en "Adjuntos" → "Enlaces del proyecto"
- [ ] **Demo en vivo** pública — aquí especialmente, el Kaggle Notebook con fotos pre-cargadas es su red de seguridad si el demo físico no se puede reproducir fuera del venue
- [ ] Enlace a la demo en "Adjuntos"
- [ ] **ENVIADO** con el botón "Enviar" antes de la fecha límite — designen a un responsable

---

## 16. Riesgos y planes B — sección crítica en esta idea

Esta idea tiene más superficie de riesgo que un chatbot de texto. Tómense en serio esta tabla.

| Riesgo | Probabilidad | Plan B |
|---|---|---|
| La visión de Gemma 4 tarda demasiado (varios segundos por foto) | **Alta** | Diseñen el estado "pensando" como parte de la experiencia, no como un bug — una animación de "el mapa se está dibujando" cubre 3-5 segundos sin que se sienta roto |
| La cámara del venue tiene mala luz | Media-Alta | Prueben con luz de interior típica en casa. Tengan una foto de respaldo pre-tomada por si la luz en vivo falla, y úsenla en el demo si es necesario |
| Web Speech API falla en el navegador del venue | Media | Botón de grabar audio → mandar al backend → transcribir con Gemma 4 como plan B, ya con el código listo de antemano |
| La Capa 4 (validación visual) no da tiempo | **Alta, y está bien** | Ver la sección 11 — el proyecto es completo sin ella. Todos los retos se validan por voz. |
| El reconocimiento de objetos falla o es raro | Media | Tengan 2-3 "salones" ya fotografiados y probados de antemano como fallback, para no depender 100% de lo que detecte en vivo frente al jurado |
| El wifi falla | Alta | Modelo local, ya cubierto |
| El demo físico se ve caótico frente al jurado | Media | **Ensayen la coreografía como si fuera una obra de teatro corta** — quién dice qué, quién se mueve a dónde, en qué segundo. No improvisen el movimiento físico frente a los jueces. |
| Se cae todo el demo en vivo | Media | **Video grabado de respaldo**, hecho a las 16:00, mostrando el loop completo funcionando de principio a fin |

> **La decisión más importante de todo este blueprint:** si tienen que elegir entre pulir la Capa 4 (validación visual) o ensayar la coreografía del demo, **ensayen la coreografía**. Un jurado recuerda un demo bien actuado mucho más que una capacidad técnica adicional que nadie ve bien presentada.

---

## Apéndice: ejemplos de retos por tipo de objeto

Pruébenlos de antemano con fotos reales para calibrar el prompt de generación.

| Objeto detectado | Cantidad | Reto generado (ejemplo) | Tipo de validación |
|---|---|---|---|
| Sillas | 8 | "El tesoro está escondido cerca de la mitad de las sillas de este salón. ¿Cuántas sillas son la mitad?" | verbal |
| Personas | 12 | "Formen 3 equipos iguales para cruzar el puente del tesoro. ¿Cuántos exploradores va en cada equipo?" | visual (contar personas por grupo) |
| Mochilas | 6 | "Cada mochila esconde 2 monedas de oro imaginarias. ¿Cuántas monedas hay en total?" | verbal |
| Ventanas | 4 | "El mapa dice que caminen hasta la tercera ventana contando desde la puerta. ¿A cuál ventana deben llegar?" | visual (comprobar que llegaron a la correcta) |

---

**Suerte. Empiecen probando la Capa 1 con una foto real del salón antes que nada — si la percepción de escena no es confiable, ajústenla temprano, porque todo lo demás depende de ella.**
