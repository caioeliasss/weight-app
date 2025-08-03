// server.js - Arquivo principal do servidor
require('dotenv').config();
const mongoose = require('mongoose');

// Configurar conexão com MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Conectado ao MongoDB');
    
    // Iniciar servidor TCP após conectar ao banco
    require('./tcp/listeners');
    
    // Iniciar servidor HTTP/API
    const app = require('./app');
    const port = process.env.PORT || 3000;
    
    app.listen(port, () => {
      console.log(`🚀 API HTTP rodando na porta ${port}`);
      console.log(`📋 Documentação: http://localhost:${port}/`);
      console.log(`🏥 Health check: http://localhost:${port}/api/health`);
    });
    
  })
  .catch(err => {
    console.error('❌ Erro ao conectar ao MongoDB:', err);
    process.exit(1);
  });

// Tratamento de erros não capturados
process.on('uncaughtException', (error) => {
  console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Promise rejeitada não tratada:', reason);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Encerrando servidor...');
  await mongoose.connection.close();
  process.exit(0);
});

console.log('🚀 Weight App Server iniciado');
