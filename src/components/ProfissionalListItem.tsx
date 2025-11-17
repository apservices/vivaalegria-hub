import { Badge } from "@/components/ui/badge";
import { User, Calendar, Star, DollarSign } from "lucide-react";

interface ProfissionalListItemProps {
  profissional: {
    id: string;
    nome: string;
    funcao: string;
    ativo: boolean;
    eventos_profissionais?: Array<{
      valor_acordado: number;
      valor_pago: number;
      eventos?: {
        data_evento: string;
        satisfacao?: Array<{ nota: number }>;
      };
    }>;
  };
  onClick: () => void;
}

export const ProfissionalListItem = ({ profissional, onClick }: ProfissionalListItemProps) => {
  const eventosRealizados = profissional.eventos_profissionais?.length || 0;
  
  const valorTotal = profissional.eventos_profissionais?.reduce(
    (acc, ep) => acc + Number(ep.valor_acordado || 0),
    0
  ) || 0;
  
  const valorPago = profissional.eventos_profissionais?.reduce(
    (acc, ep) => acc + Number(ep.valor_pago || 0),
    0
  ) || 0;

  // Calcular avaliação média das satisfações dos eventos
  const avaliacoes = profissional.eventos_profissionais?.flatMap(
    (ep) => ep.eventos?.satisfacao?.map((s) => s.nota) || []
  ) || [];
  
  const mediaAvaliacao = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, nota) => acc + nota, 0) / avaliacoes.length).toFixed(1)
    : null;

  return (
    <div
      onClick={onClick}
      className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{profissional.nome}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>{profissional.funcao}</span>
          </div>
        </div>
        <Badge variant={profissional.ativo ? "default" : "secondary"}>
          {profissional.ativo ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{eventosRealizados} eventos</span>
        </div>
        
        {mediaAvaliacao && (
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <span className="font-medium">{mediaAvaliacao}</span>
          </div>
        )}
        
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">A receber</span>
          <span className="font-medium">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valorTotal - valorPago)}
          </span>
        </div>
        
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Total pago</span>
          <span className="font-medium text-green-600">
            {new Intl.NumberFormat("pt-BR", {
              style: "currency",
              currency: "BRL",
            }).format(valorPago)}
          </span>
        </div>
      </div>
    </div>
  );
};
