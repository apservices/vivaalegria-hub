import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface EventoFiltrosProps {
  filtros: {
    dataInicio: string;
    dataFim: string;
    status: string;
    tipoEvento: string;
  };
  onFiltroChange: (key: string, value: string) => void;
  onLimparFiltros: () => void;
}

export const EventoFiltros = ({ filtros, onFiltroChange, onLimparFiltros }: EventoFiltrosProps) => {
  const hasFiltros = filtros.dataInicio || filtros.dataFim || filtros.status || filtros.tipoEvento;

  return (
    <div className="space-y-4 p-4 border border-border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filtros</h3>
        {hasFiltros && (
          <Button variant="ghost" size="sm" onClick={onLimparFiltros}>
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="dataInicio">Data Início</Label>
          <Input
            id="dataInicio"
            type="date"
            value={filtros.dataInicio}
            onChange={(e) => onFiltroChange("dataInicio", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dataFim">Data Fim</Label>
          <Input
            id="dataFim"
            type="date"
            value={filtros.dataFim}
            onChange={(e) => onFiltroChange("dataFim", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filtros.status} onValueChange={(value) => onFiltroChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="pendente">Agendado</SelectItem>
              <SelectItem value="confirmado">Confirmado</SelectItem>
              <SelectItem value="realizado">Realizado</SelectItem>
              <SelectItem value="cancelado">Cancelado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tipoEvento">Tipo de Evento</Label>
          <Select value={filtros.tipoEvento} onValueChange={(value) => onFiltroChange("tipoEvento", value)}>
            <SelectTrigger id="tipoEvento">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="casamento">Casamento</SelectItem>
              <SelectItem value="aniversario">Aniversário</SelectItem>
              <SelectItem value="corporativo">Corporativo</SelectItem>
              <SelectItem value="formatura">Formatura</SelectItem>
              <SelectItem value="outro">Outro</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
