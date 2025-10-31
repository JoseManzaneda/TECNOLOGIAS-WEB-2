# ⚡ GUÍA RÁPIDA: Preparación para la Demo

## 🎯 Lo que debes hacer ANTES de la presentación

### ✅ Paso 1: Limpiar bases de datos antiguas

```powershell
# Desde la raíz del proyecto (donde está docker-compose.yml)
cd c:\Users\HP\GitHub\TECNOLOGIAS-WEB-2
docker compose down -v
```

**¿Por qué?** Esto elimina volúmenes antiguos de MySQL. Los nuevos contenedores ejecutarán automáticamente los scripts SQL actualizados con las contraseñas correctas.

### ✅ Paso 2: Construir y levantar todo

```powershell
docker compose up -d --build
```

**Tiempo estimado:** 2-3 minutos (primera vez construye las imágenes)

### ✅ Paso 3: Esperar que todo esté listo

```powershell
# Ver estado de contenedores (deben estar todos "Up")
docker ps

# Ver logs en tiempo real para confirmar que no hay errores
docker compose logs -f
# Presiona Ctrl+C cuando veas que los servicios están escuchando en sus puertos
```

**Señales de éxito:**
- `auth-service` → "Application is running on: http://[::]:3001"
- `users-service` → "Application is running on: http://[::]:3002"  
- `products-service` → "Application is running on: http://[::]:3003"
- `api-gateway` → "Application is running on: http://[::]:3000"

### ✅ Paso 4: Verificar accesos web

Abre estos URLs en tu navegador:

- ✅ Gateway: http://localhost:3000 (debe responder con mensaje de bienvenida o 404, eso es normal)
- ✅ Swagger agregado: http://localhost:3000/api/docs (debe mostrar la UI de Swagger con 3 servicios)
- ✅ RabbitMQ Management: http://localhost:15672 (login: guest / guest)

### ✅ Paso 5: Probar login (CRÍTICO)

Ejecuta esto en PowerShell para confirmar que las credenciales funcionan:

```powershell
# Probar login con admin
$loginTest = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body '{"email":"admin@cafeteria.com","password":"Admin123"}'

# Si ves un JWT largo → TODO ESTÁ LISTO ✅
$loginTest.access_token
```

**Si obtienes un JWT** → Estás listo para la demo 🎉

**Si falla con error 401** → Verifica que ejecutaste el Paso 1 (down -v) antes de up

---

## 📋 Usuarios precargados para la demo

Las bases de datos YA tienen estos usuarios listos:

| Usuario | Contraseña | Rol | Propósito en la demo |
|---------|-----------|-----|----------------------|
| admin@cafeteria.com | Admin123 | admin | Crear/modificar productos, ver usuarios |
| cliente@cafeteria.com | Cliente123 | cliente | Mostrar restricciones (403 en endpoints admin) |

---

## 🚀 Durante la presentación

**Sigue el orden en `Presentacion.md`:**

1. Autenticación y seguridad (login, JWT, roles)
2. Comunicación entre microservicios (registrar usuario → RabbitMQ → sincronización)
3. Pruebas de endpoints (público vs protegido vs admin)

**Herramientas que puedes usar:**
- PowerShell (comandos listos en `Presentacion.md`)
- Swagger UI (http://localhost:3000/api/docs) - más visual
- RabbitMQ Management (para mostrar exchanges y colas)

---

## 🆘 Troubleshooting rápido

| Problema | Solución |
|----------|----------|
| Puerto 3000 en uso | `docker compose down` y cierra apps que usen ese puerto |
| Login falla (401) | Ejecuta `docker compose down -v` y vuelve a `up -d --build` |
| Servicio no responde | Espera 30s más o revisa logs: `docker compose logs <servicio>` |
| RabbitMQ no accesible | Espera que el contenedor arranque (tarda ~10s más que otros) |

---

## ✨ Checklist final antes de presentar

```
☐ Docker Desktop corriendo
☐ docker compose down -v ejecutado
☐ docker compose up -d --build ejecutado
☐ Esperé 30-60 segundos
☐ docker ps muestra 8 contenedores activos
☐ Login de prueba con admin funcionó (obtuve JWT)
☐ http://localhost:3000/api/docs carga
☐ http://localhost:15672 carga (guest/guest)
☐ Tengo Presentacion.md abierto con los comandos listos
```

**¡Listo para tu demo! 🎓**
