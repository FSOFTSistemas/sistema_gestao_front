// components/ItemModal.jsx

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ReactDOM from "react-dom";
import { X, Search } from "lucide-react";
import { produtoService } from "../services/api";
import useDebounce from "../hooks/useDebounce";

const schema = yup.object({
  produto_item_id: yup.number().required("É obrigatório selecionar um produto"),
  preco_adicional: yup
    .number()
    .typeError("Deve ser um número")
    .min(0, "Preço não pode ser negativo")
    .required("Preço adicional é obrigatório"),
  qtde_a_baixar: yup
    .number()
    .typeError("Deve ser um número")
    .positive("Deve ser um número positivo")
    .required("Quantidade a baixar é obrigatória"),
});

const ItemModal = ({ isOpen, onClose, onSave, item, data }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      preco_adicional: 0,
      qtde_a_baixar: 1,
    },
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const debouncedSearchTerm = useDebounce(searchTerm, 400);

  // Busca produtos na API conforme o usuário digita
  useEffect(() => {
    const fetchProducts = async () => {
      if (debouncedSearchTerm) {
        try {
          const response = await produtoService.listar({
            search: debouncedSearchTerm,
            limit: 10,
          });
          setSearchResults(response.data.produtos || []);
        } catch (error) {
          console.error("Erro ao buscar produtos:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
      }
    };
    fetchProducts();
  }, [debouncedSearchTerm]);

  // Preenche o formulário ao editar ou reseta ao criar
  useEffect(() => {
    if (item) {
      // Modo de Edição
      setValue("produto_item_id", item.produto_item_id);
      setValue("preco_adicional", item.preco_adicional);
      setValue("qtde_a_baixar", item.qtde_a_baixar);
      setSearchTerm(item.produto.nome); // Mostra o nome do produto já selecionado
    } else {
      // Modo de Criação
      reset({
        preco_adicional: 0,
        qtde_a_baixar: 1,
      });
      setSearchTerm("");
    }
  }, [item, reset, setValue]);

  const handleSelectProduct = (produto) => {
    setValue("produto_item_id", produto.id);
    setSearchTerm(produto.nome);
    setSearchResults([]); // Limpa os resultados após a seleção
    clearErrors("produto_item_id"); // Limpa o erro caso ele exista
  };

  const onSubmit = (formData) => {
    if (!item) {
      // Se for criação, precisamos adicionar o ID do grupo
      onSave({ ...formData, grupo_opcional_id: data.grupo_opcional_id });
    } else {
      // Se for edição, apenas os dados do formulário
      onSave(formData);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {item ? "Editar Item" : "Novo Item Opcional"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Buscar Produto do Estoque
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Digite para buscar um produto..."
                  className="mt-1 block w-full pl-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                  disabled={!!item} // Desabilita a busca no modo de edição para não trocar o item
                />
              </div>
              {errors.produto_item_id && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.produto_item_id.message}
                </p>
              )}
              {searchResults.length > 0 && (
                <ul className="border border-gray-300 rounded-md mt-1 max-h-40 overflow-y-auto z-10 bg-white">
                  {searchResults.map((p) => (
                    <li
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      className="px-3 py-2 hover:bg-orange-100 cursor-pointer text-sm"
                    >
                      {p.nome}
                    </li>
                  ))}
                </ul>
              )}
              <input {...register("produto_item_id")} type="hidden" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Preço Adicional (R$)
                </label>
                <input
                  {...register("preco_adicional")}
                  type="number"
                  step="0.01"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
                {errors.preco_adicional && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.preco_adicional.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Qtde. a Baixar
                </label>
                <input
                  {...register("qtde_a_baixar")}
                  type="number"
                  step="0.001"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                />
                {errors.qtde_a_baixar && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.qtde_a_baixar.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              <b>Qtde. a Baixar:</b> Quanto será deduzido do estoque do produto
              selecionado. Ex: 50 para 50g de morango, 1 para 1 unidade de
              paçoca.
            </p>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600"
              >
                Salvar Item
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ItemModal;
