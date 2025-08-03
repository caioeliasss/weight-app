@echo off
REM install-pm2-production.bat - Instalação PM2 para produção
echo ====================================================
echo    WEIGHT APP SERVER - INSTALACAO PM2 PRODUCAO
echo ====================================================
echo.

REM Verificar se está executando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como Administrador
) else (
    echo ❌ ERRO: Execute como Administrador!
    echo.
    echo Clique com botao direito e selecione:
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

REM Ir para o diretório do script
cd /d "%~dp0"

echo 📁 Diretorio: %CD%
echo.

REM Verificar Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    pause
    exit /b 1
)
echo ✅ Node.js OK

REM Instalar dependências se necessário
if not exist "node_modules" (
    echo 📦 Instalando dependencias...
    call npm install
)

REM Verificar se PM2 está instalado
pm2 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 📦 Instalando PM2...
    call npm install -g pm2
    call npm install -g pm2-windows-startup
)
echo ✅ PM2 OK

REM Parar aplicação se estiver rodando
echo 🛑 Parando aplicacao se estiver rodando...
pm2 stop weight-app-server >nul 2>&1
pm2 delete weight-app-server >nul 2>&1

REM Iniciar com PM2
echo 🚀 Iniciando com PM2...
pm2 start ecosystem.config.js

REM Configurar startup
echo ⚙️ Configurando startup automatico...
pm2-startup install >nul 2>&1

REM Salvar configuração
echo 💾 Salvando configuracao...
pm2 save

echo.
echo ========================================
echo      INSTALACAO PM2 CONCLUIDA!
echo ========================================
echo.
echo ✅ Weight App Server rodando com PM2
echo 🔄 Iniciara automaticamente com o Windows
echo.
echo Comandos uteis:
echo - Ver status: pm2 list
echo - Ver logs: pm2 logs weight-app-server
echo - Reiniciar: pm2 restart weight-app-server
echo - Parar: pm2 stop weight-app-server
echo - Monitor: pm2 monit
echo.
pause
