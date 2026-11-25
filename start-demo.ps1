# OMNIS-X Live Demo Orchestrator
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  OMNIS-X LIVE DEMO LAUNCHER (4 Apps + 1 FastAPI Backend)  " -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Start FastAPI Backend on Port 8000
Write-Host "[1/5] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\parallax\OMNIS-X\omnis-x; python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

Start-Sleep -Seconds 2

# 2. Start Command Centre on Port 3000
Write-Host "[2/5] Starting Command Centre on http://localhost:3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\parallax\OMNIS-X\omnis-x\frontend; pnpm start -p 3000"

# 3. Start 3D Digital Twin on Port 3001
Write-Host "[3/5] Starting Digital Twin on http://localhost:3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\parallax\OMNIS-X\omnis-x\frontend; pnpm start -p 3001"

# 4. Start Incident Response on Port 3002
Write-Host "[4/5] Starting Incident Response on http://localhost:3002..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\parallax\OMNIS-X\omnis-x\frontend; pnpm start -p 3002"

# 5. Start Student Grievance PWA on Port 8090
Write-Host "[5/5] Starting Student Grievance PWA on http://localhost:8090..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd D:\parallax\OMNIS-X\omnis-x\pwa; python server.py"

Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  All 5 services launched successfully in separate shells! " -ForegroundColor Green
Write-Host "  - Command Centre:     http://localhost:3000              " -ForegroundColor Cyan
Write-Host "  - 3D Digital Twin:    http://localhost:3001              " -ForegroundColor Cyan
Write-Host "  - Incident Response:  http://localhost:3002              " -ForegroundColor Cyan
Write-Host "  - Student PWA:        http://localhost:8090              " -ForegroundColor Cyan
Write-Host "  - FastAPI Backend:    http://127.0.0.1:8000              " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Green
