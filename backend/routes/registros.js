// routes/registros.js
const express = require('express');
const router = express.Router();
const Registro = require('../models/Registro');

// GET /api/registros/stats/resumo - Estatísticas dos registros (DEVE VIR ANTES DE /:id)
router.get('/stats/resumo', async (req, res) => {
  try {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    const [
      totalRegistros,
      registrosHoje,
      pesoTotalHoje,
      ultimosRegistros
    ] = await Promise.all([
      Registro.countDocuments(),
      Registro.countDocuments({ timestamp: { $gte: inicioHoje } }),
      Registro.aggregate([
        { $match: { timestamp: { $gte: inicioHoje } } },
        { $group: { _id: null, total: { $sum: '$peso' } } }
      ]),
      Registro.find().sort({ timestamp: -1 }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        totalRegistros,
        registrosHoje,
        pesoTotalHoje: pesoTotalHoje[0]?.total || 0,
        ultimosRegistros
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// GET /api/registros - Listar todos os registros com paginação e filtros
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Filtros opcionais
    const filters = {};
    if (req.query.lote) filters.lote = new RegExp(req.query.lote, 'i');
    if (req.query.codigoBarras) filters.codigoBarras = req.query.codigoBarras;
    if (req.query.caixa) filters.caixa = new RegExp(req.query.caixa, 'i');
    if (req.query.status) filters.status = req.query.status;
    
    // Filtro por data
    if (req.query.dataInicio || req.query.dataFim) {
      filters.timestamp = {};
      if (req.query.dataInicio) filters.timestamp.$gte = new Date(req.query.dataInicio);
      if (req.query.dataFim) filters.timestamp.$lte = new Date(req.query.dataFim);
    }

    const total = await Registro.countDocuments(filters);
    const registros = await Registro.find(filters)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: registros,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao buscar registros:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// GET /api/registros/:id - Buscar registro por ID
router.get('/:id', async (req, res) => {
  try {
    const registro = await Registro.findById(req.params.id);
    
    if (!registro) {
      return res.status(404).json({ 
        success: false, 
        error: 'Registro não encontrado' 
      });
    }

    res.json({
      success: true,
      data: registro
    });
  } catch (error) {
    console.error('Erro ao buscar registro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// POST /api/registros - Criar novo registro
router.post('/', async (req, res) => {
  try {
    const { peso, lote, validade, codigoBarras, caixa, status } = req.body;

    // Validações
    if (!peso || !lote || !validade || !codigoBarras) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: peso, lote, validade, codigoBarras'
      });
    }

    const novoRegistro = new Registro({
      peso: parseFloat(peso),
      lote,
      validade,
      codigoBarras,
      caixa: caixa || '',
      status: status || 'ativo'
    });

    const registroSalvo = await novoRegistro.save();
    
    res.status(201).json({
      success: true,
      data: registroSalvo,
      message: 'Registro criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar registro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// PUT /api/registros/:id - Atualizar registro
router.put('/:id', async (req, res) => {
  try {
    const { peso, lote, validade, codigoBarras, caixa, status } = req.body;

    const dadosAtualizacao = {};
    if (peso !== undefined) dadosAtualizacao.peso = parseFloat(peso);
    if (lote !== undefined) dadosAtualizacao.lote = lote;
    if (validade !== undefined) dadosAtualizacao.validade = validade;
    if (codigoBarras !== undefined) dadosAtualizacao.codigoBarras = codigoBarras;
    if (caixa !== undefined) dadosAtualizacao.caixa = caixa;
    if (status !== undefined) dadosAtualizacao.status = status;

    const registroAtualizado = await Registro.findByIdAndUpdate(
      req.params.id,
      dadosAtualizacao,
      { new: true, runValidators: true }
    );

    if (!registroAtualizado) {
      return res.status(404).json({ 
        success: false, 
        error: 'Registro não encontrado' 
      });
    }

    res.json({
      success: true,
      data: registroAtualizado,
      message: 'Registro atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar registro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// DELETE /api/registros/:id - Deletar registro
router.delete('/:id', async (req, res) => {
  try {
    const registroDeletado = await Registro.findByIdAndDelete(req.params.id);

    if (!registroDeletado) {
      return res.status(404).json({ 
        success: false, 
        error: 'Registro não encontrado' 
      });
    }

    res.json({
      success: true,
      data: registroDeletado,
      message: 'Registro deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar registro:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

module.exports = router;
