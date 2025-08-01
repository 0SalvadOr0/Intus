import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/lib/supabaseClient";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Image as ImageIcon,
  Database,
  Shield,
  Globe,
  Wrench,
  RefreshCw
} from "lucide-react";
import {
  checkBucketsExist,
  createMissingBuckets,
  getBucketStats,
  formatBytes,
  validateAndFixImageUrl
} from "@/lib/imageUtils";

interface DiagnosticResult {
  test: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

const ImageDiagnostics = () => {
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [isFixing, setIsFixing] = useState(false);
  const [testImages, setTestImages] = useState<string[]>([]);
  const [bucketStats, setBucketStats] = useState<any>(null);

  const runDiagnostics = async () => {
    setIsRunning(true);
    setResults([]);
    setTestImages([]);

    const diagnostics: DiagnosticResult[] = [];

    // Test 1: Verifica connessione Supabase
    try {
      const { data, error } = await supabase.from('blog_posts').select('id').limit(1);
      if (error) {
        diagnostics.push({
          test: "Connessione Database",
          status: 'error',
          message: "Errore connessione database",
          details: error.message
        });
      } else {
        diagnostics.push({
          test: "Connessione Database",
          status: 'success',
          message: "Connessione database OK"
        });
      }
    } catch (error) {
      diagnostics.push({
        test: "Connessione Database",
        status: 'error',
        message: "Errore critico connessione",
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    }

    // Test 2: Verifica bucket con utility
    try {
      const bucketCheck = await checkBucketsExist();

      if (bucketCheck.error) {
        diagnostics.push({
          test: "Bucket Storage",
          status: 'error',
          message: "Errore verifica bucket",
          details: bucketCheck.error
        });
      } else if (!bucketCheck.blogImages && !bucketCheck.projectImages) {
        diagnostics.push({
          test: "Bucket Storage",
          status: 'error',
          message: "Bucket 'blog-images' e 'project-images' non trovati",
          details: "I bucket devono essere creati in Supabase Storage"
        });
      } else if (!bucketCheck.blogImages) {
        diagnostics.push({
          test: "Bucket Storage",
          status: 'warning',
          message: "Bucket 'blog-images' non trovato",
          details: "Solo 'project-images' è disponibile"
        });
      } else if (!bucketCheck.projectImages) {
        diagnostics.push({
          test: "Bucket Storage",
          status: 'warning',
          message: "Bucket 'project-images' non trovato",
          details: "Solo 'blog-images' è disponibile"
        });
      } else {
        diagnostics.push({
          test: "Bucket Storage",
          status: 'success',
          message: "Bucket 'blog-images' e 'project-images' trovati"
        });

        // Ottieni statistiche bucket
        const stats = await getBucketStats();
        setBucketStats(stats);
      }
    } catch (error) {
      diagnostics.push({
        test: "Bucket Storage",
        status: 'error',
        message: "Errore verifica bucket",
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    }

    // Test 3: Verifica immagini blog esistenti
    try {
      const { data: blogPosts, error: blogError } = await supabase
        .from('blog_posts')
        .select('immagini, copertina_url')
        .not('immagini', 'is', null)
        .limit(5);

      if (blogError) {
        diagnostics.push({
          test: "Immagini Blog",
          status: 'error',
          message: "Errore caricamento articoli blog",
          details: blogError.message
        });
      } else if (!blogPosts || blogPosts.length === 0) {
        diagnostics.push({
          test: "Immagini Blog",
          status: 'warning',
          message: "Nessun articolo con immagini trovato",
          details: "Non ci sono articoli con immagini da testare"
        });
      } else {
        let validImages = 0;
        let totalImages = 0;
        const testUrls: string[] = [];

        for (const post of blogPosts) {
          if (post.copertina_url) {
            totalImages++;
            testUrls.push(post.copertina_url);
          }
          if (Array.isArray(post.immagini)) {
            totalImages += post.immagini.length;
            testUrls.push(...post.immagini.slice(0, 2)); // Test solo prime 2 per performance
          }
        }

        // Test accessibilità immagini
        for (const url of testUrls.slice(0, 10)) { // Max 10 test
          try {
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
              validImages++;
            }
          } catch (error) {
            // Errore di rete, immagine non accessibile
          }
        }

        setTestImages(testUrls.slice(0, 5)); // Mostra prime 5 per anteprima

        if (validImages === testUrls.length) {
          diagnostics.push({
            test: "Immagini Blog",
            status: 'success',
            message: `Tutte le immagini sono accessibili (${validImages}/${testUrls.length})`
          });
        } else if (validImages > 0) {
          diagnostics.push({
            test: "Immagini Blog",
            status: 'warning',
            message: `Alcune immagini non sono accessibili (${validImages}/${testUrls.length})`,
            details: "Potrebbero esserci problemi di policy RLS o URL non validi"
          });
        } else {
          diagnostics.push({
            test: "Immagini Blog",
            status: 'error',
            message: "Nessuna immagine è accessibile",
            details: "Possibili problemi: policy RLS, URL non validi, bucket privato"
          });
        }
      }
    } catch (error) {
      diagnostics.push({
        test: "Immagini Blog",
        status: 'error',
        message: "Errore test immagini blog",
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    }

    // Test 4: Verifica immagini progetti esistenti
    try {
      const { data: projects, error: projectsError } = await supabase
        .from('progetti')
        .select('immagini, immagine_copertina')
        .not('immagini', 'is', null)
        .limit(5);

      if (projectsError) {
        if (projectsError.code === 'PGRST116') {
          diagnostics.push({
            test: "Immagini Progetti",
            status: 'warning',
            message: "Tabella 'progetti' non trovata",
            details: "La tabella progetti non è stata ancora creata nel database"
          });
        } else {
          diagnostics.push({
            test: "Immagini Progetti",
            status: 'error',
            message: "Errore caricamento progetti",
            details: projectsError.message
          });
        }
      } else if (!projects || projects.length === 0) {
        diagnostics.push({
          test: "Immagini Progetti",
          status: 'warning',
          message: "Nessun progetto con immagini trovato",
          details: "Non ci sono progetti con immagini da testare"
        });
      } else {
        let validImages = 0;
        let totalImages = 0;

        for (const project of projects) {
          if (project.immagine_copertina) {
            totalImages++;
            try {
              const response = await fetch(project.immagine_copertina, { method: 'HEAD' });
              if (response.ok) validImages++;
            } catch (error) {
              // Errore di rete
            }
          }
          if (Array.isArray(project.immagini)) {
            totalImages += Math.min(project.immagini.length, 2); // Test max 2 per progetto
            for (const img of project.immagini.slice(0, 2)) {
              try {
                const response = await fetch(img, { method: 'HEAD' });
                if (response.ok) validImages++;
              } catch (error) {
                // Errore di rete
              }
            }
          }
        }

        if (validImages === totalImages) {
          diagnostics.push({
            test: "Immagini Progetti",
            status: 'success',
            message: `Tutte le immagini progetti sono accessibili (${validImages}/${totalImages})`
          });
        } else if (validImages > 0) {
          diagnostics.push({
            test: "Immagini Progetti",
            status: 'warning',
            message: `Alcune immagini progetti non sono accessibili (${validImages}/${totalImages})`,
            details: "Potrebbero esserci problemi di policy RLS o URL non validi"
          });
        } else {
          diagnostics.push({
            test: "Immagini Progetti",
            status: 'error',
            message: "Nessuna immagine progetto è accessibile",
            details: "Possibili problemi: policy RLS, URL non validi, bucket privato"
          });
        }
      }
    } catch (error) {
      diagnostics.push({
        test: "Immagini Progetti",
        status: 'error',
        message: "Errore test immagini progetti",
        details: error instanceof Error ? error.message : 'Errore sconosciuto'
      });
    }

    setResults(diagnostics);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800';
      default:
        return '';
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          Diagnostica Problemi Immagini
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          Questo strumento verifica la configurazione delle immagini per blog e progetti.
        </div>

        <Button 
          onClick={runDiagnostics} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Esecuzione diagnostica...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4 mr-2" />
              Avvia Diagnostica
            </>
          )}
        </Button>

        {results.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Risultati Diagnostica</h3>
            
            {results.map((result, index) => (
              <Alert key={index} className={getStatusColor(result.status)}>
                <div className="flex items-start gap-3">
                  {getStatusIcon(result.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <Badge variant={result.status === 'success' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}>
                        {result.status === 'success' ? 'OK' : result.status === 'warning' ? 'ATTENZIONE' : 'ERRORE'}
                      </Badge>
                    </div>
                    <AlertDescription className="text-sm">
                      {result.message}
                      {result.details && (
                        <div className="mt-1 text-xs opacity-75">
                          {result.details}
                        </div>
                      )}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}

            {/* Anteprima immagini test */}
            {testImages.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-md font-medium">Anteprima Immagini Testate</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {testImages.map((url, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-muted">
                      <img
                        src={url}
                        alt={`Test ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement?.classList.add('bg-red-100', 'dark:bg-red-950');
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Suggerimenti per la risoluzione */}
            <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  Suggerimenti per la Risoluzione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <strong>Se le immagini non sono accessibili:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Verifica che i bucket 'blog-images' e 'project-images' esistano in Supabase Storage</li>
                    <li>Controlla le policy RLS sui bucket (dovrebbero essere pubblici per la lettura)</li>
                    <li>Assicurati che gli URL siano corretti e non scaduti</li>
                  </ul>
                </div>
                
                <div>
                  <strong>Per creare i bucket mancanti:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Vai nel pannello Supabase → Storage</li>
                    <li>Crea i bucket 'blog-images' e 'project-images'</li>
                    <li>Imposta le policy per consentire lettura pubblica</li>
                  </ul>
                </div>

                <div>
                  <strong>Per la tabella progetti:</strong>
                  <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                    <li>Esegui lo script SQL per creare la tabella 'progetti'</li>
                    <li>Imposta le policy RLS appropriate</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ImageDiagnostics;
