# TECNOLOGIAS-WEB-2

Backend académico para una cafetería usando NestJS 10+, Fastify y TypeORM (MySQL).

## 🚀 Estado actual

Primera fase: Estructura inicial del proyecto y módulo de Productos (CRUD básico) listo.

## 📁 Estructura de carpetas

```
src/
	main.ts                # Bootstrap con Fastify y ValidationPipe global
	app.module.ts          # Módulo raíz con Config + TypeORM
	config/
		configuration.ts     # Carga centralizada de variables
	common/                # (Reservado) Helpers, pipes, guards, interceptors reutilizables
	modules/
		categories/
			entities/
				category.entity.ts
			categories.module.ts
		products/
			dto/
				create-product.dto.ts
				update-product.dto.ts
			entities/
				product.entity.ts
			products.controller.ts
			products.service.ts
			products.module.ts
```

## 🧱 Entidades implementadas

- Producto (`productos`)
- Categoría (`categorias`) – incluida para relación, CRUD se añadirá después

## 🔧 Requisitos previos

- Node.js 18+
- MySQL en ejecución y base de datos creada (ejecutar script `cafeteria.sql` o permitir `synchronize` en desarrollo)

## ⚙️ Variables de entorno

Copiar `.env.example` a `.env` y ajustar:

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=secret
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

## 🧪 Notas de desarrollo

En entorno no productivo se usa `synchronize: true`. En producción usar migraciones.

---
_Generado como base inicial. Se irá ampliando en iteraciones siguientes._
Este repositorio es para la materia de Tecnologías Web 2 semestre 2-2025
Backend Cafetería
Sistema backend para la gestión de una cafetería, desarrollado con NestJS y MySQL.

Requisitos
Node.js (v16 o superior)
npm
MySQL
Instalación
Clona el repositorio o descarga el proyecto.

Instala las dependencias:

Configura la base de datos:

Crea una base de datos llamada cafeteria en tu servidor MySQL.
Ajusta las credenciales de conexión en src/data-source.ts si es necesario (usuario, contraseña, host).
Ejecuta las migraciones o asegúrate de que la estructura de tablas esté creada (puedes usar los scripts SQL proporcionados).

Ejecución
Modo desarrollo:

Modo producción:

Endpoints principales
CRUD para usuarios, productos y reservas.
Validaciones y manejo de errores con respuestas JSON claras.
Notas
Asegúrate de tener el servicio de MySQL corriendo antes de iniciar el backend.
Puedes probar los endpoints con Postman, Insomnia o cualquier cliente HTTP.
