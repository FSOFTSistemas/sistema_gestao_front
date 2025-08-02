import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { X, Package, Barcode, DollarSign, Hash, Tag, FileText } from 'lucide-react';

const schema = yup.object({
  nome: yup
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(150, 'Nome deve ter no máximo 150 caracteres')
    .required('Nome é obrigatório'),
  codigo_barras: yup
    .string()
    .max(50, 'Código de barras deve ter no máximo 50 caracteres'),
  preco_venda: yup
    .number()
    .positive('Preço de venda deve ser positivo')
    .required('Preço de venda é obrigatório'),
  custo: yup
    .number()
    .positive('Custo deve ser positivo')
    .required('Custo é obrigatório'),
  unidade: yup
    .string()
    .max(10, 'Unidade deve ter no máximo 10 caracteres')
    .required('Unidade é obrigatória'),
  categoria: yup
    .string()
    .max(50, 'Categoria deve ter no máximo 50 caracteres'),
  estoque_atual: yup
    .number()
    .min(0, 'Estoque atual não pode ser negativo')
    .required('Estoque atual é obrigatório'),
  estoque_minimo: yup
    .number()
    .min(0, 'Estoque mínimo não pode ser negativo')
    .required('Estoque mínimo é obrigatório'),
  descricao: yup
    .string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres'),
  ncm: yup
    .string()
    .max(10, 'NCM deve ter no máximo 10 caracteres'),
  cfop: yup
    .string()
    .max(4, 'CFOP deve ter no máximo 4 caracteres'),
});

const ProdutoModal = ({ isOpen, onClose, produto, onSave, loading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(schema),
  });

  const precoVenda = watch('preco_venda');
  const custo = watch('custo');

  useEffect(() => {
    if (produto) {
      // Preencher formulário com dados do produto
      Object.keys(produto).forEach(key => {
        setValue(key, produto[key] || '');
      });
    } else {
      reset();
    }
  }, [produto, setValue, reset]);

  const onSubmit = (data) => {
    // Converter strings para números onde necessário
    const formattedData = {
      ...data,
      preco_venda: parseFloat(data.preco_venda),
      custo: parseFloat(data.custo),
      estoque_atual: parseInt(data.estoque_atual),
      estoque_minimo: parseInt(data.estoque_minimo),
    };
    onSave(formattedData);
  };

  const calcularMargem = () => {
    if (precoVenda && custo && custo > 0) {
      const margem = ((precoVenda - custo) / custo) * 100;
      return margem.toFixed(1);
    }
    return '0.0';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              {produto ? 'Editar Produto' : 'Novo Produto'}
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
            {/* Nome e Código de Barras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Produto *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('nome')}
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.nome ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Nome do produto"
                  />
                </div>
                {errors.nome && (
                  <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código de Barras
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Barcode className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('codigo_barras')}
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.codigo_barras ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="7891234567890"
                  />
                </div>
                {errors.codigo_barras && (
                  <p className="mt-1 text-sm text-red-600">{errors.codigo_barras.message}</p>
                )}
              </div>
            </div>

            {/* Preços */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('custo')}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.custo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.custo && (
                  <p className="mt-1 text-sm text-red-600">{errors.custo.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preço de Venda *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('preco_venda')}
                    type="number"
                    step="0.01"
                    min="0"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.preco_venda ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.preco_venda && (
                  <p className="mt-1 text-sm text-red-600">{errors.preco_venda.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margem de Lucro
                </label>
                <div className="flex items-center h-12 px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-sm font-medium text-gray-900">
                    {calcularMargem()}%
                  </span>
                </div>
              </div>
            </div>

            {/* Unidade e Categoria */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidade *
                </label>
                <select
                  {...register('unidade')}
                  className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                    errors.unidade ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Selecione a unidade</option>
                  <option value="UN">Unidade (UN)</option>
                  <option value="KG">Quilograma (KG)</option>
                  <option value="G">Grama (G)</option>
                  <option value="L">Litro (L)</option>
                  <option value="ML">Mililitro (ML)</option>
                  <option value="M">Metro (M)</option>
                  <option value="CM">Centímetro (CM)</option>
                  <option value="CX">Caixa (CX)</option>
                  <option value="PC">Peça (PC)</option>
                  <option value="PAR">Par (PAR)</option>
                </select>
                {errors.unidade && (
                  <p className="mt-1 text-sm text-red-600">{errors.unidade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Tag className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('categoria')}
                    type="text"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.categoria ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Roupas, Eletrônicos, Alimentação"
                  />
                </div>
                {errors.categoria && (
                  <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
                )}
              </div>
            </div>

            {/* Estoque */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque Atual *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('estoque_atual')}
                    type="number"
                    min="0"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.estoque_atual ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.estoque_atual && (
                  <p className="mt-1 text-sm text-red-600">{errors.estoque_atual.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estoque Mínimo *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Hash className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...register('estoque_minimo')}
                    type="number"
                    min="0"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                      errors.estoque_minimo ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.estoque_minimo && (
                  <p className="mt-1 text-sm text-red-600">{errors.estoque_minimo.message}</p>
                )}
              </div>
            </div>

            {/* Descrição */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                {...register('descricao')}
                rows={3}
                className={`block w-full px-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors resize-none ${
                  errors.descricao ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Descrição detalhada do produto"
              />
              {errors.descricao && (
                <p className="mt-1 text-sm text-red-600">{errors.descricao.message}</p>
              )}
            </div>

            {/* Informações Fiscais */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-4">Informações Fiscais (Opcional)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NCM
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('ncm')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.ncm ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="12345678"
                    />
                  </div>
                  {errors.ncm && (
                    <p className="mt-1 text-sm text-red-600">{errors.ncm.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CFOP
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('cfop')}
                      type="text"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors ${
                        errors.cfop ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="5102"
                    />
                  </div>
                  {errors.cfop && (
                    <p className="mt-1 text-sm text-red-600">{errors.cfop.message}</p>
                  )}
                </div>
              </div>
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
                ) : (
                  produto ? 'Atualizar' : 'Criar'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProdutoModal;

