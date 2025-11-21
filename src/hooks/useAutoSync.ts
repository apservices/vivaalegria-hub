import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { syncAllJotForms } from '@/lib/jotformSync';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const SYNC_INTERVAL_MS = 5 * 60 * 1000;

let globalSyncPromise: Promise<Awaited<ReturnType<typeof syncAllJotForms>>> | null = null;
let globalLastSyncTime: number | null = null;

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

      const persistedLastSync = parseInt(localStorage.getItem('lastAutoSync') || '0');
      const effectiveLastSync = Math.max(globalLastSyncTime ?? 0, persistedLastSync || 0) || null;

      if (effectiveLastSync && Date.now() - effectiveLastSync < SYNC_INTERVAL_MS) {
        setLastSync(new Date(effectiveLastSync));
        return;
      }

      // Avoid triggering parallel syncs across multiple hook consumers
      if (globalSyncPromise) {
        setIsSyncing(true);
        try {
          await globalSyncPromise;
          const updatedTime = globalLastSyncTime ?? effectiveLastSync;
          setLastSync(updatedTime ? new Date(updatedTime) : null);
        } finally {
          setIsSyncing(false);
        }
        return;
      }

      setIsSyncing(true);
      globalSyncPromise = (async () => {
        const result = await syncAllJotForms();
        return result;
      })();

      try {
        const result = await globalSyncPromise;

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
        globalLastSyncTime = now;
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
        globalSyncPromise = null;
      }
    };

    syncAll();
  }, [canSync, queryClient, toast]);

  return { isSyncing, lastSync };
};
