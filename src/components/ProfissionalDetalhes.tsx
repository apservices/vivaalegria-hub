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
import { User, Mail, Phone, Calendar, DollarSign, Star, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useProfissionalComEventos } from "@/hooks/useProfissionais";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfissionalDetalhesProps {
  profissionalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const pagamentoStatusConfig = {
  pendente: { label: "Pendente", variant: "secondary" as const },
  parcial: { label: "Parcial", variant: "secondary" as const },
  pago: { label: "Pago", variant: "default" as const },
  atrasado: { label: "Atrasado", variant: "destructive" as const },
};

export const ProfissionalDetalhes = ({ profissionalId, open, onOpenChange }: ProfissionalDetalhesProps) => {
  const { data: profissional, isLoading } = useProfissionalComEventos(profissionalId || "");

  if (!profissionalId) return null;

  const eventosComDatas = profissional?.eventos_profissionais?.filter(
    (ep: any) => ep.eventos
  ) || [];

  const valorTotal = eventosComDatas.reduce(
    (acc: number, ep: any) => acc + Number(ep.valor_acordado || 0),
    0
  );

  const valorPago = eventosComDatas.reduce(
    (acc: number, ep: any) => acc + Number(ep.valor_pago || 0),
    0
  );

  const valorAReceber = valorTotal - valorPago;

  // Calcular avaliações
  const avaliacoes = eventosComDatas.flatMap(
    (ep: any) => ep.eventos?.satisfacao?.map((s: any) => ({ nota: s.nota, comentario: s.comentario })) || []
  );

  const mediaAvaliacao = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc: number, a: any) => acc + a.nota, 0) / avaliacoes.length).toFixed(1)
    : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Detalhes do Profissional</SheetTitle>
          <SheetDescription>Informações completas sobre o profissional</SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : profissional ? (
          <div className="space-y-6 mt-6">
            {/* Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Informações Básicas</span>
                  <Badge variant={profissional.ativo ? "default" : "secondary"}>
                    {profissional.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h3 className="font-semibold text-xl mb-2">{profissional.nome}</h3>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{profissional.funcao}</span>
                </div>

                {profissional.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{profissional.email}</span>
                  </div>
                )}

                {profissional.telefone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{profissional.telefone}</span>
                  </div>
                )}

                {profissional.valor_padrao && (
                  <>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Valor Padrão por Evento:</span>
                      <span className="font-semibold">
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(profissional.valor_padrao)}
                      </span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Resumo Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Acordado:</span>
                  <span className="font-semibold">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valorTotal)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Pago:</span>
                  <span className="font-semibold text-green-600">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valorPago)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">A Receber:</span>
                  <span className="font-bold text-lg">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(valorAReceber)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Avaliações */}
            {mediaAvaliacao && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Avaliações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.round(parseFloat(mediaAvaliacao))
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-2xl font-bold">{mediaAvaliacao}</span>
                    <span className="text-sm text-muted-foreground">
                      ({avaliacoes.length} avaliações)
                    </span>
                  </div>

                  {avaliacoes.some((a: any) => a.comentario) && (
                    <>
                      <Separator />
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Comentários recentes:</p>
                        {avaliacoes
                          .filter((a: any) => a.comentario)
                          .slice(0, 3)
                          .map((a: any, i: number) => (
                            <div key={i} className="text-sm text-muted-foreground italic border-l-2 border-border pl-3">
                              "{a.comentario}"
                            </div>
                          ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Lista de Eventos */}
            {eventosComDatas.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Eventos Realizados ({eventosComDatas.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {eventosComDatas.map((ep: any) => (
                      <div key={ep.id} className="p-3 border border-border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium">{ep.eventos.nome}</p>
                            <p className="text-sm text-muted-foreground">{ep.eventos.cliente}</p>
                          </div>
                          <Badge variant={pagamentoStatusConfig[ep.status_pagamento as keyof typeof pagamentoStatusConfig]?.variant || "secondary"}>
                            {pagamentoStatusConfig[ep.status_pagamento as keyof typeof pagamentoStatusConfig]?.label || ep.status_pagamento}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(ep.eventos.data_evento), "dd/MM/yyyy", { locale: ptBR })}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-medium">
                              {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(ep.valor_acordado)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Pago: {new Intl.NumberFormat("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              }).format(ep.valor_pago)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            Profissional não encontrado
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
