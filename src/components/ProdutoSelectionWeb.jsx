import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePDVContext } from "../contexts/PDVContextWeb";
import { produtoService } from "../services/api";
import toast from "react-hot-toast";
import {
  Search,
  Package,
  ArrowLeft,
  Plus,
  Minus,
  ShoppingCart,
  Barcode,
  Filter,
  X,
} from "lucide-react";

const ProdutoSelectionWeb = () => {
  const navigate = useNavigate();
  const { addItem } = usePDVContext();

  const [produtos, setProdutos] = useState([]);
  const [filteredProdutos, setFilteredProdutos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [quantidade, setQuantidade] = useState(1);
  const [precoUnitario, setPrecoUnitario] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState("");
  const [categorias, setCategorias] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProdutos();
    loadCategorias();
  }, []);

  useEffect(() => {
    filterProdutos();
  }, [searchText, produtos, categoriaFilter]);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const response = await produtoService.listar();
      const res = response.data.produtos;
      const produtosAtivos = res.filter((produto) => produto.ativo);
      setProdutos(produtosAtivos);
      setFilteredProdutos(produtosAtivos);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  };

  const loadCategorias = async () => {
    try {
      const response = await produtoService.listarCategorias();
      setCategorias(response);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const filterProdutos = () => {
    let filtered = [...produtos];

    // Filtro por texto
    if (searchText.trim()) {
      filtered = filtered.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchText.toLowerCase()) ||
          produto.codigo_barras?.includes(searchText) ||
          produto.categoria?.nome
            .toLowerCase()
            .includes(searchText.toLowerCase())
      );
    }

    // Filtro por categoria
    if (categoriaFilter) {
      filtered = filtered.filter(
        (produto) => produto.categoria?.id === parseInt(categoriaFilter)
      );
    }

    setFilteredProdutos(filtered);
  };

  const handleSelectProduct = (produto) => {
    setSelectedProduct(produto);
    setQuantidade(1);
    setPrecoUnitario(produto.preco_venda.toString());
    setShowModal(true);
  };

  const handleAddProduct = () => {
    if (!selectedProduct || quantidade <= 0 || parseFloat(precoUnitario) <= 0) {
      toast.error("Verifique os dados do produto");
      return;
    }

    addItem(selectedProduct, quantidade, parseFloat(precoUnitario));
    setShowModal(false);
    toast.success("Produto adicionado ao carrinho");
    navigate("/pdv");
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const clearFilters = () => {
    setSearchText("");
    setCategoriaFilter("");
    setShowFilters(false);
  };

  const total = quantidade * parseFloat(precoUnitario || "0");

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
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Selecionar Produtos
                  </h1>
                  <p className="text-sm text-gray-600">
                    Escolha os produtos para adicionar ao carrinho
                  </p>
                </div>
              </div>
            </div>
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buscar Produto
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Nome, código de barras..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                  {searchText && (
                    <button
                      onClick={() => setSearchText("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {showFilters && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categoria
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={categoriaFilter}
                      onChange={(e) => setCategoriaFilter(e.target.value)}
                    >
                      <option value="">Todas as categorias</option>
                      {categorias.map((categoria) => (
                        <option key={categoria.id} value={categoria.id}>
                          {categoria.nome}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button
                      onClick={clearFilters}
                      className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Limpar Filtros
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Produtos Disponíveis ({filteredProdutos.length})
            </h2>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Carregando produtos...</p>
                </div>
              </div>
            ) : filteredProdutos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchText || categoriaFilter
                    ? "Tente ajustar os filtros para encontrar produtos."
                    : "Nenhum produto disponível no momento."}
                </p>
                {(searchText || categoriaFilter) && (
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Limpar Filtros
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProdutos.map((produto) => (
                  <div
                    key={produto.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectProduct(produto)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-blue-600" />
                      </div>
                      <span className="text-lg font-bold text-green-600">
                        {formatCurrency(produto.preco_venda)}
                      </span>
                    </div>

                    <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                      {produto.nome}
                    </h3>

                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{produto.categoria?.nome}</p>
                      <p>Unidade: {produto.unidade}</p>
                      {produto.codigo_barras && (
                        <div className="flex items-center gap-1">
                          <Barcode className="w-3 h-3" />
                          <span className="text-xs">
                            {produto.codigo_barras}
                          </span>
                        </div>
                      )}
                    </div>

                    <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      Selecionar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Configuração do Produto */}
      {showModal && selectedProduct && (
        <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {selectedProduct.nome}
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">
                    Preço original:{" "}
                    {formatCurrency(selectedProduct.preco_venda)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedProduct.categoria?.nome} •{" "}
                    {selectedProduct.unidade}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preço Unitário
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={precoUnitario}
                    onChange={(e) => setPrecoUnitario(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantidade(Math.max(1, quantidade - 1))}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 text-center font-medium min-w-[4rem]">
                      {quantidade}
                    </span>
                    <button
                      onClick={() => setQuantidade(quantidade + 1)}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">
                      Total:
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      {formatCurrency(total)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddProduct}
                  disabled={quantidade <= 0 || parseFloat(precoUnitario) <= 0}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Adicionar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProdutoSelectionWeb;
