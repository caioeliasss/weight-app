// tcp/listener.js
require('dotenv').config();
const net = require('net');
const Registro = require('../models/Registro');

// Configuração da balança
const balancaIP = process.env.BALANCA_IP || 'localhost';
const balancaPorta = process.env.BALANCA_PORTA || process.env.TCP_PORT || 4001;
const balancaTimeout = parseInt(process.env.BALANCA_TIMEOUT) || 5000;
const balancaReconectar = process.env.BALANCA_RECONECTAR === 'true';

// Armazenar conexões ativas
const conexoesAtivas = new Map();

const server = net.createServer(socket => {
  const clienteId = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`📡 Nova conexão de balança: ${clienteId}`);
  
  // Adicionar à lista de conexões
  conexoesAtivas.set(clienteId, {
    socket,
    conectadoEm: new Date(),
    ultimoDado: null,
    totalRegistros: 0
  });

  socket.on('data', async data => {
    const msg = data.toString().trim();
    console.log(`📊 Dado recebido de ${clienteId}:`, msg);

    try {
      // Atualizar informações da conexão
      const conexaoInfo = conexoesAtivas.get(clienteId);
      conexaoInfo.ultimoDado = new Date();

      // Parsear dados baseado no formato configurado
      const registro = parserarDadosBalanca(msg, clienteId);
      
      if (registro) {
        await registro.save();
        conexaoInfo.totalRegistros++;
        console.log(`✅ Registro #${conexaoInfo.totalRegistros} salvo de ${clienteId}`);
        
        // Responder à balança se necessário
        socket.write('OK\r\n');
      } else {
        console.log(`⚠️ Dados não reconhecidos de ${clienteId}: ${msg}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar dados de ${clienteId}:`, error.message);
    }
  });

  socket.on('end', () => {
    console.log(`🔌 Conexão encerrada: ${clienteId}`);
    conexoesAtivas.delete(clienteId);
  });

  socket.on('error', (err) => {
    console.error(`❌ Erro na conexão ${clienteId}:`, err.message);
    conexoesAtivas.delete(clienteId);
  });

  socket.on('timeout', () => {
    console.log(`⏰ Timeout na conexão ${clienteId}`);
    socket.destroy();
    conexoesAtivas.delete(clienteId);
  });

  // Configurar timeout
  socket.setTimeout(balancaTimeout);
});

// Função para parsear diferentes formatos de dados
function parserarDadosBalanca(msg, origem) {
  try {
    const formato = process.env.BALANCA_FORMATO || 'csv';
    
    switch (formato) {
      case 'csv':
        return parserarCSV(msg, origem);
      case 'json':
        return parserarJSON(msg, origem);
      case 'raw':
        return parserarRaw(msg, origem);
      default:
        return parserarCSV(msg, origem);
    }
  } catch (error) {
    console.error('Erro no parser:', error);
    return null;
  }
}

// Parser para formato CSV (peso,lote,validade,codigoBarras)
function parserarCSV(msg, origem) {
  if (msg.includes(',')) {
    const partes = msg.split(',');
    const [peso, lote, validade, codigoBarras] = partes;
    
    return new Registro({
      peso: parseFloat(peso) || 0,
      lote: lote || '',
      validade: validade || '',
      codigoBarras: codigoBarras || '',
      origem,
      dadosOriginais: msg
    });
  }
  
  // Apenas peso
  const pesoMatch = msg.match(/(\d+\.?\d*)/);
  if (pesoMatch) {
    return new Registro({
      peso: parseFloat(pesoMatch[1]),
      origem,
      dadosOriginais: msg
    });
  }
  
  return null;
}

// Parser para formato JSON
function parserarJSON(msg, origem) {
  try {
    const dados = JSON.parse(msg);
    return new Registro({
      peso: parseFloat(dados.peso) || 0,
      lote: dados.lote || '',
      validade: dados.validade || '',
      codigoBarras: dados.codigoBarras || '',
      origem,
      dadosOriginais: msg
    });
  } catch (error) {
    return null;
  }
}

// Parser para formato RAW (salva como recebido)
function parserarRaw(msg, origem) {
  const pesoMatch = msg.match(/(\d+\.?\d*)/);
  const peso = pesoMatch ? parseFloat(pesoMatch[1]) : 0;
  
  return new Registro({
    peso,
    origem,
    dadosOriginais: msg,
    observacoes: 'Dados salvos em formato RAW'
  });
}

// Inicializar servidor TCP na porta configurada
const tcpPort = parseInt(balancaPorta);

server.listen(tcpPort, '0.0.0.0', () => {
  console.log(`🌐 Servidor TCP ouvindo na porta ${tcpPort}`);
  console.log(`📡 Balança configurada: ${balancaIP}:${balancaPorta}`);
  console.log(`⏰ Timeout: ${balancaTimeout}ms`);
  console.log(`🔄 Reconexão automática: ${balancaReconectar ? 'Habilitada' : 'Desabilitada'}`);
});

// Status das conexões a cada 30 segundos
setInterval(() => {
  if (conexoesAtivas.size > 0) {
    console.log(`📊 Conexões ativas: ${conexoesAtivas.size}`);
    conexoesAtivas.forEach((info, id) => {
      const tempoConectado = Math.floor((Date.now() - info.conectadoEm) / 1000);
      const ultimoDado = info.ultimoDado ? 
        Math.floor((Date.now() - info.ultimoDado) / 1000) + 's atrás' : 
        'Nenhum';
      console.log(`  - ${id} (conectado há ${tempoConectado}s, último dado: ${ultimoDado})`);
    });
  }
}, 30000);

module.exports = { server, conexoesAtivas };
