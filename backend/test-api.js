// test-api.js - Teste da API REST
require('dotenv').config();
const axios = require('axios');

const BASE_URL = `http://localhost:${process.env.PORT || 3000}/api`;

async function testarAPI() {
  console.log('🧪 Testando Weight App API...\n');

  try {
    // 1. Testar health check
    console.log('1. 🏥 Testando health check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health:', health.data.message);

    // 2. Criar um registro de teste
    console.log('\n2. 📝 Criando registro de teste...');
    const novoRegistro = {
      peso: 2.5,
      lote: 'TESTE001',
      validade: '2025-12-31',
      codigoBarras: '1234567890123',
      caixa: 'CX001',
      status: 'ativo'
    };

    const registroCriado = await axios.post(`${BASE_URL}/registros`, novoRegistro);
    console.log('✅ Registro criado:', registroCriado.data.data._id);
    const registroId = registroCriado.data.data._id;

    // 3. Listar registros
    console.log('\n3. 📋 Listando registros...');
    const lista = await axios.get(`${BASE_URL}/registros?limit=5`);
    console.log(`✅ Encontrados ${lista.data.data.length} registros`);
    console.log(`📊 Total: ${lista.data.pagination.total}`);

    // 4. Buscar registro específico
    console.log('\n4. 🔍 Buscando registro específico...');
    const registro = await axios.get(`${BASE_URL}/registros/${registroId}`);
    console.log('✅ Registro encontrado:', registro.data.data.lote);

    // 5. Atualizar registro
    console.log('\n5. ✏️ Atualizando registro...');
    const registroAtualizado = await axios.put(`${BASE_URL}/registros/${registroId}`, {
      peso: 3.0,
      status: 'processado'
    });
    console.log('✅ Registro atualizado:', registroAtualizado.data.data.peso);

    // 6. Buscar estatísticas
    console.log('\n6. 📊 Buscando estatísticas...');
    const stats = await axios.get(`${BASE_URL}/registros/stats/resumo`);
    console.log('✅ Estatísticas:');
    console.log(`   Total de registros: ${stats.data.data.totalRegistros}`);
    console.log(`   Registros hoje: ${stats.data.data.registrosHoje}`);
    console.log(`   Peso total hoje: ${stats.data.data.pesoTotalHoje}`);

    // 7. Deletar registro de teste
    console.log('\n7. 🗑️ Deletando registro de teste...');
    await axios.delete(`${BASE_URL}/registros/${registroId}`);
    console.log('✅ Registro deletado');

    console.log('\n🎉 Todos os testes passaram! API está funcionando corretamente.');

  } catch (error) {
    console.error('\n❌ Erro no teste:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Dica: Certifique-se de que o servidor está rodando:');
      console.log('   npm start');
    }
  }
}

// Executar teste se for chamado diretamente
if (require.main === module) {
  testarAPI();
}

module.exports = testarAPI;
