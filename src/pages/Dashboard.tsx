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
import { useAnalyticsStats } from "@/hooks/use-analytics";
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
  LogOut,
  Upload,
  Download,
  Archive
} from "lucide-react";
import RichiesteCallIdeeTab from "@/components/RichiesteCallIdeeTab";
import BlogImageUploader from "@/components/BlogImageUploader";
import ProjectImageUploader from "@/components/ProjectImageUploader";
import { StorageStats } from "@/components/StorageStats";
import EvaluationStats from "@/components/EvaluationStats";
import ProjectRanking from "@/components/ProjectRanking";

import { ImageWithFallback } from "@/components/ui/image-with-fallback";
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
  const { getTotalViews, getGeneralStats, getPopularPages, getVisitorStats } = useAnalyticsStats();
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
    totalViews: 0,
    totalViewsToday: 0,
    uniqueVisitorsToday: 0,
    viewsLastHour: 0
  });
  const [analyticsData, setAnalyticsData] = useState({
    popularPages: [],
    visitorStats: [],
    isLoading: true
  });

  useEffect(() => {
    fetchBlogPosts();
    fetchProjects();
    fetchCallIdeeRequests();
    fetchDocuments();
    fetchAnalyticsData();
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/all-documents');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.documents) {
          setDocuments(result.documents);
        } else {
          setDocuments([]);
        }
      } else {
        console.warn('Backend server not available, using empty document list');
        setDocuments([]);
      }
    } catch (error) {
      console.warn('Backend server not available:', error instanceof Error ? error.message : 'Unknown error');
      setDocuments([]);
    }
  };

  const fetchAnalyticsData = async () => {
    try {
      setAnalyticsData(prev => ({ ...prev, isLoading: true }));

      // Fetch total views
      const totalViews = await getTotalViews();

      // Fetch general stats
      const generalStats = await getGeneralStats();

      // Fetch popular pages
      const popularPages = await getPopularPages(10);

      // Fetch visitor stats for last 30 days
      const visitorStats = await getVisitorStats(30);

      // Update stats state
      setStats(prev => ({
        ...prev,
        totalViews: totalViews || prev.totalViews,
        totalViewsToday: generalStats?.total_views_today || 0,
        uniqueVisitorsToday: generalStats?.unique_visitors_today || 0,
        viewsLastHour: generalStats?.views_last_hour || 0
      }));

      // Update analytics data
      setAnalyticsData({
        popularPages: popularPages || [],
        visitorStats: visitorStats || [],
        isLoading: false
      });

    } catch (error) {
      console.error('Errore nel caricamento analytics:', error);
      setAnalyticsData(prev => ({ ...prev, isLoading: false }));
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

  // Toggle pubblicazione articolo (pubblica/nascondi)
  const handleTogglePublishPost = async (id: number, publish: boolean) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ pubblicato: publish })
        .eq("id", id);

      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: publish ? "Articolo pubblicato!" : "Articolo nascosto",
        description: publish ? "L'articolo è ora visibile pubblicamente" : "L'articolo non è più visibile al pubblico"
      });
      fetchBlogPosts();
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante l'operazione", variant: "destructive" });
    }
  };

  // Modifica articolo
  const handleEditPost = (post: any) => {
    setEditingPost({ ...post });
    setIsEditingPost(true);
    setActiveTab("create");
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
    partner: [] as Array<{nome: string, link?: string, capofila?: boolean}>,
    youtube_url: "",
    youtube_urls: [] as string[],
    immagini: [] as string[],
    data_inizio: "",
    status: "planned" as const,
    ruolo_intus: "",
    partecipanti_diretti: "",
    partecipanti_indiretti: "",
    ente_finanziatore: ""
  });

  const [editingProject, setEditingProject] = useState<any>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [editingPost, setEditingPost] = useState<any>(null);
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [newDocument, setNewDocument] = useState({
    name: "",
    description: "",
    category: "",
    file: null as File | null
  });

  // Helper per gestire i cambiamenti nei form
  const getCurrentProject = () => isEditingProject ? editingProject : newProject;
  const updateCurrentProject = (updates: any) => {
    if (isEditingProject) {
      setEditingProject((prev: any) => ({ ...prev, ...updates }));
    } else {
      setNewProject(prev => ({ ...prev, ...updates }));
    }
  };

  const getCurrentPost = () => isEditingPost ? editingPost : newPost;
  const updateCurrentPost = (updates: any) => {
    if (isEditingPost) {
      setEditingPost((prev: any) => ({ ...prev, ...updates }));
    } else {
      setNewPost(prev => ({ ...prev, ...updates }));
    }
  };

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
    if (isEditingPost) {
      setEditingPost((prev: any) => ({
        ...prev,
        immagini: [...(prev.immagini || []), url],
        copertina_url: !prev.copertina_url ? url : prev.copertina_url
      }));
    } else {
      setNewPost((prev) => ({ ...prev, immagini: [...prev.immagini, url] }));
      if (!newPost.copertina_url) {
        setNewPost((prev) => ({ ...prev, copertina_url: url }));
      }
    }
  };

  const handleProjectImageUpload = (url: string) => {
    if (isEditingProject) {
      setEditingProject((prev: any) => ({
        ...prev,
        immagini: [...(prev.immagini || []), url],
        immagine_copertina: !prev.immagine_copertina && prev.immagini.length === 0 ? url : prev.immagine_copertina
      }));
    } else {
      setNewProject((prev) => ({
        ...prev,
        immagini: [...prev.immagini, url],
        immagine_copertina: prev.immagini.length === 0 ? url : prev.immagine_copertina
      }));
    }
  };

  const handleProjectImageRemove = (url: string) => {
    if (isEditingProject) {
      setEditingProject((prev: any) => ({
        ...prev,
        immagini: prev.immagini.filter((img: string) => img !== url),
        immagine_copertina: prev.immagine_copertina === url ? (prev.immagini.find((img: string) => img !== url) || null) : prev.immagine_copertina
      }));
    } else {
      setNewProject((prev) => ({
        ...prev,
        immagini: prev.immagini.filter(img => img !== url),
        immagine_copertina: prev.immagine_copertina === url ? (prev.immagini.find(img => img !== url) || null) : prev.immagine_copertina
      }));
    }
  };

  // Pubblica/Nascondi progetto
  const handleTogglePublishProject = async (id: number, publish: boolean) => {
    try {
      const { error } = await supabase
        .from("progetti")
        .update({ pubblicato: publish })
        .eq("id", id);

      if (error) {
        toast({ title: "Errore", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: publish ? "Progetto pubblicato!" : "Progetto nascosto",
        description: publish ? "Il progetto è ora visibile pubblicamente" : "Il progetto non è più visibile al pubblico"
      });
      fetchProjects();
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante l'operazione", variant: "destructive" });
    }
  };

  // Modifica progetto
  const handleEditProject = (project: any) => {
    setEditingProject({ ...project });
    setIsEditingProject(true);
    setActiveTab("create-project");
  };

  // Elimina progetto
  const handleDeleteProject = async (id: number) => {
    if (!window.confirm("Sei sicuro di voler eliminare questo progetto?")) return;

    try {
      const { error } = await supabase
        .from("progetti")
        .delete()
        .eq("id", id);

      if (error) {
        toast({ title: "Errore eliminazione", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Progetto eliminato" });
      fetchProjects();
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante l'eliminazione", variant: "destructive" });
    }
  };

  const handleSubmitPost = async () => {
    const postData = isEditingPost ? editingPost : newPost;

    if (!postData.titolo || !postData.contenuto || !postData.categoria) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori",
        variant: "destructive"
      });
      return;
    }

    try {
      const postPayload = {
        titolo: postData.titolo,
        contenuto: postData.contenuto,
        excerpt: postData.excerpt,
        autore: postData.autore,
        categoria: postData.categoria,
        immagini: postData.immagini,
        copertina_url: postData.copertina_url,
        youtube_url: postData.youtubeUrl
      };

      let error;

      if (isEditingPost) {
        // Aggiorna articolo esistente
        const result = await supabase
          .from("blog_posts")
          .update(postPayload)
          .eq("id", editingPost.id);
        error = result.error;
      } else {
        // Crea nuovo articolo
        const result = await supabase
          .from("blog_posts")
          .insert([{ ...postPayload, pubblicato: false }]);
        error = result.error;
      }

      if (error) {
        toast({ title: "Errore salvataggio", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: isEditingPost ? "Articolo aggiornato!" : "Articolo salvato come bozza!",
        description: isEditingPost ? "Le modifiche sono state salvate" : "L'articolo è stato creato come bozza"
      });

      // Reset form
      if (isEditingPost) {
        setIsEditingPost(false);
        setEditingPost(null);
      }

      setNewPost({ titolo: "", contenuto: "", categoria: "", excerpt: "", autore: "", immagini: [], copertina_url: "", youtubeUrl: "" });
      fetchBlogPosts();
    } catch (error) {
      toast({ title: "Errore", description: "Errore durante il salvataggio", variant: "destructive" });
    }
  };

  const handleSubmitProject = async () => {
    const projectData = isEditingProject ? editingProject : newProject;

    if (!projectData.titolo || !projectData.descrizione_breve || !projectData.categoria || !projectData.contenuto) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi obbligatori (titolo, descrizione breve, contenuto, categoria)",
        variant: "destructive"
      });
      return;
    }

    try {
      const projectPayload = {
        titolo: projectData.titolo,
        descrizione_breve: projectData.descrizione_breve,
        contenuto: projectData.contenuto,
        categoria: projectData.categoria,
        numero_partecipanti: projectData.numero_partecipanti,
        luoghi: projectData.luoghi,
        partner: projectData.partner,
        youtube_url: projectData.youtube_url || null,
        immagini: projectData.immagini,
        data_inizio: projectData.data_inizio || null,
        status: projectData.status
      };

      let error;

      if (isEditingProject) {
        // Aggiorna progetto esistente
        const result = await supabase
          .from("progetti")
          .update(projectPayload)
          .eq("id", editingProject.id);
        error = result.error;
      } else {
        // Crea nuovo progetto
        const result = await supabase
          .from("progetti")
          .insert([{ ...projectPayload, pubblicato: false }]);
        error = result.error;
      }

      if (error) {
        toast({ title: "Errore salvataggio", description: error.message, variant: "destructive" });
        return;
      }

      toast({
        title: "Successo!",
        description: isEditingProject ? "Progetto aggiornato!" : "Progetto salvato come bozza",
      });

      // Reset form
      if (isEditingProject) {
        setIsEditingProject(false);
        setEditingProject(null);
      }

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
            <TabButton id="documents" label="Gestione Documenti" icon={Archive} />

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
                        {post.copertina_url && (
                          <ImageWithFallback
                            src={post.copertina_url}
                            alt="copertina"
                            className="w-full h-40 object-cover rounded mb-2"
                            fallbackClassName="w-full h-40 rounded mb-2"
                          />
                        )}
                        <h3 className="font-bold text-lg mb-1 line-clamp-2">{post.titolo}</h3>
                        <div className="text-xs text-muted-foreground mb-1">{post.categoria} • {post.autore}</div>
                        <div className="text-sm mb-2 line-clamp-3">{post.excerpt}</div>
                        <div className="flex flex-wrap gap-1 mt-auto">
                          {Array.isArray(post.immagini) && post.immagini.map((img: string, i: number) => (
                            <ImageWithFallback
                              key={i}
                              src={img}
                              alt="img"
                              className="w-10 h-10 object-cover rounded border"
                              fallbackClassName="w-10 h-10 rounded border"
                              showError={false}
                            />
                          ))}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2">Creato il {new Date(post.created_at).toLocaleDateString('it-IT')}</div>
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all flex gap-1">
                          <button
                            onClick={() => handleTogglePublishPost(post.id, false)}
                            className="bg-orange-500 hover:bg-orange-600 text-white rounded-full p-1"
                            title="Nascondi articolo"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditPost(post)}
                            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1"
                            title="Modifica articolo"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(post.id)}
                            className="bg-destructive hover:bg-destructive/80 text-white rounded-full p-1"
                            title="Elimina articolo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleTogglePublishPost(post.id, true)}
                        >
                          Pubblica
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditPost(post)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Progetti Pubblicati */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2 text-primary" />
                  Progetti Pubblicati ({projects.filter(p => p.pubblicato).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.filter(p => p.pubblicato).length === 0 ? (
                    <div className="text-center text-muted-foreground">Nessun progetto pubblicato.</div>
                  ) : (
                    projects.filter(p => p.pubblicato).map((project, index) => (
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

            {/* Bozze Progetti */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 mr-2 text-primary" />
                  Bozze Progetti ({projects.filter(p => !p.pubblicato).length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.filter(p => !p.pubblicato).length === 0 ? (
                    <div className="text-center text-muted-foreground">Nessuna bozza presente.</div>
                  ) : (
                    projects.filter(p => !p.pubblicato).map((project, index) => (
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
                            <Badge variant="secondary" className="text-xs">
                              Bozza
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
                            variant="default"
                            onClick={() => handleTogglePublishProject(project.id, true)}
                          >
                            Pubblica
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

        {activeTab === "documents" && (
          <div className="space-y-8">
            {/* Upload New Document */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-primary" />
                  Carica Nuovo Documento
                </CardTitle>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mt-2">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    📝 <strong>Nota:</strong> Per utilizzare l'upload e la gestione documenti, avvia il server backend con il comando: <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">./start-backend.sh</code> o <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">node server.js</code>
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder="Nome documento"
                    value={newDocument.name}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    placeholder="Categoria"
                    value={newDocument.category}
                    onChange={(e) => setNewDocument(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <Input
                  placeholder="Descrizione"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument(prev => ({ ...prev, description: e.target.value }))}
                />
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewDocument(prev => ({ ...prev, file }));
                      }
                    }}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="w-8 h-8 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {newDocument.file ? newDocument.file.name : "Clicca per selezionare un file"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Formati supportati: PDF, DOC, DOCX
                    </span>
                  </label>
                </div>
                <Button
                  onClick={async () => {
                    if (newDocument.name && newDocument.category && newDocument.file) {
                      try {
                        const formData = new FormData();
                        formData.append('file', newDocument.file);
                        formData.append('name', newDocument.name);
                        formData.append('description', newDocument.description);
                        formData.append('category', newDocument.category);

                        const response = await fetch('http://localhost:3001/api/upload-documento', {
                          method: 'POST',
                          body: formData
                        });

                        if (response.ok) {
                          toast({
                            title: "Documento caricato!",
                            description: `${newDocument.name} è stato caricato con successo.`
                          });
                          setNewDocument({ name: "", description: "", category: "", file: null });
                          fetchDocuments();
                        } else {
                          throw new Error('Upload failed');
                        }
                      } catch (error) {
                        toast({
                          title: "Server non disponibile",
                          description: "Il server backend non è attivo. Avvia il server con 'node server.js' per utilizzare questa funzionalità.",
                          variant: "destructive"
                        });
                      }
                    } else {
                      toast({
                        title: "Errore",
                        description: "Compila tutti i campi obbligatori",
                        variant: "destructive"
                      });
                    }
                  }}
                  className="w-full"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Carica Documento
                </Button>
              </CardContent>
            </Card>

            {/* Documents List */}
            <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Archive className="w-5 h-5 mr-2 text-primary" />
                  Documenti Caricati ({documents.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Archive className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Nessun documento caricato</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {documents.map((doc, index) => (
                      <div
                        key={doc.id}
                        className="flex items-center justify-between p-4 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <FileText className="w-5 h-5 text-primary" />
                          <div className="flex-1">
                            <h4 className="font-semibold">{doc.name}</h4>
                            <p className="text-sm text-muted-foreground">{doc.description}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                                {doc.category}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {doc.size} • {new Date(doc.uploadDate).toLocaleDateString('it-IT')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(doc.url, '_blank')}>
                            <Eye className="w-4 h-4" />
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
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive hover:text-destructive"
                            onClick={async () => {
                              if (window.confirm('Sei sicuro di voler eliminare questo documento?')) {
                                try {
                                  const response = await fetch(`http://localhost:3001/api/documents/${doc.id}`, {
                                    method: 'DELETE'
                                  });
                                  if (response.ok) {
                                    toast({ title: "Documento eliminato" });
                                    fetchDocuments();
                                  } else {
                                    throw new Error('Delete failed');
                                  }
                                } catch (error) {
                                  toast({
                                    title: "Server non disponibile",
                                    description: "Il server backend non è attivo. Avvia il server con 'node server.js'.",
                                    variant: "destructive"
                                  });
                                }
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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

            {/* Storage Stats and Evaluation Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Storage Statistics */}
              <StorageStats className="animate-fade-in-up" style={{animationDelay: '0.7s'}} />

              {/* Evaluation Statistics */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.75s'}}>
                <EvaluationStats />
              </div>
            </div>

            {/* Project Ranking, Recent Activity, and Documents */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Project Ranking */}
              <div className="animate-fade-in-up" style={{animationDelay: '0.8s'}}>
                <ProjectRanking />
              </div>

              {/* Recent Activity */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up" style={{animationDelay: '0.85s'}}>
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

              {/* Recent Documents */}
              <Card className="border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up" style={{animationDelay: '0.9s'}}>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Archive className="w-5 h-5 mr-2 text-primary" />
                    Documenti Recenti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {documents.length === 0 ? (
                      <div className="text-center text-muted-foreground">
                        <Archive className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nessun documento</p>
                      </div>
                    ) : (
                      documents.slice(0, 5).map((doc, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm truncate">{doc.originalName || doc.name}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-2">
                                <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">
                                  {doc.category}
                                </span>
                                <span>{doc.size}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(doc.url, '_blank')}
                            className="h-8 w-8 p-0 flex-shrink-0"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      ))
                    )}
                    {documents.length > 5 && (
                      <div className="pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => setActiveTab("documents")}
                        >
                          Vedi tutti ({documents.length})
                        </Button>
                      </div>
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Plus className="w-5 h-5 mr-2 text-primary" />
                  {isEditingPost ? "Modifica Articolo" : "Crea Nuovo Articolo"}
                </div>
                {isEditingPost && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingPost(false);
                      setEditingPost(null);
                      setNewPost({ titolo: "", contenuto: "", categoria: "", excerpt: "", autore: "", immagini: [], copertina_url: "", youtubeUrl: "" });
                    }}
                  >
                    ✕ Annulla
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingPost && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={editingPost?.pubblicato ? "default" : "secondary"}>
                      {editingPost?.pubblicato ? "Pubblicato" : "Bozza"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Modifica in corso - ID: {editingPost?.id}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="titolo">Titolo *</Label>
                  <Input
                    id="titolo"
                    placeholder="Inserisci il titolo dell'articolo"
                    value={getCurrentPost()?.titolo || ""}
                    onChange={(e) => updateCurrentPost({ titolo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    placeholder="Categoria"
                    value={getCurrentPost()?.categoria || ""}
                    onChange={(e) => updateCurrentPost({ categoria: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="autore">Autore</Label>
                <Input
                  id="autore"
                  placeholder="Nome autore"
                  value={getCurrentPost()?.autore || ""}
                  onChange={(e) => updateCurrentPost({ autore: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="excerpt">Anteprima</Label>
                <Input
                  id="excerpt"
                  placeholder="Breve descrizione dell'articolo (opzionale)"
                  value={getCurrentPost()?.excerpt || ""}
                  onChange={(e) => updateCurrentPost({ excerpt: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl">Link YouTube (opzionale)</Label>
                <Input
                  id="youtubeUrl"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={getCurrentPost()?.youtubeUrl || ""}
                  onChange={(e) => updateCurrentPost({ youtubeUrl: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contenuto">Contenuto *</Label>
                <Textarea
                  id="contenuto"
                  placeholder="Scrivi qui il contenuto dell'articolo..."
                  value={getCurrentPost()?.contenuto || ""}
                  onChange={(e) => updateCurrentPost({ contenuto: e.target.value })}
                  className="min-h-[200px]"
                />
              </div>
              <div className="space-y-2">
                <Label>Immagini</Label>
                <BlogImageUploader onUpload={handlePostImageUpload} />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(getCurrentPost()?.immagini || []).map((img: string, i: number) => (
                    <ImageWithFallback
                      key={i}
                      src={img}
                      alt="img"
                      className="w-20 h-20 object-cover rounded border"
                      fallbackClassName="w-20 h-20 rounded border"
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-4">
                <Button onClick={handleSubmitPost} className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditingPost ? "Aggiorna Articolo" : "Salva come Bozza"}
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
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <FolderOpen className="w-5 h-5 mr-2 text-primary" />
                  {isEditingProject ? "Modifica Progetto" : "Crea Nuovo Progetto"}
                </div>
                {isEditingProject && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingProject(false);
                      setEditingProject(null);
                      setNewProject({
                        titolo: "",
                        descrizione_breve: "",
                        contenuto: "",
                        categoria: "",
                        numero_partecipanti: 0,
                        luoghi: [],
                        partner: [],
                        youtube_url: "",
                        youtube_urls: [],
                        immagini: [],
                        data_inizio: "",
                        status: "planned",
                        ruolo_intus: "",
                        partecipanti_diretti: "",
                        partecipanti_indiretti: "",
                        ente_finanziatore: ""
                      });
                    }}
                  >
                    ✕ Annulla
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {isEditingProject && (
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={editingProject?.pubblicato ? "default" : "secondary"}>
                      {editingProject?.pubblicato ? "Pubblicato" : "Bozza"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      Modifica in corso - ID: {editingProject?.id}
                    </span>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Titolo *</Label>
                  <Input
                    id="project-title"
                    placeholder="Inserisci il titolo del progetto"
                    value={getCurrentProject()?.titolo || ""}
                    onChange={(e) => updateCurrentProject({ titolo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-category">Categoria *</Label>
                  <Select value={getCurrentProject()?.categoria || ""} onValueChange={(value) => updateCurrentProject({ categoria: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Animazione territoriale">Animazione territoriale</SelectItem>
                      <SelectItem value="Educazione alla legalità">Educazione alla legalità</SelectItem>
                      <SelectItem value="Politiche giovanili">Politiche giovanili</SelectItem>
                      <SelectItem value="Sviluppo di ricerche/Intervento">Sviluppo di ricerche/Intervento</SelectItem>
                      <SelectItem value="Promozione del territorio">Promozione del territorio</SelectItem>
                      <SelectItem value="Inclusione sociale">Inclusione sociale</SelectItem>
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
                    value={getCurrentProject()?.luoghi?.[0] || ""}
                    onChange={(e) => updateCurrentProject({ luoghi: e.target.value ? [e.target.value] : [] })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-date">Data</Label>
                  <Input
                    id="project-date"
                    type="date"
                    value={getCurrentProject()?.data_inizio || ""}
                    onChange={(e) => updateCurrentProject({ data_inizio: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-participants">Partecipanti Totali</Label>
                  <Input
                    id="project-participants"
                    type="number"
                    placeholder="Numero stimato"
                    value={getCurrentProject()?.numero_partecipanti || ""}
                    onChange={(e) => updateCurrentProject({ numero_partecipanti: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-participants-direct">Partecipanti Diretti</Label>
                  <Input
                    id="project-participants-direct"
                    placeholder="es. Istituto X, Associazione Y, 50 studenti"
                    value={getCurrentProject()?.partecipanti_diretti || ""}
                    onChange={(e) => updateCurrentProject({ partecipanti_diretti: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-participants-indirect">Partecipanti Indiretti</Label>
                  <Input
                    id="project-participants-indirect"
                    placeholder="es. Comunità locale, Famiglie, 200 cittadini"
                    value={getCurrentProject()?.partecipanti_indiretti || ""}
                    onChange={(e) => updateCurrentProject({ partecipanti_indiretti: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-status">Stato</Label>
                  <Select value={getCurrentProject()?.status || "planned"} onValueChange={(value: any) => updateCurrentProject({ status: value })}>
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
                  <Label htmlFor="project-youtube">Link YouTube Principale (opzionale)</Label>
                  <Input
                    id="project-youtube"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={getCurrentProject()?.youtube_url || ""}
                    onChange={(e) => updateCurrentProject({ youtube_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="project-intus-role">Ruolo di Intus</Label>
                  <Textarea
                    id="project-intus-role"
                    placeholder="Descrivi il ruolo di Intus nel progetto..."
                    value={getCurrentProject()?.ruolo_intus || ""}
                    onChange={(e) => updateCurrentProject({ ruolo_intus: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-funding-entity">Ente Finanziatore</Label>
                  <Input
                    id="project-funding-entity"
                    placeholder="Nome dell'ente che finanzia il progetto"
                    value={getCurrentProject()?.ente_finanziatore || ""}
                    onChange={(e) => updateCurrentProject({ ente_finanziatore: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="project-description-short">Descrizione Breve *</Label>
                  <Textarea
                    id="project-description-short"
                    placeholder="Breve descrizione del progetto..."
                    value={getCurrentProject()?.descrizione_breve || ""}
                    onChange={(e) => updateCurrentProject({ descrizione_breve: e.target.value })}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-content">Contenuto Dettagliato *</Label>
                  <Textarea
                    id="project-content"
                    placeholder="Descrizione dettagliata del progetto, obiettivi, attività..."
                    value={getCurrentProject()?.contenuto || ""}
                    onChange={(e) => updateCurrentProject({ contenuto: e.target.value })}
                    className="min-h-[150px]"
                  />
                </div>
              </div>

              {/* YouTube URLs aggiuntivi */}
              <div className="space-y-4">
                <Label>Link YouTube Aggiuntivi</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  {getCurrentProject()?.youtube_urls?.map((url: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded border">
                      <div className="flex-1">
                        <Input
                          placeholder="https://www.youtube.com/watch?v=..."
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...(getCurrentProject()?.youtube_urls || [])];
                            newUrls[index] = e.target.value;
                            updateCurrentProject({ youtube_urls: newUrls });
                          }}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newUrls = getCurrentProject()?.youtube_urls?.filter((_: string, i: number) => i !== index) || [];
                          updateCurrentProject({ youtube_urls: newUrls });
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newUrls = [...(getCurrentProject()?.youtube_urls || []), ""];
                      updateCurrentProject({ youtube_urls: newUrls });
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Link YouTube
                  </Button>
                </div>
              </div>

              {/* Partner Section */}
              <div className="space-y-4">
                <Label>Partner del Progetto</Label>
                <div className="border rounded-lg p-4 space-y-4">
                  {getCurrentProject()?.partner?.map((partner: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded border">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Nome partner"
                          value={partner.nome || ""}
                          onChange={(e) => {
                            const newPartners = [...(getCurrentProject()?.partner || [])];
                            newPartners[index] = { ...newPartners[index], nome: e.target.value };
                            updateCurrentProject({ partner: newPartners });
                          }}
                        />
                        <Input
                          placeholder="Link (opzionale)"
                          value={partner.link || ""}
                          onChange={(e) => {
                            const newPartners = [...(getCurrentProject()?.partner || [])];
                            newPartners[index] = { ...newPartners[index], link: e.target.value };
                            updateCurrentProject({ partner: newPartners });
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`capofila-${index}`}
                            checked={partner.capofila || false}
                            onChange={(e) => {
                              const newPartners = [...(getCurrentProject()?.partner || [])];
                              newPartners[index] = { ...newPartners[index], capofila: e.target.checked };
                              updateCurrentProject({ partner: newPartners });
                            }}
                            className="rounded border-gray-300"
                          />
                          <label htmlFor={`capofila-${index}`} className="text-sm font-medium">
                            ⭐ Capofila
                          </label>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newPartners = getCurrentProject()?.partner?.filter((_: any, i: number) => i !== index) || [];
                          updateCurrentProject({ partner: newPartners });
                        }}
                        className="text-destructive hover:text-destructive"
                      >
                        ✕
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newPartners = [...(getCurrentProject()?.partner || []), { nome: "", link: "", capofila: false }];
                      updateCurrentProject({ partner: newPartners });
                    }}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Aggiungi Partner
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Immagini Progetto</Label>
                <ProjectImageUploader
                  onUpload={handleProjectImageUpload}
                  onRemove={handleProjectImageRemove}
                  uploadedImages={getCurrentProject()?.immagini || []}
                  maxImages={5}
                />
              </div>

              <div className="flex gap-4">
                <Button onClick={handleSubmitProject} className="shadow-md">
                  <Plus className="w-4 h-4 mr-2" />
                  {isEditingProject ? "Aggiorna Progetto" : "Salva Progetto"}
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
