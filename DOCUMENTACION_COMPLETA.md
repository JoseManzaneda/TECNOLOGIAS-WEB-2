# 📚 DOCUMENTACIÓN COMPLETA - API CAFETERÍA

## 🎯 Resumen Ejecutivo

Este es un **backend académico completo** para gestión de cafetería desarrollado con:
- **Framework**: NestJS 10+
- **Base de datos**: MySQL (TypeORM)
- **Servidor**: Fastify
- **Autenticación**: JWT (JSON Web Tokens)
- **Validaciones**: Class Validator + Class Transformer
- **Testing**: Jest
- **Seguridad**: Roles basados en Guards y Decorators

### 📊 Estado del Proyecto
✅ **Completo y funcional** - Todos los módulos implementados con CRUD completo, validaciones, autenticación JWT, guards de roles y manejo centralizado de errores.

---

## 🏗️ ARQUITECTURA DEL PROYECTO

### Estructura de Carpetas

```
TECNOLOGIAS-WEB-2/
├── BaseDeDatos/
│   └── cafeteria.sql              # Script de base de datos
├── src/
│   ├── main.ts                    # Bootstrap con Fastify y Global Pipes
│   ├── app.module.ts              # Módulo raíz
│   ├── config/
│   │   └── configuration.ts       # Configuración centralizada
│   ├── common/                    # Código reutilizable
│   │   ├── decorators/
│   │   │   └── roles.decorator.ts
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts
│   │   ├── guards/
│   │   │   └── roles.guard.ts
│   │   └── interceptors/
│   │       └── response-format.interceptor.ts
│   └── modules/                   # Módulos de negocio
│       ├── auth/
│       ├── users/
│       ├── products/
│       ├── categories/
│       ├── direcciones/
│       ├── pedidos/
│       ├── pagos/
│       ├── ingredientes/
│       ├── producto-ingredientes/
│       ├── puntos/
│       └── reservas/
├── jest.config.json
├── tsconfig.json
├── package.json
└── README.md
```

### Stack Tecnológico

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | NestJS | ^10.0.0 |
| Servidor HTTP | Fastify | ^10.0.0 |
| Base de Datos | MySQL | 3.9.7 |
| ORM | TypeORM | ^0.3.20 |
| Autenticación | JWT | ^10.0.0 |
| Validación | Class Validator | ^0.14.0 |
| Testing | Jest | ^30.2.0 |
| Lenguaje | TypeScript | ^5.4.2 |

### Configuración Global

#### main.ts - Bootstrap de la aplicación
```typescript
- FastifyAdapter: Servidor HTTP de alto rendimiento
- ValidationPipe: Validación global de DTOs con whitelist y transformación
- AllExceptionsFilter: Manejo centralizado de excepciones
- ResponseFormatInterceptor: Formato unificado de respuestas
- Puerto: 3000 (configurable con PORT)
- Prefijo API: /api
```

#### app.module.ts - Módulo raíz
```typescript
- ConfigModule: Variables de entorno globales
- TypeOrmModule: Conexión a MySQL con auto-carga de entidades
- Sincronización automática en desarrollo
- Charset utf8mb4 para soporte de caracteres especiales
```

---

## 🔐 AUTENTICACIÓN Y SEGURIDAD

### Sistema de Autenticación

#### JWT (JSON Web Tokens)
- **Estrategia**: Passport + JWT
- **Almacenamiento**: En headers como `Authorization: Bearer <TOKEN>`
- **Duración**: Configurable (típicamente 24 horas)
- **Validación**: Automática en endpoints protegidos

#### Roles y Guards
```typescript
- admin: Acceso completo a todas las funcionalidades
- cliente: Acceso limitado a sus propios recursos

Implementación:
- @UseGuards(JwtAuthGuard, RolesGuard): Protege endpoints
- @Roles('admin', 'cliente'): Define roles permitidos
- req.user: Contiene información del usuario autenticado
```

#### Contrasñas
- **Encriptación**: bcrypt (^5.1.1)
- **Almacenamiento**: Hash seguro en base de datos
- **Validación**: 
  - Mínimo 8 caracteres
  - Al menos una mayúscula
  - Al menos una minúscula
  - Al menos un número

---

## 📡 ENDPOINTS API

### 1️⃣ AUTENTICACIÓN (`/api/auth`)

#### POST `/api/auth/register`
Registrar nuevo usuario (registro público)

**Acceso**: Sin autenticación

**Request Body**:
```json
{
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "password": "Password123",
  "telefono": "987654321"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "987654321",
    "rol": "cliente",
    "fechaRegistro": "2025-11-25T10:30:00Z"
  }
}
```

