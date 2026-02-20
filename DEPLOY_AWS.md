# Guía de Despliegue en AWS para Copower (Paso a Paso)

Esta guía está diseñada para llevar tu backend desde tu computador local hasta la nube de AWS, sin necesidad de ser un experto. Sigue cada paso con cuidado.

## Conceptos Clave (¿Qué estamos contratando?)

1.  **RDS (Relational Database Service):** Es el "archivador" de tu empresa. Aquí se guardará la base de datos PostgreSQL con PostGIS. AWS se encarga de las copias de seguridad y de que nunca se apague.
2.  **ECR (Elastic Container Registry):** Es como un "Dropbox" privado para tu código. Empaquetaremos tu aplicación en una "imagen Docker" y la subiremos aquí.
3.  **App Runner:** Es el "servidor" inteligente. Toma la imagen de ECR y la ejecuta automáticamente. Si muchos empleados entran a la vez, él solito pone más servidores. Si nadie entra, reduce la potencia para ahorrar dinero.

---

## Prerrequisitos

1.  Tener una cuenta en [AWS Console](https://aws.amazon.com/es/console/).
2.  Tener instalado [AWS CLI](https://aws.amazon.com/cli/) en tu computador.
3.  Tener instalado Docker Desktop.

---

## Paso 1: Crear la Base de Datos (RDS)

1.  Entra a la consola de AWS y busca **RDS**.
2.  Haz clic en **Create database** (Crear base de datos).
3.  Selecciona **Standard create** (Creación estándar) y elige **PostgreSQL**.
4.  En **Templates**, elige **Free tier** (Capa gratuita) para empezar sin pagar, o **Production** si ya vas en serio.
5.  **Settings:**
    *   **DB instance identifier:** `copower-db`
    *   **Master username:** `postgres`
    *   **Master password:** Crea una contraseña segura y GUÁRDALA.
6.  **Connectivity:**
    *   **Public access:** NO (Por seguridad).
    *   **VPC security group:** Create new. Llámalo `copower-db-sg`.
7.  Haz clic en **Create database**. Tardará unos 5-10 minutos.
8.  Una vez creada, entra a la base de datos y busca el **Endpoint** (algo como `copower-db.cx34....us-east-1.rds.amazonaws.com`). Cópialo.

---

## Paso 2: Subir el Código (ECR)

1.  Busca el servicio **ECR** en AWS.
2.  Haz clic en **Create repository**.
    *   Nombre: `copower-backend`.
    *   Haz clic en **Create**.
3.  Entra al repositorio creado y haz clic en el botón **View push commands**.
4.  Abre tu terminal en la carpeta del proyecto y ejecuta esos 4 comandos uno por uno. Se verán algo así:

```bash
# 1. Iniciar sesión en AWS desde Docker
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ...

# 2. Construir la imagen (Esto empaqueta tu código)
docker build -t copower-backend .

# 3. Etiquetar la imagen
docker tag copower-backend:latest ...

# 4. Subir la imagen a la nube
docker push ...
```

---

## Paso 3: Lanzar el Servidor (App Runner)

1.  Busca el servicio **AWS App Runner**.
2.  Haz clic en **Create service**.
3.  **Source:** Selecciona **Container registry**.
    *   Provider: **Amazon ECR**.
    *   Image URI: Selecciona `copower-backend` (la que acabamos de subir).
4.  **Deployment settings:** Automatic (así se actualiza solo cuando subas cambios).
5.  **Configuration:**
    *   **Runtime:** Node.js 18 (o el que uses).
    *   **Port:** 3000.
    *   **Environment variables:** Aquí es donde conectamos todo. Agrega estas variables:
        *   `DB_HOST`: (El Endpoint de RDS del Paso 1)
        *   `DB_PORT`: 5432
        *   `POSTGRES_USER`: postgres
        *   `POSTGRES_PASSWORD`: (La contraseña que creaste)
        *   `POSTGRES_DB`: copower
        *   `CATALEYA_API_KEY`: (Invéntate una clave segura)
        *   `GOOGLE_APPLICATION_CREDENTIALS`: (Contenido del JSON de Firebase, si lo tienes)
6.  Haz clic en **Create & deploy**.

¡Listo! App Runner te dará una URL segura (`https://.....awsapprunner.com`). Esa es la URL de tu API.

---

## ¿Cómo actualizar el sistema?

Cada vez que hagas cambios en el código:
1.  Ejecuta los comandos del **Paso 2** (Build y Push).
2.  App Runner detectará la nueva imagen y actualizará el servidor automáticamente sin que hagas nada más.
