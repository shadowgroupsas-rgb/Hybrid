# AGENTS.md

Este archivo contiene instrucciones para agentes de IA y desarrolladores trabajando en este repositorio.

## Convenciones de Código

1.  **Idioma:**
    *   **Código:** Variables, funciones, clases y comentarios de código deben estar en **Inglés**.
    *   **Documentación:** `README.md`, wikis y explicaciones de negocio deben estar en **Español** (idioma principal de Copower).

2.  **Backend (NestJS):**
    *   Seguir estrictamente la arquitectura modular de NestJS.
    *   Usar `TypeORM` para la interacción con la base de datos.
    *   Usar DTOs (Data Transfer Objects) para validación de entrada.
    *   Los controladores deben ser ligeros; la lógica de negocio va en los Servicios.

3.  **Seguridad:**
    *   Nunca commitear `.env` files.
    *   Las integraciones externas deben estar protegidas (ej. API Key Guard).

4.  **Base de Datos:**
    *   Usar tipos geoespaciales (`Geometry`) para coordenadas.
    *   No realizar cálculos complejos en el cliente móvil; delegar al backend o base de datos.
