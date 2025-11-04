# Guía de Migración a Microservicios

## 📋 Estado Actual

El proyecto ha sido reorganizado para facilitar la migración gradual desde un monolito a una arquitectura de microservicios usando el patrón **Strangler Fig**.

## 📁 Nueva Estructura

```
TECNOLOGIAS-WEB-2/
├── services/
│   ├── api-gateway/          # 🚧 API Gateway (pendiente)
│   ├── user-service/         # 🚧 Servicio de usuarios (pendiente)
│   ├── catalog-service/      # 🚧 Servicio de catálogo (pendiente)
│   └── legacy-monolith/      # ✅ Monolito actual (puerto 3001)
│       ├── src/              # Todo el código actual
│       ├── package.json
│       ├── Dockerfile
│       └── README.md
├── shared/
│   ├── dto/                  # DTOs compartidos
│   ├── interfaces/           # Interfaces compartidas
│   └── constants/            # Constantes y enums compartidos
├── BaseDeDatos/
├── docker-compose.yml        # Configuración actualizada
└── MIGRACION-MICROSERVICIOS.md  # Este archivo
```

## 🎯 Plan de Migración

### Fase 1: ✅ Reorganización (COMPLETADA)

- [x] Crear estructura de carpetas `services/`
- [x] Crear estructura de carpetas `shared/`
- [x] Mover código del monolito a `services/legacy-monolith/`
- [x] Actualizar `docker-compose.yml`
- [x] Monolito funcionando en puerto 3001

### Fase 2: 🔜 API Gateway

1. Implementar API Gateway básico
2. Configurar enrutamiento al monolito
3. Implementar autenticación centralizada
4. Configurar rate limiting

### Fase 3: 🔜 User Service

1. Extraer módulos:
   - `auth/`
   - `users/`
   - `direcciones/`
   - `puntos/`
2. Crear base de datos independiente
3. Implementar comunicación con API Gateway
4. Migrar endpoints gradualmente

### Fase 4: 🔜 Catalog Service

1. Extraer módulos:
   - `products/`
   - `categories/`
   - `ingredientes/`
   - `producto-ingredientes/`
2. Crear base de datos independiente
3. Implementar comunicación con API Gateway
4. Migrar endpoints gradualmente

### Fase 5: 🔜 Order Service

1. Extraer módulos:
   - `pedidos/`
   - `pagos/`
   - `reservas/`
2. Implementar eventos entre servicios
3. Gestionar transacciones distribuidas

### Fase 6: 🔜 Desmantelamiento del Monolito

1. Verificar que todos los servicios funcionan correctamente
2. Remover código migrado del monolito
3. Eventualmente eliminar `legacy-monolith/`

## 🚀 Comandos de Ejecución

### Desarrollo Local

```bash
# Monolito Legacy
cd services/legacy-monolith
npm install
npm run start:dev
```

### Docker

```bash
# Levantar todo el stack
docker-compose up

# Solo el monolito
docker-compose up legacy-monolith

# Rebuild si hay cambios
docker-compose up --build legacy-monolith
```

## 🔗 Puertos Asignados

| Servicio | Puerto | Estado |
|----------|--------|--------|
| API Gateway | 3000 | 🚧 Pendiente |
| Legacy Monolith | 3001 | ✅ Activo |
| User Service | 3002 | 🚧 Pendiente |
| Catalog Service | 3003 | 🚧 Pendiente |
| Order Service | 3004 | 🚧 Pendiente |
| PostgreSQL | 5433 | ✅ Activo |
| Redis | 6379 | ✅ Activo |

## 📝 Notas Importantes

1. **El monolito sigue siendo funcional** - Todo el código está en `services/legacy-monolith/` y funciona igual que antes, solo que ahora en el puerto 3001.

2. **No hay cambios funcionales** - Esta reorganización es solo estructural, no afecta la funcionalidad existente.

3. **Migración gradual** - Los nuevos microservicios se implementarán uno por uno sin afectar el monolito.

4. **Patrón Strangler Fig** - Los nuevos servicios "estrangularán" gradualmente al monolito hasta que ya no sea necesario.

## 🔧 Próximos Pasos Inmediatos

1. **Verificar que el monolito funciona correctamente**:
   ```bash
   docker-compose up legacy-monolith
   # Verificar en http://localhost:3001
   ```

2. **Preparar variables de entorno** - Asegurarse de que el archivo `.env` tiene todas las variables necesarias.

3. **Planificar el API Gateway** - Definir las rutas y la estrategia de enrutamiento.

4. **Identificar dependencias compartidas** - Comenzar a extraer código común a la carpeta `shared/`.

## 📚 Recursos

- [Patrón Strangler Fig](https://martinfowler.com/bliki/StranglerFigApplication.html)
- [Microservices con NestJS](https://docs.nestjs.com/microservices/basics)
- [API Gateway Pattern](https://microservices.io/patterns/apigateway.html)
