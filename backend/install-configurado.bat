@echo off
echo ===========================================
echo    INSTALADOR WEIGHT APP - CONFIGURACAO
echo ===========================================
echo.

:: Ir para o diretório do script
cd /d "%~dp0"
echo 📁 Diretorio atual: %CD%
echo.

:: Verificar se estamos no diretório correto
if not exist "package.json" (
    echo ❌ Arquivo package.json nao encontrado!
    echo Certifique-se de estar executando na pasta backend
    pause
    exit /b 1
)

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
if not exist "configuracao.js" (
    echo ❌ Arquivo configuracao.js nao encontrado!
    echo Certifique-se de que todos os arquivos estao presentes
    pause
    exit /b 1
)

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
echo 📋 COMANDOS UTEIS:
echo   npm start              - Iniciar servidor
echo   npm run simular-balanca - Simular uma balanca
echo   npm run teste-sistema   - Testar o sistema
echo   npm run configurar      - Reconfigurar balanca
echo.
echo 🌐 LINKS:
echo   API: http://localhost:3000
echo   Registros: http://localhost:3000/api/registros
echo   Conexoes: http://localhost:3000/api/balanca/conexoes
echo.
echo 💡 PROXIMO PASSO:
echo   1. Execute: npm start
echo   2. Em outro terminal: npm run simular-balanca
echo.
pause
