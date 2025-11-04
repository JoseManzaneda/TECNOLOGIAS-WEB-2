# API Gateway

✅ **Estado:** Implementado y funcionando

El API Gateway es el punto de entrada único para todas las peticiones del cliente hacia los microservicios.

## Funcionalidad Actual

- ✅ **Proxy HTTP**: Reenvía todas las peticiones a `legacy-monolith:3001`
- ✅ **Autenticación JWT**: Valida tokens JWT en todas las rutas protegidas
- ✅ **CORS**: Configurado para permitir peticiones desde el frontend
- ✅ **Logging**: Registra todas las peticiones que pasan por el gateway
- ✅ **Rutas públicas**: `/auth/login`, `/auth/register`, `/health` no requieren autenticación

## Puerto

El API Gateway corre en el **puerto 3000**.

## Arquitectura

```
Cliente → Gateway (3000) → Monolito Legacy (3001)
          [Valida JWT]
          [Logging]
```

## Variables de Entorno

```env
PORT=3000
LEGACY_MONOLITH_URL=http://legacy-monolith:3001
JWT_SECRET=your-secret-key
```

## Uso

### Con Docker

```bash
docker-compose up api-gateway
```

### Local

```bash
cd services/api-gateway
npm install
npm run start:dev
```

## Rutas

Todas las rutas son proxiadas al monolito:

- `GET/POST/PUT/DELETE /*` → Se reenvía a `legacy-monolith:3001/*`

### Rutas Públicas (sin JWT)

- `/auth/login` - Login de usuario
- `/auth/register` - Registro de usuario
- `/health` - Health check

### Rutas Protegidas (requieren JWT)

Todas las demás rutas requieren un token JWT válido en el header `Authorization: Bearer <token>`
