import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Evento, EventoComVenda } from '@/types/database';

export const useEventos = () => {
  return useQuery({
    queryKey: ['eventos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select('*')
        .order('data_evento', { ascending: false });

      if (error) throw error;
      return data as Evento[];
    },
  });
};

export const useEventosComVendas = () => {
  return useQuery({
    queryKey: ['eventos-com-vendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          vendas(*)
        `)
        .order('data_evento', { ascending: false });

      if (error) throw error;
      
      // Map the data to EventoComVenda format
      return (data || []).map(evento => ({
        ...evento,
        venda: evento.vendas?.[0] || undefined
      })) as EventoComVenda[];
    },
  });
};

export const useEvento = (id: string) => {
  return useQuery({
    queryKey: ['evento', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('eventos')
        .select(`
          *,
          vendas(*),
          satisfacao(*),
          eventos_profissionais(
            *,
            profissionais(*)
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateEvento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (evento: Omit<Evento, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('eventos')
        .insert([evento])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};

export const useUpdateEvento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Evento> & { id: string }) => {
      const { data, error } = await supabase
        .from('eventos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventos'] });
    },
  });
};
