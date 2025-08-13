import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Plus,
  Trash2,
  CreditCard,
  Package,
  DollarSign,
  ArrowLeft,
  Minus,
} from "lucide-react";
import { useCaixaContext } from "@/contexts/CaixaContextWeb";
import { usePDVContext } from "@/contexts/PDVContextWeb";

const PDVWeb = () => {
  const navigate = useNavigate();
  const { items, total, removeItem, updateItemQuantity, clearItems } =
    usePDVContext();
  const { caixaAberto, verificarCaixa } = useCaixaContext();

  // Verificar se há caixa aberto ao carregar
  useEffect(() => {
    const checkCaixa = async () => {
      const caixaStatus = await verificarCaixa();
      if (!caixaStatus) {
        toast.error("É necessário um caixa aberto para acessar o PDV");
        navigate("/caixas");
      }
    };
    checkCaixa();
  }, []);

  const handleAddProduct = () => {
    navigate("/pdv/produtos");
  };

  const handlePayment = () => {
    if (items?.length === 0) {
      toast.error("Adicione produtos antes de prosseguir para o pagamento");
      return;
    }
    navigate("/pdv/pagamento");
  };

  const handleRemoveItem = (itemId) => {
    removeItem(itemId);
    toast.success("Item removido do carrinho");
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateItemQuantity(itemId, newQuantity);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/")}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    PDV - Ponto de Venda
                  </h1>
                  <p className="text-sm text-gray-600">
                    {caixaAberto ? "Caixa Aberto" : "Verificando caixa..."}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(total)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Produtos */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    Produtos no Carrinho
                  </h2>
                  <button
                    onClick={handleAddProduct}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Adicionar Produto
                  </button>
                </div>
              </div>

              <div className="p-6">
                {!items || items.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <ShoppingCart className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Carrinho vazio
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Adicione produtos para começar uma nova venda
                    </p>
                    <button
                      onClick={handleAddProduct}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Adicionar Primeiro Produto
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-blue-600" />
                        </div>

                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {item.nome}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.preco_unitario)} por unidade
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-300">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  item.quantidade - 1
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-l-lg transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-3 py-2 text-sm font-medium text-gray-900 min-w-[3rem] text-center">
                              {item.quantidade}
                            </span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.id,
                                  item.quantidade + 1
                                )
                              }
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-r-lg transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="text-right min-w-[6rem]">
                            <p className="font-bold text-gray-900">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Resumo e Ações */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Resumo da Venda */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Resumo da Venda
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Itens:</span>
                    <span className="font-medium">{items?.length}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantidade Total:</span>
                    <span className="font-medium">
                      {items?.reduce((sum, item) => sum + item.quantidade, 0)}
                    </span>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex justify-between">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="space-y-4">
                  <button
                    onClick={handleAddProduct}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Adicionar Produtos
                  </button>

                  {items?.length > 0 && (
                    <button
                      onClick={() => {
                        if (
                          confirm("Tem certeza que deseja limpar o carrinho?")
                        ) {
                          clearItems();
                          toast.success("Carrinho limpo");
                        }
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                      Limpar Carrinho
                    </button>
                  )}

                  <button
                    onClick={handlePayment}
                    disabled={items?.length === 0}
                    className={`w-full flex items-center justify-center gap-2 px-4 py-4 rounded-lg font-semibold transition-colors ${
                      items?.length === 0
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-green-600 text-white hover:bg-green-700"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Finalizar Venda
                  </button>
                </div>
              </div>

              {/* Informações do Caixa */}
              {caixaAberto && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Caixa Aberto</span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Sistema pronto para vendas
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDVWeb;
