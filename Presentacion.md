# Presentación del Proyecto: Microservicios Cafetería

Esta guía te prepara para explicar y demostrar el proyecto de forma clara, paso a paso, cubriendo arquitectura, ejecución y una demo funcional centrada en: comunicación entre microservicios, autenticación/seguridad y pruebas de endpoints.

## ¿Qué es este proyecto?

- Backend académico para una cafetería, implementado con:
  - NestJS 10 + TypeScript, TypeORM 0.3 (MySQL)
  - API Gateway + 3 microservicios: Auth, Users, Products
  - Mensajería asíncrona con RabbitMQ (eventos: user.registered, product.*)
  - Documentación OpenAPI/Swagger por servicio y agregada en el Gateway
  - Contenedores y orquestación con Docker Compose

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                 │
│              (Browser, Postman, PowerShell, etc.)              │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP + JWT
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY :3000                          │
│  • Enrutamiento: /api/auth, /api/users, /api/products         │
│  • Swagger Agregado: /api/docs                                 │
│  • CORS habilitado                                             │
└──────────┬──────────────────┬──────────────────┬────────────────┘
           │                  │                  │
           ▼                  ▼                  ▼
   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
   │ AUTH SERVICE  │  │ USERS SERVICE │  │PRODUCTS SRVCE │
   │  Port: 3001   │  │  Port: 3002   │  │  Port: 3003   │
   │ • Register    │  │ • Profiles    │  │ • Products    │
   │ • Login (JWT) │  │ • Addresses   │  │ • Categories  │
   │ • Validation  │  │ • JWT Guard   │  │ • JWT Guard   │
   └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
           │                  │                  │
           │ Pub: user.reg    │ Sub: user.reg    │ Pub: product.*
           └──────────────────┼──────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │     RABBITMQ       │
                    │   Port: 5672       │
                    │   Mgmt: 15672      │
                    │ Exchange: cafeteria│
                    └────────────────────┘
           
   ┌───────────────┐  ┌───────────────┐  ┌───────────────┐
   │   auth_db     │  │   users_db    │  │  products_db  │
   │  MySQL:3307   │  │  MySQL:3308   │  │  MySQL:3309   │
   │ • usuarios    │  │ • usuarios    │  │ • productos   │
   │ • refresh_tok │  │ • direcciones │  │ • categorias  │
   └───────────────┘  └───────────────┘  └───────────────┘
```

### Servicios y Puertos

| Servicio | Puerto | URL | Swagger |
|----------|--------|-----|---------|
| API Gateway | 3000 | http://localhost:3000 | http://localhost:3000/api/docs |
| Auth Service | 3001 | http://localhost:3001 | http://localhost:3001/docs |
| Users Service | 3002 | http://localhost:3002 | http://localhost:3002/docs |
| Products Service | 3003 | http://localhost:3003 | http://localhost:3003/docs |
| RabbitMQ | 5672/15672 | amqp://localhost:5672 | http://localhost:15672 |
| MySQL (auth) | 3307 | localhost:3307 | - |
| MySQL (users) | 3308 | localhost:3308 | - |
| MySQL (products) | 3309 | localhost:3309 | - |

### Flujo de Datos

**Registro de usuario:**
1. Cliente → Gateway `/api/auth/register`
2. Gateway → Auth Service `:3001/auth/register`
3. Auth guarda en `auth_db` y publica evento `user.registered` en RabbitMQ
4. Users Service consume evento y crea perfil en `users_db`

**Login y autenticación:**
1. Cliente → Gateway `/api/auth/login` con email/password
2. Auth valida credenciales y genera JWT firmado
3. Cliente usa JWT en header `Authorization: Bearer <token>`
4. Cada microservicio valida JWT independientemente con el mismo secreto

**Autorización por roles:**
- Endpoints de lectura (GET products/categories): públicos
- Endpoints de perfil (GET /users/me): requieren JWT
- Endpoints de escritura (POST/PUT/DELETE products): requieren JWT + rol admin

### Datos Iniciales

Las bases de datos se inicializan automáticamente con:
- **Usuarios**: admin@cafeteria.com (admin), cliente@cafeteria.com (cliente)
- **Categorías**: Bebidas Calientes, Bebidas Frías, Postres, Snacks
- **Productos**: 10 items precargados (Cappuccino, Latte, Smoothies, etc.)

## Preparación ANTES de la demo

### 🚀 Opción Rápida: Script Automático (RECOMENDADO)

Ejecuta el script de preparación que hace todo por ti:

```powershell
# Desde la raíz del proyecto
.\preparar-demo.ps1
```

Este script:
- ✅ Verifica que Docker esté corriendo
- ✅ Limpia volúmenes antiguos
- ✅ Construye y levanta todos los servicios
- ✅ Espera a que todo esté listo
- ✅ Prueba el login automáticamente
- ✅ Te muestra un resumen con todos los accesos

**Si el script funciona → ya estás listo para la demo** 🎉

#### Verificación Adicional: Script de Pruebas

```powershell
# Ejecuta suite completa de pruebas automáticas
.\test-sistema.ps1
```

Este script prueba:
- ✅ Disponibilidad de todos los servicios
- ✅ Login con admin y cliente
- ✅ Endpoints públicos (productos, categorías)
- ✅ Endpoints protegidos (perfil)
- ✅ Control de roles (403 para cliente, 201 para admin)
- ✅ RabbitMQ Management UI

**Si todas las pruebas pasan → Sistema 100% funcional** 🎉

---

### 📋 Opción Manual: Paso a Paso

Si prefieres hacerlo manualmente o el script falla:

#### Paso 1: Limpiar volúmenes antiguos

```powershell
docker compose down -v
```

**¿Por qué?** Elimina bases de datos viejas para que se inicialicen con los scripts SQL actualizados (contraseñas correctas).

#### Paso 2: Levantar el sistema

```powershell
docker compose up -d --build
```

Esto construye imágenes y crea 8 contenedores (3 BD, RabbitMQ, 3 servicios, Gateway).

#### Paso 3: Esperar que arranquen (~45 segundos)

```powershell
# Ver estado
docker ps