**Validaciones**:
- Email único y válido
- Contraseña fuerte (mín 8 caracteres, mayúscula, minúscula, número)
- Teléfono válido

---

#### POST `/api/auth/login`
Iniciar sesión y obtener JWT

**Acceso**: Sin autenticación

**Request Body**:
```json
{
  "email": "juan@example.com",
  "password": "Password123"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "rol": "cliente"
    }
  }
}
```

**Errores**:
- 401: Email o contraseña incorrectos
- 400: Datos incompletos

---

### 2️⃣ USUARIOS (`/api/users`)

#### POST `/api/users`
Crear nuevo usuario (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "nombre": "Pedro García",
  "email": "pedro@example.com",
  "password": "SecurePass123",
  "telefono": "123456789",
  "rol": "cliente"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 2,
    "nombre": "Pedro García",
    "email": "pedro@example.com",
    "telefono": "123456789",
    "rol": "cliente"
  }
}
```

---

#### GET `/api/users`
Listar todos los usuarios (solo admin)

**Acceso**: JWT + Rol `admin`

**Query Parameters**: Ninguno

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "nombre": "Juan Pérez",
      "email": "juan@example.com",
      "telefono": "987654321",
      "rol": "cliente",
      "activo": true,
      "fechaRegistro": "2025-11-25T10:30:00Z"
    },
    {
      "id": 2,
      "nombre": "Pedro García",
      "email": "pedro@example.com",
      "telefono": "123456789",
      "rol": "admin"
    }
  ]
}
```

---

#### GET `/api/users/profile`
Obtener perfil del usuario autenticado

**Acceso**: JWT (cualquier rol)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "987654321",
    "rol": "cliente"
  }
}
```

---

#### GET `/api/users/:id`
Obtener usuario específico (admin o el mismo usuario)

**Acceso**: JWT (admin o el usuario con ese ID)

**Path Parameters**:
- `id`: ID del usuario (número)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "telefono": "987654321",
    "rol": "cliente"
  }
}
```

---

#### PATCH `/api/users/:id`
Actualizar usuario parcialmente

**Acceso**: JWT (admin o el mismo usuario)

**Request Body** (todos opcionales):
```json
{
  "nombre": "Juan Carlos Pérez",
  "telefono": "987654321"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "nombre": "Juan Carlos Pérez",
    "email": "juan@example.com",
    "telefono": "987654321"
  }
}
```

---

#### PUT `/api/users/:id`
Reemplazar usuario completamente

**Acceso**: JWT (admin o el mismo usuario)

**Request Body**:
```json
{
  "nombre": "Juan Carlos Pérez",
  "email": "juan.carlos@example.com",
  "password": "NewPassword123",
  "telefono": "123456789",
  "rol": "cliente"
}
```

**Response** (200 OK): Usuario actualizado

---

#### DELETE `/api/users/:id`
Eliminar usuario (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "mensaje": "Usuario eliminado exitosamente",
    "id": 1
  }
}
```

---

### 3️⃣ PRODUCTOS (`/api/products`)

#### POST `/api/products`
Crear nuevo producto (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "nombre": "Cappuccino",
  "descripcion": "Café espresso con leche vaporizada",
  "precio": 8.50,
  "categoryId": 1,
  "imagenUrl": "https://example.com/cappuccino.jpg",
  "stock": 50,
  "disponible": true
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "nombre": "Cappuccino",
    "descripcion": "Café espresso con leche vaporizada",
    "precio": 8.50,
    "stock": 50,
    "disponible": true,
    "imagenUrl": "https://example.com/cappuccino.jpg",
    "categoria": {
      "id": 1,
      "nombre": "Bebidas Calientes"
    }
  }
}
```

**Validaciones**:
- Nombre único
- Precio positivo
- Stock no negativo
- Categoría existente

---

#### GET `/api/products`
Listar todos los productos (público)

**Acceso**: Sin autenticación

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "nombre": "Cappuccino",
      "descripcion": "Café espresso con leche vaporizada",
      "precio": 8.50,
      "stock": 50,
      "disponible": true,
      "categoria": {
        "id": 1,
        "nombre": "Bebidas Calientes"
      }
    }
  ]
}
```

---

#### GET `/api/products/:id`
Obtener producto por ID (público)

**Acceso**: Sin autenticación

**Response** (200 OK): Un solo producto

---

#### PATCH `/api/products/:id`
Actualizar producto parcialmente (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "precio": 9.00,
  "stock": 30
}
```

**Response** (200 OK): Producto actualizado

---

