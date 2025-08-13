import React, { createContext, useState, useEffect, useContext } from "react";

// Contexto do PDV
const PDVContextWeb = createContext();

export const usePDVContext = () => {
  const context = useContext(PDVContextWeb);
  if (!context) {
    throw new Error("usePDVContext deve ser usado dentro de um PDVProvider");
  }
  return context;
};

// Provider do contexto
export const PDVProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Carregar itens do localStorage ao inicializar
  useEffect(() => {
    const savedItems = localStorage.getItem("pdv_items");
    if (savedItems) {
      try {
        setItems(JSON.parse(savedItems));
      } catch (error) {
        console.error("Erro ao carregar itens do localStorage:", error);
        localStorage.removeItem("pdv_items");
      }
    }
  }, []);

  // Salvar itens no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("pdv_items", JSON.stringify(items));
  }, [items]);

  // Calcular total
  const total = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Adicionar item
  const addItem = (produto, quantidade, precoUnitario) => {
    // Verificar se o produto já existe no carrinho
    const existingItemIndex = items.findIndex(
      (item) => item.produto_id === produto.id
    );
    if (existingItemIndex >= 0) {
      // Se existe, atualizar quantidade
      const updatedItems = [...items];
      const existingItem = updatedItems[existingItemIndex];
      const novaQuantidade = existingItem.quantidade + quantidade;

      updatedItems[existingItemIndex] = {
        ...existingItem,
        quantidade: novaQuantidade,
        subtotal: novaQuantidade * precoUnitario,
      };
      setItems(updatedItems);
    } else {
      // Se não existe, adicionar novo item
      const newItem = {
        id: `${produto.id}_${Date.now()}`,
        produto_id: produto.id,
        nome: produto.nome,
        quantidade,
        preco_unitario: precoUnitario,
        subtotal: quantidade * precoUnitario,
      };
      setItems((prevItems) => [...prevItems, newItem]);
    }
  };

  // Remover item
  const removeItem = (itemId) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  // Atualizar quantidade do item
  const updateItemQuantity = (itemId, novaQuantidade) => {
    if (novaQuantidade <= 0) {
      removeItem(itemId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantidade: novaQuantidade,
              subtotal: novaQuantidade * item.preco_unitario,
            }
          : item
      )
    );
  };

  // Atualizar item completo
  const updateItem = (itemId, quantidade, precoUnitario) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantidade,
              preco_unitario: precoUnitario,
              subtotal: quantidade * precoUnitario,
            }
          : item
      )
    );
  };

  // Limpar todos os itens
  const clearItems = () => {
    setItems([]);
    localStorage.removeItem("pdv_items");
  };

  // Obter quantidade total de itens
  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.quantidade, 0);
  };

  // Verificar se um produto já está no carrinho
  const isProductInCart = (produtoId) => {
    return items.some((item) => item.produto_id === produtoId);
  };

  // Obter item por produto ID
  const getItemByProductId = (produtoId) => {
    return items.find((item) => item.produto_id === produtoId);
  };

  const value = {
    items,
    total,
    addItem,
    removeItem,
    updateItem,
    updateItemQuantity,
    clearItems,
    getTotalItems,
    isProductInCart,
    getItemByProductId,
  };

  return (
    <PDVContextWeb.Provider value={value}>{children}</PDVContextWeb.Provider>
  );
};
