import { ExternalLink, Facebook, Instagram, Shield, Sparkles, Users, Globe } from "lucide-react";

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
      logo: "https://www.addiopizzotravel.it/img/assets/logo-ciano.png",
      type: "partner",
      description: "Turismo responsabile e legalità"
    },
    {
      name: "Palma Nana",
      url: "https://www.educazioneambientale.com/",
      logo: "https://www.educazioneambientale.com/img/logo_2x.png",
      type: "partner",
      description: "Educazione ambientale"
    },
    {
      name: "Rete Iter",
      url: "https://reteiter.it/",
      logo: "https://reteiter.it/wp-content/uploads/2023/07/logo_ITER-copia-copia.png",
      type: "network",
      description: "Rete nazionale politiche giovanili"
    },
    {
      name: "Rete Si può fare",
      url: "https://www.sipuofare.net/",
      logo: "https://www.sipuofare.net/wp-content/uploads/2024/10/loghi-si-puo-fare-09.png",
      type: "network",
      description: "Rete per il cambiamento sociale"
    },
    {
      name: "Laboratorio della Legalità",
      url: "https://www.facebook.com/share/19VVSZAEWC/",
      logo: "https://scontent.fplm1-1.fna.fbcdn.net/v/t39.30808-6/460946625_932081162266844_6442029316538644710_n.jpg?_nc_cat=105&ccb=1-7&_nc_sid=6ee11a&_nc_ohc=4F8eRw7vCWsQ7kNvgG8pbyX&_nc_zt=23&_nc_ht=scontent.fplm1-1.fna&_nc_gid=AJFJayJ9nP8fROIFSoqlGrq&oh=00_AYDRWJMfBqS-iIfCDlVepEOAUuOWZLpGhTAUFDrjfTGGEA&oe=678D05EE",
      type: "network",
      description: "Museo della legalità"
    },
    {
      name: "INTUS Corleone",
      url: "https://www.facebook.com/share/1GKyTE79ML/",
      logo: "/files/logos/cuore_rosso.png",
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
      return <Facebook className="w-5 h-5" />;
    }
    if (partner.url.includes('instagram.com')) {
      return <Instagram className="w-5 h-5" />;
    }
    if (partner.name.includes('Laboratorio')) {
      return <Shield className="w-5 h-5" />;
    }
    if (partner.type === 'network') {
      return <Users className="w-5 h-5" />;
    }
    if (partner.type === 'partner') {
      return <Globe className="w-5 h-5" />;
    }
    return <ExternalLink className="w-5 h-5" />;
  };

  return (
    <>
      {/* 📱 Mobile-specific CSS for faster scroll */}
      <style jsx>{`
        @keyframes slide-infinite-mobile {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @media (max-width: 768px) {
          .animate-slide-infinite-mobile {
            animation: slide-infinite-mobile 20s linear infinite;
          }
        }

        @media (min-width: 769px) {
          .animate-slide-infinite-mobile {
            animation: slide-infinite-mobile 50s linear infinite;
          }
        }
      `}</style>

      <section className="py-12 md:py-16 bg-gradient-to-r from-primary/5 via-accent/5 to-heart/5 overflow-hidden relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-4 left-1/4 w-16 h-16 bg-primary/20 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
          <div className="absolute bottom-4 right-1/4 w-20 h-20 bg-accent/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-heart/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        </div>

        <div className="container mx-auto px-4 mb-8 relative z-10">
          <div className="text-center animate-fade-in-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
              <h3 className="text-2xl md:text-3xl font-bold">
                <span className="text-muted-foreground">I nostri</span>{' '}
                <span className="text-primary">Partner</span>{' '}
                <span className="text-muted-foreground">&</span>{' '}
                <span className="text-accent">Reti</span>
              </h3>
              <Sparkles className="w-6 h-6 text-accent animate-pulse" style={{animationDelay: '0.5s'}} />
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Una rete di collaborazioni che rafforza il nostro impegno per la legalità e lo sviluppo territoriale
            </p>
          </div>
        </div>
        
        <div className="relative">
          {/* Enhanced gradient overlays for smooth fade effect */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-background via-background/80 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-background via-background/80 to-transparent z-10 pointer-events-none" />
          
          {/* 🚀 Enhanced scrolling container with mobile-responsive speed */}
          <div className="flex animate-slide-infinite-mobile">
            {duplicatedPartners.map((partner, index) => (
              <div
                key={`${partner.name}-${index}`}
                className="flex-shrink-0 mx-3"
              >
                <a
                  href={partner.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex items-center gap-4 bg-gradient-to-br from-card/90 via-background/80 to-card/90 backdrop-blur-md rounded-2xl px-6 py-4 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 border border-border/30 hover:border-primary/50 min-w-[320px] hover:scale-105 overflow-hidden"
                >
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-heart/5 opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl"></div>

                  {/* Glowing border effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-accent/20 to-heart/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-sm transition-all duration-500"></div>

                  <div className={`relative z-10 p-3 rounded-xl bg-white/90 backdrop-blur-sm border-2 ${partner.type === 'partner' ? 'border-primary/20' : partner.type === 'network' ? 'border-accent/20' : 'border-heart/20'} group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={`${partner.name} logo`}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <div className={`${partner.logo ? 'hidden' : ''} ${partner.type === 'partner' ? 'text-primary' : partner.type === 'network' ? 'text-accent' : 'text-heart'}`}>
                      {getIcon(partner)}
                    </div>

                    {/* Sparkle effects */}
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-white/60 rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-300"></div>
                  </div>

                  <div className="flex-1 min-w-0 relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-bold text-base truncate group-hover:text-primary transition-colors duration-300">
                        {partner.name}
                      </h4>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${partner.type === 'partner' ? 'bg-primary/20 text-primary' : partner.type === 'network' ? 'bg-accent/20 text-accent' : 'bg-heart/20 text-heart'} group-hover:scale-105 transition-transform duration-300`}>
                        {getTypeLabel(partner.type)}
                      </span>
                    </div>
                    {partner.description && (
                      <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300 leading-relaxed">
                        {partner.description}
                      </p>
                    )}

                    {/* Hover arrow */}
                    <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all duration-300">
                      <ExternalLink className="w-4 h-4 text-primary" />
                    </div>
                  </div>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-primary via-accent to-heart group-hover:w-5/6 transition-all duration-500 rounded-full"></div>
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default PartnersStrip;
