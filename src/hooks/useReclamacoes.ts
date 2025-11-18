import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Reclamacao } from '@/types/database';

export const useReclamacoes = () => {
  return useQuery({
    queryKey: ['reclamacoes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reclamacoes')
        .select('*')
        .order('data_abertura', { ascending: false });

      if (error) throw error;
      return data as Reclamacao[];
    },
  });
};

export const useReclamacaoPorEvento = (eventoId: string) => {
  return useQuery({
    queryKey: ['reclamacoes-evento', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reclamacoes')
        .select('*')
        .eq('evento_id', eventoId)
        .order('data_abertura', { ascending: false });

      if (error) throw error;
      return data as Reclamacao[];
    },
    enabled: !!eventoId,
  });
};
