// teste-sistema.js - Testa se o sistema está funcionando
require('dotenv').config({ debug: true });
const net = require('net');
const http = require('http');

class TestadorSistema {
  constructor() {
    this.portaAPI = process.env.PORT || 3000;
    this.portaTCP = process.env.TCP_PORT || 9000;
    this.balancaIP = process.env.BALANCA_IP || 'localhost';
    this.balancaPorta = process.env.BALANCA_PORTA || this.portaTCP;
  }

  async testarPorta(host, porta, tipo = 'TCP') {
    return new Promise((resolve) => {
      console.log(`🔍 Testando ${tipo}: ${host}:${porta}...`);
      
      if (tipo === 'HTTP') {
        const req = http.request({
          hostname: host,
          port: porta,
          path: '/api/health',
          timeout: 5000
        }, (res) => {
          console.log(`✅ ${tipo} ${host}:${porta} - Status: ${res.statusCode}`);
          resolve(true);
        });

        req.on('error', (err) => {
          console.log(`❌ ${tipo} ${host}:${porta} - Erro: ${err.code}`);
          resolve(false);
        });

        req.on('timeout', () => {
          console.log(`❌ ${tipo} ${host}:${porta} - Timeout`);
          resolve(false);
        });

        req.end();
      } else {
        const socket = new net.Socket();
        
        const timeout = setTimeout(() => {
          socket.destroy();
          console.log(`❌ ${tipo} ${host}:${porta} - Timeout`);
          resolve(false);
        }, 5000);

        socket.connect(porta, host, () => {
          clearTimeout(timeout);
          console.log(`✅ ${tipo} ${host}:${porta} - Conectado`);
          socket.destroy();
          resolve(true);
        });

        socket.on('error', (err) => {
          clearTimeout(timeout);
          console.log(`❌ ${tipo} ${host}:${porta} - Erro: ${err.code}`);
          resolve(false);
        });
      }
    });
  }

  async executarTestes() {
    console.log('🔍 TESTE DO SISTEMA WEIGHT-APP');
    console.log('='.repeat(50));
    
    console.log('\n📋 CONFIGURAÇÃO ATUAL:');
    console.log(`Porta API: ${this.portaAPI}`);
    console.log(`Porta TCP: ${this.portaTCP}`);
    console.log(`Balança IP: ${this.balancaIP}`);
    console.log(`Balança Porta: ${this.balancaPorta}`);
    
    console.log('\n🔍 TESTANDO CONEXÕES:');
    console.log('-'.repeat(30));

    // Testar API HTTP
    const apiOk = await this.testarPorta('localhost', this.portaAPI, 'HTTP');
    
    // Testar servidor TCP
    const tcpOk = await this.testarPorta('localhost', this.portaTCP, 'TCP');
    
    // Testar conexão com balança (se não for localhost)
    let balancaOk = true;
    if (this.balancaIP !== 'localhost') {
      balancaOk = await this.testarPorta(this.balancaIP, this.balancaPorta, 'TCP');
    }

    console.log('\n📊 RESUMO DOS TESTES:');
    console.log('-'.repeat(30));
    console.log(`API (${this.portaAPI}): ${apiOk ? '✅ OK' : '❌ FALHA'}`);
    console.log(`TCP Server (${this.portaTCP}): ${tcpOk ? '✅ OK' : '❌ FALHA'}`);
    if (this.balancaIP !== 'localhost') {
      console.log(`Balança (${this.balancaIP}:${this.balancaPorta}): ${balancaOk ? '✅ OK' : '❌ FALHA'}`);
    }

    if (!apiOk || !tcpOk) {
      console.log('\n🚨 PROBLEMAS ENCONTRADOS:');
      if (!apiOk) console.log('• API não está rodando - Execute: npm start');
      if (!tcpOk) console.log('• Servidor TCP não está ativo - Verifique configuração');
      console.log('\n💡 Para simular uma balança, use: node test.js');
    } else {
      console.log('\n✅ Sistema funcionando corretamente!');
      console.log('💡 Para simular uma balança: node test.js');
    }
  }
}

const testador = new TestadorSistema();
testador.executarTestes().catch(console.error);
