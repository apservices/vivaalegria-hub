import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, AlertCircle, MessageSquare, TrendingUp, Calendar, Filter, Loader2 } from "lucide-react";
import { useSatisfacao } from "@/hooks/useSatisfacao";
import { useEventos } from "@/hooks/useEventos";
import { useAutoSync } from "@/hooks/useAutoSync";
import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format, isAfter, isBefore, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

const Satisfacao = () => {
  const { isSyncing } = useAutoSync();
  const { data: satisfacoes, isLoading } = useSatisfacao();
  const { data: eventos } = useEventos();
  
  const [notaMinima, setNotaMinima] = useState<string>("0");
  const [tipoEvento, setTipoEvento] = useState<string>("todos");
  const [periodo, setPeriodo] = useState<string>("todos");

  if (isLoading || isSyncing) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        {isSyncing && (
          <p className="text-sm text-muted-foreground">
            Sincronizando dados do JotForm...
          </p>
        )}
      </div>
    );
  }

  // Calcular estatísticas
  const stats = useMemo(() => {
    if (!satisfacoes || satisfacoes.length === 0) {
      return {
        notaMedia: 0,
        notaMediaMes: 0,
        notasPorTipo: {} as Record<string, number>,
        totalAvaliacoes: 0,
        satisfeitos: 0,
        palavrasRecorrentes: {} as Record<string, number>
      };
    }

    const now = new Date();
    const inicioMes = startOfMonth(now);
    const fimMes = endOfMonth(now);

    // Filtrar por período
    let satisfacoesFiltradas = satisfacoes;
    if (periodo === "mes") {
      satisfacoesFiltradas = satisfacoes.filter(s => {
        const data = new Date(s.data_avaliacao);
        return isAfter(data, inicioMes) && isBefore(data, fimMes);
      });
    }

    const notaMedia = satisfacoesFiltradas.reduce((acc, s) => acc + s.nota, 0) / satisfacoesFiltradas.length;
    
    const satisfacoesMes = satisfacoes.filter(s => {
      const data = new Date(s.data_avaliacao);
      return isAfter(data, inicioMes) && isBefore(data, fimMes);
    });
    const notaMediaMes = satisfacoesMes.length > 0 
      ? satisfacoesMes.reduce((acc, s) => acc + s.nota, 0) / satisfacoesMes.length 
      : 0;

    // Notas por tipo de evento
    const notasPorTipo: Record<string, { total: number; count: number }> = {};
    satisfacoesFiltradas.forEach(s => {
      const evento = eventos?.find(e => e.id === s.evento_id);
      if (evento) {
        if (!notasPorTipo[evento.tipo_evento]) {
          notasPorTipo[evento.tipo_evento] = { total: 0, count: 0 };
        }
        notasPorTipo[evento.tipo_evento].total += s.nota;
        notasPorTipo[evento.tipo_evento].count += 1;
      }
    });

    const notasPorTipoMedia = Object.entries(notasPorTipo).reduce((acc, [tipo, { total, count }]) => {
      acc[tipo] = total / count;
      return acc;
    }, {} as Record<string, number>);

    const satisfeitos = satisfacoesFiltradas.filter(s => s.nota >= 8).length;

    // Palavras recorrentes
    const palavrasRecorrentes: Record<string, number> = {};
    satisfacoesFiltradas.forEach(s => {
      if (s.comentario) {
        const palavras = s.comentario
          .toLowerCase()
          .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "")
          .split(/\s+/)
          .filter(p => p.length > 3);
        
        palavras.forEach(palavra => {
          palavrasRecorrentes[palavra] = (palavrasRecorrentes[palavra] || 0) + 1;
        });
      }
    });

    return {
      notaMedia: isNaN(notaMedia) ? 0 : notaMedia,
      notaMediaMes: isNaN(notaMediaMes) ? 0 : notaMediaMes,
      notasPorTipo: notasPorTipoMedia,
      totalAvaliacoes: satisfacoesFiltradas.length,
      satisfeitos,
      palavrasRecorrentes
    };
  }, [satisfacoes, eventos, periodo]);

  // Filtrar satisfações
  const satisfacoesFiltradas = useMemo(() => {
    if (!satisfacoes) return [];
    
    return satisfacoes.filter(s => {
      if (s.nota < parseInt(notaMinima)) return false;
      
      if (tipoEvento !== "todos") {
        const evento = eventos?.find(e => e.id === s.evento_id);
        if (!evento || evento.tipo_evento !== tipoEvento) return false;
      }
      
      if (periodo === "mes") {
        const data = new Date(s.data_avaliacao);
        const inicioMes = startOfMonth(new Date());
        const fimMes = endOfMonth(new Date());
        if (!isAfter(data, inicioMes) || !isBefore(data, fimMes)) return false;
      }
      
      return true;
    });
  }, [satisfacoes, eventos, notaMinima, tipoEvento, periodo]);

  const feedbacksNegativos = useMemo(() => {
    return satisfacoesFiltradas.filter(s => s.nota < 7);
  }, [satisfacoesFiltradas]);

  const topPalavras = useMemo(() => {
    return Object.entries(stats.palavrasRecorrentes)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);
  }, [stats.palavrasRecorrentes]);

  const tiposEventoUnicos = useMemo(() => {
    if (!eventos) return [];
    return Array.from(new Set(eventos.map(e => e.tipo_evento)));
  }, [eventos]);

  const getNotaColor = (nota: number) => {
    if (nota >= 9) return "text-green-600";
    if (nota >= 7) return "text-yellow-600";
    return "text-red-600";
  };

  const getNotaBadge = (nota: number) => {
    if (nota >= 9) return "default";
    if (nota >= 7) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Satisfação de Clientes</h1>
          <p className="text-muted-foreground mt-1">
            Acompanhe feedbacks e avaliações dos clientes
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="shadow-soft">
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Satisfação de Clientes</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe feedbacks e avaliações dos clientes
        </p>
      </div>

      {/* Indicadores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Avaliações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAvaliacoes}</div>
            <p className="text-xs text-muted-foreground mt-1">Total de respostas</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Nota Média Geral
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNotaColor(stats.notaMedia)}`}>
              {stats.notaMedia.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">De 0 a 10</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Nota Média do Mês
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getNotaColor(stats.notaMediaMes)}`}>
              {stats.notaMediaMes.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(), "MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-soft">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Clientes Satisfeitos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.satisfeitos}</div>
            <p className="text-xs text-muted-foreground mt-1">Nota ≥ 8</p>
          </CardContent>
        </Card>
      </div>

      {/* Notas por tipo de evento */}
      {Object.keys(stats.notasPorTipo).length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Nota Média por Tipo de Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {Object.entries(stats.notasPorTipo).map(([tipo, nota]) => (
                <div key={tipo} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <span className="font-medium capitalize">{tipo}</span>
                  <span className={`text-lg font-bold ${getNotaColor(nota)}`}>
                    {nota.toFixed(1)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Período</label>
              <Select value={periodo} onValueChange={setPeriodo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="mes">Mês atual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nota Mínima</label>
              <Select value={notaMinima} onValueChange={setNotaMinima}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Todas</SelectItem>
                  <SelectItem value="5">≥ 5</SelectItem>
                  <SelectItem value="7">≥ 7</SelectItem>
                  <SelectItem value="8">≥ 8</SelectItem>
                  <SelectItem value="9">≥ 9</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo de Evento</label>
              <Select value={tipoEvento} onValueChange={setTipoEvento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {tiposEventoUnicos.map(tipo => (
                    <SelectItem key={tipo} value={tipo} className="capitalize">
                      {tipo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {(notaMinima !== "0" || tipoEvento !== "todos" || periodo !== "todos") && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setNotaMinima("0");
                setTipoEvento("todos");
                setPeriodo("todos");
              }}
            >
              Limpar Filtros
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Feedbacks Negativos */}
      {feedbacksNegativos.length > 0 && (
        <Card className="shadow-card border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Feedbacks Negativos ({feedbacksNegativos.length})
            </CardTitle>
            <CardDescription>
              Avaliações com nota abaixo de 7 que requerem atenção
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feedbacksNegativos.slice(0, 5).map((satisfacao) => {
                const evento = eventos?.find(e => e.id === satisfacao.evento_id);
                return (
                  <div key={satisfacao.id} className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{evento?.nome || "Evento não encontrado"}</p>
                        <p className="text-sm text-muted-foreground">
                          {evento?.cliente} • {format(new Date(satisfacao.data_avaliacao), "dd/MM/yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="destructive">{satisfacao.nota}</Badge>
                    </div>
                    {satisfacao.comentario && (
                      <p className="text-sm text-muted-foreground italic">"{satisfacao.comentario}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Palavras Recorrentes */}
      {topPalavras.length > 0 && (
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Palavras Mais Frequentes nos Comentários</CardTitle>
            <CardDescription>
              Análise dos termos mais mencionados nas avaliações
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {topPalavras.map(([palavra, count]) => (
                <Badge key={palavra} variant="secondary" className="text-sm">
                  {palavra} ({count})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de Feedbacks */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Todos os Feedbacks</CardTitle>
          <CardDescription>
            {satisfacoesFiltradas.length} avaliações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {satisfacoesFiltradas.length === 0 ? (
            <div className="rounded-lg border border-border bg-muted/50 p-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-foreground mb-2">
                Nenhuma avaliação disponível
              </h3>
              <p className="text-sm text-muted-foreground">
                As avaliações de satisfação serão exibidas aqui após a integração com JotForm
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {satisfacoesFiltradas.map((satisfacao) => {
                const evento = eventos?.find(e => e.id === satisfacao.evento_id);
                return (
                  <div key={satisfacao.id} className="p-4 bg-muted/50 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <p className="font-medium">{evento?.nome || "Evento não encontrado"}</p>
                        <p className="text-sm text-muted-foreground">
                          {evento?.cliente} • {format(new Date(satisfacao.data_avaliacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant={getNotaBadge(satisfacao.nota)}>
                        Nota: {satisfacao.nota}
                      </Badge>
                    </div>
                    {satisfacao.comentario && (
                      <p className="text-sm text-foreground mt-2 italic">"{satisfacao.comentario}"</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Satisfacao;