# Ver logs (opcional)
docker compose logs -f
# Presiona Ctrl+C para salir
```

#### Paso 4: Verificar accesos web

- Gateway: http://localhost:3000
- Swagger: http://localhost:3000/api/docs
- RabbitMQ: http://localhost:15672 (guest/guest)

#### Paso 5: Probar login

```powershell
$test = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body '{"email":"admin@cafeteria.com","password":"Admin123"}'
$test.access_token
```

Si ves un JWT → ✅ **Sistema listo**

---

### 📚 Recursos de referencia

- **Guía detallada de preparación**: `PREPARACION-DEMO.md`
- **Guía de Docker**: `DOCKER.md`
- **Guía de seguridad**: `SEGURIDAD.md`

### 👥 Usuarios precargados

| Email | Contraseña | Rol | Uso en demo |
|-------|-----------|-----|-------------|
| admin@cafeteria.com | Admin123 | admin | Crear/modificar productos |
| cliente@cafeteria.com | Cliente123 | cliente | Mostrar restricciones (403) |

---

## Demostración funcional del sistema

La demostración se divide en tres partes. Puedes hacerla por Swagger UI (más visual) o por comandos con PowerShell.

### 1) Autenticación y seguridad

Objetivo: mostrar login con usuarios precargados, uso de JWT y control de roles.

#### Opción A: Demo con usuario CLIENTE (recomendada para mostrar restricciones)

- Iniciar sesión con el cliente precargado:

```powershell
$loginCliente = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body (@{ email='cliente@cafeteria.com'; password='Cliente123' } | ConvertTo-Json)
$tokenCliente = $loginCliente.access_token
$headersCliente = @{ Authorization = "Bearer $tokenCliente" }
Write-Host "Token Cliente obtenido: $tokenCliente"
```

- Acceder a su propio perfil (endpoint protegido):

```powershell
$miPerfil = Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -Headers $headersCliente
$miPerfil
```

- Intentar un endpoint solo-admin (debe fallar con 403 Forbidden):

```powershell
$prodBody = @{ nombre='Café Especial'; descripcion='Origen único'; precio=65.00; id_categoria=1; stock=10 } | ConvertTo-Json
try {
    Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/products' -Headers $headersCliente -ContentType 'application/json' -Body $prodBody
} catch {
    Write-Host "❌ ACCESO DENEGADO (esperado): " -ForegroundColor Red
    $_.Exception.Response.StatusCode
}
```

#### Opción B: Demo con usuario ADMIN (para mostrar permisos completos)

- Iniciar sesión como administrador:

```powershell
$loginAdmin = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body (@{ email='admin@cafeteria.com'; password='Admin123' } | ConvertTo-Json)
$tokenAdmin = $loginAdmin.access_token
$headersAdmin = @{ Authorization = "Bearer $tokenAdmin" }
Write-Host "Token Admin obtenido: $tokenAdmin"
```

- Crear producto (debe responder 201 Created):

```powershell
$prodBody = @{ nombre='Café Premium'; descripcion='Granos de altura'; precio=75.00; id_categoria=1; stock=15 } | ConvertTo-Json
$nuevoProducto = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/products' -Headers $headersAdmin -ContentType 'application/json' -Body $prodBody
$nuevoProducto
```

**Puntos clave para remarcar:**
- ✅ El JWT se emite en Auth Service y se valida independientemente en cada microservicio
- ✅ Los endpoints sensibles (crear/modificar productos, listar usuarios) requieren rol `admin`
- ✅ Un usuario con rol `cliente` recibe **403 Forbidden** en operaciones restringidas
- ✅ La autenticación es stateless (sin sesiones en servidor, solo validación de firma JWT)

### 2) Comunicación entre microservicios

Objetivo: demostrar eventos asíncronos con RabbitMQ y sincronización de datos entre servicios.

#### Caso A: Evento `user.registered` (registro de nuevo usuario)

1. Registrar un nuevo usuario desde Auth Service:

```powershell
$nuevoUsuario = @{ 
    email='juan@example.com'
    password='Password123'
    nombre='Juan Pérez'
    telefono='555-1234'
    rol='cliente'
} | ConvertTo-Json

