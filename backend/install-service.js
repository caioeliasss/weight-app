// install-service.js
const Service = require('node-windows').Service;
const path = require('path');

// Criar objeto do serviço
const svc = new Service({
  name: 'Weight App Server',
  description: 'Servidor para captura de dados de impressoras Toledo',
  script: path.join(__dirname, 'server.js'),
  nodeOptions: [
    '--harmony',
    '--max_old_space_size=4096'
  ],
  env: {
    name: "NODE_ENV",
    value: "production"
  }
});

// Listeners para eventos do serviço
svc.on('install', () => {
  console.log('✅ Serviço instalado com sucesso!');
  console.log('🚀 Iniciando serviço...');
  svc.start();
});

svc.on('start', () => {
  console.log('✅ Serviço iniciado com sucesso!');
  console.log(`📋 Nome: ${svc.name}`);
  console.log(`📝 Descrição: ${svc.description}`);
  console.log('🔧 O serviço agora iniciará automaticamente com o Windows');
});

svc.on('alreadyinstalled', () => {
  console.log('⚠️ Serviço já está instalado');
  console.log('Para reinstalar, execute: npm run uninstall-service');
});

svc.on('error', (err) => {
  console.error('❌ Erro ao instalar serviço:', err);
});

console.log('📦 Instalando Weight App Server como serviço do Windows...');
console.log('⚠️ Execute como Administrador para instalar o serviço');

// Instalar o serviço
svc.install();
