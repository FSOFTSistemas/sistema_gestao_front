import React, { useEffect, useState, useRef } from "react";
import toast from "react-hot-toast";

// Modal simples inline
function UsuarioModal({ isOpen, onClose, usuario, onSave }) {
  const [nome, setNome] = useState(usuario?.nome || "");
  const [email, setEmail] = useState(usuario?.email || "");

  useEffect(() => {
    setNome(usuario?.nome || "");
    setEmail(usuario?.email || "");
  }, [usuario]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!nome || !email) {
      toast.error("Preencha todos os campos");
      return;
    }
    onSave({ id: usuario?.id, nome, email });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">{usuario ? "Editar Usuário" : "Novo Usuário"}</h2>
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
            <label className="block mb-1 font-medium">Email</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Simulando service - substitua pelo seu serviço real
  const usuarioService = {
    listar: async (params) => {
      // Simular fetch
      return [
        { id: 1, nome: "João Silva", email: "joao@email.com" },
        { id: 2, nome: "Maria Souza", email: "maria@email.com" },
      ];
    },
    criar: async (data) => {
      // Simular criação
      return { id: Math.random(), ...data };
    },
    atualizar: async (id, data) => {
      // Simular update
      return { id, ...data };
    },
    deletar: async (id) => {
      // Simular delete
      return true;
    },
  };

  useEffect(() => {
    async function carregar() {
      setLoading(true);
      try {
        const dados = await usuarioService.listar({ busca: filtro });
        setUsuarios(dados);
      } catch {
        toast.error("Erro ao carregar usuários");
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [filtro]);

  const abrirModalCriar = () => {
    setUsuarioEditando(null);
    setModalOpen(true);
  };

  const abrirModalEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setModalOpen(true);
    setDropdownOpen(null);
  };

  const fecharModal = () => {
    setModalOpen(false);
    setUsuarioEditando(null);
  };

  const salvarUsuario = async (dados) => {
    try {
      if (dados.id) {
        await usuarioService.atualizar(dados.id, dados);
        toast.success("Usuário atualizado");
      } else {
        await usuarioService.criar(dados);
        toast.success("Usuário criado");
      }
      fecharModal();
      // Recarregar lista
      const dadosAtualizados = await usuarioService.listar({ busca: filtro });
      setUsuarios(dadosAtualizados);
    } catch {
      toast.error("Erro ao salvar usuário");
    }
  };

  const excluirUsuario = async (id) => {
    if (!window.confirm("Deseja realmente excluir este usuário?")) return;
    try {
      await usuarioService.deletar(id);
      toast.success("Usuário excluído");
      setDropdownOpen(null);
      const dadosAtualizados = await usuarioService.listar({ busca: filtro });
      setUsuarios(dadosAtualizados);
    } catch {
      toast.error("Erro ao excluir usuário");
    }
  };

  // Fecha dropdown ao clicar fora
  const dropdownRef = useRef(null);
  React.useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold text-gray-700">Usuários</h1>
        <button
          onClick={abrirModalCriar}
          className="bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700"
        >
          Novo Usuário
        </button>
      </div>

      <input
        type="text"
        placeholder="Buscar usuário..."
        className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring focus:ring-orange-100 mb-4"
        value={filtro}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {loading ? (
        <p className="text-sm text-gray-500">Carregando...</p>
      ) : usuarios.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          Nenhum usuário encontrado
        </div>
      ) : (
        <table className="table-auto w-full border-collapse border border-gray-300 text-left text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2">ID</th>
              <th className="border border-gray-300 px-3 py-2">Nome</th>
              <th className="border border-gray-300 px-3 py-2">Email</th>
              <th className="border border-gray-300 px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-3 py-2">{usuario.id}</td>
                <td className="border border-gray-300 px-3 py-2">{usuario.nome}</td>
                <td className="border border-gray-300 px-3 py-2">{usuario.email}</td>
                <td className="border border-gray-300 px-3 py-2 relative" ref={dropdownRef}>
                  <button
                    onClick={() =>
                      setDropdownOpen(dropdownOpen === usuario.id ? null : usuario.id)
                    }
                    className="bg-gray-200 px-2 py-1 rounded text-sm"
                  >
                    Ações
                  </button>
                  {dropdownOpen === usuario.id && (
                    <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-300 rounded shadow-md z-10">
                      <button
                        onClick={() => abrirModalEditar(usuario)}
                        className="block w-full text-left px-3 py-2 hover:bg-gray-100"
                      >
                        Alterar
                      </button>
                      <button
                        onClick={() => excluirUsuario(usuario.id)}
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

      <UsuarioModal
        isOpen={modalOpen}
        onClose={fecharModal}
        usuario={usuarioEditando}
        onSave={salvarUsuario}
      />
    </div>
  );
}