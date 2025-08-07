import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface ActivitaCategory {
  id: string;
  title: string;
  description: string;
  href: string;
}

const AttivitaCategories = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const categories: ActivitaCategory[] = [
    {
      id: "animazione-territoriale",
      title: "Animazione territoriale",
      description: "Progetti per l'animazione e valorizzazione del territorio locale",
      href: "/le-nostre-attivita?categoria=Animazione+territoriale"
    },
    {
      id: "educazione-legalita",
      title: "Educazione alla legalità",
      description: "Iniziative per promuovere la cultura della legalità",
      href: "/le-nostre-attivita?categoria=Educazione+alla+legalit%C3%A0"
    },
    {
      id: "politiche-giovanili",
      title: "Politiche giovanili",
      description: "Supporto e sviluppo delle politiche giovanili sul territorio",
      href: "/le-nostre-attivita?categoria=Politiche+giovanili"
    },
    {
      id: "sviluppo-ricerche",
      title: "Sviluppo di ricerche/Intervento",
      description: "Ricerca e interventi per lo sviluppo sociale e territoriale",
      href: "/le-nostre-attivita?categoria=Sviluppo+di+ricerche%2FIntervento"
    },
    {
      id: "promozione-territorio",
      title: "Promozione del territorio",
      description: "Valorizzazione e promozione delle risorse territoriali",
      href: "/le-nostre-attivita?categoria=Promozione+del+territorio"
    },
    {
      id: "inclusione-sociale",
      title: "Inclusione sociale",
      description: "Progetti per l'integrazione e l'inclusione sociale",
      href: "/le-nostre-attivita?categoria=Inclusione+sociale"
    }
  ];

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Le Nostre <span className="bg-gradient-to-r from-primary via-accent to-heart bg-clip-text text-transparent">Attività</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Scopri i nostri ambiti di intervento e i progetti che realizziamo per la comunità
          </p>
        </div>

        {/* Categories Grid */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-1000 ${
            isVisible ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-8'
          }`}
        >
          {categories.map((category, index) => (
            <Card
              key={category.id}
              className="group relative overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 bg-gradient-to-br from-card via-background to-muted/30 animate-fade-in-up"
              style={{animationDelay: `${0.2 + index * 0.1}s`}}
            >
              {/* Background animation */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-heart/5 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>

              <CardContent className="relative p-8 text-center h-full flex flex-col justify-between">
                <div className="mb-6">
                  {/* Decorative element */}
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-primary via-accent to-heart p-0.5 group-hover:scale-110 transition-transform duration-300">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent group-hover:animate-pulse"></div>
                    </div>
                  </div>

                  <h3 className="text-xl md:text-2xl font-bold mb-4 group-hover:text-primary transition-colors duration-300">
                    {category.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed group-hover:text-foreground transition-colors duration-300">
                    {category.description}
                  </p>
                </div>

                <Button
                  asChild
                  className="group/btn bg-gradient-to-r from-primary to-accent text-white border-0 hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105"
                >
                  <a href={category.href}>
                    <span className="relative">
                      Esplora progetti
                      <span className="ml-2 group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                    </span>
                  </a>
                </Button>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-primary to-accent group-hover:w-3/4 transition-all duration-500 rounded-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16 animate-fade-in-up" style={{animationDelay: '1s'}}>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Vuoi collaborare con noi?
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Unisciti alle nostre iniziative e contribuisci al cambiamento della comunità
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="shadow-lg">
                <a href="/contatti">Contattaci</a>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href="/presenta-progetto">Presenta un progetto</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AttivitaCategories;
