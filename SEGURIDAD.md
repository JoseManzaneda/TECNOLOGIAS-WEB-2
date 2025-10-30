# Implementación de Seguridad y Autenticación

## Resumen

Este proyecto implementa seguridad completa con **JWT (JSON Web Tokens)** para autenticación y **autorización por roles** (cliente/admin) mediante guards personalizados y decoradores.

## Componentes

### 1. Auth Service (Autenticación Centralizada)

- **Endpoint de registro**: `POST /auth/register`
  - Registra un nuevo usuario con email, contraseña (hasheada con bcrypt), nombre, teléfono y rol.
  - Emit evento `user.registered` a RabbitMQ para sincronizar con Users Service.
  
- **Endpoint de login**: `POST /auth/login`
  - Valida credenciales (email/contraseña).
  - Retorna token JWT firmado con payload: `{ sub: id, email, rol }`.
  
- **Endpoint de validación**: `GET /auth/validate`
  - Protegido con `JwtAuthGuard`.
  - Valida token JWT y retorna datos del usuario.

- **JWT Strategy**: `passport-jwt` extrae el token del header Authorization y valida con el secreto compartido.

### 2. Users Service (Perfiles)

- **Autorización por Roles**:
  - `GET /users` → requiere rol `admin`.
  - `POST /users` → requiere rol `admin`.
  - `GET /users/me` → cualquier usuario autenticado.
  - `PUT /users/:id`, direcciones → usuario autenticado (puede mejorarse para que solo el propio usuario o admin puedan editar).

- **Guards**:
  - `JwtAuthGuard`: valida token JWT.
  - `RolesGuard`: verifica que el usuario tenga el rol requerido (usando decorador `@Roles('admin')`).

### 3. Products Service (Catálogo)

- **Autorización por Roles**:
  - Lectura (GET `/products`, `/categories`) → pública o autenticado.
  - Creación/actualización/borrado → requiere rol `admin`.
    - `POST /products` → `@UseGuards(JwtAuthGuard, RolesGuard)` + `@Roles('admin')`.
    - `PUT/DELETE /products/:id` → igual.
    - `POST/PUT/DELETE /categories/*` → igual.

- **Guards**:
  - `JwtAuthGuard`: valida JWT.
  - `RolesGuard`: valida rol requerido.

### 4. API Gateway

- **Proxy de autenticación**: todas las rutas `/api/auth/*` se proxy a Auth Service.
- El Gateway NO valida JWT; esa responsabilidad queda en cada microservicio para desacoplamiento.
- CORS habilitado para facilitar integración con frontend.

## Flujo Completo

1. **Registro**:
   - Cliente: `POST /api/auth/register` con `{ email, password, nombre, telefono?, rol? }`.
   - Auth Service crea usuario en `auth_db` y emite evento.
   - Users Service recibe evento y crea perfil en `users_db`.

2. **Login**:
   - Cliente: `POST /api/auth/login` con `{ email, password }`.
   - Auth Service valida y retorna `{ access_token, user }`.

3. **Acceso a Recursos Protegidos**:
   - Cliente incluye header: `Authorization: Bearer <token>`.
   - Microservicio valida JWT con `JwtAuthGuard`.
   - Si el endpoint requiere rol específico (ej: admin), `RolesGuard` verifica el rol del payload.

4. **Autorización por Roles**:
   - Usuario con rol `cliente` puede:
     - Ver catálogo (`GET /api/products`, `/api/categories`).
     - Ver su propio perfil (`GET /api/users/me`).
   - Usuario con rol `admin` puede:
     - Todo lo anterior.
     - Crear/actualizar/borrar productos y categorías.
     - Listar todos los usuarios.
     - Crear usuarios manualmente.

## Archivos Clave

- Auth Service:
  - `src/auth/auth.service.ts`: lógica de registro, login, validación.
  - `src/auth/auth.controller.ts`: endpoints de auth.
  - `src/auth/strategies/jwt.strategy.ts`: Passport JWT strategy.
  - `src/auth/guards/jwt-auth.guard.ts`: guard que usa la estrategia.

