# Guía de Despliegue en VPS (DigitalOcean, Vultr, etc.)

Esta guía te ayudará a desplegar el backend de Copower en un servidor VPS estándar (como DigitalOcean Droplet o Vultr Instance) utilizando Docker y Docker Compose.

## 1. Requisitos Previos

*   Un servidor VPS con **Ubuntu 22.04 LTS** (recomendado).
*   Acceso SSH al servidor (`ssh root@tu-ip`).
*   **Docker** y **Docker Compose** instalados en el servidor.
*   **Git** instalado.

### Instalación rápida de Docker (si no lo tienes):
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Verificar instalación
docker --version
docker compose version
```

## 2. Configuración del Proyecto

1.  **Clonar el repositorio:**
    ```bash
    git clone <URL_DEL_REPOSITORIO> copower-backend
    cd copower-backend
    ```

2.  **Configurar Variables de Entorno (.env):**
    Crea un archivo `.env` en la raíz del proyecto. Puedes usar `nano .env` y pegar lo siguiente (ajusta los valores):

    ```env
    # Configuración de Base de Datos
    POSTGRES_USER=admin_copower
    POSTGRES_PASSWORD=tu_password_segura_aqui
    POSTGRES_DB=copower_prod

    # Configuración de Backend
    PORT=3000
    NODE_ENV=production

    # Conexión DB (Para Docker interno)
    DB_HOST=db
    DB_PORT=5432
    DB_SSL=false
    DB_SYNC=false  # Importante: false en producción para no perder datos

    # JWT y Seguridad (Si aplica)
    JWT_SECRET=otra_password_larga_y_segura

    # Firebase / AdminJS (Si tienes credenciales)
    # ... otras variables necesarias
    ```

## 3. Despliegue (Production)

Para iniciar el sistema en modo producción, usaremos el archivo `docker-compose.prod.yml` que está optimizado para este entorno.

1.  **Construir e Iniciar los contenedores:**
    ```bash
    docker compose -f docker-compose.prod.yml up -d --build
    ```
    *   `-f docker-compose.prod.yml`: Indica usar el archivo de producción.
    *   `-d`: Ejecuta en segundo plano (detached).
    *   `--build`: Fuerza la reconstrucción de la imagen para asegurar que tienes el último código.

2.  **Verificar el estado:**
    ```bash
    docker compose -f docker-compose.prod.yml ps
    ```
    Deberías ver dos servicios (`app` y `db`) en estado "Up".

3.  **Ver logs (si algo falla):**
    ```bash
    docker compose -f docker-compose.prod.yml logs -f app
    ```

## 4. Configurar Dominio y SSL (Nginx + Certbot)

Para que tu aplicación sea accesible de forma segura (https://api.tudominio.com), se recomienda usar Nginx como proxy inverso.

1.  **Instalar Nginx:**
    ```bash
    sudo apt install nginx -y
    ```

2.  **Configurar Nginx:**
    Crea un archivo de configuración:
    ```bash
    sudo nano /etc/nginx/sites-available/copower
    ```
    Contenido:
    ```nginx
    server {
        server_name api.tudominio.com; # Tu dominio real

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  **Activar sitio:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/copower /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl restart nginx
    ```

4.  **Obtener Certificado SSL (Gratis):**
    ```bash
    sudo apt install certbot python3-certbot-nginx -y
    sudo certbot --nginx -d api.tudominio.com
    ```

## 5. Mantenimiento

*   **Actualizar el código:**
    ```bash
    git pull
    docker compose -f docker-compose.prod.yml up -d --build
    ```

*   **Detener el sistema:**
    ```bash
    docker compose -f docker-compose.prod.yml down
    ```
