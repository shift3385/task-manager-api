# Task Manager API

Una robusta API de gestión de tareas construida con **NestJS**, diseñada como un proyecto integrador que aplica arquitectura modular, seguridad avanzada, caché y automatización.

## 🚀 Tecnologías
- **Framework:** [NestJS](https://nestjs.com/) (v11+)
- **Lenguaje:** TypeScript
- **Base de Datos:** PostgreSQL con TypeORM
- **Caché & Blacklist:** Redis
- **Autenticación:** JWT (Passport)
- **Documentación:** Swagger
- **Notificaciones:** Mailer (Mailtrap) & Schedule (Cron Jobs)
- **Contenerización:** Docker & Docker Compose

## 🛠️ Características Principales
- **Autenticación & Autorización:** Registro, Login y Logout (con invalidación de tokens vía Redis). Roles de `ADMIN` y `USER`.
- **Gestión de Usuarios:** Creación automática de perfiles (1:1).
- **Gestión de Tareas:** CRUD completo, paginación, filtros por estado y ordenamiento por fecha de vencimiento. Validación de propiedad (los usuarios solo ven/editan sus tareas).
- **Sistema de Etiquetas:** Creación de etiquetas por usuarios con flujo de aprobación por Administrador. Caché en Redis para etiquetas aprobadas.
- **Notificaciones:** Envío de correos al crear tareas y alertas automáticas (Cron) para tareas próximas a vencer.

## 📋 Requisitos Previos
- Node.js (v18+)
- Docker & Docker Compose
- Cuenta en [Mailtrap](https://mailtrap.io/) (para las pruebas de correo)

## ⚙️ Instalación y Ejecución (Setup & Run)

1. **Clonar el repositorio:**
   ```bash
   git clone <repo-url>
   cd task-manager-api
   ```

2. **Configurar variables de entorno:**
   Copia el archivo `.env.example` a `.env` y ajusta los valores, especialmente las credenciales de Mailtrap.
   ```bash
   cp .env.example .env
   ```

3. **Levantar la infraestructura (Base de Datos y Redis):**
   ```bash
   docker-compose up -d
   ```

4. **Instalar dependencias:**
   ```bash
   npm install
   ```

5. **Ejecutar la aplicación:**
   ```bash
   # Desarrollo
   npm run start:dev

   # Producción
   npm run build
   npm run start:prod
   ```

6. **Acceder a la documentación:**
   Swagger UI: [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

## 🧪 Pruebas
Para ejecutar las pruebas unitarias y de integración:
```bash
npm run test
npm run test:e2e
```

## 📐 Decisiones Técnicas
- **Blacklist en Redis:** Para cumplir con la invalidación de JWT en el servidor, se implementó una lista negra en Redis que almacena la firma del token al hacer Logout hasta su expiración natural.
- **Transacciones de Perfil:** Al registrar un usuario, se crea automáticamente un perfil vinculado mediante una transacción de base de datos para asegurar la integridad.
- **Aprobación de Tags:** Implementado como un flujo de estados para evitar spam de etiquetas globales y mantener el control administrativo.
