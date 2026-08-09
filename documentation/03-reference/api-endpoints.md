# 🔬 Referencia Técnica: Endpoints REST y Esquemas Pydantic

**Propósito:** Documentación orientada a la especificación técnica de la API backend en FastAPI (`http://localhost:8000`).

---

## 📡 Endpoints Disponibles

### 1. `POST /api/descubrir-palabra`
Procesa una imagen en formato Base64 para analizar el objeto con Gemma 4.

- **Headers**: `Content-Type: application/json`
- **Body Payload**:
  ```json
  {
    "imagen_b64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ..."
  }
  ```
- **Respuesta de Éxito (HTTP 200 OK)**:
  ```json
  {
    "objeto_detectado": "un celular o teléfono inteligente",
    "palabra_completa": "CELULAR",
    "silabas": ["CE", "LU", "LAR"],
    "letras": ["C", "E", "L", "U", "L", "A", "R"],
    "pensamiento": "Observo un objeto celular rectangular..."
  }
  ```

---

### 2. `GET /`
Endpoint de verificación del servidor y estado del proveedor de IA.

- **Respuesta (HTTP 200 OK)**:
  ```json
  {
    "status": "online",
    "app": "El Explorador de Palabras",
    "provider": "Ollama Local",
    "model": "gemma4:e2b",
    "has_api_key": false,
    "use_ollama_fallback": true,
    "mostrar_pensamiento": true
  }
  ```

---

## 📐 Esquemas Pydantic / TypeScript

### Modelo Backend (`RespuestaPalabra`) - Python
```python
class RespuestaPalabra(BaseModel):
    objeto_detectado: str
    palabra_completa: str
    silabas: List[str]
    letras: List[str]
    pensamiento: Optional[str] = None
```

### Interface Frontend (`WordData`) - TypeScript
```typescript
interface WordData {
  objeto_detectado: string;
  palabra_completa: string;
  silabas: string[];
  letras: string[];
  pensamiento?: string;
}
```