#### PUT `/api/products/:id`
Reemplazar producto completamente (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**: Mismo que POST

**Response** (200 OK): Producto reemplazado

---

#### DELETE `/api/products/:id`
Eliminar producto (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "mensaje": "Producto eliminado exitosamente",
    "id": 1
  }
}
```

---

### 4️⃣ CATEGORÍAS (`/api/categories`)

#### POST `/api/categories`
Crear nueva categoría (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "nombre": "Bebidas Calientes",
  "descripcion": "Cafés, tés y otras bebidas calientes"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "nombre": "Bebidas Calientes",
    "descripcion": "Cafés, tés y otras bebidas calientes"
  }
}
```

**Validaciones**:
- Nombre único
- Descripción opcional

---

#### GET `/api/categories`
Listar todas las categorías (público)

**Acceso**: Sin autenticación

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "nombre": "Bebidas Calientes",
      "descripcion": "Cafés, tés y otras bebidas calientes",
      "productos": [
        {
          "id": 1,
          "nombre": "Cappuccino"
        }
      ]
    }
  ]
}
```

---

#### GET `/api/categories/:id`
Obtener categoría por ID (público)

**Acceso**: Sin autenticación

**Response** (200 OK): Una sola categoría con sus productos

---

#### PATCH `/api/categories/:id`
Actualizar categoría (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "descripcion": "Nueva descripción"
}
```

**Response** (200 OK): Categoría actualizada

---

#### DELETE `/api/categories/:id`
Eliminar categoría (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Categoría eliminada

---

### 5️⃣ DIRECCIONES (`/api/direcciones`)

#### POST `/api/direcciones`
Crear nueva dirección

**Acceso**: JWT (cualquier rol)

**Request Body**:
```json
{
  "direccion": "Av. Siempre Viva 123, Col. Centro",
  "ciudad": "Ciudad de México",
  "referencia": "Entre calle A y calle B, casa azul"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "usuarioId": 1,
    "direccion": "Av. Siempre Viva 123, Col. Centro",
    "ciudad": "Ciudad de México",
    "referencia": "Entre calle A y calle B, casa azul",
    "fechaCreacion": "2025-11-25T10:30:00Z"
  }
}
```

---

#### GET `/api/direcciones`
Listar direcciones (admin: todas, cliente: propias)

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Array de direcciones

---

#### GET `/api/direcciones/:id`
Obtener dirección por ID (admin o propietario)

**Acceso**: JWT (admin o el propietario)

**Response** (200 OK): Una sola dirección

---

#### GET `/api/direcciones/user/:userId`
Obtener direcciones de un usuario (admin o el mismo usuario)

**Acceso**: JWT (admin o el usuario con ese ID)

**Path Parameters**:
- `userId`: ID del usuario

**Response** (200 OK): Array de direcciones del usuario

---

#### PATCH `/api/direcciones/:id`
Actualizar dirección

**Acceso**: JWT (admin o propietario)

**Request Body**:
```json
{
  "ciudad": "Guadalajara"
}
```

**Response** (200 OK): Dirección actualizada

---

#### DELETE `/api/direcciones/:id`
Eliminar dirección

**Acceso**: JWT (admin o propietario)

**Response** (200 OK): Dirección eliminada

---

### 6️⃣ PEDIDOS (`/api/pedidos`)

#### POST `/api/pedidos`
Crear nuevo pedido

**Acceso**: JWT (cualquier rol)

**Request Body**:
```json
{
  "metodoPago": "tarjeta",
  "detalles": [
    {
      "productoId": 1,
      "cantidad": 2
    },
    {
      "productoId": 3,
      "cantidad": 1
    }
  ]
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "usuarioId": 1,
    "estado": "pendiente",
    "metodoPago": "tarjeta",
    "total": 25.00,
    "detalles": [
      {
        "productoId": 1,
        "cantidad": 2,
        "precioUnitario": 8.50
      }
    ],
    "fechaCreacion": "2025-11-25T10:30:00Z"
  }
}
```

**Validaciones**:
- Al menos un producto
- Cantidad positiva
- Productos existentes

---

#### GET `/api/pedidos`
Listar pedidos (admin: todos, cliente: propios)

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Array de pedidos

---

#### GET `/api/pedidos/estadisticas`
Obtener estadísticas de pedidos (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "totalPedidos": 50,
    "ingresoTotal": 5000.75,
    "promedioPedido": 100.01,
    "estadosPedidos": {
      "pendiente": 10,
      "en_proceso": 5,
      "entregado": 35
    }
  }
}
```

---

#### GET `/api/pedidos/:id`
Obtener pedido por ID (admin o propietario)

**Acceso**: JWT (admin o el propietario)

**Response** (200 OK): Un solo pedido con detalles

---

#### GET `/api/pedidos/user/:userId`
Obtener pedidos de un usuario

**Acceso**: JWT (admin o el usuario)

**Path Parameters**:
- `userId`: ID del usuario

**Response** (200 OK): Array de pedidos del usuario

---

#### PATCH `/api/pedidos/:id`
Actualizar estado de pedido

**Acceso**: JWT (admin: cambiar cualquier estado, cliente: solo cancelar propio)

**Request Body**:
```json
{
  "estado": "en_proceso"
}
```

**Estados válidos**: `pendiente`, `en_proceso`, `entregado`, `cancelado`

**Response** (200 OK): Pedido actualizado

---

#### DELETE `/api/pedidos/:id`
Eliminar pedido (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Pedido eliminado

---

### 7️⃣ PAGOS (`/api/pagos`)

#### POST `/api/pagos`
Crear nuevo pago

**Acceso**: JWT (cualquier rol)

**Request Body**:
```json
{
  "pedidoId": 1,
  "monto": 150.75,
  "metodo": "tarjeta"
}
```

**Métodos válidos**: `efectivo`, `tarjeta`, `transferencia`, `billetera`

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "pedidoId": 1,
    "monto": 150.75,
    "metodo": "tarjeta",
    "estado": "pendiente",
    "fechaCreacion": "2025-11-25T10:30:00Z"
  }
}
```

