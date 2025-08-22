// components/GrupoModal.jsx

import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X } from "lucide-react";

const schema = yup.object({
  nome: yup
    .string()
    .required("Nome do grupo é obrigatório")
    .min(2, "Mínimo 2 caracteres"),
  qtde_minima: yup
    .number()
    .typeError("Deve ser um número")
    .required("Obrigatório")
    .min(0, "Deve ser no mínimo 0"),
  qtde_maxima: yup
    .number()
    .typeError("Deve ser um número")
    .required("Obrigatório")
    .min(1, "Deve ser no mínimo 1"),
  qtde_inclusa: yup
    .number()
    .typeError("Deve ser um número")
    .min(0, "Deve ser no mínimo 0"),
});

const GrupoModal = ({ isOpen, onClose, onSave, grupo }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      qtde_inclusa: 0,
      qtde_minima: 0,
      qtde_maxima: 1,
    },
  });

  useEffect(() => {
    if (grupo) {
      setValue("nome", grupo.nome);
      setValue("qtde_minima", grupo.qtde_minima);
      setValue("qtde_maxima", grupo.qtde_maxima);
      setValue("qtde_inclusa", grupo.qtde_inclusa || 0);
    } else {
      reset({
        qtde_inclusa: 0,
        qtde_minima: 0,
        qtde_maxima: 1,
      });
    }
  }, [grupo, reset, setValue]);

  const onSubmit = (data) => {
    onSave(data);
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-opacity-50 backdrop-blur-sm">
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {grupo ? "Editar Grupo" : "Novo Grupo de Opcionais"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
          </div>

          {/* ALTERAÇÃO 1: Removi o onSubmit da tag <form> */}
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nome do Grupo
              </label>
              <input
                {...register("nome")}
                type="text"
                placeholder="Ex: Frutas, Caldas, Adicionais"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
              />
              {errors.nome && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.nome.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Mínimo
                </label>
                <input
                  {...register("qtde_minima")}
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.qtde_minima && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.qtde_minima.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Máximo
                </label>
                <input
                  {...register("qtde_maxima")}
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.qtde_maxima && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.qtde_maxima.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Inclusos
                </label>
                <input
                  {...register("qtde_inclusa")}
                  type="number"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                />
                {errors.qtde_inclusa && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.qtde_inclusa.message}
                  </p>
                )}
              </div>
            </div>
            <p className="text-xs text-gray-500">
              <b>Mínimo:</b> Quantidade mínima de itens que o cliente DEVE
              escolher. (Ex: 1 para tamanho).
              <br />
              <b>Máximo:</b> Quantidade máxima que o cliente PODE escolher. (Ex:
              3 para frutas).
              <br />
              <b>Inclusos:</b> Quantos desses itens são "grátis" (já no preço do
              produto).
            </p>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              {/* ALTERAÇÃO 2: Mudei para type="button" e adicionei o onClick */}
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600"
              >
                Salvar Grupo
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default GrupoModal;
