# Guía de Despliegue en VPS (Desde Cero)

Esta guía explica cómo desplegar el backend de Copower en un servidor VPS (DigitalOcean, Vultr, AWS EC2, etc.) utilizando Docker y Docker Compose para garantizar un entorno estable y reproducible.

**Objetivo:** Configurar un entorno de producción seguro con PostgreSQL, Node.js (NestJS), Nginx (Proxy Inverso) y Certificados SSL automáticos.

---

## 1. Requisitos Previos

*   Un servidor VPS nuevo con **Ubuntu 22.04 LTS** (o superior).
*   Acceso SSH como `root` o usuario con sudo (`ssh usuario@tu-ip`).
*   Un dominio o subdominio apuntando a la IP de tu VPS (ej. `api.tudominio.com` -> `123.456.78.90`).

---

## 2. Preparación del Servidor (Instalación de Docker)

Ejecuta estos comandos en tu VPS para instalar Docker y Docker Compose:

```bash
# Actualizar repositorios
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar instalación (debería mostrar versiones)
docker --version
docker compose version
```

---

## 3. Configuración del Proyecto

### 3.1. Clonar el Repositorio
```bash
# Cambia <URL_DEL_REPOSITORIO> por tu URL real (Github/Gitlab)
git clone <URL_DEL_REPOSITORIO> copower-backend
cd copower-backend
```

### 3.2. Configurar Variables de Entorno (.env)
Es crucial configurar correctamente el `.env` para producción.

1.  Crea el archivo:
    ```bash
    nano .env
    ```
2.  Pega el siguiente contenido (ajusta las contraseñas con valores seguros):

    ```env
    # --- Base de Datos (Postgres) ---
    POSTGRES_USER=admin_copower
    POSTGRES_PASSWORD=PASSWORD_ULTRA_SEGURA_DB_123!
    POSTGRES_DB=copower_prod

    # --- Configuración Backend ---
    PORT=3000
    NODE_ENV=production
    TZ=America/Bogota  # Zona horaria correcta para Colombia

    # --- Conexión Interna ---
    DB_HOST=db
    DB_PORT=5432
    DB_SSL=false       # False en red interna de Docker
    DB_SYNC=false      # IMPORTANTE: false en producción para no borrar datos accidentalmente

    # --- Seguridad y Sesiones ---
    JWT_SECRET=PASSWORD_ULTRA_SEGURA_JWT_KEY_XYZ!
    SESSION_SECRET=PASSWORD_ULTRA_SEGURA_SESSION_KEY_ABC!

    # --- Panel Admin (AdminJS) ---
    ADMIN_EMAIL=admin@copower.com
    ADMIN_PASSWORD=PASSWORD_PANEL_ADMIN_SECRET!
    ```
3.  Guarda con `Ctrl + O`, `Enter` y sal con `Ctrl + X`.

---

## 4. Despliegue de Contenedores

Usaremos `docker-compose.prod.yml` que está optimizado para producción.

1.  **Construir e Iniciar:**
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```
    *   `-f ...`: Usa el archivo de producción.
    *   `-d`: Segundo plano (detached).
    *   `--build`: Fuerza la compilación del código más reciente.

2.  **Verificar estado:**
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
    Deberías ver `app` y `db` en estado "Up".

3.  **Ver logs (si falla algo):**
    ```bash
    docker compose -f docker-compose.prod.yml logs -f app
    ```

---

## 5. Configurar Dominio y SSL (Nginx + Certbot)

Para que tu API sea accesible de forma segura (`https://...`), usaremos Nginx como "portero".

### 5.1. Instalar Nginx y Certbot
```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

### 5.2. Configurar el Sitio en Nginx
1.  Crea un archivo de configuración para Copower:
    ```bash
    sudo nano /etc/nginx/sites-available/copower
    ```
2.  Pega esto (cambia `api.tudominio.com` por tu dominio real):

    ```nginx
    server {
        server_name api.tudominio.com; # Tu dominio real aquí

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;

            # Encabezados de seguridad básicos
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

### 5.3. Activar y Verificar
```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/copower /etc/nginx/sites-enabled/

# Verificar sintaxis (debe decir "successful")
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 5.4. Obtener Certificado SSL (HTTPS)
```bash
sudo certbot --nginx -d api.tudominio.com
```
Sigue las instrucciones (ingresa email, acepta términos). Al finalizar, tu sitio será accesible por HTTPS.

---

## 6. Mantenimiento y Actualizaciones

Cada vez que hagas cambios en el código y los subas a Git:

1.  Entra al servidor y carpeta:
    ```bash
    cd copower-backend
    ```
2.  Descarga los cambios:
    ```bash
    git pull
    ```
3.  Reconstruye los contenedores (sin tiempo de inactividad de la DB, solo backend):
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build app
    ```
4.  Limpia imágenes viejas (para ahorrar espacio):
    ```bash
    docker image prune -f
    ```
