import React, { useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Building,
  Globe,
  Clock,
  Target,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix per le icone di Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Progetto {
  id: string;
  nome: string;
  anno: string;
  coordinate: LatLngTuple;
  località: string;
  descrizione: string;
  destinatari: string;
  ente: string;
  categoria: string;
  stato: "completato" | "in-corso";
}

// Tutti i progetti della timeline con coordinate geografiche accurate
const progetti: Progetto[] = [
  // 1997 - Corleone
  {
    id: "1",
    nome: "CONSIGLI DA RAGAZZI",
    anno: "1997",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Primo Consiglio Comunale dei Ragazzi per educazione alla legalità",
    destinatari: "Alunni Istituto G. Vasi",
    ente: "Comune di Corleone",
    categoria: "educazione",
    stato: "completato"
  },
  {
    id: "2",
    nome: "ECOLOGIOCHI",
    anno: "1997",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Educazione ambientale attraverso giochi di squadra",
    destinatari: "Alunni Istituto G. Vasi",
    ente: "Comune di Corleone",
    categoria: "ambiente",
    stato: "completato"
  },
  
  // 1999 - Misilmeri
  {
    id: "3",
    nome: "LARGO AI RAGAZZI",
    anno: "1999",
    coordinate: [38.0333, 13.4500],
    località: "Misilmeri",
    descrizione: "Formazione educatori per Consiglio Comunale dei Ragazzi",
    destinatari: "20 educatori e animatori",
    ente: "Comune di Misilmeri",
    categoria: "formazione",
    stato: "completato"
  },
  
  // 2000 - Corleone
  {
    id: "4",
    nome: "LE DONNE DI CORLEONE",
    anno: "2000",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Sostegno imprenditoria femminile per fasce deboli",
    destinatari: "28 donne fasce deboli",
    ente: "FSE Dipartimento Politiche Giovanili",
    categoria: "sociale",
    stato: "completato"
  },
  
  // 2004-2008 - Area Madonie
  {
    id: "5",
    nome: "BILLY THE KID",
    anno: "2004-2008",
    coordinate: [37.8167, 13.3000],
    località: "Corleone e territorio transnazionale",
    descrizione: "Ricerca transnazionale su minori a rischio criminalità",
    destinatari: "Minori a rischio",
    ente: "Programma UE anti-emarginazione",
    categoria: "ricerca",
    stato: "completato"
  },
  {
    id: "6",
    nome: "RETE MADONIE",
    anno: "2004-2008",
    coordinate: [37.9000, 14.0000],
    località: "Caltavuturo e Madonie",
    descrizione: "Rete per politiche welfare nell'area madonita",
    destinatari: "Enti locali basse Madonie",
    ente: "Comune di Caltavuturo",
    categoria: "territorio",
    stato: "completato"
  },
  
  // 2009-2010 - Corleone
  {
    id: "7",
    nome: "LABORATORIO DELLA LEGALITÀ",
    anno: "2009-oggi",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Museo in bene confiscato con percorsi formativi nazionali",
    destinatari: "Scuole territorio italiano",
    ente: "Ministero Interni/Regione Sicilia",
    categoria: "legalità",
    stato: "in-corso"
  },
  
  // 2012-2016 - Sicilia
  {
    id: "8",
    nome: "PROGETTO INTUS",
    anno: "2012-2016",
    coordinate: [37.8167, 13.3000],
    località: "Corleone e Sicilia",
    descrizione: "Sistema innovativo valorizzazione patrimonio culturale",
    destinatari: "Territorio e giovani",
    ente: "MIUR PON04a3_00476",
    categoria: "innovazione",
    stato: "completato"
  },
  
  // 2017 - Corleone e Pisa
  {
    id: "9",
    nome: "IL GIOCO DELLE 100 UTOPIE",
    anno: "2017",
    coordinate: [43.7228, 10.4017],
    località: "Pisa",
    descrizione: "Esplorazione immaginario utopico bambini",
    destinatari: "20 bambini classe V",
    ente: "Università di Pisa",
    categoria: "ricerca",
    stato: "completato"
  },
  
  // 2017-2018 - Prato
  {
    id: "10",
    nome: "YOUNG PEOPLE MOVER",
    anno: "2017-2018",
    coordinate: [43.8777, 11.0955],
    località: "Prato",
    descrizione: "Partecipazione giovanile pianificazione spazi pubblici",
    destinatari: "Giovani 16-35 anni",
    ente: "Comune Prato/Talent Garden",
    categoria: "partecipazione",
    stato: "completato"
  },
  
  // 2021-2022 - Napoli
  {
    id: "11",
    nome: "CASA DEL RIONE SANITÀ",
    anno: "2021-2022",
    coordinate: [40.8518, 14.2681],
    località: "Napoli",
    descrizione: "Laboratori storia orale e promozione territorio",
    destinatari: "Comunità territoriale",
    ente: "Napoli inVita",
    categoria: "territoriale",
    stato: "completato"
  },
  {
    id: "12",
    nome: "È ARRIVATA LA FELICITÀ",
    anno: "2021-2022",
    coordinate: [40.8518, 14.2681],
    località: "Napoli",
    descrizione: "Formazione linguaggio cinematografico educativo",
    destinatari: "Studenti reti scolastiche",
    ente: "Ministero Istruzione/Cultura",
    categoria: "cinema",
    stato: "completato"
  },
  
  // 2024-2025 - Sicilia
  {
    id: "13",
    nome: "GIOVANI PER LE COMUNITÀ LOCALI",
    anno: "2024-2025",
    coordinate: [37.5079, 15.0830],
    località: "Sicilia",
    descrizione: "Microprogetti sviluppo comunità con contributi economici",
    destinatari: "Giovani 16-30 anni",
    ente: "Assessorato Famiglia Regione Sicilia",
    categoria: "giovani",
    stato: "in-corso"
  }
];

// Icone personalizzate per marker
const getMarkerIcon = (categoria: string, stato: string) => {
  const colore = stato === "completato" ? "#22c55e" : "#3b82f6";
  
  const iconSvg = `
    <div style="
      background: ${colore};
      width: 25px;
      height: 25px;
      border-radius: 50%;
      border: 2px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 10px;
    ">
      ${categoria.charAt(0).toUpperCase()}
    </div>
  `;
  
  return L.divIcon({
    html: iconSvg,
    className: 'custom-marker',
    iconSize: [25, 25],
    iconAnchor: [12, 25],
  });
};

const MappaProgettiHome = () => {
  const [progettoSelezionato, setProgettoSelezionato] = useState<Progetto | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Raggruppa progetti per località per statistiche
  const statistiche = useMemo(() => {
    const completati = progetti.filter(p => p.stato === "completato").length;
    const inCorso = progetti.filter(p => p.stato === "in-corso").length;
    const località = [...new Set(progetti.map(p => p.località))].length;
    const anni = new Date().getFullYear() - 1997 + 1;
    
    return { completati, inCorso, località, anni };
  }, []);

  // Progetti per slider
  const progettiSlider = progetti.slice(0, 6); // Mostra i primi 6 progetti più significativi

  const center: LatLngTuple = [38.5, 13.5]; // Centro Sicilia

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % progettiSlider.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + progettiSlider.length) % progettiSlider.length);
  };

  return (
    <section className="py-16 md:py-20 px-4 bg-gradient-to-br from-primary/8 via-accent/8 to-heart/8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-primary/30 rounded-full animate-float" style={{animationDelay: '0s'}}></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-accent/30 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-heart/20 rounded-full animate-float" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="container mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Globe className="w-10 h-10 text-primary animate-spin-slow" />
            <h2 className="text-3xl md:text-4xl font-bold">
              I Progetti sul <span className="bg-gradient-to-r from-primary via-accent to-heart bg-clip-text text-transparent">Territorio</span>
            </h2>
            <MapPin className="w-10 h-10 text-accent animate-bounce" />
          </div>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            28 anni di impegno raccontati attraverso una mappa interattiva. 
            Ogni punto rappresenta una storia di trasformazione sociale e territoriale.
          </p>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-br from-card/90 to-muted/50 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-bounce-in text-center">
            <div className="text-2xl md:text-3xl font-bold text-primary">{progetti.length}</div>
            <div className="text-sm text-muted-foreground">Progetti Mappati</div>
          </div>
          <div className="bg-gradient-to-br from-card/90 to-muted/50 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-bounce-in text-center" style={{animationDelay: '0.1s'}}>
            <div className="text-2xl md:text-3xl font-bold text-accent">{statistiche.completati}</div>
            <div className="text-sm text-muted-foreground">Completati</div>
          </div>
          <div className="bg-gradient-to-br from-card/90 to-muted/50 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-bounce-in text-center" style={{animationDelay: '0.2s'}}>
            <div className="text-2xl md:text-3xl font-bold text-heart">{statistiche.inCorso}</div>
            <div className="text-sm text-muted-foreground">In Corso</div>
          </div>
          <div className="bg-gradient-to-br from-card/90 to-muted/50 backdrop-blur-sm rounded-xl p-4 shadow-lg animate-bounce-in text-center" style={{animationDelay: '0.3s'}}>
            <div className="text-2xl md:text-3xl font-bold text-primary">{statistiche.località}</div>
            <div className="text-sm text-muted-foreground">Località</div>
          </div>
        </div>

        {/* Mappa e Slider */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mappa */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Mappa Interattiva
                  <Sparkles className="w-5 h-5 text-accent" />
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[400px] relative">
                  <MapContainer
                    center={center}
                    zoom={7}
                    className="h-full w-full"
                    style={{ borderRadius: '0 0 0.5rem 0.5rem' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {progetti.map((progetto) => (
                      <Marker
                        key={progetto.id}
                        position={progetto.coordinate}
                        icon={getMarkerIcon(progetto.categoria, progetto.stato)}
                        eventHandlers={{
                          click: () => setProgettoSelezionato(progetto)
                        }}
                      >
                        <Popup>
                          <div className="p-2 min-w-[200px]">
                            <h3 className="font-bold text-base mb-2">{progetto.nome}</h3>
                            <p className="text-sm text-muted-foreground mb-2">{progetto.descrizione}</p>
                            <div className="flex flex-wrap gap-1 mb-2">
                              <Badge variant="secondary" className="text-xs">{progetto.anno}</Badge>
                              <Badge 
                                variant={progetto.stato === "completato" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {progetto.stato}
                              </Badge>
                            </div>
                            <Button 
                              size="sm" 
                              onClick={() => setProgettoSelezionato(progetto)}
                              className="w-full text-xs"
                            >
                              Dettagli
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Slider Progetti Significativi */}
          <div className="lg:col-span-1">
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-2xl h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-accent" />
                  Progetti in Evidenza
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="relative">
                  <div className="overflow-hidden rounded-lg">
                    <div 
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                      {progettiSlider.map((progetto, index) => (
                        <div key={progetto.id} className="w-full flex-shrink-0">
                          <div className="bg-gradient-to-br from-muted/30 to-background/50 rounded-lg p-4 h-[280px] flex flex-col">
                            <div className="flex items-center gap-2 mb-3">
                              <Badge variant="outline" className="text-xs">{progetto.anno}</Badge>
                              <Badge 
                                variant={progetto.stato === "completato" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                {progetto.stato}
                              </Badge>
                            </div>
                            
                            <h3 className="font-bold text-lg mb-2 line-clamp-2">{progetto.nome}</h3>
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                              <MapPin className="w-3 h-3" />
                              <span className="line-clamp-1">{progetto.località}</span>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-grow">
                              {progetto.descrizione}
                            </p>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Users className="w-3 h-3" />
                                <span className="line-clamp-1">{progetto.destinatari}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Building className="w-3 h-3" />
                                <span className="line-clamp-1">{progetto.ente}</span>
                              </div>
                            </div>
                            
                            <Button 
                              size="sm" 
                              onClick={() => setProgettoSelezionato(progetto)}
                              className="w-full mt-4 text-xs"
                            >
                              Vedi Dettagli
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Controlli Slider */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 w-8 h-8 bg-background/80 backdrop-blur-sm hover:bg-background/90"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                  
                  {/* Indicatori */}
                  <div className="flex justify-center gap-2 mt-4">
                    {progettiSlider.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentSlide ? 'bg-primary w-6' : 'bg-muted-foreground/30'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-8">
          <Card className="border-0 bg-card/60 backdrop-blur-sm shadow-lg">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Stati Progetti</h4>
                  <div className="flex justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completato</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">In corso</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-accent">Copertura Territoriale</h4>
                  <p className="text-sm text-muted-foreground">
                    Da Corleone a Napoli, da Pisa a Prato: l'impatto nazionale di INTUS
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2 text-heart">Come Esplorare</h4>
                  <p className="text-sm text-muted-foreground">
                    Clicca sui marker per scoprire ogni progetto e la sua storia
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal Dettagli Progetto */}
      <Dialog open={!!progettoSelezionato} onOpenChange={(open) => !open && setProgettoSelezionato(null)}>
        <DialogContent className="max-w-2xl">
          {progettoSelezionato && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  {progettoSelezionato.nome}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                {/* Info base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Anno:</span>
                      <Badge>{progettoSelezionato.anno}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Località:</span>
                      <span className="text-sm">{progettoSelezionato.località}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Destinatari:</span>
                      <span className="text-sm">{progettoSelezionato.destinatari}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Stato:</span>
                      <Badge variant={progettoSelezionato.stato === "completato" ? "default" : "secondary"}>
                        {progettoSelezionato.stato}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Descrizione */}
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Descrizione</h4>
                  <p className="text-muted-foreground leading-relaxed">{progettoSelezionato.descrizione}</p>
                </div>

                {/* Ente */}
                <div>
                  <h4 className="font-semibold mb-2 text-accent">Ente Finanziatore</h4>
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{progettoSelezionato.ente}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default MappaProgettiHome;
