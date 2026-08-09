# 📖 Guía (How-To): Configurar e Iniciar Ollama Local con Gemma 4

**Problema:** Deseas ejecutar la aplicación completamente fuera de línea (offline) en tu GPU local mediante **Ollama** con el modelo `gemma4:e2b`.

---

## 🛠️ Pasos de Configuración

### 1. Iniciar el Daemon de Ollama
Abre una terminal y ejecuta:
```bash
ollama serve
```
> *(El servidor comenzará a escuchar en `http://localhost:11434`).*

### 2. Descargar o Verificar la Presencia del Modelo
En una segunda terminal, descarga la variante ligera multimodal de Gemma 4:
```bash
ollama pull gemma4:e2b
```

Para listar los modelos instalados y confirmar su digest:
```bash
ollama list
```
Debe figurar: `gemma4:e2b` (aprox. 7.2 GB).

### 3. Configurar las Variables de Entorno (`.env`)
En la raíz de tu proyecto, edita o crea el archivo `.env`:
```env
OLLAMA_MODEL=gemma4:e2b
USE_OLLAMA_FALLBACK=true
```

---

## 🧪 Verificación de Funcionamiento

Ejecuta el siguiente comando en Python para verificar la conexión directa:
```python
import requests
res = requests.get('http://localhost:11434/api/tags')
print(res.json())
```
Si devuelve la lista con `gemma4:e2b`, la configuración local está 100% lista.
