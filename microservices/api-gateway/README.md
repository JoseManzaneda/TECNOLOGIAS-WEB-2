# API Gateway

Gateway HTTP para los microservicios Auth, Users y Products (NestJS).

## Endpoints expuestos

- `GET /` → estado del gateway
- `GET /api/health` → healthcheck del gateway
- Proxy:
  - `/api/auth/*` → `AUTH_SERVICE_URL` (por defecto http://localhost:3001)
  - `/api/users/*` → `USERS_SERVICE_URL` (por defecto http://localhost:3002)
  - `/api/products/*` → `PRODUCTS_SERVICE_URL` (por defecto http://localhost:3003)
  - `/api/categories/*` → `PRODUCTS_SERVICE_URL` (por defecto http://localhost:3003)
- Documentación:
  - UI agregada: `GET /api/docs` (Auth, Users, Products, Gateway)
  - Doc del Gateway: `GET /api/docs/gateway`

Nota: El gateway reescribe el prefijo `/api` automáticamente. Por ejemplo, `POST /api/auth/login` → `POST http://localhost:3001/auth/login`.

## Variables de entorno

Crea un archivo `.env` (ya incluido) o usa `.env.example` como referencia:

```
PORT=3000
API_PREFIX=/api
AUTH_SERVICE_URL=http://localhost:3001
USERS_SERVICE_URL=http://localhost:3002
PRODUCTS_SERVICE_URL=http://localhost:3003
```

## Desarrollo

- Instalar dependencias:

```powershell
npm install
```

- Ejecutar en desarrollo (watch):

```powershell
npm run start:dev
```

- Compilar:

```powershell
npm run build
```

## Notas

- El gateway pasa el header `Authorization` tal cual a los servicios, por lo que la validación de JWT sigue ocurriendo en cada microservicio.
- Habilita CORS abierto para facilitar pruebas locales.
- La UI de Swagger del gateway agrega las especificaciones OpenAPI de Auth, Users y Products a través de rutas proxied (`/api/docs/*-json`).
