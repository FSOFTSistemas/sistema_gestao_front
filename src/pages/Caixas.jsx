import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Play,
  Square,
  Plus,
  Minus,
  RefreshCw,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

// Componente principal do Caixa Web
const CaixaWeb = () => {
  // Estados principais
  const [caixa, setCaixa] = useState(null);
  const [fluxos, setFluxos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados calculados
  const [saldoAtual, setSaldoAtual] = useState(0);
  const [totalEntradas, setTotalEntradas] = useState(0);
  const [totalSaidas, setTotalSaidas] = useState(0);
  const [chartData, setChartData] = useState([]);

  // Estados dos modais
  const [showAbrirModal, setShowAbrirModal] = useState(false);
  const [showFecharModal, setShowFecharModal] = useState(false);
  const [showSuprimentoModal, setShowSuprimentoModal] = useState(false);
  const [showSangriaModal, setShowSangriaModal] = useState(false);

  // Estados dos formulários
  const [valorInicial, setValorInicial] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valorMovimento, setValorMovimento] = useState("");
  const [descricaoMovimento, setDescricaoMovimento] = useState("");

  // Carregar dados iniciais
  useEffect(() => {
    loadCaixaData();
  }, []);

  // Recalcular valores quando fluxos mudarem
  useEffect(() => {
    calculateValues();
    generateChartData();
  }, [fluxos, caixa]);

  const loadCaixaData = async () => {
    setIsLoading(true);
    try {
      // Simular chamada da API
      const response = await fetch("/api/caixa/aberto");
      if (response.ok) {
        const data = await response.json();
        setCaixa(data);
        setFluxos(data.fluxos || []);
      } else {
        setCaixa(null);
        setFluxos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do caixa:", error);
      // Dados de exemplo para demonstração
      const exemploData = {
        id: 1,
        descricao: "Caixa do dia",
        valor_inicial: 100.0,
        data_abertura: new Date().toISOString(),
        status: "aberto",
        fluxos: [
          {
            id: 1,
            descricao: "Venda - PIX",
            valor: 50.0,
            tipo: "entrada",
            data: new Date().toISOString(),
            movimento: { descricao: "PIX" },
          },
          {
            id: 2,
            descricao: "Venda - Dinheiro",
            valor: 30.0,
            tipo: "entrada",
            data: new Date().toISOString(),
            movimento: { descricao: "Dinheiro" },
          },
        ],
      };
      setCaixa(exemploData);
      setFluxos(exemploData.fluxos);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateValues = () => {
    if (!fluxos.length) {
      setSaldoAtual(caixa?.valor_inicial || 0);
      setTotalEntradas(0);
      setTotalSaidas(0);
      return;
    }

    let entradas = 0;
    let saidas = 0;

    fluxos.forEach((fluxo) => {
      const valor = parseFloat(fluxo.valor);
      if (fluxo.tipo === "entrada" || fluxo.tipo === "abertura") {
        entradas += valor;
      } else if (fluxo.tipo === "saida" || fluxo.tipo === "cancelamento") {
        saidas += valor;
      }
    });

    setTotalEntradas(entradas);
    setTotalSaidas(saidas);
    setSaldoAtual((caixa?.valor_inicial || 0) + entradas - saidas);
  };

  const generateChartData = () => {
    if (!fluxos.length) {
      setChartData([]);
      return;
    }

    const movimentosMap = new Map();
    const colors = [
      "#3B82F6",
      "#10B981",
      "#F59E0B",
      "#EF4444",
      "#8B5CF6",
      "#EC4899",
    ];

    fluxos.forEach((fluxo) => {
      const valor = parseFloat(fluxo.valor);
      if (fluxo.tipo === "entrada" && fluxo.movimento?.descricao) {
        let movimento = fluxo.movimento.descricao;
        if (movimento.startsWith("venda-")) {
          movimento = movimento.replace("venda-", "");
        }
        movimentosMap.set(
          movimento,
          (movimentosMap.get(movimento) || 0) + valor
        );
      }
    });

    const data = Array.from(movimentosMap.entries()).map(
      ([name, value], index) => ({
        name,
        value,
        fill: colors[index % colors.length],
      })
    );

    setChartData(data);
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

  const handleAbrirCaixa = async () => {
    if (!valorInicial) {
      alert("Informe o valor inicial");
      return;
    }

    try {
      // Simular chamada da API
      const novoFluxo = {
        id: Date.now(),
        descricao: "Abertura do caixa",
        valor: parseFloat(valorInicial.replace(",", ".")),
        tipo: "abertura",
        data: new Date().toISOString(),
        movimento: { descricao: "Abertura" },
      };

      const novoCaixa = {
        id: Date.now(),
        descricao: "Caixa do dia",
        valor_inicial: parseFloat(valorInicial.replace(",", ".")),
        data_abertura: new Date().toISOString(),
        status: "aberto",
        observacoes,
      };

      setCaixa(novoCaixa);
      setFluxos([novoFluxo]);
      setShowAbrirModal(false);
      setValorInicial("");
      setObservacoes("");
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      alert("Erro ao abrir caixa");
    }
  };

  const handleFecharCaixa = async () => {
    if (!caixa || caixa.status !== "aberto") {
      alert("Não há caixa aberto para fechar");
      return;
    }

    try {
      const caixaAtualizado = {
        ...caixa,
        status: "fechado",
        data_fechamento: new Date().toISOString(),
        valor_final: saldoAtual,
      };

      setCaixa(caixaAtualizado);
      setShowFecharModal(false);
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      alert("Erro ao fechar caixa");
    }
  };

  const handleSuprimento = async () => {
    if (!valorMovimento) {
      alert("Informe o valor do suprimento");
      return;
    }

    try {
      const novoFluxo = {
        id: Date.now(),
        descricao: descricaoMovimento || "Suprimento",
        valor: parseFloat(valorMovimento.replace(",", ".")),
        tipo: "entrada",
        data: new Date().toISOString(),
        movimento: { descricao: "Suprimento" },
      };

      setFluxos([...fluxos, novoFluxo]);
      setShowSuprimentoModal(false);
      setValorMovimento("");
      setDescricaoMovimento("");
    } catch (error) {
      console.error("Erro ao fazer suprimento:", error);
      alert("Erro ao fazer suprimento");
    }
  };

  const handleSangria = async () => {
    if (!valorMovimento) {
      alert("Informe o valor da sangria");
      return;
    }

    try {
      const novoFluxo = {
        id: Date.now(),
        descricao: descricaoMovimento || "Sangria",
        valor: parseFloat(valorMovimento.replace(",", ".")),
        tipo: "saida",
        data: new Date().toISOString(),
        movimento: { descricao: "Sangria" },
      };

      setFluxos([...fluxos, novoFluxo]);
      setShowSangriaModal(false);
      setValorMovimento("");
      setDescricaoMovimento("");
    } catch (error) {
      console.error("Erro ao fazer sangria:", error);
      alert("Erro ao fazer sangria");
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCaixaData();
    } catch (error) {
      console.error("Erro ao atualizar:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getMovimentacaoIcon = (tipo) => {
    switch (tipo) {
      case "entrada":
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case "saida":
        return <TrendingDown className="w-5 h-5 text-red-500" />;
      case "abertura":
        return <Play className="w-5 h-5 text-blue-500" />;
      case "fechamento":
        return <Square className="w-5 h-5 text-gray-500" />;
      case "cancelamento":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando dados do caixa...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Controle de Caixa
            </h1>
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status do Caixa */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Status do Caixa
            </h2>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                caixa?.status === "aberto"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {caixa?.status === "aberto" ? "ABERTO" : "FECHADO"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Data Abertura</p>
                <p className="font-medium">
                  {caixa?.data_abertura ? formatDate(caixa.data_abertura) : "-"}
                </p>
              </div>
            </div>

            {caixa?.data_fechamento && (
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Data Fechamento</p>
                  <p className="font-medium">
                    {formatDate(caixa.data_fechamento)}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Valor Inicial</p>
                <p className="font-medium">
                  {formatCurrency(caixa?.valor_inicial || 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Saldo Atual */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-8 mb-8 text-white">
          <div className="text-center">
            <p className="text-blue-100 text-lg mb-2">Saldo Atual</p>
            <p className="text-4xl font-bold mb-6">
              {formatCurrency(saldoAtual)}
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-blue-100 text-sm">Entradas</p>
                <p className="text-2xl font-semibold text-green-300">
                  {formatCurrency(totalEntradas)}
                </p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Saídas</p>
                <p className="text-2xl font-semibold text-red-300">
                  {formatCurrency(totalSaidas)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {!caixa || caixa.status === "fechado" ? (
            <button
              onClick={() => setShowAbrirModal(true)}
              className="col-span-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5" />
              Abrir Caixa
            </button>
          ) : (
            <>
              <button
                onClick={() => setShowSuprimentoModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Suprimento
              </button>
              <button
                onClick={() => setShowSangriaModal(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Minus className="w-5 h-5" />
                Sangria
              </button>
              <button
                onClick={() => setShowFecharModal(true)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Square className="w-5 h-5" />
                Fechar Caixa
              </button>
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico de Vendas */}
          {chartData.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vendas por Forma de Pagamento
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) =>
                        `${name}: ${formatCurrency(value)}`
                      }
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Lista de Movimentações */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Movimentações Recentes
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {fluxos.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Nenhuma movimentação encontrada
                </p>
              ) : (
                fluxos
                  .slice()
                  .reverse()
                  .map((fluxo) => (
                    <div
                      key={fluxo.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {getMovimentacaoIcon(fluxo.tipo)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {fluxo.descricao}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatTime(fluxo.data)}
                          </p>
                        </div>
                      </div>
                      <p
                        className={`font-semibold ${getMovimentacaoColor(
                          fluxo.tipo
                        )}`}
                      >
                        {fluxo.tipo === "entrada" || fluxo.tipo === "abertura"
                          ? "+"
                          : "-"}
                        {formatCurrency(fluxo.valor)}
                      </p>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Abrir Caixa */}
      {showAbrirModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Abrir Caixa
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Inicial
                </label>
                <input
                  type="text"
                  value={valorInicial}
                  onChange={(e) => setValorInicial(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAbrirModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAbrirCaixa}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Abrir Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fechar Caixa */}
      {showFecharModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Fechar Caixa
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Saldo Final</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(saldoAtual)}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Tem certeza que deseja fechar o caixa? Esta ação não pode ser
                desfeita.
              </p>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowFecharModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleFecharCaixa}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Fechar Caixa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Suprimento */}
      {showSuprimentoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Suprimento
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  value={valorMovimento}
                  onChange={(e) => setValorMovimento(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={descricaoMovimento}
                  onChange={(e) => setDescricaoMovimento(e.target.value)}
                  placeholder="Descrição do suprimento"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSuprimentoModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSuprimento}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Sangria */}
      {showSangriaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Sangria
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  value={valorMovimento}
                  onChange={(e) => setValorMovimento(e.target.value)}
                  placeholder="0,00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição (opcional)
                </label>
                <input
                  type="text"
                  value={descricaoMovimento}
                  onChange={(e) => setDescricaoMovimento(e.target.value)}
                  placeholder="Descrição da sangria"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSangriaModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSangria}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaixaWeb;
