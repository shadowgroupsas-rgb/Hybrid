# Solución de Problemas de Red en AWS (RDS y App Runner)

El error `no pg_hba.conf entry for host ...` indica que la base de datos (RDS) está rechazando la conexión entrante desde tu aplicación (App Runner).

Sigue estos 3 pasos para solucionarlo:

## 1. Configurar Variable de Entorno en App Runner

1.  Ve a la consola de **AWS App Runner**.
2.  Entra a tu servicio (`copower-backend`).
3.  Ve a la pestaña **Configuration** (Configuración) y haz clic en **Edit** (Editar).
4.  En la sección **Environment variables**, añade una nueva:
    *   **Key:** `DB_SSL`
    *   **Value:** `true`
5.  Haz clic en **Save & Deploy**.

*Esto activará la configuración de SSL que acabamos de agregar al código.*

## 2. Ajustar el Grupo de Seguridad (Security Group) de RDS

RDS tiene un "firewall" que por defecto bloquea todo. Debemos abrirlo.

1.  Ve a la consola de **AWS RDS**.
2.  Haz clic en **Databases** y selecciona tu base de datos (`copower-db`).
3.  En la pestaña **Connectivity & security**, busca el apartado **VPC security groups**. Haz clic en el enlace del grupo de seguridad activo (ej: `sg-01234abc...`).
4.  Esto te llevará a la consola de EC2. Ve a la pestaña **Inbound rules** (Reglas de entrada).
5.  Haz clic en **Edit inbound rules**.
6.  Haz clic en **Add rule**:
    *   **Type:** `PostgreSQL` (Puerto 5432).
    *   **Source:** `Anywhere-IPv4` (`0.0.0.0/0`).
    *   *(Nota: Para mayor seguridad en el futuro, puedes restringir esto, pero `0.0.0.0/0` es lo más rápido para que App Runner pueda conectar sin configurar VPCs complejas).*
7.  Haz clic en **Save rules**.

## 3. Verificar Acceso Público (Si no usas VPC Peering)

Si App Runner y RDS no están en la misma VPC (o si no configuraste un VPC Connector en App Runner):

1.  Vuelve a tu base de datos en **RDS**.
2.  Haz clic en **Modify** (arriba a la derecha).
3.  Baja hasta la sección **Connectivity**.
4.  Asegúrate de que **Public access** esté marcado como **Publicly accessible**.
5.  Si lo cambias, baja al final, dale a **Continue** y selecciona **Apply immediately**.

---

### Resumen
Una vez hayas hecho esto:
1.  RDS aceptará conexiones desde internet (Paso 3).
2.  El Firewall permitirá el paso al puerto 5432 (Paso 2).
3.  Tu aplicación usará SSL para cumplir con los requisitos de seguridad de RDS (Paso 1).
