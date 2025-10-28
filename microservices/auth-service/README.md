# 🔐 Auth Service - Sistema Cafetería

Microservicio de **Autenticación y Autorización** del sistema de cafetería.

## 📋 Descripción

Este servicio se encarga de:
- ✅ Registro de nuevos usuarios
- ✅ Autenticación con JWT
- ✅ Validación de tokens
- ✅ Emisión de eventos de usuarios registrados a RabbitMQ

## 🚀 Tecnologías

- **NestJS 10** - Framework backend
- **TypeORM 0.3** - ORM para MySQL
- **MySQL 8** - Base de datos `auth_db`
- **JWT** - Autenticación con tokens
- **RabbitMQ** - Mensajería asíncrona
- **Bcrypt** - Hash de contraseñas

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Copiar configuración de ejemplo
copy .env.example .env

# Editar .env con tus credenciales
```

## 🗄️ Base de Datos

Crear la base de datos `auth_db` ejecutando:

```bash
mysql -u root -p < ../database/init.sql
```

O manualmente:

```sql
CREATE DATABASE auth_db;
USE auth_db;

CREATE TABLE usuarios (
  id_usuario INT(11) NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  contraseña VARCHAR(255) NOT NULL,
  rol ENUM('cliente','admin') DEFAULT 'cliente',
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id_usuario)
);
```

## 🏃 Ejecución

```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod
```

El servicio estará disponible en: `http://localhost:3001`

## 📡 Endpoints

### POST /auth/register
Registrar nuevo usuario

**Request:**
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "telefono": "987654321",
  "rol": "cliente"
}
```

**Response:**
```json
{
  "message": "Usuario registrado exitosamente",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "cliente",
    "fechaRegistro": "2025-10-28T10:30:00.000Z"
  }
}
```

### POST /auth/login
Iniciar sesión

**Request:**
```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "rol": "cliente"
  }
}
```

### GET /auth/profile
Obtener perfil del usuario autenticado

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "rol": "cliente",
  "fechaRegistro": "2025-10-28T10:30:00.000Z"
}
```

### GET /auth/validate
Validar token JWT (usado por otros servicios)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "valid": true,
  "user": {
    "id": 1,
    "email": "juan@example.com",
    "rol": "cliente"
  }
}
```

### GET /auth/health
Health check

**Response:**
```json
{
  "status": "ok",
  "service": "auth-service",
  "timestamp": "2025-10-28T10:30:00.000Z"
}
```

## 🐰 Eventos RabbitMQ

### Eventos Emitidos

#### `user.registered`
Se emite cuando un nuevo usuario se registra exitosamente.

**Payload:**
```json
{
  "id": 1,
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "telefono": "987654321",
  "rol": "cliente",
  "fechaRegistro": "2025-10-28T10:30:00.000Z"
}
```

**Consumidores:**
- `users-service`: Sincroniza el perfil completo del usuario

## 🔒 Seguridad

- ✅ Contraseñas hasheadas con **bcrypt** (10 rounds)
- ✅ Tokens JWT con expiración de 1 hora
- ✅ Validación de DTOs con class-validator
- ✅ CORS habilitado
- ✅ Protección contra inyección SQL (TypeORM)

### Requisitos de Contraseña

- Mínimo 8 caracteres
- Al menos una mayúscula
- Al menos una minúscula
- Al menos un dígito

## 🔧 Variables de Entorno

```bash
# Servidor
PORT=3001
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=auth_db

# JWT
JWT_SECRET=tu_secreto_super_seguro
JWT_EXPIRATION=1h

# RabbitMQ
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=auth_queue
RABBITMQ_EXCHANGE=cafeteria.events
```

## 📊 Arquitectura

```
┌─────────────────┐
│   API Gateway   │
│   (Port 3000)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐       ┌──────────────┐
│  Auth Service   │◄─────►│   MySQL      │
│   (Port 3001)   │       │   auth_db    │
└────────┬────────┘       └──────────────┘
         │
         │ emit: user.registered
         ▼
┌─────────────────┐
│   RabbitMQ      │
│  Exchange:      │
│ cafeteria.events│
└────────┬────────┘
         │
         │ consume: user.registered
         ▼
┌─────────────────┐       ┌──────────────┐
│  Users Service  │◄─────►│   MySQL      │
│   (Port 3002)   │       │   users_db   │
└─────────────────┘       └──────────────┘
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Notas de Desarrollo

1. **Sincronización con Users Service**: Cuando un usuario se registra, se emite un evento `user.registered` que el Users Service consume para crear el perfil completo.

2. **Base de datos mínima**: `auth_db` solo almacena datos necesarios para autenticación (email, contraseña, rol). Los datos completos están en `users_db`.

3. **JWT compartido**: El `JWT_SECRET` debe ser el mismo en todos los servicios para validar tokens correctamente.

4. **Validación de tokens**: Otros servicios pueden llamar a `GET /auth/validate` para verificar tokens sin duplicar lógica.

## 🚨 Troubleshooting

### Error: Cannot connect to MySQL
```bash
# Verificar que MySQL esté corriendo
# Verificar credenciales en .env
# Verificar que auth_db existe
```

### Error: Cannot connect to RabbitMQ
```bash
# Verificar que RabbitMQ esté corriendo
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management
```

### Error: JWT secret mismatch
```bash
# Asegurar que JWT_SECRET sea el mismo en todos los servicios
```

## 📄 Licencia

MIT
