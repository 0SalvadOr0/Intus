import { toast } from "@/hooks/use-toast";

// Utility per gestire errori di Supabase in modo consistente
export const handleSupabaseError = (error: any, context: string) => {
  console.error(`Error in ${context}:`, error);
  
  // Gestione errori specifici di Supabase
  if (error?.code === 'PGRST116' || error?.code === '42P01') {
    toast({
      title: "Risorsa non disponibile",
      description: "La risorsa richiesta non è attualmente configurata nel sistema.",
      variant: "destructive"
    });
    return false;
  }
  
  if (error?.code === 'PGRST301') {
    toast({
      title: "Dati non trovati",
      description: "Le informazioni richieste non sono state trovate.",
      variant: "destructive"
    });
    return false;
  }
  
  if (error?.message?.includes('JWT')) {
    toast({
      title: "Sessione scaduta",
      description: "La tua sessione è scaduta. Ricarica la pagina.",
      variant: "destructive"
    });
    return false;
  }
  
  // Errore generico
  toast({
    title: "Errore di caricamento",
    description: `Si è verificato un errore durante ${context}. Riprova più tardi.`,
    variant: "destructive"
  });
  return false;
};

// Utility per gestire errori di rete
export const handleNetworkError = (error: any, context: string) => {
  console.error(`Network error in ${context}:`, error);
  
  if (!navigator.onLine) {
    toast({
      title: "Connessione assente",
      description: "Verifica la tua connessione internet e riprova.",
      variant: "destructive"
    });
    return false;
  }
  
  if (error?.name === 'AbortError') {
    // Richiesta cancellata, non mostrare errore
    return false;
  }
  
  toast({
    title: "Errore di connessione",
    description: `Impossibile connettersi al server durante ${context}.`,
    variant: "destructive"
  });
  return false;
};

// Utility per retry automatico con backoff esponenziale
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      
      const retryDelay = delay * Math.pow(2, i) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  return null;
};

// Utility per gestire caricamento con fallback
export const withFallback = async <T>(
  primary: () => Promise<T>,
  fallback: T,
  context: string
): Promise<T> => {
  try {
    return await primary();
  } catch (error) {
    console.warn(`Failed to load ${context}, using fallback:`, error);
    return fallback;
  }
};

// Utility per validare e sanitizzare dati API
export const validateApiResponse = <T>(data: any, validator: (data: any) => data is T): T | null => {
  if (!data) return null;
  
  try {
    if (validator(data)) {
      return data;
    }
    console.warn('Invalid API response structure:', data);
    return null;
  } catch (error) {
    console.error('Error validating API response:', error);
    return null;
  }
};

// Type guards per validazione dati
export const isValidBlogPost = (data: any): data is any => {
  return data && 
         typeof data.id === 'number' &&
         typeof data.titolo === 'string' &&
         typeof data.contenuto === 'string';
};

export const isValidProject = (data: any): data is any => {
  return data && 
         typeof data.id === 'number' &&
         typeof data.titolo === 'string' &&
         typeof data.descrizione_breve === 'string';
};

// Utility per gestire stati di caricamento con timeout
export const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  timeoutMessage: string = "Operazione scaduta"
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    )
  ]);
};

// Utility per gestire cache locale con fallback
export class LocalCache {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  static set(key: string, data: any, ttlMs: number = 5 * 60 * 1000) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }
  
  static get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  static clear() {
    this.cache.clear();
  }
}
