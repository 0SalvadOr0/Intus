import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, User, Search, Filter, ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

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
              <div className="text-center py-16 animate-fade-in-up">Caricamento...</div>
            ) : filteredPosts.map((post, index) => (
              <Card
                key={post.id}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up overflow-hidden"
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
              >
                {post.copertina_url ? (
                  <img src={post.copertina_url} alt="copertina" className="aspect-video w-full object-cover" />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <div className="text-4xl opacity-50">📰</div>
                  </div>
                )}
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(post.categoria)}>
                      {post.categoria}
                    </Badge>
                  </div>
                  <CardTitle className="line-clamp-2 group-hover:text-primary transition-colors">
                    {post.titolo}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      <span>{post.autore}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('it-IT') : "-"}</span>
                    </div>
                  </div>
                  <Dialog open={openPostId === post.id} onOpenChange={(open) => setOpenPostId(open ? post.id : null)}>
                    <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors" onClick={() => setOpenPostId(post.id)}>
                      Leggi tutto
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>{post.titolo}</DialogTitle>
                        <DialogDescription>{post.categoria}</DialogDescription>
                      </DialogHeader>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                        <User className="w-4 h-4 mr-1" />
                        <span>{post.autore}</span>
                        <Calendar className="w-4 h-4 ml-4 mr-1" />
                        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString('it-IT') : "-"}</span>
                      </div>
                      <div className="mb-4">
                        <Badge className={getCategoryColor(post.categoria)}>{post.categoria}</Badge>
                      </div>
                      <div className="prose max-w-none">
                        <p>{post.excerpt}</p>
                        {Array.isArray(post.immagini) && post.immagini.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {post.immagini.map((img, i) => (
                              <img key={i} src={img} alt="img" className="w-24 h-24 object-cover rounded border" />
                            ))}
                          </div>
                        )}
                        {post.youtube_url && (
                          <div className="mt-4">
                            <a href={post.youtube_url} target="_blank" rel="noopener noreferrer" className="text-primary underline">Guarda su YouTube</a>
                          </div>
                        )}
                      </div>
                      <DialogClose asChild>
                        <Button variant="ghost" className="mt-4 w-full">Chiudi</Button>
                      </DialogClose>
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