**Validaciones**:
- Pedido existente
- Monto positivo
- Monto no mayor al total del pedido

---

#### GET `/api/pagos`
Listar pagos (admin: todos, cliente: propios)

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Array de pagos

---

#### GET `/api/pagos/estadisticas`
Obtener estadísticas de pagos (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "totalPagos": 100,
    "montoProcesado": 10000.00,
    "montoPromedio": 100.00,
    "estadosPagos": {
      "pendiente": 20,
      "procesado": 75,
      "rechazado": 5
    }
  }
}
```

---

#### GET `/api/pagos/:id`
Obtener pago por ID (admin o propietario del pedido)

**Acceso**: JWT

**Response** (200 OK): Un solo pago

---

#### GET `/api/pagos/pedido/:pedidoId`
Obtener pagos de un pedido

**Acceso**: JWT (admin o propietario del pedido)

**Response** (200 OK): Array de pagos del pedido

---

#### PATCH `/api/pagos/:id`
Actualizar pago

**Acceso**: JWT (admin: todo, cliente: solo monto/método en pendientes)

**Request Body**:
```json
{
  "monto": 160.00,
  "metodo": "transferencia"
}
```

**Response** (200 OK): Pago actualizado

---

#### PATCH `/api/pagos/:id/procesar`
Procesar pago (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "estado": "procesado"
  }
}
```

---

#### DELETE `/api/pagos/:id`
Eliminar pago (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Pago eliminado

---

### 8️⃣ INGREDIENTES (`/api/ingredientes`)

#### POST `/api/ingredientes`
Crear nuevo ingrediente (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "nombre": "Café molido",
  "unidad": "gramos"
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "nombre": "Café molido",
    "unidad": "gramos",
    "fechaCreacion": "2025-11-25T10:30:00Z"
  }
}
```

**Validaciones**:
- Nombre único
- Unidad válida (gramos, ml, unidad, etc.)

---

#### GET `/api/ingredientes`
Obtener todos los ingredientes

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Array de ingredientes ordenados alfabéticamente

---

#### GET `/api/ingredientes/estadisticas`
Obtener estadísticas (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "totalIngredientes": 25,
    "unidadesMasUsadas": [
      { "unidad": "gramos", "cantidad": 15 }
    ]
  }
}
```

---

#### GET `/api/ingredientes/buscar`
Buscar ingrediente por nombre

**Acceso**: JWT (cualquier rol)

**Query Parameters**:
- `nombre`: Término de búsqueda

**Response** (200 OK): Array de ingredientes que coinciden

---

#### GET `/api/ingredientes/:id`
Obtener ingrediente específico

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Un solo ingrediente

---

#### PATCH `/api/ingredientes/:id`
Actualizar ingrediente (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "unidad": "kg"
}
```

**Response** (200 OK): Ingrediente actualizado

---

#### DELETE `/api/ingredientes/:id`
Eliminar ingrediente (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Ingrediente eliminado

---

### 9️⃣ PRODUCTO-INGREDIENTES (`/api/producto-ingredientes`)

#### POST `/api/producto-ingredientes`
Crear relación producto-ingrediente (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "productoId": 1,
  "ingredienteId": 2,
  "cantidad": 50.5
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "productoId": 1,
    "ingredienteId": 2,
    "cantidad": 50.5,
    "fechaCreacion": "2025-11-25T10:30:00Z"
  }
}
```

