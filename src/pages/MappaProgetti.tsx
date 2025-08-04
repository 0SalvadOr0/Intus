import React, { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L, { LatLngTuple } from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MapPin, 
  Calendar, 
  Users, 
  Award,
  Filter,
  Search,
  Globe,
  Clock,
  Target,
  Building,
  GraduationCap,
  Heart,
  Zap,
  Music,
  Camera,
  TreePine,
  Shield,
  Network,
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
  tipologia: string;
  stato: "completato" | "in-corso" | "pianificato";
  coordinate: LatLngTuple;
  località: string;
  descrizione: string;
  dettagli: string;
  destinatari: string;
  ente: string;
  impatto: {
    partecipanti: number;
    durata: string;
    risultati: string[];
  };
  immagine?: string;
  categoria: "educazione" | "territorio" | "giovani" | "legalità" | "cultura" | "sociale";
}

const progetti: Progetto[] = [
  {
    id: "1",
    nome: "CONSIGLI DA RAGAZZI",
    anno: "1997",
    tipologia: "Educazione alla Legalità",
    stato: "completato",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Primo progetto per la costituzione del Consiglio Comunale dei Ragazzi",
    dettagli: "Percorso pionieristico di educazione alla legalità che ha coinvolto gli studenti dell'Istituto G. Vasi di Corleone nella creazione del primo Consiglio Comunale dei Ragazzi della città.",
    destinatari: "Alunni Istituto G. Vasi",
    ente: "Comune di Corleone",
    impatto: {
      partecipanti: 150,
      durata: "6 mesi",
      risultati: [
        "Costituzione primo CCR",
        "Formazione nuova generazione di cittadini attivi",
        "Modello replicato in altri comuni"
      ]
    },
    categoria: "educazione"
  },
  {
    id: "2", 
    nome: "BILLY THE KID",
    anno: "2004-2008",
    tipologia: "Prevenzione Criminalità Minorile",
    stato: "completato",
    coordinate: [37.8167, 13.3000],
    località: "Corleone e territorio transnazionale",
    descrizione: "Ricerca transnazionale su minori a rischio criminalità",
    dettagli: "Progetto europeo innovativo per la prevenzione della criminalità minorile attraverso metodologie di ricerca-azione partecipata in contesti territoriali a rischio.",
    destinatari: "Minori a rischio 14-18 anni",
    ente: "Programma UE anti-emarginazione",
    impatto: {
      partecipanti: 200,
      durata: "4 anni",
      risultati: [
        "Modello di intervento validato",
        "Network europeo di prevenzione",
        "Riduzione del 30% abbandono scolastico"
      ]
    },
    categoria: "giovani"
  },
  {
    id: "3",
    nome: "PROGETTO INTUS",
    anno: "2012-2016", 
    tipologia: "Innovazione Tecnologica",
    stato: "completato",
    coordinate: [37.8167, 13.3000],
    località: "Corleone e Sicilia",
    descrizione: "Sistema innovativo di valorizzazione patrimonio culturale",
    dettagli: "Grande progetto di ricerca e sviluppo per la valorizzazione del patrimonio culturale siciliano attraverso tecnologie intelligenti, realtà aumentata e piattaforme digitali innovative.",
    destinatari: "Territorio siciliano e giovani ricercatori",
    ente: "MIUR PON04a3_00476",
    impatto: {
      partecipanti: 50,
      durata: "4 anni",
      risultati: [
        "Piattaforma digitale innovativa",
        "10 brevetti tecnologici",
        "Spin-off tecnologico creato",
        "Modello esportato in altre regioni"
      ]
    },
    categoria: "territorio"
  },
  {
    id: "4",
    nome: "YOUNG PEOPLE FOR LEGALITY IN EUROPE",
    anno: "2017-2018",
    tipologia: "Scambio Europeo",
    stato: "completato",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Scambio giovanile europeo sulla legalità",
    dettagli: "Progetto Erasmus+ che ha portato a Corleone 30 giovani dall'Europa dell'est per un intenso programma di formazione sulla legalità e le metodologie attive di cittadinanza.",
    destinatari: "30 giovani Europa dell'est",
    ente: "ERASMUS+ YOUTH IN ACTION",
    impatto: {
      partecipanti: 30,
      durata: "10 giorni",
      risultati: [
        "Network europeo legalità",
        "Metodologie innovative sviluppate",
        "Progetti spin-off in 5 paesi"
      ]
    },
    categoria: "legalità"
  },
  {
    id: "5",
    nome: "È ARRIVATA LA FELICITÀ",
    anno: "2021-2022",
    tipologia: "Cinema e Educazione",
    stato: "completato",
    coordinate: [40.8518, 14.2681],
    località: "Napoli",
    descrizione: "Formazione linguaggio cinematografico educativo",
    dettagli: "Innovativo progetto di formazione che ha utilizzato il linguaggio cinematografico e audiovisivo come strumento educativo per studenti delle reti scolastiche napoletane.",
    destinatari: "Studenti reti scolastiche napoletane",
    ente: "Ministero Istruzione/Cultura",
    impatto: {
      partecipanti: 300,
      durata: "1 anno",
      risultati: [
        "5 cortometraggi prodotti",
        "Festival scolastico del cinema",
        "Curriculum didattico innovativo"
      ]
    },
    categoria: "cultura"
  },
  {
    id: "6",
    nome: "GIOVANI PER LE COMUNITÀ LOCALI",
    anno: "2024-2025",
    tipologia: "Microprogetti Comunitari",
    stato: "in-corso",
    coordinate: [37.8167, 13.3000],
    località: "Sicilia",
    descrizione: "Microprogetti per sviluppo comunità locali",
    dettagli: "Bando attivo che supporta giovani siciliani nella realizzazione di microprogetti innovativi per lo sviluppo delle comunità locali con contributi economici diretti.",
    destinatari: "Giovani 16-30 anni",
    ente: "Assessorato Famiglia Regione Sicilia",
    impatto: {
      partecipanti: 100,
      durata: "2 anni",
      risultati: [
        "15 microprogetti finanziati",
        "€50.000 erogati",
        "5 startup sociali nate"
      ]
    },
    categoria: "giovani"
  },
  {
    id: "7",
    nome: "RETE MADONIE",
    anno: "2004-2008",
    tipologia: "Sviluppo Territoriale",
    stato: "completato",
    coordinate: [37.9000, 14.0000],
    località: "Madonie",
    descrizione: "Convenzione per politiche welfare territoriali",
    dettagli: "Importante convenzione che ha unito i comuni delle basse Madonie per sviluppare politiche coordinate di welfare e sostegno ai giovani del territorio montano.",
    destinatari: "Enti locali basse Madonie",
    ente: "Comune di Caltavuturo",
    impatto: {
      partecipanti: 12,
      durata: "4 anni",
      risultati: [
        "12 comuni in rete",
        "Piano welfare territoriale",
        "Centro servizi condiviso"
      ]
    },
    categoria: "territorio"
  },
  {
    id: "8",
    nome: "LABORATORIO DELLA LEGALITÀ",
    anno: "2009-oggi",
    tipologia: "Museo della Legalità",
    stato: "in-corso",
    coordinate: [37.8167, 13.3000],
    località: "Corleone",
    descrizione: "Museo in bene confiscato alla mafia",
    dettagli: "Museo permanente della legalità realizzato in un bene confiscato alla mafia, diventato punto di riferimento nazionale per percorsi formativi sulla legalità e la memoria.",
    destinatari: "Scuole territorio italiano",
    ente: "Ministero Interni/Regione Sicilia",
    impatto: {
      partecipanti: 10000,
      durata: "15 anni",
      risultati: [
        "50.000 visitatori",
        "500 percorsi formativi",
        "Riconoscimento UNESCO"
      ]
    },
    categoria: "legalità"
  }
];

