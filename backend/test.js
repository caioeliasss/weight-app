// simulador.js
require('dotenv').config();
const net = require('net');

const client = new net.Socket();
client.connect(process.env.TCP_PORT, '127.0.0.1', () => {
  console.log('Conectado ao servidor');

  // Exemplo de dado: peso,lote,validade,codigoBarras
  const mensagem = '1.345,LOTE123,2025-12-31,7891234567890\n';
  client.write(mensagem);
  client.end(); // Fecha conexão após enviar
});
