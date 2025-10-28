# Auth Service - Guía de Pruebas

## 🧪 Pruebas Manuales con cURL/PowerShell

### 1. Health Check
```powershell
curl http://localhost:3001/auth/health
```

### 2. Registrar Usuario
```powershell
$body = @{
    nombre = "Juan Pérez"
    email = "juan@cafeteria.com"
    password = "Password123"
    telefono = "987654321"
    rol = "cliente"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3001/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### 3. Login
```powershell
$loginBody = @{
    email = "juan@cafeteria.com"
    password = "Password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $response.access_token
Write-Host "Token: $token"
```

### 4. Obtener Perfil (requiere token)
```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3001/auth/profile" -Method GET -Headers $headers
```

### 5. Validar Token
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/auth/validate" -Method GET -Headers $headers
```

## 📋 Checklist de Verificación

- [ ] El servicio inicia sin errores en puerto 3001
- [ ] Endpoint `/auth/health` responde con status 200
- [ ] Se puede registrar un nuevo usuario
- [ ] El evento `user.registered` se emite a RabbitMQ
- [ ] Se puede hacer login con credenciales correctas
- [ ] Login falla con credenciales incorrectas
- [ ] Se genera un token JWT válido
- [ ] El endpoint `/auth/profile` requiere autenticación
- [ ] El endpoint `/auth/validate` verifica tokens correctamente
- [ ] Las contraseñas se hashean con bcrypt
- [ ] No se puede registrar el mismo email dos veces

## 🔧 Verificar Base de Datos

```sql
USE auth_db;

-- Ver usuarios registrados
SELECT id_usuario, nombre, email, rol, fecha_registro 
FROM usuarios;

-- Verificar que las contraseñas estén hasheadas
SELECT id_usuario, email, LEFT(contraseña, 20) as password_hash
FROM usuarios;
```

## 🐰 Verificar RabbitMQ

1. Acceder a la interfaz web: http://localhost:15672
2. Usuario: guest / Contraseña: guest
3. Verificar que existe el exchange `cafeteria.events`
4. Verificar que existe la cola `auth_queue`
5. Al registrar un usuario, debe aparecer un mensaje en RabbitMQ

## ⚠️ Problemas Comunes

### Puerto 3001 ya en uso
```powershell
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### MySQL no conecta
```powershell
# Verificar que MySQL esté corriendo
Get-Service -Name MySQL*

# Verificar que auth_db existe
mysql -u root -p -e "SHOW DATABASES;"
```

### RabbitMQ no conecta
```bash
# Verificar servicio
rabbitmq-service status

# O con Docker
docker ps | grep rabbitmq
```
