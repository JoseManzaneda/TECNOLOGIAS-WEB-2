# TECNOLOGIAS-WEB-2

Backend académico para una cafetería usando NestJS 10+, Fastify y TypeORM (PostgreSQL).

## 🚀 Estado actual

**🔄 Proyecto reorganizado para migración a microservicios**

El proyecto ha sido reestructurado usando el patrón **Strangler Fig** para facilitar la migración gradual desde un monolito a una arquitectura de microservicios.

- ✅ **Monolito legacy** funcionando en `services/legacy-monolith/` (puerto 3001)
- 🚧 **API Gateway** (pendiente)
- 🚧 **User Service** (pendiente)
- 🚧 **Catalog Service** (pendiente)

> 📖 Ver [`MIGRACION-MICROSERVICIOS.md`](./MIGRACION-MICROSERVICIOS.md) para el plan completo de migración.

## 📁 Nueva Estructura (Post-Reorganización)

```
TECNOLOGIAS-WEB-2/
├── services/
│   ├── api-gateway/          # 🚧 Futuro API Gateway
│   ├── user-service/         # 🚧 Futuro User Service
│   ├── catalog-service/      # 🚧 Futuro Catalog Service
│   └── legacy-monolith/      # ✅ Monolito actual (puerto 3001)
│       ├── src/              # Todo el código fuente
│       │   ├── main.ts
│       │   ├── app.module.ts
│       │   ├── common/       # Guards, filters, interceptors
│       │   ├── config/
│       │   └── modules/      # Todos los módulos de negocio
│       ├── package.json
│       └── Dockerfile
├── shared/
│   ├── dto/                  # DTOs compartidos
│   ├── interfaces/           # Interfaces TypeScript
│   └── constants/            # Constantes y enums
├── BaseDeDatos/
├── docker-compose.yml
├── dev.ps1                   # ✨ Script de utilidades
├── MIGRACION-MICROSERVICIOS.md
├── DESARROLLO.md
└── ESTRUCTURA.md
```

> 📖 Ver [`ESTRUCTURA.md`](./ESTRUCTURA.md) para detalles completos.

## 🧱 Módulos implementados

El monolito legacy incluye los siguientes módulos completos:

- **Auth** - Autenticación JWT
- **Users** - Gestión de usuarios
- **Products** - Gestión de productos
- **Categories** - Gestión de categorías
- **Ingredientes** - Gestión de ingredientes
- **Producto-Ingredientes** - Relaciones
- **Pedidos** - Gestión de pedidos
- **Pagos** - Gestión de pagos
- **Reservas** - Gestión de reservas
- **Direcciones** - Direcciones de usuarios
- **Puntos** - Sistema de puntos

## � Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
# Usando el script de utilidades
.\dev.ps1 start-monolith

# O directamente con docker-compose
docker-compose up legacy-monolith
```

Acceder a: **http://localhost:3001/api** (Swagger docs)

### Opción 2: Desarrollo Local

```bash
# Instalar dependencias
cd services/legacy-monolith
npm install

# Iniciar en modo desarrollo
npm run start:dev
```

## 🔧 Requisitos previos

- **Node.js 18+**
- **Docker y Docker Compose** (para opción 1)
- **PostgreSQL** (para desarrollo local)
- **Redis** (para desarrollo local)

## ⚙️ Variables de entorno

El archivo `.env` en la raíz debe contener:

```env
# Aplicación
APP_PORT=3001

# PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_USER=cafeteria_user
POSTGRES_PASSWORD=cafeteria_password
POSTGRES_DB=cafeteria_db

