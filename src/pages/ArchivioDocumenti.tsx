import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  Download,
  Calendar,
  Eye,
  Filter,
  FolderOpen,
  File,
  FileImage,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import apiClient, { uploadHelpers } from "../utils/client";

interface Document {
  id: string;
  name: string;
  description?: string;
  category: string;
  uploadDate: string;
  size: string;
  type: string;
  url: string;
}

const ArchivioDocumenti = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔄 Secure Document Fetching with Enhanced Error Handling
  const fetchDocuments = async (showLoadingState = true) => {
    if (showLoadingState) {
      setLoading(true);
    }
    setError(null);

    try {
      console.log('📋 Fetching documents via secure API client...');
      
      // 🌐 Use secure API client instead of direct fetch
      const fetchedDocuments = await apiClient.getAllDocuments();

      // 🔄 Transform documents to match interface
      const transformedDocs: Document[] = fetchedDocuments.map((doc: any) => ({
        id: doc.id || doc._id || `doc-${Date.now()}-${Math.random()}`,
        name: doc.originalName || doc.name || 'Documento senza nome',
        description: doc.description || 'Documento caricato dall\'associazione',
        category: doc.category || 'Generale',
        uploadDate: doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('it-IT') : 'Data non disponibile',
        size: doc.size || uploadHelpers.formatFileSize(0),
        type: doc.type || doc.mimeType?.split('/')[1] || 'unknown',
        url: doc.url || doc.downloadUrl || '#'
      }));

      setDocuments(transformedDocs);
      console.log(`✅ Successfully loaded ${transformedDocs.length} documents`);

    } catch (error) {
      console.error('❌ Document fetch error:', error);
      
      // 🎯 Enhanced Error Handling with User-Friendly Messages
      let errorMessage = 'Errore nel caricamento dei documenti';
      
      if (error instanceof Error) {
        if (error.message.includes('HTTP 401') || error.message.includes('unauthorized')) {
          errorMessage = '🔐 Accesso non autorizzato - Verifica le credenziali';
        } else if (error.message.includes('HTTP 403') || error.message.includes('forbidden')) {
          errorMessage = '🚫 Accesso negato - Permessi insufficienti';
        } else if (error.message.includes('HTTP 404')) {
          errorMessage = '📄 Endpoint non trovato - Servizio non disponibile';
        } else if (error.message.includes('HTTP 500')) {
          errorMessage = '🔧 Errore interno del server - Riprova più tardi';
        } else if (error.message.includes('Timeout') || error.message.includes('timeout')) {
          errorMessage = '⏱️ Richiesta troppo lenta - Controlla la connessione';
        } else if (error.message.includes('NetworkError') || error.message.includes('fetch')) {
          errorMessage = '🌐 Errore di connessione - Verifica la rete';
        } else {
          errorMessage = `❌ ${error.message}`;
        }
      }
      
      setError(errorMessage);
      setDocuments([]); // 🧹 Clear documents on error
    } finally {
      if (showLoadingState) {
        setLoading(false);
      }
    }
  };

  // 🔄 Retry Logic for Failed Requests
  const retryFetch = async () => {
    console.log('🔄 Retrying document fetch...');
    await fetchDocuments(true);
  };

  // 🚀 Initialize Component
  useEffect(() => {
    fetchDocuments();
  }, []);

  // 📊 Dynamic Categories Generation
  const categories = ["all", ...Array.from(new Set(documents.map(doc => doc.category)))];

  // 🔍 Advanced Filtering Logic
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 🎨 Enhanced File Icon Logic
  const getFileIcon = (type: string) => {
    const iconMap: Record<string, JSX.Element> = {
      'pdf': <FileText className="w-5 h-5 text-red-500" />,
      'doc': <FileText className="w-5 h-5 text-blue-500" />,
      'docx': <FileText className="w-5 h-5 text-blue-500" />,
      'jpg': <FileImage className="w-5 h-5 text-green-500" />,
      'jpeg': <FileImage className="w-5 h-5 text-green-500" />,
      'png': <FileImage className="w-5 h-5 text-green-500" />,
      'gif': <FileImage className="w-5 h-5 text-purple-500" />,
      'svg': <FileImage className="w-5 h-5 text-indigo-500" />
    };
    
    return iconMap[type.toLowerCase()] || <File className="w-5 h-5 text-gray-500" />;
  };

  // 📅 Enhanced Date Formatting
  const formatDate = (dateString: string) => {
    try {
      return uploadHelpers.formatDate(dateString);
    } catch {
      return dateString; // Fallback to original string
    }
  };

  // 🔒 Secure Download Handler
  const handleSecureDownload = async (doc: Document) => {
    try {
      console.log(`📥 Initiating secure download: ${doc.name}`);
      
      // 🌐 Use the secure URL from API client
      const response = await fetch(doc.url, {
        method: 'GET',
        headers: {
          'Accept': '*/*'
        }
      });

      if (!response.ok) {
        throw new Error(`Download failed: HTTP ${response.status}`);
      }

      const blob = await response.blob();
      const downloadUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 🧹 Cleanup
      URL.revokeObjectURL(downloadUrl);
      console.log(`✅ Download completed: ${doc.name}`);

    } catch (error) {
      console.error('❌ Download failed:', error);
      // 🚨 Show user-friendly error
      alert(`❌ Errore durante il download: ${error instanceof Error ? error.message : 'Errore sconosciuto'}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* 📋 Enhanced Header Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <FolderOpen className="w-12 h-12 text-primary animate-float" />
              <h1 className="text-5xl md:text-6xl font-bold">
                Archivio <span className="bg-gradient-to-r from-primary via-accent to-heart bg-clip-text text-transparent">Documenti</span>
              </h1>
              <FolderOpen className="w-12 h-12 text-accent animate-float" style={{animationDelay: '0.5s'}} />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Consulta e scarica i documenti ufficiali dell'associazione tramite sistema di accesso sicuro
            </p>
          </div>

          {/* 🔍 Enhanced Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* 🔍 Advanced Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Cerca per nome, descrizione o categoria..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>

              {/* 📂 Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-3 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">Tutte le categorie</option>
                  {categories.filter(cat => cat !== "all").map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {/* 🔄 Refresh Button */}
              <Button
                onClick={() => retryFetch()}
                variant="outline"
                className="px-4 py-3"
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>

            {/* 📊 Results Statistics */}
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>
                {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 'i' : ''} trovato{filteredDocuments.length !== 1 ? 'i' : ''}
                {searchTerm && ` per "${searchTerm}"`}
                {selectedCategory !== "all" && ` in "${selectedCategory}"`}
              </span>
              {documents.length > 0 && (
                <span className="text-xs">
                  ✅ Ultimo aggiornamento: {new Date().toLocaleTimeString('it-IT')}
                </span>
              )}
            </div>
          </div>

          {/* 📄 Documents Display Logic */}
          {loading ? (
            // 🔄 Loading State
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3,4,5,6].map(i => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            // ❌ Error State with Retry Option
            <div className="text-center py-16">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-lg mx-auto">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3 text-destructive">Errore di Caricamento</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={retryFetch} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Riprova
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // 📋 Documents Grid
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDocuments.map((doc, index) => (
                  <Card 
                    key={doc.id}
                    className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up"
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          {getFileIcon(doc.type)}
                          <div className="flex-1">
                            <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-2">
                              {doc.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">
                                {doc.category}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {doc.type.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {doc.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                          {doc.description}
                        </p>
                      )}

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(doc.uploadDate)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>{doc.size}</span>
                        </div>
                      </div>

                      {/* 🔒 Secure Action Buttons */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(doc.url, '_blank', 'noopener,noreferrer')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizza
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSecureDownload(doc)}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* 📭 Empty State */}
              {filteredDocuments.length === 0 && (
                <div className="text-center py-16 animate-fade-in-up">
                  <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-2xl font-semibold mb-4">Nessun documento trovato</h3>
                  <p className="text-muted-foreground mb-6">
                    Non ci sono documenti che corrispondono ai criteri di ricerca.
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                  >
                    Cancella filtri
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* 📞 Enhanced Info Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in-up">
            Hai bisogno di un documento specifico?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Sistema sicuro di gestione documenti. Per assistenza o documenti non presenti, contattaci.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Button asChild size="lg" className="shadow-lg">
              <a href="/contatti">Contattaci</a>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a href="/dashboard" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Gestisci Documenti
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ArchivioDocumenti;