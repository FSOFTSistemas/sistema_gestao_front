import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Vendas from "./pages/Vendas";
import Usuarios from "./pages/Usuarios";
import Empresas from "./pages/Empresas";
import "./App.css";

function App() {
  return (
    <AuthProvider>
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
              <Route path="usuarios" element={<Usuarios />} />

              {/* Rotas em desenvolvimento */}
              <Route
                path="vendas"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Vendas - Em desenvolvimento
                    </h1>
                  </div>
                }
              />
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
              <Route path="empresas" element={<Empresas />} />
              <Route
                path="usuarios"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                      Usuários - Em desenvolvimento
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
    </AuthProvider>
  );
}

export default App;
