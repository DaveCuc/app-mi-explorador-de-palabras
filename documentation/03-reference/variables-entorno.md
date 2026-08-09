# 🔬 Referencia Técnica: Variables de Entorno (`.env`)

**Propósito:** Diccionario exhaustivo de todas las opciones de configuración configurables mediante el archivo `.env`.

---

## ⚙️ Variables de Configuración

| Variable | Tipo | Valor Predeterminado | Descripción |
| :--- | :--- | :--- | :--- |
| `OLLAMA_MODEL` | `string` | `gemma4:e2b` | Nombre del modelo registrado en Ollama para inferencia multimodal local. |
| `USE_OLLAMA_FALLBACK` | `boolean` | `true` | `true` fuerza el uso del motor local Ollama en lugar de consumir la API de la nube. |
| `MOSTRAR_PENSAMIENTO` | `boolean` | `true` | Activa la extracción e impresión del razonamiento interno (**Thinking Mode**) en F12 y consola. |
| `GEMINI_API_KEY` | `string` | `""` | API Key de Google AI Studio (inicia con `AIzaSy...`) para proveedor Cloud. |
| `GEMMA_MODEL` | `string` | `gemma-4-31b-it` | Nombre del modelo en la nube para Google AI Studio. |

---

## 📊 Parámetros de Inferencia en Backend Python

Los parámetros de generación de Ollama están definidos en `agent/backend/main.py`:

```python
options = {
    "temperature": 0.1,    # Inferencia determinista de baja varianza
    "top_p": 0.9,          # Filtrado de núcleo para respuestas estables
    "num_predict": 1536,   # Límite máximo de tokens (suficiente para pensamiento + JSON)
    "num_ctx": 4096,       # Tamaño de la ventana de contexto
    "num_gpu": 99          # Habilita la aceleración GPU completa en CUDA
}
```
