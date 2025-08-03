// uninstall-service.js
const Service = require('node-windows').Service;
const path = require('path');

// Criar objeto do serviço
const svc = new Service({
  name: 'Weight App Server',
  description: 'Servidor para captura de dados de impressoras Toledo',
  script: path.join(__dirname, 'server.js')
});

// Listeners para eventos do serviço
svc.on('uninstall', () => {
  console.log('✅ Serviço desinstalado com sucesso!');
});

svc.on('stop', () => {
  console.log('⏹️ Serviço parado');
});

svc.on('error', (err) => {
  console.error('❌ Erro ao desinstalar serviço:', err);
});

console.log('🗑️ Desinstalando Weight App Server...');
console.log('⚠️ Execute como Administrador para desinstalar o serviço');

// Desinstalar o serviço
svc.uninstall();
