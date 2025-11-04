# 🧪 Guía de Pruebas - API Gateway

Esta guía te ayudará a probar que el API Gateway está funcionando correctamente.

## 🚀 Iniciar Servicios

```bash
# Iniciar el API Gateway y sus dependencias
.\dev.ps1 start-gateway

# Verificar que todo está corriendo
.\dev.ps1 status
```

## 📋 Flujo de Pruebas

### 1. Health Check (Sin autenticación)

```bash
# Verificar que el Gateway está funcionando
curl http://localhost:3000/health
```

**Esperado:** Respuesta exitosa del monolito a través del gateway.

### 2. Registro de Usuario (Sin autenticación)

```bash
POST http://localhost:3000/auth/register
Content-Type: application/json

{
  "nombre": "Test User",
  "email": "test@example.com",
  "password": "Password123",
  "telefono": "987654321"
}
```

**Esperado:** Usuario creado exitosamente.

### 3. Login (Sin autenticación)

```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123"
}
```

**Esperado:** Recibir un token JWT.

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "nombre": "Test User",
    "email": "test@example.com",
    "rol": "cliente"
  }
}
```

### 4. Acceder a Recurso Protegido (Con JWT)

```bash
GET http://localhost:3000/products
Authorization: Bearer <tu-token-jwt>
```

**Esperado:** Lista de productos.

### 5. Intentar Acceder Sin Token (Debe fallar)

```bash
GET http://localhost:3000/products
# Sin header Authorization
```

**Esperado:** Error 401 Unauthorized.

## 🔍 Verificar Logs

### Ver logs del API Gateway

```bash
.\dev.ps1 logs-gateway
```

Deberías ver algo como:

```
[APIGateway] GET /products → http://legacy-monolith:3001/products
[APIGateway] POST /auth/login → http://legacy-monolith:3001/auth/login
```

### Ver logs del monolito

```bash
.\dev.ps1 logs
```

## 📊 Pruebas con Postman

### Colección de Pruebas

1. **Crear una colección** llamada "API Gateway Tests"

2. **Configurar variables**:
   - `base_url`: `http://localhost:3000`
   - `token`: (se llenará automáticamente)

3. **Request 1: Register**
   ```
   POST {{base_url}}/auth/register
   Body: JSON con datos de usuario
   ```

4. **Request 2: Login**
   ```
   POST {{base_url}}/auth/login
   Body: JSON con email y password
   
   Test Script:
   pm.test("Token received", function () {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.access_token);
   });
   ```

5. **Request 3: Get Products (Protected)**
   ```
   GET {{base_url}}/products
   Authorization: Bearer {{token}}
   ```

## ✅ Checklist de Validación

- [ ] El API Gateway inicia correctamente en puerto 3000
- [ ] El monolito legacy está corriendo en puerto 3001
- [ ] Las rutas públicas funcionan sin JWT (`/auth/login`, `/auth/register`)
- [ ] Las rutas protegidas requieren JWT
- [ ] Los tokens JWT inválidos son rechazados
- [ ] El proxy reenvía correctamente las peticiones al monolito
- [ ] Los logs muestran todas las peticiones
- [ ] CORS permite peticiones desde el frontend
- [ ] Los códigos de estado HTTP se preservan correctamente

## 🐛 Troubleshooting

### Error: "Cannot connect to legacy-monolith"

**Solución:**
```bash
# Verificar que el monolito está corriendo
docker-compose ps

# Si no está corriendo, iniciarlo
.\dev.ps1 start-gateway
```

### Error: "JWT Secret not configured"

**Solución:**
```bash
# Verificar que el archivo .env tiene JWT_SECRET configurado
cat .env | Select-String JWT_SECRET

# Si no existe, agregarlo al .env de la raíz
```

### Error 401 en rutas públicas

**Problema:** El guard está bloqueando rutas que deberían ser públicas.

**Solución:** Verificar que la ruta está en la lista de `publicRoutes` en `jwt-auth.guard.ts`.

### Los logs no aparecen

**Solución:**
```bash
# Ver logs en tiempo real
docker-compose logs -f api-gateway

# O con el script
.\dev.ps1 logs-gateway
```

## 📈 Métricas a Observar

1. **Latencia**: El Gateway agrega ~10-50ms de latencia
2. **Throughput**: Debería manejar las mismas peticiones que el monolito
3. **Errores**: Tasa de errores debe ser mínima (<1%)

## 🔜 Próximas Mejoras

- [ ] Rate limiting
- [ ] Caching de respuestas
- [ ] Circuit breaker
- [ ] Request timeout configurable
- [ ] Métricas con Prometheus
- [ ] Health checks periódicos de servicios

---

**¿Todo funcionando?** ✅ ¡El API Gateway está listo para el siguiente paso!
