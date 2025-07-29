import { AnimatedIntusLogo } from "@/components/ui/animated-intus-logo";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MapPin, Zap } from "lucide-react";
import { Link } from "react-router-dom";



const Home = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="mb-8 animate-fade-in-up">
            <div className="flex justify-center mb-6 md:mb-8">
              <AnimatedIntusLogo className="w-64 h-auto md:w-80 lg:w-96" />
            </div>
            <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-4">
              INTUS CORLEONE APS, fondata nel 1997 durante la “Primavera Corleonese”, promuove la legalità, i diritti umani e la cittadinanza attiva. L’associazione forma educatori e sostiene progetti giovanili, sociali ed ecologici a livello locale ed europeo. È attiva nel turismo responsabile e nella valorizzazione della memoria antimafia attraverso l’arte.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up px-4" style={{animationDelay: '0.2s'}}>
            <Button asChild size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 shadow-elegant hover:shadow-2xl transition-all duration-300">
              <Link to="/chi-siamo">Scopri Chi Siamo</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300">
              <Link to="/le-nostre-attivita">Le Nostre Attività</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-16 md:py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 md:mb-16 animate-fade-in-up">
            I Nostri <span className="text-primary">Pilastri</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
            {principles.map((principle, index) => (
              <Card 
                key={index} 
                className="group hover:shadow-elegant transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-card to-muted/50 animate-fade-in-up cursor-pointer"
                style={{animationDelay: `${0.3 + index * 0.1}s`}}
              >
                <CardContent className="p-6 md:p-8 text-center">
                  <div className="mb-4 md:mb-6 flex justify-center">
                    <div className="p-3 md:p-4 rounded-full bg-gradient-to-br from-primary to-accent group-hover:animate-float shadow-lg">
                      <principle.icon className="w-6 h-6 md:w-8 md:h-8 text-primary-foreground" />
                    </div>
                  </div>
                  <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 group-hover:text-primary transition-colors">
                    {principle.title}
                  </h3>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* In Evidenza */}
      <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-muted/20 via-background to-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                In Evidenza
              </span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Scopri le nostre iniziative più importanti e resta aggiornato sulle ultime novità
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Call di Idee Giovani */}
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
                        Call di Idee Giovani
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
