import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";
import { empresaService } from "../services/api";

// Modal de empresa
function EmpresaModal({ isOpen, onClose, empresa, onSave }) {
  const [nome, setNome] = useState(empresa?.nome || "");
  const [cnpj, setCnpj] = useState(empresa?.cnpj || "");

  useEffect(() => {
    setNome(empresa?.nome || "");
    setCnpj(empresa?.cnpj || "");
  }, [empresa]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome || !cnpj) {
      toast.error("Preencha todos os campos");
      return;
    }
    onSave({ id: empresa?.id, nome, cnpj });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">{empresa ? "Editar Empresa" : "Nova Empresa"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="block mb-1 font-medium">Nome</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block mb-1 font-medium">CNPJ</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={cnpj}
              onChange={(e) => setCnpj(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Empresa() {
  const [empresas, setEmpresas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [empresaEditando, setEmpresaEditando] = useState(null);


  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        const dados = await empresaService.listar();
        setEmpresas(dados);
      } catch {
        toast.error("Erro ao carregar empresas");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const abrirModalCriar = () => {
    setEmpresaEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (empresa) => {
    setEmpresaEditando(empresa);
    setModalOpen(true);
    setDropdownOpen(null);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setEmpresaEditando(null);
  };

  const salvarEmpresa = async (dados) => {
    try {
      if (dados.id) {
        await empresaService.atualizar(dados.id, dados);
        toast.success("Empresa atualizada");
      } else {
        await empresaService.criar(dados);
        toast.success("Empresa criada");
      }
      fecharModal();
      const dadosAtualizados = await empresaService.listar();
      setEmpresas(dadosAtualizados);
    } catch {
      toast.error("Erro ao salvar empresa");
    }
  };

  const excluirEmpresa = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta empresa?")) return;
    try {
      await empresaService.deletar(id);
      toast.success("Empresa excluída");
      setDropdownOpen(null);
      const dadosAtualizados = await empresaService.listar();
      setEmpresas(dadosAtualizados);
    } catch {
      toast.error("Erro ao excluir empresa");
    }
  };

  const dropdownRef = useRef(null);
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const empresasFiltradas = empresas.filter((e) =>
    e.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-700">Empresas</h1>
        <button
          onClick={abrirModalCriar}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          Nova Empresa
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar empresa..."
        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring focus:ring-orange-100 mb-4"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : empresasFiltradas.length === 0 ? (
        <div className="p-8 text-center text-gray-500">Nenhuma empresa encontrada</div>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2">ID</th>
              <th className="border border-gray-300 px-3 py-2">Nome</th>
              <th className="border border-gray-300 px-3 py-2">CNPJ</th>
              <th className="border border-gray-300 px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {empresasFiltradas.map((empresa) => (
              <tr key={empresa.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2">{empresa.id}</td>
                <td className="border border-gray-300 px-3 py-2">{empresa.nome}</td>
                <td className="border border-gray-300 px-3 py-2">{empresa.cnpj}</td>
                <td className="border border-gray-300 px-3 py-2 relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === empresa.id ? null : empresa.id)
                    }
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    Ações
                  </button>
                  {dropdownOpen === empresa.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-md z-10">
                      <button
                        onClick={() => abrirModalEditar(empresa)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        Alterar
                      </button>
                      <button
                        onClick={() => excluirEmpresa(empresa.id)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600"
                      >
                        Excluir
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <EmpresaModal
        isOpen={modalOpen}
        onClose={fecharModal}
        empresa={empresaEditando}
        onSave={salvarEmpresa}
      />
    </div>
  );
}