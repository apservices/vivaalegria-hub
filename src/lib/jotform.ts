// JotForm API integration utilities

const JOTFORM_API_BASE = "https://api.jotform.com";
const STORAGE_KEY = "jotform_api_key";
const FORMS_CONFIG_KEY = "jotform_forms_config";

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

export class JotFormAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Test API connection
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(
        `${JOTFORM_API_BASE}/user?apiKey=${this.apiKey}`
      );
      
      if (!response.ok) {
        throw new Error("Invalid API Key");
      }

      const data = await response.json();
      return data.responseCode === 200;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }

  // Get user's forms
  async getForms(): Promise<JotFormForm[]> {
    try {
      const response = await fetch(
        `${JOTFORM_API_BASE}/user/forms?apiKey=${this.apiKey}&limit=100`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch forms");
      }

      const data = await response.json();
      
      if (data.responseCode === 200) {
        return data.content;
      }

      throw new Error("Failed to fetch forms");
    } catch (error) {
      console.error("Error fetching forms:", error);
      throw error;
    }
  }

  // Get form submissions
  async getFormSubmissions(formId: string, limit = 100): Promise<any[]> {
    try {
      const response = await fetch(
        `${JOTFORM_API_BASE}/form/${formId}/submissions?apiKey=${this.apiKey}&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }

      const data = await response.json();
      
      if (data.responseCode === 200) {
        return data.content;
      }

      throw new Error("Failed to fetch submissions");
    } catch (error) {
      console.error("Error fetching submissions:", error);
      throw error;
    }
  }
}

// Storage utilities for API Key
export const saveApiKey = (apiKey: string): void => {
  try {
    localStorage.setItem(STORAGE_KEY, apiKey);
  } catch (error) {
    console.error("Error saving API key:", error);
    throw new Error("Failed to save API key");
  }
};

export const getApiKey = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error getting API key:", error);
    return null;
  }
};

export const clearApiKey = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing API key:", error);
  }
};

// Storage utilities for forms configuration
export const saveFormsConfig = (config: FormConfig[]): void => {
  try {
    localStorage.setItem(FORMS_CONFIG_KEY, JSON.stringify(config));
  } catch (error) {
    console.error("Error saving forms config:", error);
    throw new Error("Failed to save forms configuration");
  }
};

export const getFormsConfig = (): FormConfig[] => {
  try {
    const config = localStorage.getItem(FORMS_CONFIG_KEY);
    return config ? JSON.parse(config) : [];
  } catch (error) {
    console.error("Error getting forms config:", error);
    return [];
  }
};

export const updateFormConfig = (formId: string, updates: Partial<FormConfig>): void => {
  const config = getFormsConfig();
  const existingIndex = config.findIndex(c => c.formId === formId);
  
  if (existingIndex >= 0) {
    config[existingIndex] = { ...config[existingIndex], ...updates };
  } else {
    config.push({ formId, enabled: false, ...updates });
  }
  
  saveFormsConfig(config);
};
