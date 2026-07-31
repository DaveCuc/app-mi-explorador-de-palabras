import os
import json
import base64
import re
from typing import List, Optional
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import ollama

app = FastAPI(title="El Explorador de Palabras - Gemma 4 Vision Real Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELO = "gemma4:e2b"

SYSTEM_ANALISIS_LECTOESCRITURA = """Eres un experto sistema de visión multimodal basado en Gemma 4 para la enseñanza de lectoescritura en español.
Tu tarea es examinar la foto recibida e identificar CUALQUIER OBJETO REAL Y CONCRETO que aparezca claramente en ella (por ejemplo: CELULAR, TELEFONO, TECLADO, RATON, LAPTOP, TAZA, BOTELLA, VASO, RELOJ, ZAPATO, PLUMA, CUADERNO, MOCHILA, SILLA, MESA, PUERTA, MANZANA, PLANTA, ESFERO, etc.).

Reglas fundamentales:
1. Detecta y nombra el objeto REAL exacto que está frente a la cámara. CERO restricciones de categoría.
2. Escribe la palabra en ESPAÑOL, en MAYÚSCULAS y sin tildes ni caracteres especiales.
3. Separa la palabra en sus sílabas gramaticales correctas.
4. Entrega la lista de letras individuales que conforman la palabra.

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

class RequestBase64(BaseModel):
    imagen_b64: str

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

def procesar_con_gemma4(imagen_b64_raw: str) -> RespuestaPalabra:
    if not imagen_b64_raw or len(imagen_b64_raw.strip()) == 0:
        raise HTTPException(status_code=400, detail="No se recibio ninguna imagen Base64.")

    clean_b64 = imagen_b64_raw
    if "," in clean_b64:
        clean_b64 = clean_b64.split(",")[1]

    clean_b64 = clean_b64.strip()
    print(f"[INFO] Enviando foto Base64 ({len(clean_b64)} chars) a Gemma 4...")

    try:
        response = ollama.chat(
            model=MODELO,
            messages=[
                {"role": "system", "content": SYSTEM_ANALISIS_LECTOESCRITURA},
                {
                    "role": "user",
                    "content": "¿Qué objeto principal hay en esta foto? Analízalo para lectoescritura.",
                    "images": [clean_b64]
                }
            ],
            options={"temperature": 0.1, "num_predict": 120}
        )

        content = response["message"]["content"]
        print(f"[SUCCESS] Respuesta de Gemma 4 recibida correctamente.")

        try:
            data = parsear_json_limpio(content)
            palabra = data.get("palabra_completa", "").strip().upper()
            palabra = re.sub(r'[^A-ZÑ]', '', palabra)
            
            if not palabra:
                raise ValueError("Palabra no valida")

            objeto_desc = data.get("objeto_detectado", f"un {palabra.lower()}")
            silabas = data.get("silabas")
            if not silabas or not isinstance(silabas, list):
                silabas = separar_silabas_fallback(palabra)
            
            letras = [char for char in palabra]

            return RespuestaPalabra(
                objeto_detectado=objeto_desc,
                palabra_completa=palabra,
                silabas=silabas,
                letras=letras
            )
        except Exception as json_err:
            print(f"[WARN] Fallback parse regex: {json_err}")
            palabras_coincidentes = re.findall(r'\b[A-ZÑ]{3,15}\b', content.upper())
            if palabras_coincidentes:
                p = palabras_coincidentes[0]
                return RespuestaPalabra(
                    objeto_detectado=f"un {p.lower()}",
                    palabra_completa=p,
                    silabas=separar_silabas_fallback(p),
                    letras=[c for c in p]
                )
            raise HTTPException(
                status_code=422,
                detail="Gemma 4 no pudo distinguir un objeto claro en la foto. Por favor acerca la cámara al objeto y asegúrate de tener buena luz."
            )

    except HTTPException:
        raise
    except Exception as e:
        print(f"[ERROR] Error en Ollama Gemma 4: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el modelo Gemma 4 local: {str(e)}"
        )

@app.get("/")
def read_root():
    return {
        "status": "online",
        "app": "El Explorador de Palabras",
        "model": MODELO
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
