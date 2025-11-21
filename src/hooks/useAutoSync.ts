import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncAllJotForms } from '@/lib/jotformSync';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useAutoSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const canSync = useMemo(() => !!user && !loading, [user, loading]);

  useEffect(() => {
    const syncAll = async () => {
      if (!canSync) return;

      // Verifica se já sincronizou nas últimas 5 minutos
      const lastSyncTime = localStorage.getItem('lastAutoSync');
      if (lastSyncTime) {
        const timeSinceLastSync = Date.now() - parseInt(lastSyncTime);
        if (timeSinceLastSync < 5 * 60 * 1000) {
          return;
        }
      }

      setIsSyncing(true);
      try {
        const result = await syncAllJotForms();

        if (!result.success) {
          throw new Error(result.error || 'Falha ao sincronizar dados do JotForm');
        }

        const total = Object.values(result.stats || {}).reduce((sum, value) => sum + (value || 0), 0);

        toast({
          title: 'Dados atualizados',
          description: `${total} registros sincronizados automaticamente dos formulários.`
        });

        await queryClient.invalidateQueries();

        const now = Date.now();
        localStorage.setItem('lastAutoSync', now.toString());
        setLastSync(new Date(now));
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
        toast({
          title: 'Erro ao sincronizar formulários',
          description: error instanceof Error ? error.message : 'Não foi possível atualizar os dados dos formulários.',
          variant: 'destructive'
        });
      } finally {
        setIsSyncing(false);
      }
    };

    syncAll();
  }, [canSync, queryClient, toast]);

  return { isSyncing, lastSync };
};
