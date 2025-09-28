import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { sanitizeHtml } from "@/lib/sanitizeHtml";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";
import { Calendar, User, Search, Filter, ArrowRight, X, Clock, Share2, Check, Copy } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { BlogCardSkeleton } from "@/components/ui/loading-skeleton";
import { toast } from "@/hooks/use-toast";

interface BlogPost {
  id: number;
  titolo: string;
  contenuto: string; // 📝 Added missing content field
  excerpt: string;
  autore: string;
  created_at: string;
  categoria: string;
  immagini: string[];
  copertina_url: string;
  youtube_url?: string;
}

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openPostId, setOpenPostId] = useState<number|null>(null);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false); // 🎯 Share functionality state

  // 📊 Calculate reading time (based on 200 words per minute)
  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  // 🔗 Share functionality implementation
  const handleShare = async (post: BlogPost) => {
    const shareUrl = `${window.location.origin}/share/blog/${post.id}`;
    const shareText = `${post.titolo}\n\n${post.excerpt}\n\n${shareUrl}`;
    const shareData = {
      title: post.titolo,
      text: post.excerpt,
      url: shareUrl
    };

    // Check if APIs are actually usable (not just available)
    const isWebShareUsable = async () => {
      if (!navigator.share || !window.isSecureContext) return false;
      try {
        // Test if we can use Web Share with a minimal payload
        return navigator.canShare && navigator.canShare(shareData);
      } catch {
        return false;
      }
    };

    const isClipboardUsable = async () => {
      if (!navigator.clipboard) return false;
      try {
        // Check clipboard permissions
        const permission = await navigator.permissions.query({ name: 'clipboard-write' as PermissionName });
        return permission.state === 'granted' || permission.state === 'prompt';
      } catch {
        return false;
      }
    };

    // Reliable manual copy method
    const manualCopy = () => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = shareText;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices

        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);

        if (successful) {
          setCopySuccess(true);
          toast({
            title: "Link copiato! 📋",
            description: "Il link dell'articolo è stato copiato negli appunti."
          });
          setTimeout(() => setCopySuccess(false), 2000);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Errore copia manuale:', error);
        return false;
      }
    };

    // Try Web Share only if it's actually usable
    if (await isWebShareUsable()) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Condivisione completata! ✅",
          description: "L'articolo è stato condiviso con successo."
        });
        return;
      } catch (error) {
        // If user cancelled, don't show error
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.log('Web Share fallito, uso metodo manuale');
      }
    }

    // Try Clipboard API only if it's actually usable
    if (await isClipboardUsable()) {
      try {
        await navigator.clipboard.writeText(shareText);
        setCopySuccess(true);
        toast({
          title: "Link copiato! 📋",
          description: "Il link dell'articolo è stato copiato negli appunti."
        });
        setTimeout(() => setCopySuccess(false), 2000);
        return;
      } catch (error) {
        console.log('Clipboard API fallito, uso metodo manuale');
      }
    }

    // Use manual copy as primary method when APIs are not available
    const success = manualCopy();
    if (!success) {
      // Show user-friendly message with manual instructions
      toast({
        title: "Condividi manualmente 📱",
        description: "Seleziona e copia il link dalla barra degli indirizzi per condividere questo articolo.",
        variant: "default"
      });
    }
  };

  // 🗂️ Enhanced data fetching with robust error handling
  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("blog_posts")
          .select("id, titolo, contenuto, excerpt, autore, created_at, categoria, immagini, copertina_url, youtube_url")
          .eq("pubblicato", true)
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        // Validate and set data
        if (data && Array.isArray(data)) {
          setBlogPosts(data as BlogPost[]);
        } else {
          setBlogPosts([]);
          toast({
            title: "Nessun articolo trovato",
            description: "Non sono ancora stati pubblicati articoli nel blog.",
            variant: "default"
          });
        }
      } catch (error: any) {
        console.error('Error fetching blog posts:', error);
        setBlogPosts([]);

        // Handle specific error cases
        if (error?.code === 'PGRST116' || error?.code === '42P01') {
          toast({
            title: "Blog non configurato",
            description: "Il sistema del blog non è ancora stato configurato.",
            variant: "destructive"
          });
        } else if (!navigator.onLine) {
          toast({
            title: "Connessione assente",
            description: "Verifica la tua connessione internet per caricare gli articoli.",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Errore nel caricamento",
            description: "Impossibile caricare gli articoli del blog. Riprova più tardi.",
            variant: "destructive"
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // 🎨 Enhanced close modal functionality
  const handleCloseModal = () => {
    setOpenPostId(null);
    setCopySuccess(false); // Reset share state
  };

  const categories = ["all", "Cittadinanza Attiva", "Territorio", "Politiche Giovanili"];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.contenuto || "").toLowerCase().includes(searchTerm.toLowerCase()); // 🔍 Search in content too
    const matchesCategory = selectedCategory === "all" || post.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Cittadinanza Attiva": return "bg-primary/10 text-primary";
      case "Territorio": return "bg-accent/10 text-accent";
      case "Politiche Giovanili": return "bg-heart/10 text-heart";
      default: return "bg-muted text-muted-foreground";
    }
  };

  // 🛡️ Sanitize HTML content for safe rendering
  const stripHtml = (html: string) => html.replace(/<[^>]+>/g, " ");

  // 🎯 Get current post for modal
  const currentPost = blogPosts.find(post => post.id === openPostId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* Header */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
            Il Nostro <span className="text-primary">Blog</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Scopri le nostre iniziative, i progetti in corso e le storie di chi fa la differenza nella comunità.
          </p>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="pb-8 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row gap-4 mb-8 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca negli articoli..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-col sm:flex-row">
              <Filter className="w-5 h-5 text-muted-foreground mt-2.5" />
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="whitespace-nowrap"
                >
                  {category === "all" ? "Tutti" : category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              <>
                {Array.from({ length: 6 }).map((_, i) => (
                  <BlogCardSkeleton key={i} />
                ))}
              </>
            ) : filteredPosts.map((post, index) => (
              <Card
                key={post.id}
                className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] border-0 bg-card/90 backdrop-blur-sm animate-fade-in-up overflow-hidden cursor-pointer"
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
                onClick={() => setOpenPostId(post.id)}
              >
                <div className="relative overflow-hidden">
                  {post.copertina_url ? (
                    <ImageWithFallback
                      src={post.copertina_url}
                      alt="copertina"
                      className="aspect-video w-full object-cover group-hover:scale-110 transition-transform duration-700"
                      fallbackClassName="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-heart/20 flex items-center justify-center group-hover:from-primary/30 group-hover:via-accent/30 group-hover:to-heart/30 transition-all duration-500"
                      showError={false}
                    />
                  ) : (
                    <div className="aspect-video bg-gradient-to-br from-primary/20 via-accent/20 to-heart/20 flex items-center justify-center group-hover:from-primary/30 group-hover:via-accent/30 group-hover:to-heart/30 transition-all duration-500">
                      <div className="text-4xl opacity-50 group-hover:opacity-70 transition-opacity">📰</div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Floating Category Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge className={`${getCategoryColor(post.categoria)} shadow-lg border-0 group-hover:scale-105 transition-transform duration-300`}>
                      {post.categoria}
                    </Badge>
                  </div>

                  {/* Reading Time Badge */}
                  <div className="absolute top-3 right-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm text-foreground shadow-lg border-0 group-hover:scale-105 transition-transform duration-300">
                      <Clock className="w-3 h-3 mr-1" />
                      {calculateReadTime(((post.contenuto || post.excerpt) || "").replace(/<[^>]+>/g, " "))} min
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors duration-300 text-lg leading-tight">
                    {post.titolo}
                  </CardTitle>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed">
                    {post.excerpt}
                  </p>

                  {/* Meta Information */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center">
                        <User className="w-3 h-3 mr-1" />
                        <span className="font-medium">{post.autore}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('it-IT', {
                          day: 'numeric',
                          month: 'short'
                        }) : "-"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Read More Button */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
                    <Button
                      variant="ghost"
                      className="w-full relative border border-border/50 group-hover:border-primary/50 group-hover:bg-primary/5 transition-all duration-300 text-sm font-medium"
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenPostId(post.id);
                      }}
                    >
                      Leggi l'articolo completo
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16 animate-fade-in-up">
              <div className="text-6xl mb-4 opacity-20">🔍</div>
              <h3 className="text-xl font-semibold mb-2">Nessun articolo trovato</h3>
              <p className="text-muted-foreground">Prova a cambiare i termini di ricerca o i filtri.</p>
            </div>
          )}
        </div>
      </section>

      {/* 🔧 Enhanced Modal Dialog */}
      {currentPost && (
        <Dialog open={openPostId === currentPost.id} onOpenChange={(open) => !open && handleCloseModal()}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0 bg-background/95 backdrop-blur-md border-0 shadow-2xl">
            <DialogHeader className="sr-only">
              <DialogTitle>{currentPost.titolo}</DialogTitle>
              <DialogDescription>Articolo nella categoria {currentPost.categoria}</DialogDescription>
            </DialogHeader>

            {/* Hero Section */}
            <div className="relative">
              {currentPost.copertina_url ? (
                <div className="relative h-64 md:h-80 overflow-hidden">
                  <ImageWithFallback
                    src={currentPost.copertina_url}
                    alt={currentPost.titolo}
                    className="w-full h-full object-cover"
                    fallbackClassName="w-full h-full bg-gradient-to-br from-primary/20 via-accent/20 to-heart/20 flex items-center justify-center"
                    showError={false}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>
              ) : (
                <div className="h-64 md:h-80 bg-gradient-to-br from-primary/20 via-accent/20 to-heart/20 flex items-center justify-center">
                  <div className="text-8xl opacity-30">📰</div>
                </div>
              )}

              {/* ❌ Enhanced Close Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-50 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background border border-border/50 shadow-lg w-10 h-10 hover:border-red-400/50 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Category Badge */}
              <div className="absolute top-4 left-4">
                <Badge className={`${getCategoryColor(currentPost.categoria)} shadow-lg`}>
                  {currentPost.categoria}
                </Badge>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-8 md:p-12">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground">
                  {currentPost.titolo}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-l-4 border-primary/20 pl-4 py-3 bg-muted/30 rounded-r backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span className="font-medium">{currentPost.autore}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{currentPost.created_at ? new Date(currentPost.created_at).toLocaleDateString('it-IT', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{calculateReadTime(((currentPost.contenuto || currentPost.excerpt) || "").replace(/<[^>]+>/g, " "))} min di lettura</span>
                  </div>
                </div>
              </div>

              {/* 📝 Enhanced Article Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                {/* Excerpt as intro */}
                {currentPost.excerpt && (
                  <div className="text-lg leading-relaxed text-foreground/90 mb-8 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1 border-l-4 border-primary/20 pl-6 py-4 bg-muted/20 rounded-r-lg">
                    {currentPost.excerpt}
                  </div>
                )}

                {/* 📄 Main Content from Supabase */}
                {currentPost.contenuto && (
                  <div className="text-base leading-relaxed text-foreground/90 mb-8 prose max-w-none">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(currentPost.contenuto)
                      }}
                      className="space-y-4"
                    />
                  </div>
                )}

                {/* Images Gallery */}
                {Array.isArray(currentPost.immagini) && currentPost.immagini.length > 0 && (
                  <div className="my-8">
                    <h3 className="text-xl font-semibold mb-4 text-foreground">Galleria</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {currentPost.immagini.map((img, i) => (
                        <div key={i} className="group relative overflow-hidden rounded-lg aspect-square">
                          <ImageWithFallback
                            src={img}
                            alt={`Immagine ${i + 1}`}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            fallbackClassName="w-full h-full"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Media Section - Professional Design */}
                {currentPost.youtube_url && (
                  <div className="my-8">
                    <div className="bg-gradient-to-r from-background to-muted/50 rounded-2xl p-6 border border-border/30 shadow-sm">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62-4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-2 text-foreground">
                            Contenuto video disponibile
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Approfondisci l'argomento guardando il video correlato a questo articolo.
                          </p>
                          <a
                            href={currentPost.youtube_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-all duration-200 hover:shadow-lg group"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62-4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                            </svg>
                            Guarda su YouTube
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 🎯 Enhanced Footer Actions */}
            <div className="px-8 md:px-12 pb-8">
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  className="flex-1 hover:bg-muted/50 transition-all duration-200"
                  onClick={handleCloseModal}
                >
                  <X className="w-4 h-4 mr-2" />
                  Chiudi articolo
                </Button>
                <Button 
                  className="flex-1 bg-primary hover:bg-primary/90 transition-all duration-200 hover:shadow-lg"
                  onClick={() => handleShare(currentPost)}
                  disabled={copySuccess}
                >
                  {copySuccess ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copiato!
                    </>
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Condividi articolo
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Newsletter CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto text-center max-w-2xl">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in-up">
            Resta sempre <span className="text-primary">aggiornato</span>
          </h2>
          <p className="text-muted-foreground mb-6 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
            Iscriviti alla nostra newsletter per ricevere le ultime notizie sui nostri progetti e iniziative.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Input placeholder="La tua email..." className="flex-grow" />
            <Button className="shadow-md">Iscriviti</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
