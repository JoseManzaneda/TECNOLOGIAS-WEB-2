# Despliegue con Docker Compose

Este proyecto incluye un `docker-compose.yml` que levanta:
- 3 MySQL (auth-db, users-db, products-db) con datos iniciales
- RabbitMQ con consola de gestión
- 3 microservicios: Auth, Users, Products
- API Gateway

## Requisitos
- Docker y Docker Compose instalados

## Levantar todo

```powershell
# En la raíz del repositorio
docker compose up -d --build
```

Esto expondrá los puertos:
- Gateway: http://localhost:3000
- Auth: http://localhost:3001
- Users: http://localhost:3002
- Products: http://localhost:3003
- RabbitMQ Management: http://localhost:15672 (user: guest / pass: guest)
- MySQL:
  - auth-db: localhost:3307
  - users-db: localhost:3308
  - products-db: localhost:3309

## Apagar y limpiar

```powershell
docker compose down -v
```

## Notas
- Cada servicio usa sus propias variables de entorno por `docker-compose.yml`.
- Los scripts de inicialización están en `microservices/database/*.sql`.
- El Gateway proxy: `/api/auth`, `/api/users`, `/api/products`, `/api/categories`.
