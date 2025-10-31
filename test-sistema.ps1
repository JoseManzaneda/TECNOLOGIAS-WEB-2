# Script de Pruebas Rápidas del Sistema
# Ejecutar: .\test-sistema.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PRUEBAS RÁPIDAS DEL SISTEMA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$errores = 0
$exitosos = 0

# Función para probar endpoint
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )
    
    Write-Host "🧪 Probando: $Name" -ForegroundColor Yellow
    
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = 'application/json'
            TimeoutSec = 10
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = $Body
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        
        if ($response.StatusCode -eq $ExpectedStatus) {
            Write-Host "   ✅ OK - Status $($response.StatusCode)" -ForegroundColor Green
            $script:exitosos++
            return $true
        } else {
            Write-Host "   ⚠️  Status inesperado: $($response.StatusCode) (esperaba $ExpectedStatus)" -ForegroundColor Yellow
            $script:errores++
            return $false
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "   ✅ OK - Status $statusCode (error esperado)" -ForegroundColor Green
            $script:exitosos++
            return $true
        } else {
            Write-Host "   ❌ ERROR: $($_.Exception.Message)" -ForegroundColor Red
            $script:errores++
            return $false
        }
    }
}

Write-Host "🔍 FASE 1: Verificación de Servicios" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Name "Gateway disponible" -Method GET -Url "$baseUrl" -ExpectedStatus 404
Test-Endpoint -Name "Swagger Gateway" -Method GET -Url "$baseUrl/api/docs" -ExpectedStatus 200
Test-Endpoint -Name "Auth Service directo" -Method GET -Url "http://localhost:3001" -ExpectedStatus 404
Test-Endpoint -Name "Users Service directo" -Method GET -Url "http://localhost:3002" -ExpectedStatus 404
Test-Endpoint -Name "Products Service directo" -Method GET -Url "http://localhost:3003" -ExpectedStatus 404

Write-Host ""
Write-Host "🔐 FASE 2: Autenticación" -ForegroundColor Cyan
Write-Host ""

# Login con admin
$loginBody = @{
    email = "admin@cafeteria.com"
    password = "Admin123"
} | ConvertTo-Json

Write-Host "🔑 Login como admin..." -ForegroundColor Yellow
try {
    $loginResponse = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -ContentType 'application/json' -Body $loginBody
    
    if ($loginResponse.access_token) {
        Write-Host "   ✅ Token obtenido: $($loginResponse.access_token.Substring(0,30))..." -ForegroundColor Green
        $tokenAdmin = $loginResponse.access_token
        $headersAdmin = @{ Authorization = "Bearer $tokenAdmin" }
        $script:exitosos++
    } else {
        Write-Host "   ❌ No se obtuvo token" -ForegroundColor Red
        $script:errores++
        exit 1
    }
} catch {
    Write-Host "   ❌ Login falló: $($_.Exception.Message)" -ForegroundColor Red
    $script:errores++
    exit 1
}

# Login con cliente
$loginBodyCliente = @{
    email = "cliente@cafeteria.com"
    password = "Cliente123"
} | ConvertTo-Json

Write-Host "🔑 Login como cliente..." -ForegroundColor Yellow
try {
    $loginResponseCliente = Invoke-RestMethod -Method Post -Uri "$baseUrl/api/auth/login" -ContentType 'application/json' -Body $loginBodyCliente
    
    if ($loginResponseCliente.access_token) {
        Write-Host "   ✅ Token obtenido: $($loginResponseCliente.access_token.Substring(0,30))..." -ForegroundColor Green
        $tokenCliente = $loginResponseCliente.access_token
        $headersCliente = @{ Authorization = "Bearer $tokenCliente" }
        $script:exitosos++
    }
} catch {
    Write-Host "   ⚠️  Login de cliente falló (no crítico)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📦 FASE 3: Endpoints Públicos" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Name "Listar productos" -Method GET -Url "$baseUrl/api/products" -ExpectedStatus 200
Test-Endpoint -Name "Listar categorías" -Method GET -Url "$baseUrl/api/categories" -ExpectedStatus 200
Test-Endpoint -Name "Obtener producto 1" -Method GET -Url "$baseUrl/api/products/1" -ExpectedStatus 200

Write-Host ""
Write-Host "🔒 FASE 4: Endpoints Protegidos" -ForegroundColor Cyan
Write-Host ""

Test-Endpoint -Name "Mi perfil (admin)" -Method GET -Url "$baseUrl/api/users/me" -Headers $headersAdmin -ExpectedStatus 200

Write-Host ""
Write-Host "👮 FASE 5: Control de Roles" -ForegroundColor Cyan
Write-Host ""

# Cliente intenta crear producto (debe fallar 403)
$productoNuevo = @{
    nombre = "Test Producto"
    descripcion = "Solo para prueba"
    precio = 99.99
    id_categoria = 1
    stock = 10
} | ConvertTo-Json

if ($headersCliente) {
    Test-Endpoint -Name "Cliente crea producto (debe fallar)" -Method POST -Url "$baseUrl/api/products" `
        -Headers $headersCliente -Body $productoNuevo -ExpectedStatus 403
}

# Admin crea producto (debe funcionar)
Test-Endpoint -Name "Admin crea producto (debe funcionar)" -Method POST -Url "$baseUrl/api/products" `
    -Headers $headersAdmin -Body $productoNuevo -ExpectedStatus 201

Write-Host ""
Write-Host "🎭 FASE 6: RabbitMQ" -ForegroundColor Cyan
Write-Host ""

# Verificar RabbitMQ Management
Test-Endpoint -Name "RabbitMQ Management UI" -Method GET -Url "http://localhost:15672" -ExpectedStatus 200

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   RESUMEN DE PRUEBAS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Pruebas exitosas: $exitosos" -ForegroundColor Green
Write-Host "❌ Pruebas fallidas: $errores" -ForegroundColor Red
Write-Host ""

if ($errores -eq 0) {
    Write-Host "🎉 TODAS LAS PRUEBAS PASARON - SISTEMA LISTO 🎉" -ForegroundColor Green
    Write-Host ""
    Write-Host "📚 Puedes proceder con la demo siguiendo: Presentacion.md" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "⚠️  ALGUNAS PRUEBAS FALLARON" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🔧 Recomendaciones:" -ForegroundColor Yellow
    Write-Host "   1. Verifica que todos los contenedores estén activos: docker ps" -ForegroundColor Gray
    Write-Host "   2. Revisa logs: docker compose logs -f" -ForegroundColor Gray
    Write-Host "   3. Intenta reiniciar: docker compose restart" -ForegroundColor Gray
    Write-Host ""
    exit 1
}
