import { ExternalLink, Facebook, Instagram } from "lucide-react";

interface Partner {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  type: 'partner' | 'network' | 'social';
}

const PartnersStrip = () => {
  const partners: Partner[] = [
    {
      name: "Addiopizzo Travel",
      url: "https://www.addiopizzotravel.it/",
      type: "partner",
      description: "Turismo responsabile e legalità"
    },
    {
      name: "Palma Nana",
      url: "https://www.educazioneambientale.com/",
      type: "partner", 
      description: "Educazione ambientale"
    },
    {
      name: "Rete Iter",
      url: "https://reteiter.it/",
      type: "network",
      description: "Rete nazionale politiche giovanili"
    },
    {
      name: "Rete Si può fare",
      url: "https://www.sipuofare.net/",
      type: "network",
      description: "Rete per il cambiamento sociale"
    },
    {
      name: "Laboratorio della Legalità", 
      url: "https://www.facebook.com/share/19VVSZAEWC/",
      type: "network",
      description: "Museo della legalità"
    },
    {
      name: "INTUS Corleone",
      url: "https://www.facebook.com/share/1GKyTE79ML/",
      type: "social",
      description: "La nostra pagina Facebook"
    }
  ];

  // Duplicate items for continuous scroll
  const duplicatedPartners = [...partners, ...partners];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'partner':
        return 'text-primary';
      case 'network':
        return 'text-accent';
      case 'social':
        return 'text-heart';
      default:
        return 'text-muted-foreground';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'partner':
        return 'Partner';
      case 'network':
        return 'Rete';
      case 'social':
        return 'Social';
      default:
        return '';
    }
  };

  const getIcon = (partner: Partner) => {
    if (partner.url.includes('facebook.com')) {
      return <Facebook className="w-4 h-4" />;
    }
    if (partner.url.includes('instagram.com')) {
      return <Instagram className="w-4 h-4" />;
    }
    return <ExternalLink className="w-4 h-4" />;
  };

  return (
    <section className="py-8 bg-gradient-to-r from-muted/20 via-background to-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 mb-6">
        <h3 className="text-xl md:text-2xl font-bold text-center">
          <span className="text-muted-foreground">I nostri</span>{' '}
          <span className="text-primary">Partner</span>{' '}
          <span className="text-muted-foreground">&</span>{' '}
          <span className="text-accent">Reti</span>
        </h3>
      </div>
      
      <div className="relative">
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling container */}
        <div className="flex animate-slide-infinite">
          {duplicatedPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 mx-4"
            >
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 bg-card/80 backdrop-blur-sm rounded-xl px-4 py-3 hover:bg-card hover:shadow-lg transition-all duration-300 border border-border/50 hover:border-primary/30 min-w-[280px]"
              >
                <div className={`p-2 rounded-lg bg-gradient-to-br from-background to-muted/50 ${getTypeColor(partner.type)} group-hover:scale-110 transition-transform duration-300`}>
                  {getIcon(partner)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                      {partner.name}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded-full bg-muted/50 ${getTypeColor(partner.type)}`}>
                      {getTypeLabel(partner.type)}
                    </span>
                  </div>
                  {partner.description && (
                    <p className="text-xs text-muted-foreground truncate">
                      {partner.description}
                    </p>
                  )}
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersStrip;
