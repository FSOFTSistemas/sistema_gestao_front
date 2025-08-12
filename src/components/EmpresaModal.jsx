import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  X,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Building2,
} from "lucide-react";

const schema = yup.object({
  razao_social: yup
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(150, "Nome deve ter no máximo 150 caracteres")
    .required("Razão Social é obrigatório"),
  cnpj: yup.string().max(18, "CNPJ deve ter no máximo 18 caracteres"),
  fantasia: yup
    .string()
    .max(100, "Nome Fantasia deve ter no máximo 100 caracteres"),
  endereco: yup
    .string()
    .max(255, "Endereço deve ter no máximo 255 caracteres")
    .nullable()
    .notRequired(),
  inscricao_estadual: yup
    .string()
    .max(50, "Inscrição Estadual deve ter no máximo 50 caracteres"),
  ramo_atividade: yup.string(),
});

const EmpresaModal = ({ isOpen, onClose, empresa, onSave, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (empresa) {
      // Preencher formulário com dados do empresa
      Object.keys(empresa).forEach((key) => {
        setValue(key, empresa[key]);
      });
    } else {
      reset();
    }
  }, [empresa, setValue, reset]);

  const onSubmit = (data) => {
    // Remove campos vazios
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(
        ([, value]) => value !== undefined && value !== null && value !== ""
      )
    );
    onSave(filteredData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {empresa ? "Editar Empresa" : "Nova Empresa"}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Razão Social */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Razão Social *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("razao_social")}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.razao_social ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Razão Social da Empresa"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.razao_social.message}
                </p>
              )}
            </div>

            {/*CNPJ e Fantasia */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("cnpj")}
                    type="text"
                    maxLength={18} // 14 números + 4 caracteres da máscara
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não for número
                      value = value.replace(/^(\d{2})(\d)/, "$1.$2"); // 00.000
                      value = value.replace(
                        /^(\d{2})\.(\d{3})(\d)/,
                        "$1.$2.$3"
                      ); // 00.000.000
                      value = value.replace(/\.(\d{3})(\d)/, ".$1/$2"); // 00.000.000/0000
                      value = value.replace(/(\d{4})(\d)/, "$1-$2"); // 00.000.000/0000-00

                      e.target.value = value;
                      setValue("cnpj", value); // Atualiza o react-hook-form
                    }}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.cnpj ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="00.000.000/0000-00"
                  />
                </div>
                {errors.cnpj && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cnpj.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome Fantasia
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("fantasia")}
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.fantasia ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Nome Fantasia da Empresa"
                  />
                </div>
                {errors.fantasia && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.fantasia.message}
                  </p>
                )}
              </div>
            </div>

            {/*Inscrição Estadual e Ramo de atividade */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Inscrição Estadual
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register("inscricao_estadual")}
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.cnpj ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="Inscrição Estadual"
                  />
                </div>
                {errors.cnpj && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.cnpj.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ramo de Atividade
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building2 className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    {...register("ramo_atividade")}
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.ramo_atividade
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="">Selecione uma categoria</option>
                    <option value="alimenticio">Alimentício</option>
                    <option value="moda">Moda</option>
                    <option value="geral">Geral</option>
                  </select>
                </div>
                {errors.ramo_atividade && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.ramo_atividade.message}
                  </p>
                )}
              </div>
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Endereço
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("endereco")}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.endereco ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Rua, número, bairro"
                />
              </div>
              {errors.endereco && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.endereco.message}
                </p>
              )}
            </div>

            {/* Botões */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-500 border border-transparent rounded-lg hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </div>
                ) : empresa ? (
                  "Atualizar"
                ) : (
                  "Criar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EmpresaModal;
