import React, { useEffect, useState } from "react";
import { vendaService } from "../services/api";
import toast from "react-hot-toast";

const Vendas = () => {
  const [vendas, setVendas] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarVendas();
  }, [filtro]);

  const carregarVendas = async () => {
    setLoading(true);
    try {
      const response = await vendaService.listar({ busca: filtro });
      setVendas(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Erro ao carregar vendas");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarVenda = async (id) => {
    if (confirm("Deseja cancelar esta venda?")) {
      try {
        await vendaService.atualizar(id, { status: "cancelada" });
        toast.success("Venda cancelada com sucesso");
        carregarVendas();
      } catch (error) {
        toast.error("Erro ao cancelar venda");
      }
    }
  };

  const handleReimprimirVenda = (id) => {
    window.open(`/vendas/${id}/reimprimir`, "_blank");
  };

  return (
    <div className="container mt-4">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h1 className="text-xl font-semibold text-gray-700 mb-4">Vendas</h1>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Buscar por cliente..."
            className="block w-full pl-3 pr-3 py-2 border border-gray-300 rounded-md text-sm shadow-sm focus:ring focus:ring-blue-100"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-sm text-gray-500">Carregando...</p>
        ) : Array.isArray(vendas) && vendas.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-12 h-12 text-gray-400 mx-auto mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h18M9 3v18m6-18v18M4 21h16"
              />
            </svg>
            <p className="text-gray-600">Nenhuma venda encontrada</p>
          </div>
        ) : (
          <table className="table table-bordered">
            <thead className="thead-dark">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Veículo</th>
                <th>Data</th>
                <th>Valor</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id}>
                  <td>{venda.id}</td>
                  <td>{venda.cliente?.nome}</td>
                  <td>{venda.veiculo?.modelo}</td>
                  <td>{new Date(venda.data_venda).toLocaleDateString()}</td>
                  <td>R$ {venda.valor_venda.toFixed(2)}</td>
                  <td>
                    <div className="position-relative">
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() =>
                          setDropdownOpen(dropdownOpen === venda.id ? null : venda.id)
                        }
                      >
                        Ações
                      </button>
                      {dropdownOpen === venda.id && (
                        <>
                          <div
                            className="dropdown-menu show"
                            style={{ position: "absolute", zIndex: 1000 }}
                          >
                            <button
                              className="dropdown-item"
                              onClick={() => alert("Visualizar venda não implementado")}
                            >
                              Visualizar
                            </button>
                            <button
                              className="dropdown-item"
                              onClick={() => handleReimprimirVenda(venda.id)}
                            >
                              Reimprimir
                            </button>
                            <button
                              className="dropdown-item text-danger"
                              onClick={() => handleCancelarVenda(venda.id)}
                            >
                              Cancelar
                            </button>
                          </div>
                          <div
                            className="fixed inset-0"
                            onClick={() => setDropdownOpen(null)}
                            style={{ position: "fixed", inset: 0 }}
                          ></div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Vendas;