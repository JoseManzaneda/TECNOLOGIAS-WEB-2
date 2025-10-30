# 🛒 Products Service - Sistema Cafetería

Microservicio de **Productos y Categorías** del sistema de cafetería.

## ✅ Funcionalidades
- CRUD de categorías (`categorias`)
- CRUD de productos (`productos`)
- Filtro por categoría y listado de disponibles
- Endpoints protegidos con JWT para operaciones de escritura
- Emisión de eventos a RabbitMQ: `product.created`, `product.updated`, `product.deleted`

## 🔌 Endpoints

### Categories
- GET `/categories` → Listar categorías
- GET `/categories/:id` → Obtener categoría
- POST `/categories` → Crear categoría (JWT)
- PUT `/categories/:id` → Actualizar categoría (JWT)
- DELETE `/categories/:id` → Eliminar categoría (JWT)

### Products
- GET `/products` → Listar productos (opcional `?categoryId=`)
- GET `/products/available` → Listar disponibles
- GET `/products/:id` → Obtener producto
- POST `/products` → Crear producto (JWT)
- PUT `/products/:id` → Actualizar producto (JWT)
- DELETE `/products/:id` → Eliminar producto (JWT)

## 🗃️ Base de Datos: products_db
Tablas:
- `categorias` (id_categoria, nombre, descripcion)
- `productos` (id_producto, nombre, descripcion, precio, id_categoria, imagen_url, stock, disponible)

## 🐰 RabbitMQ
- Queue: `products_queue` (conexión)
- Eventos emitidos: `product.created`, `product.updated`, `product.deleted`

## ⚙️ Variables de Entorno
```env
PORT=3003
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=root
DB_DATABASE=products_db
JWT_SECRET=cafeteria_secret_key_super_secure_2025
JWT_EXPIRATION=1h
RABBITMQ_URL=amqp://guest:guest@localhost:5672
RABBITMQ_QUEUE=products_queue
RABBITMQ_EXCHANGE=cafeteria.events
```

## ▶️ Cómo correr
```bash
npm install
cp .env.example .env
npm run start:dev
```

## 🔒 Seguridad
- JWT Strategy y Guard
- DTOs validados con class-validator
- TypeORM con parámetros tipados

## 🧪 Pruebas rápidas (PowerShell)

```powershell
# Crear categoría (requiere token)
$headers = @{ Authorization = "Bearer <TOKEN>" }
$cat = @{ nombre = "Bebidas Calientes"; descripcion = "Cafés y tés" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3003/categories" -Method POST -Headers $headers -Body $cat -ContentType "application/json"

# Crear producto (requiere token)
$prod = @{ nombre="Cappuccino"; descripcion="Café con leche"; precio=45.00; idCategoria=1; stock=50; disponible=$true } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3003/products" -Method POST -Headers $headers -Body $prod -ContentType "application/json"

# Listar disponibles
Invoke-RestMethod -Uri "http://localhost:3003/products/available" -Method GET
```
