import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Users,
  Mail,
  Phone,
  MapPin,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { empresaService, usuarioService } from "../services/api";
import UsuarioModal from "../components/UsuarioMasterModal";
import toast from "react-hot-toast";

const UsuariosMaster = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filtroAtivo, setFiltroAtivo] = useState("todos");
  const [empresas, setEmpresas] = useState([]);

  const itemsPerPage = 10;

  useEffect(() => {
    loadUsuarios();
    loadEmpresas();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de atraso pra evitar too many requests

    return () => clearTimeout(timeout); // limpa se o usuário digitar antes do tempo
  }, [searchTerm]);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        ativo:
          filtroAtivo === "todos"
            ? null
            : filtroAtivo === "ativos"
            ? true
            : false,
      };
      console.log("Carregando usuarios com parâmetros:", params);
      const usuarioResponse = await usuarioService.listar(params);
      console.log("Resposta do serviço de usuarios:", usuarioResponse.usuarios);
      const response = usuarioResponse.usuarios;
      console.log("Usuarios carregados:", response);

      setUsuarios(response || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalUsuarios(response.length);
    } catch (error) {
      console.error("Erro ao carregar usuarios:", error);
      toast.error("Erro ao carregar usuarios");
    } finally {
      setLoading(false);
    }
  };

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const response = await empresaService.listar();
      console.log("Empresas carregadas:", response.dados);
      setEmpresas(response.dados || []);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUsuario = () => {
    setUsuarioEditando(null);
    setModalOpen(true);
  };

  const handleEditUsuario = (usuario) => {
    setUsuarioEditando(usuario);
    setModalOpen(true);
    setDropdownOpen(null);
  };

  const handleSaveUsuario = async (data) => {
    try {
      setModalLoading(true);

      if (usuarioEditando) {
        console.log("Atualizando usuario:", usuarioEditando.id, data);
        const response = await usuarioService.atualizar(
          usuarioEditando.id,
          data
        );
        if (response.success) {
          toast.success("Usuario atualizado com sucesso!");
          loadUsuarios();
          setModalOpen(false);
        }
      } else {
        const response = await usuarioService.criar(data);
        if (response.success) {
          toast.success("Usuario criado com sucesso!");
          loadUsuarios();
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar usuario:", error.response.data.details);
      const message = error.response?.details || "Erro ao salvar usuario";
      toast.error(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteUsuario = async (usuario) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir o usuario "${usuario.nome}"?`
      )
    ) {
      try {
        const response = await usuarioService.deletar(usuario.id);
        if (response.success) {
          toast.success("Usuario excluído com sucesso!");
          loadUsuarios();
        }
      } catch (error) {
        console.error("Erro ao excluir usuario:", error);
        const message =
          error.response?.data?.message || "Erro ao excluir usuario";
        toast.error(message);
      }
    }
    setDropdownOpen(null);
  };

  const handleToggleStatus = async (usuario) => {
    try {
      const response = await usuarioService.toggleStatus(usuario.id);
      if (response.success) {
        toast.success(
          `Usuário ${usuario.ativo ? "desativado" : "ativado"} com sucesso!`
        );
        loadUsuarios();
      }
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do usuário");
    }
    setDropdownOpen(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filtro) => {
    setFiltroAtivo(filtro);
    setCurrentPage(1);
  };

  const DropdownMenu = ({ usuario, isOpen, onToggle }) => (
    <div className="relative inline-block text-left">
      <button
        onClick={onToggle}
        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 z-999 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
          <div className="py-1">
            <button
              onClick={() => handleEditUsuario(usuario)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
            <button
              onClick={() => handleToggleStatus(usuario)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {usuario.ativo ? (
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
              onClick={() => handleDeleteUsuario(usuario)}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
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
          <h1 className="text-2xl font-bold text-gray-900">Usuários</h1>
          <p className="text-gray-600 mt-1">
            Gerencie seus usuarios ({totalUsuarios} total)
          </p>
        </div>
        <button
          onClick={handleCreateUsuario}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
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
                placeholder="Buscar por nome do usuário..."
              />
            </div>
          </div>
          {/* Filtro de status */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filtroAtivo}
              onChange={(e) => handleFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="todos">Todos</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando usuários...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhum usuário encontrado</p>
            <button
              onClick={handleCreateUsuario}
              className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
            >
              Cadastrar primeiro usuário
            </button>
          </div>
        ) : (
          <>
            <div className="relative min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuário
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 ">
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {usuario.nome || "Razão Social não informada"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {usuario.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="w-4 h-4 mr-2" />
                            {usuario.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            usuario.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {usuario.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right relative">
                        <DropdownMenu
                          usuario={usuario}
                          isOpen={dropdownOpen === usuario.id}
                          onToggle={() =>
                            setDropdownOpen(
                              dropdownOpen === usuario.id ? null : usuario.id
                            )
                          }
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

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
                          {Math.min(currentPage * itemsPerPage, totalUsuarios)}
                        </span>{" "}
                        de <span className="font-medium">{totalUsuarios}</span>{" "}
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
                                onClick={() => {
                                  setCurrentPage(pageNum);
                                  console.log(
                                    `Mudando para a página ${pageNum}`
                                  );
                                }}
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
      <UsuarioModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        usuario={usuarioEditando}
        onSave={handleSaveUsuario}
        loading={modalLoading}
        empresas={empresas}
      />

      {/* Overlay para fechar dropdown */}
      {dropdownOpen && (
        <div className=" inset-0 z-999" onClick={() => setDropdownOpen(null)} />
      )}
    </div>
  );
};

export default UsuariosMaster;