- Users Service:
  - `src/users/strategies/jwt.strategy.ts`: valida JWT.
  - `src/users/guards/jwt-auth.guard.ts`: guard JWT.
  - `src/common/decorators/roles.decorator.ts`: decorador `@Roles(...)`.
  - `src/common/guards/roles.guard.ts`: guard que verifica roles.
  - `src/users/users.controller.ts`: protección con guards.

- Products Service:
  - `src/auth/strategies/jwt.strategy.ts`: valida JWT.
  - `src/auth/guards/jwt-auth.guard.ts`: guard JWT.
  - `src/common/decorators/roles.decorator.ts`: decorador `@Roles(...)`.
  - `src/common/guards/roles.guard.ts`: guard de roles.
  - `src/products/products.controller.ts`: endpoints protegidos.
  - `src/categories/categories.controller.ts`: endpoints protegidos.

## Variables de Entorno

Todos los servicios comparten el mismo `JWT_SECRET` para validar tokens:

```env
JWT_SECRET=cafeteria_secret_key_super_secure_2025
JWT_EXPIRATION=1h
```

## Ejemplo Funcional

### 1. Registro de Usuario

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123",
  "nombre": "Juan Pérez",
  "telefono": "555-1234",
  "rol": "cliente"
}
```

Respuesta:
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 3,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "cliente",
    "fechaRegistro": "2025-10-30T12:00:00.000Z"
  }
}
```

### 2. Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "juan@example.com",
  "password": "Password123"
}
```

Respuesta:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 3,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "cliente"
  }
}
```

### 3. Acceso a Recurso Público

```bash
GET http://localhost:3000/api/products
```

Funciona sin token (lectura pública).

### 4. Acceso a Recurso Protegido (Usuario Autenticado)

```bash
GET http://localhost:3000/api/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Retorna el perfil del usuario autenticado.

### 5. Intento de Crear Producto (Cliente)

```bash
POST http://localhost:3000/api/products
Authorization: Bearer <token_cliente>
Content-Type: application/json

{
  "nombre": "Nuevo Producto",
  "precio": 50.00,
  "id_categoria": 1
}
```

Respuesta: `403 Forbidden - Acceso denegado` (requiere rol admin).

### 6. Crear Producto (Admin)

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "admin@cafeteria.com",
  "password": "Admin123"
}
```

Tomar el token de admin y:

```bash
POST http://localhost:3000/api/products
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "nombre": "Café Especial",
  "descripcion": "Café de origen único",
  "precio": 65.00,
  "id_categoria": 1,
  "stock": 20
}
```

Respuesta: `201 Created` con el producto creado.

## Pruebas con Swagger

- Auth Service: `http://localhost:3001/docs`
- Users Service: `http://localhost:3002/docs`
- Products Service: `http://localhost:3003/docs`
- API Gateway (agregado): `http://localhost:3000/api/docs`

Cada Swagger tiene un botón "Authorize" para introducir el token JWT (sin el prefijo "Bearer", solo el token).

## Seguridad Implementada

✅ **JWT para autenticación**: tokens firmados con secreto compartido.  
✅ **Contraseñas hasheadas**: bcrypt con salt de 10 rounds.  
✅ **Autorización por roles**: decorador `@Roles()` y guard `RolesGuard`.  
✅ **Endpoints sensibles protegidos**: guards aplicados a creación/actualización/borrado.  
✅ **Validación de tokens**: estrategia Passport JWT en cada servicio.  
✅ **CORS habilitado**: permite integración con frontends.

## Mejoras Opcionales

- Refresh tokens para renovar access tokens sin relogin.
- Rate limiting en el Gateway para prevenir ataques.
- Logging centralizado de accesos y rechazos.
- Encriptación de datos sensibles en tránsito (HTTPS en producción).
