import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, User, Briefcase, DollarSign, Star, Users } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useEvento } from "@/hooks/useEventos";
import { Skeleton } from "@/components/ui/skeleton";

interface EventoDetalhesProps {
  eventoId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const statusConfig = {
  pendente: { label: "Agendado", variant: "secondary" as const },
  confirmado: { label: "Confirmado", variant: "default" as const },
  realizado: { label: "Realizado", variant: "default" as const },
  cancelado: { label: "Cancelado", variant: "destructive" as const },
};

const tipoEventoConfig = {
  casamento: { label: "Casamento", icon: "💍" },
  aniversario: { label: "Aniversário", icon: "🎂" },
  corporativo: { label: "Corporativo", icon: "🏢" },
  formatura: { label: "Formatura", icon: "🎓" },
  outro: { label: "Outro", icon: "🎉" },
};

const pagamentoStatusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const },
  parcial: { label: "Parcial", variant: "secondary" as const },
  pago: { label: "Pago", variant: "default" as const },
  atrasado: { label: "Atrasado", variant: "destructive" as const },
};

export const EventoDetalhes = ({ eventoId, open, onOpenChange }: EventoDetalhesProps) => {
  const { data: evento, isLoading } = useEvento(eventoId || "");

  if (!eventoId) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Evento</SheetTitle>
          <SheetDescription>Informações completas sobre o evento</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : evento ? (
          <div className="space-y-6 mt-6">
            {/* Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Informações Básicas</span>
                  <Badge variant={statusConfig[evento.status as keyof typeof statusConfig]?.variant || "secondary"}>
                    {statusConfig[evento.status as keyof typeof statusConfig]?.label || evento.status}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-xl mb-2">{evento.nome}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{format(new Date(evento.data_evento), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{evento.cliente}</span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {tipoEventoConfig[evento.tipo_evento as keyof typeof tipoEventoConfig]?.icon}{" "}
                    {tipoEventoConfig[evento.tipo_evento as keyof typeof tipoEventoConfig]?.label || evento.tipo_evento}
                  </span>
                </div>

                {evento.observacoes && (
                  <>
                    <Separator className="my-3" />
                    <div>
                      <p className="text-sm font-medium mb-1">Observações:</p>
                      <p className="text-sm text-muted-foreground">{evento.observacoes}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Situação Financeira */}
            {evento.vendas && evento.vendas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Situação Financeira
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evento.vendas.map((venda: any) => (
                    <div key={venda.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Valor Contratado:</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(venda.valor_total)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Valor Recebido:</span>
                        <span className="font-semibold">
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(venda.valor_recebido)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant={pagamentoStatusConfig[venda.status_pagamento as keyof typeof pagamentoStatusConfig]?.variant || "secondary"}>
                          {pagamentoStatusConfig[venda.status_pagamento as keyof typeof pagamentoStatusConfig]?.label || venda.status_pagamento}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Profissionais Vinculados */}
            {evento.eventos_profissionais && evento.eventos_profissionais.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Profissionais Vinculados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {evento.eventos_profissionais.map((ep: any) => (
                      <div key={ep.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div>
                          <p className="font-medium">{ep.profissionais?.nome}</p>
                          <p className="text-sm text-muted-foreground">{ep.profissionais?.funcao}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(ep.valor_acordado)}
                          </p>
                          <Badge variant={pagamentoStatusConfig[ep.status_pagamento as keyof typeof pagamentoStatusConfig]?.variant || "secondary"}>
                            {pagamentoStatusConfig[ep.status_pagamento as keyof typeof pagamentoStatusConfig]?.label || ep.status_pagamento}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Satisfação do Cliente */}
            {evento.satisfacao && evento.satisfacao.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Satisfação do Cliente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {evento.satisfacao.map((sat: any) => (
                    <div key={sat.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Nota:</span>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < sat.nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {sat.comentario && (
                        <div>
                          <p className="text-sm font-medium mb-1">Comentário:</p>
                          <p className="text-sm text-muted-foreground">{sat.comentario}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Evento não encontrado
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
