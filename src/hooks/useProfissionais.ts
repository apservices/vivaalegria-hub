import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profissional, ProfissionalComEventos } from '@/types/database';

export const useProfissionais = () => {
  return useQuery({
    queryKey: ['profissionais'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as Profissional[];
    },
  });
};

export const useProfissionaisAtivos = () => {
  return useQuery({
    queryKey: ['profissionais-ativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select('*')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) throw error;
      return data as Profissional[];
    },
  });
};

export const useProfissionalComEventos = (id: string) => {
  return useQuery({
    queryKey: ['profissional-eventos', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profissionais')
        .select(`
          *,
          eventos_profissionais(
            *,
            eventos(
              *,
              satisfacao(*)
            )
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

export const useCreateProfissional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profissional: Omit<Profissional, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('profissionais')
        .insert([profissional])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
  });
};

export const useUpdateProfissional = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Profissional> & { id: string }) => {
      const { data, error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profissionais'] });
    },
  });
};