# JWT
JWT_SECRET=your-secret-key

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
DB_PORT=3306
DB_USER=root
DB_PASS=
DB_NAME=cafeteria
JWT_SECRET=supersecret
JWT_EXPIRES=3600s
NODE_ENV=development
```

## ▶️ Scripts

- `npm run start:dev` – desarrollo con watch
- `npm run build` – compila a `dist`
- `npm run start:prod` – ejecuta versión compilada

## 🔌 Endpoints actuales

Prefijo global: `/api`

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /api/products | Crear producto |
| GET | /api/products | Listar productos (incluye categoría) |
| GET | /api/products/:id | Obtener producto por ID |
| PATCH | /api/products/:id | Actualizar producto |
| PUT | /api/products/:id | Reemplazar producto (todos campos obligatorios) |
| DELETE | /api/products/:id | Eliminar producto |
| POST | /api/categories | Crear categoría |
| GET | /api/categories | Listar categorías (incluye productos) |
| GET | /api/categories/:id | Obtener categoría por ID |
| PATCH | /api/categories/:id | Actualizar categoría |
| PUT | /api/categories/:id | Reemplazar categoría |
| DELETE | /api/categories/:id | Eliminar categoría |
| POST | /api/auth/register | Registrar usuario |
| POST | /api/auth/login | Iniciar sesión (JWT) |
| GET | /api/users | Listar usuarios (restringir a admin) |
| GET | /api/users/:id | Obtener usuario |
| PATCH | /api/users/:id | Actualizar usuario |
| PUT | /api/users/:id | Reemplazar usuario |
| DELETE | /api/users/:id | Eliminar usuario (admin) |

Body ejemplo creación:

```json
{
	"nombre": "Capuccino",
	"descripcion": "Bebida caliente",
	"precio": 8.5,
	"categoryId": 1,
	"stock": 10,
	"disponible": true
}
```

Crear categoría:

```json
{
	"nombre": "Bebidas Calientes",
	"descripcion": "Preparaciones calientes"
}
```

## ✅ Validaciones

- `class-validator` + `ValidationPipe` (whitelist, forbidNonWhitelisted).
- Conversión automática de tipos (`transform: true`).
- Límites: `nombre` ≤ 50 (todas las entidades), `email` ≤ 100.
- Contraseñas: mínimo 8 caracteres con mayúscula, minúscula y dígito.
- Mensajes de error JSON unificados mediante filtro global (`AllExceptionsFilter`).
- Códigos HTTP: 201 en POST, 200 en GET/PUT/PATCH/DELETE, 400 validación, 404 no encontrado, 500 interno.

## 🛠 Próximos pasos (siguientes módulos)

1. Proteger endpoints de usuarios y productos con JwtAuthGuard y RolesGuard
2. Añadir paginación y filtros (query params) en listados
3. Logger y manejo centralizado de excepciones (filtro global)
4. Tests unitarios (Jest) de servicios y guards
5. Migraciones TypeORM para producción (desactivar synchronize)
6. Rate limiting básico y helmet (seguridad)

## 🔐 Autenticación

Registro: `POST /api/auth/register`
```json
{
	"nombre": "Juan Perez",
	"email": "juan@example.com",
	"password": "Password123",
	"telefono": "987654321"
}
```

Login: `POST /api/auth/login`
```json
{
	"email": "juan@example.com",
	"password": "Password123"
}
```
Respuesta:
```json
{
	"access_token": "<JWT>",
	"user": { "id": 1, "nombre": "Juan Perez", "email": "juan@example.com", "rol": "cliente" }
}
```

Usar el token en Authorization:
```
Authorization: Bearer <JWT>
```

## 🛠️ Scripts de Utilidades

Usa el script `dev.ps1` para facilitar el desarrollo:

```powershell
# Ver ayuda
.\dev.ps1 help

# Iniciar todos los servicios
.\dev.ps1 start-all

# Iniciar solo el monolito
.\dev.ps1 start-monolith

# Ver logs en tiempo real
.\dev.ps1 logs

# Ver estado de los servicios
.\dev.ps1 status

# Detener servicios
.\dev.ps1 stop-all

# Reconstruir el monolito
.\dev.ps1 rebuild

# Ejecutar tests
.\dev.ps1 test
```

> 📖 Ver [`DESARROLLO.md`](./DESARROLLO.md) para más comandos y guías.

## 📚 Documentación Adicional

- **[MIGRACION-MICROSERVICIOS.md](./MIGRACION-MICROSERVICIOS.md)** - Plan completo de migración a microservicios
- **[ESTRUCTURA.md](./ESTRUCTURA.md)** - Descripción detallada de la estructura del proyecto
- **[DESARROLLO.md](./DESARROLLO.md)** - Guía de desarrollo y comandos útiles
- **[MEJORAS-CALIDAD.md](./MEJORAS-CALIDAD.md)** - Documentación de mejoras de calidad

## 🧪 Testing

```bash
cd services/legacy-monolith

# Tests unitarios
npm test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:coverage
```

## 🔄 Estado de Migración

| Servicio | Estado | Puerto | Descripción |
|----------|--------|--------|-------------|
| Legacy Monolith | ✅ Activo | 3001 | Monolito original funcionando |
| API Gateway | 🚧 Pendiente | 3000 | Punto de entrada único |
| User Service | 🚧 Pendiente | 3002 | Gestión de usuarios y auth |
| Catalog Service | 🚧 Pendiente | 3003 | Productos y categorías |
| Order Service | 🚧 Pendiente | 3004 | Pedidos y pagos |

## 🤝 Contribución

Este proyecto está siendo desarrollado como parte de la materia **Tecnologías Web 2** (Semestre 2-2025).

## 📝 Notas

- El proyecto utiliza **PostgreSQL** en lugar de MySQL
- Se usa `synchronize: true` en desarrollo. Para producción, usar migraciones
- El monolito está preparado para migración gradual a microservicios usando el patrón **Strangler Fig**
- Todos los endpoints están documentados en Swagger: `http://localhost:3001/api`

---

_Proyecto en transición hacia arquitectura de microservicios_ 🚀
