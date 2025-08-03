// configuracao.js - Sistema de configuração da balança
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const net = require('net');

class ConfiguradorBalanca {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.config = {};
  }

  // Pergunta com validação
  async pergunta(texto, validador = null, valorDefault = null) {
    return new Promise((resolve) => {
      const prompt = valorDefault ? `${texto} (${valorDefault}): ` : `${texto}: `;
      
      this.rl.question(prompt, (resposta) => {
        const valor = resposta.trim() || valorDefault;
        
        if (validador && !validador(valor)) {
          console.log('❌ Valor inválido. Tente novamente.');
          resolve(this.pergunta(texto, validador, valorDefault));
        } else {
          resolve(valor);
        }
      });
    });
  }

  // Validadores
  validarIP(ip) {
    const regexIP = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!regexIP.test(ip)) return false;
    
    const partes = ip.split('.');
    return partes.every(parte => parseInt(parte) >= 0 && parseInt(parte) <= 255);
  }

  validarPorta(porta) {
    const num = parseInt(porta);
    return !isNaN(num) && num >= 1 && num <= 65535;
  }

  // Testar conexão com a balança
  async testarConexao(ip, porta) {
    return new Promise((resolve) => {
      console.log(`🔍 Testando conexão com ${ip}:${porta}...`);
      
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 5000);

      socket.connect(porta, ip, () => {
        clearTimeout(timeout);
        console.log('✅ Conexão estabelecida com sucesso!');
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  // Escanear rede local para encontrar balanças
  async escanearRede() {
    console.log('\n🔍 Escaneando rede local...');
    const dispositivos = [];
    
    // Obter IP local
    const os = require('os');
    const interfaces = os.networkInterfaces();
    let ipLocal = '192.168.1';
    
    for (const interfaceName in interfaces) {
      const interfaceInfo = interfaces[interfaceName];
      for (const info of interfaceInfo) {
        if (info.family === 'IPv4' && !info.internal && info.address.startsWith('192.168')) {
          const partes = info.address.split('.');
          ipLocal = `${partes[0]}.${partes[1]}.${partes[2]}`;
          break;
        }
      }
    }

    const portasComuns = [23, 4001, 4002, 9100, 8080];
    console.log(`📡 Escaneando faixa ${ipLocal}.1-50 nas portas comuns...`);

    for (let i = 1; i <= 50; i++) {
      const ip = `${ipLocal}.${i}`;
      
      for (const porta of portasComuns) {
        try {
          const conectou = await this.testarConexaoRapida(ip, porta);
          if (conectou) {
            dispositivos.push({ ip, porta });
            console.log(`✅ Dispositivo encontrado: ${ip}:${porta}`);
          }
        } catch (error) {
          // Ignorar erros
        }
      }
    }

    return dispositivos;
  }

  // Teste rápido de conexão
  async testarConexaoRapida(ip, porta) {
    return new Promise((resolve) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve(false);
      }, 1000);

      socket.connect(porta, ip, () => {
        clearTimeout(timeout);
        socket.destroy();
        resolve(true);
      });

      socket.on('error', () => {
        clearTimeout(timeout);
        resolve(false);
      });
    });
  }

  // Configuração interativa
  async configurarInterativo() {
    console.log('🔧 CONFIGURAÇÃO DA BALANÇA\n');

    // Escolher método de configuração
    console.log('Como você deseja configurar a balança?');
    console.log('1. Inserir IP e porta manualmente');
    console.log('2. Escanear rede automaticamente');
    console.log('3. Usar configuração padrão (localhost:4001)');

    const opcao = await this.pergunta('Escolha uma opção (1-3)', (v) => ['1', '2', '3'].includes(v), '1');

    switch (opcao) {
      case '1':
        await this.configuracaoManual();
        break;
      case '2':
        await this.configuracaoAutomatica();
        break;
      case '3':
        this.config = {
          ip: 'localhost',
          porta: 4001,
          timeout: 5000,
          reconectar: true
        };
        break;
    }

    // Configurações adicionais
    await this.configurarOpcoes();

    // Testar configuração
    if (this.config.ip !== 'localhost') {
      const testar = await this.pergunta('Deseja testar a conexão agora? (s/n)', (v) => ['s', 'n', 'S', 'N'].includes(v), 's');
      
      if (testar.toLowerCase() === 's') {
        const sucesso = await this.testarConexao(this.config.ip, this.config.porta);
        if (!sucesso) {
          console.log('❌ Não foi possível conectar com a balança.');
          const continuar = await this.pergunta('Deseja continuar mesmo assim? (s/n)', (v) => ['s', 'n', 'S', 'N'].includes(v), 'n');
          if (continuar.toLowerCase() === 'n') {
            return this.configurarInterativo();
          }
        }
      }
    }

    // Salvar configuração
    await this.salvarConfiguracao();
    console.log('\n✅ Configuração concluída com sucesso!');
  }

  // Configuração manual
  async configuracaoManual() {
    console.log('\n📝 CONFIGURAÇÃO MANUAL\n');

    this.config.ip = await this.pergunta(
      'IP da balança', 
      this.validarIP.bind(this), 
      '192.168.1.100'
    );

    this.config.porta = parseInt(await this.pergunta(
      'Porta da balança', 
      this.validarPorta.bind(this), 
      '4001'
    ));
  }

  // Configuração automática
  async configuracaoAutomatica() {
    console.log('\n🤖 CONFIGURAÇÃO AUTOMÁTICA\n');

    const dispositivos = await this.escanearRede();

    if (dispositivos.length === 0) {
      console.log('❌ Nenhum dispositivo encontrado. Usando configuração manual...');
      return this.configuracaoManual();
    }

    console.log('\n📋 Dispositivos encontrados:');
    dispositivos.forEach((d, i) => {
      console.log(`${i + 1}. ${d.ip}:${d.porta}`);
    });

    const escolha = await this.pergunta(
      `Escolha um dispositivo (1-${dispositivos.length})`,
      (v) => {
        const num = parseInt(v);
        return !isNaN(num) && num >= 1 && num <= dispositivos.length;
      },
      '1'
    );

    const dispositivo = dispositivos[parseInt(escolha) - 1];
    this.config.ip = dispositivo.ip;
    this.config.porta = dispositivo.porta;
  }

  // Configurar opções avançadas
  async configurarOpcoes() {
    console.log('\n⚙️ OPÇÕES AVANÇADAS\n');

    this.config.timeout = parseInt(await this.pergunta(
      'Timeout de conexão (ms)',
      (v) => !isNaN(parseInt(v)) && parseInt(v) > 0,
      '5000'
    ));

    const reconectar = await this.pergunta(
      'Reconectar automaticamente? (s/n)',
      (v) => ['s', 'n', 'S', 'N'].includes(v),
      's'
    );
    this.config.reconectar = reconectar.toLowerCase() === 's';

    this.config.formatoDados = await this.pergunta(
      'Formato dos dados da balança (csv/json/raw)',
      (v) => ['csv', 'json', 'raw'].includes(v),
      'csv'
    );
  }

  // Salvar configuração no .env
  async salvarConfiguracao() {
    const envPath = path.join(__dirname, '.env');
    let envContent = '';

    // Ler .env existente
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
    }

    // Atualizar variáveis
    const novasVariaveis = {
      'BALANCA_IP': this.config.ip,
      'BALANCA_PORTA': this.config.porta.toString(),
      'BALANCA_TIMEOUT': this.config.timeout.toString(),
      'BALANCA_RECONECTAR': this.config.reconectar.toString(),
      'BALANCA_FORMATO': this.config.formatoDados
    };

    // Atualizar ou adicionar variáveis
    for (const [chave, valor] of Object.entries(novasVariaveis)) {
      const regex = new RegExp(`^${chave}=.*$`, 'm');
      const linha = `${chave}=${valor}`;
      
      if (envContent.match(regex)) {
        envContent = envContent.replace(regex, linha);
      } else {
        envContent += `\n${linha}`;
      }
    }

    fs.writeFileSync(envPath, envContent.trim());

    // Criar arquivo de configuração JSON também
    const configJson = {
      balanca: this.config,
      configuradoEm: new Date().toISOString()
    };

    fs.writeFileSync(
      path.join(__dirname, 'config.json'),
      JSON.stringify(configJson, null, 2)
    );

    console.log('\n📄 Configuração salva em:');
    console.log(`  - .env`);
    console.log(`  - config.json`);
  }

  // Fechar readline
  fechar() {
    this.rl.close();
  }
}

// Executar configuração se chamado diretamente
if (require.main === module) {
  const configurador = new ConfiguradorBalanca();
  
  configurador.configurarInterativo()
    .then(() => {
      configurador.fechar();
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro na configuração:', error);
      configurador.fechar();
      process.exit(1);
    });
}

module.exports = ConfiguradorBalanca;
