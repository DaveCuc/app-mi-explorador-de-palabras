# 📚 Centro de Documentación (Marco Diátaxis)

Bienvenido a la documentación oficial de **"Mi Explorador de Palabras"** (`hackday`), estructurada bajo el estándar internacional **[Diátaxis Framework](https://diataxis.fr/)**.

El sistema de documentación está dividido en **4 cuadrantes distintos**, cada uno orientado a una necesidad específica de aprendizaje o consulta:

---

## 🗂️ Cuadrantes de Documentación

### 🎓 1. [Tutoriales](./01-tutorials/primer-descubrimiento.md) *(Orientado al Aprendizaje)*
Lecciones prácticas dirigidas a principiantes para lograr un objetivo de aprendizaje claro.
- 🚀 **[Tu Primer Descubrimiento de Objeto](./01-tutorials/primer-descubrimiento.md)**: Guía paso a paso desde el inicio hasta la captura de tu primera foto y lectura fonética.

### 📖 2. Guías de Uso - How-To *(Orientadas a Problemas / Recetas)*
Instrucciones paso a paso para resolver un problema o configurar una tarea específica.
- ⚡ **[Configurar Ollama Local con Gemma 4](./02-how-to/configurar-ollama-local.md)**: Cómo iniciar y verificar el motor de inferencia local por GPU.
- 🧠 **[Inspeccionar el Pensamiento Interno en F12](./02-how-to/inspeccionar-pensamiento-f12.md)**: Guía para habilitar `MOSTRAR_PENSAMIENTO=true` y ver la consola DevTools.


### 🔬 3. Referencia Técnica *(Orientada a Información)*
Descripción técnica detallada de la arquitectura, esquemas de datos, APIs y configuraciones.
- 📡 **[Endpoints REST y Esquemas Pydantic](./03-reference/api-endpoints.md)**: Especificación de la API `/api/descubrir-palabra` y tipos TypeScript/Python.
- ⚙️ **[Variables de Entorno (`.env`)](./03-reference/variables-entorno.md)**: Diccionario completo de parámetros de configuración e inferencia.

### 🧠 4. Explicación y Arquitectura *(Orientada a la Comprensión)*
Discusiones conceptuales a fondo sobre las decisiones de diseño, el pipeline multimodal y diagramas visuales.
- 🏗️ **[Arquitectura y Pipeline Multimodal](./04-explanation/arquitectura-y-pipeline.md)**: Diagramas Mermaid (Flowchart y Secuencia), estrategia de tolerancia a fallos (Failover) y motor de silabificación.

---

*Diseñado para la plataforma de aprendizaje de lectoescritura con Gemma 4 (2026).*
