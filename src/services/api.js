import axios from "axios";
import toast from "react-hot-toast";

// Configuração base da API
const API_BASE_URL = "https://gestao-api.dev.br:5501/api/v1";

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      toast.error("Sessão expirada. Faça login novamente.");
    } else if (error.response?.status === 403) {
      toast.error("Acesso negado.");
    } else if (error.response?.status >= 500) {
      toast.error("Erro interno do servidor. Tente novamente.");
    }
    return Promise.reject(error);
  }
);

// Serviços de autenticação
export const authService = {
  login: async (email, senha) => {
    const response = await api.post("/auth/login", { email, senha });
    return response;
  },

  register: async (nome, email, senha) => {
    const response = await api.post("/auth/registro", { nome, email, senha });
    return response.data;
  },

  validateToken: async () => {
    const response = await api.get("/auth/validar");
    return response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put("/auth/perfil", data);
    return response.data;
  },

  logout: async () => {
    const response = await api.post("/auth/logout");
    return response.data;
  },
};

// Serviços de clientes
export const clienteService = {
  listar: async (params) => {
    const response = await api.get("/clientes", { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/clientes/${id}`);
    return response.data;
  },

  buscarPorCpfCnpj: async (cpfCnpj) => {
    const response = await api.get(`/clientes/cpf-cnpj/${cpfCnpj}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/clientes", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/clientes/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/clientes/${id}/toggle-status`);
    return response.data;
  },

  relatorio: async (periodo = 30) => {
    const response = await api.get("/clientes/relatorio/geral", {
      params: { periodo },
    });
    return response.data;
  },
};

// Serviços de produtos
export const produtoService = {
  listar: async (params) => {
    const response = await api.get("/produtos", { params });
    return response;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  buscarPorCodigoBarras: async (codigo) => {
    const response = await api.get(`/produtos/codigo-barras/${codigo}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/produtos", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/produtos/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/produtos/${id}/toggle-status`);
    return response.data;
  },

  listarCategorias: async () => {
    const response = await api.get("/categorias");
    return response.data;
  },

  estoqueBaixo: async () => {
    const response = await api.get("/produtos/estoque/baixo");
    return response.data;
  },

  relatorio: async (periodo = 30) => {
    const response = await api.get("/produtos/relatorio/geral", {
      params: { periodo },
    });
    return response.data;
  },
};

// Serviços de vendas
export const vendaService = {
  listar: async (params) => {
    const response = await api.get("/vendas", { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/vendas/${id}`);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/vendas/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/vendas/${id}`);
    return response.data;
  },

  buscarComFiltros: async (params) => {
    const response = await api.get("/vendas/filtros", { params });
    return response.data;
  },

  resumoPorFormaPagamento: async () => {
    const response = await api.get("/vendas/resumo/forma-pagamento");
    return response.data;
  },

  downloadPdf: async (id) => {
    const response = await api.get(`/vendas/${id}/pdf`);
    return response.data;
  },
};

// Serviços de usuários
export const usuarioMasterService = {
  listar: async (params) => {
    const response = await api.get("/master/usuarios", { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/master/usuarios", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/master/usuarios/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/master/usuarios/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/master/usuarios/${id}/toggle-status`);
    return response.data;
  },
};

export const usuarioService = {
  listar: async (params) => {
    const response = await api.get("/usuarios", { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/usuarios/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/usuarios", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/usuarios/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/usuarios/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/usuarios/${id}/toggle-status`);
    return response.data;
  },
};

// Serviços de empresas
export const empresaService = {
  listar: async (params) => {
    const response = await api.get("/master/empresas", { params });
    return response.data;
  },

  buscarPorId: async (id) => {
    const response = await api.get(`/empresas/${id}`);
    return response.data;
  },

  criar: async (data) => {
    const response = await api.post("/master/empresas", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/master/empresas/${id}`, data);
    return response.data;
  },

  deletar: async (id) => {
    const response = await api.delete(`/master/empresas/${id}`);
    return response.data;
  },

  toggleStatus: async (id) => {
    const response = await api.patch(`/master/empresas/${id}/toggle-status`);
    return response.data;
  },
};

// Serviços de caixa
export const caixaService = {
  buscarDiaAtual: async () => {
    const response = await api.get("/caixa/aberto");
    return response.data;
  },

  abrir: async (data) => {
    const response = await api.post("/caixa", data);
    return response.data;
  },

  atualizar: async (id, data) => {
    const response = await api.put(`/caixa/${id}`, data);
    return response.data;
  },

  criarFluxo: async (data) => {
    const response = await api.post("/caixa/fluxo", data);
    return response.data;
  },

  resumoGeral: async () => {
    const response = await api.get("/caixa/fluxo/relatorioGeral");
    return response.data;
  },

  buscarTodosFluxos: async () => {
    const response = await api.get("/caixa/fluxo/todos");
    return response.data;
  },

  listarMovimentos: async (params) => {
    const response = await api.get(`/movimentos`, { params });
    return response.data;
  },

  cancelarVenda: async (data) => {
    const response = await api.post("/caixa/fluxo", data);
    return response.data;
  },
};

export default api;
