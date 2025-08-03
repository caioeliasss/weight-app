// app.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const registrosRoute = require('./routes/registros');

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware de log para debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api/registros', registrosRoute);

// Rota de teste da API
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Weight App API está funcionando!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    message: 'Weight App API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      registros: '/api/registros',
      stats: '/api/registros/stats/resumo'
    }
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: err.message
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    path: req.originalUrl
  });
});

// Conecta ao MongoDB apenas se não estiver conectado
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log('✅ MongoDB conectado.');
    })
    .catch(err => {
      console.error('❌ Erro ao conectar no MongoDB:', err);
      process.exit(1);
    });
}

const port = process.env.PORT || 3000;

// Só inicia o servidor se não for importado como módulo
if (require.main === module) {
  const server = app.listen(port, async () => {
    console.log(`🚀 API rodando na porta ${port}`);
    console.log(`📋 Documentação: http://localhost:${port}/`);
    console.log(`🏥 Health check: http://localhost:${port}/api/health`);
    
    // Iniciar ngrok APÓS o servidor estar rodando
    if (process.env.NGROK_AUTH_TOKEN) {
      try {
        const ngrok = require('@ngrok/ngrok')
        const url = await ngrok.connect({
          addr: port,
          authtoken: process.env.NGROK_AUTH_TOKEN,
          domain: 'smashing-suddenly-mutt.ngrok-free.app'
        });
        console.log(`🌐 Ngrok disponível em: ${url.url()}`);
      } catch (err) {
        console.error('❌ Erro ao iniciar o Ngrok:', err.message);
      }
    } else {
      console.log('⚠️ NGROK_AUTH_TOKEN não configurado - Ngrok desabilitado');
    }
  });
}

module.exports = app;
