# Script de preparación automática para la demo
# Ejecutar desde la raíz del proyecto: .\preparar-demo.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   PREPARACIÓN DE DEMO - CAFETERÍA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Docker
Write-Host "🔍 Verificando Docker Desktop..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Docker Desktop no está corriendo" -ForegroundColor Red
    Write-Host "   Por favor inicia Docker Desktop y vuelve a ejecutar este script" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Docker Desktop está activo" -ForegroundColor Green
Write-Host ""

# Paso 1: Limpiar contenedores y volúmenes
Write-Host "🧹 Paso 1: Limpiando contenedores y volúmenes antiguos..." -ForegroundColor Yellow
docker compose down -v 2>$null
Write-Host "✅ Limpieza completada" -ForegroundColor Green
Write-Host ""

# Paso 2: Construir y levantar servicios
Write-Host "🚀 Paso 2: Construyendo y levantando servicios..." -ForegroundColor Yellow
Write-Host "   (Esto puede tardar 2-3 minutos la primera vez)" -ForegroundColor Gray
docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ ERROR: Falló docker compose up" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Servicios levantados" -ForegroundColor Green
Write-Host ""

# Paso 3: Esperar a que los servicios estén listos
Write-Host "⏳ Paso 3: Esperando que los servicios estén listos..." -ForegroundColor Yellow
Write-Host "   (Esperando 45 segundos para que MySQL y servicios arranquen)" -ForegroundColor Gray
Start-Sleep -Seconds 45

# Verificar contenedores
Write-Host ""
Write-Host "📋 Contenedores activos:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String -Pattern "(NAMES|rabbitmq|auth|users|products|gateway)"
Write-Host ""

# Paso 4: Probar conectividad
Write-Host "🔌 Paso 4: Verificando conectividad..." -ForegroundColor Yellow

$servicios = @(
    @{Nombre="Gateway"; URL="http://localhost:3000"},
    @{Nombre="Auth Service"; URL="http://localhost:3001"},
    @{Nombre="Users Service"; URL="http://localhost:3002"},
    @{Nombre="Products Service"; URL="http://localhost:3003"}
)

foreach ($servicio in $servicios) {
    try {
        $response = Invoke-WebRequest -Uri $servicio.URL -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        Write-Host "  ✅ $($servicio.Nombre) respondiendo" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  $($servicio.Nombre) no responde aún (puede necesitar más tiempo)" -ForegroundColor Yellow
    }
}
Write-Host ""

# Paso 5: Probar login
Write-Host "🔑 Paso 5: Probando autenticación..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@cafeteria.com"
        password = "Admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/auth/login' -ContentType 'application/json' -Body $loginBody -ErrorAction Stop
    
    if ($loginResponse.access_token) {
        Write-Host "✅ Login exitoso - JWT obtenido" -ForegroundColor Green
        Write-Host "   Token: $($loginResponse.access_token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host ""
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "   ✨ SISTEMA LISTO PARA LA DEMO ✨" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📚 Recursos disponibles:" -ForegroundColor Yellow
        Write-Host "   • Gateway: http://localhost:3000" -ForegroundColor White
        Write-Host "   • Swagger: http://localhost:3000/api/docs" -ForegroundColor White
        Write-Host "   • RabbitMQ: http://localhost:15672 (guest/guest)" -ForegroundColor White
        Write-Host ""
        Write-Host "👥 Usuarios de prueba:" -ForegroundColor Yellow
        Write-Host "   • admin@cafeteria.com / Admin123 (rol: admin)" -ForegroundColor White
        Write-Host "   • cliente@cafeteria.com / Cliente123 (rol: cliente)" -ForegroundColor White
        Write-Host ""
        Write-Host "📖 Sigue los pasos en: Presentacion.md" -ForegroundColor Cyan
    }
} catch {
    Write-Host "⚠️  Login falló - Los servicios pueden necesitar más tiempo" -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔄 Recomendación: Espera 30 segundos más y ejecuta:" -ForegroundColor Yellow
    Write-Host '   Invoke-RestMethod -Method Post -Uri "http://localhost:3000/api/auth/login" -ContentType "application/json" -Body ''{"email":"admin@cafeteria.com","password":"Admin123"}''' -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Si funciona, el sistema está listo ✅" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Ver logs en tiempo real:" -ForegroundColor Yellow
Write-Host "   docker compose logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Detener todo:" -ForegroundColor Yellow
Write-Host "   docker compose down -v" -ForegroundColor Gray
Write-Host ""
