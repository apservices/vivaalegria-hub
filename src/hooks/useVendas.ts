import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Venda, VendaComPagamentos } from '@/types/database';

export const useVendas = () => {
  return useQuery({
    queryKey: ['vendas'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendas')
        .select('*')
        .order('data_venda', { ascending: false });

      if (error) throw error;
      return data as Venda[];
    },
  });
};

export const useVendasComPagamentos = () => {
  return useQuery({
    queryKey: ['vendas-com-pagamentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('vendas')
        .select(`
          *,
          pagamentos(*)
        `)
        .order('data_venda', { ascending: false });

      if (error) throw error;
      return data as VendaComPagamentos[];
    },
  });
};

export const useCreateVenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venda: Omit<Venda, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('vendas')
        .insert([venda])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });
};

export const useUpdateVenda = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Venda> & { id: string }) => {
      const { data, error } = await supabase
        .from('vendas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendas'] });
    },
  });
};
