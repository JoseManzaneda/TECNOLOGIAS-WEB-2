# Scripts de Desarrollo

## Instalación de Dependencias

```bash
# Instalar dependencias del monolito
cd services/legacy-monolith
npm install
```

## Desarrollo Local

### Opción 1: Con Docker (Recomendado)

```bash
# Levantar toda la infraestructura
docker-compose up

# O solo servicios específicos
docker-compose up postgres redis legacy-monolith

# Reconstruir después de cambios
docker-compose up --build legacy-monolith

# Ver logs
docker-compose logs -f legacy-monolith
```

### Opción 2: Local (sin Docker)

**Requisitos previos:**
- PostgreSQL corriendo en `localhost:5433`
- Redis corriendo en `localhost:6379`

```bash
cd services/legacy-monolith
npm run start:dev
```

## Testing

```bash
cd services/legacy-monolith

# Ejecutar tests unitarios
npm test

# Tests en modo watch
npm run test:watch

# Tests con coverage
npm run test:coverage
```

## Linting y Formato

```bash
cd services/legacy-monolith

# Lint
npm run lint

# Formatear código
npm run format
```

## Build para Producción

```bash
cd services/legacy-monolith

# Build
npm run build

# Ejecutar versión de producción
npm run start:prod
```

## Variables de Entorno

Asegúrate de tener un archivo `.env` en la raíz del proyecto con:

```env
# Aplicación
APP_PORT=3001

# Base de datos
POSTGRES_HOST=localhost  # o 'postgres' para Docker
POSTGRES_PORT=5432
POSTGRES_USER=tu_usuario
POSTGRES_PASSWORD=tu_password
POSTGRES_DB=cafeteria_db

# JWT
JWT_SECRET=tu_secreto_super_seguro

# Redis
REDIS_HOST=localhost  # o 'redis' para Docker
REDIS_PORT=6379
```

## Endpoints Principales

Una vez levantado el servicio en `http://localhost:3001`:

- **API Docs (Swagger)**: `http://localhost:3001/api`
- **Health Check**: `http://localhost:3001/health`
- **Auth**: `http://localhost:3001/auth/*`
- **Users**: `http://localhost:3001/users/*`
- **Products**: `http://localhost:3001/products/*`

## Troubleshooting

### El contenedor no inicia

```bash
# Ver logs detallados
docker-compose logs legacy-monolith

# Reconstruir imagen desde cero
docker-compose build --no-cache legacy-monolith
docker-compose up legacy-monolith
```

### Error de conexión a PostgreSQL

1. Verificar que PostgreSQL está corriendo:
   ```bash
   docker-compose ps
   ```

2. Verificar credenciales en `.env`

3. Si usas desarrollo local, cambiar `POSTGRES_HOST=localhost`

### Puerto 3001 ya está en uso

```bash
# Ver qué proceso usa el puerto (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess

# Matar el proceso o cambiar el puerto en docker-compose.yml
```

## Comandos Útiles de Docker

```bash
# Detener todos los contenedores
docker-compose down

# Detener y limpiar volúmenes (¡cuidado, borra la BD!)
docker-compose down -v

# Ver contenedores corriendo
docker-compose ps

# Ejecutar comandos dentro del contenedor
docker-compose exec legacy-monolith sh

# Limpiar todo
docker system prune -a
```
