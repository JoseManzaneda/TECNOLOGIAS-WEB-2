# 👤 Users Service - Sistema Cafetería

Microservicio de **Usuarios y Perfiles** del sistema de cafetería.

## ✅ Funcionalidades
- Sincronización de usuarios desde Auth via RabbitMQ (`user.registered`)
- Gestión de perfiles de usuarios (nombre, email, teléfono, rol)
- Gestión de direcciones por usuario
- Endpoints protegidos con JWT

## 🔌 Endpoints
- GET `/users/me` → Perfil del usuario autenticado
- GET `/users` → Listado (requiere JWT)
- GET `/users/:id` → Obtener usuario por ID
- POST `/users` → Crear usuario manualmente (opcional)
- PUT `/users/:id` → Actualizar usuario
- GET `/users/:id/addresses` → Listar direcciones
- POST `/users/:id/addresses` → Agregar dirección
- PUT `/users/:id/addresses/:addressId` → Actualizar dirección
- DELETE `/users/:id/addresses/:addressId` → Eliminar dirección

## 🗃️ Base de Datos: users_db
Tablas:
- `usuarios` (id_usuario, nombre, email, telefono, rol, fecha_registro)
- `direcciones` (id_direccion, id_usuario, direccion, ciudad, referencia)

## 🐰 RabbitMQ
- Exchange: `cafeteria.events`
- Queue: `auth_queue` (escucha eventos publicados por Auth)
- Consume: `user.registered`

## ⚙️ Variables de Entorno
```env
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=users_db
JWT_SECRET=cafeteria_secret_key_super_secure_2025
JWT_EXPIRATION=1h
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=users_queue
RABBITMQ_EXCHANGE=cafeteria.events
```

## ▶️ Cómo correr
```bash
npm install
cp .env.example .env
npm run start:dev
```

## 🔒 Seguridad
- JWT Strategy y guard
- DTOs validados
- TypeORM con parámetros protegidos
