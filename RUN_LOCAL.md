# Guía de Instalación y Desarrollo Local (Desde Cero)

Esta guía está diseñada para configurar tu entorno de desarrollo local **desde cero**, asumiendo que tienes una computadora nueva (Windows, Mac o Linux) y necesitas ejecutar el backend de Copower.

No necesitas instalar PostgreSQL, Node.js ni nada complejo manualmente. Usaremos **Docker** para encapsular todo.

---

## 1. Requisitos Previos (Instalación)

### Paso 1.1: Instalar Git
Git es necesario para descargar el código.
*   **Windows:** Descarga e instala [Git for Windows](https://git-scm.com/download/win). Usa las opciones por defecto.
*   **Mac:** Abre la terminal y escribe `git`. Si no está, te pedirá instalar las herramientas de desarrollo.
*   **Linux:** `sudo apt install git`.

### Paso 1.2: Instalar Docker Desktop
Docker crea "contenedores" donde correrá la base de datos y el servidor, sin ensuciar tu sistema.
1.  Ve a [Docker Desktop](https://www.docker.com/products/docker-desktop/) y descarga la versión para tu sistema.
2.  Instálalo.
    *   **Importante en Windows:** Asegúrate de que WSL 2 esté activado si el instalador lo pide (Docker suele guiarte en esto).
3.  Abre **Docker Desktop** y espera a que el icono de la ballena (o el barco) deje de animarse y diga "Engine running" (en verde).

### Paso 1.3: Instalar un Editor de Código (Opcional pero Recomendado)
Recomendamos [Visual Studio Code (VS Code)](https://code.visualstudio.com/).

---

## 2. Descargar el Código

1.  Abre tu terminal (PowerShell en Windows, Terminal en Mac/Linux).
2.  Navega a donde quieras guardar el proyecto (ej. `cd Documents`).
3.  Clona el repositorio:
    ```bash
    git clone <URL_DEL_REPOSITORIO> copower-backend
    ```
4.  Entra a la carpeta:
    ```bash
    cd copower-backend
    ```

---

## 3. Configuración del Entorno (.env)

El sistema necesita contraseñas y configuraciones para funcionar. Docker leerá este archivo.

1.  Crea un archivo llamado `.env` en la raíz del proyecto (donde está `docker-compose.yml`).
2.  Copia y pega el siguiente contenido **exactamente**:

```env
# --- Configuración de Base de Datos (Postgres en Docker) ---
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=copower_dev

# --- Configuración del Servidor Backend ---
PORT=3000
NODE_ENV=development
# TZ asegura que los horarios de horas extra (19:00-06:00) sean correctos para Colombia
TZ=America/Bogota

# --- Conexión Interna (Backend -> Base de Datos) ---
# "db" es el nombre del servicio en docker-compose.yml
DB_HOST=db
DB_PORT=5432
DB_SSL=false
# DB_SYNC=true permite que TypeORM cree las tablas automáticamente al guardar cambios en el código
DB_SYNC=true

# --- Seguridad y Sesiones ---
JWT_SECRET=clave_secreta_para_desarrollo_local_123
SESSION_SECRET=clave_secreta_para_sesiones_admin_123

# --- Credenciales de Acceso al Panel Admin (AdminJS) ---
ADMIN_EMAIL=admin@copower.com
ADMIN_PASSWORD=admin
```

---

## 4. Iniciar el Sistema

Ahora que tienes Docker y la configuración, vamos a "encender" todo.

1.  En tu terminal (dentro de la carpeta `copower-backend`), ejecuta:
    ```bash
    docker compose up --build
    ```
    *   `up`: Levanta los servicios.
    *   `--build`: Asegura que se instalen las librerías nuevas si el código cambió.

2.  **¿Qué pasará?**
    *   Docker descargará la imagen de **PostgreSQL** (Base de datos).
    *   Docker construirá la imagen del **Backend** (Node.js), instalará las librerías (`npm install`) automáticamente.
    *   Verás muchos logs de colores. Espera hasta ver:
        `Nest application successfully started`

---

## 5. Verificar que todo funciona

Abre tu navegador (Chrome, Edge, Safari):

1.  **API Backend:** Entra a [http://localhost:3000](http://localhost:3000). Deberías ver un mensaje de "Hello World" o 404 (es normal si la raíz no tiene ruta).
2.  **Panel de Administración (AdminJS):** Entra a [http://localhost:3000/admin](http://localhost:3000/admin).
    *   **Usuario:** `admin@copower.com`
    *   **Contraseña:** `admin`
    *   Si logras entrar y ver el Dashboard "Copower God's Eye System", ¡Felicidades! Todo funciona.

---

## 6. Comandos para el Día a Día

*   **Detener todo:**
    Presiona `Ctrl + C` en la terminal. O abre otra terminal y ejecuta:
    ```bash
    docker compose down
    ```

*   **Reiniciar desde cero (Borrar base de datos):**
    Si dañaste los datos y quieres empezar limpio:
    ```bash
    docker compose down -v
    docker compose up --build
    ```
    (La `-v` borra el volumen de datos persistentes).

*   **Ver logs en segundo plano:**
    Si quieres usar la terminal para otras cosas:
    ```bash
    docker compose up -d
    docker compose logs -f app
    ```

---

## 7. Solución de Problemas Comunes

### Error: "Ports are not available"
*   **Causa:** Ya tienes algo corriendo en el puerto 3000 o 5432 (quizás otro Postgres instalado localmente).
*   **Solución:** Detén el servicio que ocupa el puerto, o edita `docker-compose.yml` y cambia `ports: - "3000:3000"` a `ports: - "3001:3000"`.

### Error: "database system is starting up"
*   **Causa:** Postgres tarda unos segundos en iniciar la primera vez.
*   **Solución:** El backend se reiniciará automáticamente hasta que la base de datos responda. Solo espera unos segundos.

### Los cambios en el código no se ven
*   **Causa:** Docker a veces no detecta cambios en archivos en Windows/WSL si no están en el sistema de archivos de Linux.
*   **Solución:** Reinicia el contenedor: `docker compose restart app`.

### Horas incorrectas en los registros
*   **Causa:** La zona horaria no está configurada.
*   **Solución:** Verifica que `TZ=America/Bogota` esté en tu `.env` y en `docker-compose.yml`.
