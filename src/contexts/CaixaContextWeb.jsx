import React, { createContext, useState, useEffect, useContext } from "react";
import { caixaService } from "../services/api";
import { useAuth } from "./AuthContext";

// Contexto do Caixa
const CaixaContext = createContext();

export const useCaixaContext = () => {
  const context = useContext(CaixaContext);
  if (!context) {
    throw new Error(
      "useCaixaContext deve ser usado dentro de um CaixaProvider"
    );
  }
  return context;
};

// Provider do contexto
export const CaixaProvider = ({ children }) => {
  const [caixaAberto, setCaixaAberto] = useState(false);
  const [caixaAtual, setCaixaAtual] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  // Verificar status do caixa ao inicializar
  useEffect(() => {
    if (isAuthenticated) {
      verificarCaixa();
    } else {
      setCaixaAberto(false);
      setCaixaAtual(null);
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Verificar se há caixa aberto
  const verificarCaixa = async () => {
    try {
      setLoading(true);
      const response = await caixaService.buscarDiaAtual();

      if (response && response.status === "aberto") {
        setCaixaAberto(true);
        setCaixaAtual(response);
      } else {
        setCaixaAberto(false);
        setCaixaAtual(null);
      }

      return response && response.status === "aberto";
    } catch (error) {
      console.error("Erro ao verificar caixa:", error);
      setCaixaAberto(false);
      setCaixaAtual(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Verificar se pode realizar operação (caixa aberto)
  const podeRealizarOperacao = () => {
    return caixaAberto && caixaAtual && caixaAtual.status === "aberto";
  };

  const value = {
    caixaAberto,
    caixaAtual,
    loading,
    verificarCaixa,
    podeRealizarOperacao,
  };

  return (
    <CaixaContext.Provider value={value}>{children}</CaixaContext.Provider>
  );
};

export default CaixaContext;
