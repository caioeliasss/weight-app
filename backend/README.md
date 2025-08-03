# Weight App Server - Instalação

Servidor para captura de dados de impressoras Toledo via TCP.

## 📋 Pré-requisitos

- Windows 10/11
- Node.js 18+ (https://nodejs.org)
- Conta MongoDB Atlas ou servidor MongoDB local

## 🚀 Instalação Automática

1. **Baixe todos os arquivos** para uma pasta no computador
2. **Clique com botão direito** em `install.bat`
3. **Selecione "Executar como administrador"**
4. **Configure o arquivo `.env`** com suas credenciais do MongoDB

## ⚙️ Configuração Manual

Se a instalação automática falhar:

```bash
# 1. Instalar dependências
npm install

# 2. Configurar arquivo .env
copy .env.example .env
# Edite o .env com suas configurações

# 3. Instalar como serviço (como admin)
npm run install-service
```

## 🔧 Comandos Úteis

```bash
# Iniciar servidor manualmente (desenvolvimento)
npm start

# Instalar como serviço do Windows
npm run install-service

# Desinstalar serviço
npm run uninstall-service

# Testar conexão TCP
npm test
```

## 🌐 Configuração da Impressora Toledo

Configure sua impressora para enviar dados TCP para:
- **IP**: IP da máquina onde o servidor está instalado
- **Porta**: 4000
- **Formato**: peso,lote,validade,codigoBarras

Exemplo: `2.345,LOTE123,2025-12-31,7891234567890`

## 📊 Verificação do Serviço

1. Pressione `Win + R`, digite `services.msc`
2. Procure por "Weight App Server"
3. Status deve estar "Em execução"
4. Tipo de inicialização: "Automático"

## 🔍 Logs do Serviço

Os logs ficam em:
`C:\Users\{usuario}\AppData\Local\Programs\WeightAppServer\daemon\`

## ❌ Resolução de Problemas

### Serviço não inicia
- Verifique se o MongoDB está acessível
- Confira as configurações no arquivo `.env`
- Veja os logs do serviço

### Impressora não conecta
- Verifique se a porta 4000 está aberta no firewall
- Confirme o IP da máquina: `ipconfig`
- Teste conectividade: `telnet IP_MAQUINA 4000`

### Erro de permissão
- Execute o prompt como administrador
- Verifique se o usuário tem permissões de serviço

## 📞 Suporte

Para problemas, verifique:
1. Arquivo `.env` configurado corretamente
2. MongoDB acessível
3. Firewall liberado para porta 4000
4. Serviço executando em services.msc