// Icone personalizzate per i marker basate sulla categoria
const getMarkerIcon = (categoria: string, stato: string) => {
  const colore = stato === "completato" ? "#22c55e" : stato === "in-corso" ? "#3b82f6" : "#f59e0b";
  
  const iconSvg = `
    <div style="
      background: ${colore};
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    ">
      ${categoria.charAt(0).toUpperCase()}
    </div>
  `;
  
  return L.divIcon({
    html: iconSvg,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const getCategoriaIcon = (categoria: string) => {
  switch (categoria) {
    case "educazione": return GraduationCap;
    case "territorio": return MapPin;
    case "giovani": return Users;
    case "legalità": return Shield;
    case "cultura": return Music;
    case "sociale": return Heart;
    default: return Target;
  }
};

const MappaProgetti = () => {
  const [filtroAnno, setFiltroAnno] = useState<string>("tutti");
  const [filtroTipologia, setFiltroTipologia] = useState<string>("tutte");
  const [filtroStato, setFiltroStato] = useState<string>("tutti");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("tutte");
  const [searchTerm, setSearchTerm] = useState("");
  const [progettoSelezionato, setProgettoSelezionato] = useState<Progetto | null>(null);

  // Filtri dinamici
  const progettiFiltered = useMemo(() => {
    return progetti.filter(progetto => {
      const matchAnno = filtroAnno === "tutti" || progetto.anno.includes(filtroAnno);
      const matchTipologia = filtroTipologia === "tutte" || progetto.tipologia.toLowerCase().includes(filtroTipologia.toLowerCase());
      const matchStato = filtroStato === "tutti" || progetto.stato === filtroStato;
      const matchCategoria = filtroCategoria === "tutte" || progetto.categoria === filtroCategoria;
      const matchSearch = searchTerm === "" || 
        progetto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progetto.descrizione.toLowerCase().includes(searchTerm.toLowerCase()) ||
        progetto.località.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchAnno && matchTipologia && matchStato && matchCategoria && matchSearch;
    });
  }, [filtroAnno, filtroTipologia, filtroStato, filtroCategoria, searchTerm]);

  // Estrai anni unici
  const anniDisponibili = useMemo(() => {
    const anni = progetti.flatMap(p => p.anno.split("-"));
    return [...new Set(anni)].sort();
  }, []);

  // Estrai tipologie uniche
  const tipologieDisponibili = useMemo(() => {
    return [...new Set(progetti.map(p => p.tipologia))];
  }, []);

  const categorieDisponibili = ["educazione", "territorio", "giovani", "legalità", "cultura", "sociale"];

  const center: LatLngTuple = [37.8167, 13.3000]; // Corleone

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24">
      {/* Header */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in-up">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Globe className="w-12 h-12 text-primary animate-spin-slow" />
              <h1 className="text-4xl md:text-6xl font-bold">
                Mappa dei <span className="bg-gradient-to-r from-primary via-accent to-heart bg-clip-text text-transparent">Progetti</span>
              </h1>
              <MapPin className="w-12 h-12 text-accent animate-bounce" />
            </div>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed">
              28 anni di progetti sul territorio raccontati attraverso una mappa interattiva. 
              Esplora l'impatto geografico delle nostre iniziative di legalità, educazione e sviluppo sociale.
            </p>
            
            {/* Statistiche */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-8">
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-4 animate-bounce-in">
                <div className="text-2xl font-bold text-primary">{progetti.length}</div>
                <div className="text-sm text-muted-foreground">Progetti Mappati</div>
              </div>
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-4 animate-bounce-in" style={{animationDelay: '0.1s'}}>
                <div className="text-2xl font-bold text-accent">{progetti.filter(p => p.stato === "completato").length}</div>
                <div className="text-sm text-muted-foreground">Completati</div>
              </div>
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-4 animate-bounce-in" style={{animationDelay: '0.2s'}}>
                <div className="text-2xl font-bold text-heart">{progetti.filter(p => p.stato === "in-corso").length}</div>
                <div className="text-sm text-muted-foreground">In Corso</div>
              </div>
              <div className="bg-gradient-to-br from-card to-muted/30 rounded-xl p-4 animate-bounce-in" style={{animationDelay: '0.3s'}}>
                <div className="text-2xl font-bold text-primary">{[...new Set(progetti.map(p => p.località))].length}</div>
                <div className="text-sm text-muted-foreground">Località</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filtri */}
      <section className="py-8 px-4 bg-gradient-to-r from-primary/5 via-accent/5 to-heart/5">
        <div className="container mx-auto">
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Filtri di Ricerca
                <Sparkles className="w-5 h-5 text-accent" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Ricerca */}
                <div className="lg:col-span-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cerca progetti..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg bg-background/50 backdrop-blur-sm focus:ring-2 focus:ring-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Filtro Anno */}
                <Select value={filtroAnno} onValueChange={setFiltroAnno}>
                  <SelectTrigger>
                    <SelectValue placeholder="Anno" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti gli anni</SelectItem>
                    {anniDisponibili.map(anno => (
                      <SelectItem key={anno} value={anno}>{anno}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filtro Categoria */}
                <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutte">Tutte le categorie</SelectItem>
                    {categorieDisponibili.map(categoria => (
                      <SelectItem key={categoria} value={categoria}>
                        {categoria.charAt(0).toUpperCase() + categoria.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Filtro Stato */}
                <Select value={filtroStato} onValueChange={setFiltroStato}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tutti">Tutti gli stati</SelectItem>
                    <SelectItem value="completato">Completato</SelectItem>
                    <SelectItem value="in-corso">In corso</SelectItem>
                    <SelectItem value="pianificato">Pianificato</SelectItem>
                  </SelectContent>
                </Select>

                {/* Reset */}
                <Button 
                  onClick={() => {
                    setFiltroAnno("tutti");
                    setFiltroTipologia("tutte");
                    setFiltroStato("tutti");
                    setFiltroCategoria("tutte");
                    setSearchTerm("");
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Reset
                </Button>
              </div>
              
              {/* Risultati */}
              <div className="mt-4 text-sm text-muted-foreground">
                Mostrando {progettiFiltered.length} di {progetti.length} progetti
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Mappa */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-2xl overflow-hidden">
            <CardContent className="p-0">
              <div className="h-[600px] relative">
                <MapContainer
                  center={center}
                  zoom={8}
                  className="h-full w-full"
                  style={{ borderRadius: '0.5rem' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  
                  {progettiFiltered.map((progetto) => (
                    <Marker
                      key={progetto.id}
                      position={progetto.coordinate}
                      icon={getMarkerIcon(progetto.categoria, progetto.stato)}
                      eventHandlers={{
                        click: () => setProgettoSelezionato(progetto)
                      }}
                    >
                      <Popup>
                        <div className="p-2 min-w-[250px]">
                          <h3 className="font-bold text-lg mb-2">{progetto.nome}</h3>
                          <p className="text-sm text-muted-foreground mb-2">{progetto.descrizione}</p>
                          <div className="flex flex-wrap gap-1 mb-2">
                            <Badge variant="secondary">{progetto.anno}</Badge>
                            <Badge 
                              variant={progetto.stato === "completato" ? "default" : progetto.stato === "in-corso" ? "secondary" : "outline"}
                            >
                              {progetto.stato}
                            </Badge>
                          </div>
                          <Button 
                            size="sm" 
                            onClick={() => setProgettoSelezionato(progetto)}
                            className="w-full"
                          >
                            Vedi dettagli
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
      </section>

      {/* Legenda */}
      <section className="py-8 px-4">
        <div className="container mx-auto">
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary" />
                Legenda
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Stati */}
                <div>
                  <h4 className="font-semibold mb-3 text-primary">Stati Progetti</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Completato</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <span className="text-sm">In corso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-amber-500 rounded-full"></div>
                      <span className="text-sm">Pianificato</span>
                    </div>
                  </div>
                </div>

                {/* Categorie */}
                <div>
                  <h4 className="font-semibold mb-3 text-accent">Categorie</h4>
                  <div className="space-y-2">
                    {categorieDisponibili.map(categoria => {
                      const IconComponent = getCategoriaIcon(categoria);
                      return (
                        <div key={categoria} className="flex items-center gap-2">
                          <IconComponent className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm">{categoria.charAt(0).toUpperCase() + categoria.slice(1)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Istruzioni */}
                <div>
                  <h4 className="font-semibold mb-3 text-heart">Come usare la mappa</h4>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>• Clicca sui marker per vedere i dettagli</p>
                    <p>• Usa i filtri per esplorare per categoria</p>
                    <p>• Cerca progetti specifici nella barra di ricerca</p>
                    <p>• Zoom e naviga per esplorare il territorio</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Modal Dettagli Progetto */}
      <Dialog open={!!progettoSelezionato} onOpenChange={(open) => !open && setProgettoSelezionato(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {progettoSelezionato && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl flex items-center gap-2">
                  {React.createElement(getCategoriaIcon(progettoSelezionato.categoria), { className: "w-6 h-6 text-primary" })}
                  {progettoSelezionato.nome}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Info base */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Anno:</span>
                      <Badge>{progettoSelezionato.anno}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Località:</span>
                      <span>{progettoSelezionato.località}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Tipologia:</span>
                      <span>{progettoSelezionato.tipologia}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Stato:</span>
                      <Badge variant={progettoSelezionato.stato === "completato" ? "default" : progettoSelezionato.stato === "in-corso" ? "secondary" : "outline"}>
                        {progettoSelezionato.stato}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Destinatari:</span>
                      <span className="text-sm">{progettoSelezionato.destinatari}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Ente:</span>
                      <span className="text-sm">{progettoSelezionato.ente}</span>
                    </div>
                  </div>
                </div>

                {/* Descrizione */}
                <div>
                  <h4 className="font-semibold mb-2 text-primary">Descrizione del Progetto</h4>
                  <p className="text-muted-foreground leading-relaxed">{progettoSelezionato.dettagli}</p>
                </div>

                {/* Impatto */}
                <div>
                  <h4 className="font-semibold mb-3 text-accent">Impatto e Risultati</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{progettoSelezionato.impatto.partecipanti}</div>
                      <div className="text-sm text-muted-foreground">Partecipanti</div>
                    </div>
                    <div className="bg-gradient-to-br from-accent/10 to-accent/5 rounded-lg p-4 text-center">
                      <div className="text-lg font-semibold text-accent">{progettoSelezionato.impatto.durata}</div>
                      <div className="text-sm text-muted-foreground">Durata</div>
                    </div>
                    <div className="bg-gradient-to-br from-heart/10 to-heart/5 rounded-lg p-4 text-center">
                      <div className="text-lg font-semibold text-heart">{progettoSelezionato.impatto.risultati.length}</div>
                      <div className="text-sm text-muted-foreground">Risultati chiave</div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium mb-2">Risultati Principali:</h5>
                    <ul className="space-y-1">
                      {progettoSelezionato.impatto.risultati.map((risultato, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <Award className="w-3 h-3 text-primary" />
                          {risultato}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MappaProgetti;
