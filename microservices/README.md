# 🏗️ Arquitectura de Microservicios - Cafetería Backend

## 📋 Descripción General

Sistema backend distribuido para cafetería desarrollado con **NestJS**, implementando patrones de microservicios con comunicación REST y eventos asíncronos vía **RabbitMQ**.

## 🎯 Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│            API GATEWAY (Puerto 3000)                    │
│  • Enrutamiento centralizado                            │
│  • Documentación Swagger unificada                      │
│  • Validación de JWT                                    │
└──────────────┬──────────────────────────────────────────┘
               │
       ┌───────┴────────┬─────────────────┐
       │                │                 │
┌──────▼──────┐  ┌─────▼──────┐  ┌──────▼──────┐
│AUTH SERVICE │  │USER SERVICE│  │PRODUCTS SVC │
│Puerto: 3001 │  │Puerto: 3002│  │Puerto: 3003 │
│DB: auth_db  │  │DB: users_db│  │DB: prod_db  │
└─────────────┘  └────────────┘  └─────────────┘
       │                │                 │
       └────────────────┴─────────────────┘
                        │
                 ┌──────▼──────┐
                 │  RabbitMQ   │
                 │(Puerto 5672)│
                 └─────────────┘
```

## 📦 Microservicios

### 1. **API Gateway** (Puerto 3000)
- **Responsabilidad**: Punto de entrada único, enrutamiento y documentación
- **Tecnología**: NestJS + Swagger
- **Endpoints**:
  - `/api/auth/*` → Auth Service
  - `/api/users/*` → Users Service
  - `/api/products/*` → Products Service
  - `/api/docs` → Documentación Swagger

### 2. **Auth Service** (Puerto 3001)
- **Responsabilidad**: Autenticación JWT, registro y login
- **Base de Datos**: `auth_db` (MySQL)
- **Tablas**: `usuarios` (solo datos de auth)
- **Endpoints**:
  - `POST /auth/register` - Registrar usuario
  - `POST /auth/login` - Iniciar sesión
- **Eventos publicados**:
  - `user.registered` - Cuando se registra un nuevo usuario

### 3. **Users Service** (Puerto 3002)
- **Responsabilidad**: Gestión de perfiles y datos de usuario
- **Base de Datos**: `users_db` (MySQL)
- **Tablas**: `usuarios`, `direcciones`
- **Endpoints**:
  - `GET /users` - Listar usuarios (admin)
  - `GET /users/:id` - Obtener usuario
  - `GET /users/profile` - Perfil del usuario autenticado
  - `PATCH /users/:id` - Actualizar usuario
  - `DELETE /users/:id` - Eliminar usuario (admin)
- **Eventos suscritos**:
  - `user.registered` - Sincronizar datos de nuevo usuario

### 4. **Products Service** (Puerto 3003)
- **Responsabilidad**: Catálogo de productos y categorías
- **Base de Datos**: `products_db` (MySQL)
- **Tablas**: `productos`, `categorias`
- **Endpoints**:
  - `GET /products` - Listar productos
  - `GET /products/:id` - Obtener producto
  - `POST /products` - Crear producto (admin)
  - `PATCH /products/:id` - Actualizar producto (admin)
  - `DELETE /products/:id` - Eliminar producto (admin)
  - `GET /categories` - Listar categorías
  - `POST /categories` - Crear categoría (admin)
- **Eventos publicados**:
  - `product.created` - Nuevo producto creado
  - `product.updated` - Producto actualizado
  - `product.deleted` - Producto eliminado

## 🔄 Comunicación entre Servicios

### **Síncrona (REST)**
- API Gateway → Servicios (HTTP)
- Validación de JWT en cada servicio
- Timeouts configurados (5s)

### **Asíncrona (RabbitMQ)**
- **Exchange**: `cafeteria.events` (tipo: topic)
- **Routing Keys**:
  - `user.registered`
  - `product.created`
  - `product.updated`
  - `product.deleted`
- **Patrón**: Publish/Subscribe con colas dedicadas por servicio

## 🗄️ Bases de Datos

### Diseño de Independencia

```sql
-- Base de datos 1: Autenticación
CREATE DATABASE auth_db;
USE auth_db;
CREATE TABLE usuarios (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  contraseña VARCHAR(255),
  rol ENUM('cliente','admin'),
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Base de datos 2: Usuarios
CREATE DATABASE users_db;
USE users_db;
CREATE TABLE usuarios (
  id_usuario INT PRIMARY KEY,  -- Sincronizado con auth_db
  nombre VARCHAR(100),
  email VARCHAR(100),
  telefono VARCHAR(20),
  rol ENUM('cliente','admin')
);
CREATE TABLE direcciones (
  id_direccion INT PRIMARY KEY AUTO_INCREMENT,
  id_usuario INT,
  direccion VARCHAR(255),
  ciudad VARCHAR(100),
  referencia TEXT
);

-- Base de datos 3: Productos
CREATE DATABASE products_db;
USE products_db;
CREATE TABLE categorias (
  id_categoria INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  descripcion TEXT
);
CREATE TABLE productos (
  id_producto INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(100),
  descripcion TEXT,
  precio DECIMAL(10,2),
  id_categoria INT,
  imagen_url VARCHAR(255),
  stock INT DEFAULT 0,
  disponible TINYINT(1) DEFAULT 1
);
```

## 🚀 Instalación y Despliegue

### Prerrequisitos
- Node.js 18+
- MySQL 8+
- RabbitMQ 3.12+
- Docker & Docker Compose (opcional)

### Opción 1: Manual

```bash
# 1. Instalar dependencias en cada servicio
cd microservices/api-gateway && npm install
cd ../auth-service && npm install
cd ../users-service && npm install
cd ../products-service && npm install

# 2. Crear bases de datos
mysql -u root -p < microservices/database/init.sql

# 3. Configurar variables de entorno
# Copiar .env.example a .env en cada servicio

# 4. Iniciar RabbitMQ
docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management

# 5. Iniciar servicios (en terminales separadas)
cd microservices/auth-service && npm run start:dev
cd microservices/users-service && npm run start:dev
cd microservices/products-service && npm run start:dev
cd microservices/api-gateway && npm run start:dev
```

### Opción 2: Docker Compose

```bash
cd microservices
docker-compose up -d
```

## 📝 Variables de Entorno

### API Gateway (.env)
```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
USERS_SERVICE_URL=http://localhost:3002
PRODUCTS_SERVICE_URL=http://localhost:3003
JWT_SECRET=your-secret-key-here
RABBITMQ_URL=amqp://localhost:5672
```

### Auth Service (.env)
```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=auth_db
JWT_SECRET=your-secret-key-here
JWT_EXPIRES=3600s
RABBITMQ_URL=amqp://localhost:5672
```

### Users Service (.env)
```env
PORT=3002
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=users_db
JWT_SECRET=your-secret-key-here
RABBITMQ_URL=amqp://localhost:5672
```

### Products Service (.env)
```env
PORT=3003
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASS=password
DB_NAME=products_db
JWT_SECRET=your-secret-key-here
RABBITMQ_URL=amqp://localhost:5672
```

## 📚 Documentación API

Una vez iniciados los servicios, accede a:

- **Swagger UI**: http://localhost:3000/api/docs
- **RabbitMQ Management**: http://localhost:15672 (guest/guest)

## 🧪 Testing

```bash
# Tests unitarios por servicio
cd microservices/auth-service && npm test
cd microservices/users-service && npm test
cd microservices/products-service && npm test

# Tests de integración
cd microservices && npm run test:e2e
```

## 🔒 Seguridad

- ✅ **Autenticación JWT**: Tokens validados en cada servicio
- ✅ **Roles**: admin/cliente con guards
- ✅ **CORS**: Configurado en API Gateway
- ✅ **Rate Limiting**: Protección contra DDoS
- ✅ **Validaciones**: class-validator en todos los DTOs
- ✅ **Sanitización**: Protección contra SQL injection

## 📊 Monitoreo

- **Health Checks**: `/health` en cada servicio
- **Logs**: Formato JSON estructurado
- **Métricas**: Prometheus compatible (opcional)

## 🛠️ Tecnologías Utilizadas

- **Framework**: NestJS 10
- **Lenguaje**: TypeScript 5
- **Base de Datos**: MySQL 8
- **Mensajería**: RabbitMQ 3
- **ORM**: TypeORM 0.3
- **Autenticación**: JWT + Passport
- **Validación**: class-validator
- **Documentación**: Swagger/OpenAPI
- **Testing**: Jest

## 📖 Patrones Implementados

- ✅ **API Gateway Pattern**: Punto de entrada único
- ✅ **Database per Service**: Independencia de datos
- ✅ **Event-Driven**: Comunicación asíncrona
- ✅ **Circuit Breaker**: Tolerancia a fallos (opcional)
- ✅ **Service Discovery**: Variables de entorno
- ✅ **Saga Pattern**: Transacciones distribuidas (futuro)

## 🔄 Roadmap

- [ ] Implementar API Gateway con circuit breaker
- [ ] Añadir service mesh (Istio/Linkerd)
- [ ] Implementar distributed tracing (Jaeger)
- [ ] Añadir cache distribuido (Redis)
- [ ] Implementar CQRS para productos
- [ ] Health checks avanzados
- [ ] Auto-scaling con Kubernetes

## 📄 Licencia

MIT

## 👥 Equipo

Desarrollo académico - Tecnologías Web 2

---

**🚀 Sistema listo para producción con arquitectura de microservicios empresarial**
