# Guía Definitiva de Desarrollo Local (Sin instalar PostgreSQL)

Esta guía explica cómo ejecutar el sistema **Cronos** en tu computadora personal (Windows 11, Mac o Linux) sin instalar PostgreSQL manualmente. **Docker** se encargará de todo.

---

## 1. Requisitos Previos

### 1.1. Instalar Docker Desktop
Docker es el motor que ejecutará tu base de datos y tu backend en "contenedores" separados.
*   **Windows:** [Descargar Docker Desktop](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe).
    *   *Nota:* Asegúrate de marcar "Install required Windows components for WSL 2" si te lo pide.
*   **Mac:** [Descargar Docker Desktop](https://www.docker.com/products/docker-desktop/).
*   **Linux:** Sigue instrucciones oficiales.

**Verificación:** Abre Docker Desktop y espera a que el icono esté verde ("Engine running").

---

## 2. Preparar el Proyecto

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO> cronos-backend
    cd cronos-backend
    ```

2.  **Configurar Variables de Entorno (.env):**
    El sistema necesita este archivo para funcionar.

    *   **Opción A (Rápida):** Copia el archivo de ejemplo.
        *   Windows: `copy .env.example .env`
        *   Mac/Linux: `cp .env.example .env`

    *   **Opción B (Manual):** Crea un archivo `.env` y pega esto:
        ```env
        POSTGRES_USER=postgres
        POSTGRES_PASSWORD=postgres
        POSTGRES_DB=cronos_dev
        PORT=3000
        NODE_ENV=development
        TZ=America/Bogota
        DB_HOST=db
        DB_PORT=5432
        DB_SSL=false
        DB_SYNC=true
        JWT_SECRET=secreto_local
        SESSION_SECRET=secreto_session
        ADMIN_EMAIL=admin@copower.com
        ADMIN_PASSWORD=admin
        ```

---

## 3. Ejecutar el Sistema

1.  En tu terminal (dentro de `cronos-backend`), ejecuta:
    ```bash
    docker compose up --build
    ```

2.  **¿Qué esperar?**
    *   Docker descargará PostgreSQL y Node.js.
    *   Instalará las librerías del backend.
    *   Si ves errores amarillos (`warning`), ignóralos por ahora.
    *   Espera el mensaje: `Nest application successfully started`.

---

## 4. Acceder al Sistema

*   **Panel Administrativo:** [http://localhost:3000/admin](http://localhost:3000/admin)
    *   Usuario: `admin@copower.com`
    *   Contraseña: `admin`

*   **Base de Datos (DBeaver/PgAdmin):**
    *   Host: `localhost`
    *   Port: `5432`
    *   User/Pass: `postgres` / `postgres`
    *   DB: `cronos_dev`

---

## 5. Solución de Problemas (Troubleshooting)

### Error: "Could not find TypeScript configuration file tsconfig.json"
*   **Causa:** Docker no copió bien los archivos.
*   **Solución:**
    1.  Asegúrate de estar en la carpeta raíz `cronos-backend`.
    2.  Verifica que exista la carpeta `backend` y dentro tenga `tsconfig.json`.
    3.  Ejecuta `docker compose build --no-cache` para forzar la recarga.

### Error: "Bind for 0.0.0.0:5432 failed"
*   **Causa:** Ya tienes otro Postgres corriendo.
*   **Solución:** Detenlo en los Servicios de Windows o cambia el puerto en `docker-compose.yml` a `5433:5432`.

### Error: "POSTGRES_PASSWORD variable is not set"
*   **Causa:** No creaste el archivo `.env`.
*   **Solución:** Sigue el paso 2 de esta guía. (El sistema usará valores por defecto, pero es mejor tener el archivo).
