# TECNOLOGIAS-WEB-2

Backend académico para una cafetería usando NestJS 10+, Fastify y TypeORM (MySQL).

## 🚀 Estado actual

Proyecto completo con módulos implementados para gestión de cafetería: autenticación, usuarios, productos, categorías, direcciones, pedidos, pagos, ingredientes, producto-ingredientes, puntos y reservas. Incluye CRUD completo, validaciones, autenticación JWT, guards de roles y manejo de errores centralizado.

## 📁 Estructura de carpetas

```
src/
	main.ts                # Bootstrap con Fastify y ValidationPipe global
	app.module.ts          # Módulo raíz con Config + TypeORM
	config/
		configuration.ts     # Carga centralizada de variables
	common/                # Helpers, pipes, guards, interceptors reutilizables
		decorators/
			roles.decorator.ts
		filters/
			all-exceptions.filter.ts
		guards/
			roles.guard.ts
		interceptors/
			response-format.interceptor.ts
	modules/
		auth/
			auth.controller.ts
			auth.service.ts
			auth.module.ts
			jwt-auth.guard.ts
			jwt.strategy.ts
			dto/
		categories/
			categories.controller.ts
			categories.service.ts
			categories.module.ts
			dto/
			entities/
		direcciones/
			direcciones.controller.ts
			direcciones.service.ts
			direcciones.module.ts
			dto/
			entities/
		ingredientes/
			ingredientes.controller.ts
			ingredientes.service.ts
			ingredientes.module.ts
			dto/
			entities/
		pagos/
			pagos.controller.ts
			pagos.service.ts
			pagos.module.ts
			dto/
			entities/
		pedidos/
			pedidos.controller.ts
			pedidos.service.ts
			pedidos.module.ts
			dto/
			entities/
		producto-ingredientes/
			producto-ingredientes.controller.ts
			producto-ingredientes.service.ts
			producto-ingredientes.module.ts
			dto/
			entities/
		products/
			products.controller.ts
			products.service.ts
			products.module.ts
			dto/
			entities/
		puntos/
			puntos.controller.ts
			puntos.service.ts
			puntos.module.ts
			dto/
			entities/
		reservas/
			reservas.controller.ts
			reservas.service.ts
			reservas.module.ts
			dto/
			entities/
		users/
			users.controller.ts
			users.service.ts
			users.module.ts
			dto/
			entities/
```

## 🧱 Entidades implementadas

- Usuario (`usuarios`)
- Producto (`productos`)
- Categoría (`categorias`)
- Dirección (`direcciones`)
- Pedido (`pedidos`)
- Pedido Detalle (`pedido_detalle`)
- Pago (`pagos`)
- Ingrediente (`ingredientes`)
- Producto Ingrediente (`producto_ingredientes`)
- Punto (`puntos`)
- Reserva (`reservas`)

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
- `npm run lint` – ejecuta ESLint
- `npm run format` – formatea código con Prettier
- `npm run test` – ejecuta tests con Jest
- `npm run test:watch` – tests en modo watch
- `npm run test:coverage` – tests con cobertura

## 🔌 Endpoints actuales

Prefijo global: `/api`

