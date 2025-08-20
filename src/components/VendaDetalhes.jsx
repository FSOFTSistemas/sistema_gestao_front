import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { empresaService, vendaService } from "../services/api";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Package,
  CreditCard,
  FileText,
  Printer,
  Download,
  CheckCircle,
  X,
  Clock,
  AlertCircle,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { useAuth } from "@/contexts/AuthContext";

const VendaDetalhes = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venda, setVenda] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarVenda();
  }, [id]);

  const carregarVenda = async () => {
    setLoading(true);
    try {
      const response = await vendaService.buscarPorId(id);
      setVenda(response);
    } catch (error) {
      console.error("Erro ao carregar venda:", error);
      toast.error("Erro ao carregar detalhes da venda");
      navigate("/vendas");
    } finally {
      setLoading(false);
    }
  };

  // const gerarPdf = () => {
  //   const doc = new jsPDF();

  //   // Header
  //   doc.setFontSize(16);
  //   doc.text(`Venda Nº ${venda.id}`, 10, 15);

  //   doc.setFontSize(12);
  //   doc.text(`Cliente: ${venda.cliente?.nome || "Não informado"}`, 10, 25);
  //   const dataVenda = new Date(venda.data_venda).toLocaleDateString();
  //   doc.text(`Data: ${dataVenda}`, 10, 32);
  //   doc.text(`Total: R$ ${Number(venda.total).toFixed(2)}`, 150, 25, {
  //     align: "right",
  //   });

  //   // Linha separadora
  //   doc.setLineWidth(0.5);
  //   doc.line(10, 35, 200, 35);

  //   // Títulos da tabela de produtos
  //   doc.setFont(undefined, "bold");
  //   doc.text("Produto", 10, 43);
  //   doc.text("Qtd", 100, 43, { align: "right" });
  //   doc.text("Valor Unit.", 120, 43, { align: "right" });
  //   doc.text("Subtotal", 180, 43, { align: "right" });
  //   doc.setFont(undefined, "normal");

  //   // Produtos
  //   let y = 50;
  //   venda.itens.forEach((item) => {
  //     const nomeProduto = item.produto?.nome || "Produto desconhecido";
  //     const quantidade = item.quantidade || 0;
  //     const valorUnit = Number(item.preco_unitario || 0);
  //     const subtotal = quantidade * valorUnit;

  //     doc.text(nomeProduto, 10, y);
  //     doc.text(String(quantidade), 100, y, { align: "right" });
  //     doc.text(`R$ ${valorUnit.toFixed(2)}`, 120, y, { align: "right" });
  //     doc.text(`R$ ${subtotal.toFixed(2)}`, 180, y, { align: "right" });

  //     y += 8;
  //   });

  //   // Linha separadora antes das formas de pagamento
  //   doc.line(10, y, 200, y);
  //   y += 10;

  //   // Formas de pagamento
  //   doc.setFont(undefined, "bold");
  //   doc.text("Formas de Pagamento:", 10, y);
  //   doc.setFont(undefined, "normal");
  //   y += 8;

  //   venda.VendaFormas.forEach((fp) => {
  //     const nomeForma = fp.forma_pagamento?.descricao || "Forma desconhecida";
  //     const valorPago = Number(fp.valor || 0);
  //     doc.text(`${nomeForma}: R$ ${valorPago.toFixed(2)}`, 10, y);
  //     y += 8;
  //   });

  //   doc.save(`venda_${id}.pdf`);
  // };

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

  const handleReimprimirVenda = async (id) => {
    try {
      // Busca os dados completos da venda para garantir que temos todos os detalhes
      const vendaDetalhes = await vendaService.buscarPorId(id);
      const empresa = await empresaService.buscarPorId(user.empresa_id);

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
      //
      // LINHA DO CABEÇALHO CORRIGIDA
      //
      doc.text("Vl. Unit.", 60, y, { align: "right" }); // Coluna para Valor Unitário
      doc.text("Vl. Total", 75, y, { align: "right" }); // Coluna para Valor Total
      y += 4;
      doc.line(5, y, 75, y); // Linha separadora
      y += 4;

      doc.setFont("helvetica", "normal");
      vendaDetalhes.itens.forEach((item) => {
        const nomeProduto = item.produto.nome;
        // Ajuste a largura máxima do texto para não invadir as colunas de preço
        const linhasTexto = doc.splitTextToSize(nomeProduto, 45); // Largura máxima do nome do produto

        // Escreve a quantidade e a descrição
        doc.text(`${item.quantidade} x `, 5, y);
        doc.text(linhasTexto, 20, y); // Começa a descrição um pouco depois da quantidade

        //
        // LINHAS DOS ITENS CORRIGIDAS
        //
        doc.text(formatCurrency(item.preco_unitario), 60, y, {
          align: "right",
        }); // Valor unitário na sua coluna
        doc.text(formatCurrency(item.subtotal), 75, y, { align: "right" }); // Valor total na sua coluna

        // Ajusta o 'y' para a próxima linha, considerando a quebra de linha da descrição
        y += linhasTexto.length * 4 + 2;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "confirmada":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "cancelada":
        return <X className="w-5 h-5 text-red-500" />;
      case "pendente":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const baseClasses =
      "inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando detalhes da venda...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!venda) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Venda não encontrada
            </h3>
            <p className="text-gray-600 mb-4">
              A venda solicitada não foi encontrada.
            </p>
            <button
              onClick={() => navigate("/vendas")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Voltar para Vendas
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate("/vendas")}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Detalhes da Venda #{venda.id}
              </h1>
              <p className="text-gray-600 mt-1">
                Informações completas da venda
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className={getStatusBadge(venda.status)}>
              {getStatusIcon(venda.status)}
              {venda.status?.charAt(0).toUpperCase() + venda.status?.slice(1) ||
                "N/A"}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleReimprimirVenda(venda.id)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Reimprimir
              </button>
            </div>
          </div>
        </div>

        {/* Informações Gerais */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Informações da Venda
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Data da Venda</p>
                  <p className="font-medium">{formatDate(venda.data_venda)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <DollarSign className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Valor Total</p>
                  <p className="font-medium text-lg text-green-600">
                    {formatCurrency(venda.total)}
                  </p>
                </div>
              </div>
              {venda.desconto > 0 && (
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Desconto</p>
                    <p className="font-medium text-red-600">
                      {formatCurrency(venda.desconto)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informações do Cliente
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nome</p>
                <p className="font-medium">
                  {venda.cliente?.nome || "Cliente não informado"}
                </p>
              </div>
              {venda.cliente?.email && (
                <div>
                  <p className="text-sm text-gray-600">E-mail</p>
                  <p className="font-medium">{venda.cliente.email}</p>
                </div>
              )}
              {venda.cliente?.telefone && (
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium">{venda.cliente.telefone}</p>
                </div>
              )}
              {venda.observacoes && (
                <div>
                  <p className="text-sm text-gray-600">Observações</p>
                  <p className="font-medium">{venda.observacoes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Itens da Venda */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Itens da Venda
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Unitário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {venda.itens?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.produto?.nome || "Produto não encontrado"}
                      </div>
                      {item.produto?.categoria && (
                        <div className="text-sm text-gray-500">
                          {item.produto.categoria}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(item.preco_unitario)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.quantidade * item.preco_unitario)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Formas de Pagamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Formas de Pagamento
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {venda.VendaFormas?.map((forma, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      {forma.forma_pagamento.descricao
                        ?.replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                  </div>
                  <span className="font-bold text-green-600">
                    {formatCurrency(forma.valor)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendaDetalhes;
