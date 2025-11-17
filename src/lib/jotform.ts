// JotForm API integration utilities
// All JotForm operations now happen through secure edge functions

export interface JotFormForm {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  count: string;
  new: string;
}

export interface FormConfig {
  formId: string;
  enabled: boolean;
  lastSync?: string;
}
