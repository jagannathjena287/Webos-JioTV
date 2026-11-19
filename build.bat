@echo off
echo ==============================================
echo Building JioTV for LG webOS (.ipk package)...
echo ==============================================
ares-package -e "sample.mp4" . service/com.codex.jtvwebos.service --outdir dist
if %ERRORLEVEL% equ 0 (
    echo [SUCCESS] Package created in .\dist\
) else (
    echo [ERROR] Build failed.
)
