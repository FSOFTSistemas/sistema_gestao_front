// components/GerenciadorOpcionais.jsx

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import { grupoOpcionalService, itemOpcionalService } from "../services/api";
import toast from "react-hot-toast";
import GrupoModal from "./GrupoModal";
import ItemModal from "./ItemModal";

const GerenciadorOpcionais = ({ produto }) => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({ type: null, data: null });

  const loadGrupos = useCallback(async () => {
    if (!produto?.id) return;
    setLoading(true);
    try {
      const response = await grupoOpcionalService.listarPorProduto(produto.id);
      setGrupos(response || []);
    } catch (error) {
      toast.error("Erro ao carregar os grupos de opcionais.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [produto?.id]);

  useEffect(() => {
    loadGrupos();
  }, [loadGrupos]);

  const handleSave = async (saveFunction, successMessage, errorMessage) => {
    try {
      await saveFunction();
      toast.success(successMessage);
      setModalState({ type: null, data: null });
      loadGrupos(); // Recarrega a lista após qualquer alteração
    } catch (error) {
      const message = error.response?.data?.message || errorMessage;
      toast.error(message);
      console.error(error);
    }
  };

  const handleSaveGrupo = (data) => {
    const action =
      modalState.type === "GRUPO_EDIT"
        ? () => grupoOpcionalService.atualizar(modalState.data.id, data)
        : () =>
            grupoOpcionalService.criar({
              ...data,
              produto_base_id: produto.id,
            });
    handleSave(action, "Grupo salvo com sucesso!", "Erro ao salvar o grupo.");
  };

  const handleSaveItem = (data) => {
    const action =
      modalState.type === "ITEM_EDIT"
        ? () => itemOpcionalService.atualizar(modalState.data.id, data)
        : () => itemOpcionalService.criar(data);
    handleSave(action, "Item salvo com sucesso!", "Erro ao salvar o item.");
  };

  const handleDelete = async (
    deleteFunction,
    successMessage,
    errorMessage,
    confirmationMessage
  ) => {
    if (window.confirm(confirmationMessage)) {
      try {
        await deleteFunction();
        toast.success(successMessage);
        loadGrupos(); // Recarrega a lista após qualquer alteração
      } catch (error) {
        const message = error.response?.data?.message || errorMessage;
        toast.error(message);
        console.error(error);
      }
    }
  };

  const handleDeleteGrupo = (grupo) => {
    handleDelete(
      () => grupoOpcionalService.deletar(grupo.id),
      "Grupo excluído com sucesso!",
      "Erro ao excluir o grupo.",
      `Tem certeza que deseja excluir o grupo "${grupo.nome}"?`
    );
  };

  const handleDeleteItem = (item) => {
    handleDelete(
      () => itemOpcionalService.deletar(item.id),
      "Item excluído com sucesso!",
      "Erro ao excluir o item.",
      `Tem certeza que deseja excluir o item "${item.produto.nome}"?`
    );
  };

  if (loading) {
    return <div className="text-center p-4">Carregando opções...</div>;
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
      {grupos.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-4">
          Nenhum grupo de opcionais cadastrado.
        </p>
      ) : (
        grupos.map((grupo) => (
          <div
            key={grupo.id}
            className="p-3 bg-white border rounded-md shadow-sm"
          >
            <div className="flex justify-between items-center">
              <div>
                <h5 className="font-semibold text-gray-800">{grupo.nome}</h5>
                <p className="text-xs text-gray-500">
                  (Mín: {grupo.qtde_minima}, Máx: {grupo.qtde_maxima}, Inclusos:{" "}
                  {grupo.qtde_inclusa})
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {/* CORREÇÃO APLICADA AQUI */}
                <button
                  type="button"
                  onClick={() =>
                    setModalState({ type: "GRUPO_EDIT", data: grupo })
                  }
                  className="p-1 text-blue-600 hover:text-blue-800"
                >
                  <Edit size={16} />
                </button>
                {/* CORREÇÃO APLICADA AQUI */}
                <button
                  type="button"
                  onClick={() => handleDeleteGrupo(grupo)}
                  className="p-1 text-red-600 hover:text-red-800"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {grupo.itens?.length > 0 ? (
                grupo.itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center text-sm p-1 rounded hover:bg-gray-50"
                  >
                    <span>{item.produto?.nome}</span>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono text-xs">
                        +{" "}
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(item.preco_adicional)}
                      </span>
                      {/* CORREÇÃO APLICADA AQUI */}
                      <button
                        type="button"
                        onClick={() =>
                          setModalState({ type: "ITEM_EDIT", data: item })
                        }
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={14} />
                      </button>
                      {/* CORREÇÃO APLICADA AQUI */}
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(item)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400">
                  Nenhum item adicionado a este grupo.
                </p>
              )}
              {/* CORREÇÃO APLICADA AQUI */}
              <button
                type="button"
                onClick={() =>
                  setModalState({
                    type: "ITEM_ADD",
                    data: { grupo_opcional_id: grupo.id },
                  })
                }
                className="text-xs text-orange-600 hover:text-orange-800 mt-2 flex items-center"
              >
                <Plus size={14} className="mr-1" /> Adicionar Item
              </button>
            </div>
          </div>
        ))
      )}

      {/* CORREÇÃO APLICADA AQUI */}
      <button
        type="button"
        onClick={() => setModalState({ type: "ADD_GRUPO", data: null })}
        className="w-full flex items-center justify-center px-4 py-2 border border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Grupo de Opcionais
      </button>

      {(modalState.type === "ADD_GRUPO" ||
        modalState.type === "GRUPO_EDIT") && (
        <GrupoModal
          isOpen={true}
          onClose={() => setModalState({ type: null, data: null })}
          onSave={handleSaveGrupo}
          grupo={modalState.data}
        />
      )}

      {(modalState.type === "ITEM_ADD" || modalState.type === "ITEM_EDIT") && (
        <ItemModal
          isOpen={true}
          onClose={() => setModalState({ type: null, data: null })}
          onSave={handleSaveItem}
          item={modalState.type === "ITEM_EDIT" ? modalState.data : null}
          data={modalState.data}
        />
      )}
    </div>
  );
};

export default GerenciadorOpcionais;
