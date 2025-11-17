import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Settings, Key, Link2, Database, CheckCircle2, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  JotFormAPI,
  JotFormForm,
  FormConfig,
  saveApiKey,
  getApiKey,
  clearApiKey,
  getFormsConfig,
  updateFormConfig,
} from "@/lib/jotform";
import { syncJotFormSubmissions, FormType, saveFormMapping, getFormMappings } from "@/lib/jotformSync";
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
  const [apiKey, setApiKey] = useState("");
  const [savedApiKey, setSavedApiKey] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [isFetchingForms, setIsFetchingForms] = useState(false);
  const [forms, setForms] = useState<JotFormForm[]>([]);
  const [formsConfig, setFormsConfig] = useState<FormConfig[]>([]);
  const [syncingFormId, setSyncingFormId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [formTypeMappings, setFormTypeMappings] = useState<Record<string, FormType>>({});

  // Load saved API key and form mappings on mount
  useEffect(() => {
    const saved = getApiKey();
    if (saved) {
      setSavedApiKey(saved);
      setApiKey(saved);
      checkConnection(saved);
    }
    setFormsConfig(getFormsConfig());
    setFormTypeMappings(getFormMappings());
  }, []);

  const checkConnection = async (key: string) => {
    try {
      const api = new JotFormAPI(key);
      const connected = await api.testConnection();
      setIsConnected(connected);
      if (connected) {
        await fetchForms(key);
      }
    } catch (error) {
      setIsConnected(false);
    }
  };

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma API Key válida",
        variant: "destructive",
      });
      return;
    }

    try {
      saveApiKey(apiKey.trim());
      setSavedApiKey(apiKey.trim());
      toast({
        title: "Sucesso",
        description: "API Key salva com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao salvar API Key",
        variant: "destructive",
      });
    }
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma API Key",
        variant: "destructive",
      });
      return;
    }

    setIsTestingConnection(true);
    try {
      const api = new JotFormAPI(apiKey.trim());
      const connected = await api.testConnection();
      
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Conexão bem-sucedida! 🎉",
          description: "API Key válida. Buscando formulários...",
        });
        await fetchForms(apiKey.trim());
      } else {
        toast({
          title: "Falha na conexão",
          description: "API Key inválida. Verifique e tente novamente.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível conectar ao JotForm",
        variant: "destructive",
      });
      setIsConnected(false);
    } finally {
      setIsTestingConnection(false);
    }
  };

  const fetchForms = async (key: string) => {
    setIsFetchingForms(true);
    try {
      const api = new JotFormAPI(key);
      const fetchedForms = await api.getForms();
      setForms(fetchedForms);
      
      toast({
        title: "Formulários carregados",
        description: `${fetchedForms.length} formulário(s) encontrado(s)`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao buscar formulários",
        variant: "destructive",
      });
    } finally {
      setIsFetchingForms(false);
    }
  };

  const handleToggleForm = (formId: string, enabled: boolean) => {
    updateFormConfig(formId, { formId, enabled });
    setFormsConfig(getFormsConfig());
    
    toast({
      title: enabled ? "Formulário habilitado" : "Formulário desabilitado",
      description: enabled 
        ? "Este formulário será sincronizado automaticamente" 
        : "Este formulário não será mais sincronizado",
    });
  };

  const handleSyncForm = async (formId: string) => {
    const formType = formTypeMappings[formId];
    if (!formType) {
      toast({
        title: "Erro",
        description: "Selecione o tipo de dados do formulário antes de sincronizar",
        variant: "destructive",
      });
      return;
    }

    setSyncingFormId(formId);
    
    try {
      const result = await syncJotFormSubmissions(formId, formType);
      
      if (result.success) {
        // Update last sync time
        const newConfig = formsConfig.map(c => 
          c.formId === formId ? { ...c, lastSync: new Date().toISOString() } : c
        );
        setFormsConfig(newConfig);
        updateFormConfig(formId, { enabled: true, lastSync: new Date().toISOString() });
        
        toast({
          title: "Sincronização concluída! ✅",
          description: `${result.processed} de ${result.total} registros processados`,
        });
      } else {
        throw new Error(result.error || 'Erro desconhecido');
      }
    } catch (error) {
      toast({
        title: "Erro na sincronização",
        description: error instanceof Error ? error.message : "Não foi possível sincronizar o formulário",
        variant: "destructive",
      });
    } finally {
      setSyncingFormId(null);
    }
  };

  const handleSyncAll = async () => {
    const enabledForms = forms.filter(form => {
      const config = getFormConfig(form.id);
      return config.enabled && formTypeMappings[form.id];
    });

    if (enabledForms.length === 0) {
      toast({
        title: "Nenhum formulário habilitado",
        description: "Configure e habilite os formulários antes de sincronizar",
        variant: "destructive",
      });
      return;
    }

    setIsSyncingAll(true);
    let successCount = 0;
    let errorCount = 0;

    for (const form of enabledForms) {
      try {
        const formType = formTypeMappings[form.id];
        const result = await syncJotFormSubmissions(form.id, formType);
        
        if (result.success) {
          successCount++;
          const newConfig = formsConfig.map(c => 
            c.formId === form.id ? { ...c, lastSync: new Date().toISOString() } : c
          );
          setFormsConfig(newConfig);
          updateFormConfig(form.id, { enabled: true, lastSync: new Date().toISOString() });
        } else {
          errorCount++;
        }
      } catch (error) {
        errorCount++;
        console.error(`Error syncing form ${form.id}:`, error);
      }
    }

    setIsSyncingAll(false);

    if (successCount > 0) {
      toast({
        title: "Sincronização concluída!",
        description: `${successCount} formulário(s) sincronizado(s) com sucesso${errorCount > 0 ? `. ${errorCount} com erro(s)` : ''}`,
      });
    } else {
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar nenhum formulário",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = () => {
    clearApiKey();
    setApiKey("");
    setSavedApiKey(null);
    setIsConnected(false);
    setForms([]);
    
    toast({
      title: "Desconectado",
      description: "API Key removida com sucesso",
    });
  };

  const handleFormTypeChange = (formId: string, formType: FormType) => {
    const newMappings = { ...formTypeMappings, [formId]: formType };
    setFormTypeMappings(newMappings);
    saveFormMapping(formId, formType);
    
    toast({
      title: "Tipo de formulário atualizado",
      description: "Configure o tipo antes de sincronizar os dados",
    });
  };

  const getFormConfig = (formId: string): FormConfig => {
    return formsConfig.find(c => c.formId === formId) || { formId, enabled: false };
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nunca";
    const date = new Date(dateString);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Configure integrações e preferências do sistema
        </p>
      </div>

      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integração com JotForm
          </CardTitle>
          <CardDescription>
            Configure a conexão com sua conta JotForm para importar dados dos formulários
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key do JotForm</Label>
            <div className="flex gap-2">
              <Input 
                id="api-key" 
                type="password" 
                placeholder="Digite sua API Key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                disabled={isConnected}
                className="flex-1"
              />
              {isConnected && (
                <Button 
                  variant="outline" 
                  onClick={handleDisconnect}
                  className="shrink-0"
                >
                  Desconectar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Você pode encontrar sua API Key em{" "}
              <a 
                href="https://www.jotform.com/myaccount/api" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.jotform.com/myaccount/api
              </a>
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSaveApiKey}
              disabled={isConnected || !apiKey.trim()}
              className="bg-gradient-primary"
            >
              <Key className="mr-2 h-4 w-4" />
              Salvar API Key
            </Button>
            <Button 
              variant="outline"
              onClick={handleTestConnection}
              disabled={isTestingConnection || isConnected || !apiKey.trim()}
            >
              {isTestingConnection ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Database className="mr-2 h-4 w-4" />
              )}
              Testar Conexão
            </Button>
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              {isConnected ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
              )}
              <div>
                <h4 className="font-medium text-sm text-foreground mb-1">Status da Conexão</h4>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? "Conectado com sucesso! Seus formulários estão listados abaixo." 
                    : "Não conectado. Configure a API Key para começar a importar dados."
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950/30 p-4">
            <div className="flex items-start gap-3">
              <Settings className="h-5 w-5 text-yellow-600 dark:text-yellow-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-sm text-yellow-900 dark:text-yellow-100 mb-1">
                  Aviso de Segurança
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  Atualmente a API Key está armazenada localmente no navegador. Para produção, 
                  recomendamos conectar o <strong>Lovable Cloud</strong> para armazenamento seguro de credenciais.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms List */}
      {isConnected && (
        <Card className="shadow-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Formulários Disponíveis</CardTitle>
                <CardDescription>
                  Gerencie quais formulários serão sincronizados automaticamente
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={handleSyncAll}
                  disabled={isSyncingAll || isFetchingForms}
                >
                  {isSyncingAll ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Sincronizando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Sincronizar Todos
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => savedApiKey && fetchForms(savedApiKey)}
                  disabled={isFetchingForms}
                >
                  {isFetchingForms ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isFetchingForms ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : forms.length === 0 ? (
              <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
                <Database className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-foreground mb-2">
                  Nenhum formulário encontrado
                </h3>
                <p className="text-sm text-muted-foreground">
                  Não há formulários disponíveis em sua conta JotForm
                </p>
              </div>
            ) : (
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Formulário</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Tipo de Dados</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Última Sincronização</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {forms.map((form) => {
                      const config = getFormConfig(form.id);
                      return (
                        <TableRow key={form.id}>
                          <TableCell className="font-medium">{form.title}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {form.id}
                          </TableCell>
                          <TableCell>
                            <Select
                              value={formTypeMappings[form.id] || ""}
                              onValueChange={(value) => handleFormTypeChange(form.id, value as FormType)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Selecione o tipo" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="evento">Evento</SelectItem>
                                <SelectItem value="venda">Venda</SelectItem>
                                <SelectItem value="profissional">Profissional</SelectItem>
                                <SelectItem value="pagamento">Pagamento</SelectItem>
                                <SelectItem value="satisfacao">Satisfação</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {form.count} respostas
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={config.enabled}
                                onCheckedChange={(checked) => 
                                  handleToggleForm(form.id, checked)
                                }
                              />
                              <span className="text-sm text-muted-foreground">
                                {config.enabled ? "Habilitado" : "Desabilitado"}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {formatDate(config.lastSync)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSyncForm(form.id)}
                              disabled={syncingFormId === form.id || !config.enabled || !formTypeMappings[form.id]}
                              title={!formTypeMappings[form.id] ? "Selecione o tipo de dados primeiro" : ""}
                            >
                              {syncingFormId === form.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RefreshCw className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Configuracoes;
