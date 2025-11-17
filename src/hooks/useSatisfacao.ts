import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Satisfacao } from '@/types/database';

export const useSatisfacao = () => {
  return useQuery({
    queryKey: ['satisfacao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('satisfacao')
        .select('*')
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;
      return data as Satisfacao[];
    },
  });
};

export const useSatisfacaoPorEvento = (eventoId: string) => {
  return useQuery({
    queryKey: ['satisfacao-evento', eventoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('satisfacao')
        .select('*')
        .eq('evento_id', eventoId)
        .order('data_avaliacao', { ascending: false });

      if (error) throw error;
      return data as Satisfacao[];
    },
    enabled: !!eventoId,
  });
};

export const useCreateSatisfacao = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (satisfacao: Omit<Satisfacao, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('satisfacao')
        .insert([satisfacao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['satisfacao'] });
    },
  });
};
