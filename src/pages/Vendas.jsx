import React, { useEffect, useState } from "react";
import { caixaService, empresaService, vendaService } from "../services/api";
import toast from "react-hot-toast";
import {
  Search,
  Filter,
  Eye,
  Printer,
  X,
  Calendar,
  DollarSign,
  User,
  MoreVertical,
  RefreshCw,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  FileText,
} from "lucide-react";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const { user } = useAuth();
  const [debouncedFiltro, setDebouncedFiltro] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todas");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    confirmadas: 0,
    canceladas: 0,
    valorTotal: 0,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedFiltro(filtro);
    }, 500); // 500ms de atraso pra evitar too many requests

    return () => clearTimeout(timeout); // limpa se o usuário digitar antes do tempo
  }, [filtro]);

  useEffect(() => {
    carregarVendas();
  }, [debouncedFiltro, filtroStatus, filtroDataInicio, filtroDataFim]);

  const carregarVendas = async () => {
    setLoading(true);
    try {
      // Ajusta data_fim para o final do dia, se informado
      let dataFimFinal = filtroDataFim
        ? new Date(filtroDataFim + "T23:59:59")
        : undefined;

      const response = await vendaService.listar({
        cliente: debouncedFiltro,
        status: filtroStatus !== "todas" ? filtroStatus : undefined,
        data_inicio: filtroDataInicio,
        data_fim: dataFimFinal ? dataFimFinal.toISOString() : undefined,
      });
      setVendas(response);
      calcularEstatisticas(response);
    } catch {
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };

  const calcularEstatisticas = (vendasData) => {
    const total = vendasData.length;
    const confirmadas = vendasData.filter(
      (v) => v.status.toLowerCase() === "confirmada"
    ).length;
    const canceladas = vendasData.filter(
      (v) => v.status.toLowerCase() === "cancelada"
    ).length;
    const valorTotal = vendasData
      .filter((v) => v.status.toLowerCase() !== "cancelada")
      .reduce((acc, v) => acc + v.total, 0);

    setStats({ total, confirmadas, canceladas, valorTotal });
  };

  const getFormaPagamentoLabel = (forma) => {
    const formas = {
      DINHEIRO: "Dinheiro",
      CARTAO_CREDITO: "Cartão Crédito",
      CARTAO_DEBITO: "Cartão Débito",
      PIX: "PIX",
      TRANSFERENCIA: "Transferência",
      BOLETO: "Boleto",
      CHEQUE: "Cheque",
    };
    return formas[forma] || forma;
  };

  function gerarFormaPagamentoKey(descricao) {
    return descricao
      .toLowerCase()
      .normalize("NFD") // remove acentos
      .replace(/[\u0300-\u036f]/g, "") // remove diacríticos
      .replace(/\bde\b/g, "") // remove palavra 'de' isolada
      .trim()
      .replace(/\s+/g, "-"); // troca espaços por hífen
  }

  const handleCancelarVenda = async (venda) => {
    // Verificar se a venda é do dia atual
    const vendaDate = new Date(venda.createdAt);
    const hoje = new Date();
    const isSameDay =
      vendaDate.getDate() === hoje.getDate() &&
      vendaDate.getMonth() === hoje.getMonth() &&
      vendaDate.getFullYear() === hoje.getFullYear();
    if (!isSameDay) {
      toast.error("Somente vendas do dia atual podem ser canceladas.");
      return;
    }

    if (confirm("Deseja cancelar esta venda?")) {
      try {
        await vendaService.atualizar(venda.id, {
          status: "CANCELADA",
          observacoes: `${
            venda.observacoes || ""
          } - Cancelada em ${new Date().toLocaleString("pt-BR")}`.trim(),
        });

        const caixaResponse = await caixaService.buscarDiaAtual();
        const caixaId = caixaResponse.id;
        if (caixaId) {
          const movimentosResponse = await caixaService.listarMovimentos({
            categoria: "cancelamento",
          });
          for (const forma of venda.VendaFormas) {
            const formaPagamentoKey = forma.forma_pagamento
              ? gerarFormaPagamentoKey(forma.forma_pagamento.descricao)
              : "";
            const movimentoCancelamento = movimentosResponse.movimentos.find(
              (m) => m.descricao === `cancelamento-${formaPagamentoKey}`
            );

            if (movimentoCancelamento) {
              const fluxoData = {
                descricao: `Cancelamento - ${getFormaPagamentoLabel(
                  forma.forma_pagamento.descricao
                )}`,
                valor: forma.valor,
                tipo: "cancelamento",
                caixa_id: caixaId,
                movimento_id: movimentoCancelamento.id,
              };
              await caixaService.cancelarVenda(fluxoData);
            } else {
              console.error(
                `Movimento de cancelamento para ${forma.forma_pagamento} não encontrado`
              );
            }
          }
        } else {
          console.error("Caixa não encontrado para o dia atual");
        }

        toast.success("Venda cancelada com sucesso");
        carregarVendas();
      } catch {
        toast.error("Erro ao cancelar venda");
      }
    }
  };

  const handleReimprimirVenda = async (id) => {
    try {
      // Busca os dados completos da venda para garantir que temos todos os detalhes
      const vendaDetalhes = await vendaService.buscarPorId(id);
      const empresa = await empresaService.buscarPorId(user.empresa_id);
      console.log(empresa);

      // Configura o documento PDF para 80mm de largura
      // O comprimento pode ser dinâmico. Começamos com um valor e o ajustamos.
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [80, 200], // Largura de 80mm, altura inicial
      });

      let y = 10; // Posição vertical inicial

      // --- Cabeçalho ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(empresa.fantasia, 40, y, { align: "center" });
      y += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`CNPJ: ${empresa.cnpj}`, 40, y, { align: "center" });
      y += 4;
      doc.text(`Endereço: ${empresa.endereco}`, 40, y, { align: "center" });
      y += 4;
      doc.text("--------------------------------------------------", 40, y, {
        align: "center",
      });
      y += 5;

      // --- Detalhes da Venda ---
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.text(`CUPOM NÃO FISCAL - VENDA #${vendaDetalhes.id}`, 40, y, {
        align: "center",
      });
      y += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.text(`Data: ${formatDate(vendaDetalhes.data_venda)}`, 5, y);
      y += 4;
      doc.text(
        `Cliente: ${vendaDetalhes.cliente?.nome || "Não informado"}`,
        5,
        y
      );
      y += 6;

      // --- Itens da Venda ---
      doc.setFont("helvetica", "bold");
      doc.text("Qtd.  Descrição", 5, y);
      doc.text("Vl. Unit.  Vl. Total", 75, y, { align: "right" });
      y += 4;
      doc.line(5, y, 75, y); // Linha separadora
      y += 4;

      doc.setFont("helvetica", "normal");
      vendaDetalhes.itens.forEach((item) => {
        const nomeProduto = item.produto.nome;
        const linhaProduto = `${item.quantidade} x ${nomeProduto}`;

        // Quebra de linha para nomes de produtos longos
        const linhasTexto = doc.splitTextToSize(linhaProduto, 45); // 45mm de largura máxima

        doc.text(linhasTexto, 5, y);

        doc.text(formatCurrency(item.preco_unitario), 75, y, {
          align: "right",
        });
        y += linhasTexto.length > 1 ? 6 : 4; // Ajusta o espaçamento se houver quebra de linha

        doc.text(formatCurrency(item.subtotal), 75, y, { align: "right" });
        y += 5;
      });

      doc.line(5, y, 75, y); // Linha separadora
      y += 5;

      // --- Totais ---
      doc.setFont("helvetica", "bold");
      doc.text("Subtotal:", 5, y);
      doc.text(formatCurrency(vendaDetalhes.total), 75, y, { align: "right" });
      y += 5;

      doc.text("Descontos:", 5, y);
      doc.text(formatCurrency(vendaDetalhes.desconto || 0), 75, y, {
        align: "right",
      });
      y += 6;

      doc.setFontSize(10);
      doc.text("TOTAL:", 5, y);
      doc.text(
        formatCurrency(vendaDetalhes.total - (vendaDetalhes.desconto || 0)),
        75,
        y,
        {
          align: "right",
        }
      );
      y += 6;

      // --- Formas de Pagamento ---
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.line(5, y, 75, y);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Forma(s) de Pagamento:", 5, y);
      y += 4;

      doc.setFont("helvetica", "normal");
      vendaDetalhes.VendaFormas.forEach((forma) => {
        const formaLabel = getFormaPagamentoLabel(
          forma.forma_pagamento.descricao
        );
        doc.text(formaLabel, 5, y);
        doc.text(formatCurrency(forma.valor), 75, y, { align: "right" });
        y += 4;
      });

      // --- Rodapé ---
      y += 6;
      doc.text("--------------------------------------------------", 40, y, {
        align: "center",
      });
      y += 4;
      doc.setFontSize(7);
      doc.text("Obrigado pela preferência!", 40, y, { align: "center" });

      // Abre o PDF em uma nova guia
      doc.output("dataurlnewwindow");
    } catch (error) {
      console.error("Erro ao gerar PDF da venda:", error);
      toast.error("Não foi possível gerar a reimpressão da venda.");
    }
  };

  const handleVisualizarVenda = (id) => {
    // Implementação da visualização: redireciona para uma página de detalhes da venda
    window.location.href = `/vendas/detalhes/${id}`;
  };

  // const handleExportExcel = async () => {
  //   try {
  //     // Implementar a lógica de exportação para Excel
  //   } catch (error) {
  //     console.error("Erro ao exportar para Excel:", error);
  //     toast.error("Erro ao exportar dados para Excel.");
  //   }
  // };

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmada":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelada":
        return <X className="w-4 h-4 text-red-500" />;
      case "pendente":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case "confirmada":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "cancelada":
        return `${baseClasses} bg-red-100 text-red-800`;
      case "pendente":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const limparFiltros = () => {
    setFiltro("");
    setFiltroStatus("todas");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                Vendas
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie e acompanhe suas vendas
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={carregarVendas}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Atualizar
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showFilters
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total de Vendas
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Confirmadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.confirmadas}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Canceladas</p>
                <p className="text-2xl font-bold text-red-600">
                  {stats.canceladas}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <X className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Valor Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(stats.valorTotal)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Cliente
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome do cliente..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filtroStatus}
                  onChange={(e) => setFiltroStatus(e.target.value)}
                >
                  <option value="todas">Todas</option>
                  <option value="CONFIRMADA">Confirmadas</option>
                  <option value="PENDENTE">Pendentes</option>
                  <option value="CANCELADA">Canceladas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Início
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filtroDataInicio}
                    onChange={(e) => setFiltroDataInicio(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Fim
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={filtroDataFim}
                    onChange={(e) => setFiltroDataFim(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-end">
                <button
                  onClick={limparFiltros}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Limpar Filtros
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabela de Vendas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Lista de Vendas
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Carregando vendas...</p>
              </div>
            </div>
          ) : vendas && vendas.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Nenhuma venda encontrada
              </h3>
              <p className="text-gray-600 mb-4">
                {filtro ||
                filtroStatus !== "todas" ||
                filtroDataInicio ||
                filtroDataFim
                  ? "Tente ajustar os filtros para encontrar vendas."
                  : "Quando você realizar vendas, elas aparecerão aqui."}
              </p>
              {(filtro ||
                filtroStatus !== "todas" ||
                filtroDataInicio ||
                filtroDataFim) && (
                <button
                  onClick={limparFiltros}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendas.map((venda) => (
                    <tr
                      key={venda.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              #{venda.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {venda.cliente?.nome || "Cliente não informado"}
                            </div>
                            {venda.cliente?.email && (
                              <div className="text-sm text-gray-500">
                                {venda.cliente.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {formatDate(venda.data_venda)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm font-medium text-gray-900">
                          <DollarSign className="w-4 h-4 text-green-500 mr-1" />
                          {formatCurrency(venda.total)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getStatusBadge(venda.status)}>
                          {getStatusIcon(venda.status)}
                          {venda.status?.charAt(0).toUpperCase() +
                            venda.status?.slice(1) || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="absolute">
                          <button
                            onClick={() =>
                              setDropdownOpen(
                                dropdownOpen === venda.id ? null : venda.id
                              )
                            }
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {dropdownOpen === venda.id && (
                            <>
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                  <button
                                    onClick={() => {
                                      handleVisualizarVenda(venda.id);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Visualizar
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleReimprimirVenda(venda.id);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                  >
                                    <Printer className="w-4 h-4" />
                                    Reimprimir
                                  </button>
                                  <hr className="my-1" />
                                  <button
                                    onClick={() => {
                                      handleCancelarVenda(venda);
                                      setDropdownOpen(null);
                                    }}
                                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                    disabled={venda.status === "cancelada"}
                                  >
                                    <X className="w-4 h-4" />
                                    Cancelar Venda
                                  </button>
                                </div>
                              </div>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setDropdownOpen(null)}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer com informações adicionais */}
        {vendas.length > 0 && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Mostrando {vendas.length} vendas</span>
                <span>•</span>
                <span>
                  Última atualização: {new Date().toLocaleTimeString("pt-BR")}
                </span>
              </div>
              {/* <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Exportar Excel
                </button>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Vendas;
