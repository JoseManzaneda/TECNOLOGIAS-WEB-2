# Presentación del Proyecto: Microservicios Cafetería

Esta guía te prepara para explicar y demostrar el proyecto de forma clara, paso a paso, cubriendo arquitectura, ejecución y una demo funcional centrada en: comunicación entre microservicios, autenticación/seguridad y pruebas de endpoints.

## ¿Qué es este proyecto?

- Backend académico para una cafetería, implementado con:
  - NestJS 10 + TypeScript, TypeORM 0.3 (MySQL)
  - API Gateway + 3 microservicios: Auth, Users, Products
  - Mensajería asíncrona con RabbitMQ (eventos: user.registered, product.*)
  - Documentación OpenAPI/Swagger por servicio y agregada en el Gateway
  - Contenedores y orquestación con Docker Compose

## Arquitectura (resumen)

Servicios y puertos expuestos por defecto:
- API Gateway: http://localhost:3000
  - Proxy:
    - /api/auth → Auth Service
    - /api/users → Users Service
    - /api/products y /api/categories → Products Service
  - Swagger agregado: http://localhost:3000/api/docs
- Auth Service: http://localhost:3001 (Swagger: /docs)
- Users Service: http://localhost:3002 (Swagger: /docs)
- Products Service: http://localhost:3003 (Swagger: /docs)
- RabbitMQ Management: http://localhost:15672 (guest/guest)
- MySQL:
  - auth-db: localhost:3307
  - users-db: localhost:3308
  - products-db: localhost:3309

Bases de datos independientes por servicio, inicializadas desde `microservices/database/*.sql` con datos de ejemplo (categorías, productos y usuarios de muestra).

Notas clave de seguridad:
- Autenticación con JWT; cada servicio valida el token con el mismo secreto.
- Autorización por roles (cliente/admin) aplicada en Users y Products.
- El Gateway enruta; la validación de JWT ocurre en cada microservicio.

## Cómo ejecutar el sistema

Requisitos: Docker Desktop instalado y activo.

1) Levantar todo con Docker Compose (desde la raíz del repo):

```powershell
# Windows PowerShell
docker compose up -d --build
```

2) Verificar que los contenedores están arriba:

```powershell
docker ps
```

3) Accesos rápidos:
- Gateway: http://localhost:3000
- Swagger agregado: http://localhost:3000/api/docs
- RabbitMQ: http://localhost:15672 (guest/guest)

Para más detalle de despliegue: ver `DOCKER.md`.

---

## Demostración funcional del sistema

La demostración se divide en tres partes. Puedes hacerla por Swagger UI (más visual) o por comandos con PowerShell.

### 1) Autenticación y seguridad

Objetivo: mostrar registro, login, uso de JWT y control de roles.

- Registrar un usuario cliente (vía Gateway):

```powershell
$body = @{ email='juan@example.com'; password='Password123'; nombre='Juan Pérez'; telefono='555-1234' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/register' -ContentType 'application/json' -Body $body
```

- Iniciar sesión y obtener el JWT:

```powershell
$login = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body (@{ email='juan@example.com'; password='Password123' } | ConvertTo-Json)
$token = $login.access_token
$headers = @{ Authorization = "Bearer $token" }
$token
```

- Acceder a un endpoint protegido (perfil):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -Headers $headers
```

- Intentar un endpoint solo-admin (debe fallar 403):

```powershell
$prodBody = @{ nombre='Café Especial'; descripcion='Origen único'; precio=65.00; id_categoria=1; stock=10 } | ConvertTo-Json
# Nota: Invoke-RestMethod lanzará excepción en 403. Puedes observar el 403 usando curl:
curl -X POST 'http://localhost:3000/api/products' -H "Authorization: Bearer $token" -H "Content-Type: application/json" -d $prodBody
```

- Elevar el rol del usuario a admin para completar la prueba (opcional rápido):

```powershell
# Actualiza el rol en ambas BD para mantener consistencia
docker exec -i auth-db mysql -uroot -proot -e "UPDATE auth_db.usuarios SET rol='admin' WHERE email='juan@example.com';"
docker exec -i users-db mysql -uroot -proot -e "UPDATE users_db.usuarios SET rol='admin' WHERE email='juan@example.com';"
```

- Reintentar crear producto (ahora debe responder 201):

```powershell
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/products' -Headers $headers -ContentType 'application/json' -Body $prodBody
```

Puntos a remarcar mientras presentas:
- El JWT se emite en Auth y se valida en cada microservicio.
- Los endpoints sensibles en Products y Users requieren rol admin.
- Un usuario con rol cliente recibe 403 en operaciones restringidas.

### 2) Comunicación entre microservicios

Objetivo: demostrar eventos asíncronos con RabbitMQ y datos sincronizados.

Caso principal: `user.registered`
1. Ya registraste `juan@example.com` en Auth (auth_db crea el usuario).
2. Auth publica el evento `user.registered` en RabbitMQ.
3. Users Service consume el evento y crea el perfil en `users_db`.

Cómo evidenciarlo:
- Opción A (API): lista de usuarios desde Users (requiere rol admin):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/users' -Headers $headers
```

- Opción B (BD): consulta directa en `users_db`:

```powershell
docker exec -i users-db mysql -uroot -proot -e "SELECT id_usuario, nombre, email, rol FROM users_db.usuarios WHERE email='juan@example.com';"
```

Extras (visuales):
- Abre RabbitMQ Management → Exchanges → `cafeteria.events` para ver bindings y colas.
- Crea/actualiza/elimina un producto (siendo admin) para generar eventos `product.*`.

### 3) Pruebas de Endpoints (rápidas)

Puedes usar la UI agregada en `http://localhost:3000/api/docs` (botón Authorize para JWT) o los siguientes ejemplos.

- Productos (público):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/products'
```

- Categorías (público):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/categories'
```

- Perfil (protegido):

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/users/me' -Headers $headers
```

- Crear categoría (admin):

```powershell
$catBody = @{ nombre='Nuevas Bebidas'; descripcion='Edición de temporada' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/categories' -Headers $headers -ContentType 'application/json' -Body $catBody
```

- Actualizar producto (admin):

```powershell
$updBody = @{ precio=59.90; stock=25 } | ConvertTo-Json
Invoke-RestMethod -Method Patch -Uri 'http://localhost:3000/api/products/1' -Headers $headers -ContentType 'application/json' -Body $updBody
```

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

## Criterios de éxito de la demo

- Se obtiene un JWT en el login y permite acceder a `/api/users/me`.
- Un cliente recibe 403 al crear productos; un admin puede crear y modificar.
- Tras registrar un usuario en Auth, el Users Service refleja ese usuario (API o BD), evidenciando la mensajería.
- Swagger agregado responde y documenta todos los endpoints.
