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
  FileImage
} from "lucide-react";

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

  // Mock data per testing - in produzione sarà sostituito con chiamata API
  const mockDocuments: Document[] = [
    {
      id: "1",
      name: "Statuto Associazione",
      description: "Statuto ufficiale dell'Associazione INTUS Corleone APS",
      category: "Documenti Legali",
      uploadDate: "2024-01-15",
      size: "2.4 MB",
      type: "PDF",
      url: "/files/archivio/statuto.pdf"
    },
    {
      id: "2", 
      name: "Bilancio Sociale 2023",
      description: "Bilancio sociale e report attività anno 2023",
      category: "Bilanci",
      uploadDate: "2024-03-20",
      size: "5.1 MB",
      type: "PDF",
      url: "/files/archivio/bilancio-2023.pdf"
    },
    {
      id: "3",
      name: "Regolamento Call Idee Giovani",
      description: "Regolamento completo per la partecipazione al bando Call Idee Giovani",
      category: "Bandi",
      uploadDate: "2024-06-10",
      size: "1.8 MB", 
      type: "PDF",
      url: "/files/archivio/regolamento-call-idee.pdf"
    },
    {
      id: "4",
      name: "Protocollo Sicurezza",
      description: "Protocollo per la sicurezza durante le attività associative",
      category: "Protocolli",
      uploadDate: "2024-02-05",
      size: "950 KB",
      type: "PDF",
      url: "/files/archivio/protocollo-sicurezza.pdf"
    }
  ];

  useEffect(() => {
    // Simula caricamento documenti
    setTimeout(() => {
      setDocuments(mockDocuments);
      setLoading(false);
    }, 1000);
  }, []);

  const categories = ["all", ...Array.from(new Set(documents.map(doc => doc.category)))];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-5 h-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <FileImage className="w-5 h-5 text-green-500" />;
      default:
        return <File className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* Header */}
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
              Consulta e scarica i documenti ufficiali dell'associazione, statuti, bilanci, regolamenti e protocolli
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Cerca documenti per nome o descrizione..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 text-lg"
                />
              </div>

              {/* Category Filter */}
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
            </div>

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 'i' : ''} trovato{filteredDocuments.length !== 1 ? 'i' : ''}
              {searchTerm && ` per "${searchTerm}"`}
              {selectedCategory !== "all" && ` in "${selectedCategory}"`}
            </div>
          </div>

          {/* Documents Grid */}
          {loading ? (
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
            <div className="text-center py-16">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold mb-3 text-destructive">⚠️ Errore</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          ) : (
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
                                {doc.type}
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

                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => window.open(doc.url, '_blank')}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visualizza
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = doc.url;
                            link.download = doc.name;
                            link.click();
                          }}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

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

      {/* Info Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in-up">
            Hai bisogno di un documento specifico?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Se non trovi il documento che stai cercando, contattaci e saremo felici di aiutarti.
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
