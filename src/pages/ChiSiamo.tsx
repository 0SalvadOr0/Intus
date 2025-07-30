import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  Heart, 
  Target, 
  Users, 
  Calendar, 
  MapPin, 
  GraduationCap,
  BookOpen,
  Globe,
  Lightbulb,
  Award,
  Building,
  Network,
  FileText,
  Microscope,
  Camera,
  Shield,
  TreePine,
  Music,
  ChevronDown,
  ChevronRight,
  BarChart3,
  TrendingUp,
  Users2,
  Clock
} from "lucide-react";

// Componente immersivo a schermo intero per la descrizione
const ImmersiveDescription = () => {
  const [currentSentence, setCurrentSentence] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastScrollTime = useRef<number>(0);
  const sentences = [
    {
      text: "INTUS CORLEONE APS nasce a Corleone nel 1997",
      accent: "nel cuore della Primavera Corleonese",
      gradient: "from-primary to-accent"
    },
    {
      text: "Quattro giovani formatisi alla scuola di Daniele Novara",
      accent: "con radici nell'educazione alla pace",
      gradient: "from-accent to-heart"
    },
    {
      text: "La nostra missione: educazione alla legalità",
      accent: "attraverso i Consigli Comunali dei Ragazzi",
      gradient: "from-heart to-primary"
    },
    {
      text: "Un laboratorio permanente di politiche giovanili",
      accent: "fondatori della rete nazionale I.T.E.R.",
      gradient: "from-primary to-accent"
    },
    {
      text: "Turismo responsabile con Addiopizzo Travel",
      accent: "e il Laboratorio della Legalità",
      gradient: "from-accent to-heart"
    },
    {
      text: "INTUS è uno spazio aperto",
      accent: "dove educazione, memoria e partecipazione costruiscono il futuro",
      gradient: "from-heart to-primary",
      isQuote: true
    }
  ];

  const handleScroll = useCallback((e: Event) => {
    e.preventDefault();
    const now = Date.now();

    if (now - lastScrollTime.current < 1000 || isTransitioning) return;

    lastScrollTime.current = now;
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentSentence(prev => (prev + 1) % sentences.length);
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, sentences.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleScroll, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleScroll);
    };
  }, [handleScroll]);

  const currentData = sentences[currentSentence];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-40 bg-gradient-to-br from-background via-background/95 to-background items-center justify-center overflow-hidden"
      style={{
        height: '100vh',
        width: '100vw',
        display: 'none',
        transform: 'translateY(-100%)',
        transition: 'transform 800ms ease-in-out'
      }}
    >
      {/* Background animated gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${currentData.gradient} opacity-5 transition-all duration-1000 ease-out`}
      />

      {/* Content container */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 text-center">
        {/* Main sentence */}
        <div
          className={`transition-all duration-700 ease-out ${
            isTransitioning
              ? 'opacity-0 transform translate-y-8 scale-95'
              : 'opacity-100 transform translate-y-0 scale-100'
          }`}
        >
          <h2
            className={`text-4xl md:text-6xl lg:text-7xl font-bold mb-8 leading-tight ${
              currentData.isQuote ? 'italic' : ''
            }`}
          >
            <span className={`bg-gradient-to-r ${currentData.gradient} bg-clip-text text-transparent`}>
              {currentData.text}
            </span>
          </h2>

          {/* Accent text */}
          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground leading-relaxed max-w-4xl mx-auto">
            {currentData.accent}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
          {sentences.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index === currentSentence
                  ? `w-8 bg-gradient-to-r ${currentData.gradient}`
                  : 'w-2 bg-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground flex items-center gap-2">
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
          <span>Scrolla per continuare</span>
          <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
        </div>
      </div>

      {/* Exit button */}
      <button
        onClick={() => {
          const container = containerRef.current;
          if (container) {
            container.style.transform = 'translateY(-100%)';
            container.style.transition = 'transform 800ms ease-in-out';
            setTimeout(() => {
              container.style.display = 'none';
            }, 800);
          }
        }}
        className="absolute top-8 right-8 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background transition-colors border border-border/50"
      >
        <svg width="24" height="24" className="lucide lucide-x w-6 h-6">
          <path d="m18 6-12 12" />
          <path d="m6 6 12 12" />
        </svg>
      </button>
    </div>
  );
};

