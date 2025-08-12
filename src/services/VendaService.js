// VendaService.js - Serviço complementar para funcionalidades de vendas

import api from './api';

export const vendaService = {
  // Função existente para listar vendas
  listar: async (filtros = {}) => {
    try {
      const response = await api.get('/vendas', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Erro ao listar vendas:', error);
      throw error;
    }
  },

  // Função existente para atualizar venda
  atualizar: async (id, dados) => {
    try {
      const response = await api.put(`/vendas/${id}`, dados);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar venda:', error);
      throw error;
    }
  },

  // Nova função para buscar detalhes de uma venda específica
  buscarPorId: async (id) => {
    try {
      const response = await api.get(`/vendas/${id}`, {
        params: {
          include_items: true,
          include_cliente: true,
          include_formas: true,
          include_produto: true,
        }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar venda por ID:', error);
      throw error;
    }
  },

  // Nova função para download de PDF
  downloadPdf: async (id) => {
    try {
      const response = await api.get(`/vendas/${id}/pdf`, {
        responseType: 'blob',
        headers: {
          'Accept': 'application/pdf',
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      throw error;
    }
  },

  // Nova função para exportar vendas para Excel
  exportarExcel: async (filtros = {}) => {
    try {
      const response = await api.get('/vendas/export/excel', {
        params: filtros,
        responseType: 'blob',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }
      });
      return response;
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      throw error;
    }
  },

  // Função para gerar relatório de vendas
  gerarRelatorio: async (filtros = {}) => {
    try {
      const response = await api.get('/vendas/relatorio', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      throw error;
    }
  },

  // Função para buscar estatísticas de vendas
  buscarEstatisticas: async (filtros = {}) => {
    try {
      const response = await api.get('/vendas/estatisticas', { params: filtros });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }
};

export default vendaService;

