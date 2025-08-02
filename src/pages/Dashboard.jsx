import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Package,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar,
  Activity
} from 'lucide-react';
import { clienteService, produtoService } from '../services/api';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalClientes: 0,
    clientesAtivos: 0,
    totalProdutos: 0,
    produtosAtivos: 0,
    produtosEstoqueBaixo: 0,
    valorEstoque: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentClients, setRecentClients] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar estatísticas de clientes
      const clientesResponse = await clienteService.listar();
      const clientesRelatorio = await clienteService.relatorio(30);
      
      // Carregar estatísticas de produtos
      const produtosResponse = await produtoService.listar();
      const produtosRelatorio = await produtoService.relatorio(30);
      const estoqueBaixo = await produtoService.estoqueBaixo();
      
      setStats({
        totalClientes: clientesRelatorio.data?.estatisticas?.totalClientes || 0,
        clientesAtivos: clientesRelatorio.data?.estatisticas?.clientesAtivos || 0,
        totalProdutos: produtosRelatorio.data?.estatisticas?.totalProdutos || 0,
        produtosAtivos: produtosRelatorio.data?.estatisticas?.produtosAtivos || 0,
        produtosEstoqueBaixo: produtosRelatorio.data?.estatisticas?.produtosEstoqueBaixo || 0,
        valorEstoque: produtosRelatorio.data?.estatisticas?.valorEstoque || 0
      });
      
      setRecentClients(clientesResponse.data?.clientes || []);
      setLowStockProducts(estoqueBaixo.data?.produtos || []);
      
    } catch (error) {
      console.error('Erro ao carregar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, link }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className="text-sm text-green-600 mt-1">
              <TrendingUp className="inline w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {link && (
        <Link
          to={link}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium mt-3 inline-block"
        >
          Ver detalhes →
        </Link>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Visão geral do seu negócio
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Clientes"
          value={stats.totalClientes}
          icon={Users}
          color="bg-blue-500"
          link="/clientes"
        />
        <StatCard
          title="Clientes Ativos"
          value={stats.clientesAtivos}
          icon={Activity}
          color="bg-green-500"
          link="/clientes"
        />
        <StatCard
          title="Total de Produtos"
          value={stats.totalProdutos}
          icon={Package}
          color="bg-orange-500"
          link="/produtos"
        />
        <StatCard
          title="Valor do Estoque"
          value={formatCurrency(stats.valorEstoque)}
          icon={DollarSign}
          color="bg-purple-500"
          link="/produtos"
        />
      </div>

      {/* Alertas */}
      {stats.produtosEstoqueBaixo > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">
                Atenção: Produtos com estoque baixo
              </h3>
              <p className="text-sm text-yellow-700 mt-1">
                {stats.produtosEstoqueBaixo} produto(s) estão com estoque abaixo do mínimo.
              </p>
            </div>
            <Link
              to="/produtos?estoque_baixo=true"
              className="text-sm font-medium text-yellow-800 hover:text-yellow-900"
            >
              Ver produtos →
            </Link>
          </div>
        </div>
      )}

      {/* Seções de dados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clientes recentes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Clientes Recentes</h2>
              <Link
                to="/clientes"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Ver todos →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {recentClients.length > 0 ? (
              <div className="space-y-4">
                {recentClients.map((cliente) => (
                  <div key={cliente.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {cliente.nome}
                      </p>
                      <p className="text-sm text-gray-500 truncate">
                        {cliente.email || cliente.telefone}
                      </p>
                    </div>
                    <div className={`px-2 py-1 text-xs rounded-full ${
                      cliente.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cliente.ativo ? 'Ativo' : 'Inativo'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Nenhum cliente cadastrado</p>
                <Link
                  to="/clientes"
                  className="text-orange-600 hover:text-orange-700 font-medium text-sm mt-2 inline-block"
                >
                  Cadastrar primeiro cliente →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Produtos com estoque baixo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Estoque Baixo</h2>
              <Link
                to="/produtos?estoque_baixo=true"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
              >
                Ver todos →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {lowStockProducts.length > 0 ? (
              <div className="space-y-4">
                {lowStockProducts.slice(0, 5).map((produto) => (
                  <div key={produto.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {produto.nome}
                      </p>
                      <p className="text-sm text-gray-500">
                        Estoque: {produto.estoque_atual} / Mín: {produto.estoque_minimo}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(produto.preco_venda)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">Todos os produtos estão com estoque adequado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ações rápidas */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/clientes"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Users className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Gerenciar Clientes</p>
              <p className="text-sm text-gray-500">Adicionar ou editar clientes</p>
            </div>
          </Link>
          <Link
            to="/produtos"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Package className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Gerenciar Produtos</p>
              <p className="text-sm text-gray-500">Adicionar ou editar produtos</p>
            </div>
          </Link>
          <div className="flex items-center p-4 border border-gray-200 rounded-lg bg-gray-50 opacity-60">
            <ShoppingCart className="w-8 h-8 text-gray-400 mr-3" />
            <div>
              <p className="font-medium text-gray-600">Nova Venda</p>
              <p className="text-sm text-gray-500">Em desenvolvimento</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