| Método | Ruta | Descripción | Roles |
|--------|------|-------------|-------|
| GET | /api | Información de la API | Público |
| GET | /api/health | Estado de salud | Público |
| POST | /api/auth/register | Registrar usuario | Público |
| POST | /api/auth/login | Iniciar sesión (JWT) | Público |
| POST | /api/users | Crear usuario | admin |
| GET | /api/users | Listar usuarios | admin |
| GET | /api/users/profile | Obtener perfil | autenticado |
| GET | /api/users/:id | Obtener usuario por ID | admin o propio |
| PATCH | /api/users/:id | Actualizar usuario | admin o propio |
| PUT | /api/users/:id | Reemplazar usuario | admin o propio |
| DELETE | /api/users/:id | Eliminar usuario | admin |
| POST | /api/categories | Crear categoría | admin |
| GET | /api/categories | Listar categorías | Público |
| GET | /api/categories/:id | Obtener categoría por ID | Público |
| PATCH | /api/categories/:id | Actualizar categoría | admin |
| PUT | /api/categories/:id | Reemplazar categoría | admin |
| DELETE | /api/categories/:id | Eliminar categoría | admin |
| POST | /api/products | Crear producto | admin |
| GET | /api/products | Listar productos | Público |
| GET | /api/products/:id | Obtener producto por ID | Público |
| PATCH | /api/products/:id | Actualizar producto | admin |
| PUT | /api/products/:id | Reemplazar producto | admin |
| DELETE | /api/products/:id | Eliminar producto | admin |
| POST | /api/direcciones | Crear dirección | autenticado |
| GET | /api/direcciones | Listar direcciones | autenticado |
| GET | /api/direcciones/:id | Obtener dirección por ID | autenticado |
| PATCH | /api/direcciones/:id | Actualizar dirección | autenticado |
| PUT | /api/direcciones/:id | Reemplazar dirección | autenticado |
| DELETE | /api/direcciones/:id | Eliminar dirección | autenticado |
| POST | /api/pedidos | Crear pedido | autenticado |
| GET | /api/pedidos | Listar pedidos | autenticado |
| GET | /api/pedidos/:id | Obtener pedido por ID | autenticado |
| PATCH | /api/pedidos/:id | Actualizar pedido | admin |
| PUT | /api/pedidos/:id | Reemplazar pedido | admin |
| DELETE | /api/pedidos/:id | Eliminar pedido | admin |
| POST | /api/pagos | Crear pago | autenticado |
| GET | /api/pagos | Listar pagos | admin |
| GET | /api/pagos/:id | Obtener pago por ID | admin |
| PATCH | /api/pagos/:id | Actualizar pago | admin |
| PUT | /api/pagos/:id | Reemplazar pago | admin |
| DELETE | /api/pagos/:id | Eliminar pago | admin |
| POST | /api/ingredientes | Crear ingrediente | admin |
| GET | /api/ingredientes | Listar ingredientes | Público |
| GET | /api/ingredientes/:id | Obtener ingrediente por ID | Público |
| PATCH | /api/ingredientes/:id | Actualizar ingrediente | admin |
| PUT | /api/ingredientes/:id | Reemplazar ingrediente | admin |
| DELETE | /api/ingredientes/:id | Eliminar ingrediente | admin |
| POST | /api/producto-ingredientes | Crear relación producto-ingrediente | admin |
| GET | /api/producto-ingredientes | Listar relaciones | Público |
| GET | /api/producto-ingredientes/:id | Obtener relación por ID | Público |
| PATCH | /api/producto-ingredientes/:id | Actualizar relación | admin |
| PUT | /api/producto-ingredientes/:id | Reemplazar relación | admin |
| DELETE | /api/producto-ingredientes/:id | Eliminar relación | admin |
| POST | /api/puntos | Crear punto | admin |
| GET | /api/puntos | Listar puntos | autenticado |
| GET | /api/puntos/:id | Obtener punto por ID | autenticado |
| PATCH | /api/puntos/:id | Actualizar punto | admin |
| PUT | /api/puntos/:id | Reemplazar punto | admin |
| DELETE | /api/puntos/:id | Eliminar punto | admin |
| POST | /api/reservas | Crear reserva | autenticado |
| GET | /api/reservas | Listar reservas | autenticado |
| GET | /api/reservas/:id | Obtener reserva por ID | autenticado |
| PATCH | /api/reservas/:id | Actualizar reserva | admin |
| PUT | /api/reservas/:id | Reemplazar reserva | admin |
| DELETE | /api/reservas/:id | Eliminar reserva | admin |

Body ejemplo creación de producto:

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
- Límites: `nombre` ≤ 100 (todas las entidades), `email` ≤ 100.
- Contraseñas: mínimo 8 caracteres con mayúscula, minúscula y dígito.
- Mensajes de error JSON unificados mediante filtro global (`AllExceptionsFilter`).
- Códigos HTTP: 201 en POST, 200 en GET/PUT/PATCH/DELETE, 400 validación, 404 no encontrado, 500 interno.

## 🛠 Próximos pasos (mejoras futuras)

1. Paginación y filtros (query params) en listados
2. Logger centralizado
3. Tests unitarios completos (Jest) de servicios y guards
4. Migraciones TypeORM para producción (desactivar synchronize)
5. Rate limiting básico y helmet (seguridad)
6. Documentación con Swagger
7. Caché con Redis
8. Notificaciones por email

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
