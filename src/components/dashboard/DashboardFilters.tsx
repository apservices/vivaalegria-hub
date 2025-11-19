import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface DashboardFiltersProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  dateFilterType: 'evento' | 'venda';
  onDateFilterTypeChange: (type: 'evento' | 'venda') => void;
}

export function DashboardFilters({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  dateFilterType,
  onDateFilterTypeChange,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateFrom ? format(dateFrom, 'dd/MM/yyyy', { locale: ptBR }) : 'Data inicial'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={dateFrom} onSelect={onDateFromChange} initialFocus />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="justify-start text-left font-normal">
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateTo ? format(dateTo, 'dd/MM/yyyy', { locale: ptBR }) : 'Data final'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar mode="single" selected={dateTo} onSelect={onDateToChange} initialFocus />
        </PopoverContent>
      </Popover>

      <Select value={dateFilterType} onValueChange={(v) => onDateFilterTypeChange(v as 'evento' | 'venda')}>
        <SelectTrigger className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="evento">Data do Evento</SelectItem>
          <SelectItem value="venda">Data da Venda</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
