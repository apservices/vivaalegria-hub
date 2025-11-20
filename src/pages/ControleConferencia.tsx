import { useMemo } from 'react';
import { CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { useControleConferencia } from '@/hooks/useControleConferencia';
import { useEventos } from '@/hooks/useEventos';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function ControleConferencia() {
  const { data: conferencias, isLoading } = useControleConferencia();
  const { data: eventos } = useEventos();

  const checklistsPreenchidos = useMemo(() => 
    conferencias?.filter(c => c.checklist_preenchido?.toLowerCase() === 'sim').length || 0,
    [conferencias]
  );

  const divergencias = useMemo(() => 
    conferencias?.filter(c => c.houve_divergencia?.toLowerCase() === 'sim').length || 0,
    [conferencias]
  );

  const itensMaisAusentes = useMemo(() => {
    if (!conferencias) return [];
    
    const itemMap = new Map<string, number>();
    
    conferencias.forEach(c => {
      if (c.itens_ausentes) {
        const itens = c.itens_ausentes.split(',').map(i => i.trim());
        itens.forEach(item => {
          if (item) {
            itemMap.set(item, (itemMap.get(item) || 0) + 1);
          }
        });
      }
    });
    
    return Array.from(itemMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([item, count]) => ({ item, count }));
  }, [conferencias]);

  const percentualChecklists = conferencias && conferencias.length > 0
    ? (checklistsPreenchidos / conferencias.length) * 100
    : 0;

  const stats = [
    { 
      title: 'Checklists Preenchidos', 
      value: `${percentualChecklists.toFixed(0)}%`,
      subtitle: `${checklistsPreenchidos} de ${conferencias?.length || 0}`,
      icon: CheckCircle 
    },
    { title: 'Eventos com Divergência', value: divergencias, icon: AlertTriangle },
    { title: 'Total de Conferências', value: conferencias?.length || 0, icon: Package },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Controle e Conferência</h1>
        <p className="text-muted-foreground">Gestão de materiais e checklists de eventos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <KPICard key={index} {...stat} />
        ))}
      </div>

      {itensMaisAusentes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Itens Mais Frequentemente Ausentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {itensMaisAusentes.map(({ item, count }) => (
                <div key={item} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium">{item}</span>
                  <Badge variant="destructive">{count} vez(es)</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Conferências por Evento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Conferência</TableHead>
                <TableHead>Evento</TableHead>
                <TableHead>Avaliador</TableHead>
                <TableHead>Checklist</TableHead>
                <TableHead>Uniforme</TableHead>
                <TableHead>Divergência</TableHead>
                <TableHead>Caixa Organizada</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conferencias?.map(conferencia => {
                const evento = eventos?.find(e => e.id === conferencia.evento_id);
                
                return (
                  <TableRow key={conferencia.id}>
                    <TableCell>
                      {conferencia.data_conferencia 
                        ? format(new Date(conferencia.data_conferencia), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {evento ? (
                        <span className="text-sm">
                          {evento.nome}
                          <br />
                          <span className="text-muted-foreground">
                            {format(new Date(evento.data_evento), 'dd/MM/yyyy')}
                          </span>
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{conferencia.nome_avaliador || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={conferencia.checklist_preenchido?.toLowerCase() === 'sim' ? 'default' : 'outline'}>
                        {conferencia.checklist_preenchido || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={conferencia.uniforme_usado?.toLowerCase() === 'sim' ? 'default' : 'outline'}>
                        {conferencia.uniforme_usado || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={conferencia.houve_divergencia?.toLowerCase() === 'sim' ? 'destructive' : 'default'}>
                        {conferencia.houve_divergencia || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={conferencia.caixa_organizada?.toLowerCase() === 'sim' ? 'default' : 'outline'}>
                        {conferencia.caixa_organizada || '-'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
