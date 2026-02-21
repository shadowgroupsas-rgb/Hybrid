# Guía Definitiva de Desarrollo Local (Sin instalar PostgreSQL)

Esta guía explica cómo ejecutar el sistema **Cronos** en tu computadora personal (Windows 11, Mac o Linux) sin instalar PostgreSQL manualmente. **Docker** se encargará de crear una base de datos aislada y segura para ti.

---

## 1. Requisitos Previos

### 1.1. Instalar Docker Desktop
Docker es el motor que ejecutará tu base de datos y tu backend en "contenedores" separados.
*   **Windows:** [Descargar Docker Desktop para Windows](https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe).
    *   *Nota:* Durante la instalación, asegúrate de marcar "Install required Windows components for WSL 2" si te lo pide.
*   **Mac:** [Descargar Docker Desktop para Mac (Apple Chip)](https://desktop.docker.com/mac/main/arm64/Docker.dmg) o [(Intel Chip)](https://desktop.docker.com/mac/main/amd64/Docker.dmg).
*   **Linux:** Sigue las instrucciones oficiales para tu distribución (Ubuntu, Fedora, etc.).

**Verificación:** Abre la aplicación Docker Desktop y espera a que el icono de la ballena (o barco) esté verde ("Engine running").

### 1.2. Instalar Git
Necesario para descargar el código.
*   **Windows:** [Descargar Git](https://git-scm.com/download/win).
*   **Mac/Linux:** Generalmente ya viene instalado (`git --version` en terminal).

---

## 2. Preparar el Proyecto

1.  **Abrir Terminal:**
    *   Windows: PowerShell o CMD.
    *   Mac/Linux: Terminal.

2.  **Clonar el repositorio:**
    Navega a donde quieras guardar el proyecto (`cd Documents`) y ejecuta:
    ```bash
    git clone <URL_DEL_REPOSITORIO> cronos-backend
    cd cronos-backend
    ```

3.  **Configurar Variables de Entorno (.env):**
    El sistema necesita saber contraseñas y configuración. Crea un archivo llamado `.env` en la carpeta raíz (donde ves `docker-compose.yml`) y pega esto:

    ```env
    # --- Base de Datos (Postgres en Docker Local) ---
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=cronos_dev

    # --- Configuración Backend ---
    PORT=3000
    NODE_ENV=development
    TZ=America/Bogota

    # --- Conexión Interna (Docker) ---
    DB_HOST=db
    DB_PORT=5432
    DB_SSL=false
    DB_SYNC=true  # IMPORTANTE: true en desarrollo local para crear tablas automáticamente

    # --- Seguridad (Claves locales simples) ---
    JWT_SECRET=secreto_desarrollo_local
    SESSION_SECRET=secreto_session_local

    # --- Super Admin Inicial (Para entrar al panel) ---
    ADMIN_EMAIL=admin@copower.com
    ADMIN_PASSWORD=admin
    ```

---

## 3. Ejecutar el Sistema

Ahora "encenderemos" todo con un solo comando. Docker descargará PostgreSQL, Node.js y levantará todo automáticamente.

1.  En tu terminal (dentro de `cronos-backend`), ejecuta:
    ```bash
    docker compose up --build
    ```

2.  **¿Qué sucederá?**
    *   Verás muchas líneas de texto bajando. Es normal.
    *   Docker está descargando la imagen de la base de datos y construyendo tu aplicación.
    *   Espera hasta ver un mensaje similar a:
        `Nest application successfully started`
    *   ¡Listo! El sistema está corriendo. **No cierres esta terminal.**

---

## 4. Usar el Sistema

### 4.1. Panel de Administración (Cronos)
Abre tu navegador y ve a:
[http://localhost:3000/admin](http://localhost:3000/admin)

*   **Usuario:** `admin@copower.com`
*   **Contraseña:** `admin` (la que pusiste en el `.env`)

Aquí podrás ver el Dashboard "God's Eye", crear empleados, departamentos, etc.

### 4.2. Base de Datos (Opcional)
Si quieres ver los datos "crudos" con un programa como DBeaver o PgAdmin:
*   **Host:** `localhost`
*   **Puerto:** `5432`
*   **Base de Datos:** `cronos_dev`
*   **Usuario:** `postgres`
*   **Contraseña:** `postgres`

---

## 5. Comandos Útiles para el Día a Día

*   **Detener el sistema:**
    Presiona `Ctrl + C` en la terminal donde corre.
    O abre otra terminal y ejecuta: `docker compose down`.

*   **Reiniciar desde cero (Borrar base de datos):**
    Si dañaste algo y quieres empezar limpio (borrar todos los usuarios y datos):
    ```bash
    docker compose down -v
    docker compose up --build
    ```
    (El `-v` elimina el volumen de datos persistentes).

*   **Ver logs sin bloquear la terminal:**
    ```bash
    docker compose up -d
    docker compose logs -f app
    ```

---

## 6. Solución de Problemas Comunes

### Error: "Bind for 0.0.0.0:5432 failed: port is already allocated"
*   **Causa:** Ya tienes un PostgreSQL instalado en tu computadora que está ocupando el puerto 5432.
*   **Solución:**
    1.  Detén tu Postgres local (busca en Servicios de Windows "postgresql" y detenlo).
    2.  O cambia el puerto en `docker-compose.yml`:
        ```yaml
        ports:
          - "5433:5432" # Cambia el primero (el de tu PC) a 5433
        ```
    3.  Reinicia con `docker compose up`.

### No puedo conectar desde el celular (App Móvil)
*   **Causa:** `localhost` solo funciona en tu PC. El celular no sabe qué es `localhost`.
*   **Solución:** Tu celular y tu PC deben estar en el mismo WiFi.
    1.  Averigua la IP local de tu PC (ej. `192.168.1.15`).
        *   Windows: `ipconfig` en CMD.
        *   Mac: `ifconfig | grep inet` en Terminal.
    2.  En la app móvil, apunta a `http://192.168.1.15:3000`.
