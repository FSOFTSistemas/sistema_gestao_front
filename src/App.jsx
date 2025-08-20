import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Usuarios from "./pages/Usuarios";
import Empresas from "./pages/Empresas";
import Caixas from "./pages/Caixas";
import "./App.css";
import UsuariosMaster from "./pages/UsuariosMaster";
import VendaDetalhes from "./components/VendaDetalhes";
import PDVWeb from "./pages/PDVWeb";
import ProdutoSelectionWeb from "./components/ProdutoSelectionWeb";
import PagamentoWeb from "./pages/PagamentoWeb";
import ContasReceber from "./pages/ContasReceber";
import ContasPagar from "./pages/ContasPagar";

function App() {
  return (
    <Router>
      <div className="App">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#fff",
              color: "#333",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
            success: {
              iconTheme: {
                primary: "#f97316",
                secondary: "#fff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />

        <Routes>
          {/* Rota de login */}
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="clientes" element={<Clientes />} />
            <Route path="produtos" element={<Produtos />} />
            <Route path="vendas" element={<Vendas />} />
            <Route path="usuariosMaster" element={<UsuariosMaster />} />
            <Route path="empresas" element={<Empresas />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="caixas" element={<Caixas />} />
            <Route path="/vendas/detalhes/:id" element={<VendaDetalhes />} />
            <Route path="/pdv" element={<PDVWeb />} />
            <Route path="/pdv/produtos" element={<ProdutoSelectionWeb />} />
            <Route path="/pdv/pagamento" element={<PagamentoWeb />} />
            <Route path="contasReceber" element={<ContasReceber />} />
            <Route path="contasPagar" element={<ContasPagar />} />

            {/* Rotas em desenvolvimento */}
            <Route
              path="estoque"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Estoque - Em desenvolvimento
                  </h1>
                </div>
              }
            />
            <Route
              path="financeiro"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Financeiro - Em desenvolvimento
                  </h1>
                </div>
              }
            />
            <Route
              path="relatorios"
              element={
                <div className="p-6">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Relatórios - Em desenvolvimento
                  </h1>
                </div>
              }
            />
          </Route>

          {/* Redirecionar rotas não encontradas */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
