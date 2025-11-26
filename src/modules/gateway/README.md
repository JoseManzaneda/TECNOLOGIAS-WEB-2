# API Gateway

## Descripción
Gateway centralizado que actúa como punto de entrada único para todos los microservicios.

## Rutas del Gateway

### Health Checks
- `GET /gateway/health` - Estado del gateway
- `GET /gateway/health/all` - Estado de todos los servicios
- `GET /gateway/services` - Lista de servicios disponibles

### Proxy Routes
- `ALL /gateway/auth/*` - Auth Service (login, register)
- `ALL /gateway/users/*` - Users Service (requiere JWT)
- `ALL /gateway/products/*` - Products Service (público)
- `ALL /gateway/orders/*` - Orders Service (requiere JWT)
- `ALL /gateway/customer/*` - Customer Service (requiere JWT)

## Ejemplos de Uso

### Login
```bash
curl -X POST http://localhost:3000/gateway/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123"}'
```

### Obtener productos
```bash
curl http://localhost:3000/gateway/products
```

### Crear pedido (con JWT)
```bash
curl -X POST http://localhost:3000/gateway/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"detalles":[{"productoId":1,"cantidad":2}]}'
```

## Características
- ✅ Autenticación centralizada con JWT
- ✅ Health checks de servicios
- ✅ Manejo de errores unificado
- ✅ Logging de requests
- ✅ Timeout y retry automático
- ✅ Circuit breaker (próximamente)
