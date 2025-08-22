// components/ModalDeMontagem.jsx

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { X, ShoppingCart } from "lucide-react";

const ModalDeMontagem = ({
  isOpen,
  onClose,
  produto,
  grupos,
  loading,
  onConfirm,
}) => {
  const [selecoes, setSelecoes] = useState({});
  const [precoTotal, setPrecoTotal] = useState(produto.preco_venda);

  useEffect(() => {
    // Calcula o preço total sempre que as seleções mudam
    let totalAdicional = 0;
    for (const grupoId in selecoes) {
      const grupo = grupos.find((g) => g.id === parseInt(grupoId));
      const itensSelecionados = selecoes[grupoId];

      if (itensSelecionados.length > grupo.qtde_inclusa) {
        // Ordena os itens por preço para aplicar o desconto nos mais baratos
        const itensOrdenados = [...itensSelecionados].sort(
          (a, b) => a.preco_adicional - b.preco_adicional
        );
        const itensPagos = itensOrdenados.slice(grupo.qtde_inclusa);
        totalAdicional += itensPagos.reduce(
          (sum, item) => sum + parseFloat(item.preco_adicional),
          0
        );
      }
    }
    setPrecoTotal(parseFloat(produto.preco_venda) + totalAdicional);
  }, [selecoes, grupos, produto.preco_venda]);

  const handleSelect = (grupo, item) => {
    const grupoId = grupo.id;
    const selecoesAtuais = selecoes[grupoId] || [];

    // Lógica para radio button (escolha única)
    if (grupo.qtde_maxima === 1) {
      if (selecoesAtuais.some((i) => i.id === item.id)) {
        // Desmarcar
        setSelecoes({ ...selecoes, [grupoId]: [] });
      } else {
        // Marcar
        setSelecoes({ ...selecoes, [grupoId]: [item] });
      }
      return;
    }

    // Lógica para checkbox (múltipla escolha)
    if (selecoesAtuais.some((i) => i.id === item.id)) {
      // Desmarcar
      setSelecoes({
        ...selecoes,
        [grupoId]: selecoesAtuais.filter((i) => i.id !== item.id),
      });
    } else {
      // Marcar, respeitando o limite
      if (selecoesAtuais.length < grupo.qtde_maxima) {
        setSelecoes({ ...selecoes, [grupoId]: [...selecoesAtuais, item] });
      } else {
        alert(
          `Você pode escolher no máximo ${grupo.qtde_maxima} itens para este grupo.`
        );
      }
    }
  };

  const isChecked = (grupoId, itemId) => {
    return selecoes[grupoId]?.some((item) => item.id === itemId) || false;
  };

  const handleConfirmClick = () => {
    // Validação de quantidade mínima
    for (const grupo of grupos) {
      const quantidadeSelecionada = selecoes[grupo.id]?.length || 0;
      if (quantidadeSelecionada < grupo.qtde_minima) {
        alert(
          `Você deve escolher pelo menos ${grupo.qtde_minima} item(ns) no grupo "${grupo.nome}".`
        );
        return;
      }
    }

    // Monta o "pacote" para enviar ao carrinho
    const opcionaisSelecionados = Object.values(selecoes).flat();
    const pacote = {
      id: `${produto.id}-${Date.now()}`, // ID único para o carrinho
      tipo: "montado",
      produto_id: produto.id, // ID do produto base para o backend
      nome: produto.nome,
      quantidade: 1, // Por padrão, montamos um item de cada vez
      preco_unitario: precoTotal,
      subtotal: precoTotal,
      // Dados específicos do item montado
      produtoBase: produto,
      opcionais: opcionaisSelecionados,
      itens_opcionais_ids: opcionaisSelecionados.map((op) => op.id), // Array de IDs para o backend
    };
    onConfirm(pacote);
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">
              Montar {produto.nome}
            </h3>
            <button onClick={onClose}>
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <p>Carregando opções...</p>
          ) : (
            <div className="space-y-6">
              {grupos.map((grupo) => (
                <div key={grupo.id}>
                  <h4 className="font-semibold text-gray-800">{grupo.nome}</h4>
                  <p className="text-sm text-gray-500 mb-2">
                    (Escolha até {grupo.qtde_maxima}{" "}
                    {grupo.qtde_maxima === 1 ? "item" : "itens"})
                  </p>
                  <div className="space-y-2">
                    {grupo.itens.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <input
                            type={
                              grupo.qtde_maxima === 1 ? "radio" : "checkbox"
                            }
                            name={`grupo-${grupo.id}`}
                            checked={isChecked(grupo.id, item.id)}
                            onChange={() => handleSelect(grupo, item)}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-3 text-gray-800">
                            {item.produto.nome}
                          </span>
                        </div>
                        {item.preco_adicional > 0 && (
                          <span className="text-sm font-medium text-green-600">
                            + {formatCurrency(item.preco_adicional)}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-semibold text-gray-900">
              Total do Item:
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(precoTotal)}
            </span>
          </div>
          <button
            onClick={handleConfirmClick}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
          >
            <ShoppingCart className="w-5 h-5" />
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>,
    document.getElementById("modal-root")
  );
};

export default ModalDeMontagem;
