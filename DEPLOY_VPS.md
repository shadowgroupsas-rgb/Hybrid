# Guía Definitiva de Despliegue en VPS (Vultr / DigitalOcean) - Desde Cero

Esta guía te llevará paso a paso para desplegar **Cronos by Copower** en un servidor VPS totalmente nuevo y limpio (específicamente probada en Vultr Cloud Compute con Ubuntu 22.04 LTS o 24.04 LTS).

---

## 1. Preparación del Servidor (Vultr)

### 1.1. Crear la Instancia en Vultr
1.  Ve a [Vultr Dashboard](https://my.vultr.com/) y haz clic en **Deploy +**.
2.  **Choose Server:** Cloud Compute (Shared CPU es suficiente para empezar).
3.  **Server Location:** Elige la más cercana a Colombia (ej. Miami).
4.  **Server Image:** Selecciona **Ubuntu 24.04 LTS** (o 22.04 LTS).
5.  **Server Size:** Mínimo 1 vCPU / 2GB RAM recomendado para PostgreSQL + Node.js.
6.  **Add Auto Backups:** Recomendado (Opcional).
7.  Haz clic en **Deploy Now**.
8.  Espera a que se instale y copia la **IP Address** y la contraseña de **root**.

### 1.2. Conexión Inicial y Actualización
Abre tu terminal (PowerShell o Terminal):

```bash
# Conéctate como root (reemplaza 123.45.67.89 por tu IP)
ssh root@123.45.67.89
# (Escribe 'yes' si pregunta por fingerprint y pega la contraseña de Vultr)
```

Una vez dentro, actualiza el sistema:

```bash
apt update && apt upgrade -y
```

### 1.3. Configurar Firewall Básico (UFW)
Para seguridad básica, solo permitiremos SSH, HTTP y HTTPS.

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
# Presiona 'y' para confirmar.
```

---

## 2. Instalación de Herramientas (Docker & Nginx)

### 2.1. Instalar Docker y Docker Compose
Docker permite correr la base de datos y la aplicación sin instalar mil dependencias manualmente.

```bash
# Instalar Docker usando el script oficial
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Verificar instalación
docker --version
docker compose version
```

### 2.2. Instalar Nginx y Certbot (Para SSL)
Nginx será nuestro "portero" que recibe las peticiones y las pasa a la aplicación, además de manejar el candado verde (HTTPS).

```bash
apt install nginx certbot python3-certbot-nginx -y
```

---

## 3. Configuración del Proyecto Cronos

### 3.1. Clonar el Código
```bash
# Instalar Git si no está (Ubuntu suele traerlo)
apt install git -y

# Moverse a carpeta de usuario
cd /var/www

# Clonar el repositorio (Usa tu URL real aquí)
git clone <URL_DEL_REPOSITORIO_GITHUB> cronos-backend
cd cronos-backend
```

### 3.2. Configurar Variables de Entorno (.env)
Este paso es crítico. Aquí defines las contraseñas de producción.

1.  Crea el archivo `.env`:
    ```bash
    nano .env
    ```

2.  Copia y pega el siguiente bloque (ajusta las contraseñas marcadas con `!!!`):

    ```env
    # --- Base de Datos (PostgreSQL) ---
    POSTGRES_USER=admin_cronos
    POSTGRES_PASSWORD=!!!_CONTRASEÑA_DB_DIFICIL_!!!
    POSTGRES_DB=cronos_prod

    # --- Configuración Backend ---
    PORT=3000
    NODE_ENV=production
    TZ=America/Bogota  # Zona horaria de Colombia

    # --- Conexión Interna (Docker) ---
    DB_HOST=db
    DB_PORT=5432
    DB_SSL=false       # False en red interna de Docker
    DB_SYNC=false      # IMPORTANTE: false en producción para no borrar datos accidentalmente

    # --- Seguridad y Sesiones ---
    JWT_SECRET=!!!_CONTRASEÑA_JWT_LARGA_Y_ALEATORIA_!!!
    SESSION_SECRET=!!!_CONTRASEÑA_SESSION_LARGA_!!!

    # --- Primer Super Admin (Se creará al iniciar) ---
    ADMIN_EMAIL=admin@copower.com
    ADMIN_PASSWORD=!!!_CONTRASEÑA_ADMIN_PANEL_!!!
    ```

3.  Guarda: `Ctrl + O`, `Enter`, `Ctrl + X`.

---

## 4. Despliegue de la Aplicación

Ahora "encenderemos" el sistema.

1.  **Construir e Iniciar Contenedores:**
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```
    *   Esto tardará unos minutos la primera vez mientras descarga Node.js y compila el código.

2.  **Verificar que todo corre:**
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
    *   Deberías ver `app` y `db` en estado `Up`.

---

## 5. Configurar Dominio y SSL (HTTPS)

### 5.1. Apuntar Dominio (DNS)
Ve a tu proveedor de dominio (GoDaddy, Namecheap, Cloudflare) y crea un registro **A**:
*   **Host/Name:** `api` (o lo que quieras, ej. `cronos`)
*   **Value/IP:** La IP de tu servidor Vultr (ej. `123.45.67.89`).
*   Esto hará que `api.tudominio.com` apunte a tu servidor. **Espera unos minutos a que se propague.**

### 5.2. Configurar Nginx
1.  Crea el archivo de configuración:
    ```bash
    nano /etc/nginx/sites-available/cronos
    ```

2.  Pega el siguiente contenido (reemplaza `api.tudominio.com` por tu dominio real):

    ```nginx
    server {
        server_name api.tudominio.com; # <--- TU DOMINIO AQUÍ

        location / {
            proxy_pass http://localhost:3000; # Apunta al puerto de Docker
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;

            # Seguridad adicional para saber la IP real del usuario
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

3.  Guarda (`Ctrl+O`, `Enter`, `Ctrl+X`).

4.  Activa el sitio:
    ```bash
    ln -s /etc/nginx/sites-available/cronos /etc/nginx/sites-enabled/
    rm /etc/nginx/sites-enabled/default  # Elimina el sitio por defecto si existe
    nginx -t  # Verifica sintaxis (debe decir OK)
    systemctl restart nginx
    ```

### 5.3. Obtener Certificado SSL (El Candado Verde)
Ejecuta Certbot. Él configurará HTTPS automáticamente.

```bash
certbot --nginx -d api.tudominio.com
```
*   Te pedirá un email (úsalo para renovaciones).
*   Acepta términos (`Y`).
*   Si todo sale bien, dirá "Congratulations!".

---

## 6. Verificación Final

1.  Abre tu navegador en `https://api.tudominio.com/admin`.
2.  Deberías ver el login de **Cronos by Copower**.
3.  Ingresa con `admin@copower.com` y la contraseña que pusiste en el `.env`.
4.  ¡Listo! Tu sistema está en producción.

---

## 7. Mantenimiento: Cómo actualizar el código

Cuando hagas cambios en tu PC y los subas a GitHub, haz esto en el servidor para actualizar:

```bash
cd /var/www/cronos-backend
git pull
docker compose -f docker-compose.prod.yml up -d --build app
# Nota: Solo reiniciamos 'app', la base de datos 'db' no se toca para no interrumpir.
docker image prune -f # Limpia basura vieja de Docker
```
