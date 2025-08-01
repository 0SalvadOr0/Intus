import { supabase } from "./supabaseClient";

export interface ImageValidationResult {
  isValid: boolean;
  correctedUrl?: string;
  error?: string;
}

/**
 * Valida e corregge un URL di immagine Supabase
 */
export const validateAndFixImageUrl = async (url: string): Promise<ImageValidationResult> => {
  if (!url || typeof url !== 'string') {
    return { isValid: false, error: 'URL non valido' };
  }

  // Se l'URL è già un URL pubblico completo di Supabase, verificalo
  if (url.includes('supabase.co/storage/v1/object/public/')) {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (response.ok) {
        return { isValid: true, correctedUrl: url };
      } else {
        return { isValid: false, error: `HTTP ${response.status}` };
      }
    } catch (error) {
      return { isValid: false, error: 'Errore di rete' };
    }
  }

  // Se l'URL è un path relativo, prova a convertirlo in URL pubblico
  if (!url.startsWith('http')) {
    const buckets = ['blog-images', 'project-images'];
    
    for (const bucket of buckets) {
      // Rimuovi il bucket dal path se già presente
      const cleanPath = url.replace(`${bucket}/`, '');
      
      try {
        const { data } = supabase.storage.from(bucket).getPublicUrl(cleanPath);
        if (data?.publicUrl) {
          // Verifica se l'URL generato funziona
          const response = await fetch(data.publicUrl, { method: 'HEAD' });
          if (response.ok) {
            return { isValid: true, correctedUrl: data.publicUrl };
          }
        }
      } catch (error) {
        // Continua con il prossimo bucket
        continue;
      }
    }
  }

  return { isValid: false, error: 'Impossibile validare o correggere URL' };
};

/**
 * Verifica se i bucket necessari esistono
 */
export const checkBucketsExist = async (): Promise<{
  blogImages: boolean;
  projectImages: boolean;
  error?: string;
}> => {
  try {
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      return { 
        blogImages: false, 
        projectImages: false, 
        error: error.message 
      };
    }

    const bucketNames = buckets?.map(b => b.name) || [];
    
    return {
      blogImages: bucketNames.includes('blog-images'),
      projectImages: bucketNames.includes('project-images')
    };
  } catch (error) {
    return { 
      blogImages: false, 
      projectImages: false, 
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
};

/**
 * Crea i bucket mancanti se possibile
 */
export const createMissingBuckets = async (): Promise<{
  success: boolean;
  created: string[];
  errors: string[];
}> => {
  const result = {
    success: true,
    created: [] as string[],
    errors: [] as string[]
  };

  const bucketsToCreate = [
    { name: 'blog-images', public: true },
    { name: 'project-images', public: true }
  ];

  for (const bucket of bucketsToCreate) {
    try {
      const { error } = await supabase.storage.createBucket(bucket.name, {
        public: bucket.public
      });

      if (error) {
        if (!error.message.includes('already exists')) {
          result.errors.push(`${bucket.name}: ${error.message}`);
          result.success = false;
        }
      } else {
        result.created.push(bucket.name);
      }
    } catch (error) {
      result.errors.push(`${bucket.name}: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
      result.success = false;
    }
  }

  return result;
};

/**
 * Ottiene statistiche di utilizzo dei bucket
 */
export const getBucketStats = async (): Promise<{
  blogImages: { count: number; totalSize: number; };
  projectImages: { count: number; totalSize: number; };
  error?: string;
}> => {
  const stats = {
    blogImages: { count: 0, totalSize: 0 },
    projectImages: { count: 0, totalSize: 0 }
  };

  try {
    // Stats per blog-images
    const { data: blogFiles, error: blogError } = await supabase.storage
      .from('blog-images')
      .list();

    if (!blogError && blogFiles) {
      stats.blogImages.count = blogFiles.length;
      stats.blogImages.totalSize = blogFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    }

    // Stats per project-images
    const { data: projectFiles, error: projectError } = await supabase.storage
      .from('project-images')
      .list();

    if (!projectError && projectFiles) {
      stats.projectImages.count = projectFiles.length;
      stats.projectImages.totalSize = projectFiles.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
    }

    return stats;
  } catch (error) {
    return {
      ...stats,
      error: error instanceof Error ? error.message : 'Errore sconosciuto'
    };
  }
};

/**
 * Formatta dimensioni in bytes in formato leggibile
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Estrae il nome del bucket da un URL Supabase
 */
export const extractBucketFromUrl = (url: string): string | null => {
  const match = url.match(/\/storage\/v1\/object\/public\/([^\/]+)\//);
  return match ? match[1] : null;
};

/**
 * Estrae il path del file da un URL Supabase
 */
export const extractPathFromUrl = (url: string): string | null => {
  const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
  return match ? match[1] : null;
};
