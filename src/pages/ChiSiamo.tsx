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
      accent: "nel cuore di quella che è stata definita la \"Primavera Corleonese\", come segno di rinascita culturale e civile",
      gradient: "from-primary to-accent"
    },
    {
      text: "Nata dall'energia di quattro giovani formatisi alla scuola di Daniele Novara",
      accent: "presso il Centro Psicopedagogico per la Pace di Piacenza, l'associazione affonda le radici nei valori dell'educazione alla pace, ai diritti umani e alla convivenza democratica ed ecologica",
      gradient: "from-accent to-heart"
    },
    {
      text: "Sin dall'inizio, la nostra missione ha ruotato attorno all'educazione alla legalità",
      accent: "promuovendo strumenti di cittadinanza attiva come i Consigli Comunali dei Ragazzi (CCR), e formando educatori e animatori impegnati nella crescita civile delle nuove generazioni",
      gradient: "from-heart to-primary"
    },
    {
      text: "Negli anni, ci siamo evoluti in un laboratorio permanente di politiche sociali e giovanili",
      accent: "coinvolgendo giovani, donne e soggetti fragili. Siamo tra i fondatori della rete nazionale I.T.E.R., che connette enti pubblici e realtà del Terzo Settore attivi sulle politiche giovanili",
      gradient: "from-primary to-accent"
    },
    {
      text: "Promuoviamo il territorio attraverso il turismo responsabile",
      accent: "in collaborazione con Addiopizzo Travel e Palma Nana, e siamo soci fondatori del Laboratorio della Legalità, museo ospitato in un bene confiscato alla mafia",
      gradient: "from-accent to-heart"
    },
    {
      text: "INTUS è uno spazio aperto, in continua evoluzione",
      accent: "dove educazione, memoria e partecipazione diventano strumenti per costruire un futuro condiviso",
      gradient: "from-heart to-primary",
      isQuote: true,
      isLast: true
    }
  ];

  const closeImmersive = useCallback(() => {
    const container = containerRef.current;
    if (container) {
      container.style.transform = 'translateY(-100%)';
      container.style.transition = 'transform 800ms ease-in-out';
      setTimeout(() => {
        container.style.display = 'none';
        setCurrentSentence(0); // Reset per la prossima volta
      }, 800);
    }
  }, []);

  const handleScroll = useCallback((e: Event) => {
    e.preventDefault();
    const now = Date.now();

    if (now - lastScrollTime.current < 1000 || isTransitioning) return;

    lastScrollTime.current = now;
    setIsTransitioning(true);

    setTimeout(() => {
      setCurrentSentence(prev => {
        const next = prev + 1;
        if (next >= sentences.length) {
          // Se è l'ultima frase, aspetta 3 secondi e chiudi
          setTimeout(() => {
            closeImmersive();
          }, 3000);
          return prev; // Rimane sull'ultima frase
        }
        return next;
      });
      setIsTransitioning(false);
    }, 300);
  }, [isTransitioning, sentences.length, closeImmersive]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let startY = 0;
    let startX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      const endY = e.changedTouches[0].clientY;
      const endX = e.changedTouches[0].clientX;
      const diffY = startY - endY;
      const diffX = Math.abs(startX - endX);

      // Solo se è uno swipe verticale (non orizzontale)
      if (diffY > 50 && diffX < 100) {
        handleScroll(e as any);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === ' ') {
        e.preventDefault();
        handleScroll(e as any);
      }
      if (e.key === 'Escape') {
        closeImmersive();
      }
    };

    container.addEventListener('wheel', handleScroll, { passive: false });
    container.addEventListener('touchstart', handleTouchStart);
    container.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('wheel', handleScroll);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleScroll, closeImmersive]);

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

      {/* Controls hint */}
      <div className="absolute top-8 left-8 text-xs text-muted-foreground/70 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-muted-foreground/30 rounded flex items-center justify-center text-[10px]">⌘</div>
          <span>Scroll, Space, ↓ per avanzare</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border border-muted-foreground/30 rounded flex items-center justify-center text-[10px]">⎋</div>
          <span>Esc per uscire</span>
        </div>
      </div>

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
        <div className="absolute mt-3 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
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
        <div className="absolute mt-7 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground flex items-center gap-2">
          {currentSentence < sentences.length - 1 ? (
            <>
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
              <span>Scorri verso il basso per continuare</span>
              <div className="w-1 h-1 bg-muted-foreground rounded-full animate-pulse" />
            </>
          ) : (
            <>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
              <span className="text-primary font-medium">Si chiuderà automaticamente...</span>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" />
            </>
          )}
        </div>
      </div>

      {/* Exit button */}
      <button
        onClick={closeImmersive}
        className="absolute top-8 right-8 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-background hover:scale-110 transition-all duration-300 border border-border/50 group"
      >
        <svg width="20" height="20" className="w-5 h-5 group-hover:w-6 group-hover:h-6 transition-all duration-300">
          <path d="m18 6-12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m6 6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
                  setTimeout(() => {
                    (immersiveEl as HTMLElement).style.transform = 'translateY(0)';
                  }, 50);
                }
              }}
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-primary to-accent text-primary-foreground px-8 py-4 rounded-full font-semibold hover:shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="relative z-10">Conoscici meglio</span>
              <svg width="20" height="20" className="relative z-10 group-hover:translate-x-1 transition-transform duration-300">
                <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="m12 5 7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
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
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 animate-fade-in-up">
            Partner e <span className="text-primary">Reti Associate</span>
          </h2>

          {/* Partners */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="text-primary">Partner</span>
            </h3>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <a
                href="https://www.addiopizzotravel.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-primary/20 hover:border-primary/40"
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white group-hover:scale-110 transition-transform">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg text-primary group-hover:text-primary/80 transition-colors">Addiopizzo Travel</div>
                  <div className="text-muted-foreground text-sm">Turismo responsabile e legalità</div>
                  <div className="text-xs text-muted-foreground/80">www.addiopizzotravel.it</div>
                </div>
              </a>

              <a
                href="https://www.educazioneambientale.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-primary/20 hover:border-primary/40"
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-accent to-accent/80 text-white group-hover:scale-110 transition-transform">
                  <TreePine className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg text-primary group-hover:text-primary/80 transition-colors">Palma Nana</div>
                  <div className="text-muted-foreground text-sm">Educazione ambientale</div>
                  <div className="text-xs text-muted-foreground/80">www.educazioneambientale.com</div>
                </div>
              </a>
            </div>
          </div>

          {/* Reti */}
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="text-accent">Reti</span>
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <a
                href="https://reteiter.it/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-accent/20 hover:border-accent/40"
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-accent to-accent/80 text-white group-hover:scale-110 transition-transform">
                  <Network className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg text-accent group-hover:text-accent/80 transition-colors">Rete Iter</div>
                  <div className="text-muted-foreground text-sm">Politiche giovanili</div>
                  <div className="text-xs text-muted-foreground/80">reteiter.it</div>
                </div>
              </a>

              <a
                href="https://www.sipuofare.net/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-accent/20 hover:border-accent/40"
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-heart to-heart/80 text-white group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg text-accent group-hover:text-accent/80 transition-colors">Rete "Si può fare"</div>
                  <div className="text-muted-foreground text-sm">Cambiamento sociale</div>
                  <div className="text-xs text-muted-foreground/80">www.sipuofare.net</div>
                </div>
              </a>

              <a
                href="https://www.facebook.com/share/19VVSZAEWC/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-accent/20 hover:border-accent/40"
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-primary to-primary/80 text-white group-hover:scale-110 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-lg text-accent group-hover:text-accent/80 transition-colors">Laboratorio della Legalità</div>
                  <div className="text-muted-foreground text-sm">Museo della legalità</div>
                  <div className="text-xs text-muted-foreground/80 flex items-center gap-1">
                    <span>Facebook</span>
                    <span>&</span>
                    <span>Instagram</span>
                  </div>
                </div>
              </a>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-2xl font-bold text-center mb-8">
              <span className="text-heart">Seguici sui Social</span>
            </h3>
            <div className="flex justify-center">
              <a
                href="https://www.facebook.com/share/1GKyTE79ML/"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-4 bg-card/80 rounded-xl shadow-elegant px-6 py-4 hover:scale-105 transition-all border border-heart/20 hover:border-heart/40"
              >
                <div className="p-3 rounded-full bg-gradient-to-br from-heart to-heart/80 text-white group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-lg text-heart group-hover:text-heart/80 transition-colors">INTUS Corleone</div>
                  <div className="text-muted-foreground text-sm">La nostra pagina Facebook</div>
                  <div className="text-xs text-muted-foreground/80">facebook.com/share/1GKyTE79ML</div>
                </div>
              </a>
            </div>
          </div>

          {/* Additional Links for Laboratorio della Legalità */}
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Seguici anche sui canali del Laboratorio della Legalità:
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="https://www.facebook.com/share/19VVSZAEWC/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </a>
              <a
                href="https://www.instagram.com/laboratorio_della_legalita?igsh=MTVhYmRndjllbXp3Mg=="
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
                Instagram
              </a>
            </div>
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
