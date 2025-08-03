@echo off
echo 🔍 VALIDADOR DE INSTALACAO WEIGHT-APP
echo ====================================
echo.

:: Ir para o diretório do script
cd /d "%~dp0"

:: Verificar arquivos essenciais
echo 📁 Verificando arquivos essenciais...
set "arquivos_ok=1"

if not exist "package.json" (
    echo ❌ package.json - NAO ENCONTRADO
    set "arquivos_ok=0"
) else (
    echo ✅ package.json - OK
)

if not exist "server.js" (
    echo ❌ server.js - NAO ENCONTRADO
    set "arquivos_ok=0"
) else (
    echo ✅ server.js - OK
)

if not exist "app.js" (
    echo ❌ app.js - NAO ENCONTRADO
    set "arquivos_ok=0"
) else (
    echo ✅ app.js - OK
)

if not exist "configuracao.js" (
    echo ❌ configuracao.js - NAO ENCONTRADO
    set "arquivos_ok=0"
) else (
    echo ✅ configuracao.js - OK
)

if not exist ".env" (
    echo ⚠️ .env - NAO ENCONTRADO (sera criado na configuracao)
) else (
    echo ✅ .env - OK
)

echo.

:: Verificar node_modules
if not exist "node_modules" (
    echo 📦 node_modules - NAO ENCONTRADO
    echo 💡 Execute: npm install
    set "arquivos_ok=0"
) else (
    echo ✅ node_modules - OK
)

echo.

:: Verificar Node.js
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js NAO INSTALADO
    echo 💡 Baixe em: https://nodejs.org
    set "arquivos_ok=0"
) else (
    for /f "tokens=*" %%i in ('node --version') do set node_version=%%i
    echo ✅ Node.js %node_version% - OK
)

echo.

:: Verificar npm
echo 🔍 Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm NAO DISPONIVEL
    set "arquivos_ok=0"
) else (
    for /f "tokens=*" %%i in ('npm --version') do set npm_version=%%i
    echo ✅ npm %npm_version% - OK
)

echo.

:: Resultado final
if "%arquivos_ok%"=="1" (
    echo ✅ VALIDACAO CONCLUIDA - TUDO OK!
    echo.
    echo 🚀 Pronto para instalar! Execute:
    echo    install-configurado.bat
) else (
    echo ❌ PROBLEMAS ENCONTRADOS!
    echo.
    echo 🔧 Corrija os problemas acima antes de continuar
)

echo.
pause
