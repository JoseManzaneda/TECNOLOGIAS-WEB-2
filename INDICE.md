# 📖 Índice de Documentación del Proyecto

Guía rápida para navegar toda la documentación del sistema de microservicios de cafetería.

## 🎯 Para Empezar (Demos y Presentaciones)

| Documento | Cuándo Usarlo | Tiempo |
|-----------|---------------|--------|
| **[Presentacion.md](Presentacion.md)** | **Durante tu exposición** - Pasos detallados para demostrar el sistema | 15-20 min |
| **[PREPARACION-DEMO.md](PREPARACION-DEMO.md)** | Antes de la demo - Configuración paso a paso | 5 min lectura |
| **[CHECKLIST-PRESENTACION.md](CHECKLIST-PRESENTACION.md)** | Lista de verificación completa pre-demo | 5 min |

### 🚀 Scripts Automáticos

```powershell
# Preparar todo el sistema automáticamente
.\preparar-demo.ps1

# Ejecutar suite de pruebas completa
.\test-sistema.ps1
```

## 📚 Documentación Técnica

### Arquitectura y Diseño

| Documento | Contenido |
|-----------|-----------|
| **[RESUMEN-EJECUTIVO.md](RESUMEN-EJECUTIVO.md)** | Visión técnica completa del proyecto, patrones, métricas |
| **[microservices/README.md](microservices/README.md)** | Arquitectura detallada de microservicios |
| **[SEGURIDAD.md](SEGURIDAD.md)** | JWT, RBAC, flujos de autenticación/autorización |
| **[DOCKER.md](DOCKER.md)** | Guía de despliegue con Docker Compose |

### Calidad y Buenas Prácticas

| Documento | Contenido |
|-----------|-----------|
| **[MEJORAS-CALIDAD.md](MEJORAS-CALIDAD.md)** | Patrones SOLID, validaciones, testing, seguridad |

### Por Microservicio

| Servicio | README | Puerto | Swagger |
|----------|--------|--------|---------|
| Auth Service | [microservices/auth-service/README.md](microservices/auth-service/README.md) | 3001 | http://localhost:3001/docs |
| Users Service | [microservices/users-service/README.md](microservices/users-service/README.md) | 3002 | http://localhost:3002/docs |
| Products Service | [microservices/products-service/README.md](microservices/products-service/README.md) | 3003 | http://localhost:3003/docs |
| API Gateway | [microservices/api-gateway/README.md](microservices/api-gateway/README.md) | 3000 | http://localhost:3000/api/docs |

## 🗂️ Estructura del Proyecto

```
TECNOLOGIAS-WEB-2/
├── 📄 Presentacion.md              ← GUÍA PRINCIPAL PARA DEMO
├── 📄 PREPARACION-DEMO.md          ← Configuración inicial
├── 📄 CHECKLIST-PRESENTACION.md    ← Lista de verificación
├── 📄 RESUMEN-EJECUTIVO.md         ← Visión técnica completa
├── 📄 SEGURIDAD.md                 ← JWT y roles
├── 📄 DOCKER.md                    ← Despliegue
├── 📄 MEJORAS-CALIDAD.md           ← Buenas prácticas
├── 📄 README.md                    ← Este archivo
│
├── 📁 microservices/
│   ├── 📁 auth-service/            ← Autenticación JWT
│   ├── 📁 users-service/           ← Gestión de perfiles
│   ├── 📁 products-service/        ← Productos y categorías
│   ├── 📁 api-gateway/             ← Gateway y Swagger agregado
│   └── 📁 database/                ← Scripts SQL de inicialización
│       ├── auth.sql                ← Usuarios y contraseñas
│       ├── users.sql               ← Perfiles y direcciones
│       └── products.sql            ← Productos y categorías
│
├── 📜 docker-compose.yml           ← Orquestación completa
├── 📜 preparar-demo.ps1            ← Script automático de setup
└── 📜 test-sistema.ps1             ← Suite de pruebas
```

## 🎓 Flujo de Uso Recomendado

### Preparación (Día Antes de la Demo)

