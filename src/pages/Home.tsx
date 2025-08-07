import { AnimatedIntusLogo } from "@/components/ui/animated-intus-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Zap, ArrowRight, Heart, Target, Award, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import PartnersStrip from "@/components/PartnersStrip";
import ComicTextBubble from "@/components/ComicTextBubble";
import MappaProgettiHome from "@/components/MappaProgettiHome";
import { useTheme } from "next-themes";
import { ThemeToggle } from "@/components/ui/theme-toggle";



const Home = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counters, setCounters] = useState({ projects: 0, years: 0, people: 0 });
  const { theme } = useTheme();

  // Animation hook
  useEffect(() => {
    setIsVisible(true);

    // Animated counters
    const animateCounters = () => {
      const targets = { projects: 50, years: 27, people: 1000 };
      const duration = 2000;
      const steps = 60;
      const stepTime = duration / steps;

      let step = 0;
      const timer = setInterval(() => {
        step++;
        const progress = step / steps;
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setCounters({
          projects: Math.floor(targets.projects * easeOut),
          years: Math.floor(targets.years * easeOut),
          people: Math.floor(targets.people * easeOut)
        });

        if (step >= steps) {
          clearInterval(timer);
          setCounters(targets);
        }
      }, stepTime);
    };

    // Start counters after a delay
    setTimeout(animateCounters, 1000);
  }, []);

  const principles = [
    {
      icon: Users,
      title: "Cittadinanza Attiva",
      description: "Promuoviamo la partecipazione democratica e l'impegno civico dei cittadini per costruire una società più giusta e inclusiva."
    },
    {
      icon: MapPin,
      title: "Promozione del Territorio", 
      description: "Valorizziamo le risorse locali, la cultura e le tradizioni per sviluppare il potenziale del nostro territorio."
    },
    {
      icon: Zap,
      title: "Politiche Giovanili",
      description: "Creiamo opportunità e spazi per i giovani, supportando la loro crescita e partecipazione attiva nella comunità."
    }
  ];

  const sitiConsigliati = [
  {
    titolo: 'È arrivata la felicità',
    descrizione:
      '"È arrivata la felicità" - Un progetto che condividiamo e promuoviamo per la comunità e il territorio.',
    logo: 'https://www.xn--arrivatalafelicit-4ob8k.it/wp-content/uploads/2023/11/LOGO_1WEB.jpg',
    link: 'https://www.xn--arrivatalafelicit-4ob8k.it/',
  },
  {
    titolo: 'Altro Sito Utile',
    descrizione:
      'Un altro sito interessante da esplorare per risorse locali e iniziative utili.',
    logo: 'https://example.com/logo.png',
    link: 'https://example.com',
  },
  // Aggiungi altri siti qui
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 px-4 overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute top-40 right-20 w-16 h-16 bg-accent/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-12 h-12 bg-heart/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-10 w-24 h-24 bg-primary/10 rounded-full animate-float" style={{animationDelay: '0.5s'}}></div>
        </div>

        <div className="container mx-auto text-center relative">
          <div className="mb-12 md:mb-16">
            <div className="flex justify-center mb-8 md:mb-12">
              <div className="flex items-center justify-center mb-8 md:mb-12 relative">
                {/* Logo */}
                {theme === "dark" ? (
                    <AnimatedIntusLogo className="w-48 h-auto md:w-64 lg:w-72 animate-fade-in-up" />
                  ) : (
                    <img
                      src="../files/logos/logo_cuore.png"
                      alt="Intus Corleone APS - Perdersi è scoprire"
                      className="w-48 h-auto md:w-64 lg:w-72 animate-pulse-heart"
                      style={{animationDuration: '2.5s'}}
                    />
                  )}

                {/* Testo accanto al logo */}
                <div className="ml-4 text-left">
                  <p className="text-2xl font-bold text-muted-foreground">
                    Intus Corleone APS
                  </p>
                  <p className="text-xl font-caveat text-muted-foreground mt-1">
                    Perdersi è scoprire
                  </p>
                </div>
              </div>
            </div>

            <div className={`max-w-5xl mx-auto px-4 transition-all duration-1000 mt-32 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`} style={{transitionDelay: '0.3s'}}>
              <ComicTextBubble className="min-h-[200px]" />
            </div>
          </div>

          {/* Stats Section */}
          <div className="mb-12 md:mb-16">
            <div className="grid grid-cols-3 gap-8 md:gap-16 max-w-4xl mx-auto">
              <div className="animate-bounce-in" style={{animationDelay: '1s'}}>
                <div className="text-4xl md:text-6xl font-bold text-primary mb-2">{counters.projects}+</div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Progetti Realizzati</div>
              </div>
              <div className="animate-bounce-in" style={{animationDelay: '1.2s'}}>
                <div className="text-4xl md:text-6xl font-bold text-accent mb-2">{counters.years}</div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Anni di Esperienza</div>
              </div>
              <div className="animate-bounce-in" style={{animationDelay: '1.4s'}}>
                <div className="text-4xl md:text-6xl font-bold text-heart mb-2">{counters.people}+</div>
                <div className="text-sm md:text-base text-muted-foreground font-medium">Persone Coinvolte</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center px-4 animate-fade-in-up" style={{animationDelay: '1.6s'}}>
            <Button asChild size="lg" className="group text-base md:text-lg px-8 md:px-12 py-6 md:py-8 shadow-2xl hover:shadow-primary/25 transition-all duration-500 hover:scale-105 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary">
              <Link to="/chi-siamo">
                <Sparkles className="w-5 h-5 mr-2 group-hover:animate-spin" />
                Scopri Chi Siamo
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="group text-base md:text-lg px-8 md:px-12 py-6 md:py-8 border-2 hover:bg-primary hover:text-primary-foreground transition-all duration-500 hover:scale-105 hover:shadow-xl">
              <Link to="/le-nostre-attivita">
                <Target className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Le Nostre Attività
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className=" px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 animate-fade-in-up">
            I Nostri <span className="text-primary">Pilastri</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-7xl mx-auto">
            {principles.map((principle, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-700 hover:-translate-y-4 hover:scale-[1.02] border-0 bg-gradient-to-br from-card via-background to-muted/30 animate-fade-in-up cursor-pointer"
                style={{animationDelay: `${0.8 + index * 0.2}s`}}
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-heart/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>

                {/* Glowing border effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-heart/20 rounded-lg opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500"></div>

                <CardContent className="relative p-8 md:p-10 text-center">
                  <div className="mb-6 md:mb-8 flex justify-center">
                    <div className="relative">
                      {/* Animated ring */}
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-heart opacity-20 group-hover:opacity-40 group-hover:scale-110 transition-all duration-500 animate-spin-slow"></div>

                      {/* Icon container */}
                      <div className="relative p-4 md:p-5 rounded-full bg-gradient-to-br from-primary via-accent to-heart group-hover:animate-float shadow-2xl group-hover:shadow-primary/25">
                        <principle.icon className="w-8 h-8 md:w-10 md:h-10 text-white group-hover:scale-110 transition-transform duration-300" />
                      </div>

                      {/* Sparkle effects */}
                      <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                      <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-accent rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-500"></div>
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 group-hover:text-primary transition-all duration-300 group-hover:scale-105">
                    {principle.title}
                  </h3>

                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {principle.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-primary to-accent group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mappa Progetti Integrata */}
      <MappaProgettiHome />

      {/* Partners Strip */}
      <PartnersStrip />

      {/* Progetti e Iniziative */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-muted/20 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Progetti e Iniziative
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scopri le nostre attività più importanti e resta aggiornato sui progetti in corso
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Presenta il tuo progetto */}
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-primary/5 via-background to-primary/10 animate-slide-in-left">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-primary to-accent p-4 rounded-2xl shadow-lg">
                      <Zap className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
                        Presenta il tuo Progetto
                      </h3>
                      <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                        ATTIVO
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                      Microprogetti per le comunità locali. Presenta la tua idea innovativa per trasformare il territorio.
                      <span className="text-primary font-semibold">Scadenza: 31 dicembre 2025</span>
                    </p>
                    <Link
                      to="/presenta-progetto"
                      className="inline-flex items-center bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      Partecipa ora
                      <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ultime Notizie Blog */}
            <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 border-0 bg-gradient-to-br from-accent/5 via-background to-accent/10 animate-slide-in-right">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex items-start space-x-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-accent to-primary rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative bg-gradient-to-br from-accent to-primary p-4 rounded-2xl shadow-lg">
                      <Users className="w-8 h-8 text-white group-hover:animate-pulse" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <h3 className="text-2xl font-bold group-hover:text-accent transition-colors">
                        Ultime Notizie
                      </h3>
                      <div className="bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-semibold">
                        AGGIORNATO
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-6 leading-relaxed text-base">
                      Rimani sempre aggiornato sulle nostre attività, eventi e iniziative per la comunità locale.
                      Scopri come stiamo costruendo il futuro insieme.
                    </p>
                    <Link
                      to="/blog"
                      className="inline-flex items-center bg-gradient-to-r from-accent to-primary text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                    >
                      Leggi il blog
                      <span className="ml-2 group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Siti Consigliati */}
            <div className="space-y-8 animate-fade-in-up">
                <h3 className="text-2xl font-bold mb-6 text-center">
                  <span className="bg-gradient-to-r from-heart via-primary to-heart bg-clip-text text-transparent">
                    Siti Consigliati
                  </span>
                </h3>
                {sitiConsigliati.map((sito, index) => (
                  <Card
                    key={index}
                    className="group flex items-center gap-6 p-6 bg-background shadow-md hover:shadow-xl transition-all rounded-xl"
                  >
                    <div className="w-24 h-24 flex-shrink-0 relative">
                      <img
                        src={sito.logo}
                        alt={`${sito.titolo} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <Heart className="w-8 h-8 text-heart hidden absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold mb-2 group-hover:text-heart transition-colors">{sito.titolo}</h4>
                      <p className="text-muted-foreground mb-4">{sito.descrizione}</p>
                      <a
                        href={sito.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-sm font-medium text-heart hover:underline"
                      >
                        Visita sito
                        <span className="ml-1">→</span>
                      </a>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 md:mb-6 animate-fade-in-up">
            Unisciti alla Nostra <span className="text-primary">Comunità</span>
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-6 md:mb-8 max-w-2xl mx-auto px-4 animate-fade-in-up leading-relaxed" style={{animationDelay: '0.1s'}}>
            Insieme possiamo fare la differenza. Scopri come partecipare attivamente alla vita della comunità.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            <Button asChild size="lg" className="text-base md:text-lg px-8 md:px-12 py-4 md:py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
              <Link to="/blog">Resta Aggiornato</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-8 md:px-12 py-4 md:py-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              <Link to="/le-nostre-attivita">Scopri i Progetti</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
