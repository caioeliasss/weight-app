// simulador-balanca.js - Simula uma balança enviando dados
require('dotenv').config({ debug: true });
const net = require('net');
const http = require('http');

class SimuladorBalanca {
  constructor() {
    // Configuração do servidor (onde enviar os dados)
    this.servidorIP = 'localhost'; // IP do seu servidor
    this.servidorPorta = process.env.TCP_PORT || 9000; // Porta onde o servidor escuta
    
    // Configuração da balança simulada
    this.balancaIP = process.env.BALANCA_IP || '192.168.15.1';
    this.balancaPorta = process.env.BALANCA_PORTA || 9000;
    
    this.conectado = false;
    this.socket = null;
    this.intervaloPeso = null;
  }

  // Gerar dados simulados da balança
  gerarDadosBalanca() {
    const formato = process.env.BALANCA_FORMATO || 'csv';
    const peso = (Math.random() * 100 + 1).toFixed(2); // Peso entre 1-100kg
    const lote = `LOTE${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    const validade = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]; // 30 dias
    const codigoBarras = `789${String(Math.floor(Math.random() * 1000000000)).padStart(9, '0')}`;
    
    switch (formato) {
      case 'csv':
        return `${peso},${lote},${validade},${codigoBarras}`;
      case 'json':
        return JSON.stringify({
          peso: parseFloat(peso),
          lote,
          validade,
          codigoBarras
        });
      case 'raw':
        return `PESO: ${peso}kg LOTE: ${lote}`;
      default:
        return `${peso},${lote},${validade},${codigoBarras}`;
    }
  }

  // Conectar ao servidor como se fosse uma balança
  async conectarComoBalanca() {
    return new Promise((resolve) => {
      console.log(`� Conectando como balança ao servidor ${this.servidorIP}:${this.servidorPorta}...`);
      
      this.socket = new net.Socket();
      
      // Configurar origem da conexão (simular IP da balança)
      this.socket.connect(this.servidorPorta, this.servidorIP, () => {
        console.log(`✅ Balança conectada! Simulando IP: ${this.balancaIP}`);
        this.conectado = true;
        resolve(true);
      });

      this.socket.on('error', (err) => {
        console.log(`❌ Erro ao conectar: ${err.message}`);
        console.log(`💡 Verifique se o servidor está rodando em ${this.servidorIP}:${this.servidorPorta}`);
        this.conectado = false;
        resolve(false);
      });

      this.socket.on('data', (data) => {
        console.log(`📨 Resposta do servidor: ${data.toString().trim()}`);
      });

      this.socket.on('close', () => {
        console.log('🔌 Conexão fechada pelo servidor');
        this.conectado = false;
        if (this.intervaloPeso) {
          clearInterval(this.intervaloPeso);
        }
      });
    });
  }

  // Enviar dados da balança periodicamente
  iniciarEnvioDados(intervaloMs = 5000) {
    if (!this.conectado) {
      console.log('❌ Não conectado ao servidor');
      return;
    }

    console.log(`🎯 Iniciando envio de dados a cada ${intervaloMs/1000}s...`);
    console.log('💡 Pressione Ctrl+C para parar\n');

    let contador = 1;
    
    this.intervaloPeso = setInterval(() => {
      if (this.conectado && this.socket) {
        const dados = this.gerarDadosBalanca();
        console.log(`📊 Enviando dado #${contador}: ${dados}`);
        
        this.socket.write(dados + '\r\n');
        contador++;
      } else {
        console.log('❌ Conexão perdida, parando envio...');
        clearInterval(this.intervaloPeso);
      }
    }, intervaloMs);
  }

  // Testar se servidor está rodando
  async testarServidor() {
    return new Promise((resolve) => {
      console.log(`🔍 Testando servidor em ${this.servidorIP}:${this.servidorPorta}...`);
      
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        console.log(`❌ Servidor não está rodando em ${this.servidorIP}:${this.servidorPorta}`);
        resolve(false);
      }, 3000);

      socket.connect(this.servidorPorta, this.servidorIP, () => {
        clearTimeout(timeout);
        console.log(`✅ Servidor está rodando!`);
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  // Testar API também
  async testarAPI() {
    const portaAPI = process.env.PORT || 3000;
    return new Promise((resolve) => {
      console.log(`🔍 Testando API em localhost:${portaAPI}...`);
      
      const req = http.request({
        hostname: 'localhost',
        port: portaAPI,
        path: '/api/health',
        timeout: 3000
      }, (res) => {
        console.log(`✅ API funcionando - Status: ${res.statusCode}`);
        resolve(true);
      });

      req.on('error', (err) => {
        console.log(`❌ API não está rodando: ${err.code}`);
        resolve(false);
      });

      req.on('timeout', () => {
        console.log(`❌ API timeout`);
        resolve(false);
      });

      req.end();
    });
  }

  async executarSimulacao() {
    console.log('🏭 SIMULADOR DE BALANÇA WEIGHT-APP');
    console.log('='.repeat(50));
    
    console.log('\n📋 CONFIGURAÇÃO DA SIMULAÇÃO:');
    console.log(`Servidor destino: ${this.servidorIP}:${this.servidorPorta}`);
    console.log(`Balança simulada: ${this.balancaIP}:${this.balancaPorta}`);
    console.log(`Formato de dados: ${process.env.BALANCA_FORMATO || 'csv'}`);
    
    console.log('\n🔍 VERIFICANDO SISTEMA:');
    console.log('-'.repeat(30));

    // 1. Testar se API está rodando
    const apiOk = await this.testarAPI();
    
    // 2. Testar se servidor TCP está rodando
    const servidorOk = await this.testarServidor();
    
    if (!servidorOk) {
      console.log('\n❌ ERRO: Servidor não está rodando!');
      console.log('💡 Execute primeiro: npm start');
      console.log('💡 Ou verifique se o serviço está ativo em services.msc');
      return;
    }

    console.log('\n🎯 INICIANDO SIMULAÇÃO DA BALANÇA:');
    console.log('-'.repeat(40));

    // 3. Conectar como balança
    const conectou = await this.conectarComoBalanca();
    
    if (conectou) {
      // 4. Iniciar envio de dados
      this.iniciarEnvioDados(3000); // A cada 3 segundos
      
      // 5. Instruções para o usuário
      console.log('\n📊 BALANÇA SIMULADA ATIVA!');
      console.log('┌─────────────────────────────────────┐');
      console.log('│ A balança está enviando dados...    │');
      console.log('│                                     │');
      console.log('│ Para verificar:                     │');
      console.log(`│ • API: http://localhost:${process.env.PORT || 3000}/api/registros  │`);
      console.log(`│ • Conexões: /api/balanca/conexoes   │`);
      console.log('│                                     │');
      console.log('│ Pressione Ctrl+C para parar        │');
      console.log('└─────────────────────────────────────┘');
    } else {
      console.log('\n❌ Falha ao conectar como balança');
    }
  }

  // Cleanup ao sair
  fechar() {
    if (this.intervaloPeso) {
      clearInterval(this.intervaloPeso);
    }
    if (this.socket && this.conectado) {
      this.socket.end();
    }
  }
}

// Capturar Ctrl+C para fechar graciosamente
process.on('SIGINT', () => {
  console.log('\n\n🛑 Parando simulação da balança...');
  if (simulador) {
    simulador.fechar();
  }
  console.log('✅ Simulação encerrada');
  process.exit(0);
});

const simulador = new SimuladorBalanca();
simulador.executarSimulacao().catch(console.error);
