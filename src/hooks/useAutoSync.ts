import { useEffect, useState } from 'react';
import { syncJotFormSubmissions, FormType } from '@/lib/jotformSync';

const FORM_IDS = {
  evento: '243466215987670',
  venda: '242286762741159',
  profissional: '243466215987670',
};

export const useAutoSync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const syncAll = async () => {
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
        // Sincroniza todos os formulários em paralelo
        const syncPromises = Object.entries(FORM_IDS).map(([type, formId]) =>
          syncJotFormSubmissions(formId, type as FormType)
        );

        await Promise.all(syncPromises);
        
        const now = Date.now();
        localStorage.setItem('lastAutoSync', now.toString());
        setLastSync(new Date(now));
      } catch (error) {
        console.error('Erro na sincronização automática:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncAll();
  }, []);

  return { isSyncing, lastSync };
};
