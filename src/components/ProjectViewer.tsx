import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
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
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  MessageCircle,
  Copy
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

    const fallbackToClipboard = async () => {
      try {
        await navigator.clipboard.writeText(`${project.titolo}\n\n${project.descrizione_breve}\n\n${window.location.href}`);
        setCopySuccess(true);
        toast({
          title: "Link copiato! 📋",
          description: "Il link del progetto è stato copiato negli appunti."
        });
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (clipboardError) {
        console.error('Errore copia negli appunti:', clipboardError);
        toast({
          title: "Errore nella condivisione ❌",
          description: "Impossibile condividere o copiare il link.",
          variant: "destructive"
        });
      }
    };

    // Verifica supporto Web Share API e contesto sicuro
    if (navigator.share && window.isSecureContext) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Condivisione completata! ✅",
          description: "Il progetto è stato condiviso con successo."
        });
        return;
      } catch (error) {
        console.error('Errore Web Share API:', error);

        // Se Web Share fallisce (NotAllowedError, ecc.), usa fallback
        if (error instanceof Error &&
            (error.name === 'NotAllowedError' ||
             error.name === 'AbortError' ||
             error.message.includes('Permission denied'))) {
          console.log('Web Share non disponibile, uso fallback clipboard');
          await fallbackToClipboard();
          return;
        }

        // Per altri tipi di errore, prova comunque il fallback
        await fallbackToClipboard();
        return;
      }
    }

    // Fallback diretto se Web Share non è supportato
    await fallbackToClipboard();
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
      <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
        {coverImage ? (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={coverImage}
              alt={project.titolo}
              className="w-full h-full object-cover object-center"
              fallbackClassName="w-full h-full"
              showError={false}
              onError={(url) => console.error('Errore caricamento immagine copertina:', url)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/30 to-heart/30">
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}

        {/* Navigation */}
        <div className="absolute top-8 left-8 z-20">
          <Button
            variant="ghost"
            onClick={() => navigate('/le-nostre-attivita')}
            className="bg-black/20 backdrop-blur-md hover:bg-black/40 border border-white/20 text-white hover:text-white transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Torna ai progetti
          </Button>
        </div>

        {/* Social Share Actions */}
        <div className="absolute top-8 right-8 z-20">
          <div className="flex items-center gap-3">
            {/* Dropdown per condivisione social */}
            <div className="relative group">
              <Button
                variant="ghost"
                className="bg-black/20 backdrop-blur-md hover:bg-black/40 border border-white/20 text-white hover:text-white transition-all duration-300"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Condividi
              </Button>

              {/* Menu a tendina social */}
              <div className="absolute right-0 top-12 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <div className="bg-black/90 backdrop-blur-md rounded-lg border border-white/20 p-2 min-w-[200px] shadow-2xl">
                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="justify-start text-white hover:bg-blue-600/20 hover:text-blue-400"
                    >
                      <Facebook className="w-4 h-4 mr-2" />
                      Facebook
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(project.titolo)}`, '_blank')}
                      className="justify-start text-white hover:bg-sky-600/20 hover:text-sky-400"
                    >
                      <Twitter className="w-4 h-4 mr-2" />
                      Twitter
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                      className="justify-start text-white hover:bg-blue-700/20 hover:text-blue-500"
                    >
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(project.titolo + ' - ' + window.location.href)}`, '_blank')}
                      className="justify-start text-white hover:bg-green-600/20 hover:text-green-400"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleShare}
                      className="justify-start text-white hover:bg-gray-600/20 hover:text-gray-300"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copia link
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {project.youtube_url && (
              <Button
                variant="ghost"
                asChild
                className="bg-red-600/80 backdrop-blur-md text-white hover:bg-red-600 border border-red-600/50 transition-all duration-300"
              >
                <a href={project.youtube_url} target="_blank" rel="noopener noreferrer">
                  <Play className="w-4 h-4 mr-2" />
                  Video
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Contenuto header */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full p-8 md:p-16 text-white">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center gap-4 mb-6 animate-slide-in-left">
                <Badge className={`${getStatusColor(project.status)} shadow-lg backdrop-blur-sm border-0 text-sm px-3 py-1`}>
                  {getStatusLabel(project.status)}
                </Badge>
                <Badge variant="outline" className="bg-white/10 backdrop-blur-sm text-white border-white/30 text-sm px-3 py-1">
                  {project.categoria}
                </Badge>
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 animate-fade-in-up leading-none tracking-tight">
                {project.titolo}
              </h1>

              <p className="text-xl md:text-2xl lg:text-3xl opacity-90 mb-8 max-w-4xl leading-relaxed animate-fade-in-up font-light" style={{animationDelay: '0.2s'}}>
                {project.descrizione_breve}
              </p>

              <div className="flex flex-wrap items-center gap-8 text-lg md:text-xl animate-slide-in-right" style={{animationDelay: '0.4s'}}>
                {project.data_inizio && (
                  <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                    <Calendar className="w-5 h-5 mr-3 text-primary" />
                    <span className="font-medium">{new Date(project.data_inizio).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
                {project.luoghi && project.luoghi.length > 0 && (
                  <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                    <MapPin className="w-5 h-5 mr-3 text-accent" />
                    <span className="font-medium">{project.luoghi.join(', ')}</span>
                  </div>
                )}
                <div className="flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20">
                  <Users className="w-5 h-5 mr-3 text-heart" />
                  <span className="font-medium">{project.numero_partecipanti} partecipanti</span>
                </div>
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
          <VisuallyHidden>
            <DialogTitle>Visualizzazione immagine progetto</DialogTitle>
          </VisuallyHidden>
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
