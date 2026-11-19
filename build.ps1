Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "Building JioTV for LG webOS (.ipk package)..." -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan

ares-package -e "sample.mp4" . service/com.codex.jtvwebos.service --outdir dist

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n[SUCCESS] Package successfully created in .\dist\" -ForegroundColor Green
    Get-ChildItem -Path ".\dist\*.ipk" | Select-Object Name, Length, LastWriteTime
} else {
    Write-Host "`n[ERROR] Build failed." -ForegroundColor Red
}
