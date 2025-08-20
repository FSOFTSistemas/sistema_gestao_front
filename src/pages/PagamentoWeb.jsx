import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePDVContext } from "../contexts/PDVContextWeb";
import {
  vendaService,
  formasPagamentoService,
  clienteService,
  caixaService,
  empresaService,
} from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  CreditCard,
  DollarSign,
  Plus,
  Trash2,
  FileText,
  Printer,
  CheckCircle,
  AlertCircle,
  User,
  Calendar,
  Package,
} from "lucide-react";
import jsPDF from "jspdf";
import { useAuth } from "@/contexts/AuthContext";

const PagamentoWeb = () => {
  const navigate = useNavigate();
  const { items, total, clearItems } = usePDVContext();
  const { user } = useAuth();

  const [formasPagamento, setFormasPagamento] = useState([]);
  const [pagamentosAdicionados, setPagamentosAdicionados] = useState([]);
  const [valorRestante, setValorRestante] = useState(total);
  const [showModalPagamento, setShowModalPagamento] = useState(false);
  const [formaSelecionada, setFormaSelecionada] = useState(null);
  const [valorPagamento, setValorPagamento] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModalFinalizacao, setShowModalFinalizacao] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [showModalCrediario, setShowModalCrediario] = useState(false);
  const [crediarioData, setCrediarioData] = useState({
    valor: "",
    parcelas: "1",
    dataVencimento: "",
    clienteId: "",
    descricao: "",
    observacoes: "",
  });

  useEffect(() => {
    if (items.length === 0) {
      toast.error("Carrinho vazio! Adicione produtos antes de prosseguir.");
      navigate("/pdv");
      return;
    }
    loadFormasPagamento();
    loadClientes();
  }, []);

  useEffect(() => {
    const totalPago = pagamentosAdicionados.reduce(
      (sum, pag) => sum + pag.valor,
      0
    );
    setValorRestante(Number((total - totalPago).toFixed(2)));
  }, [pagamentosAdicionados, total]);

  const loadFormasPagamento = async () => {
    try {
      const response = await formasPagamentoService.listar();
      const ativas = response.filter((forma) => forma.ativo);
      setFormasPagamento(ativas);
    } catch (error) {
      console.error("Erro ao carregar formas de pagamento:", error);
      toast.error("Erro ao carregar formas de pagamento");
    }
  };

  const loadClientes = async () => {
    try {
      const response = await clienteService.listar();
      setClientes(response.clientes);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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
    // Se a forma já for um texto (como vindo do crediário), use-a.
    // Senão, procure no mapeamento.
    return formas[forma] || forma;
  };

  const handleSelecionarForma = (forma) => {
    setFormaSelecionada(forma);
    if (forma.descricao.toLowerCase() === "crediário") {
      setCrediarioData((prev) => ({
        ...prev,
        valor: valorRestante.toFixed(2),
      }));
      setShowModalCrediario(true);
    } else {
      setValorPagamento(valorRestante.toFixed(2));
      setShowModalPagamento(true);
    }
  };

  const handleAdicionarPagamento = () => {
    if (!formaSelecionada) {
      toast.error("Selecione uma forma de pagamento");
      return;
    }

    const valor = parseFloat(valorPagamento.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    if (valor > valorRestante) {
      toast.error(
        `Valor não pode ser maior que ${formatCurrency(valorRestante)}`
      );
      return;
    }

    const novoPagamento = {
      id: `${formaSelecionada.id}_${Date.now()}`,
      forma: formaSelecionada,
      valor,
    };

    setPagamentosAdicionados((prev) => [...prev, novoPagamento]);
    setValorPagamento("");
    setShowModalPagamento(false);
    toast.success("Pagamento adicionado");
  };

  const handleAdicionarCrediario = () => {
    const valor = parseFloat(crediarioData.valor.replace(",", "."));
    if (isNaN(valor) || valor <= 0) {
      toast.error("Digite um valor válido");
      return;
    }

    if (!crediarioData.clienteId) {
      toast.error("Selecione um cliente");
      return;
    }

    if (!crediarioData.dataVencimento) {
      toast.error("Selecione a data de vencimento");
      return;
    }

    const novoPagamento = {
      id: `crediario_${Date.now()}`,
      forma: formaSelecionada,
      valor,
      crediario: crediarioData,
    };

    setPagamentosAdicionados((prev) => [...prev, novoPagamento]);
    setShowModalCrediario(false);
    toast.success("Crediário adicionado");
  };

  const handleRemoverPagamento = (id) => {
    setPagamentosAdicionados((prev) => prev.filter((pag) => pag.id !== id));
    toast.success("Pagamento removido");
  };

  const handleFinalizarVenda = () => {
    if (valorRestante > 0) {
      toast.error("O pagamento deve ser igual ao valor total da venda");
      return;
    }
    setShowModalFinalizacao(true);
  };

  const processarVenda = async (emitirNota = false) => {
    setLoading(true);
    try {
      // Preparar dados da venda
      const vendaData = {
        total,
        desconto: 0,
        status: "CONFIRMADA",
        observacoes: emitirNota ? "Nota fiscal emitida" : "Sem nota fiscal",
        itens: items.map((item) => ({
          produto_id: item.produto_id,
          quantidade: item.quantidade,
          preco_unitario: item.preco_unitario,
          subtotal: item.subtotal,
        })),
        formas_pagamento: pagamentosAdicionados.map((pag) => ({
          forma_pagamento_id: pag.forma.id,
          valor: pag.valor,
        })),
      };

      // Salvar venda
      const response = await vendaService.criar(vendaData);
      const vendaId = response.venda.id;

      // Deduzir estoque
      await Promise.all(
        items.map((item) =>
          vendaService.deduzirEstoque(item.produto_id, item.quantidade)
        )
      );

      // Criar fluxo no caixa (exceto crediário)
      await Promise.all(
        pagamentosAdicionados
          .filter((pag) => pag.forma.descricao.toLowerCase() !== "crediário")
          .map((pag) =>
            caixaService.criarFluxoVenda({
              venda_id: vendaId,
              forma_pagamento: pag.forma.descricao,
              valor: pag.valor,
            })
          )
      );

      // Processar crediário
      const crediarioPayment = pagamentosAdicionados.find(
        (pag) => pag.forma.descricao.toLowerCase() === "crediário"
      );

      if (crediarioPayment) {
        await vendaService.criarContaReceber({
          parcela: parseInt(crediarioPayment.crediario.parcelas),
          cliente_id: crediarioPayment.crediario.clienteId,
          descricao: crediarioPayment.crediario.descricao,
          observacoes: crediarioPayment.crediario.observacoes,
          data_vencimento: crediarioPayment.crediario.dataVencimento,
          valor: crediarioPayment.valor,
        });
      }

      toast.success("Venda finalizada com sucesso!");

      // Gerar comprovante
      gerarComprovante(vendaId);

      // Limpar carrinho e voltar
      clearItems();
      navigate("/pdv");
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      toast.error("Erro ao finalizar venda");
    } finally {
      setLoading(false);
      setShowModalFinalizacao(false);
    }
  };

  const gerarComprovante = async (vendaId) => {
    const empresa = await empresaService.buscarPorId(user.empresa_id);
    // Procura se a venda foi no crediário para pegar o nome do cliente
    const pagamentoCrediario = pagamentosAdicionados.find(
      (pag) => pag.forma.descricao.toLowerCase() === "crediário"
    );
    let nomeCliente = "Não informado";
    if (pagamentoCrediario) {
      const clienteInfo = clientes.find(
        (c) => c.id === parseInt(pagamentoCrediario.crediario.clienteId)
      );
      if (clienteInfo) {
        nomeCliente = clienteInfo.nome;
      }
    }

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [80, 250], // Largura de 80mm, altura inicial
    });

    let y = 10;

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
    doc.text(`CUPOM NÃO FISCAL - VENDA #${vendaId}`, 40, y, {
      align: "center",
    });
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text(`Data: ${formatDate(new Date())}`, 5, y);
    y += 4;
    doc.text(`Cliente: ${nomeCliente}`, 5, y);
    y += 6;

    // --- Itens da Venda ---
    doc.setFont("helvetica", "bold");
    doc.text("Qtd.  Descrição", 5, y);
    doc.text("Vl. Unit.", 60, y, { align: "right" });
    doc.text("Vl. Total", 75, y, { align: "right" });
    y += 4;
    doc.line(5, y, 75, y);
    y += 4;

    doc.setFont("helvetica", "normal");
    items.forEach((item) => {
      const nomeProduto = item.nome;
      const linhasTexto = doc.splitTextToSize(nomeProduto, 40);

      doc.text(`${item.quantidade} x `, 5, y);
      doc.text(linhasTexto, 12, y);

      doc.text(formatCurrency(item.preco_unitario), 60, y, { align: "right" });
      doc.text(formatCurrency(item.subtotal), 75, y, { align: "right" });

      y += linhasTexto.length * 4 + 2;
    });

    doc.line(5, y, 75, y);
    y += 5;

    // --- Totais ---
    doc.setFont("helvetica", "bold");
    doc.text("Subtotal:", 5, y);
    doc.text(formatCurrency(total), 75, y, { align: "right" });
    y += 5;

    // (Você pode adicionar lógica de desconto aqui se necessário)

    doc.setFontSize(10);
    doc.text("TOTAL:", 5, y);
    doc.text(formatCurrency(total), 75, y, { align: "right" });
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
    pagamentosAdicionados.forEach((pag) => {
      const formaLabel = getFormaPagamentoLabel(pag.forma.descricao);
      doc.text(formaLabel, 5, y);
      doc.text(formatCurrency(pag.valor), 75, y, { align: "right" });
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
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getIconForTipo = (tipo) => {
    switch (tipo) {
      case "dinheiro":
        return DollarSign;
      case "cartao_credito":
      case "cartao_debito":
        return CreditCard;
      case "pix":
        return FileText;
      default:
        return CreditCard;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/pdv")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Pagamento</h1>
                  <p className="text-sm text-gray-600">
                    Finalize a venda escolhendo as formas de pagamento
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumo da Venda */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Resumo dos Itens */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Resumo da Venda
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex justify-between items-center py-2"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.nome}
                          </p>
                          <p className="text-sm text-gray-600">
                            {item.quantidade} x{" "}
                            {formatCurrency(item.preco_unitario)}
                          </p>
                        </div>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </div>
                    ))}
                    <hr className="border-gray-200" />
                    <div className="flex justify-between items-center py-2">
                      <span className="text-lg font-semibold text-gray-900">
                        Total:
                      </span>
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(total)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formas de Pagamento */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Formas de Pagamento
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {formasPagamento.map((forma) => {
                      const IconComponent = getIconForTipo(forma.tipo);
                      return (
                        <button
                          key={forma.id}
                          onClick={() => handleSelecionarForma(forma)}
                          className="flex flex-col items-center gap-3 p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                        >
                          <IconComponent className="w-8 h-8 text-gray-600" />
                          <span className="text-sm font-medium text-gray-900">
                            {forma.descricao}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Pagamentos Adicionados */}
              {pagamentosAdicionados.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Pagamentos Adicionados
                    </h2>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {pagamentosAdicionados.map((pagamento) => (
                        <div
                          key={pagamento.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-600" />
                            <span className="font-medium text-gray-900">
                              {pagamento.forma.descricao}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-green-600">
                              {formatCurrency(pagamento.valor)}
                            </span>
                            <button
                              onClick={() =>
                                handleRemoverPagamento(pagamento.id)
                              }
                              className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resumo de Pagamento */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Resumo do Pagamento
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total da Venda:</span>
                  <span className="font-medium">{formatCurrency(total)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Pago:</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(total - valorRestante)}
                  </span>
                </div>

                <hr className="border-gray-200" />

                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">
                    Restante:
                  </span>
                  <span
                    className={`text-2xl font-bold ${
                      valorRestante > 0 ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {formatCurrency(valorRestante)}
                  </span>
                </div>
              </div>

              {valorRestante <= 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Pagamento completo!</span>
                  </div>

                  <button
                    onClick={handleFinalizarVenda}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5" />
                    )}
                    Finalizar Venda
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-3 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Adicione mais pagamentos</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Pagamento */}
      {showModalPagamento && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {formaSelecionada?.descricao}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor do Pagamento
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    placeholder="0,00"
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    Valor restante: {formatCurrency(valorRestante)}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalPagamento(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdicionarPagamento}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Crediário */}
      {showModalCrediario && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Configurar Crediário
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={crediarioData.valor}
                    onChange={(e) =>
                      setCrediarioData((prev) => ({
                        ...prev,
                        valor: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={crediarioData.clienteId}
                    onChange={(e) =>
                      setCrediarioData((prev) => ({
                        ...prev,
                        clienteId: e.target.value,
                      }))
                    }
                  >
                    <option value="">Selecione um cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nome}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Parcelas
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={crediarioData.parcelas}
                    onChange={(e) =>
                      setCrediarioData((prev) => ({
                        ...prev,
                        parcelas: e.target.value,
                      }))
                    }
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                      <option key={num} value={num}>
                        {num}x
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={crediarioData.dataVencimento}
                    onChange={(e) =>
                      setCrediarioData((prev) => ({
                        ...prev,
                        dataVencimento: e.target.value,
                      }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={crediarioData.descricao}
                    onChange={(e) =>
                      setCrediarioData((prev) => ({
                        ...prev,
                        descricao: e.target.value,
                      }))
                    }
                    placeholder="Descrição da conta"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observações
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    value={crediarioData.observacoes}
                    onChange={(e) =>
                      setCrediarioData((prev) => ({
                        ...prev,
                        observacoes: e.target.value,
                      }))
                    }
                    placeholder="Observações adicionais"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModalCrediario(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdicionarCrediario}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Finalização */}
      {showModalFinalizacao && (
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Finalizar Venda
              </h3>

              <p className="text-gray-600 mb-6">
                Deseja emitir nota fiscal para esta venda?
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => processarVenda(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Sem Nota Fiscal
                </button>
                <button
                  onClick={() => processarVenda(true)}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <FileText className="w-4 h-4" />
                  Com Nota Fiscal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PagamentoWeb;