$registro = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/register' -ContentType 'application/json' -Body $nuevoUsuario
$registro
```

2. **¿Qué sucede internamente?**
   - Auth Service guarda el usuario en `auth_db`
   - Auth Service **publica evento** `user.registered` en RabbitMQ
   - Users Service **consume el evento** y crea el perfil en `users_db`

3. **Verificar sincronización** - Opción A (API con token admin):

```powershell
$usuarios = Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Headers $headersAdmin
$usuarios | Where-Object { $_.email -eq 'juan@example.com' }
```

4. **Verificar sincronización** - Opción B (consulta directa a BD):

```powershell
docker exec -i users-db mysql -uroot -proot -e "SELECT id_usuario, nombre, email, rol FROM users_db.usuarios WHERE email='juan@example.com';"
```

✅ **Resultado esperado:** El usuario existe en ambas bases de datos.

#### Caso B: Eventos de productos (visualizar en RabbitMQ)

1. Crear un producto con token admin (genera evento `product.created`):

```powershell
$nuevoProd = @{ nombre='Té Matcha'; descripcion='Té verde japonés'; precio=48.00; id_categoria=1; stock=25 } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/products' -Headers $headersAdmin -ContentType 'application/json' -Body $nuevoProd
```

2. **Ver eventos en RabbitMQ Management:**
   - Abre http://localhost:15672 (guest/guest)
   - Ve a pestaña **Exchanges** → busca `cafeteria.events`
   - Haz clic en el exchange → verás bindings a las colas
   - Ve a **Queues** → `auth_queue` y `products_queue` → verás mensajes procesados

**Puntos clave para remarcar:**
- ✅ Comunicación asíncrona desacoplada (Auth no necesita conocer la URL de Users)
- ✅ Resiliencia: si Users Service está caído, los mensajes quedan en cola hasta que se recupere
- ✅ Patrón Publish-Subscribe con exchange tipo `topic` y routing keys

### 3) Pruebas de Endpoints

Objetivo: validar todos los endpoints clave del sistema.

#### Opción visual: Swagger UI agregado

Abre http://localhost:3000/api/docs

- Haz clic en el botón **Authorize** (🔒) en la esquina superior derecha
- Pega el token (sin "Bearer", solo el JWT)
- Ahora puedes probar todos los endpoints visualmente

#### Opción PowerShell: Pruebas rápidas

**Endpoints públicos (sin autenticación):**

```powershell
# Listar todos los productos
$productos = Invoke-RestMethod -Uri 'http://localhost:3000/api/products'
$productos | Select-Object -First 3

# Listar todas las categorías
$categorias = Invoke-RestMethod -Uri 'http://localhost:3000/api/categories'
$categorias

