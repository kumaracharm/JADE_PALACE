# Stop all OMNIS-X demo processes on ports 8000, 3000, 3001, 3002, 8090
Write-Host "Stopping OMNIS-X demo processes on ports 8000, 3000, 3001, 3002, 8090..." -ForegroundColor Yellow
Get-NetTCPConnection -LocalPort 8000, 3000, 3001, 3002, 8090 -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
        Write-Host "Terminated PID $($_.OwningProcess) on port $($_.LocalPort)" -ForegroundColor Green
    } catch {
        # ignore
    }
}
Write-Host "All demo ports cleared." -ForegroundColor Green
