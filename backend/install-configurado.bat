@echo off
echo ===========================================
echo    INSTALADOR WEIGHT APP - CONFIGURACAO
echo ===========================================
echo.

:: Verificar se Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js nao encontrado!
    echo Por favor, instale o Node.js antes de continuar.
    echo Download: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js encontrado
echo.

:: Instalar dependências
echo 📦 Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependencias
    pause
    exit /b 1
)

echo ✅ Dependencias instaladas
echo.

:: Configurar balança
echo 🔧 Iniciando configuracao da balanca...
echo.
node configuracao.js
if errorlevel 1 (
    echo ❌ Erro na configuracao da balanca
    pause
    exit /b 1
)

echo.
echo ✅ Configuracao concluida!
echo.

:: Perguntar sobre instalação como serviço
echo Deseja instalar como servico do Windows? (s/n)
set /p instalar_servico="> "

if /i "%instalar_servico%"=="s" (
    echo.
    echo 🔧 Instalando como servico...
    node install-service.js
    if errorlevel 1 (
        echo ❌ Erro ao instalar servico
        pause
        exit /b 1
    )
    echo ✅ Servico instalado com sucesso!
) else (
    echo.
    echo 📝 Para instalar como servico posteriormente, execute:
    echo    node install-service.js
)

echo.
echo ===========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ===========================================
echo.
echo Para iniciar o servidor:
echo   npm start
echo.
echo Para testar a API:
echo   npm run test-api
echo.
echo Documentacao: http://localhost:3000
echo.
pause
