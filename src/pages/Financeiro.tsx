import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, DollarSign, TrendingUp, Download, FileText, Loader2 } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfDay, endOfDay, isWithinInterval, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useEventos } from "@/hooks/useEventos";
import { useVendas } from "@/hooks/useVendas";
import { useAutoSync } from "@/hooks/useAutoSync";
import { toast } from "sonner";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

type DateFilterType = "evento" | "venda";
type StatusFilter = "all" | "pago" | "pendente" | "parcial" | "atrasado";

const Financeiro = () => {
  const { isSyncing } = useAutoSync();
  const currentDate = new Date();
  const [dateFrom, setDateFrom] = useState<Date>(startOfMonth(currentDate));
  const [dateTo, setDateTo] = useState<Date>(endOfMonth(currentDate));
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("venda");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tipoEventoFilter, setTipoEventoFilter] = useState<string>("all");

  const { data: eventos, isLoading: isLoadingEventos } = useEventos();
  const { data: vendas, isLoading: isLoadingVendas } = useVendas();

  // Filtrar vendas
  const filteredVendas = useMemo(() => {
    if (!vendas) return [];
    
    return vendas.filter((venda) => {
      // Filtro de período
      const dateToCheck = dateFilterType === "venda" 
        ? parseISO(venda.data_venda)
        : venda.evento_id 
          ? parseISO(eventos?.find(e => e.id === venda.evento_id)?.data_evento || venda.data_venda)
          : parseISO(venda.data_venda);
      
      const inPeriod = isWithinInterval(dateToCheck, { 
        start: startOfDay(dateFrom), 
        end: endOfDay(dateTo) 
      });

      if (!inPeriod) return false;

      // Filtro de status
      if (statusFilter !== "all" && venda.status_pagamento !== statusFilter) return false;

      // Filtro de tipo de evento
      if (tipoEventoFilter !== "all" && venda.evento_id) {
        const evento = eventos?.find(e => e.id === venda.evento_id);
        if (!evento || evento.tipo_evento !== tipoEventoFilter) return false;
      }

      return true;
    });
  }, [vendas, eventos, dateFrom, dateTo, dateFilterType, statusFilter, tipoEventoFilter]);

  // Calcular indicadores
  const faturamentoDiario = useMemo(() => {
    const today = new Date();
    return filteredVendas
      .filter(v => {
        const vendaDate = parseISO(v.data_venda);
        return vendaDate.toDateString() === today.toDateString();
      })
      .reduce((sum, venda) => sum + Number(venda.valor_total), 0);
  }, [filteredVendas]);

  const faturamentoMensal = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return filteredVendas
      .filter(v => {
        const vendaDate = parseISO(v.data_venda);
        return vendaDate.getMonth() === currentMonth && vendaDate.getFullYear() === currentYear;
      })
      .reduce((sum, venda) => sum + Number(venda.valor_total), 0);
  }, [filteredVendas]);

  const faturamentoAcumulado = filteredVendas.reduce((sum, venda) => sum + Number(venda.valor_total), 0);
  
  const totalRecebido = filteredVendas.reduce((sum, venda) => sum + Number(venda.valor_recebido), 0);
  
  const totalPendente = faturamentoAcumulado - totalRecebido;

  // Dados para gráfico de faturamento ao longo do tempo
  const faturamentoTempoData = useMemo(() => {
    const dailyData: { [key: string]: { total: number, recebido: number } } = {};
    
    filteredVendas.forEach((venda) => {
      const date = format(parseISO(venda.data_venda), "dd/MM");
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, recebido: 0 };
      }
      dailyData[date].total += Number(venda.valor_total);
      dailyData[date].recebido += Number(venda.valor_recebido);
    });
    
    return Object.entries(dailyData)
      .map(([date, valores]) => ({ 
        date, 
        total: valores.total,
        recebido: valores.recebido 
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredVendas]);

  // Dados para gráfico recebido vs pendente
  const recebidoVsPendenteData = [
    { name: "Recebido", valor: totalRecebido, fill: "hsl(var(--accent))" },
    { name: "Pendente", valor: totalPendente, fill: "hsl(var(--destructive))" },
  ];

  // Tipos de evento únicos para filtro
  const tiposEvento = useMemo(() => {
    if (!eventos) return [];
    return Array.from(new Set(eventos.map(e => e.tipo_evento))).filter(Boolean);
  }, [eventos]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pago": return "default";
      case "parcial": return "secondary";
      case "pendente": return "outline";
      case "atrasado": return "destructive";
      default: return "outline";
    }
  };

  const exportToCSV = () => {
    const headers = ["ID", "Evento", "Cliente", "Data Venda", "Data Evento", "Valor Total", "Valor Recebido", "Status"];
    
    const rows = filteredVendas.map(venda => {
      const evento = eventos?.find(e => e.id === venda.evento_id);
      return [
        venda.id,
        evento?.nome || "-",
        evento?.cliente || "-",
        format(parseISO(venda.data_venda), "dd/MM/yyyy"),
        evento ? format(parseISO(evento.data_evento), "dd/MM/yyyy") : "-",
        formatCurrency(Number(venda.valor_total)),
        formatCurrency(Number(venda.valor_recebido)),
        venda.status_pagamento,
      ];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `financeiro_${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Relatório exportado com sucesso!");
  };

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
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground mt-1">
            Análise detalhada de vendas e pagamentos
          </p>
        </div>
        <Button onClick={exportToCSV} className="gap-2">
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      {/* Filtros */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Personalize a visualização dos dados financeiros</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
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
                    {dateFrom ? format(dateFrom, "dd/MM/yy") : "Selecione"}
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

            <div>
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
                    {dateTo ? format(dateTo, "dd/MM/yy") : "Selecione"}
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

            <div>
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

            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={(value: StatusFilter) => setStatusFilter(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="parcial">Parcial</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="atrasado">Atrasado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Tipo de Evento</label>
              <Select value={tipoEventoFilter} onValueChange={setTipoEventoFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tiposEvento.map((tipo) => (
                    <SelectItem key={String(tipo)} value={String(tipo)}>
                      {String(tipo)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Indicadores */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="shadow-soft hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Diário</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(faturamentoDiario)}</div>
            <p className="text-xs text-muted-foreground mt-1">Hoje</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(faturamentoMensal)}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Acumulado</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(faturamentoAcumulado)}</div>
            <p className="text-xs text-muted-foreground mt-1">Período selecionado</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <DollarSign className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalRecebido)}</div>
            <p className="text-xs text-muted-foreground mt-1">Pagamentos confirmados</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-card transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
            <DollarSign className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalPendente)}</div>
            <p className="text-xs text-muted-foreground mt-1">A receber</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Faturamento ao Longo do Tempo</CardTitle>
            <CardDescription>Total faturado vs recebido por dia</CardDescription>
          </CardHeader>
          <CardContent>
            {faturamentoTempoData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={faturamentoTempoData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="total" stroke="hsl(var(--primary))" name="Total" strokeWidth={2} />
                  <Line type="monotone" dataKey="recebido" stroke="hsl(var(--accent))" name="Recebido" strokeWidth={2} />
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
            <CardTitle>Recebido vs Pendente</CardTitle>
            <CardDescription>Distribuição dos valores</CardDescription>
          </CardHeader>
          <CardContent>
            {faturamentoAcumulado > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={recebidoVsPendenteData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="valor"
                  >
                    {recebidoVsPendenteData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Vendas */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle>Detalhamento de Vendas</CardTitle>
          <CardDescription>Lista completa de contratos no período selecionado</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredVendas.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Evento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data Venda</TableHead>
                    <TableHead>Data Evento</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-right">Valor Recebido</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendas.map((venda) => {
                    const evento = eventos?.find(e => e.id === venda.evento_id);
                    return (
                      <TableRow key={venda.id}>
                        <TableCell className="font-medium">{evento?.nome || "-"}</TableCell>
                        <TableCell>{evento?.cliente || "-"}</TableCell>
                        <TableCell>{format(parseISO(venda.data_venda), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          {evento ? format(parseISO(evento.data_evento), "dd/MM/yyyy") : "-"}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(Number(venda.valor_total))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(Number(venda.valor_recebido))}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(venda.status_pagamento)}>
                            {venda.status_pagamento}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma venda encontrada com os filtros selecionados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Financeiro;
