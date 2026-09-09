@echo off
chcp 65001 >nul
title Kitaplığım Obsidian Başlatıcı
echo ========================================================
echo         KİTAPLIĞIM - KİŞİSEL KÜTÜPHANE VE OKUMA TAKİP
echo ========================================================
echo.
echo 1) Native Standalone Uygulamasını Başlat (Kitaplik-Native.exe)
echo 2) Masaüstü Pencere Modunda Aç (Edge App Modu - Çerçevesiz)
echo 3) Çıkış
echo.
set /p secim="Seçiminiz (1, 2 veya 3): "

if "%secim%"=="1" (
    echo.
    echo Standalone C++ Win32 uygulaması başlatılıyor...
    start "" "%~dp0Kitaplik-Native.exe"
    exit /b
)

if "%secim%"=="2" (
    echo.
    echo Masaüstü Pencere Modu açılıyor...
    if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" (
        start "" "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" --app="https://ais-dev-otwtau677gou4ba6srynlr-818432400034.europe-west2.run.app" --window-size=1280,850
    ) else (
        start https://ais-dev-otwtau677gou4ba6srynlr-818432400034.europe-west2.run.app
    )
    exit /b
)

exit /b