// Statistiche Strategy
const StatisticsSection = () => {
  const stats = [
    {
      title: "Anni di Attività",
      value: "28",
      subtitle: "Dal 1997 ad oggi",
      icon: Clock,
      color: "text-primary"
    },
    {
      title: "Progetti Realizzati",
      value: "40+",
      subtitle: "In diversi ambiti",
      icon: Award,
      color: "text-accent"
    },
    {
      title: "Giovani Coinvolti",
      value: "1000+",
      subtitle: "Nelle varie iniziative",
      icon: Users2,
      color: "text-heart"
    },
    {
      title: "Partner Attivi",
      value: "50+",
      subtitle: "Enti e istituzioni",
      icon: Network,
      color: "text-primary"
    }
  ];

  return (
    <section className="py-16 px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-heart/5">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 animate-fade-in-up">
          I Nostri <span className="text-primary">Numeri</span>
        </h2>
        
        <div className="grid md:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const StatIcon = stat.icon;
            return (
              <Card 
                key={index}
                className="border-0 bg-card/80 backdrop-blur-sm hover:shadow-elegant transition-all duration-300 hover:-translate-y-2 animate-fade-in-up text-center"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <CardContent className="p-6">
                  <StatIcon className={`w-12 h-12 mx-auto mb-4 ${stat.color}`} />
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <h3 className="font-semibold mb-1">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground">{stat.subtitle}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Timeline Component with Scroll Animation and Expandable Years
const TimelineComponent = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [expandedYears, setExpandedYears] = useState<string[]>([]);

  useEffect(() => {
    const handleScroll = () => {
      const timelineElement = document.getElementById('animated-timeline');
      if (timelineElement) {
        const rect = timelineElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementHeight = rect.height;
        
        const visibleTop = Math.max(0, windowHeight - rect.top);
        const visibleBottom = Math.min(elementHeight, windowHeight - rect.bottom + elementHeight);
        const visibleHeight = Math.max(0, visibleTop - Math.max(0, -visibleBottom));
        
        const progress = Math.min(100, Math.max(0, (visibleHeight / elementHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleYear = (year: string) => {
    setExpandedYears(prev => 
      prev.includes(year) 
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };

  const timelineData = [
    {
      year: "1997",
      title: "Fondazione e Prime Iniziative",
      description: "Nasce INTUS nella 'Primavera Corleonese' con i primi progetti di educazione alla legalità",
      icon: Heart,
      color: "bg-primary",
      projects: [
        {
          title: "CONSIGLI DA RAGAZZI",
          description: "Percorso di educazione alla legalità per la costituzione del Consiglio Comunale dei Ragazzi",
          destinatari: "Alunni Istituto G. Vasi Corleone",
          ente: "Comune di Corleone"
        },
        {
          title: "ECOLOGIOCHI", 
          description: "Educazione ambientale attraverso giochi di squadra per le scuole",
          destinatari: "Alunni Istituto G. Vasi",
          ente: "Comune di Corleone"
        }
      ]
    },
    {
      year: "1998",
      title: "Espansione nell'Educazione",
      description: "Ampliamento delle attività formative e creazione di spazi educativi per minori",
      icon: GraduationCap,
      color: "bg-accent",
      projects: [
        {
          title: "FORMARE PER IN-FORMARE",
          description: "Educazione alla legalità nelle scuole superiori con costituzione consulta giovanile",
          destinatari: "Alunni scuole superiori",
          ente: "Comune di Corleone"
        },
        {
          title: "LUDOTECA",
          description: "Creazione di spazi educativi per minori a rischio",
          destinatari: "Minori fragili",
          ente: "Segretariato Sociale"
        }
      ]
    },
    {
      year: "1999",
      title: "Formazione Educatori",
      description: "Focus sulla formazione di operatori e interventi in zone a rischio",
      icon: Users,
      color: "bg-heart",
      projects: [
        {
          title: "LARGO AI RAGAZZI O RAGAZZI AL LARGO",
          description: "Formazione di 20 educatori e animatori per il Consiglio Comunale dei Ragazzi",
          destinatari: "Educatori",
          ente: "Comune di Misilmeri"
        },
        {
          title: "UNA CHANCE AI MARGINI PER CORLEONE",
          description: "Animazione culturale in zone a rischio del territorio",
          destinatari: "Minori e famiglie svantaggiate",
          ente: "Ministero Interni/Comune Corleone"
        },
        {
          title: "LA SCUOLA",
          description: "Monitoraggio dispersione scolastica e integrazione sociale",
          destinatari: "Scuole di ogni ordine e grado",
          ente: "Patto Territoriale Alto Belice"
        }
      ]
    },
    {
      year: "2000",
      title: "Inclusione Sociale e Ricerca",
      description: "Progetti per l'imprenditoria femminile e ricerca europea sull'esclusione sociale",
      icon: Globe,
      color: "bg-primary",
      projects: [
        {
          title: "LE DONNE DI CORLEONE",
          description: "Sostegno all'imprenditoria femminile per donne di fasce deboli",
          destinatari: "28 donne appartenenti a fasce deboli",
          ente: "FSE Dipartimento Politiche Giovanili"
        },
        {
          title: "INFORMATION ABOUT SOCIAL EXCLUSION",
          description: "Ricerca europea con 6 città su nuove povertà",
          destinatari: "Coordinamento Sicilia",
          ente: "Dipartimento Affari Sociali"
        }
      ]
    },
    {
      year: "2001-2003",
      title: "Economia Solidale e Ricerca",
      description: "Progetti su consumo critico, dispersione scolastica e cultura civica",
      icon: BookOpen,
      color: "bg-accent",
      projects: [
        {
          title: "CITTADINI DEL MONDO",
          description: "Formazione su economia solidale, mercato internazionale e consumo critico",
          destinatari: "Alunni e docenti istituti superiori",
          ente: "Istituti Superiori Corleone"
        },
        {
          title: "PREVENZIONE DISPERSIONE SCOLASTICA",
          description: "Progettazione contro dispersione scolastica nel territorio",
          destinatari: "Istituti del territorio",
          ente: "PON Obiettivo 1"
        },
        {
          title: "CULTURA CIVICA DEI GIOVANI",
          description: "Ricerca su cultura civica dei giovani corleonesi",
          destinatari: "Studenti superiori",
          ente: "IMES Catania/Università Torino"
        }
      ]
    },
    {
      year: "2004-2008",
      title: "Reti Territoriali",
      description: "Costruzione reti tra comuni e ricerca transnazionale su criminalità minorile",
      icon: Network,
      color: "bg-heart",
      projects: [
        {
          title: "BILLY THE KID",
          description: "Ricerca su minori a rischio criminalità in contesto transnazionale",
          destinatari: "Minori a rischio",
          ente: "Programma UE anti-emarginazione"
        },
        {
          title: "RETE MADONIE",
          description: "Convenzione per politiche welfare e giovanili nell'area madonita",
          destinatari: "Enti locali basse Madonie",
          ente: "Comune di Caltavuturo"
        }
      ]
    },
    {
      year: "2009-2010",
      title: "Centri e Laboratori",
      description: "Costituzione associazioni di rete e fondazione Laboratorio della Legalità",
      icon: Building,
      color: "bg-primary",
      projects: [
        {
          title: "ASSOCIAZIONE IO GIO.CO",
          description: "Costituzione associazione di associazioni per Centro Multimediale",
          destinatari: "Enti terzo settore",
          ente: "Comune di Corleone"
        },
        {
          title: "LABORATORIO DELLA LEGALITÀ",
          description: "Cofondazione laboratorio in bene confiscato con percorsi formativi nazionali",
          destinatari: "Scuole territorio italiano",
          ente: "Ministero Interni/Regione Sicilia"
        }
      ]
    },
    {
      year: "2012-2016",
      title: "Innovazione e Tecnologia",
      description: "Grande progetto di valorizzazione culturale con tecnologie innovative",
      icon: Lightbulb,
      color: "bg-accent",
      projects: [
        {
          title: "PROGETTO INTUS",
          description: "Sistema innovativo di valorizzazione patrimonio culturale con tecnologie intelligenti",
          destinatari: "Territorio e giovani",
          ente: "MIUR PON04a3_00476"
        }
      ]
    },
    {
      year: "2017",
      title: "Utopie e Performance",
      description: "Progetti sperimentali su immaginario utopico e attività artistiche",
      icon: Music,
      color: "bg-heart",
      projects: [
        {
          title: "IL GIOCO DELLE 100 UTOPIE",
          description: "Esplorazione immaginario utopico bambini 6-11 anni",
          destinatari: "20 bambini classe V elementare",
          ente: "Università di Pisa/Istituto G. Vasi"
        },
        {
          title: "U MALU PASSU",
          description: "Laboratori estivi teatro, musica, audiovisivo con performance finale",
          destinatari: "60 ragazzi Istituto G. Vasi",
          ente: "Piano Nazionale Dispersione Scolastica"
        },
        {
          title: "FARE STORIA NEL PAESAGGIO",
          description: "Scienza geo-storica del paesaggio ed educazione cittadinanza",
          destinatari: "Dirigenti, insegnanti, docenti universitari",
          ente: "AISO/Università Palermo"
        },
        {
          title: "LUOGHI COMUNI",
          description: "Laboratori legalità con festival culturale per centenario Bernardino Verro",
          destinatari: "Studenti corleonesi ogni ordine",
          ente: "Dipartimento Gioventù Presidenza Consiglio"
        }
      ]
    },
    {
      year: "2017-2018",
      title: "Dimensione Europea",
      description: "Scambi internazionali e progetti europei per la legalità",
      icon: Globe,
      color: "bg-primary",
      projects: [
        {
          title: "YOUNG PEOPLE FOR LEGALITY IN EUROPE",
          description: "Scambio giovanile europeo su legalità con metodologie attive",
          destinatari: "30 giovani Europa dell'est",
          ente: "ERASMUS+ YOUTH IN ACTION"
        },
        {
          title: "YOUNG PEOPLE MOVER",
          description: "Partecipazione giovanile nella pianificazione spazi pubblici",
          destinatari: "Giovani 16-35 anni",
          ente: "Comune Prato/Talent Garden"
        },
        {
          title: "PORTE APERTE ALLA LEGALITÀ",
          description: "PCTO per promozione territoriale e narrazione museo",
          destinatari: "Studenti liceo scientifico",
          ente: "Istituto Don G. Colletto"
        },
        {
          title: "CAMPO PROTEZIONE CIVILE",
          description: "Campo estivo protezione civile per ragazzi",
          destinatari: "20 ragazzi 11-14 anni",
          ente: "ProcivArci Grifone"
        }
      ]
    },
    {
      year: "2018-2019",
      title: "Protagonismo Giovanile",
      description: "Progetti per aggregazione giovanile e biblioteca diffusa",
      icon: Users,
      color: "bg-accent",
      projects: [
        {
          title: "PERCORSI VIRTUOSI",
          description: "Protagonismo sociale giovani per prevenire disagio e devianza",
          destinatari: "Giovani 14-16 anni territorio Consorzio",
          ente: "Giovani per il Sociale"
        },
        {
          title: "LIBRI BENE COMUNE",
          description: "Biblioteca diffusa con 7000 testi per promozione lettura solidale",
          destinatari: "Cittadinanza corleonese",
          ente: "Centro sociale Di Matteo/vari partner"
        }
      ]
    },
    {
      year: "2016-oggi",
      title: "Turismo e Narrazione",
      description: "Promozione territoriale attraverso percorsi di legalità e storia",
      icon: MapPin,
      color: "bg-heart",
      projects: [
        {
          title: "LE STRADE E LA STORIA",
          description: "Promozione territoriale con percorsi educazione legalità e narrazione",
          destinatari: "Scuole italiane e straniere",
          ente: "AddioPizzo Travel/Palma Nana"
        }
      ]
    },
    {
      year: "2021-2022",
      title: "Reti e Multimedia",
      description: "Costituzione reti territoriali e progetti audiovisivi educativi",
      icon: Camera,
      color: "bg-primary",
      projects: [
        {
          title: "FUORI ORARIO",
          description: "Rafforzamento CCR e alfabetizzazione culturale studenti",
          destinatari: "Alunni Istituto G. Vasi",
          ente: "Contrasto Povertà Educativa"
        },
        {
          title: "RETE GSL",
          description: "Rete Giovani Sviluppo Locale tra istituzioni scolastiche",
          destinatari: "Istituti Distretti 38 e 40",
          ente: "Rete Scolastica"
        },
        {
          title: "RETE PRO.G.eT.",
          description: "Rete territoriale Progetto Giovani e Territorio con 16 enti",
          destinatari: "Adolescenti e giovani",
          ente: "Cantiere Politiche Giovanili"
        },
        {
          title: "RIGENERAZIONE",
          description: "Officine dei Saperi con pedagogia interdisciplinare innovativa",
          destinatari: "Studenti a rischio",
          ente: "Istituto G. Vasi"
        },
        {
          title: "CASA DEL RIONE SANITÀ",
          description: "Laboratori storia orale e promozione territorio napoletano",
          destinatari: "Comunità territoriale",
          ente: "Napoli inVita/Piano Azione Coesione"
        },
        {
          title: "È ARRIVATA LA FELICITÀ",
          description: "Formazione linguaggio cinematografico e audiovisivo educativo",
          destinatari: "Studenti reti scolastiche",
          ente: "Ministero Istruzione/Cultura"
        }
      ]
    },
    {
      year: "2024-2025",
      title: "Futuro e Comunità",
      description: "Microprogetti per giovani e sviluppo delle comunità locali",
      icon: TrendingUp,
      color: "bg-accent",
      projects: [
        {
          title: "SI PUÒ FARE",
          description: "Supporto e contributi per iniziative giovanili di sviluppo comunitario",
          destinatari: "Giovani 16-30 anni",
          ente: "Ministero Lavoro/Cantiere Giovani"
        },
        {
          title: "GIOVANI PER LE COMUNITÀ LOCALI",
          description: "Microprogetti per sviluppo comunità con contributi economici",
          destinatari: "Giovani 16-30 anni",
          ente: "Assessorato Famiglia Regione Sicilia"
        }
      ]
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
      <div className="space-y-8 pl-20">
        {timelineData.map((item, index) => {
          const ItemIcon = item.icon;
          const isVisible = scrollProgress > (index / timelineData.length) * 100;
          const isExpanded = expandedYears.includes(item.year);
          const hasMultipleProjects = item.projects && item.projects.length > 1;
          
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
                    {hasMultipleProjects && (
                      <Badge variant="secondary" className="text-xs">
                        {item.projects.length} progetti
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {item.description}
                  </p>
                  
                  {hasMultipleProjects ? (
                    <Collapsible open={isExpanded} onOpenChange={() => toggleYear(item.year)}>
                      <CollapsibleTrigger className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
                        {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        <span className="font-medium">
                          {isExpanded ? 'Nascondi dettagli' : 'Mostra tutti i progetti'}
                        </span>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="mt-4 space-y-4">
                        {item.projects.map((project, projectIndex) => (
                          <Card key={projectIndex} className="border-l-4 border-primary bg-muted/30">
                            <CardContent className="p-4">
                              <h4 className="font-bold text-foreground mb-2">{project.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{project.description}</p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="outline" className="bg-background/50">
                                  <Users className="w-3 h-3 mr-1" />
                                  {project.destinatari}
                                </Badge>
                                <Badge variant="outline" className="bg-background/50">
                                  <Building className="w-3 h-3 mr-1" />
                                  {project.ente}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    item.projects && item.projects.length === 1 && (
                      <Card className="border-l-4 border-primary bg-muted/30">
                        <CardContent className="p-4">
                          <h4 className="font-bold text-foreground mb-2">{item.projects[0].title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{item.projects[0].description}</p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <Badge variant="outline" className="bg-background/50">
                              <Users className="w-3 h-3 mr-1" />
                              {item.projects[0].destinatari}
                            </Badge>
                            <Badge variant="outline" className="bg-background/50">
                              <Building className="w-3 h-3 mr-1" />
                              {item.projects[0].ente}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  )}
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
            <div className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              <p>Scopri la nostra storia attraverso un'esperienza immersiva</p>
            </div>
            <button
              onClick={() => {
                const immersiveEl = document.querySelector('.fixed.inset-0');
                if (immersiveEl) {
                  (immersiveEl as HTMLElement).style.display = 'flex';
                  (immersiveEl as HTMLElement).style.transform = 'translateY(0)';
                }
              }}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <span>Inizia il Viaggio</span>
              <svg width="20" height="20" className="lucide lucide-arrow-right">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Immersive Description Component */}
      <ImmersiveDescription />

      {/* Statistiche */}
      <StatisticsSection />

      {/* Mission & Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <Card className="border-0 bg-gradient-to-br from-card to-muted/50 shadow-elegant animate-fade-in-up">
              <CardContent className="p-8">
                <Target className="w-12 h-12 text-primary mb-6" />
                <h3 className="text-2xl font-bold mb-4">La Nostra Missione</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Promuoviamo una cultura della legalità, della pace e della partecipazione attiva, attraverso percorsi educativi, sociali e culturali rivolti soprattutto ai giovani. Lavoriamo per costruire comunità più consapevoli, inclusive e solidali, dove ogni persona possa contribuire al bene comune, nel rispetto dei diritti umani e dell'ambiente.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-gradient-to-br from-card to-muted/50 shadow-elegant animate-fade-in-up" style={{animationDelay: '0.1s'}}>
              <CardContent className="p-8">
                <Users className="w-12 h-12 text-accent mb-6" />
                <h3 className="text-2xl font-bold mb-4">La Nostra Visione</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Immaginiamo un territorio in cui la memoria diventa azione, l'educazione genera cambiamento e la cittadinanza attiva è il cuore pulsante di una società giusta, libera dalle mafie e fondata sulla dignità delle persone.
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
              href="https://reteiter.it/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-primary/20"
            >
              <img src="https://reteiter.it/wp-content/uploads/2023/07/logo_ITER-copia-copia.png" alt="Rete Iter" className="w-16 h-16 object-contain rounded-full bg-white" />
              <div>
                <div className="font-bold text-lg text-primary">Associazione Reteiter</div>
                <div className="text-muted-foreground text-sm">www.reteiter.it</div>
              </div>
            </a>
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

      {/* Timeline Section - La Nostra Storia Completa */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-muted/10 via-background to-muted/10">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 animate-fade-in-up">
            La Nostra <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Storia</span>
          </h2>
          <p className="text-lg text-muted-foreground text-center mb-12 max-w-3xl mx-auto">
            28 anni di impegno per la legalità, l'educazione e lo sviluppo del territorio. Clicca sui progetti per espandere i dettagli.
          </p>
          
          <TimelineComponent />
        </div>
      </section>
    </div>
  );
};

export default ChiSiamo;
