import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, ExternalLink, Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";

import { supabase } from "@/lib/supabaseClient";

interface Project {
  id: number;
  titolo: string;
  descrizione_breve: string;
  contenuto: string;
  categoria: string;
  luoghi: string[];
  numero_partecipanti: number;
  immagini: string[];
  immagine_copertina?: string;
  youtube_url?: string;
  status: "completed" | "ongoing" | "planned";
  data_inizio?: string;
  created_at: string;
  pubblicato: boolean;
}

const LeNostreAttivita = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openProjectId, setOpenProjectId] = useState<number|null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Prima verifica se la tabella esiste con una query limitata
      const { data, error } = await supabase
        .from('progetti')
        .select('id')
        .limit(1);

      // Se la prima query va a buon fine, fai la query completa
      if (!error) {
        const { data: fullData, error: fullError } = await supabase
          .from('progetti')
          .select('*')
          .eq('pubblicato', true)
          .order('created_at', { ascending: false });

        if (fullError) throw fullError;
        setProjects(fullData || []);
        setError(null);
        return;
      }

      // Gestione errore dalla prima query
      console.error('Errore nel caricamento progetti:', error.message || error);
      console.error('Dettagli errore Supabase:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });

      // Gestisci errori specifici
      if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
        setError('La tabella "progetti" non è stata ancora creata nel database. Eseguire prima lo script SQL di configurazione.');
      } else if (error.code === '42501') {
        setError('Permessi insufficienti per accedere ai progetti. Verificare le policy RLS su Supabase.');
      } else if (error.code === '42P01') {
        setError('La tabella "progetti" non esiste nel database. Creare la tabella usando lo script SQL fornito.');
      } else {
        setError(`Errore nel caricamento progetti: ${error.message}`);
      }
    } catch (error) {
      console.error('Errore generico:', error instanceof Error ? error.message : error);
      setError('Errore di connessione al database.');
    } finally {
      setLoading(false);
    }
  };

  // Estrai categorie dinamicamente dai progetti
  const allCategories = Array.from(new Set(projects.map(p => p.categoria)));
  const categories = ["all", ...allCategories];

  const filteredProjects = selectedCategory === "all"
    ? projects
    : projects.filter(project => project.categoria === selectedCategory);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "completed": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "ongoing": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "planned": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch(status) {
      case "completed": return "Completato";
      case "ongoing": return "In Corso";
      case "planned": return "Pianificato";
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* Header */}
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Le Nostre <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Attività</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Scopri i progetti che abbiamo realizzato per la comunità. Ogni iniziativa nasce dall'ascolto delle esigenze del territorio e dalla partecipazione attiva dei cittadini.
          </p>
        </div>
      </section>

      {/* Category Filters */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-3 justify-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-300 hover:scale-105"
              >
                {category === "all" ? "Tutte le Categorie" : category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="px-4 pb-16">
        <div className="container mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-muted"></div>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 max-w-lg mx-auto">
                <h3 className="text-xl font-semibold mb-3 text-destructive">⚠️ Errore di Configurazione</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <div className="space-y-3">
                  <Button
                    onClick={fetchProjects}
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    🔄 Riprova
                  </Button>

                  {error.includes('tabella') && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
                      <p className="font-medium">💡 Per risolvere:</p>
                      <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Accedi al pannello Supabase</li>
                        <li>Vai in "SQL Editor"</li>
                        <li>Esegui lo script SQL per creare la tabella "progetti"</li>
                        <li>Clicca "Riprova" sopra</li>
                      </ol>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, index) => (
              <Card 
                key={project.id}
                className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up overflow-hidden"
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
              >
                {/* Project Image */}
                <div className="h-48 relative overflow-hidden">
                  {project.immagine_copertina || (project.immagini && project.immagini[0]) ? (
                    <img
                      src={project.immagine_copertina || project.immagini[0]}
                      alt={project.titolo}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getStatusColor(project.status)} border-0`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  {project.youtube_url && (
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
                      {project.categoria}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {project.titolo}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {project.descrizione_breve}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                      {project.data_inizio ? new Date(project.data_inizio).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Data non specificata'}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {project.luoghi && project.luoghi.length > 0 ? project.luoghi.join(', ') : 'Luogo da definire'}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      {project.numero_partecipanti} partecipanti
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {project.youtube_url && (
                      <Button size="sm" className="flex-1" asChild>
                        <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                          <Play className="w-3 h-3 mr-1" />
                          Video
                        </a>
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => window.location.href = `/progetto/${project.id}`}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Visualizza
                    </Button>
                  </div>
                </CardContent>
              </Card>
                ))}
              </div>

              {filteredProjects.length === 0 && (
                <div className="text-center py-16 animate-fade-in-up">
                  <h3 className="text-2xl font-semibold mb-4">Nessun progetto trovato</h3>
                  <p className="text-muted-foreground">
                    Non ci sono progetti in questa categoria al momento.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10 mt-16">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in-up">
            Vuoi Partecipare ai Nostri <span className="text-primary">Progetti</span>?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Ogni cittadino può contribuire al cambiamento. Contattaci per scoprire come partecipare alle nostre iniziative.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Button asChild size="lg" className="shadow-elegant">
              <Link to="/chi-siamo">Contattaci</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/blog">Scopri di Più</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LeNostreAttivita;
