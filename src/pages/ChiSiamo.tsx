import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Heart, Target, Users, Calendar, MapPin, Zap } from "lucide-react";

// Timeline Component with Scroll Animation
const TimelineComponent = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const timelineElement = document.getElementById('animated-timeline');
      if (timelineElement) {
        const rect = timelineElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;
        
        // Calculate how much of the timeline is visible
        const visibleTop = Math.max(0, windowHeight - rect.top);
        const visibleBottom = Math.min(elementHeight, windowHeight - rect.bottom + elementHeight);
        const visibleHeight = Math.max(0, visibleTop - Math.max(0, -visibleBottom));
        
        const progress = Math.min(100, Math.max(0, (visibleHeight / elementHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const timelineItems = [
    {
      year: "2021",
      title: "Fondazione dell'Associazione",
      description: "Nasce Intus con l'obiettivo di unire le energie della comunità e promuovere la cittadinanza attiva.",
      icon: Heart,
      color: "bg-primary"
    },
    {
      year: "2022", 
      title: "Primo Progetto Giovani",
      description: "Lancio dello Youth Hub: uno spazio di aggregazione e crescita per i giovani del territorio.",
      icon: Users,
      color: "bg-accent"
    },
    {
      year: "2023",
      title: "Valorizzazione del Territorio", 
      description: "Restauro di siti storici e promozione del turismo sostenibile con il coinvolgimento della comunità.",
      icon: MapPin,
      color: "bg-heart"
    },
    {
      year: "2024",
      title: "Espansione e Crescita",
      description: "Nuovi progetti e collaborazioni per ampliare l'impatto sulla comunità locale.",
      icon: Target,
      color: "bg-accent"
    },
    {
      year: "2025",
      title: "Oggi e Futuro",
      description: "Intus continua a crescere, creando nuove opportunità e rafforzando il senso di appartenenza nella comunità.",
      icon: Zap,
      color: "bg-primary"
    }
  ];

  return (
    <div className="relative" id="animated-timeline">
      {/* Animated progress line */}
      <div className="absolute left-8 top-0 w-1 bg-muted-foreground/20 rounded-full" style={{ height: '100%' }}>
        <div 
          className="w-full bg-gradient-to-b from-primary to-accent rounded-full transition-all duration-300 ease-out"
          style={{ height: `${scrollProgress}%` }}
        />
      </div>
      
      {/* Animated dot */}
      <div 
        className="absolute left-6 w-5 h-5 bg-gradient-to-br from-primary to-accent rounded-full shadow-lg transition-all duration-300 ease-out z-10"
        style={{ 
          top: `${Math.min(scrollProgress, 95)}%`,
          transform: 'translateY(-50%)',
          opacity: scrollProgress > 0 ? 1 : 0,
          boxShadow: '0 0 20px rgba(219, 39, 119, 0.6)'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-full animate-ping opacity-30" />
      </div>

      {/* Timeline items */}
      <div className="space-y-12 pl-20">
        {timelineItems.map((item, index) => {
          const ItemIcon = item.icon;
          const isVisible = scrollProgress > (index / timelineItems.length) * 100;
          
          return (
            <div 
              key={index}
              className={`transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-30 translate-y-8'
              }`}
            >
              <div className="flex items-start space-x-6">
                <div className={`${item.color} p-4 rounded-2xl shadow-lg`}>
                  <ItemIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl md:text-2xl font-bold">{item.title}</h3>
                    <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent font-bold text-lg">
                      {item.year}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const ChiSiamo = () => {
  const teamMembers = [
    {
      name: "Marco Rossi",
      role: "Fondatore & Coordinatore",
      bio: "Esperto in politiche giovanili con oltre 10 anni di esperienza nel settore sociale.",
      image: "/placeholder.svg",
      skills: ["Leadership", "Progettazione", "Comunicazione"]
    },
    {
      name: "Laura Bianchi", 
      role: "Responsabile Territorio",
      bio: "Architetto urbanista specializzata nello sviluppo sostenibile del territorio.",
      image: "/placeholder.svg",
      skills: ["Urbanistica", "Sostenibilità", "Innovazione"]
    },
    {
      name: "Alessandro Verde",
      role: "Coordinatore Giovani",
      bio: "Educatore sociale con focus su empowerment giovanile e cittadinanza attiva.",
      image: "/placeholder.svg", 
      skills: ["Educazione", "Mediazione", "Creatività"]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <Heart className="w-16 h-16 text-heart mx-auto mb-6 animate-pulse-heart" />
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Chi <span className="text-primary">Siamo</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              INTUS CORLEONE APS nasce a Corleone nel 1997, nel cuore di quella che è stata definita la “Primavera Corleonese”, come segno di rinascita culturale e civile. Nata dall’energia di quattro giovani formatisi alla scuola di Daniele Novara presso il Centro Psicopedagogico per la Pace di Piacenza, l’associazione affonda le radici nei valori dell’educazione alla pace, ai diritti umani e alla convivenza democratica ed ecologica.


Sin dall’inizio, la nostra missione ha ruotato attorno all’educazione alla legalità, promuovendo strumenti di cittadinanza attiva come i Consigli Comunali dei Ragazzi (CCR), e formando educatori e animatori impegnati nella crescita civile delle nuove generazioni.


Negli anni, ci siamo evoluti in un laboratorio permanente di politiche sociali e giovanili, coinvolgendo giovani, donne e soggetti fragili. Siamo tra i fondatori della rete nazionale I.T.E.R., che connette enti pubblici e realtà del Terzo Settore attivi sulle politiche giovanili, con progetti sviluppati a livello locale, nazionale ed europeo.
Promuoviamo il territorio attraverso il turismo responsabile in collaborazione con Addiopizzo Travel e Palma Nana, e siamo soci fondatori del Laboratorio della Legalità, museo ospitato in un bene confiscato alla mafia, che racconta — attraverso l’arte — la storia della resistenza alla mafia.


INTUS è uno spazio aperto, in continua evoluzione, dove educazione, memoria e partecipazione diventano strumenti per costruire un futuro condiviso.

            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-card to-muted/50 shadow-elegant animate-fade-in-up">
              <CardContent className="p-8">
                <Target className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">La Nostra Missione</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Promuoviamo una cultura della legalità, della pace e della partecipazione attiva, attraverso percorsi educativi, sociali e culturali rivolti soprattutto ai giovani. Lavoriamo per costruire comunità più consapevoli, inclusive e solidali, dove ogni persona possa contribuire al bene comune, nel rispetto dei diritti umani e dell’ambiente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-card to-muted/50 shadow-elegant animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-8">
                <Users className="w-12 h-12 text-accent mb-6" />
                <h3 className="text-2xl font-bold mb-4">La Nostra Visione</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Immaginiamo un territorio in cui la memoria diventa azione, l’educazione genera cambiamento e la cittadinanza attiva è il cuore pulsante di una società giusta, libera dalle mafie e fondata sulla dignità delle persone.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 animate-fade-in-up">
            Il Nostro <span className="text-primary">Team</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member, index) => (
              <Card 
                key={index}
                className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in-up"
                style={{animationDelay: `${0.2 + index * 0.1}s`}}
              >
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={member.image} alt={member.name} />
                    <AvatarFallback className="text-xl font-bold bg-gradient-to-br from-primary to-accent text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-primary font-medium mb-3">{member.role}</p>
                  <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{member.bio}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <Badge key={skillIndex} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partner e Reti Associate */}
      <section className="py-16 px-4 bg-gradient-to-r from-accent/5 to-primary/5">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 animate-fade-in-up">
            Partner e <span className="text-primary">Reti Associate</span>
          </h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <a
              href="https://www.sipuofare.net/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-primary/20"
            >
              <img src="https://www.sipuofare.net/wp-content/uploads/2024/10/loghi-09-226x122.png" alt="Si Può Fare" className="w-16 h-16 object-contain rounded-full bg-white" />
              <div>
                <div className="font-bold text-lg text-primary">Si Può Fare</div>
                <div className="text-muted-foreground text-sm">www.sipuofare.net</div>
              </div>
            </a>
            <a
              href="https://www.xn--arrivatalafelicit-4ob8k.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-accent/20"
            >
              <img src="https://www.xn--arrivatalafelicit-4ob8k.it/wp-content/uploads/2023/11/LOGO_1WEB.jpg" alt="Arrivata la Felicità" className="w-16 h-16 object-contain rounded-full bg-white" />
              <div>
                <div className="font-bold text-lg text-accent">Arrivata la Felicità</div>
                <div className="text-muted-foreground text-sm">arrivatalafelicità.it</div>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* Timeline Section - La Nostra Storia Animata */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-muted/10 via-background to-muted/10">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 animate-fade-in-up">
            La Nostra <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Storia</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Scopri il nostro percorso e guarda come il pallino si muove mentre scorri la pagina
          </p>
          
          <TimelineComponent />
        </div>
      </section>
    </div>
  );
};

export default ChiSiamo;
