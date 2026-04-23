# Task Manager API

## 📝 Descripción del Proyecto

**Resumen:** Desarrollo de una aplicación de ejemplo integradora/general que incluya todo lo visto con anterioridad. Está dividida por niveles de complejidad y por orden arquitectónico que provee el Framework NestJS.

### Objetivos:
*   Arquitectura y Diseño de la Aplicación
*   Configuración y Dependencias
*   Desarrollo de Funcionalidades
*   Pruebas Unitarias e Integración
*   Optimización y Escalabilidad
*   Despliegue y Mantenimiento
*   Seguridad

---

## 🛠️ Requisitos Funcionales - "Task Manager"

### 1. Autenticación y Autorización
*   **Registro de Usuario:** El sistema permitirá a los usuarios registrarse con correo, contraseña (min. 8 caracteres, letra y número) y nombre de usuario único. Encriptación con bcrypt.
*   **Inicio de Sesión:** Validación de credenciales y generación de token JWT con expiración.
*   **Gestión de Roles:** Soporte para roles de Administrador y Usuario Normal. Implementación de Guards de autorización.
*   **Logout:** Invalidación del token JWT en el servidor.

### 2. Gestión de Tareas
*   **Crear Tarea:** Título, descripción, fecha de vencimiento y estado (pendiente, en progreso, completada). Relación con el usuario creador.
*   **Listar Tareas:** Con filtros por estado, fecha y paginación para grandes volúmenes.
*   **Editar/Eliminar:** Los usuarios solo pueden gestionar sus propias tareas.
*   **Completar:** Cambio de estado a "completada".

### 3. Gestión de Notificaciones
*   **Vencimiento:** Notificaciones cuando una tarea esté próxima a vencer (Cron Jobs).
*   **Creación:** Notificación al usuario cuando se crea una nueva tarea.

### 4. Interacción con la Base de Datos (PostgreSQL)
*   **Modelos:** User, Profile, Task, Tag.
*   **Relaciones:**
    *   User - Task (One To Many)
    *   User - Profile (One To One)
    *   Task - Tag (Many To Many)

### 5. Seguridad
*   **Encriptación:** Uso de bcrypt para todas las contraseñas.
*   **JWT:** Validación en cada solicitud protegida.
*   **Protección:** Configuración contra ataques CSRF, XSS, SQL Injection y habilitación de CORS.

### 6. Optimización y Escalabilidad
*   **Paginación:** Implementada en listados para manejo de rendimiento.
*   **Caching:** Uso de Redis para resultados de consultas frecuentes.

### 7. Despliegue y Mantenimiento
*   **Contenerización:** Dockerfile y docker-compose para la aplicación e infraestructura.
*   **Logging:** Centralización de logs para supervisión en producción.

---

## 🚀 Tecnologías Utilizadas
- **Framework:** NestJS (v11+)
- **Base de Datos:** PostgreSQL con TypeORM
- **Caché & Blacklist:** Redis
- **Documentación:** Swagger
- **Notificaciones:** Mailer (Mailtrap) & Schedule (Cron Jobs)

## ⚙️ Instalación y Ejecución

1. **Configurar variables:** `cp .env.example .env` (ajustar credenciales).
2. **Infraestructura:** `docker-compose up -d`
3. **Instalación:** `npm install`
4. **Ejecutar:** `npm run start:dev`

Accede a la documentación en: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
