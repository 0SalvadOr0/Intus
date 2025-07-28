import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardDrive, Image, TrendingDown } from 'lucide-react';

interface StorageStatsProps {
  className?: string;
}

interface StorageInfo {
  totalFiles: number;
  totalSizeBytes: number;
  averageSizeBytes: number;
  estimatedSavings: number;
}

export const StorageStats = ({ className }: StorageStatsProps) => {
  const [stats, setStats] = useState<StorageInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStorageStats();
  }, []);

  const fetchStorageStats = async () => {
    try {
      const { data: files, error } = await supabase.storage
        .from('blog-images')
        .list();

      if (error) {
        console.error('Errore nel recupero statistiche storage:', error);
        return;
      }

      if (!files) return;

      const totalFiles = files.length;
      const totalSizeBytes = files.reduce((sum, file) => sum + (file.metadata?.size || 0), 0);
      const averageSizeBytes = totalFiles > 0 ? totalSizeBytes / totalFiles : 0;
      
      // Stima del risparmio basata sulla compressione media del 60%
      const estimatedSavings = totalSizeBytes * 0.6;

      setStats({
        totalFiles,
        totalSizeBytes,
        averageSizeBytes,
        estimatedSavings
      });
    } catch (error) {
      console.error('Errore nel recupero statistiche:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStorageLevel = (bytes: number): { level: string; color: string } => {
    const mb = bytes / (1024 * 1024);
    if (mb < 50) return { level: 'Ottimale', color: 'bg-green-500' };
    if (mb < 100) return { level: 'Buono', color: 'bg-yellow-500' };
    if (mb < 200) return { level: 'Moderato', color: 'bg-orange-500' };
    return { level: 'Alto', color: 'bg-red-500' };
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Storage Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Impossibile caricare le statistiche</p>
        </CardContent>
      </Card>
    );
  }

  const storageLevel = getStorageLevel(stats.totalSizeBytes);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="w-5 h-5" />
          Statistiche Storage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Totale File</p>
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              <span className="font-medium">{stats.totalFiles}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Spazio Utilizzato</p>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${storageLevel.color}`}></div>
              <span className="font-medium">{formatBytes(stats.totalSizeBytes)}</span>
              <Badge variant="outline" className="text-xs">
                {storageLevel.level}
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Dimensione Media File</p>
          <span className="font-medium">{formatBytes(stats.averageSizeBytes)}</span>
        </div>

        <div className="bg-green-50 dark:bg-green-950 p-3 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Risparmio Stimato</span>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
            Circa {formatBytes(stats.estimatedSavings)} risparmiati grazie alla compressione
          </p>
        </div>

        <div className="text-xs text-muted-foreground">
          💡 Le immagini vengono automaticamente compresse per ottimizzare lo spazio
        </div>
      </CardContent>
    </Card>
  );
};
