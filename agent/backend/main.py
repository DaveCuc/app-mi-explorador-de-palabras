import os
import sys
import json
import base64
import re
import time
import logging
import traceback
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import requests
from dotenv import load_dotenv
import ollama

# Configure structured console logging for debugging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] [gemma_backend] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("gemma_backend")

# Load environment variables from root or backend directory .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))
load_dotenv()

app = FastAPI(title="El Explorador de Palabras - Gemma 4 Vision Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration settings
MODELO_OLLAMA = os.getenv("OLLAMA_MODEL", "gemma4:e2b")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
GEMMA_MODEL = os.getenv("GEMMA_MODEL", "gemma-4-31b-it")
USE_OLLAMA_FALLBACK = os.getenv("USE_OLLAMA_FALLBACK", "false").lower() == "true"
MOSTRAR_PENSAMIENTO = os.getenv("MOSTRAR_PENSAMIENTO", "false").lower() == "true"

SYSTEM_ANALISIS_LECTOESCRITURA = """Eres un experto sistema de visión multimodal basado en Gemma 4 para la enseñanza de lectoescritura en español.
Tu tarea es examinar la foto recibida e identificar CUALQUIER OBJETO REAL Y CONCRETO que aparezca claramente en ella (por ejemplo: CELULAR, TELEFONO, TECLADO, RATON, LAPTOP, TAZA, BOTELLA, VASO, RELOJ, ZAPATO, PLUMA, CUADERNO, MOCHILA, SILLA, MESA, PUERTA, MANZANA, PLANTA, ESFERO, etc.).

Reglas fundamentales:
1. Detecta y nombra el objeto REAL exacto que está frente a la cámara. CERO restricciones de categoría.
2. Escribe la palabra en ESPAÑOL, en MAYÚSCULAS y sin tildes ni caracteres especiales.
3. Separa la palabra en sus sílabas gramaticales correctas.
4. Entrega la lista de letras individuales que conforman la palabra.
5. Mantén tu razonamiento interno de forma concisa y directa para generar rápidamente el JSON.

Responde ÚNICAMENTE con la estructura JSON requerida sin markdown:
{
  "objeto_detectado": "un celular o teléfono inteligente",
  "palabra_completa": "CELULAR",
  "silabas": ["CE", "LU", "LAR"],
  "letras": ["C", "E", "L", "U", "L", "A", "R"]
}"""

class RespuestaPalabra(BaseModel):
    objeto_detectado: str
    palabra_completa: str
    silabas: List[str]
    letras: List[str]
    pensamiento: Optional[str] = None

class RequestBase64(BaseModel):
    imagen_b64: str

def es_api_key_valida(api_key: Optional[str]) -> bool:
    if not api_key or not api_key.strip():
        return False
    clean = api_key.strip()
    if clean.startswith("tu_api_key") or len(clean) < 20:
        return False
    if not clean.startswith("AIzaSy"):
        logger.warning(f"[API KEY CHECK] La API Key ('{clean[:8]}...') no tiene el formato estándar de Google AI Studio (debe iniciar con AIzaSy...). Se usará Ollama Local por defecto.")
        return False
    return True

# Middleware for request tracing to detect lost routing and performance
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    path = request.url.path
    method = request.method
    client_ip = request.client.host if request.client else "desconocido"
    
    logger.info(f"[HTTP IN] {method} {path} desde {client_ip}")
    
    response = await call_next(request)
    
    process_time = (time.time() - start_time) * 1000
    status_code = response.status_code
    
    if status_code >= 400:
        logger.warning(f"[HTTP OUT] {method} {path} -> Status {status_code} ({process_time:.2f}ms)")
    else:
        logger.info(f"[HTTP OUT] {method} {path} -> Status {status_code} ({process_time:.2f}ms)")
        
    return response

# Custom 404 handler to log and diagnose lost routing
@app.exception_handler(404)
async def custom_404_handler(request: Request, exc: Exception):
    path = request.url.path
    method = request.method
    logger.error(f"[RUTEO PERDIDO / 404] {method} {path} no coincide con ningún endpoint registrado.")
    logger.info("Endpoints válidos: GET /, GET /api/salud, POST /api/descubrir-palabra, POST /api/descubrir-palabra-file")
    return JSONResponse(
        status_code=404,
        content={
            "error": "Ruta no encontrada (404)",
            "path_solicitado": path,
            "metodo": method,
            "mensaje": "Verifica que el frontend apunte a http://<host>:8000/api/descubrir-palabra",
            "endpoints_validos": ["/api/descubrir-palabra", "/api/descubrir-palabra-file", "/api/salud"]
        }
    )

def parsear_json_limpio(texto: str) -> dict:
    limpio = texto.strip()
    if "```json" in limpio:
        limpio = limpio.split("```json")[1].split("```")[0]
    elif "```" in limpio:
        limpio = limpio.split("```")[1].split("```")[0]
    limpio = limpio.strip()
    return json.loads(limpio)

def separar_silabas_fallback(palabra: str) -> List[str]:
    palabra = palabra.upper().strip()
    if not palabra:
        return []
    
    vocales = "AEIOUÁÉÍÓÚ"
    silabas = []
    actual = ""
    
    for i, char in enumerate(palabra):
        actual += char
        if char in vocales:
            if i + 2 < len(palabra) and palabra[i+1] not in vocales and palabra[i+2] in vocales:
                silabas.append(actual)
                actual = ""
    if actual:
        if silabas:
            silabas[-1] += actual
        else:
            silabas.append(actual)
    return silabas if silabas else [palabra]

def parsear_y_estructurar_respuesta(content: str, pensamiento: Optional[str] = None) -> RespuestaPalabra:
    if not content or not content.strip():
        logger.error("[ERROR PARSE] Se recibió contenido vacío de Gemma 4.")
        raise HTTPException(
            status_code=422,
            detail="Gemma 4 no devolvió texto en la respuesta."
        )

    pensamiento_final = pensamiento if MOSTRAR_PENSAMIENTO else None

    # 1. Intentar parsear como JSON estructurado
    try:
        data = parsear_json_limpio(content)
        palabra = data.get("palabra_completa", "").strip().upper()
        palabra = re.sub(r'[^A-ZÑ]', '', palabra)
        if palabra:
            objeto_desc = data.get("objeto_detectado", f"un {palabra.lower()}")
            silabas = data.get("silabas")
            if not silabas or not isinstance(silabas, list):
                silabas = separar_silabas_fallback(palabra)
            return RespuestaPalabra(
                objeto_detectado=objeto_desc,
                palabra_completa=palabra,
                silabas=silabas,
                letras=[c for c in palabra],
                pensamiento=pensamiento_final
            )
    except Exception as json_err:
        logger.warning(f"[WARN PARSE] No se pudo parsear JSON directo ({json_err}). Aplicando extracción por expresiones regulares...")

    # 2. Fallback: Limpiar caracteres especiales/emojis y buscar palabras significativas
    texto_limpio = re.sub(r'[^\w\s]', ' ', content, flags=re.UNICODE).upper()
    palabras_coincidentes = re.findall(r'\b[A-ZÑ]{2,20}\b', texto_limpio)
    
    # Palabras a ignorar de respuestas conversacionales
    palabras_ignorar = {"HOLA", "ESTE", "ESTA", "FOTO", "OBJETO", "IMAGEN", "AQUI", "VER", "VEO", "JSON", "RESPUESTA", "SÍLABAS", "LETRAS"}
    candidatas = [p for p in palabras_coincidentes if p not in palabras_ignorar]

    if candidatas:
        p = candidatas[0]
        logger.info(f"[RECOVERY PARSE] Palabra clave extraída con éxito: '{p}' desde contenido ({len(content)} chars)")
        return RespuestaPalabra(
            objeto_detectado=f"un {p.lower()}",
            palabra_completa=p,
            silabas=separar_silabas_fallback(p),
            letras=[c for c in p],
            pensamiento=pensamiento_final
        )

    if palabras_coincidentes:
        p = palabras_coincidentes[0]
        logger.info(f"[RECOVERY PARSE] Palabra recuperada: '{p}'")
        return RespuestaPalabra(
            objeto_detectado=f"un {p.lower()}",
            palabra_completa=p,
            silabas=separar_silabas_fallback(p),
            letras=[c for c in p],
            pensamiento=pensamiento_final
        )

    logger.error(f"[ERROR PARSE] Imposible extraer ninguna palabra válida del contenido: '{content}'")
    raise HTTPException(
        status_code=422,
        detail="Gemma 4 no pudo distinguir un objeto claro en la foto. Por favor acerca la cámara al objeto y asegúrate de tener buena luz."
    )

def extraer_y_validar_b64(imagen_b64_raw: str) -> tuple[str, str]:
    if not imagen_b64_raw or not imagen_b64_raw.strip():
        logger.error("[ERROR IMAGEN] Se recibió una cadena de imagen vacía o nula.")
        raise HTTPException(status_code=400, detail="No se recibió ninguna imagen Base64.")

    clean_b64 = imagen_b64_raw.strip()
    mime_type = "image/jpeg"  # Por defecto

    # Detectar data URI (ej. data:image/png;base64,iVBORw0KG...)
    if clean_b64.startswith("data:"):
        match = re.match(r"^data:(image/[a-zA-Z0-9\+\-\.]+);base64,", clean_b64)
        if match:
            mime_type = match.group(1)
            logger.info(f"[IMAGEN B64] MIME type detectado desde Data URI: {mime_type}")
        parts = clean_b64.split(",", 1)
        if len(parts) > 1:
            clean_b64 = parts[1].strip()

    # Limpiar espacios en blanco innecesarios
    clean_b64 = re.sub(r"\s+", "", clean_b64)
    len_chars = len(clean_b64)
    preview = clean_b64[:30] + "..." if len_chars > 30 else clean_b64

    logger.info(f"[IMAGEN B64] Cadena recibida: {len_chars} caracteres. Vista previa: '{preview}'")

    # Validar decodificación Base64
    try:
        decoded_bytes = base64.b64decode(clean_b64, validate=True)
        size_kb = len(decoded_bytes) / 1024
        logger.info(f"[IMAGEN B64] Base64 decodificado correctamente. Tamaño: {size_kb:.2f} KB ({mime_type})")
    except Exception as b64_err:
        logger.error(f"[ERROR IMAGEN] Falló la validación del formato Base64: {b64_err}")
        raise HTTPException(
            status_code=400,
            detail=f"La imagen enviada no es un Base64 válido. Error: {str(b64_err)}"
        )

    # Breakpoint opcional para depuración interactiva
    if os.getenv("ENABLE_BREAKPOINT", "false").lower() == "true" or os.getenv("DEBUG_MODE", "false").lower() == "true":
        logger.info("[DEBUG BREAKPOINT] Pausando ejecución para depuración interactiva...")
        breakpoint()

    return clean_b64, mime_type

def procesar_con_google_ai_studio(clean_b64: str, mime_type: str, api_key: str, model_name: str) -> RespuestaPalabra:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
    
    payload = {
        "systemInstruction": {
            "parts": [{"text": SYSTEM_ANALISIS_LECTOESCRITURA}]
        },
        "contents": [
            {
                "parts": [
                    {"text": "¿Qué objeto principal hay en esta foto? Analízalo para lectoescritura."},
                    {
                        "inline_data": {
                            "mime_type": mime_type,
                            "data": clean_b64
                        }
                    }
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.1,
            "responseMimeType": "application/json"
        }
    }

    logger.info(f"[GOOGLE AI STUDIO] Enviando solicitud a API. Modelo: '{model_name}', MIME: '{mime_type}'...")
    
    try:
        res = requests.post(url, json=payload, headers={"Content-Type": "application/json"}, timeout=30)
    except requests.exceptions.RequestException as req_err:
        logger.error(f"[ERROR GOOGLE AI STUDIO] Excepción de red al conectar con Google AI Studio: {req_err}")
        logger.warning("[FALLBACK AUTOMÁTICO] Conexión de red fallida con Google AI Studio API. Intentando Ollama local...")
        return procesar_con_ollama(clean_b64)

    if not res.ok:
        err_detail = f"Error HTTP {res.status_code} desde Google AI Studio API: {res.text}"
        logger.error(f"[ERROR GOOGLE AI STUDIO] {err_detail}")
        
        # Si la API Key no es válida (HTTP 400 / 403), activar fallback automático a Ollama local
        if res.status_code in [400, 401, 403]:
            logger.warning(f"[FALLBACK AUTOMÁTICO] Google AI Studio rechazó la API Key (HTTP {res.status_code}). Redirigiendo solicitud a Ollama local ({MODELO_OLLAMA})...")
            return procesar_con_ollama(clean_b64)
            
        raise HTTPException(status_code=res.status_code, detail=err_detail)

    data = res.json()
    logger.info("[GOOGLE AI STUDIO] Respuesta HTTP 200 recibida exitosamente. Analizando estructura JSON...")

    try:
        candidates = data.get("candidates", [])
        if not candidates:
            prompt_feedback = data.get("promptFeedback", {})
            logger.error(f"[ERROR GOOGLE AI STUDIO] No se recibieron 'candidates' en la respuesta. PromptFeedback: {json.dumps(prompt_feedback)}")
            raise HTTPException(
                status_code=422,
                detail=f"Google AI Studio no devolvió candidatos válidos. Detalle: {prompt_feedback}"
            )

        candidate = candidates[0]
        finish_reason = candidate.get("finishReason", "UNKNOWN")
        logger.info(f"[GOOGLE AI STUDIO] candidate finishReason: '{finish_reason}'")

        if finish_reason in ["SAFETY", "RECITATION", "BLOCKLIST"]:
            safety_ratings = candidate.get("safetyRatings", [])
            logger.error(f"[ERROR GOOGLE AI STUDIO] Respuesta bloqueada por políticas ({finish_reason}). SafetyRatings: {safety_ratings}")
            raise HTTPException(
                status_code=422,
                detail=f"La imagen o prompt fue bloqueado por filtros de seguridad ({finish_reason})."
            )

        content_parts = candidate.get("content", {}).get("parts", [])
        if not content_parts:
            logger.error(f"[ERROR GOOGLE AI STUDIO] No se encontraron 'parts' en candidate: {json.dumps(candidate)}")
            raise HTTPException(status_code=422, detail="Estructura inesperada en el contenido devuelto por Google AI Studio.")

        # Extraer partes de razonamiento interno ('thought': True) de Gemma 4
        thought_parts = [p.get("text", "") for p in content_parts if p.get("thought", False) and "text" in p]
        pensamiento_texto = "\n".join(thought_parts).strip() if thought_parts else None

        if pensamiento_texto and MOSTRAR_PENSAMIENTO:
            logger.info(f"🧠 [PENSAMIENTO GEMMA 4 API]\n{pensamiento_texto}")

        non_thought_parts = [p for p in content_parts if not p.get("thought", False) and "text" in p]
        if non_thought_parts:
            content_text = non_thought_parts[-1]["text"]
        elif "text" in content_parts[0]:
            content_text = content_parts[0]["text"]
        else:
            raise HTTPException(status_code=422, detail="No se encontró texto en las partes del candidate de Gemma 4.")

        logger.info(f"[SUCCESS GOOGLE AI STUDIO] Texto procesado recibido ({len(content_text)} chars): {content_text}")
        return parsear_y_estructurar_respuesta(content_text, pensamiento=pensamiento_texto)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR GOOGLE AI STUDIO] Excepción procesando la respuesta: {e}")
        logger.error(f"[TRACEBACK]\n{traceback.format_exc()}")
        logger.error(f"[RAW JSON RESPONSE]\n{json.dumps(data, indent=2)}")
        raise HTTPException(status_code=422, detail=f"Error al procesar respuesta de Google AI Studio: {str(e)}")

def procesar_con_ollama(clean_b64: str) -> RespuestaPalabra:
    logger.info(f"[OLLAMA GPU RTX 5070] Enviando foto Base64 ({len(clean_b64)} chars) al modelo local Ollama ({MODELO_OLLAMA})...")
    try:
        prompt_completo = (
            f"{SYSTEM_ANALISIS_LECTOESCRITURA}\n\n"
            f"INSTRUCCIÓN: Observa la imagen adjunta. Identifica el objeto principal y responde ÚNICAMENTE con el objeto JSON."
        )
        response = ollama.chat(
            model=MODELO_OLLAMA,
            messages=[
                {
                    "role": "user",
                    "content": prompt_completo,
                    "images": [clean_b64]
                }
            ],
            options={
                "temperature": 0.1,
                "top_p": 0.9,
                "num_predict": 1536,  # Aumentado para dar espacio suficiente a razonamiento + JSON completo
                "num_ctx": 4096,
                "num_gpu": 99  # Aceleración GPU NVIDIA CUDA (RTX 5070)
            }
        )

        raw_content = response["message"]["content"]
        logger.info(f"[OLLAMA LOCAL] Respuesta cruda recibida ({len(raw_content)} chars): '{raw_content}'")

        # Extraer pensamiento interno si existe en etiquetas <think>...</think> (cerradas o incompletas)
        pensamiento_match = re.search(r'<think>(.*?)(?:</think>|$)', raw_content, flags=re.DOTALL)
        pensamiento_texto = pensamiento_match.group(1).strip() if pensamiento_match else None

        if pensamiento_texto and MOSTRAR_PENSAMIENTO:
            logger.info(f"🧠 [PENSAMIENTO GEMMA 4 OLLAMA]\n{pensamiento_texto}")

        # 1. Intentar limpiar cualquier bloque de pensamiento <think>...</think> o <think>...
        clean_content = re.sub(r'<think>.*?(?:</think>|$)', '', raw_content, flags=re.DOTALL).strip()

        # 2. Si no hay contenido limpio o no se cerró el pensamiento, extraer directamente la estructura JSON con Regex
        if not clean_content or "{" not in clean_content:
            json_match = re.search(r'\{[^{}]*"(?:palabra_completa|objeto_detectado)"[^{}]*\}', raw_content, flags=re.DOTALL)
            if not json_match:
                json_match = re.search(r'\{.*\}', raw_content, flags=re.DOTALL)
            if json_match:
                clean_content = json_match.group(0).strip()
                logger.info(f"[OLLAMA RECOVERY] JSON extraído por Regex ({len(clean_content)} chars): {clean_content}")

        if not clean_content:
            logger.warning("[OLLAMA LOCAL] Respuesta vacía tras parsear. Reintentando con prompt directo...")
            response_retry = ollama.chat(
                model=MODELO_OLLAMA,
                messages=[
                    {
                        "role": "user",
                        "content": "¿Qué objeto ves en esta foto? Responde ÚNICAMENTE con el objeto en una sola palabra en mayúsculas en español (ejemplo: CELULAR, TAZA, RELOJ).",
                        "images": [clean_b64]
                    }
                ],
                options={
                    "temperature": 0.1,
                    "num_predict": 512,
                    "num_gpu": 99
                }
            )
            clean_content = response_retry["message"]["content"].strip()
            logger.info(f"[OLLAMA REINTENTO] Respuesta: '{clean_content}'")

        return parsear_y_estructurar_respuesta(clean_content, pensamiento=pensamiento_texto)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"[ERROR OLLAMA LOCAL] Error al ejecutar inferencia local con Ollama ({MODELO_OLLAMA}): {e}")
        logger.error(f"[TRACEBACK]\n{traceback.format_exc()}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el servidor local Ollama ({MODELO_OLLAMA}): {str(e)}. Verifica que Ollama esté corriendo en tu sistema."
        )

def procesar_con_gemma4(imagen_b64_raw: str) -> RespuestaPalabra:
    clean_b64, mime_type = extraer_y_validar_b64(imagen_b64_raw)

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    has_valid_key = es_api_key_valida(api_key)
    use_api = has_valid_key and not USE_OLLAMA_FALLBACK

    logger.info(f"[PROCESAMIENTO GEMMA] Proveedor configurado: {'Google AI Studio API' if use_api else 'Ollama Local'}")

    if use_api:
        return procesar_con_google_ai_studio(clean_b64, mime_type, api_key.strip(), GEMMA_MODEL)
    else:
        return procesar_con_ollama(clean_b64)

@app.get("/")
def read_root():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    has_api_key = es_api_key_valida(api_key)
    return {
        "status": "online",
        "app": "El Explorador de Palabras",
        "provider": "Google AI Studio API" if (has_api_key and not USE_OLLAMA_FALLBACK) else "Ollama Local",
        "model": GEMMA_MODEL if (has_api_key and not USE_OLLAMA_FALLBACK) else MODELO_OLLAMA,
        "has_api_key": has_api_key,
        "use_ollama_fallback": USE_OLLAMA_FALLBACK,
        "mostrar_pensamiento": MOSTRAR_PENSAMIENTO,
        "endpoints": [
            "GET /",
            "GET /api/salud",
            "POST /api/descubrir-palabra",
            "POST /api/descubrir-palabra-file"
        ]
    }

@app.get("/api/salud")
def health_check():
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    has_api_key = es_api_key_valida(api_key)
    return {
        "status": "ok",
        "backend": "FastAPI Gemma 4 Vision",
        "provider_activo": "Google AI Studio API" if (has_api_key and not USE_OLLAMA_FALLBACK) else "Ollama Local",
        "modelo_activo": GEMMA_MODEL if (has_api_key and not USE_OLLAMA_FALLBACK) else MODELO_OLLAMA,
        "gemini_key_configurada": has_api_key
    }

@app.post("/api/descubrir-palabra", response_model=RespuestaPalabra)
async def descubrir_palabra_json(payload: RequestBase64):
    return procesar_con_gemma4(payload.imagen_b64)

@app.post("/api/descubrir-palabra-file", response_model=RespuestaPalabra)
async def descubrir_palabra_file(foto: UploadFile = File(...)):
    contenido = await foto.read()
    b64_str = base64.b64encode(contenido).decode('utf-8')
    return procesar_con_gemma4(b64_str)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