---

#### POST `/api/producto-ingredientes/multiple/:productoId`
Crear múltiples relaciones para un producto (solo admin)

**Acceso**: JWT + Rol `admin`

**Path Parameters**:
- `productoId`: ID del producto

**Request Body**:
```json
[
  { "ingredienteId": 2, "cantidad": 50 },
  { "ingredienteId": 3, "cantidad": 25 },
  { "ingredienteId": 4 }
]
```

**Response** (201 Created): Array de relaciones creadas

---

#### GET `/api/producto-ingredientes`
Listar todas las relaciones

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Array de relaciones

---

#### GET `/api/producto-ingredientes/estadisticas`
Obtener estadísticas (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "totalRelaciones": 100,
    "productosConIngredientes": 25,
    "ingredienteMasUsado": "Café molido"
  }
}
```

---

#### GET `/api/producto-ingredientes/producto/:id`
Obtener ingredientes de un producto

**Acceso**: JWT (cualquier rol)

**Path Parameters**:
- `id`: ID del producto

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "ingredienteId": 2,
      "nombre": "Café molido",
      "cantidad": 50.5,
      "unidad": "gramos"
    }
  ]
}
```

---

#### GET `/api/producto-ingredientes/ingrediente/:id`
Obtener productos que usan un ingrediente

**Acceso**: JWT (cualquier rol)

**Path Parameters**:
- `id`: ID del ingrediente

**Response** (200 OK): Array de productos

---

#### GET `/api/producto-ingredientes/:productoId/:ingredienteId`
Obtener relación específica

**Acceso**: JWT (cualquier rol)

**Response** (200 OK): Una sola relación

---

#### PATCH `/api/producto-ingredientes/:productoId/:ingredienteId`
Actualizar relación (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "cantidad": 75.5
}
```

**Response** (200 OK): Relación actualizada

---

#### DELETE `/api/producto-ingredientes/:productoId/:ingredienteId`
Eliminar relación (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Relación eliminada

---

### 🔟 PUNTOS (`/api/puntos`)

Sistema de fidelidad y recompensas para clientes

#### POST `/api/puntos`
Crear registro de puntos (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "userId": 5,
  "puntosAcumulados": 150
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "userId": 5,
    "puntosAcumulados": 150,
    "ultimaActualizacion": "2025-11-25T10:30:00Z"
  }
}
```

---

#### GET `/api/puntos`
Listar todos los registros (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Array ordenado por puntos descendentes

---

#### GET `/api/puntos/mis-puntos`
Obtener mis puntos (usuario autenticado)

**Acceso**: JWT (cualquier rol)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "id": 1,
    "userId": 1,
    "puntosAcumulados": 1250,
    "ultimaActualizacion": "2025-11-25T14:30:00Z"
  }
}
```

---

#### GET `/api/puntos/ranking`
Ranking de usuarios con más puntos (solo admin)

**Acceso**: JWT + Rol `admin`

**Query Parameters**:
- `limit`: Cantidad de usuarios (default: 10)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": [
    {
      "id": 1,
      "nombre": "María García",
      "puntosAcumulados": 5000,
      "posicion": 1
    }
  ]
}
```

---

