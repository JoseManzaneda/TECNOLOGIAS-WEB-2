# Script de utilidades para el proyecto de migración a microservicios
# PowerShell

param(
    [Parameter(Position=0)]
    [string]$Command = "help"
)

function Show-Help {
    Write-Host "=== Utilidades de Desarrollo - Cafetería Microservicios ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\dev.ps1 <comando>" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Comandos disponibles:" -ForegroundColor Green
    Write-Host "  start-all       - Inicia todos los servicios con Docker Compose"
    Write-Host "  start-monolith  - Inicia solo el monolito legacy"
    Write-Host "  stop-all        - Detiene todos los servicios"
    Write-Host "  logs            - Muestra logs del monolito"
    Write-Host "  rebuild         - Reconstruye el monolito"
    Write-Host "  clean           - Limpia contenedores y volúmenes"
    Write-Host "  install         - Instala dependencias del monolito"
    Write-Host "  dev-local       - Inicia el monolito en modo desarrollo local"
    Write-Host "  test            - Ejecuta tests del monolito"
    Write-Host "  status          - Muestra el estado de los servicios"
    Write-Host "  help            - Muestra esta ayuda"
    Write-Host ""
}

function Start-All {
    Write-Host "Iniciando todos los servicios..." -ForegroundColor Green
    docker-compose up -d
    Write-Host "Servicios iniciados. Usa '.\dev.ps1 logs' para ver los logs" -ForegroundColor Green
}

function Start-Monolith {
    Write-Host "Iniciando monolito legacy..." -ForegroundColor Green
    docker-compose up -d postgres redis legacy-monolith
    Write-Host "Monolito iniciado en http://localhost:3001" -ForegroundColor Green
}

function Stop-All {
    Write-Host "Deteniendo todos los servicios..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "Servicios detenidos" -ForegroundColor Green
}

function Show-Logs {
    Write-Host "Mostrando logs del monolito (Ctrl+C para salir)..." -ForegroundColor Cyan
    docker-compose logs -f legacy-monolith
}

function Rebuild-Monolith {
    Write-Host "Reconstruyendo el monolito..." -ForegroundColor Yellow
    docker-compose build --no-cache legacy-monolith
    docker-compose up -d legacy-monolith
    Write-Host "Monolito reconstruido e iniciado" -ForegroundColor Green
}

function Clean-All {
    Write-Host "¿Estás seguro? Esto eliminará todos los contenedores y volúmenes (incluyendo datos de BD)" -ForegroundColor Red
    $confirm = Read-Host "Escribe 'SI' para confirmar"
    if ($confirm -eq "SI") {
        Write-Host "Limpiando..." -ForegroundColor Yellow
        docker-compose down -v
        Write-Host "Limpieza completada" -ForegroundColor Green
    } else {
        Write-Host "Operación cancelada" -ForegroundColor Yellow
    }
}

function Install-Dependencies {
    Write-Host "Instalando dependencias del monolito..." -ForegroundColor Green
    Set-Location "services\legacy-monolith"
    npm install
    Set-Location "..\..\"
    Write-Host "Dependencias instaladas" -ForegroundColor Green
}

function Start-DevLocal {
    Write-Host "Iniciando desarrollo local del monolito..." -ForegroundColor Green
    Write-Host "Asegúrate de tener PostgreSQL y Redis corriendo localmente" -ForegroundColor Yellow
    Set-Location "services\legacy-monolith"
    npm run start:dev
}

function Run-Tests {
    Write-Host "Ejecutando tests del monolito..." -ForegroundColor Green
    Set-Location "services\legacy-monolith"
    npm test
    Set-Location "..\..\"
}

function Show-Status {
    Write-Host "Estado de los servicios:" -ForegroundColor Cyan
    docker-compose ps
    Write-Host ""
    Write-Host "Puertos:" -ForegroundColor Cyan
    Write-Host "  PostgreSQL: 5433"
    Write-Host "  Redis: 6379"
    Write-Host "  Legacy Monolith: 3001"
    Write-Host "  API Gateway (pendiente): 3000"
}

# Ejecutar comando
switch ($Command.ToLower()) {
    "start-all" { Start-All }
    "start-monolith" { Start-Monolith }
    "stop-all" { Stop-All }
    "logs" { Show-Logs }
    "rebuild" { Rebuild-Monolith }
    "clean" { Clean-All }
    "install" { Install-Dependencies }
    "dev-local" { Start-DevLocal }
    "test" { Run-Tests }
    "status" { Show-Status }
    "help" { Show-Help }
    default { 
        Write-Host "Comando no reconocido: $Command" -ForegroundColor Red
        Write-Host ""
        Show-Help
    }
}
