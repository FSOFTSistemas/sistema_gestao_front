import React, { useEffect, useState } from "react";
import { caixaService } from "../services/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Lock, Unlock } from "lucide-react";

const Caixas = () => {
  const [caixas, setCaixas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alterandoId, setAlterandoId] = useState(null);

  useEffect(() => {
    carregarCaixas();
  }, []);

  const carregarCaixas = async () => {
    setLoading(true);
    try {
      const data = await caixaService.listar();
      setCaixas(data);
    } catch (error) {
      console.error("Erro ao buscar caixas:", error);
    } finally {
      setLoading(false);
    }
  };

  const alterarStatus = async (caixa) => {
    setAlterandoId(caixa.id);
    try {
      if (caixa.status === "aberto") {
        await caixaService.fechar(caixa.id);
      } else {
        await caixaService.abrir(caixa.id);
      }
      await carregarCaixas();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
    } finally {
      setAlterandoId(null);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Caixas</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {caixas.map((caixa) => (
                <tr key={caixa.id} className="border-t">
                  <td className="px-4 py-2">{caixa.id}</td>
                  <td className="px-4 py-2">{caixa.nome}</td>
                  <td className="px-4 py-2">
                    <Badge
                      variant={caixa.status === "aberto" ? "success" : "destructive"}
                    >
                      {caixa.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => alterarStatus(caixa)}
                      disabled={alterandoId === caixa.id}
                    >
                      {alterandoId === caixa.id ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : caixa.status === "aberto" ? (
                        <>
                          <Lock className="w-4 h-4 mr-1" />
                          Fechar
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4 mr-1" />
                          Abrir
                        </>
                      )}
                    </Button>
                  </td>
                </tr>
              ))}

              {caixas.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-gray-500">
                    Nenhum caixa encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Caixas;
