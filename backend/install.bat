@echo off
REM install.bat - Script de instalação completa
echo ====================================================
echo    WEIGHT APP SERVER - INSTALACAO AUTOMATICA
echo ====================================================
echo.

REM Ir para o diretório do script
cd /d "%~dp0"
echo 📁 Diretorio: %CD%
echo.

REM Verificar se está executando como administrador
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como Administrador
) else (
    echo ❌ ERRO: Execute como Administrador!
    echo.
    echo Clique com botao direito em install.bat e selecione:
    echo "Executar como administrador"
    echo.
    pause
    exit /b 1
)

REM Verificar se Node.js está instalado
echo 🔍 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js nao encontrado!
    echo.
    echo Baixe e instale Node.js em: https://nodejs.org
    echo Versao recomendada: LTS
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js encontrado
)

REM Instalar dependências
echo.
echo 📦 Instalando dependencias...
echo Diretorio atual: %CD%
echo.

REM Verificar se package.json existe
if not exist "package.json" (
    echo ❌ Arquivo package.json nao encontrado!
    echo Verifique se voce esta no diretorio correto
    pause
    exit /b 1
)

call npm install --verbose
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar dependencias
    echo.
    echo Tentando limpar cache e reinstalar...
    call npm cache clean --force
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ Falha na instalacao apos limpeza do cache
        pause
        exit /b 1
    )
)

REM Criar arquivo .env se não existir
if not exist ".env" (
    echo.
    echo ⚙️ Criando arquivo de configuracao...
    copy ".env.example" ".env" >nul 2>&1
    echo ✅ Arquivo .env criado
    echo.
    echo ⚠️ IMPORTANTE: Configure o arquivo .env com suas credenciais do MongoDB
    echo.
)

REM Configurar firewall
echo 🔥 Configurando Firewall...
netsh advfirewall firewall delete rule name="Weight App TCP" >nul 2>&1
netsh advfirewall firewall add rule name="Weight App TCP" dir=in action=allow protocol=TCP localport=4000
if %errorlevel% neq 0 (
    echo ⚠️ Aviso: Nao foi possivel configurar o firewall automaticamente
) else (
    echo ✅ Firewall configurado (porta 4000)
)

REM Instalar como serviço
echo.
echo 🔧 Instalando como servico do Windows...
node install-service.js
if %errorlevel% neq 0 (
    echo ❌ Erro ao instalar servico
    echo.
    echo Tente executar manualmente:
    echo npm run install-service
    pause
    exit /b 1
)

echo.
echo ========================================
echo           INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo ✅ Weight App Server instalado como servico
echo 🚀 O servico iniciara automaticamente com o Windows
echo 🌐 Porta TCP: 4000
echo.
echo Para gerenciar o servico:
echo - Ver status: services.msc (procurar "Weight App Server")
echo - Desinstalar: npm run uninstall-service
echo.
echo ⚠️ Nao esqueça de configurar o arquivo .env!
echo.
pause
