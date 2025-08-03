@echo off
REM install-simple.bat - Instalação simplificada
title Weight App Server - Instalacao

REM Ir para o diretório do script
cd /d "%~dp0"

echo ====================================================
echo    WEIGHT APP SERVER - INSTALACAO SIMPLIFICADA
echo ====================================================
echo.
echo Diretorio: %CD%
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo Baixe em: https://nodejs.org
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM Verificar package.json
if not exist "package.json" (
    echo ❌ package.json nao encontrado!
    echo Verifique se esta no diretorio correto
    pause
    exit /b 1
)
echo ✅ package.json encontrado

REM Instalar dependências
echo.
echo 📦 Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ❌ Erro na instalacao
    pause
    exit /b 1
)
echo ✅ Dependencias instaladas

REM Criar .env
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env"
        echo ✅ Arquivo .env criado
    ) else (
        echo MONGO_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/weight-app > .env
        echo PORT=3000 >> .env
        echo TCP_PORT=4000 >> .env
        echo ✅ Arquivo .env criado com valores padrão
    )
    echo.
    echo ⚠️ CONFIGURE O ARQUIVO .env COM SUAS CREDENCIAIS!
)

echo.
echo ========================================
echo      INSTALACAO BASICA CONCLUIDA!
echo ========================================
echo.
echo Para testar: npm start
echo Para instalar como servico: npm run install-service (como admin)
echo.
pause
