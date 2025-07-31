import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  FileText,
  Calendar,
  User,
  BarChart3,
  TrendingUp,
  FolderOpen,
  Youtube,
  MapPin,
  Users,
  LogOut
} from "lucide-react";
import RichiesteCallIdeeTab from "@/components/RichiesteCallIdeeTab";
import BlogImageUploader from "@/components/BlogImageUploader";
import ProjectImageUploader from "@/components/ProjectImageUploader";
import { StorageStats } from "@/components/StorageStats";
import { supabase } from "@/lib/supabaseClient";
import { useEffect } from "react";

interface DraftPost {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  status: "draft" | "published";
  lastModified: string;
  youtubeUrl?: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  participants: number;
  youtubeUrl?: string;
  status: "completed" | "ongoing" | "planned";
}

const Dashboard = () => {
  const { toast } = useToast();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [blogPosts, setBlogPosts] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [callIdeeRequests, setCallIdeeRequests] = useState<any[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalProjects: 0,
    totalViews: 0
  });

  useEffect(() => {
    fetchBlogPosts();
    fetchProjects();
    fetchCallIdeeRequests();
    // eslint-disable-next-line
  }, []);

  const fetchBlogPosts = async () => {
    setBlogLoading(true);
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setBlogPosts(data);
      updateStats(data);
    }
    setBlogLoading(false);
  };

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("progetti")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error('Errore nel caricamento progetti Dashboard:', error.message || error);
        console.error('Dettagli errore:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });

        // Se la tabella non esiste, mostra un messaggio nell'interfaccia
        if (error.code === 'PGRST116' || error.code === '42P01' || error.message?.includes('does not exist')) {
          console.warn('⚠️ Tabella progetti non configurata. Utilizzare lo script SQL fornito.');
        }
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Errore generico Dashboard progetti:', error instanceof Error ? error.message : error);
    }
  };

  const fetchCallIdeeRequests = async () => {
    const { data, error } = await supabase
      .from("call_idee_giovani")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setCallIdeeRequests(data);
    }
  };

  const updateStats = (posts: any[]) => {
    const publishedPosts = posts.filter(p => p.pubblicato === true).length;
    const draftPosts = posts.filter(p => p.pubblicato === false).length;

    setStats({
      totalPosts: posts.length,
      publishedPosts,
      draftPosts,
      totalProjects: projects.length,
      totalViews: posts.reduce((sum, post) => sum + (post.views || 0), 0)
    });
  };

  // Pubblica un articolo
  const handlePublish = async (id: number) => {
    const { error } = await supabase
      .from("blog_posts")
      .update({ pubblicato: true })
      .eq("id", id);
    if (error) {
      toast({ title: "Errore pubblicazione", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Articolo pubblicato!" });
      fetchBlogPosts();
    }
  };

  // Elimina un articolo
  const handleDelete = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo articolo?")) return;
    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);
    if (error) {
      toast({ title: "Errore eliminazione", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Articolo eliminato" });
      fetchBlogPosts();
    }
  };

  // Mostra anteprima articolo
  const handlePreview = (post: any) => {
    window.open(`/blog/preview/${post.id}`, "_blank");
  };

  const [newPost, setNewPost] = useState({
    titolo: "",
    contenuto: "",
    categoria: "",
    excerpt: "",
    autore: "",
    immagini: [] as string[],
    copertina_url: "",
    youtubeUrl: ""
  });
  const [newProject, setNewProject] = useState({
    titolo: "",
    descrizione_breve: "",
    contenuto: "",
    categoria: "",
    numero_partecipanti: 0,
    luoghi: [] as string[],
    partner: [] as Array<{nome: string, link?: string}>,
    youtube_url: "",
    immagini: [] as string[],
    data_inizio: "",
    status: "planned" as const
  });

  const getRecentActivity = () => {
    const activities = [];

    // Aggiungi attività recenti dai blog posts
    const recentPosts = blogPosts.slice(0, 3);
    recentPosts.forEach(post => {
      activities.push({
        action: post.pubblicato ? "Pubblicato" : "Creato",
        title: post.titolo,
        time: new Date(post.created_at).toLocaleDateString('it-IT'),
        type: "post"
      });
    });

    // Aggiungi attività recenti dai progetti
    const recentProjects = projects.slice(0, 2);
    recentProjects.forEach(project => {
      activities.push({
        action: "Creato progetto",
        title: project.titolo,
        time: new Date(project.created_at).toLocaleDateString('it-IT'),
        type: "project"
      });
    });

    return activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);
  };

  const statsCards = [
    {
      title: "Articoli Pubblicati",
      value: stats.publishedPosts.toString(),
      change: stats.totalPosts > 0 ? `+${Math.round((stats.publishedPosts / stats.totalPosts) * 100)}%` : "+0%",
      icon: FileText,
      color: "text-primary"
    },
    {
      title: "Visualizzazioni Totali",
      value: stats.totalViews > 1000 ? `${(stats.totalViews / 1000).toFixed(1)}K` : stats.totalViews.toString(),
      change: "+15%",
      icon: Eye,
      color: "text-accent"
    },
    {
      title: "Articoli in Bozza",
      value: stats.draftPosts.toString(),
      change: `+${stats.draftPosts}`,
      icon: Edit,
      color: "text-heart"
    },
    {
      title: "Progetti Totali",
      value: projects.length.toString(),
      change: "+100%",
      icon: FolderOpen,
      color: "text-primary"
    }
  ];

  const handlePostImageUpload = (url: string) => {
    setNewPost((prev) => ({ ...prev, immagini: [...prev.immagini, url] }));
    if (!newPost.copertina_url) {
      setNewPost((prev) => ({ ...prev, copertina_url: url }));
    }
  };

  const handleProjectImageUpload = (url: string) => {
    setNewProject((prev) => ({
      ...prev,
      immagini: [...prev.immagini, url],
      immagine_copertina: prev.immagini.length === 0 ? url : prev.immagine_copertina
    }));
  };

  const handleProjectImageRemove = (url: string) => {
    setNewProject((prev) => ({
      ...prev,
      immagini: prev.immagini.filter(img => img !== url),
      immagine_copertina: prev.immagine_copertina === url ? (prev.immagini.find(img => img !== url) || null) : prev.immagine_copertina
    }));
  };

  const handleSubmitPost = async () => {
    if (!newPost.titolo || !newPost.contenuto || !newPost.categoria) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }
    const { error } = await supabase.from("blog_posts").insert([
      {
        titolo: newPost.titolo,
        contenuto: newPost.contenuto,
        excerpt: newPost.excerpt,
        autore: newPost.autore,
        categoria: newPost.categoria,
        immagini: newPost.immagini,
        copertina_url: newPost.copertina_url,
        youtube_url: newPost.youtubeUrl,
        pubblicato: false
      }
    ]);
    if (error) {
      toast({ title: "Errore salvataggio", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Articolo salvato come bozza!" });
      setNewPost({ titolo: "", contenuto: "", categoria: "", excerpt: "", autore: "", immagini: [], copertina_url: "", youtubeUrl: "" });
      fetchBlogPosts();
    }
  };

  const handleSubmitProject = async () => {
    if (!newProject.titolo || !newProject.descrizione_breve || !newProject.categoria || !newProject.contenuto) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori (titolo, descrizione breve, contenuto, categoria)",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.from("progetti").insert([
        {
          titolo: newProject.titolo,
          descrizione_breve: newProject.descrizione_breve,
          contenuto: newProject.contenuto,
          categoria: newProject.categoria,
          numero_partecipanti: newProject.numero_partecipanti,
          luoghi: newProject.luoghi,
          partner: newProject.partner,
          youtube_url: newProject.youtube_url || null,
          immagini: newProject.immagini,
          data_inizio: newProject.data_inizio || null,
          status: newProject.status,
          pubblicato: false
        }
      ]);

      if (error) {
        toast({ title: "Errore salvataggio", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: "Successo!",
        description: "Progetto salvato come bozza",
      });

      setNewProject({
        titolo: "",
        descrizione_breve: "",
        contenuto: "",
        categoria: "",
        numero_partecipanti: 0,
        luoghi: [],
        partner: [],
        youtube_url: "",
        immagini: [],
        data_inizio: "",
        status: "planned"
      });

      fetchProjects();
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante il salvataggio", variant: "destructive" });
    }
  };

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
        activeTab === id 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "text-muted-foreground hover:text-primary hover:bg-muted"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* Header */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold mb-2 animate-fade-in-up">
                Dashboard <span className="text-primary">Intus</span>
              </h1>
              <p className="text-muted-foreground animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                Gestisci i contenuti e monitora le performance del blog
              </p>
            </div>
            <div className="flex items-center space-x-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
              <div className="text-right">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-muted-foreground">Amministratore</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Esci</span>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="px-4 mb-8">
        <div className="container mx-auto">
          <div className="flex flex-wrap gap-2 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <TabButton id="overview" label="Panoramica" icon={BarChart3} />
            <TabButton id="content" label="Gestione Contenuti" icon={FileText} />
            <TabButton id="create" label="Nuovo Articolo" icon={Plus} />
            <TabButton id="create-project" label="Nuovo Progetto" icon={FolderOpen} />
            <TabButton id="richieste-call-idee" label="Richieste Call Idee" icon={Eye} />
        {activeTab === "content" && (
          <div className="space-y-8">
            {/* Articoli Pubblicati */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-primary" />
                  Articoli Pubblicati ({blogPosts.filter(p => p.pubblicato === true).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blogLoading ? (
                  <div className="text-center text-muted-foreground">Caricamento...</div>
                ) : blogPosts.filter(p => p.pubblicato === true).length === 0 ? (
                  <div className="text-center text-muted-foreground">Nessun articolo pubblicato.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogPosts.filter(p => p.pubblicato === true).map((post) => (
                      <div key={post.id} className="rounded-xl border border-border/50 bg-white/90 dark:bg-card/90 shadow-lg p-4 flex flex-col min-h-[320px] relative group">
                        {post.copertina_url && <img src={post.copertina_url} alt="copertina" className="w-full h-40 object-cover rounded mb-2" />}
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{post.titolo}</h3>
                        <div className="text-xs text-muted-foreground mb-1">{post.categoria} • {post.autore}</div>
                        <div className="text-sm mb-2 line-clamp-3">{post.excerpt}</div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {Array.isArray(post.immagini) && post.immagini.map((img: string, i: number) => (
                            <img key={i} src={img} alt="img" className="w-10 h-10 object-cover rounded border" />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">Creato il {new Date(post.created_at).toLocaleDateString('it-IT')}</div>
                        <button onClick={() => handleDelete(post.id)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition bg-destructive text-white rounded-full p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Bozze Articoli */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-primary" />
                  Bozze Articoli ({blogPosts.filter(p => p.pubblicato === false).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogPosts.filter(p => p.pubblicato === false).map((post, index) => (
                    <div
                      key={post.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors animate-fade-in-up"
                      style={{animationDelay: `${0.1 + index * 0.1}s`}}
                    >
                      <div className="flex-grow">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold">{post.titolo}</h3>
                          <Badge variant="outline" className="text-xs">
                            {post.categoria}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Bozza
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{post.excerpt}</p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            <span>Creato il {post.created_at ? new Date(post.created_at).toLocaleDateString('it-IT') : "-"}</span>
                          </div>
                          {post.youtube_url && (
                            <div className="flex items-center">
                              <Youtube className="w-3 h-3 mr-1 text-red-500" />
                              <span>Video</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" onClick={() => handlePreview(post)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => handlePublish(post.id)}>
                          <FileText className="w-4 h-4 text-green-600" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(post.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progetti */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2 text-primary" />
                  Progetti ({projects.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.length === 0 ? (
                    <div className="text-center text-muted-foreground">Nessun progetto presente.</div>
                  ) : (
                    projects.map((project, index) => (
                      <div
                        key={project.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors animate-fade-in-up"
                        style={{animationDelay: `${0.1 + index * 0.1}s`}}
                      >
                        <div className="flex-grow">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="font-semibold">{project.titolo}</h3>
                            <Badge variant="outline" className="text-xs">
                              {project.categoria}
                            </Badge>
                            <Badge variant={project.pubblicato ? "default" : "secondary"} className="text-xs">
                              {project.pubblicato ? "Pubblicato" : "Bozza"}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {project.status === "completed" ? "Completato" : project.status === "ongoing" ? "In Corso" : "Pianificato"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{project.descrizione_breve}</p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>{project.data_inizio ? new Date(project.data_inizio).toLocaleDateString('it-IT') : "Data da definire"}</span>
                            </div>
                            {project.luoghi && project.luoghi.length > 0 && (
                              <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                <span>{project.luoghi.join(", ")}</span>
                              </div>
                            )}
                            <div className="flex items-center">
                              <Users className="w-3 h-3 mr-1" />
                              <span>{project.numero_partecipanti} partecipanti</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant={project.pubblicato ? "secondary" : "default"}
                            onClick={() => handleTogglePublishProject(project.id, !project.pubblicato)}
                          >
                            {project.pubblicato ? "Nascondi" : "Pubblica"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProject(project)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "richieste-call-idee" && (
          <RichiesteCallIdeeTab />
        )}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-16">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statsCards.map((stat, index) => (
                <Card
                  key={index}
                  className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 animate-fade-in-up"
                  style={{animationDelay: `${0.3 + index * 0.1}s`}}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold">{stat.value}</span>
                          <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                        </div>
                      </div>
                      <stat.icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Storage Stats and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Storage Statistics */}
              <StorageStats className="animate-fade-in-up" style={{animationDelay: '0.7s'}} />

              {/* Recent Activity */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    Attività Recente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {getRecentActivity().length === 0 ? (
                      <div className="text-center text-muted-foreground">Nessuna attività recente</div>
                    ) : (
                      getRecentActivity().map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${
                              activity.type === 'post' ? 'bg-primary' : 'bg-accent'
                            }`}></div>
                            <div>
                              <span className="font-medium">{activity.action}</span>
                              <span className="text-muted-foreground"> "{activity.title}"</span>
                            </div>
                          </div>
                          <span className="text-sm text-muted-foreground">{activity.time}</span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Create New Post Tab */}
        {activeTab === "create" && (
          <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="w-5 h-5 mr-2 text-primary" />
                Crea Nuovo Articolo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titolo">Titolo *</Label>
                  <Input
                    id="titolo"
                    placeholder="Inserisci il titolo dell'articolo"
                    value={newPost.titolo}
                    onChange={(e) => setNewPost(prev => ({ ...prev, titolo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    placeholder="Categoria"
                    value={newPost.categoria}
                    onChange={(e) => setNewPost(prev => ({ ...prev, categoria: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autore">Autore</Label>
                <Input
                  id="autore"
                  placeholder="Nome autore"
                  value={newPost.autore}
                  onChange={(e) => setNewPost(prev => ({ ...prev, autore: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Anteprima</Label>
                <Input
                  id="excerpt"
                  placeholder="Breve descrizione dell'articolo (opzionale)"
                  value={newPost.excerpt}
                  onChange={(e) => setNewPost(prev => ({ ...prev, excerpt: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">Link YouTube (opzionale)</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={newPost.youtubeUrl}
                  onChange={(e) => setNewPost(prev => ({ ...prev, youtubeUrl: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contenuto">Contenuto *</Label>
                <Textarea
                  id="contenuto"
                  placeholder="Scrivi qui il contenuto dell'articolo..."
                  value={newPost.contenuto}
                  onChange={(e) => setNewPost(prev => ({ ...prev, contenuto: e.target.value }))}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Immagini</Label>
                <BlogImageUploader onUpload={handlePostImageUpload} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {newPost.immagini.map((img, i) => (
                    <img key={i} src={img} alt="img" className="w-20 h-20 object-cover rounded border" />
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSubmitPost} className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Salva come Bozza
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Anteprima
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create Project Tab */}
        {activeTab === "create-project" && (
          <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FolderOpen className="w-5 h-5 mr-2 text-primary" />
                Crea Nuovo Progetto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Titolo *</Label>
                  <Input
                    id="project-title"
                    placeholder="Inserisci il titolo del progetto"
                    value={newProject.titolo}
                    onChange={(e) => setNewProject(prev => ({ ...prev, titolo: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-category">Categoria *</Label>
                  <Select value={newProject.categoria} onValueChange={(value) => setNewProject(prev => ({ ...prev, categoria: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cittadinanza Attiva">Cittadinanza Attiva</SelectItem>
                      <SelectItem value="Territorio">Territorio</SelectItem>
                      <SelectItem value="Politiche Giovanili">Politiche Giovanili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-location">Luogo</Label>
                  <Input
                    id="project-location"
                    placeholder="Dove si svolge"
                    value={newProject.luoghi[0] || ""}
                    onChange={(e) => setNewProject(prev => ({ ...prev, luoghi: e.target.value ? [e.target.value] : [] }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-date">Data</Label>
                  <Input
                    id="project-date"
                    type="date"
                    value={newProject.data_inizio}
                    onChange={(e) => setNewProject(prev => ({ ...prev, data_inizio: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-participants">Partecipanti</Label>
                  <Input
                    id="project-participants"
                    type="number"
                    placeholder="Numero stimato"
                    value={newProject.numero_partecipanti || ""}
                    onChange={(e) => setNewProject(prev => ({ ...prev, numero_partecipanti: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-status">Stato</Label>
                  <Select value={newProject.status} onValueChange={(value: any) => setNewProject(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planned">Pianificato</SelectItem>
                      <SelectItem value="ongoing">In Corso</SelectItem>
                      <SelectItem value="completed">Completato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-youtube">Link YouTube (opzionale)</Label>
                  <Input
                    id="project-youtube"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={newProject.youtube_url}
                    onChange={(e) => setNewProject(prev => ({ ...prev, youtube_url: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-description-short">Descrizione Breve *</Label>
                  <Textarea
                    id="project-description-short"
                    placeholder="Breve descrizione del progetto..."
                    value={newProject.descrizione_breve}
                    onChange={(e) => setNewProject(prev => ({ ...prev, descrizione_breve: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-content">Contenuto Dettagliato *</Label>
                  <Textarea
                    id="project-content"
                    placeholder="Descrizione dettagliata del progetto, obiettivi, attività..."
                    value={newProject.contenuto}
                    onChange={(e) => setNewProject(prev => ({ ...prev, contenuto: e.target.value }))}
                    className="min-h-[150px]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Immagini Progetto</Label>
                <ProjectImageUploader
                  onUpload={handleProjectImageUpload}
                  onRemove={handleProjectImageRemove}
                  uploadedImages={newProject.immagini}
                  maxImages={5}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSubmitProject} className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  Salva Progetto
                </Button>
                <Button variant="outline">
                  <Eye className="w-4 h-4 mr-2" />
                  Anteprima
                </Button>
              </div>
            </CardContent>
          </Card>
        )}


      </div>
    </div>
  );
};

export default Dashboard;
