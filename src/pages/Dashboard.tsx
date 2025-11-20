import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, TrendingUp, DollarSign, Calendar as CalendarLucide, CheckCircle2, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEventos } from "@/hooks/useEventos";
import { useVendas } from "@/hooks/useVendas";
import { useAutoSync } from "@/hooks/useAutoSync";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type DateFilterType = "evento" | "venda";

const Dashboard = () => {
  const { isSyncing } = useAutoSync();
  const currentDate = new Date();
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(currentDate));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(currentDate));
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("evento");

  const { data: eventos, isLoading: isLoadingEventos } = useEventos();
  const { data: vendas, isLoading: isLoadingVendas } = useVendas();

  // Filtrar dados baseado no período e tipo de filtro
  const filteredEventos = useMemo(() => {
    if (!eventos) return [];
    
    return eventos.filter((evento) => {
      const eventDate = parseISO(evento.data_evento);
      return isWithinInterval(eventDate, { 
        start: startOfDay(dateFrom), 
        end: endOfDay(dateTo) 
      });
    });
  }, [eventos, dateFrom, dateTo]);

  const filteredVendas = useMemo(() => {
    if (!vendas) return [];
    
    return vendas.filter((venda) => {
      const dateToCheck = dateFilterType === "venda" 
        ? parseISO(venda.data_venda)
        : venda.evento_id 
          ? parseISO(eventos?.find(e => e.id === venda.evento_id)?.data_evento || venda.data_venda)
          : parseISO(venda.data_venda);
      
      return isWithinInterval(dateToCheck, { 
        start: startOfDay(dateFrom), 
        end: endOfDay(dateTo) 
      });
    });
  }, [vendas, eventos, dateFrom, dateTo, dateFilterType]);

  // Calcular indicadores
  const totalEventos = filteredEventos.length;
  
  const faturamentoTotal = filteredVendas.reduce((sum, venda) => sum + Number(venda.valor_total), 0);
  
  const ticketMedio = totalEventos > 0 ? faturamentoTotal / totalEventos : 0;
  
  const totalRecebido = filteredVendas.reduce((sum, venda) => sum + Number(venda.valor_recebido), 0);
  
  const totalPendente = faturamentoTotal - totalRecebido;

  // Preparar dados para gráfico de faturamento diário
  const faturamentoPorDia = useMemo(() => {
    const dailyData: { [key: string]: number } = {};
    
    filteredVendas.forEach((venda) => {
      const date = format(parseISO(venda.data_venda), "dd/MM");
      dailyData[date] = (dailyData[date] || 0) + Number(venda.valor_total);
    });
    
    return Object.entries(dailyData)
      .map(([date, valor]) => ({ date, valor }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredVendas]);

  // Preparar dados para gráfico de eventos por mês
  const eventosPorMes = useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    
    filteredEventos.forEach((evento) => {
      const month = format(parseISO(evento.data_evento), "MMM/yy", { locale: ptBR });
      monthlyData[month] = (monthlyData[month] || 0) + 1;
    });
    
    return Object.entries(monthlyData)
      .map(([mes, quantidade]) => ({ mes, quantidade }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [filteredEventos]);

  // Próximos eventos (ordenados por data)
  const proximosEventos = useMemo(() => {
    return [...filteredEventos]
      .sort((a, b) => new Date(a.data_evento).getTime() - new Date(b.data_evento).getTime())
      .slice(0, 5);
  }, [filteredEventos]);

  const getStatusFinanceiro = (eventoId: string) => {
    const vendaEvento = vendas?.find(v => v.evento_id === eventoId);
    if (!vendaEvento) return { label: "Sem venda", variant: "secondary" as const };
    
    if (vendaEvento.status_pagamento === "pago") return { label: "Pago", variant: "default" as const };
    if (vendaEvento.status_pagamento === "parcial") return { label: "Parcial", variant: "secondary" as const };
    return { label: "Pendente", variant: "destructive" as const };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const stats = [
    {
      title: "Total de Eventos",
      value: totalEventos.toString(),
      description: `No período selecionado`,
      icon: CalendarLucide,
      gradient: "from-primary to-accent",
    },
    {
      title: "Faturamento Total",
      value: formatCurrency(faturamentoTotal),
      description: "Valor total dos contratos",
      icon: TrendingUp,
      gradient: "from-secondary to-blue-400",
    },
    {
      title: "Ticket Médio",
      value: formatCurrency(ticketMedio),
      description: "Valor médio por evento",
      icon: DollarSign,
      gradient: "from-accent to-yellow-400",
    },
    {
      title: "Total Recebido",
      value: formatCurrency(totalRecebido),
      description: `${formatCurrency(totalPendente)} pendente`,
      icon: CheckCircle2,
      gradient: "from-green-500 to-emerald-400",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {(isLoadingEventos || isLoadingVendas || isSyncing) && (
        <div className="flex items-center justify-center p-12 bg-muted/50 rounded-lg">
          <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
          {isSyncing && (
            <p className="text-sm text-muted-foreground">
              Sincronizando dados do JotForm...
            </p>
          )}
          {!isSyncing && <p className="text-sm text-muted-foreground">Carregando dados...</p>}
        </div>
      )}
      
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Visão geral dos principais indicadores da Vivalegria
        </p>
      </div>

      {/* Filtros */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Selecione o período e tipo de data para análise</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Inicial</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={(date) => date && setDateFrom(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Data Final</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP", { locale: ptBR }) : "Selecione a data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={(date) => date && setDateTo(date)}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">Filtrar por</label>
              <Select value={dateFilterType} onValueChange={(value: DateFilterType) => setDateFilterType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evento">Data do Evento</SelectItem>
                  <SelectItem value="venda">Data da Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card 
            key={index} 
            className="hover-scale shadow-soft hover:shadow-card transition-all duration-300"
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg bg-gradient-to-br ${stat.gradient}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Faturamento Diário</CardTitle>
            <CardDescription>Evolução do faturamento no período</CardDescription>
          </CardHeader>
          <CardContent>
            {faturamentoPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={faturamentoPorDia}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Line type="monotone" dataKey="valor" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Eventos por Mês</CardTitle>
            <CardDescription>Quantidade de eventos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {eventosPorMes.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={eventosPorMes}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="mes" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Bar dataKey="quantidade" fill="hsl(var(--accent))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Próximos Eventos */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Próximos Eventos</CardTitle>
          <CardDescription>Eventos agendados para o período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {proximosEventos.length > 0 ? (
            <div className="space-y-4">
              {proximosEventos.map((evento) => {
                const statusFinanceiro = getStatusFinanceiro(evento.id);
                return (
                  <div 
                    key={evento.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CalendarLucide className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">
                          {format(parseISO(evento.data_evento), "dd/MM/yyyy")}
                        </span>
                      </div>
                      <h4 className="font-semibold text-foreground">{evento.nome}</h4>
                      <p className="text-sm text-muted-foreground">Cliente: {evento.cliente}</p>
                      {evento.tipo_evento && (
                        <Badge variant="outline" className="mt-2">
                          {evento.tipo_evento}
                        </Badge>
                      )}
                    </div>
                    <Badge variant={statusFinanceiro.variant}>
                      {statusFinanceiro.label}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum evento encontrado no período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
