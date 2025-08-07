import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { X, User, Mail, Tag, KeyRound } from "lucide-react";

const schema = yup.object({
  nome: yup
    .string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(150, "Nome deve ter no máximo 150 caracteres")
    .required("Nome é obrigatório"),
  email: yup
    .string()
    .email("Email inválido")
    .max(150, "Email deve ter no máximo 150 caracteres"),
  senha: yup.string().min(8, "Senha deve ter pelo menos 8 caracteres"),
});

const UsuarioMasterModal = ({
  isOpen,
  onClose,
  usuario,
  empresas,
  onSave,
  loading,
}) => {
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
    if (usuario) {
      // Preencher formulário com dados do usuario
      Object.keys(usuario).forEach((key) => {
        setValue(key, usuario[key]);
      });
    } else {
      reset();
    }
  }, [usuario, setValue, reset]);

  const onSubmit = (data) => {
    if (!data.senha || data.senha.trim() === "") {
      delete data.senha;
    }
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
              {usuario ? "Editar Usuario" : "Novo Usuario"}
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
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("nome")}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.nome ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Nome completo do usuario"
                />
              </div>
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nome.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="usuario@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Senha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register("senha")}
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.senha ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Senha do usuario"
                />
              </div>
              {errors.senha && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.senha.message}
                </p>
              )}
            </div>
            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Empresa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Tag className="h-5 w-5 text-gray-400" />
                </div>
                {usuario && (
                  <input
                    type="hidden"
                    value={usuario.empresa_id}
                    {...register("empresa_id")}
                  />
                )}

                <select
                  {...register("empresa_id")}
                  disabled={!!usuario}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.empresa_id ? "border-red-300" : "border-gray-300"
                  } ${usuario ? "bg-gray-100 cursor-not-allowed" : ""}`}
                >
                  <option value="">Selecione uma empresa</option>
                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.razao_social}
                    </option>
                  ))}
                </select>
              </div>
              {errors.empresa_id && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.empresa_id.message}
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
                ) : usuario ? (
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

export default UsuarioMasterModal;
