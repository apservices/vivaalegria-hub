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

interface ProfissionalFiltrosProps {
  filtros: {
    funcao: string;
    dataInicio: string;
    dataFim: string;
    status: string;
  };
  funcoes: string[];
  onFiltroChange: (key: string, value: string) => void;
  onLimparFiltros: () => void;
}

export const ProfissionalFiltros = ({ 
  filtros, 
  funcoes, 
  onFiltroChange, 
  onLimparFiltros 
}: ProfissionalFiltrosProps) => {
  const hasFiltros = filtros.funcao || filtros.dataInicio || filtros.dataFim || filtros.status;

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
          <Label htmlFor="funcao">Função</Label>
          <Select value={filtros.funcao} onValueChange={(value) => onFiltroChange("funcao", value)}>
            <SelectTrigger id="funcao">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              {funcoes.map((funcao) => (
                <SelectItem key={funcao} value={funcao}>
                  {funcao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={filtros.status} onValueChange={(value) => onFiltroChange("status", value)}>
            <SelectTrigger id="status">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="ativo">Ativos</SelectItem>
              <SelectItem value="inativo">Inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>

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
      </div>
    </div>
  );
};
