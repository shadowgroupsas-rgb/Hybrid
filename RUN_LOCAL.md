# Guía de Desarrollo Local (Docker)

Esta guía explica cómo ejecutar el backend de Copower en tu máquina local para desarrollo, utilizando Docker Compose. Este método asegura que todos los desarrolladores tengan el mismo entorno.

## Requisitos Previos

*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y ejecutándose.
*   [Git](https://git-scm.com/) instalado.

## 1. Configuración Inicial

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO> copower-backend
    cd copower-backend
    ```

2.  **Configurar Variables de Entorno (.env):**
    Crea un archivo `.env` en la raíz del proyecto. Copia el siguiente contenido base:

    ```env
    # Configuración de Base de Datos (Local)
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=postgres
    POSTGRES_DB=copower_dev

    # Configuración de Backend
    PORT=3000
    NODE_ENV=development

    # Conexión DB (Para Docker)
    DB_HOST=db
    DB_PORT=5432
    DB_SSL=false
    DB_SYNC=true  # Importante: true en desarrollo para sincronizar esquema automáticamente

    # JWT y Seguridad
    JWT_SECRET=super_secret_jwt_key_dev

    # Firebase / AdminJS (Opcional para iniciar)
    # ...
    ```

## 2. Iniciar el Entorno

Para iniciar la base de datos y el backend con recarga en caliente (hot reload):

```bash
docker compose up --build
```

*   `up`: Levanta los contenedores.
*   `--build`: Reconstruye la imagen si hubo cambios en dependencias (`package.json`).
*   La terminal mostrará los logs en tiempo real.

## 3. Acceso y Uso

Una vez que veas el mensaje "Nest application successfully started":

*   **API Backend:** [http://localhost:3000](http://localhost:3000)
*   **Panel de Administración (AdminJS):** [http://localhost:3000/admin](http://localhost:3000/admin)
    *   (Si configuraste usuarios en seed, usa esas credenciales).
*   **Base de Datos:** Accesible en `localhost:5432` con usuario/pass `postgres`/`postgres`.

## 4. Comandos Útiles

*   **Detener el entorno:** `Ctrl+C` en la terminal donde corre, o `docker compose down`.
*   **Limpiar volúmenes (Reiniciar DB desde cero):**
    ```bash
    docker compose down -v
    ```
    (Cuidado: Esto borra todos los datos de la base de datos local).
*   **Ver logs en segundo plano:**
    ```bash
    docker compose up -d
    docker compose logs -f app
    ```

## 5. Solución de Problemas

*   **Puerto Ocupado:** Si el puerto 3000 o 5432 está en uso, detén otros procesos o cambia los puertos en `docker-compose.yml`.
*   **Error de Permisos:** En Linux, asegúrate de que tu usuario tenga permisos para Docker (`sudo usermod -aG docker $USER`).
*   **Node Modules:** Si ves errores de dependencias, intenta reconstruir: `docker compose up --build`.
