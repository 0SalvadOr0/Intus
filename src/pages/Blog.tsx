import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, Filter, ArrowRight, X, Clock, Share2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { BlogCardSkeleton } from "@/components/ui/loading-skeleton";

interface BlogPost {
  id: number;
  titolo: string;
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

  // Calcola tempo di lettura stimato (basato su 200 parole al minuto)
  const calculateReadTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("pubblicato", true)
        .order("created_at", { ascending: false });
      if (!error && data) setBlogPosts(data as BlogPost[]);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const categories = ["all", "Cittadinanza Attiva", "Territorio", "Politiche Giovanili"];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.titolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (post.excerpt || "").toLowerCase().includes(searchTerm.toLowerCase());
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
                    <img
                      src={post.copertina_url}
                      alt="copertina"
                      className="aspect-video w-full object-cover group-hover:scale-110 transition-transform duration-700"
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
                      {calculateReadTime(post.excerpt || "")} min
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

                  <Dialog open={openPostId === post.id} onOpenChange={(open) => setOpenPostId(open ? post.id : null)}>
                    <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 gap-0 bg-background/95 backdrop-blur-md border-0 shadow-2xl">
                      {/* Hero Section */}
                      <div className="relative">
                        {post.copertina_url ? (
                          <div className="relative h-64 md:h-80 overflow-hidden">
                            <img
                              src={post.copertina_url}
                              alt={post.titolo}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                          </div>
                        ) : (
                          <div className="h-64 md:h-80 bg-gradient-to-br from-primary/20 via-accent/20 to-heart/20 flex items-center justify-center">
                            <div className="text-8xl opacity-30">📰</div>
                          </div>
                        )}

                        {/* Close Button */}
                        <DialogClose asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90 transition-all duration-200 w-10 h-10"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        </DialogClose>

                        {/* Category Badge */}
                        <div className="absolute top-4 left-4">
                          <Badge className={`${getCategoryColor(post.categoria)} shadow-lg`}>
                            {post.categoria}
                          </Badge>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="overflow-y-auto max-h-[60vh] scroll-smooth">
                        <div className="p-8 md:p-12">
                          {/* Header */}
                          <div className="mb-8">
                            <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-4 text-foreground">
                              {post.titolo}
                            </h1>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-l-4 border-primary/20 pl-4 py-3 bg-muted/30 rounded-r backdrop-blur-sm">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="font-medium">{post.autore}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('it-IT', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                }) : "-"}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{calculateReadTime(post.excerpt || "")} min di lettura</span>
                              </div>
                            </div>
                          </div>

                          {/* Article Content */}
                          <div className="prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-p:leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                            <div className="text-lg leading-relaxed text-foreground/90 mb-8 first-letter:text-5xl first-letter:font-bold first-letter:text-primary first-letter:float-left first-letter:mr-3 first-letter:mt-1">
                              {post.excerpt}
                            </div>

                            {/* Images Gallery */}
                            {Array.isArray(post.immagini) && post.immagini.length > 0 && (
                              <div className="my-8">
                                <h3 className="text-xl font-semibold mb-4 text-foreground">Galleria</h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                  {post.immagini.map((img, i) => (
                                    <div key={i} className="group relative overflow-hidden rounded-lg aspect-square">
                                      <img
                                        src={img}
                                        alt={`Immagine ${i + 1}`}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                      />
                                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* YouTube Video */}
                            {post.youtube_url && (
                              <div className="my-8 p-6 bg-gradient-to-r from-red-500/10 to-red-600/10 rounded-xl border border-red-500/20">
                                <h3 className="text-xl font-semibold mb-3 text-foreground flex items-center gap-2">
                                  <span className="text-red-500">📺</span>
                                  Video correlato
                                </h3>
                                <a
                                  href={post.youtube_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-red-500 hover:text-red-600 font-medium transition-colors group"
                                >
                                  Guarda su YouTube
                                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-8 md:px-12 pb-8">
                          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border/50">
                            <DialogClose asChild>
                              <Button variant="outline" className="flex-1">
                                Chiudi articolo
                              </Button>
                            </DialogClose>
                            <Button className="flex-1 bg-primary hover:bg-primary/90">
                              Condividi articolo
                              <Share2 className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
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
