// tcp/listener.js
require('dotenv').config();
const net = require('net');
const Registro = require('../models/Registro');

const tcpPort = process.env.TCP_PORT; // Porta que sua balança deve enviar os dados

const server = net.createServer(socket => {
  console.log('Conexão com balança estabelecida.');

  socket.on('data', async data => {
    const msg = data.toString().trim();
    console.log('Dado recebido:', msg);

    // Exemplo de parsing (ajustar com base no manual da Toledo)
    const [peso, lote, validade, codigoBarras] = msg.split(',');

    const novoRegistro = new Registro({
      peso: parseFloat(peso),
      lote,
      validade,
      codigoBarras
    });

    await novoRegistro.save();
    console.log('Registro salvo no MongoDB.');
  });

  socket.on('end', () => {
    console.log('Conexão encerrada com a balança.');
  });
});

server.listen(tcpPort, () => {
  console.log(`Servidor TCP ouvindo na porta ${tcpPort}`);
});
