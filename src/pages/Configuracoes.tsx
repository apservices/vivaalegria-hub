import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, CheckCircle2, XCircle, RefreshCw, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Configuracoes = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-jotform-connection');
      if (error) throw error;
      setIsConnected(data?.connected || false);
    } catch (error) {
      setIsConnected(false);
      toast({
        title: "Erro",
        description: "Verifique se o secret JOTFORM está configurado.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleAutoSync = async () => {
    setIsSyncingAll(true);
    try {
      const { data, error } = await supabase.functions.invoke('sync-all-jotform');
      if (error) throw error;
      
      const stats = data?.stats || {};
      const total = Object.values(stats).reduce((sum: number, val: any) => sum + (val || 0), 0);
      
      toast({
        title: "✅ Sincronização Completa!",
        description: `${total} registros | Vendas: ${stats.vendas || 0} | Eventos: ${stats.eventos || 0} | Profissionais: ${stats.profissionais || 0} | Satisfação: ${stats.satisfacao || 0}`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Falha ao sincronizar",
        variant: "destructive",
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Sincronização JotForm → Vivalegria
          </CardTitle>
          <CardDescription>
            Sincronização automática de todos os formulários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            {isTestingConnection ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isConnected ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500" />
            )}
            <span className="font-medium">
              {isConnected ? "Conectado" : "Desconectado"}
            </span>
          </div>

          {isConnected && (
            <div className="pt-4 border-t space-y-4">
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Detecta automaticamente 7 formulários e mapeia para vendas, eventos, profissionais, satisfação, reclamações e conferências.
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleAutoSync}
                disabled={isSyncingAll}
                className="w-full"
                size="lg"
              >
                {isSyncingAll ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <Zap className="h-5 w-5 mr-2" />
                    Sincronizar Todos os Formulários
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
