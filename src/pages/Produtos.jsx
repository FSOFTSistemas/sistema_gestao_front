import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Package,
  Barcode,
  DollarSign,
  AlertTriangle,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  Tag,
} from "lucide-react";
import { produtoService } from "../services/api";
import ProdutoModal from "../components/ProdutoModal";
import toast from "react-hot-toast";

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [produtoEditando, setProdutoEditando] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProdutos, setTotalProdutos] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    loadProdutos();
    loadCategorias();
  }, [
    currentPage,
    debouncedSearchTerm,
    filtroAtivo,
    filtroCategoria,
    filtroEstoqueBaixo,
  ]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de atraso pra evitar too many requests

    return () => clearTimeout(timeout); // limpa se o usuário digitar antes do tempo
  }, [searchTerm]);

  const loadProdutos = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        ativo: filtroAtivo === "todos" ? undefined : filtroAtivo === "ativos",
        categoria: filtroCategoria === "todas" ? undefined : filtroCategoria,
        estoque_baixo: filtroEstoqueBaixo || undefined,
      };

      const response = await produtoService.listar(params);

      if (response.status === 200) {
        setProdutos(response.data.produtos || []);
        setTotalPages(response.data.pagination?.totalPages || 1);
        setTotalProdutos(response.data.pagination?.total || 0);
      }
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
      if (response.success) {
        setCategorias(response.data || []);
      }
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const handleCreateProduto = () => {
    setProdutoEditando(null);
    setModalOpen(true);
  };

  const handleEditProduto = (produto) => {
    setProdutoEditando(produto);
    setModalOpen(true);
    setDropdownOpen(null);
  };

  const handleSaveProduto = async (data) => {
    try {
      setModalLoading(true);

      if (produtoEditando) {
        console.log("hellou my friend", produtoEditando);
        const response = await produtoService.atualizar(
          produtoEditando.id,
          data
        );
        console.log("A tal da resposta", response);
        if (response.success) {
          toast.success("Produto atualizado com sucesso!");
          loadProdutos();
          setModalOpen(false);
        }
      } else {
        const response = await produtoService.criar(data);
        if (response.success) {
          toast.success("Produto criado com sucesso!");
          loadProdutos();
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      const message = error.response?.data?.message || "Erro ao salvar produto";
      toast.error(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteProduto = async (produto) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o produto "${produto.nome}"?`
      )
    ) {
      try {
        const response = await produtoService.deletar(produto.id);
        if (response.success) {
          toast.success("Produto excluído com sucesso!");
          loadProdutos();
        }
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        const message =
          error.response?.data?.message || "Erro ao excluir produto";
        toast.error(message);
      }
    }
    setDropdownOpen(null);
  };

  const handleToggleStatus = async (produto) => {
    try {
      const response = await produtoService.toggleStatus(produto.id);
      if (response.success) {
        toast.success(
          `Produto ${produto.ativo ? "desativado" : "ativado"} com sucesso!`
        );
        loadProdutos();
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do produto");
    }
    setDropdownOpen(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filtro, value) => {
    if (filtro === "ativo") {
      setFiltroAtivo(value);
    } else if (filtro === "categoria") {
      setFiltroCategoria(value);
    } else if (filtro === "estoque_baixo") {
      setFiltroEstoqueBaixo(value);
    }
    setCurrentPage(1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const calcularMargem = (precoVenda, custo) => {
    if (custo > 0) {
      return (((precoVenda - custo) / custo) * 100).toFixed(1);
    }
    return "0.0";
  };

  const DropdownMenu = ({ produto, isOpen, onToggle }) => (
    <div className="relative inline-block text-left">
      <button
        onClick={onToggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="py-1">
            <button
              onClick={() => handleEditProduto(produto)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
            <button
              onClick={() => handleToggleStatus(produto)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            >
              {produto.ativo ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Desativar
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Ativar
                </>
              )}
            </button>
            <button
              onClick={() => handleDeleteProduto(produto)}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus produtos ({totalProdutos} total)
          </p>
        </div>
        <button
          onClick={handleCreateProduto}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Buscar por nome, código de barras ou categoria..."
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filtroAtivo}
                onChange={(e) => handleFilterChange("ativo", e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="todos">Todos</option>
                <option value="ativos">Ativos</option>
                <option value="inativos">Inativos</option>
              </select>
            </div>

            <select
              value={filtroCategoria}
              onChange={(e) => handleFilterChange("categoria", e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="todas">Todas as categorias</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </option>
              ))}
            </select>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filtroEstoqueBaixo}
                onChange={(e) =>
                  handleFilterChange("estoque_baixo", e.target.checked)
                }
                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">Estoque baixo</span>
            </label>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando produtos...</p>
          </div>
        ) : produtos.length === 0 ? (
          <div className="p-8 text-center">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum produto encontrado</p>
            <button
              onClick={handleCreateProduto}
              className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
            >
              Cadastrar primeiro produto
            </button>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preços
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
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
                {produtos.map((produto) => (
                  <tr key={produto.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <Package className="w-5 h-5 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {produto.nome}
                          </div>
                          {produto.codigo_barras && (
                            <div className="flex items-center text-sm text-gray-500">
                              <Barcode className="w-3 h-3 mr-1" />
                              {produto.codigo_barras}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(produto.preco_venda)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Custo: {formatCurrency(produto.custo)}
                        </div>
                        <div className="text-xs text-green-600">
                          Margem:{" "}
                          {calcularMargem(produto.preco_venda, produto.custo)}%
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <div
                          className={`text-sm font-medium ${
                            produto.estoque_baixo === true
                              ? "text-red-600"
                              : "text-gray-900"
                          }`}
                        >
                          {produto.estoque_atual} {produto.unidade}
                        </div>
                        <div className="text-xs text-gray-500">
                          Mín: {produto.estoque_minimo} {produto.unidade}
                        </div>
                        {produto.estoque_baixo === true && (
                          <div className="flex items-center text-xs text-red-600">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Estoque baixo
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {produto.categoria ? (
                        <div className="flex items-center text-sm text-gray-600">
                          <Tag className="w-4 h-4 mr-2" />
                          {produto.categoria.nome}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            produto.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {produto.ativo ? "Ativo" : "Inativo"}
                        </span>
                        {produto.estoque_baixo === true && (
                          <div className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Estoque baixo
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <DropdownMenu
                        produto={produto}
                        isOpen={dropdownOpen === produto.id}
                        onToggle={() =>
                          setDropdownOpen(
                            dropdownOpen === produto.id ? null : produto.id
                          )
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() =>
                        setCurrentPage(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Próximo
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Mostrando{" "}
                        <span className="font-medium">
                          {(currentPage - 1) * itemsPerPage + 1}
                        </span>{" "}
                        até{" "}
                        <span className="font-medium">
                          {Math.min(currentPage * itemsPerPage, totalProdutos)}
                        </span>{" "}
                        de <span className="font-medium">{totalProdutos}</span>{" "}
                        resultados
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() =>
                            setCurrentPage(Math.max(1, currentPage - 1))
                          }
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </button>

                        {/* Números das páginas */}
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const pageNum =
                              Math.max(
                                1,
                                Math.min(totalPages - 4, currentPage - 2)
                              ) + i;
                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  currentPage === pageNum
                                    ? "z-10 bg-orange-50 border-orange-500 text-orange-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage(
                              Math.min(totalPages, currentPage + 1)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      <ProdutoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        produto={produtoEditando}
        onSave={handleSaveProduto}
        loading={modalLoading}
        categorias={categorias}
      />

      {/* Overlay para fechar dropdown */}
      {dropdownOpen && (
        <div className=" inset-0 z-999" onClick={() => setDropdownOpen(null)} />
      )}
    </div>
  );
};

export default Produtos;
