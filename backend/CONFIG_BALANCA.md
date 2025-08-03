# 🔧 CONFIGURAÇÃO DE IP E PORTA DA BALANÇA

## Instalação Automática com Configuração

Use o instalador que configura tudo automaticamente:

```bash
install-configurado.bat
```

## Configuração Manual

### 1. **Configurar via comando:**

```bash
npm run configurar
```

### 2. **Opções de configuração:**

#### **Opção 1: Manual**
- Insira o IP e porta da balança manualmente
- Exemplo: `192.168.1.100:4001`

#### **Opção 2: Automática**
- O sistema escaneia a rede local
- Mostra dispositivos encontrados
- Você escolhe qual é a balança

#### **Opção 3: Padrão**
- Usa `localhost:4001`
- Para testes locais

### 3. **Variáveis no .env:**

```bash
# IP da balança
BALANCA_IP=192.168.1.100

# Porta da balança
BALANCA_PORTA=4001

# Timeout de conexão (ms)
BALANCA_TIMEOUT=5000

# Reconectar automaticamente
BALANCA_RECONECTAR=true

# Formato dos dados (csv/json/raw)
BALANCA_FORMATO=csv
```

## Comandos Úteis

### **Ver conexões ativas:**
```bash
GET http://localhost:3000/api/balanca/conexoes
```

### **Ver configuração atual:**
```bash
GET http://localhost:3000/api/balanca/config
```

### **Reconfigurar:**
```bash
npm run configurar
```

## Formatos de Dados Suportados

### **CSV (padrão):**
```
12.5,LOTE001,2024-12-31,7891234567890
```

### **JSON:**
```json
{
  "peso": 12.5,
  "lote": "LOTE001",
  "validade": "2024-12-31",
  "codigoBarras": "7891234567890"
}
```

### **RAW:**
Qualquer formato - será salvo como recebido.

## Detecção Automática de Rede

O configurador pode escanear automaticamente sua rede local procurando por dispositivos que respondem nas portas comuns de balanças:

- **Porta 23** (Telnet)
- **Porta 4001** (Toledo)
- **Porta 4002** (Toledo alternativa)
- **Porta 9100** (Raw printing)
- **Porta 8080** (HTTP alternativa)

## Solução de Problemas

### **Balança não conecta:**
1. Verifique se o IP e porta estão corretos
2. Teste a conexão: `npm run configurar`
3. Verifique se o firewall não está bloqueando

### **Dados não são recebidos:**
1. Verifique o formato dos dados no log
2. Ajuste `BALANCA_FORMATO` se necessário
3. Verifique se a balança está enviando para o IP correto

### **Múltiplas balanças:**
O sistema suporta múltiplas conexões simultâneas. Cada balança aparecerá como uma conexão separada em `/api/balanca/conexoes`.