1. **Lee**: `PREPARACION-DEMO.md`
2. **Ejecuta**: `.\preparar-demo.ps1`
3. **Verifica**: `.\test-sistema.ps1`
4. **Revisa**: `CHECKLIST-PRESENTACION.md`

### Durante la Demo

1. **Sigue**: `Presentacion.md` paso a paso
2. **Consulta**: `SEGURIDAD.md` para explicar JWT/roles
3. **Muestra**: Swagger en http://localhost:3000/api/docs
4. **Explica**: Arquitectura con diagramas de `RESUMEN-EJECUTIVO.md`

### Para Profundizar

1. **Arquitectura**: `RESUMEN-EJECUTIVO.md` + `microservices/README.md`
2. **Código**: READMEs individuales de cada servicio
3. **Calidad**: `MEJORAS-CALIDAD.md`

## 🔗 Enlaces Rápidos (Sistema Activo)

Una vez que ejecutes `docker compose up -d --build`:

### Interfaces Web
- 🌐 **API Gateway**: http://localhost:3000
- 📚 **Swagger Agregado**: http://localhost:3000/api/docs
- 🐰 **RabbitMQ Management**: http://localhost:15672 (guest/guest)

### Swagger por Servicio
- 🔐 **Auth**: http://localhost:3001/docs
- 👤 **Users**: http://localhost:3002/docs
- 📦 **Products**: http://localhost:3003/docs

### Bases de Datos
- MySQL Auth: `localhost:3307` (root/root)
- MySQL Users: `localhost:3308` (root/root)
- MySQL Products: `localhost:3309` (root/root)

## 👥 Usuarios de Prueba

| Email | Contraseña | Rol | Uso |
|-------|-----------|-----|-----|
| admin@cafeteria.com | Admin123 | admin | Crear/modificar productos, ver usuarios |
| cliente@cafeteria.com | Cliente123 | cliente | Demostrar restricciones (403) |

## 💡 Preguntas Frecuentes

**¿Cuál es el archivo más importante?**
→ `Presentacion.md` - tiene todo para tu demo.

**¿Cómo preparo el sistema rápido?**
→ `.\preparar-demo.ps1` lo hace todo automáticamente.

**¿Cómo verifico que funciona?**
→ `.\test-sistema.ps1` ejecuta 15+ pruebas automáticas.

**¿Dónde está la arquitectura técnica?**
→ `RESUMEN-EJECUTIVO.md` y `microservices/README.md`.

**¿Cómo explico la seguridad?**
→ Lee `SEGURIDAD.md`, tiene ejemplos completos.

**¿Qué puedo decir sobre calidad de código?**
→ `MEJORAS-CALIDAD.md` lista todos los patrones implementados.

## 🎯 Comandos Esenciales

```powershell
# Preparar sistema completo
.\preparar-demo.ps1

# Verificar que todo funciona
.\test-sistema.ps1

# Levantar sistema manualmente
docker compose up -d --build

# Ver logs en tiempo real
docker compose logs -f

# Ver solo logs de un servicio
docker compose logs -f auth-service

# Detener todo y limpiar
docker compose down -v

# Ver contenedores activos
docker ps

# Reiniciar un servicio específico
docker compose restart products-service
```

## 📊 Métricas del Proyecto

- **Microservicios**: 4 (Auth, Users, Products, Gateway)
- **Bases de datos**: 3 independientes (MySQL)
- **Endpoints**: 25+
- **Líneas de código**: ~3,000 (TypeScript)
- **Documentos**: 10+ archivos MD
- **Contenedores**: 8 (3 BD, RabbitMQ, 4 servicios)
- **Tiempo de setup**: ~2 minutos (script automático)

## 🏆 Lo Más Destacado

✅ **Arquitectura de Microservicios** completa y funcional  
✅ **JWT distribuido** con validación en cada servicio  
✅ **RabbitMQ** para eventos asíncronos  
✅ **Docker Compose** con un solo comando  
✅ **Swagger agregado** en Gateway  
✅ **Documentación exhaustiva** para demo académica  
✅ **Scripts automatizados** de preparación y pruebas  

---

**¿Listo para tu demo?** → Abre `Presentacion.md` 🚀
