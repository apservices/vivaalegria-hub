import { Badge } from "@/components/ui/badge";
import { Calendar, User, Users, Briefcase } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface EventoListItemProps {
  evento: {
    id: string;
    nome: string;
    cliente: string;
    data_evento: string;
    tipo_evento: string;
    status: string;
    eventos_profissionais?: Array<{ id: string }>;
  };
  onClick: () => void;
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

export const EventoListItem = ({ evento, onClick }: EventoListItemProps) => {
  const statusInfo = statusConfig[evento.status as keyof typeof statusConfig] || statusConfig.pendente;
  const tipoInfo = tipoEventoConfig[evento.tipo_evento as keyof typeof tipoEventoConfig] || tipoEventoConfig.outro;
  const numProfissionais = evento.eventos_profissionais?.length || 0;

  return (
    <div
      onClick={onClick}
      className="p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{evento.nome}</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(evento.data_evento), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
            <div className="flex items-center gap-1">
              <User className="h-4 w-4" />
              <span>{evento.cliente}</span>
            </div>
          </div>
        </div>
        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
      </div>
      
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {tipoInfo.icon} {tipoInfo.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">{numProfissionais} profissionais</span>
        </div>
      </div>
    </div>
  );
};
