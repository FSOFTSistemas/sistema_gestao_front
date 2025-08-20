import React, { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  Plus,
  DollarSign,
  Calendar,
  Building,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  XCircle,
} from "lucide-react";
import { contasPagarService } from "@/services/api";
import toast from "react-hot-toast";

// Formas de pagamento disponíveis
const FORMAS_PAGAMENTO = [
  { value: "DINHEIRO", label: "Dinheiro" },
  { value: "CARTAO_CREDITO", label: "Cartão Crédito" },
  { value: "CARTAO_DEBITO", label: "Cartão Débito" },
  { value: "PIX", label: "PIX" },
  { value: "TRANSFERENCIA", label: "Transferência" },
  { value: "BOLETO", label: "Boleto" },
  { value: "CHEQUE", label: "Cheque" },
];

export default function ContasPagar() {
  const [contas, setContas] = useState([]);
  const [filteredContas, setFilteredContas] = useState([]);

  // Estados dos filtros
  const [filtros, setFiltros] = useState({
    status: "TODOS",
    dataInicio: "",
    dataFim: "",
    fornecedor: "",
    periodo: "MES_ATUAL",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Estados dos modais
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedConta, setSelectedConta] = useState(null);

  // Estados do modal de pagamento
  const [valorPagamento, setValorPagamento] = useState("");
  const [formaPagamento, setFormaPagamento] = useState("");
  const [observacoesPagamento, setObservacoesPagamento] = useState("");
  const [formData, setFormData] = useState({
    fornecedor: "",
    descricao: "",
    valor: "",
    data_vencimento: "",
    observacoes: "",
    parcela: "1",
  });

  useEffect(() => {
    loadContas();
  }, []);

  const loadContas = async () => {
    try {
      const response = await contasPagarService.listar();
      setContas(response);
    } catch (error) {
      console.error("Erro ao carregar contas:", error);
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

  const getStatusText = (status) => {
    switch (status) {
      case "PAGO":
        return "Pago";
      case "VENCIDO":
        return "Vencido";
      case "PENDENTE":
        return "Pendente";
      case "CANCELADO":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PAGO":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "VENCIDO":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case "PENDENTE":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "CANCELADO":
        return <X className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAGO":
        return "bg-green-100 text-green-800 border-green-200";
      case "VENCIDO":
        return "bg-red-100 text-red-800 border-red-200";
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELADO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const isContaVencida = (conta) => {
    const hoje = new Date();
    const vencimento = new Date(conta.data_vencimento);
    return conta.status === "PENDENTE" && vencimento < hoje;
  };

  const handlePayConta = (conta) => {
    setSelectedConta(conta);
    setValorPagamento((conta.valor - conta.valor_pago).toFixed(2));
    setFormaPagamento("");
    setObservacoesPagamento("");
    setShowPayModal(true);
  };

  const processPayConta = async () => {
    if (!selectedConta || !formaPagamento) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }

    const valor = parseFloat(valorPagamento.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    const valorRestante = selectedConta.valor - selectedConta.valor_pago;
    if (valor > valorRestante) {
      toast.error(
        `Valor não pode ser maior que ${formatCurrency(valorRestante)}`
      );
      return;
    }

    try {
      const pagarData = {
        valor_pago: valor,
        forma_pagamento: formaPagamento,
        observacoes: observacoesPagamento,
      };
      await contasPagarService.pagar(selectedConta.id, pagarData);
      toast.success("Pagamento registrado com sucesso!");
      setShowPayModal(false);
      loadContas();
    } catch (error) {
      toast.error("Erro ao registrar pagamento.");
      console.error(error);
    }
  };

  const handleSaveNewConta = async (formData) => {
    try {
      await contasPagarService.criar(formData);
      toast.success("Conta adicionada com sucesso!");
      setShowAddModal(false);
      loadContas();
    } catch (error) {
      toast.error("Erro ao adicionar conta.");
      console.error(error);
    }
  };

  const applyFilters = () => {
    let filtered = [...contas];
    // Filtro por status
    if (filtros.status !== "TODOS") {
      filtered = filtered.filter((conta) => conta.status === filtros.status);
    }

    if (filtros.fornecedor) {
      filtered = filtered.filter((conta) => {
        return conta.fornecedor
          ?.toLowerCase()
          .includes(filtros.fornecedor.toLowerCase());
      });
    }

    // Filtro por período
    if (
      (filtros.dataInicio && filtros.dataFim) ||
      filtros.periodo !== "TODOS"
    ) {
      let dataInicio;
      let dataFim;

      if (filtros.dataInicio && filtros.dataFim) {
        // Preferência para datas manuais
        dataInicio = new Date(filtros.dataInicio);
        dataFim = new Date(filtros.dataFim);
        dataFim.setHours(23, 59, 59, 999); // garantir final do dia
      } else {
        // Períodos automáticos
        const hoje = new Date();
        switch (filtros.periodo) {
          case "HOJE":
            dataInicio = new Date(
              hoje.getFullYear(),
              hoje.getMonth(),
              hoje.getDate()
            );
            dataFim = new Date(
              hoje.getFullYear(),
              hoje.getMonth(),
              hoje.getDate(),
              23,
              59,
              59
            );
            break;
          case "SEMANA_ATUAL": {
            const diaSemana = hoje.getDay();
            dataInicio = new Date(
              hoje.getFullYear(),
              hoje.getMonth(),
              hoje.getDate() - diaSemana
            );
            dataFim = new Date(
              hoje.getFullYear(),
              hoje.getMonth(),
              hoje.getDate() + (6 - diaSemana),
              23,
              59,
              59
            );
            break;
          }
          case "MES_ATUAL":
            dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
            dataFim = new Date(
              hoje.getFullYear(),
              hoje.getMonth() + 1,
              0,
              23,
              59,
              59
            );
            break;
          case "VENCIDAS":
            dataFim = new Date(
              hoje.getFullYear(),
              hoje.getMonth(),
              hoje.getDate() - 1
            );
            filtered = filtered.filter(
              (conta) =>
                conta.status === "VENCIDO" ||
                (conta.status === "PENDENTE" &&
                  new Date(conta.data_vencimento) < hoje)
            );
            break;
          default:
            dataInicio = new Date(0);
            dataFim = new Date();
        }
      }

      if (filtros.periodo !== "VENCIDAS") {
        filtered = filtered.filter((conta) => {
          const vencimento = new Date(conta.data_vencimento);
          return vencimento >= dataInicio && vencimento <= dataFim;
        });
      }
    }

    // Ordenar por data de vencimento
    filtered.sort(
      (a, b) =>
        new Date(a.data_vencimento).getTime() -
        new Date(b.data_vencimento).getTime()
    );

    setFilteredContas(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [contas, filtros]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                Contas a Pagar
              </h1>
              {filteredContas.filter((c) => isContaVencida(c)).length > 0 && (
                <span className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {filteredContas.filter((c) => isContaVencida(c)).length}{" "}
                  vencidas
                </span>
              )}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Conta
            </button>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border mb-6">
          <div className="p-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center justify-between w-full text-left"
            >
              <div className="flex items-center">
                <Filter className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">
                  Filtros
                </span>
              </div>
              {showFilters ? (
                <ChevronUp className="w-5 h-5 text-gray-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-400" />
              )}
            </button>

            {showFilters && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={filtros.status}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="PENDENTE">Pendente</option>
                    <option value="PAGO">Pago</option>
                    <option value="VENCIDO">Vencido</option>
                    <option value="CANCELADO">Cancelado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={filtros.periodo}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        periodo: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="TODOS">Todos</option>
                    <option value="HOJE">Hoje</option>
                    <option value="SEMANA_ATUAL">Semana Atual</option>
                    <option value="MES_ATUAL">Mês Atual</option>
                    <option value="VENCIDAS">Vencidas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={filtros.fornecedor}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        fornecedor: e.target.value,
                      }))
                    }
                    placeholder="Buscar por fornecedor..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Novos campos de data */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={filtros.dataInicio}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataInicio: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={filtros.dataFim}
                    onChange={(e) =>
                      setFiltros((prev) => ({
                        ...prev,
                        dataFim: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Botão limpar filtros */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setFiltros({
                        status: "TODOS",
                        dataInicio: "",
                        dataFim: "",
                        fornecedor: "",
                        periodo: "MES_ATUAL",
                      })
                    }
                    className="mt-6 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Lista de Contas */}
        <div className="space-y-4">
          {filteredContas.map((conta, index) => {
            const valorRestante = conta.valor - conta.valor_pago;
            const isVencida = isContaVencida(conta);

            return (
              <div
                key={conta.id}
                className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
                  isVencida ? "border-l-4 border-l-red-500" : ""
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: "fadeInUp 0.5s ease-out forwards",
                }}
              >
                <div className="p-6">
                  {/* Header da conta */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">
                        {conta.descricao}
                      </h3>
                      <div className="flex items-center">
                        {getStatusIcon(conta.status)}
                        <span
                          className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            conta.status
                          )}`}
                        >
                          {getStatusText(conta.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Detalhes da conta */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{conta.fornecedor}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Venc: {formatDate(conta.data_vencimento)}</span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                      <span>Original: {formatCurrency(conta.valor)}</span>
                    </div>

                    {conta.valor_pago > 0 && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-400" />
                        <span>Pago: {formatCurrency(conta.valor_pago)}</span>
                      </div>
                    )}
                  </div>

                  {/* Número do documento */}
                  {conta.numero_documento && (
                    <div className="mb-4">
                      <span className="text-sm text-gray-500">
                        Doc: {conta.numero_documento}
                      </span>
                    </div>
                  )}

                  {/* Valor restante */}
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-500">
                        Valor Restante:
                      </span>
                      <span
                        className={`ml-2 text-lg font-semibold ${
                          valorRestante > 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {formatCurrency(valorRestante)}
                      </span>
                    </div>

                    {/* Ações */}
                    {conta.status !== "PAGO" &&
                      conta.status !== "CANCELADO" && (
                        <button
                          onClick={() => handlePayConta(conta)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                        >
                          <DollarSign className="w-4 h-4 mr-2" />
                          Pagar
                        </button>
                      )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredContas.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <DollarSign className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma conta encontrada
              </h3>
              <p className="text-gray-500">
                Não há contas a pagar que correspondam aos filtros selecionados.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showPayModal && selectedConta && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Registrar Pagamento
                </h3>
                <button
                  onClick={() => setShowPayModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor a Pagar
                  </label>
                  <input
                    type="text"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Forma de Pagamento
                  </label>
                  <select
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    {FORMAS_PAGAMENTO.map((forma) => (
                      <option key={forma.value} value={forma.value}>
                        {forma.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={observacoesPagamento}
                    onChange={(e) => setObservacoesPagamento(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações sobre o pagamento..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={processPayConta}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Conta */}
      {showAddModal && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Adicionar Conta a Pagar
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fornecedor *
                  </label>
                  <input
                    type="text"
                    value={formData.fornecedor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        fornecedor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nome do fornecedor"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <textarea
                    value={formData.descricao}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Conta de luz, aluguel, produto X..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor *
                  </label>
                  <input
                    type="text"
                    value={formData.valor}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        valor: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="R$ 0,00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    value={formData.data_vencimento}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        data_vencimento: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Parcelas
                  </label>
                  <select
                    value={formData.parcela}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        parcela: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="1">1x</option>
                    <option value="2">2x</option>
                    <option value="3">3x</option>
                    <option value="4">4x</option>
                    <option value="5">5x</option>
                    <option value="6">6x</option>
                    <option value="7">7x</option>
                    <option value="8">8x</option>
                    <option value="9">9x</option>
                    <option value="10">10x</option>
                    <option value="11">11x</option>
                    <option value="12">12x</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleSaveNewConta(formData)}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
