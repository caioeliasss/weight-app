# 🚀 GUIA DE INSTALAÇÃO - WEIGHT APP

## ⚠️ **PROBLEMA COMUM - DIRETÓRIO ERRADO**

Se você viu este erro:
```
npm error path C:\Windows\system32\package.json
Error: Cannot find module 'C:\Windows\system32\configuracao.js'
```

**SOLUÇÃO:** Execute o instalador da pasta correta!

## 📁 **COMO INSTALAR CORRETAMENTE:**

### **1. Navegue para a pasta backend:**
```bash
cd C:\weight-app-main\backend
```

### **2. Valide a instalação (opcional):**
```bash
validar-instalacao.bat
```

### **3. Execute a instalação:**
```bash
install-configurado.bat
```

## 🎯 **OPÇÕES DE INSTALAÇÃO:**

### **🔧 Instalação Completa (Recomendada):**
```bash
install-configurado.bat
```
- ✅ Instala dependências
- ✅ Configura balança automaticamente
- ✅ Instala como serviço (opcional)

### **⚡ Instalação Simples:**
```bash
install-simple.bat
```
- ✅ Instalação básica (localhost:4001)
- ❌ Não configura balança WiFi

### **🔧 Configurar Depois:**
```bash
install.bat
npm run configurar
```

## 🛠️ **SE DEU ERRO:**

### **1. Verificar pré-requisitos:**
```bash
validar-instalacao.bat
```

### **2. Instalar Node.js se necessário:**
- Download: https://nodejs.org
- Versão recomendada: LTS

### **3. Verificar se está na pasta certa:**
```bash
dir
```
Deve mostrar: `package.json`, `server.js`, `app.js`

### **4. Limpar e reinstalar:**
```bash
rmdir /s node_modules
npm install
npm run configurar
```

## 📋 **APÓS A INSTALAÇÃO:**

### **Iniciar o servidor:**
```bash
npm start
```

### **Simular uma balança:**
```bash
npm run simular-balanca
```

### **Testar o sistema:**
```bash
npm run teste-sistema
```

### **Verificar registros:**
- 🌐 API: http://localhost:3000/api/registros
- 🔗 Conexões: http://localhost:3000/api/balanca/conexoes

## 🆘 **COMANDOS ÚTEIS:**

```bash
# Reconfigurar balança
npm run configurar

# Ver status do sistema
npm run teste-sistema

# Simular dados da balança
npm run simular-balanca

# Verificar conexões ativas
curl http://localhost:3000/api/balanca/conexoes

# Ver registros salvos
curl http://localhost:3000/api/registros
```

## 🔧 **ESTRUTURA CORRETA:**

Sua pasta deve ter:
```
backend/
├── package.json          ✅
├── server.js             ✅
├── app.js                ✅
├── configuracao.js       ✅
├── install-configurado.bat ✅
├── validar-instalacao.bat ✅
├── node_modules/         ✅ (após npm install)
├── .env                  ✅ (após configuração)
└── ...outros arquivos
```

## 📞 **SUPORTE:**

Se ainda tiver problemas:
1. Execute: `validar-instalacao.bat`
2. Verifique se está na pasta `backend`
3. Confirme que o Node.js está instalado
4. Execute passo a passo os comandos acima