# Obtener producto específico
Invoke-RestMethod -Uri 'http://localhost:3000/api/products/1'
```

**Endpoints protegidos (requieren JWT):**

```powershell
# Ver mi perfil (cualquier usuario autenticado)
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -Headers $headersAdmin

# Listar todos los usuarios (solo admin)
$todosUsuarios = Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Headers $headersAdmin
$todosUsuarios
```

**Endpoints de escritura (solo admin):**

```powershell
# Crear nueva categoría
$nuevaCat = @{ nombre='Bebidas de Temporada'; descripcion='Especiales del mes' } | ConvertTo-Json
$catCreada = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/categories' -Headers $headersAdmin -ContentType 'application/json' -Body $nuevaCat
$catCreada

# Actualizar precio de un producto
$actualizacion = @{ precio=52.50; stock=30 } | ConvertTo-Json
$prodActualizado = Invoke-RestMethod -Method Patch -Uri 'http://localhost:3000/api/products/1' -Headers $headersAdmin -ContentType 'application/json' -Body $actualizacion
$prodActualizado

# Eliminar un producto (cuidado, es destructivo)
# Invoke-RestMethod -Method Delete -Uri 'http://localhost:3000/api/products/10' -Headers $headersAdmin
```

**Puntos clave para remarcar:**
- ✅ Endpoints GET de lectura son públicos (catálogo accesible para frontend sin login)
- ✅ Operaciones de escritura (POST/PUT/PATCH/DELETE) protegidas con JWT + rol admin
- ✅ Validación de DTOs con class-validator (prueba enviar datos inválidos para ver errores 400)
- ✅ Gateway enruta a servicios correctos manteniendo transparencia para el cliente

---

## Qué decir en la exposición (guion corto)

1) Contexto: microservicios con NestJS, MySQL por servicio, RabbitMQ para eventos y Gateway para unificar rutas y docs.
2) Seguridad: JWT emitido por Auth; cada servicio valida; RolesGuard para admin/cliente.
3) Demo:
   - Registro y login → token.
   - Acceso protegido → ok.
   - Intento admin con cliente → 403.
   - Promoción a admin → crear producto → 201.
   - Mostrar usuarios sincronizados (API o BD) → evidencia de `user.registered`.
4) Cierre: Swagger agregado en el Gateway, RabbitMQ UI, datos de ejemplo listos y docker-compose para ejecución rápida.

## Recursos y documentación

- Despliegue: ver `DOCKER.md`
- Seguridad (flujos JWT/roles): ver `SEGURIDAD.md`
- Arquitectura por servicio: ver `microservices/README.md`
- SQL de inicialización: `microservices/database/*.sql`

## Solución de problemas (rápido)

- Aún no responde algún servicio tras `up -d`: espera 10–20s; revisa logs: `docker compose logs -f <servicio>`
- Error 403 con token válido: confirma rol admin para endpoints de escritura.
- Error 401: revisa encabezado `Authorization: Bearer <token>` y que el token no haya expirado.
- Puerto en uso: detén procesos previos o ajusta puertos en `docker-compose.yml`.

## Checklist ANTES de tu presentación

```
☐ Docker Desktop está corriendo
☐ Ejecutaste: docker compose down -v (limpiar volúmenes antiguos)
☐ Ejecutaste: docker compose up -d --build
☐ Esperaste ~30 segundos a que todos los servicios estén listos
☐ Verificaste: docker ps (8 contenedores activos)
☐ Probaste login con admin@cafeteria.com / Admin123 → obtuviste JWT
☐ Abriste http://localhost:3000/api/docs (Swagger funciona)
☐ Abriste http://localhost:15672 (RabbitMQ Management funciona)
```

## Criterios de éxito de la demo

✅ **Autenticación y seguridad:**
- Login con cliente y admin genera JWTs válidos
- Cliente puede ver su perfil pero NO crear productos (403)
- Admin puede crear/modificar productos y categorías

✅ **Comunicación entre microservicios:**
- Registrar nuevo usuario en Auth → aparece automáticamente en Users Service
- Verificable por API (/api/users) o consulta SQL directa
- RabbitMQ Management muestra el exchange `cafeteria.events` con colas activas

✅ **Pruebas de endpoints:**
- Endpoints públicos (GET /products, /categories) responden sin token
- Endpoints protegidos requieren JWT válido
- Endpoints admin rechazan tokens de cliente con 403
- Swagger UI documenta y permite probar todos los endpoints
