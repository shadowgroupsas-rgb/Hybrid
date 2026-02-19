# Copower Overtime Tracking App

Este repositorio contiene el código fuente para el sistema de seguimiento de horas extras de Copower.

## Arquitectura

El sistema sigue una arquitectura híbrida moderna diseñada para escalabilidad y facilidad de mantenimiento.

### Stack Tecnológico

*   **Mobile (Frontend):** Flutter.
    *   Generación nativa para iOS y Android.
    *   Manejo eficiente de GPS en segundo plano.
*   **Backend (API):** Node.js con NestJS.
    *   Framework modular y estructurado.
    *   Manejo de I/O concurrente para múltiples empleados.
*   **Base de Datos:** PostgreSQL con PostGIS.
    *   Consistencia ACID.
    *   Cálculos geoespaciales precisos (`ST_DWithin`) para geofencing.
*   **Infraestructura:** AWS.
    *   **Hosting:** AWS App Runner.
    *   **DB:** Amazon RDS.
    *   **DNS:** Route 53.
*   **Admin Panel:** AdminJS.
    *   Panel administrativo autogenerado para gestión rápida de datos.

### Estructura del Proyecto

*   `/backend`: API RESTful en NestJS.
*   `/mobile`: (Futuro) Código fuente de la aplicación Flutter.

## Configuración Local

1.  Asegúrate de tener Docker y Node.js instalados.
2.  Clona el repositorio.
3.  Ejecuta `docker-compose up -d` para levantar la base de datos PostgreSQL + PostGIS.
4.  Entra a la carpeta `backend` y ejecuta `npm install`.
5.  Ejecuta `npm run start:dev` para iniciar el servidor de desarrollo.

## Integraciones

*   **Cataleya:** Endpoint dedicado (`/integrations/cataleya`) protegido por API Key para lectura de registros.
