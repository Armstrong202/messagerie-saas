# Lancement Ophthalmology SaaS
cd ophthalmology-saas

Write-Host "🚀 Démarrage plateforme Ophtalmologie SaaS" -ForegroundColor Green

# Stop si déjà lancé
docker compose down

# Build et up
docker compose build --no-cache
docker compose up -d

Write-Host "✅ Backend: http://localhost:8000/docs" -ForegroundColor Green
Write-Host "✅ Frontend: http://localhost:3000" -ForegroundColor Green
Write-Host "✅ DB: localhost:5432 (admin/secret)" -ForegroundColor Cyan

# Wait and check
Start-Sleep 10
docker compose ps

Write-Host "`nTest API:" -ForegroundColor Yellow
Invoke-WebRequest -Uri http://localhost:8000/health -UseBasicParsing

Write-Host "`nLogs: docker compose logs -f" -ForegroundColor Cyan