#### GET `/api/puntos/estadisticas`
Estadísticas del sistema (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "puntosGlobales": 50000,
    "promedioUsuario": 500,
    "usuariosActivos": 100
  }
}
```

---

#### GET `/api/puntos/usuario/:userId`
Puntos de un usuario específico

**Acceso**: JWT (admin o el mismo usuario)

**Path Parameters**:
- `userId`: ID del usuario

**Response** (200 OK): Puntos del usuario

---

#### POST `/api/puntos/usuario/:userId/agregar`
Agregar puntos (solo admin)

**Acceso**: JWT + Rol `admin`

**Path Parameters**:
- `userId`: ID del usuario

**Request Body**:
```json
{
  "puntosAAgregar": 100,
  "razon": "Compra completada"
}
```

**Response** (200 OK): Puntos actualizados

---

#### POST `/api/puntos/usuario/:userId/canjear`
Canjear puntos

**Acceso**: JWT (admin o el mismo usuario)

**Path Parameters**:
- `userId`: ID del usuario

**Request Body**:
```json
{
  "puntosCanjear": 500,
  "premio": "descuento_10"
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "puntosCanjeados": 500,
    "premioOtorgado": "descuento_10",
    "puntosRestantes": 750
  }
}
```

---

#### PATCH `/api/puntos/:id`
Actualizar registro (solo admin)

**Acceso**: JWT + Rol `admin`

**Request Body**:
```json
{
  "puntosAcumulados": 2000
}
```

**Response** (200 OK): Registro actualizado

---

#### DELETE `/api/puntos/:id`
Eliminar registro (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Registro eliminado

---

### 1️⃣1️⃣ RESERVAS (`/api/reservas`)

Sistema completo de reservas de mesa con validaciones de negocio

#### POST `/api/reservas`
Crear nueva reserva

**Acceso**: JWT (rol `admin` o `cliente`)

**Request Body**:
```json
{
  "fechaReserva": "2025-12-25",
  "hora": "19:30",
  "numPersonas": 4
}
```

**Response** (201 Created):
```json
{
  "status": "success",
  "code": 201,
  "data": {
    "id": 1,
    "userId": 1,
    "fechaReserva": "2025-12-25",
    "hora": "19:30",
    "numPersonas": 4,
    "estado": "pendiente",
    "fechaCreacion": "2025-11-25T10:30:00Z"
  }
}
```

**Validaciones de Negocio**:
- Fecha futura con mínimo 24 horas de anticipación
- Horario dentro de 08:00-22:00
- Capacidad: 1-12 personas
- Usuario activo
- No pueden tener 2 reservas en el mismo horario

---

#### GET `/api/reservas`
Obtener todas las reservas con filtros

**Acceso**: JWT (admin: todas, cliente: propias)

**Query Parameters** (opcionales):
- `estado`: `pendiente`, `confirmada`, `cancelada`
- `fecha`: Formato YYYY-MM-DD
- `userId`: Solo admin

**Response** (200 OK): Array de reservas

---

#### GET `/api/reservas/estadisticas`
Estadísticas de reservas (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "totalReservas": 150,
    "reservasConfirmadas": 100,
    "horariosPopulares": [
      { "hora": "19:00", "reservas": 15 }
    ],
    "personasPromedio": 4.2
  }
}
```

---

#### GET `/api/reservas/disponibilidad`
Obtener horarios disponibles para una fecha

**Acceso**: Sin autenticación

**Query Parameters**:
- `fecha`: Formato YYYY-MM-DD (requerido)
- `numPersonas`: Cantidad de personas (opcional)

**Response** (200 OK):
```json
{
  "status": "success",
  "code": 200,
  "data": {
    "fecha": "2025-12-25",
    "horariosDisponibles": [
      "09:00", "09:30", "10:00", "19:00", "19:30"
    ]
  }
}
```

---

#### GET `/api/reservas/:id`
Obtener reserva específica (admin o propietario)

**Acceso**: JWT (admin o el propietario)

**Path Parameters**:
- `id`: ID de la reserva

**Response** (200 OK): Una sola reserva

---

#### GET `/api/reservas/usuario/:userId`
Obtener reservas de un usuario (admin o el mismo usuario)

**Acceso**: JWT (admin o el usuario)

**Path Parameters**:
- `userId`: ID del usuario

**Response** (200 OK): Array de reservas del usuario

---

#### PATCH `/api/reservas/:id`
Actualizar reserva

**Acceso**: JWT (admin: cambiar cualquier campo, cliente: solo la propia)

**Request Body** (opcionales):
```json
{
  "hora": "20:00",
  "numPersonas": 5
}
```

**Response** (200 OK): Reserva actualizada

---

#### PATCH `/api/reservas/:id/cambiar-estado`
Cambiar estado de reserva

**Acceso**: JWT (admin puede cambiar a cualquier estado, cliente puede cambiar a cancelada)

**Request Body**:
```json
{
  "nuevoEstado": "confirmada"
}
```

**Estados válidos**: `pendiente`, `confirmada`, `cancelada`

**Response** (200 OK): Estado actualizado

---

#### DELETE `/api/reservas/:id`
Eliminar reserva (solo admin)

**Acceso**: JWT + Rol `admin`

**Response** (200 OK): Reserva eliminada

---

## 🧠 LÓGICA DEL PROYECTO

### 1. Flujo de Autenticación

```
Usuario → POST /auth/register
  ↓
Crear usuario con rol 'cliente'
Contraseña hasheada con bcrypt
Usuario guardado en DB
  ↓
Response: Usuario creado
```

```
Usuario → POST /auth/login
  ↓
Validar email y contraseña
Comparar contraseña con hash
Generar JWT (exp: 24h)
  ↓
Response: Token + Información usuario
```

```
Cliente → Request con JWT
  ↓
JwtAuthGuard: Valida token
RolesGuard: Valida rol
Ejecuta endpoint
  ↓
Response: Datos o error 401/403
```

### 2. Flujo de Productos y Categorías

