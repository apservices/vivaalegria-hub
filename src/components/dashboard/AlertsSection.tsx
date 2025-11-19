import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Calendar, FileWarning } from 'lucide-react';
import { Venda, Evento, Reclamacao } from '@/types/database';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AlertsSectionProps {
  vendasPendentes: Venda[];
  eventosProximos: Evento[];
  reclamacoesRecentes: Reclamacao[];
}

export function AlertsSection({ vendasPendentes, eventosProximos, reclamacoesRecentes }: AlertsSectionProps) {
  const hasAlerts = vendasPendentes.length > 0 || eventosProximos.length > 0 || reclamacoesRecentes.length > 0;

  if (!hasAlerts) return null;

  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          Alertas e Pendências
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {vendasPendentes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileWarning className="h-4 w-4 text-red-500" />
              Pagamentos Pendentes ({vendasPendentes.length})
            </h4>
            <div className="space-y-1">
              {vendasPendentes.slice(0, 5).map((venda) => (
                <div key={venda.id} className="text-sm text-muted-foreground flex justify-between items-center">
                  <span>{venda.nome_cliente || 'Cliente não informado'}</span>
                  <Badge variant="destructive">R$ {(venda.valor_total - venda.valor_recebido).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {eventosProximos.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Próximos Eventos ({eventosProximos.length})
            </h4>
            <div className="space-y-1">
              {eventosProximos.map((evento) => (
                <div key={evento.id} className="text-sm text-muted-foreground flex justify-between items-center">
                  <span>{evento.cliente}</span>
                  <span className="text-xs">{format(new Date(evento.data_evento), 'dd/MM', { locale: ptBR })}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {reclamacoesRecentes.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              Reclamações Recentes ({reclamacoesRecentes.length})
            </h4>
            <div className="space-y-1">
              {reclamacoesRecentes.map((reclamacao) => (
                <div key={reclamacao.id} className="text-sm text-muted-foreground">
                  {reclamacao.nome_cliente || 'Cliente não informado'} - {reclamacao.descricao?.substring(0, 50)}...
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
