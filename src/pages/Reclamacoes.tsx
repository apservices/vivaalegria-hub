import { useMemo } from 'react';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KPICard } from '@/components/dashboard/KPICard';
import { useReclamacoes } from '@/hooks/useReclamacoes';
import { useEventos } from '@/hooks/useEventos';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays } from 'date-fns';

export default function Reclamacoes() {
  const { data: reclamacoes, isLoading } = useReclamacoes();
  const { data: eventos } = useEventos();

  const ticketsAbertos = useMemo(() => 
    reclamacoes?.filter(r => !r.descricao?.toLowerCase().includes('resolvid')).length || 0,
    [reclamacoes]
  );

  const ticketsResolvidos = useMemo(() => 
    reclamacoes?.filter(r => r.descricao?.toLowerCase().includes('resolvid')).length || 0,
    [reclamacoes]
  );

  const stats = [
    { title: 'Tickets Abertos', value: ticketsAbertos, icon: AlertTriangle },
    { title: 'Tickets Resolvidos', value: ticketsResolvidos, icon: CheckCircle },
    { title: 'Total de Reclamações', value: reclamacoes?.length || 0, icon: Clock },
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
        <h1 className="text-3xl font-bold tracking-tight">Reclamações</h1>
        <p className="text-muted-foreground">Gestão de tickets e feedbacks negativos</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, index) => (
          <KPICard key={index} {...stat} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Reclamações</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>ID Único</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Tempo em Aberto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Evento</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reclamacoes?.map(reclamacao => {
                const evento = eventos?.find(e => e.id === reclamacao.evento_id);
                const diasAberto = reclamacao.data_abertura 
                  ? differenceInDays(new Date(), new Date(reclamacao.data_abertura))
                  : 0;
                const isResolvido = reclamacao.descricao?.toLowerCase().includes('resolvid');
                
                return (
                  <TableRow key={reclamacao.id}>
                    <TableCell>
                      {reclamacao.data_abertura 
                        ? format(new Date(reclamacao.data_abertura), 'dd/MM/yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell className="font-medium">{reclamacao.nome_cliente || '-'}</TableCell>
                    <TableCell>{reclamacao.identificacao_unica || '-'}</TableCell>
                    <TableCell>{reclamacao.responsavel_abertura || '-'}</TableCell>
                    <TableCell>
                      <span className={diasAberto > 7 && !isResolvido ? 'text-destructive font-medium' : ''}>
                        {diasAberto} dias
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={isResolvido ? 'default' : 'destructive'}>
                        {isResolvido ? 'Resolvido' : 'Aberto'}
                      </Badge>
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
