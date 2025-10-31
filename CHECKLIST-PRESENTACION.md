# ✅ Lista de Verificación Pre-Presentación

## 🎯 CHECKLIST COMPLETO

### 📁 Archivos de Documentación Disponibles

Verifica que tienes estos documentos listos para consultar durante tu presentación:

- [x] `Presentacion.md` - Guía principal con pasos de la demo
- [x] `PREPARACION-DEMO.md` - Guía detallada de configuración inicial
- [x] `RESUMEN-EJECUTIVO.md` - Visión técnica completa del proyecto
- [x] `DOCKER.md` - Guía de despliegue con Docker Compose
- [x] `SEGURIDAD.md` - Documentación de JWT y roles
- [x] `microservices/README.md` - Arquitectura de microservicios
- [x] `preparar-demo.ps1` - Script automático de preparación

### 🔧 Preparación Técnica (DÍA ANTES)

#### Sistema Operativo y Herramientas
```
☐ Docker Desktop instalado y funcionando
☐ PowerShell 5.1+ disponible (viene con Windows)
☐ Navegador web moderno (Chrome/Edge/Firefox)
☐ Editor de texto (VS Code recomendado) con el proyecto abierto
```

#### Ejecución del Sistema
```
☐ Ejecuté: docker compose down -v
☐ Ejecuté: docker compose up -d --build
☐ Esperé 45-60 segundos
☐ Ejecuté: docker ps (verificar 8 contenedores activos)
```

#### Verificación de Servicios
```
☐ http://localhost:3000 responde
☐ http://localhost:3000/api/docs carga Swagger UI
☐ http://localhost:3001/docs carga Swagger de Auth
☐ http://localhost:3002/docs carga Swagger de Users
☐ http://localhost:3003/docs carga Swagger de Products
☐ http://localhost:15672 carga RabbitMQ Management (guest/guest)
```

#### Pruebas de Autenticación
```
☐ Login con admin@cafeteria.com / Admin123 → JWT obtenido
☐ Login con cliente@cafeteria.com / Cliente123 → JWT obtenido
☐ GET /api/products (sin token) → lista de productos
☐ GET /api/users/me (con token admin) → perfil obtenido
```

### 🎤 Preparación de Presentación (DÍA DE)

#### 30 Minutos Antes
```
☐ Docker Desktop iniciado y corriendo
☐ Ejecuté preparar-demo.ps1 (o manual: down -v → up --build)
☐ Verifiqué todos los servicios con docker ps
☐ Probé login rápido para confirmar que funciona
☐ Abrí Presentacion.md en editor para seguir los pasos
☐ Abrí PowerShell en la ruta del proyecto
☐ Abrí navegador con pestañas:
    - http://localhost:3000/api/docs
    - http://localhost:15672
```

#### 5 Minutos Antes
```
☐ Cerré aplicaciones innecesarias (liberar recursos)
☐ Silencié notificaciones del sistema
☐ Puse PowerShell en pantalla principal
☐ Puse navegador en pantalla secundaria (si tienes)
☐ Revisé que docker compose logs -f no muestra errores críticos
```

### 📝 Durante la Presentación

#### Orden Recomendado de Demo

**1. Introducción (2 min)**
```
☐ Mostré diagrama de arquitectura (Presentacion.md)
☐ Expliqué los 4 microservicios y sus responsabilidades
☐ Mencioné RabbitMQ para eventos asíncronos
☐ Mostré http://localhost:3000/api/docs (Swagger agregado)
```

**2. Autenticación y Seguridad (5-7 min)**
```
☐ Login con cliente → obtuve JWT
☐ Accedí a /api/users/me con token (éxito)
☐ Intenté crear producto con cliente (403 Forbidden)
☐ Login con admin → obtuve JWT admin
☐ Creé producto con admin (201 Created)
☐ Expliqué: JWT validado por cada servicio, roles con guards
```

**3. Comunicación entre Microservicios (5 min)**
```
☐ Registré nuevo usuario (juan@example.com)
☐ Expliqué: Auth guarda en auth_db y publica evento
☐ Verifiqué en RabbitMQ Management (exchange cafeteria.events)
☐ Listé usuarios con token admin (juan aparece)
☐ Consulté SQL directo (opcional): docker exec users-db...
☐ Expliqué: Users Service consumió evento y sincronizó
```

