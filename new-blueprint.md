# **El Explorador de Palabras — Blueprint Adaptado**

## **Build with Gemma · GDG CDMX Hackday · Categoría: El futuro de la educación / Equidad e inclusión digitales**

**Pitch en una línea:** Usar Gemma 4 (visión) para convertir cualquier objeto real en una lección de lectoescritura interactiva: muestra el nombre del objeto en letras gigantes y permite tocar cada letra para escuchar su fonema y la pronunciación completa de la palabra.

### ---

**1\. El problema (Adaptado)**

El aprendizaje tradicional de la lectoescritura confina las palabras al papel o a abstracciones en una pantalla. Los niños pequeños (preescolar y primeros grados de primaria) necesitan conectar el lenguaje con su entorno inmediato. Aprender la relación entre el mundo físico, la representación escrita (grafema) y el sonido (fonema) es el pilar de la alfabetización, y es un proceso que debe ser tangible y divertido, no pasivo.

### **2\. La solución (Flujo de Juego Modificado)**

Una app donde la cámara es un "descubridor de palabras":

> 1. El niño apunta la cámara a un objeto del entorno (ej. una silla, una puerta, un lápiz) y presiona "¿Qué es esto?".  
> 2. **Gemma 4 (visión multimodal)** identifica el objeto en la foto.  
> 3. **Gemma 4 (generación estructurada)** procesa la imagen y devuelve la palabra, su separación en sílabas y la estructura de fonemas.  
> 4. El Frontend muestra la palabra en la pantalla con **letras ENORMES y tocables**.  
> 5. **Interacción auditiva:**  
   * Tocar la letra "S" → Suena el fonema /ssss/.  
   * Tocar la sílaba "SI" → Suena /si/.  
   * Tocar el botón de "Palabra Completa" → Suena la pronunciación /silla/.

### **3\. Arquitectura Técnica (Simplificada para el MVP de 3 horas)**

┌──────────────────────────────────────────────────────────────────┐  
│                        FRONTEND (React)                          │  
│   Cámara en vivo → Botón "¿Qué es esto?" → Letras Gigantes       │  
│   → Tap en letra (reproduce sonido) → Tap en palabra (habla)     │  
└──────────────────────────┬───────────────────────────────────────┘  
                           │  
           ┌───────────────┴────────────────┐  
           ▼                                │  
  POST /api/descubrir-palabra               │  
           │                                │  
┌──────────▼────────────────────────────────▼──────────────────────┐  
│                       BACKEND (FastAPI)                          │  
│                                                                  │  
│  ┌──────────────────────────────────────────────────────────┐    │  
│  │  CAPA ÚNICA — PERCEPCIÓN Y LINGÜÍSTICA                  │    │  
│  │  Gemma 4 (visión multimodal \+ function calling)          │    │  
│  │  IN: foto del objeto                                     │    │  
│  │  OUT: JSON {objeto, palabra, silabas, fonemas}           │    │  
│  └──────────────────────────────────────────────────────────┘    │  
└─────────────────────────┬────────────────────────────────────────┘  
                           ▼  
                ┌────────────────────────┐  
                │   GEMMA 4 (E4B) local  │  
                │   vía Ollama · sin red │  
                └────────────────────────┘

### **4\. El Prompt Clave (El cerebro del sistema)**

Este prompt reemplaza la lógica matemática por extracción lingüística directa.  
SYSTEM\_ANALISIS\_LECTOESCRITURA \= """  
Eres un experto en enseñanza de lectoescritura en español para niños de preescolar.  
Tu tarea es analizar la imagen proporcionada e identificar el objeto principal, claro y común.

Reglas:  
1\. Elige una palabra concreta, de uso diario y fácil de deletrear (ej. SILLA, MESA, PERRO).  
2\. Proporciona la palabra en MAYÚSCULAS.  
3\. Separa la palabra en sílabas correctamente.  
4\. Identifica las letras individuales que componen la palabra.

Responde ÚNICAMENTE con JSON, sin markdown, usando esta estructura exacta:  
{  
  "objeto\_detectado": "descripción breve",  
  "palabra\_completa": "SILLA",  
  "silabas": \["SI", "LLA"\],  
  "letras": \["S", "I", "L", "L", "A"\]  
}  
"""

### **5\. Manejo del Sonido (Plan MVP de contingencia)**

**El problema:** La Web Speech API es excelente para leer palabras completas ("silla"), pero pésima para leer fonemas individuales (leerá "ese" en lugar de hacer el sonido /ssss/).  
**La solución para entregar HOY:**

> * **Para la palabra completa:** Usar Web Speech API normal.  
> * **Para las letras individuales:** El Frontend (React) debe mapear cada letra (A-Z) a un pequeño archivo de audio .mp3 (ej. /sounds/s.mp3, /sounds/a.mp3) que contenga el fonema correcto. *Nota para el equipo: descarguen un pack rápido de sonidos de letras en español o grábenlos ustedes mismos con el micrófono rápidamente.*

### **6\. Guion del Demo Modificado**

**0:00–0:30 — El gancho (actuado)**  
*"El problema de enseñar a leer con libros es que las palabras están atrapadas en el papel. Con 'El Explorador de Palabras', el salón de clases entero, o cualquier casa, se convierte en un libro abierto."*  
**0:30–2:30 — El demo en vivo**

> 1. (Apuntas la cámara a una **Mesa** real del venue). Presionas el botón.  
> 2. En la pantalla aparece **M E S A** en letras que ocupan todo el ancho de la tablet.  
> 3. (Tocas la **M**): Suena el archivo mp3 /mmmm/.  
> 4. (Tocas la **E**): Suena el archivo mp3 /e/.  
> 5. (Tocas la palabra completa): La API de voz lee claramente /mesa/.

**2:30–3:15 — El cierre técnico**  
*"Usamos la visión multimodal de Gemma 4 para identificar el mundo real, y el razonamiento de extracción para devolver una estructura lingüística precisa. Todo procesado localmente, convirtiendo el entorno físico del niño en su principal herramienta interactiva de alfabetización."*

### **7\. Ajuste del Plan de Ejecución (Quedan \~3 horas)**

| Hora | Objetivo | Quién   |
| :---- | :---- | :---- |
| **16:20 \- 17:00** | Backend: Ajustar el endpoint de /api/descubrir-palabra con el nuevo prompt. Frontend: Reemplazar la UI de la tarjeta por una vista de LETRAS GIGANTES mapeables. | Todos |
| **17:00 \- 17:30** | Integración de Audio: Conseguir los sonidos de fonemas (.mp3) y conectar la lógica onClick en cada letra renderizada. | Frontend |
| **17:30 \- 18:00** | Pruebas de Visión: Tomar fotos de 5 objetos del venue (Silla, Mesa, Puerta, Vaso, Mochila) y verificar que Gemma 4 devuelve el JSON correcto y sin alucinaciones. | ML / QA |
| **18:00 \- 19:00** | Redacción del Artículo de Kaggle. Adaptar el texto para enfocarse en alfabetización física (Equidad e inclusión / Educación). | Diseño / PM |
| **19:00 \- 19:30** | Grabar video de respaldo de la demo (vital). | Todos |
| **19:30 \- 19:50** | Envío final a Kaggle. | Dueño del repo |

---

**Nota final para el equipo:** Este cambio de alcance es estratégico. Han pasado de una orquestación de 4 capas a una interacción de **1 sola capa sólida**, lo cual es vital porque son más de las 4:00 PM. Ejecuten el MVP y ensayen el pitch.