import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  Activity,
  RefreshCw,
  Filter,
} from "lucide-react";
import { caixaService } from "@/services/api";

const ResumoGeralModal = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resumoData, setResumoData] = useState({
    saldoTotal: 0,
    totalEntradas: 0,
    totalSaidas: 0,
    totalCaixas: 0,
    fluxos: [],
  });

  // Estados dos filtros
  const [filterTipo, setFilterTipo] = useState("");
  const [filterMovimento, setFilterMovimento] = useState("");
  const [filterDataInicio, setFilterDataInicio] = useState("");
  const [filterDataFim, setFilterDataFim] = useState("");
  const [movimentosDisponiveis, setMovimentosDisponiveis] = useState([]);

  useEffect(() => {
    if (isOpen) {
      loadResumoGeral();
    }
  }, [isOpen]);

  const loadResumoGeral = async () => {
    setIsLoading(true);
    try {
      // Buscar resumo geral de todos os caixas
      const resumoResponse = await caixaService.resumoGeral();
      console.log(resumoResponse);

      // Buscar todos os fluxos de movimento
      const fluxosResponse = await caixaService.buscarTodosFluxos();
      console.log(
        "valores dos fluxos",
        fluxosResponse.map((f) => f.valor)
      );

      if (resumoResponse) {
        setResumoData({
          saldoTotal: resumoResponse.saldoTotal || 0,
          totalEntradas: resumoResponse.totalEntradas || 0,
          totalSaidas: resumoResponse.totalSaidas || 0,
          totalCaixas: resumoResponse.totalCaixas || 0,
          fluxos: fluxosResponse || [],
        });

        // Extrair movimentos únicos para o filtro
        const uniqueMovimentos = [
          ...new Set(
            fluxosResponse.map((f) => f.movimento?.descricao).filter(Boolean)
          ),
        ];
        setMovimentosDisponiveis(uniqueMovimentos);
      }
    } catch (error) {
      console.error("Erro ao carregar resumo geral:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getMovimentacaoIcon = (tipo) => {
    switch (tipo) {
      case "entrada":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "saida":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      case "abertura":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "fechamento":
        return <Activity className="w-4 h-4 text-gray-500" />;
      case "cancelamento":
        return <X className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getMovimentacaoColor = (tipo) => {
    switch (tipo) {
      case "entrada":
      case "abertura":
        return "text-green-600";
      case "saida":
      case "cancelamento":
        return "text-red-600";
      case "fechamento":
        return "text-gray-600";
      default:
        return "text-gray-600";
    }
  };

  // Lógica de filtragem
  const filteredFluxos = useMemo(() => {
    let tempFluxos = resumoData.fluxos;

    if (filterTipo) {
      tempFluxos = tempFluxos.filter((fluxo) => fluxo.tipo === filterTipo);
    }

    if (filterMovimento) {
      tempFluxos = tempFluxos.filter(
        (fluxo) => fluxo.movimento?.descricao === filterMovimento
      );
    }

    if (filterDataInicio) {
      const start = new Date(`${filterDataInicio}T00:00:00.000Z`);

      tempFluxos = tempFluxos.filter((fluxo) => {
        const fluxoDate = new Date(fluxo.data);
        return fluxoDate >= start;
      });
    }

    if (filterDataFim) {
      const end = new Date(`${filterDataFim}T23:59:59.999Z`);

      tempFluxos = tempFluxos.filter((fluxo) => {
        const fluxoDate = new Date(fluxo.data);
        return fluxoDate <= end;
      });
    }

    return tempFluxos;
  }, [
    resumoData.fluxos,
    filterTipo,
    filterMovimento,
    filterDataInicio,
    filterDataFim,
  ]);

  // Cálculo do total dos fluxos filtrados
  const totalFilteredFluxos = useMemo(() => {
    return filteredFluxos.reduce((sum, fluxo) => {
      const valor = parseFloat(fluxo.valor);
      if (isNaN(valor)) return sum;

      if (fluxo.tipo === "entrada" || fluxo.tipo === "abertura") {
        return sum + valor;
      } else if (fluxo.tipo === "saída") {
        return sum - valor;
      }

      // Ignora abertura, fechamento, cancelamento, etc.
      return sum;
    }, 0);
  }, [filteredFluxos]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] flex flex-col shadow-2xl overflow-y-auto">
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Resumo Geral dos Caixas
              </h2>
              <p className="text-sm text-gray-500">
                Visão consolidada de todos os caixas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadResumoGeral}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw
                className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Conteúdo do Modal */}
        <div className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando resumo geral...</p>
              </div>
            </div>
          ) : (
            <div className="p-6 h-full flex flex-col">
              {/* Cards de Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {/* Saldo Total */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-blue-100" />
                    <span className="text-blue-100 text-sm font-medium">
                      SALDO TOTAL
                    </span>
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(resumoData.saldoTotal)}
                  </p>
                  <p className="text-blue-100 text-sm mt-1">
                    {resumoData.totalCaixas} caixas processados
                  </p>
                </div>

                {/* Total de Entradas */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-green-100" />
                    <span className="text-green-100 text-sm font-medium">
                      ENTRADAS
                    </span>
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(resumoData.totalEntradas)}
                  </p>
                  <p className="text-green-100 text-sm mt-1">
                    Receitas consolidadas
                  </p>
                </div>

                {/* Total de Saídas */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingDown className="w-8 h-8 text-red-100" />
                    <span className="text-red-100 text-sm font-medium">
                      SAÍDAS
                    </span>
                  </div>
                  <p className="text-3xl font-bold">
                    {formatCurrency(resumoData.totalSaidas)}
                  </p>
                  <p className="text-red-100 text-sm mt-1">
                    Despesas consolidadas
                  </p>
                </div>

                {/* Margem Líquida */}
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-purple-100" />
                    <span className="text-purple-100 text-sm font-medium">
                      MARGEM
                    </span>
                  </div>
                  <p className="text-3xl font-bold">
                    {(
                      (resumoData.saldoTotal / resumoData.totalEntradas) *
                        100 || 0
                    ).toFixed(1)}
                    %
                  </p>
                  <p className="text-purple-100 text-sm mt-1">Margem líquida</p>
                </div>
              </div>

              {/* Filtros */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  Filtrar Fluxos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label
                      htmlFor="filterTipo"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Tipo
                    </label>
                    <select
                      id="filterTipo"
                      value={filterTipo}
                      onChange={(e) => setFilterTipo(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Todos</option>
                      <option value="entrada">Entrada</option>
                      <option value="saida">Saída</option>
                      <option value="abertura">Abertura</option>
                      <option value="fechamento">Fechamento</option>
                      <option value="cancelamento">Cancelamento</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="filterMovimento"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Movimento
                    </label>
                    <select
                      id="filterMovimento"
                      value={filterMovimento}
                      onChange={(e) => setFilterMovimento(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    >
                      <option value="">Todos</option>
                      {movimentosDisponiveis.map((mov, index) => (
                        <option key={index} value={mov}>
                          {mov}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="filterDataInicio"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Data Início
                    </label>
                    <input
                      type="date"
                      id="filterDataInicio"
                      value={filterDataInicio}
                      onChange={(e) => setFilterDataInicio(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="filterDataFim"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Data Fim
                    </label>
                    <input
                      type="date"
                      id="filterDataFim"
                      value={filterDataFim}
                      onChange={(e) => setFilterDataFim(e.target.value)}
                      className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  </div>
                </div>
              </div>

              {/* Lista de Fluxos */}
              <div className="flex-1 bg-gray-50 rounded-xl p-6 overflow-hidden flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Fluxos de Movimento Filtrados
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Activity className="w-4 h-4" />
                    <span>{filteredFluxos.length} movimentações</span>
                  </div>
                </div>

                {/* Lista Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {filteredFluxos.length === 0 ? (
                    <div className="text-center py-12">
                      <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        Nenhuma movimentação encontrada com os filtros aplicados
                      </p>
                      <p className="text-gray-400 text-sm">
                        Ajuste os filtros para ver os resultados
                      </p>
                    </div>
                  ) : (
                    filteredFluxos.map((fluxo) => (
                      <div
                        key={fluxo.id}
                        className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            {getMovimentacaoIcon(fluxo.tipo)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-gray-900 truncate">
                                  {fluxo.descricao}
                                </p>
                                {fluxo.movimento?.descricao && (
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                    {fluxo.movimento.descricao}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>{formatDate(fluxo.data)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(fluxo.data)}</span>
                                </div>
                                {fluxo.caixa?.descricao && (
                                  <span className="text-blue-600 font-medium">
                                    {fluxo.caixa.descricao}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p
                              className={`text-lg font-bold ${getMovimentacaoColor(
                                fluxo.tipo
                              )}`}
                            >
                              {fluxo.tipo === "entrada" ||
                              fluxo.tipo === "abertura"
                                ? "+"
                                : "-"}
                              {formatCurrency(fluxo.valor)}
                            </p>
                            <p className="text-xs text-gray-400 uppercase tracking-wide">
                              {fluxo.tipo}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Totalizador dos Fluxos Filtrados */}
                <div className="mt-4 p-4 bg-blue-50 rounded-lg flex justify-between items-center">
                  <p className="text-lg font-semibold text-blue-800">
                    Total dos Fluxos Filtrados:
                  </p>
                  <p className="text-2xl font-bold text-blue-800">
                    {formatCurrency(totalFilteredFluxos)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer do Modal */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Última atualização: {new Date().toLocaleString("pt-BR")}
            </div>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumoGeralModal;