**4. Pruebas de Endpoints (3 min)**
```
☐ GET /api/products (público, sin token)
☐ GET /api/categories (público, sin token)
☐ POST /api/categories con admin (201)
☐ PATCH /api/products/1 con admin (200)
☐ Mostré validaciones en Swagger (campos required, tipos)
```

**5. Cierre (2 min)**
```
☐ Mostré docker ps (8 contenedores activos)
☐ Mencioné: 3 BD independientes, Gateway unificado
☐ Destaqué: código en GitHub, docs completas
☐ Ofrecí Q&A
```

### 🆘 Plan B: Si Algo Falla

#### Servicio no responde
```
→ docker compose logs <servicio>
→ Reinicia solo ese servicio: docker compose restart <servicio>
→ Si persiste, usa Swagger del servicio directo (puerto individual)
```

#### Login falla (401)
```
→ Verifica que down -v se ejecutó antes de up
→ Consulta SQL: docker exec auth-db mysql -uroot -proot -e "SELECT email, rol FROM auth_db.usuarios;"
→ Usa credenciales alternativas si es necesario
```

#### RabbitMQ no muestra eventos
```
→ Los eventos son instantáneos, usa capturas de pantalla previas
→ Demuestra sincronización vía API (GET /api/users muestra nuevo usuario)
→ Consulta SQL directa como respaldo
```

#### PowerShell da error
```
→ Usa Swagger UI (más visual de todas formas)
→ Ten comandos curl como respaldo
→ Muestra código fuente de controllers/guards
```

### 📸 Capturas de Pantalla de Respaldo

Si tienes problemas técnicos en vivo, ten estas capturas listas:

```
☐ Swagger UI mostrando endpoints
☐ RabbitMQ Management con exchange y colas
☐ Response exitoso de login (con JWT visible)
☐ Response 403 de cliente intentando crear producto
☐ Response 201 de admin creando producto
☐ docker ps mostrando 8 contenedores
```

### 🎯 Puntos Clave a Mencionar

**Arquitectura**
- ✅ 4 microservicios independientes (Auth, Users, Products, Gateway)
- ✅ Database-per-service pattern (3 MySQL independientes)
- ✅ Event-driven con RabbitMQ (desacoplamiento)

**Seguridad**
- ✅ JWT stateless (sin sesiones en servidor)
- ✅ Validación distribuida (cada servicio valida)
- ✅ RBAC con roles (cliente/admin)
- ✅ Contraseñas hasheadas con bcrypt

**Comunicación**
- ✅ Síncrona: Gateway → servicios (HTTP)
- ✅ Asíncrona: RabbitMQ con eventos (user.registered, product.*)

**Calidad**
- ✅ Swagger/OpenAPI completo
- ✅ DTOs con validación (class-validator)
- ✅ Código TypeScript tipado
- ✅ Docker para portabilidad

### 📊 Métricas Impresionantes

```
✨ 4 microservicios funcionales
✨ 25+ endpoints documentados
✨ 3 bases de datos independientes
✨ 100% contenedorizado (8 contenedores)
✨ Autenticación JWT distribuida
✨ Mensajería asíncrona con RabbitMQ
✨ Swagger agregado en Gateway
✨ ~3,000 líneas de TypeScript
```

### 🏆 Último Checklist Antes de Empezar

```
☐ Docker Desktop: ACTIVO ✅
☐ Sistema levantado: docker ps muestra 8 contenedores ✅
☐ Login funciona: probé con admin y cliente ✅
☐ Swagger carga: http://localhost:3000/api/docs ✅
☐ Presentacion.md abierto en editor ✅
☐ PowerShell listo en la ruta del proyecto ✅
☐ Navegador con pestañas preparadas ✅
☐ Estado mental: CONFIADO 🚀
```

---

## 💪 ¡Estás Listo!

Has implementado un sistema completo de microservicios con:
- Autenticación robusta
- Comunicación síncrona y asíncrona
- Bases de datos independientes
- Documentación completa
- Despliegue automatizado

**Tu proyecto está listo para demostrar excelencia técnica. ¡Mucho éxito! 🎓✨**
