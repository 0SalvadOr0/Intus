import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Play,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Clock
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  partner?: Array<{nome: string, link?: string}>;
}

const ProjectViewer = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject(parseInt(id));
    }
  }, [id]);

  const fetchProject = async (projectId: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('progetti')
        .select('*')
        .eq('id', projectId)
        .eq('pubblicato', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          setError('Progetto non trovato');
        } else {
          setError('Errore nel caricamento del progetto');
        }
        return;
      }

      setProject(data);
    } catch (error) {
      console.error('Errore nel caricamento progetto:', error);
      setError('Errore di connessione');
    } finally {
      setLoading(false);
    }
  };

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

  const handleShare = async () => {
    if (!project) return;

    const shareData = {
      title: project.titolo,
      text: project.descrizione_breve,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast({
          title: "Condivisione completata! ✅",
          description: "Il progetto è stato condiviso con successo."
        });
      } else {
        await navigator.clipboard.writeText(`${project.titolo}\n\n${project.descrizione_breve}\n\n${window.location.href}`);
        setCopySuccess(true);
        toast({
          title: "Link copiato! 📋",
          description: "Il link del progetto è stato copiato negli appunti."
        });
        setTimeout(() => setCopySuccess(false), 2000);
      }
    } catch (error) {
      console.error('Errore nella condivisione:', error);
      toast({
        title: "Errore nella condivisione ❌",
        description: "Si è verificato un problema durante la condivisione.",
        variant: "destructive"
      });
    }
  };

  const nextImage = () => {
    if (!project?.immagini) return;
    setSelectedImageIndex((prev) => (prev + 1) % project.immagini.length);
  };

  const prevImage = () => {
    if (!project?.immagini) return;
    setSelectedImageIndex((prev) => (prev - 1 + project.immagini.length) % project.immagini.length);
  };

  const formatContent = (content: string) => {
    if (!content) return "";
    return content
      .split('\n\n')
      .filter(paragraph => paragraph.trim())
      .map(paragraph => paragraph.trim())
      .join('</p><p>');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento progetto...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4 opacity-20">📁</div>
          <h1 className="text-2xl font-bold mb-2">Progetto non trovato</h1>
          <p className="text-muted-foreground mb-6">{error || "Il progetto richiesto non è disponibile."}</p>
          <Button onClick={() => navigate('/le-nostre-attivita')} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna ai progetti
          </Button>
        </div>
      </div>
    );
  }

  const projectImages = project.immagini || [];
  const coverImage = project.immagine_copertina || projectImages[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Header con immagine di copertina */}
      <section className="relative h-[70vh] overflow-hidden">
        {coverImage ? (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={coverImage}
              alt={project.titolo}
              className="w-full h-full object-cover"
              fallbackClassName="w-full h-full"
              showError={false}
              onError={(url) => console.error('Errore caricamento immagine copertina:', url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/20 to-heart/20" />
        )}

        {/* Navigation */}
        <div className="absolute top-6 left-6 z-10">
          <Button
            variant="ghost"
            onClick={() => navigate('/le-nostre-attivita')}
            className="bg-background/80 backdrop-blur-sm hover:bg-background border border-border/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna ai progetti
          </Button>
        </div>

        {/* Azioni */}
        <div className="absolute top-6 right-6 z-10 flex gap-2">
          <Button
            variant="ghost"
            onClick={handleShare}
            className="bg-background/80 backdrop-blur-sm hover:bg-background border border-border/50"
          >
            {copySuccess ? (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Copiato!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 mr-2" />
                Condividi
              </>
            )}
          </Button>
          {project.youtube_url && (
            <Button
              variant="ghost"
              asChild
              className="bg-red-600/80 text-white hover:bg-red-600 border border-red-600/50"
            >
              <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4 mr-2" />
                Video
              </a>
            </Button>
          )}
        </div>

        {/* Contenuto header */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={`${getStatusColor(project.status)} shadow-lg`}>
                {getStatusLabel(project.status)}
              </Badge>
              <Badge variant="outline" className="bg-background/20 backdrop-blur-sm text-white border-white/30">
                {project.categoria}
              </Badge>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
              {project.titolo}
            </h1>
            
            <p className="text-xl md:text-2xl opacity-90 mb-6 max-w-3xl animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              {project.descrizione_breve}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-lg animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              {project.data_inizio && (
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span>{new Date(project.data_inizio).toLocaleDateString('it-IT', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
              )}
              {project.luoghi && project.luoghi.length > 0 && (
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  <span>{project.luoghi.join(', ')}</span>
                </div>
              )}
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                <span>{project.numero_partecipanti} partecipanti</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contenuto principale */}
      <section className="py-16 px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contenuto principale */}
            <div className="lg:col-span-2 space-y-8">
              <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed">
                <h2 className="text-2xl font-bold mb-4">Descrizione del Progetto</h2>
                <div 
                  dangerouslySetInnerHTML={{
                    __html: `<p>${formatContent(project.contenuto)}</p>`
                  }}
                  className="space-y-4"
                />
              </div>

              {/* Galleria immagini */}
              {projectImages.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Galleria</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {projectImages.map((img, i) => (
                      <div
                        key={i}
                        className="group relative overflow-hidden rounded-lg aspect-square cursor-pointer"
                        onClick={() => {
                          setSelectedImageIndex(i);
                          setIsImageModalOpen(true);
                        }}
                      >
                        <ImageWithFallback
                          src={img}
                          alt={`Immagine ${i + 1} del progetto`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          fallbackClassName="w-full h-full"
                          onError={(url) => console.error('Errore caricamento immagine galleria:', url)}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Eye className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Partner */}
              {project.partner && project.partner.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold">Partner</h3>
                  <div className="flex flex-wrap gap-3">
                    {project.partner.map((partner, i) => (
                      <div key={i} className="flex items-center">
                        {partner.link ? (
                          <a
                            href={partner.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                          >
                            {partner.nome}
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <Badge variant="outline" className="px-4 py-2">
                            {partner.nome}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Info card */}
              <div className="bg-card border rounded-lg p-6 sticky top-6">
                <h3 className="font-bold mb-4">Informazioni</h3>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium">Data</div>
                      <div className="text-muted-foreground">
                        {project.data_inizio ? new Date(project.data_inizio).toLocaleDateString('it-IT', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'Da definire'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium">Luogo</div>
                      <div className="text-muted-foreground">
                        {project.luoghi && project.luoghi.length > 0 ? project.luoghi.join(', ') : 'Da definire'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium">Partecipanti</div>
                      <div className="text-muted-foreground">{project.numero_partecipanti}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 text-primary" />
                    <div>
                      <div className="font-medium">Stato</div>
                      <Badge className={`${getStatusColor(project.status)} text-xs`}>
                        {getStatusLabel(project.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Azioni */}
              <div className="space-y-3">
                <Button onClick={handleShare} className="w-full">
                  <Share2 className="w-4 h-4 mr-2" />
                  Condividi progetto
                </Button>
                {project.youtube_url && (
                  <Button variant="outline" className="w-full" asChild>
                    <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                      <Play className="w-4 h-4 mr-2" />
                      Guarda il video
                    </a>
                  </Button>
                )}
                <Button variant="outline" className="w-full" onClick={() => navigate('/le-nostre-attivita')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Altri progetti
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal per immagini */}
      <Dialog open={isImageModalOpen} onOpenChange={setIsImageModalOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 gap-0 bg-black/95">
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </Button>

            {/* Navigation arrows */}
            {projectImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevImage}
                  className="absolute left-4 z-50 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="w-8 h-8" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextImage}
                  className="absolute right-4 z-50 text-white hover:bg-white/20"
                >
                  <ChevronRight className="w-8 h-8" />
                </Button>
              </>
            )}

            {/* Image */}
            <ImageWithFallback
              src={projectImages[selectedImageIndex]}
              alt={`Immagine ${selectedImageIndex + 1} del progetto`}
              className="max-w-full max-h-full object-contain"
              fallbackClassName="max-w-full max-h-full flex items-center justify-center"
              onError={(url) => console.error('Errore caricamento immagine modal:', url)}
            />

            {/* Image counter */}
            {projectImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                {selectedImageIndex + 1} / {projectImages.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectViewer;
