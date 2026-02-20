# Guía de Ejecución Local en Windows 11

Esta guía te ayudará a configurar y ejecutar el backend de Copower en tu máquina Windows 11.

## Prerrequisitos

1.  **Node.js (LTS):** Descarga e instala la última versión LTS (Long Term Support) desde [nodejs.org](https://nodejs.org/).
2.  **Docker Desktop:** Instala Docker Desktop para Windows desde [docker.com](https://www.docker.com/products/docker-desktop/). Asegúrate de que esté ejecutándose (icono de la ballena en la barra de tareas).
3.  **Git:** (Opcional pero recomendado) Instala Git para Windows desde [git-scm.com](https://git-scm.com/).
4.  **VS Code:** (Opcional pero recomendado) Un buen editor de código.

---

## Paso 1: Configurar Variables de Entorno

1.  En la raíz del proyecto (donde está este archivo), crea un archivo llamado `.env` si no existe.
2.  Copia y pega el siguiente contenido en el archivo `.env`:

```env
# Configuración de Base de Datos (PostgreSQL)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=copower
DB_HOST=localhost
DB_PORT=5432

# Configuración de la App
PORT=3000
CATALEYA_API_KEY=tu_clave_super_secreta_para_cataleya
ADMIN_EMAIL=admin@copower.com
# GOOGLE_APPLICATION_CREDENTIALS=ruta/a/tu/firebase-admin.json (opcional para desarrollo local)
```

---

## Paso 2: Iniciar la Base de Datos (Docker)

1.  Abre una terminal (PowerShell o CMD) en la carpeta raíz del proyecto.
2.  Ejecuta el siguiente comando para levantar la base de datos PostgreSQL con PostGIS:

```bash
docker-compose up -d
```

*Nota: La primera vez puede tardar unos minutos en descargar la imagen.*

---

## Paso 3: Instalar Dependencias y Configurar Backend

1.  Entra a la carpeta del backend:

```bash
cd backend
```

2.  Instala las librerías necesarias:

```bash
npm install
```

3.  (Opcional pero recomendado) Carga los datos iniciales (Admin y Ciudades):

```bash
npm run seed
```
*Si ves errores de conexión, asegúrate de que Docker esté corriendo y la base de datos haya terminado de iniciar.*

---

## Paso 4: Ejecutar el Servidor

1.  Inicia el servidor en modo desarrollo:

```bash
npm run start:dev
```

2.  Deberías ver mensajes en la consola indicando que la aplicación ha iniciado correctamente.

---

## Paso 5: Acceder al Panel Administrativo

1.  Abre tu navegador web (Chrome, Edge, etc.).
2.  Ve a la siguiente dirección:
    [http://localhost:3000/admin](http://localhost:3000/admin)

¡Listo! Deberías ver el panel de control de Copower con el diseño futurista.

---

## Solución de Problemas Comunes en Windows

*   **Error "docker-compose no se reconoce":** Asegúrate de tener Docker Desktop instalado y agregado al PATH. En versiones nuevas de Docker, el comando puede ser `docker compose` (sin guion).
*   **Error de conexión a BD:** Verifica que el puerto 5432 no esté siendo usado por otro servicio de PostgreSQL instalado en tu máquina. Si es así, puedes cambiar el puerto en `docker-compose.yml` (ej: `"5433:5432"`) y en el `.env` (`DB_PORT=5433`).
*   **Permisos:** Si tienes problemas de permisos con Docker, intenta ejecutar la terminal como Administrador.
