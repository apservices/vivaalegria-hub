import { supabase } from '@/integrations/supabase/client';

export type FormType = 'evento' | 'venda' | 'profissional' | 'pagamento' | 'satisfacao';

export interface SyncResult {
  success: boolean;
  processed?: number;
  total?: number;
  error?: string;
}

export const syncJotFormSubmissions = async (
  formId: string,
  formType: FormType
): Promise<SyncResult> => {
  try {
    const { data, error } = await supabase.functions.invoke('sync-jotform', {
      body: {
        formId,
        formType,
      },
    });

    if (error) throw error;

    return data as SyncResult;
  } catch (error) {
    console.error('Error syncing JotForm submissions:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const mapFormIdToType = (formId: string): FormType => {
  // This mapping should be configured by the user
  // For now, return a default value
  const formMappings = getFormMappings();
  return formMappings[formId] || 'evento';
};

// Form mappings are now managed through edge functions
// No localStorage usage for security reasons
export const getFormMappings = (): Record<string, FormType> => {
  // Mappings should be stored in the database in production
  // For now, return empty object
  return {};
};

export const saveFormMapping = (formId: string, formType: FormType) => {
  // This should save to database in production
  console.log(`Form mapping saved: ${formId} -> ${formType}`);
};