```
Admin → POST /categories
  ↓
Validar nombre único
Crear categoría
  ↓
Response: Categoría creada

Admin → POST /products
  ↓
Validar datos
Verificar categoría existe
Crear producto
Relacionar con categoría
  ↓
Response: Producto creado

Cliente/Público → GET /products
  ↓
Obtener todos sin filtro
Incluir información de categoría
  ↓
Response: Array de productos
```

### 3. Flujo de Pedidos

```
Cliente → POST /pedidos
  ↓
Validar productos existen
Verificar stock disponible
Calcular total
Crear pedido (estado: pendiente)
Crear detalles de pedido
Restar stock
  ↓
Response: Pedido creado

Cliente → GET /pedidos
  ↓
Si admin: devuelve todos
Si cliente: devuelve solo suyos
Incluir detalles y usuario
  ↓
Response: Array de pedidos

Admin → PATCH /pedidos/:id
  ↓
Validar nuevo estado
Actualizar pedido
Si se entrega: reponer stock (si se cancela)
Notificar al cliente
  ↓
Response: Pedido actualizado
```

### 4. Flujo de Pagos

```
Cliente → POST /pagos
  ↓
Validar pedido existe
Validar monto no exceda total
Crear pago (estado: pendiente)
  ↓
Response: Pago creado

Admin → GET /pagos/estadisticas
  ↓
Sumar todos los montos
Calcular promedios
Agrupar por estado
  ↓
Response: Estadísticas

Admin → PATCH /pagos/:id/procesar
  ↓
Cambiar estado a 'procesado'
Actualizar pedido asociado
Crear entrada en historial
  ↓
Response: Pago procesado
```

### 5. Flujo de Ingredientes y Recetas

```
Admin → POST /ingredientes
  ↓
Crear ingrediente único
  ↓
Response: Ingrediente creado

Admin → POST /producto-ingredientes
  ↓
Validar producto existe
Validar ingrediente existe
Verificar relación no exista
Crear relación con cantidad
  ↓
Response: Relación creada

Cliente → GET /producto-ingredientes/producto/:id
  ↓
Obtener todos los ingredientes del producto
Incluir cantidades y unidades
Orden alfabético
  ↓
Response: Lista de ingredientes
```

### 6. Flujo de Puntos de Fidelidad

```
Cliente → Realiza compra (pedido completado)
  ↓
Sistema automático calcula puntos
1 punto por cada peso gastado
Agregar a cuenta del usuario
  ↓
Usuario tiene nueva cantidad de puntos

Cliente → GET /puntos/mis-puntos
  ↓
Obtener sus puntos acumulados
Última fecha de actualización
  ↓
Response: Información de puntos

Cliente → POST /puntos/usuario/:id/canjear
  ↓
Validar tiene puntos suficientes
Validar premio existe
Restar puntos
Otorgar descuento/premio
  ↓
Response: Puntos canjeados exitosamente
```

### 7. Flujo de Reservas de Mesa

```
Cliente → POST /reservas
  ↓
Validar fecha futura (+24h)
Validar horario (08:00-22:00)
Validar personas (1-12)
Verificar horario disponible
Crear reserva (estado: pendiente)
  ↓
Response: Reserva creada

Cliente → GET /reservas/disponibilidad
  ↓
Obtener todas las reservas del día
Filtrar horarios ocupados
Listar horarios disponibles
  ↓
Response: Array de horarios disponibles

Admin → PATCH /reservas/:id/cambiar-estado
  ↓
Validar nuevo estado
Actualizar estado
Si se cancela: liberar horario
  ↓
Response: Estado actualizado
```

---

## 🔒 SEGURIDAD Y VALIDACIONES

### Guards y Decorators

| Guard | Uso | Descripción |
|-------|-----|-------------|
| `JwtAuthGuard` | Autenticación | Valida que el JWT sea válido |
| `RolesGuard` | Autorización | Verifica que el usuario tenga el rol requerido |
| `@Roles()` | Decorador | Define qué roles pueden acceder |

### Validaciones Global (ValidationPipe)

```typescript
- Whitelist: Solo campos definidos en DTO
- Forbid Non-Whitelisted: Error si hay campos extras
- Transform: Convertir tipos automáticamente
- Custom Validators: class-validator con decoradores
```

### Validaciones por Entidad

```typescript
Email: @IsEmail() - Email válido y único
Password: @MinLength(8) + Mayúscula + Número
Nombre: @MinLength(2) @MaxLength(100)
Precio: @IsPositive() - Número positivo
Stock: @Min(0) - No negativo
Fechas: @IsFuture() - Fecha futura
Teléfono: Formato válido
```

### Manejo de Excepciones

