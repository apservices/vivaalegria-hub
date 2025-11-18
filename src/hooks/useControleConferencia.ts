import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ControleConferencia } from '@/types/database';

export const useControleConferencia = () => {
  return useQuery({
    queryKey: ['controle_conferencia'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('controle_conferencia')
        .select('*')
        .order('data_conferencia', { ascending: false });

      if (error) throw error;
      return data as ControleConferencia[];
    },
  });
};

export const useControleConferenciaPorEvento = (eventoId: string) => {
  return useQuery({
    queryKey: ['controle_conferencia-evento', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('controle_conferencia')
        .select('*')
        .eq('evento_id', eventoId)
        .order('data_conferencia', { ascending: false });

      if (error) throw error;
      return data as ControleConferencia[];
    },
    enabled: !!eventoId,
  });
};
