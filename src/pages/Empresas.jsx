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
import { empresaService } from "../services/api";
import EmpresaModal from "../components/EmpresaModal";
import toast from "react-hot-toast";

const Empresas = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmpresas, setTotalEmpresas] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const itemsPerPage = 10;

  useEffect(() => {
    loadEmpresas();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms de atraso pra evitar too many requests

    return () => clearTimeout(timeout); // limpa se o usuário digitar antes do tempo
  }, [searchTerm]);

  const loadEmpresas = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      };
      const empresaResponse = await empresaService.listar(params);
      const response = empresaResponse.dados;

      setEmpresas(response || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalEmpresas(response.length);
    } catch (error) {
      console.error("Erro ao carregar empresas:", error);
      toast.error("Erro ao carregar empresas");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmpresa = () => {
    setEmpresaEditando(null);
    setModalOpen(true);
  };

  const handleEditEmpresa = (empresa) => {
    setEmpresaEditando(empresa);
    setModalOpen(true);
    setDropdownOpen(null);
  };

  const handleSaveEmpresa = async (data) => {
    try {
      setModalLoading(true);

      if (empresaEditando) {
        const response = await empresaService.atualizar(
          empresaEditando.id,
          data
        );
        if (response.success) {
          toast.success("Empresa atualizada com sucesso!");
          loadEmpresas();
          setModalOpen(false);
        }
      } else {
        const response = await empresaService.criar(data);
        if (response.success) {
          toast.success("Empresa criada com sucesso!");
          loadEmpresas();
          setModalOpen(false);
        }
      }
    } catch (error) {
      console.error("Erro ao salvar empresa:", error.response.data.details);
      const message = error.response?.details || "Erro ao salvar empresa";
      toast.error(message);
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteEmpresa = async (empresa) => {
    if (
      window.confirm(
        `Tem certeza que deseja excluir a empresa "${empresa.nome}"?`
      )
    ) {
      try {
        const response = await empresaService.deletar(empresa.id);
        if (response.success) {
          toast.success("Empresa excluída com sucesso!");
          loadEmpresas();
        }
      } catch (error) {
        console.error("Erro ao excluir empresa:", error);
        const message =
          error.response?.data?.message || "Erro ao excluir empresa";
        toast.error(message);
      }
    }
    setDropdownOpen(null);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const formatCnpj = (cnpj) => {
    if (!cnpj) return "";
    const numbers = cnpj.replace(/\D/g, "");
    if (numbers.length === 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    } else if (numbers.length === 14) {
      return numbers.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        "$1.$2.$3/$4-$5"
      );
    }
    return cnpj;
  };

  const DropdownMenu = ({ empresa, isOpen, onToggle }) => (
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
              onClick={() => handleEditEmpresa(empresa)}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </button>
            <button
              onClick={() => handleDeleteEmpresa(empresa)}
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
          <h1 className="text-2xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">
            Gerencie suas empresas ({totalEmpresas} total)
          </p>
        </div>
        <button
          onClick={handleCreateEmpresa}
          className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
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
                placeholder="Buscar por razão social ou nome fantasia..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Carregando empresas...</p>
          </div>
        ) : empresas.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Nenhuma empresa encontrada</p>
            <button
              onClick={handleCreateEmpresa}
              className="mt-3 text-orange-600 hover:text-orange-700 font-medium"
            >
              Cadastrar primeira empresa
            </button>
          </div>
        ) : (
          <>
            <div className="relative min-w-full">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Empresa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome Fantasia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Localização
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th> */}
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 ">
                  {empresas.map((empresa) => (
                    <tr key={empresa.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {empresa.razao_social ||
                                "Razão Social não informada"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {empresa.cnpj
                                ? formatCnpj(empresa.cnpj)
                                : "cnpj não informado"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {empresa.fantasia && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Mail className="w-4 h-4 mr-2" />
                              {empresa.fantasia}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {empresa.endereco ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="w-4 h-4 mr-2" />
                            {empresa.endereco}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            empresa.ativo
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {empresa.ativo ? "Ativa" : "Inativa"}
                        </span>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-right relative">
                        <DropdownMenu
                          empresa={empresa}
                          isOpen={dropdownOpen === empresa.id}
                          onToggle={() =>
                            setDropdownOpen(
                              dropdownOpen === empresa.id ? null : empresa.id
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
                          {Math.min(currentPage * itemsPerPage, totalEmpresas)}
                        </span>{" "}
                        de <span className="font-medium">{totalEmpresas}</span>{" "}
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
      <EmpresaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        empresa={empresaEditando}
        onSave={handleSaveEmpresa}
        loading={modalLoading}
      />

      {/* Overlay para fechar dropdown */}
      {dropdownOpen && (
        <div className=" inset-0 z-999" onClick={() => setDropdownOpen(null)} />
      )}
    </div>
  );
};

export default Empresas;