```typescript
- BadRequestException (400): Datos inválidos
- UnauthorizedException (401): No autenticado
- ForbiddenException (403): No autorizado
- NotFoundException (404): Recurso no existe
- ConflictException (409): Violación de unicidad
- InternalServerErrorException (500): Error interno

Todas pasan por AllExceptionsFilter para formato unificado
```

---

## 📊 ESTRUCTURA DE RESPUESTAS

### Respuesta Exitosa

```json
{
  "status": "success",
  "code": 200,
  "data": {
    // Datos solicitados
  }
}
```

### Respuesta de Error

```json
{
  "status": "error",
  "code": 400,
  "message": "Descripción del error",
  "errors": [
    {
      "field": "email",
      "message": "Email debe ser válido"
    }
  ]
}
```

### Respuesta de Lista

```json
{
  "status": "success",
  "code": 200,
  "data": [
    { /* Elemento 1 */ },
    { /* Elemento 2 */ }
  ],
  "meta": {
    "total": 2,
    "page": 1,
    "limit": 10
  }
}
```

---

## 🗄️ BASE DE DATOS

### Entidades Principales

| Entidad | Tabla | Campos Clave |
|---------|-------|-------------|
| Usuario | `usuarios` | id, email, nombre, rol, activo |
| Producto | `productos` | id, nombre, precio, stock, categoryId |
| Categoría | `categorias` | id, nombre, descripcion |
| Dirección | `direcciones` | id, usuarioId, direccion, ciudad |
| Pedido | `pedidos` | id, usuarioId, estado, total |
| Detalle Pedido | `pedido_detalles` | pedidoId, productoId, cantidad, precio |
| Pago | `pagos` | id, pedidoId, monto, estado, metodo |
| Ingrediente | `ingredientes` | id, nombre, unidad |
| Producto-Ingrediente | `producto_ingredientes` | productoId, ingredienteId, cantidad |
| Puntos | `puntos` | id, usuarioId, puntosAcumulados |
| Reserva | `reservas` | id, usuarioId, fechaReserva, hora, numPersonas, estado |

### Relaciones

```
Usuario (1) ──────────────── (N) Producto
Usuario (1) ──────────────── (N) Dirección
Usuario (1) ──────────────── (N) Pedido
Usuario (1) ──────────────── (1) Puntos
Usuario (1) ──────────────── (N) Reserva

Producto (N) ──────────────── (1) Categoría
Producto (N) ──────────────── (N) Ingrediente (mediante producto_ingredientes)

Pedido (1) ──────────────── (N) Detalle Pedido
Pedido (N) ──────────────── (1) Usuario
Detalle Pedido (N) ──────────────── (1) Producto

Pago (N) ──────────────── (1) Pedido
```

---

## 🚀 CÓMO INICIAR EL PROYECTO

### Instalación

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
# Crear archivo .env con:
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=root
DATABASE_PASSWORD=password
DATABASE_NAME=cafeteria
JWT_SECRET=tu_secret_muy_seguro
PORT=3000
```

### Ejecutar

```bash
# Modo desarrollo
npm run start:dev

# Modo producción
npm run build
npm run start:prod

# Tests
npm test
npm run test:coverage
```

### Endpoints de Prueba

```bash
# Health check
curl http://localhost:3000/api/health

# Información del servidor
curl http://localhost:3000/api

# Registrarse
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "password": "TestPassword123",
    "telefono": "1234567890"
  }'

# Iniciar sesión
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123"
  }'

# Usar token
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📝 NOTAS IMPORTANTES

### Sobre Roles

- **admin**: Acceso completo a todas las operaciones, gestión de usuarios, estadísticas
- **cliente**: Acceso limitado a sus propios recursos, puede ver productos públicos

### Sobre JWT

- Token expira en 24 horas (configurable)
- Se envía en header: `Authorization: Bearer <TOKEN>`
- Contiene: id, email, rol, iat, exp

### Sobre Validaciones

- Todos los DTOs validados automáticamente
- Los errores devuelven código 400 con detalles
- No se permiten campos adicionales (whitelist)

### Sobre Concurrencia

- Verificación de stock antes de crear pedido
- Transacciones en operaciones críticas
- Sincronización de base de datos en desarrollo

### Sobre Performance

- Lazy loading de relaciones
- Índices en campos de búsqueda frecuente
- Caché de JWT tokens
- Límites de paginación (por implementar)

---

## 📞 CONTACTO Y SOPORTE

Para más información sobre la implementación específica, consultar:
- Código fuente en `/src`
- Tests en `*.spec.ts`
- Base de datos en `/BaseDeDatos/cafeteria.sql`

**Última actualización**: 25 de noviembre de 2025

---

**⭐ Proyecto Académico - TECNOLOGIAS-WEB-2**
