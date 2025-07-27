import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Users, ExternalLink, Play, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  participants: number;
  image?: string;
  youtubeUrl?: string;
  status: "completed" | "ongoing" | "planned";
}

const LeNostreAttivita = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [openProjectId, setOpenProjectId] = useState<number|null>(null);

  // Mock data - in a real app this would come from a database
  const projects: Project[] = [
    {
      id: 1,
      title: "Youth Hub: Spazio di Aggregazione Giovanile",
      description: "Creazione di uno spazio dedicato ai giovani del territorio con attività ricreative, formative e di supporto. Un luogo di incontro che favorisce la socializzazione e lo sviluppo di competenze.",
      category: "Politiche Giovanili",
      location: "Centro Storico",
      date: "2024-01-15",
      participants: 45,
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      status: "completed"
    },
    {
      id: 2,
      title: "Valorizzazione del Patrimonio Storico",
      description: "Progetto di restauro e valorizzazione di siti storici locali attraverso il coinvolgimento della comunità e la promozione del turismo sostenibile.",
      category: "Territorio",
      location: "Borgo Antico",
      date: "2024-02-20",
      participants: 78,
      status: "ongoing"
    },
    {
      id: 3,
      title: "Giornata della Cittadinanza Attiva",
      description: "Evento di sensibilizzazione sui diritti e doveri civici con workshop pratici, dibattiti e testimonianze per promuovere la partecipazione democratica.",
      category: "Cittadinanza Attiva",
      location: "Piazza Centrale",
      date: "2024-03-10",
      participants: 120,
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      status: "completed"
    },
    {
      id: 4,
      title: "Laboratori di Digital Skills",
      description: "Corsi di formazione digitale per giovani e adulti, focalizzati su competenze informatiche di base e avanzate per l'inserimento lavorativo.",
      category: "Politiche Giovanili",
      location: "Centro Formazione",
      date: "2024-04-05",
      participants: 32,
      status: "planned"
    }
  ];

  const categories = ["all", "Cittadinanza Attiva", "Territorio", "Politiche Giovanili"];

  const filteredProjects = selectedCategory === "all" 
    ? projects 
    : projects.filter(project => project.category === selectedCategory);

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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProjects.map((project, index) => (
              <Card 
                key={project.id}
                className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 border-0 bg-card/80 backdrop-blur-sm animate-fade-in-up overflow-hidden"
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
              >
                {/* Project Image Placeholder */}
                <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <Badge className={`${getStatusColor(project.status)} border-0`}>
                      {getStatusLabel(project.status)}
                    </Badge>
                  </div>
                  {project.youtubeUrl && (
                    <div className="absolute top-4 right-4">
                      <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                        <Play className="w-4 h-4 ml-0.5" />
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="outline" className="bg-card/80 backdrop-blur-sm">
                      {project.category}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {project.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                    {project.description}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                      {new Date(project.date).toLocaleDateString('it-IT', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="w-4 h-4 mr-2 text-primary" />
                      {project.location}
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Users className="w-4 h-4 mr-2 text-primary" />
                      {project.participants} partecipanti
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    {project.youtubeUrl && (
                      <Button size="sm" className="flex-1" asChild>
                        <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer">
                          <Play className="w-3 h-3 mr-1" />
                          Video
                        </a>
                      </Button>
                    )}
                    <Dialog open={openProjectId === project.id} onOpenChange={(open) => setOpenProjectId(open ? project.id : null)}>
                      <Button size="sm" variant="outline" className="flex-1" onClick={() => setOpenProjectId(project.id)}>
                        <Eye className="w-3 h-3 mr-1" />
                        Dettagli
                      </Button>
                      <DialogContent className="max-w-lg">
                        <DialogHeader>
                          <DialogTitle>{project.title}</DialogTitle>
                          <DialogDescription>{project.category}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p>{project.description}</p>
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center text-muted-foreground">
                              <CalendarDays className="w-4 h-4 mr-2 text-primary" />
                              {new Date(project.date).toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-2 text-primary" />
                              {project.location}
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Users className="w-4 h-4 mr-2 text-primary" />
                              {project.participants} partecipanti
                            </div>
                            <div className="flex items-center text-muted-foreground">
                              <Badge className={`${getStatusColor(project.status)} border-0`}>{getStatusLabel(project.status)}</Badge>
                            </div>
                          </div>
                          {project.youtubeUrl && (
                            <a href={project.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-red-600 hover:underline">
                              <Play className="w-4 h-4" /> Guarda il video
                            </a>
                          )}
                        </div>
                        <DialogClose asChild>
                          <Button variant="ghost" className="mt-4 w-full">Chiudi</Button>
                        </DialogClose>
                      </DialogContent>
                    </Dialog>
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