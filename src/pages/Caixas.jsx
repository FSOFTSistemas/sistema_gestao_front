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
  Lock,
  PlusCircle,
  MinusCircle,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { caixaService } from "@/services/api";
import ResumoGeralModal from "@/components/ResumoGeralModal";

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
  const [showResumoGeralModal, setShowResumoGeralModal] = useState(false);

  // Estados dos formulários
  const [valorInicial, setValorInicial] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [valorMovimento, setValorMovimento] = useState("");
  const [descricaoMovimento, setDescricaoMovimento] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorFinal, setValorFinal] = useState("");

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
      const caixaResponse = await caixaService.buscarDiaAtual();
      if (caixaResponse) {
        setCaixa(caixaResponse);

        setFluxos(caixaResponse.fluxos || []);
      } else {
        setCaixa(null);
        setFluxos([]);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do caixa:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateValues = () => {
    if (!fluxos.length) {
      setSaldoAtual(
        caixa && typeof caixa.valor_inicial === "number"
          ? caixa.valor_inicial.toFixed(2)
          : 0
      );
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
    setSaldoAtual(entradas - saidas);
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

    const valor = parseFloat(valorInicial.replace(",", "."));
    if (isNaN(valor) || valor < 0) {
      alert("Erro", "Digite um valor inicial válido");
      return;
    }

    try {
      const caixaData = {
        descricao: descricao.trim(),
        valor_inicial: valor,
        observacoes: observacoes.trim() || null,
      };
      const response = await caixaService.abrir(caixaData);
      if (response) {
        setValorInicial("");
        setDescricao("");
        setObservacoes("");
        alert("Caixa aberto com sucesso");
        setShowAbrirModal(false);
        loadCaixaData();
      }
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      alert("Erro ao abrir caixa");
    }
  };

  const diferenca = valorFinal
    ? parseFloat(valorFinal.replace(",", ".")) - saldoAtual
    : 0;

  const handleFecharCaixa = async () => {
    if (!valorFinal.trim()) {
      alert("Erro, digite o valor final do caixa");
      return;
    }

    const valor = parseFloat(valorFinal.replace(",", "."));
    if (isNaN(valor) || valor < 0) {
      alert("Erro", "Digite um valor final válido");
      return;
    }

    // Confirmar fechamento se houver diferença
    if (Math.abs(diferenca) > 0.01) {
      const diferencaText = diferenca > 0 ? "sobra" : "falta";
      const confirmMessage = `Há uma ${diferencaText} de ${formatCurrency(
        Math.abs(diferenca)
      )}. Deseja continuar?`;

      if (window.confirm(confirmMessage)) {
        executarFechamento(valor);
      }
      // Se cancelar, não faz nada
    } else {
      executarFechamento(valor);
    }
  };

  const executarFechamento = async (valorFinal) => {
    setIsLoading(true);

    try {
      // Atualizar caixa
      const fecharData = {
        valor_final: valorFinal,
        observacoes: observacoes.trim() || null,
        status: "fechado",
      };
      const response = await caixaService.atualizar(caixa.id, fecharData);
      if (response) {
        setValorFinal("");
        setObservacoes("");
        alert("Sucesso!", "Caixa fechado com sucesso");
        loadCaixaData();
        setShowFecharModal(false);
      }
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      alert("Erro", error.response?.data?.message || "Erro ao fechar caixa");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuprimento = async () => {
    if (!valorMovimento) {
      alert("Informe o valor do suprimento");
      return;
    }
    if (!descricaoMovimento.trim()) {
      alert("Informe a descrição do suprimento");
      return;
    }

    try {
      const caixaResponse = await caixaService.buscarDiaAtual();
      const caixaId = caixaResponse?.id;
      const fluxoData = {
        descricao: descricaoMovimento.trim(),
        valor: valorMovimento,
        tipo: "entrada",
        caixa_id: caixaId,
        movimento_id: 5,
      };
      const fluxoResponse = await caixaService.criarFluxo(fluxoData);
      if (fluxoResponse) {
        setFluxos([...fluxos, fluxoResponse]);
        setShowSuprimentoModal(false);
        setValorMovimento("");
        setDescricaoMovimento("");
      }
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

    if (!descricaoMovimento.trim()) {
      alert("Informe a descrição da sangria");
      return;
    }

    try {
      const caixaResponse = await caixaService.buscarDiaAtual();
      const caixaId = caixaResponse?.id;
      const fluxoData = {
        descricao: descricaoMovimento.trim(),
        valor: valorMovimento,
        tipo: "saida",
        caixa_id: caixaId,
        movimento_id: 6,
      };
      const fluxoResponse = await caixaService.criarFluxo(fluxoData);
      if (fluxoResponse) {
        setFluxos([...fluxos, fluxoResponse]);
        setShowSangriaModal(false);
        setValorMovimento("");
        setDescricaoMovimento("");
      }
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-2xl font-bold text-gray-900">Caixa</h1>
              <button
                onClick={() => setShowResumoGeralModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                <BarChart3 className="w-4 h-4" />
                Resumo Geral
              </button>
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
                    {caixa?.data_abertura
                      ? formatDate(caixa.data_abertura)
                      : "-"}
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
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-5 h-5" />
                  Suprimento
                </button>
                <button
                  onClick={() => setShowSangriaModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <MinusCircle className="w-5 h-5" />
                  Sangria
                </button>
                <button
                  onClick={() => setShowFecharModal(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <XCircle className="w-5 h-5" />
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
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Abrir Caixa
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Caixa de João... Caixa da manhã..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor Inicial *
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
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                <Lock className="w-6 h-6 text-red-500 inline-block mr-2" />
                Fechar Caixa
              </h3>
              <p className="text-gray-500 mb-2">
                informe o valor final para fechamento
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex flex-row justify-between border-gray-300">
                    <p className="text-gray-500">Saldo Inicial</p>
                    <p className="text-gray">
                      {formatCurrency(caixa.valor_inicial)}
                    </p>
                  </div>
                  <div className="flex flex-row justify-between mt-2 pt-2  border-gray-300">
                    <p className="text-gray-500">Saldo Sistema</p>
                    <p className="text-gray">{formatCurrency(saldoAtual)}</p>
                  </div>
                  {valorFinal && (
                    <>
                      <div className="flex flex-row justify-between mt-2 pt-2 border-t border-gray-300">
                        <span className="text-gray-500">Diferença:</span>
                        <span
                          className={`font-bold ${
                            diferenca === 0
                              ? "text-green-500"
                              : diferenca > 0
                              ? "text-yellow-500"
                              : "text-red-500"
                          }`}
                        >
                          {diferenca === 0
                            ? "Sem diferença"
                            : diferenca > 0
                            ? `+${formatCurrency(diferenca)}`
                            : formatCurrency(diferenca)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
                {/* Valor Final */}
                <div className="mb-4">
                  <label
                    htmlFor="valorFinal"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Valor Final *
                  </label>
                  <input
                    id="valorFinal"
                    type="text"
                    placeholder="0,00"
                    value={valorFinal}
                    onChange={(e) => setValorFinal(e.target.value)}
                    disabled={isLoading}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    aria-disabled={isLoading}
                  />
                </div>

                {/* Observações */}
                <div className="mb-4">
                  <label
                    htmlFor="observacoes"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Observações
                  </label>
                  <textarea
                    id="observacoes"
                    rows={4}
                    placeholder="Observações sobre o fechamento (opcional)"
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    disabled={isLoading}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
                    aria-disabled={isLoading}
                  />
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
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <PlusCircle className="w-6 h-6 text-yellow-500 inline-block mr-2" />
                Suprimento
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Adicionar dinheiro ao caixa
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição*
                  </label>
                  <input
                    type="text"
                    value={descricaoMovimento}
                    onChange={(e) => setDescricaoMovimento(e.target.value)}
                    placeholder="Descrição do suprimento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Registrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Sangria */}
        {showSangriaModal && (
          <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                <MinusCircle className="w-6 h-6 text-blue-500 inline-block mr-2" />
                Sangria
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Retirar dinheiro do caixa
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição *
                  </label>
                  <input
                    type="text"
                    value={descricaoMovimento}
                    onChange={(e) => setDescricaoMovimento(e.target.value)}
                    placeholder="Descrição da sangria"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
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
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ResumoGeralModal
        isOpen={showResumoGeralModal}
        onClose={() => setShowResumoGeralModal(false)}
      />
    </>
  );
};

export default CaixaWeb;
