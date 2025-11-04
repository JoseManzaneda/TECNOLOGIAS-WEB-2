# Legacy Monolith

Este directorio contiene el monolito original de la aplicación de cafetería, que será gradualmente descompuesto en microservicios.

## Estructura

El monolito contiene todos los módulos originales:

- **auth/** - Autenticación y autorización
- **users/** - Gestión de usuarios
- **products/** - Gestión de productos
- **categories/** - Gestión de categorías
- **ingredientes/** - Gestión de ingredientes
- **producto-ingredientes/** - Relaciones producto-ingrediente
- **pedidos/** - Gestión de pedidos
- **pagos/** - Gestión de pagos
- **reservas/** - Gestión de reservas
- **direcciones/** - Gestión de direcciones
- **puntos/** - Sistema de puntos

## Ejecución

### Desarrollo
```bash
cd services/legacy-monolith
npm install
npm run start:dev
```

### Docker
```bash
# Desde la raíz del proyecto
docker-compose up legacy-monolith
```

El servicio corre en el puerto **3001**.

## Próximos pasos

Este monolito será gradualmente descompuesto siguiendo el patrón Strangler Fig:

1. ✅ Reorganización del proyecto
2. 🔜 Implementar API Gateway
3. 🔜 Migrar User Service
4. 🔜 Migrar Catalog Service
5. 🔜 Migrar Order Service
6. 🔜 Migrar Payment Service
