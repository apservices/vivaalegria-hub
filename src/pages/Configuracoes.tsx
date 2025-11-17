import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Database, CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { JotFormForm } from "@/lib/jotform";
import { syncJotFormSubmissions, FormType, saveFormMapping, getFormMappings } from "@/lib/jotformSync";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const Configuracoes = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isFetchingForms, setIsFetchingForms] = useState(false);
  const [forms, setForms] = useState<JotFormForm[]>([]);
  const [syncingFormId, setSyncingFormId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [formTypeMappings, setFormTypeMappings] = useState<Record<string, FormType>>({});

  // Check connection and load forms on mount
  useEffect(() => {
    checkConnection();
    setFormTypeMappings(getFormMappings());
  }, []);

  const checkConnection = async () => {
    setIsTestingConnection(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-jotform-connection');
      
      if (error) throw error;
      
      const connected = data?.connected || false;
      setIsConnected(connected);
      
      if (connected) {
        await fetchForms();
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setIsConnected(false);
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao JotForm. Verifique se o secret JOTFORM está configurado.",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fetchForms = async () => {
    setIsFetchingForms(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-jotform-forms');
      
      if (error) throw error;
      
      const fetchedForms: JotFormForm[] = data?.forms || [];
      setForms(fetchedForms);
      console.log(`Loaded ${fetchedForms.length} forms from JotForm`);
    } catch (error) {
      console.error("Error fetching forms:", error);
      toast({
        title: "Erro",
        description: "Falha ao buscar formulários. Verifique se o secret JOTFORM está configurado.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingForms(false);
    }
  };

  const handleRefresh = async () => {
    await checkConnection();
    toast({
      title: "Atualizado",
      description: "Status da conexão atualizado",
    });
  };

  const handleFormTypeChange = (formId: string, formType: FormType) => {
    setFormTypeMappings(prev => ({
      ...prev,
      [formId]: formType
    }));
    saveFormMapping(formId, formType);
    
    toast({
      title: "Tipo salvo",
      description: `Formulário configurado como tipo: ${formType}`,
    });
  };

  const handleSyncForm = async (formId: string) => {
    const formType = formTypeMappings[formId];
    if (!formType) {
      toast({
        title: "Erro",
        description: "Selecione um tipo para este formulário primeiro",
        variant: "destructive",
      });
      return;
    }

    setSyncingFormId(formId);
    try {
      const result = await syncJotFormSubmissions(formId, formType);

      if (result.success) {
        toast({
          title: "Sincronização concluída! 🎉",
          description: `${result.processed || 0} de ${result.total || 0} registros processados`,
        });
      } else {
        toast({
          title: "Erro na sincronização",
          description: result.error || "Erro desconhecido",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao sincronizar formulário",
        variant: "destructive",
      });
    } finally {
      setSyncingFormId(null);
    }
  };

  const handleSyncAll = async () => {
    const formsToSync = forms.filter(form => formTypeMappings[form.id]);
    
    if (formsToSync.length === 0) {
      toast({
        title: "Nenhum formulário configurado",
        description: "Configure o tipo dos formulários antes de sincronizar",
        variant: "destructive",
      });
      return;
    }

    setIsSyncingAll(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const form of formsToSync) {
        const formType = formTypeMappings[form.id];
        try {
          const result = await syncJotFormSubmissions(form.id, formType);
          if (result.success) {
            successCount++;
          } else {
            errorCount++;
          }
        } catch (error) {
          errorCount++;
          console.error(`Erro ao sincronizar ${form.title}:`, error);
        }
      }

      toast({
        title: "Sincronização completa",
        description: `${successCount} formulários sincronizados com sucesso. ${errorCount > 0 ? `${errorCount} com erro.` : ''}`,
      });
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <Settings className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      {/* JotForm Integration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <CardTitle>Integração com JotForm</CardTitle>
          </div>
          <CardDescription>
            A conexão com JotForm é gerenciada através do secret JOTFORM configurado no backend
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <p className="font-medium">
                    Status da Conexão
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Conectado ao JotForm' : 'Não conectado ao JotForm'}
                  </p>
                </div>
              </div>
              <Button
                onClick={handleRefresh}
                disabled={isTestingConnection}
                variant="outline"
                size="sm"
              >
                {isTestingConnection ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Configure o secret JOTFORM no painel de configuração do backend com sua API Key obtida em{" "}
              <a 
                href="https://www.jotform.com/myaccount/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                JotForm API Settings
              </a>
            </p>
          </div>

          {isConnected && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Formulários Disponíveis</h3>
                <div className="flex gap-2">
                  <Button
                    onClick={fetchForms}
                    disabled={isFetchingForms}
                    variant="outline"
                    size="sm"
                  >
                    {isFetchingForms ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    Atualizar
                  </Button>
                  <Button
                    onClick={handleSyncAll}
                    disabled={isSyncingAll || forms.length === 0}
                    size="sm"
                  >
                    {isSyncingAll ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Sincronizar Todos
                  </Button>
                </div>
              </div>

              {forms.length > 0 ? (
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Formulário</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Submissões</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {forms.map((form) => (
                        <TableRow key={form.id}>
                          <TableCell className="font-medium">
                            {form.title}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                form.status === "ENABLED"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {form.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={formTypeMappings[form.id] || ""}
                              onValueChange={(value) =>
                                handleFormTypeChange(form.id, value as FormType)
                              }
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="evento">Evento</SelectItem>
                                <SelectItem value="venda">Venda</SelectItem>
                                <SelectItem value="profissional">
                                  Profissional
                                </SelectItem>
                                <SelectItem value="pagamento">
                                  Pagamento
                                </SelectItem>
                                <SelectItem value="satisfacao">
                                  Satisfação
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {form.count} total
                            </Badge>
                            {form.new !== "0" && (
                              <Badge variant="secondary" className="ml-2">
                                {form.new} novas
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleSyncForm(form.id)}
                              disabled={
                                syncingFormId === form.id ||
                                !formTypeMappings[form.id]
                              }
                              size="sm"
                              variant="outline"
                            >
                              {syncingFormId === form.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                "Sincronizar"
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {isFetchingForms ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <p>Buscando formulários...</p>
                    </div>
                  ) : (
                    <p>Não há formulários disponíveis em sua conta JotForm</p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instructions Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como configurar a integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-semibold">1. Configure o secret JOTFORM</h4>
            <p className="text-sm text-muted-foreground">
              Acesse o painel de configuração do backend e configure o secret JOTFORM com sua API Key do JotForm.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">2. Obtenha sua API Key</h4>
            <p className="text-sm text-muted-foreground">
              Acesse{" "}
              <a
                href="https://www.jotform.com/myaccount/api"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                JotForm API Settings
              </a>{" "}
              para obter sua API Key.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">3. Configure os tipos de formulários</h4>
            <p className="text-sm text-muted-foreground">
              Para cada formulário, selecione o tipo correspondente (Evento, Venda, Profissional, Pagamento ou Satisfação).
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold">4. Sincronize os dados</h4>
            <p className="text-sm text-muted-foreground">
              Clique em "Sincronizar" para importar os dados de cada formulário ou use "Sincronizar Todos" para importar todos de uma vez.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Configuracoes;
