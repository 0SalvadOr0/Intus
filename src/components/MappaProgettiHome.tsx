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
  immagini?: string[];
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
    coordinate: [37.8168, 13.3000],
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
    coordinate: [38.0344242, 13.4534836],
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
    coordinate: [37.8167, 13.3001],
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
    coordinate: [37.8168, 13.3001],
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
    coordinate: [41.0338, 15.0000],
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
    coordinate: [37.8169, 13.3002],
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
    coordinate: [37.8177, 13.3000],
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
    coordinate: [43.724591, 10.382981],
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
    coordinate: [43.88, 11.098333],
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
    coordinate: [40.8522, 14.2681],
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
    coordinate: [37.8167, 13.3020],
    località: "Sicilia",
    descrizione: "Microprogetti sviluppo comunità con contributi economici",
    destinatari: "Giovani 18-34 anni",
    ente: "Assessorato Famiglia Regione Sicilia",
    categoria: "giovani",
    stato: "in-corso"
  },
  {
    id: "14",
    nome: "IMPATTI: TEATRO, PACE E LEGALITÀ",
    anno: "2025",
    coordinate: [37.8147, 13.3050],
    località: "Corleone",
    descrizione: "Utilizza il linguaggio teatrale come strumento di educazione alla legalità, alla pace e alla non violenza, sensibilizzando la comunità sui conflitti contemporanei. Attraverso scrittura scenica e formazione teatrale, i partecipanti creano uno spettacolo pubblico basato su riflessioni ed esperienze personali. Collaborazione con associazione Cepros - F. Scianni",
    destinatari: "Comunità di Corleone",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "legalità",
    stato: "in-corso",
    immagini: ["/files/projectsImage/impatti.jpeg"]
  },
  {
    id: "15",
    nome: "CORLEONE: TERRITORIO, AMBIENTE, ARCHEOLOGIA, STORIA",
    anno: "2025",
    coordinate: [37.8167, 13.3030],
    località: "Corleone",
    descrizione: "Realizzazione di depliant illustrativo dedicato a Corleone e territorio come strumento pratico per turisti. Presentato tramite conferenza e mostra (ottobre-dicembre), offre percorsi tematici: monumentale, naturalistico-ambientale, archeologico, antiche vie e mountain-bike. Valorizza patrimonio storico, paesaggistico e culturale",
    destinatari: "Turisti e visitatori",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "territorio",
    stato: "in-corso",
    immagini: ["/files/projectsImage/Corleone, territorio, ambiente.jpg"]
  },
  {
    id: "16",
    nome: "CORLEONE MUSIC NIGHT",
    anno: "2025",
    coordinate: [37.8147, 13.3010],
    località: "Corleone",
    descrizione: "Piccolo festival che riunisce band e artisti più talentuosi del territorio per evento unico all'insegna di energia, creatività e passione per musica dal vivo. Dalle sonorità rock alle vibrazioni pop, passando per folk e indie, ogni gruppo porta la propria identità raccontando attraverso le note la vitalità della scena musicale locale",
    destinatari: "Comunità locale e appassionati di musica",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "giovani",
    stato: "in-corso" 
  },
  {
    id: "17",
    nome: "AUTOSTIMA CHALLENGE IN TEATRO",
    anno: "2025",
    coordinate: [37.8157, 13.3009],
    località: "Corleone",
    descrizione: "Laboratorio teatrale per aiutare persone con difficoltà di interazione sociale e timidezza a migliorare sicurezza ed espressività. Attraverso esercizi su linguaggio verbale, paraverbale e non verbale, sviluppa consapevolezza di sé e risorse interiori. Guidato da professionista del settore, si conclude con spettacolo finale come sfida formativa per superare paure legate all'esposizione pubblica",
    destinatari: "Persone con difficoltà di interazione sociale",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "sociale",
    stato: "in-corso",
    immagini: ["/files/projectsImage/Autostima challenge.jpeg"]
  },
  {
    id: "18",
    nome: "CAMMINARE INSIEME",
    anno: "2025",
    coordinate: [37.8137, 13.3010],
    località: "Corleone",
    descrizione: "Microprogetto di animazione territoriale che utilizza teatro per rafforzare relazioni sociali in territorio a bassa densità abitativa. Coinvolge diverse fasce d'età favorendo dialogo intergenerazionale attraverso esercizi teatrali, improvvisazione e linguaggio espressivo. Guidati da professionista, costruiscono spettacolo finale valorizzando talenti locali e promuovendo gruppo teatrale stabile. Con associazione Cepros - F. Scianni",
    destinatari: "Comunità territoriale (diverse fasce d'età)",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "territoriale",
    stato: "in-corso",
    immagini: ["/files/projectsImage/Camminare insieme.jpeg"]
  },
  // 2025 - Altri comuni Sicilia - Microprogetti "GIOVANI PER LE COMUNITÀ LOCALI"
  {
    id: "19",
    nome: "WEB RADIO DEL TERRITORIO: VOCI, STORIE, IDENTITÀ",
    anno: "2025",
    coordinate: [37.7548097, 13.2698437],
    località: "Campofiorito",
    descrizione: "Creazione di web radio dedicata alla produzione e diffusione di contenuti radiofonici e audiovisivi per raccontare il territorio e chi lo vive. Attraverso letture, radiodrammi, interviste ed esperienze condivise, diventa spazio aperto e partecipato per dare voce alle comunità locali e nuove generazioni. Culmina in lettura pubblica del radiodramma con proiezione backstage a Campofiorito e Corleone",
    destinatari: "Comunità locali e nuove generazioni",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "territoriale",
    stato: "in-corso"
  },
  {
    id: "20",
    nome: "L'ARTE IN UN FILO DI LANA",
    anno: "2025",
    coordinate: [37.6799561, 13.6045232],
    località: "Marcatobianco (Castronovo di Sicilia)",
    descrizione: "Valorizzazione della lana da tosa reintroducendola nelle produzioni artigianali locali attraverso iniziative artistiche e sensibilizzazione. Murales a tema, mostre di manufatti in lana e percorso di formazione sulla tecnica dell'infeltrimento trasformano questo materiale naturale in simbolo identitario del borgo. Culmina in giornata finale aperta al pubblico per promuovere benessere comunitario e cultura del riuso creativo",
    destinatari: "Comunità di Marcatobianco e visitatori",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "territorio",
    stato: "in-corso",
    immagini: ["/files/projectsImage/L'arte in un filo di lana.jpg"]
  },
  {
    id: "21",
    nome: "MUSICA, CINEMA E COMUNITÀ NEI MONTI SICANI",
    anno: "2025",
    coordinate: [37.6821, 13.3799],
    località: "Palazzo Adriano",
    descrizione: "Rafforzamento competenze artistiche e organizzative dei giovani dei Monti Sicani attraverso due workshop complementari: creazione musicale collettiva e progettazione eventi cinematografici. Rilancia esperienza 'Piccola Orchestra Paradiso' come laboratorio musicale comunitario, mentre workshop cinema guida nella costruzione di festival. Attività a Palazzo Adriano e Prizzi con restituzione pubblica per promuovere coesione sociale",
    destinatari: "Giovani dei Monti Sicani",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "giovani",
    stato: "in-corso",
    immagini: ["/files/projectsImage/Musica in cinema.jpeg"]
  },
  {
    id: "22",
    nome: "RADIO BAROQUE: GIOVANI, CREATIVITÀ E TERRITORIO",
    anno: "2025",
    coordinate: [37.748, 13.6057],
    località: "Lercara Friddi",
    descrizione: "Valorizzazione creatività giovanile attraverso Radio Baroque, collettivo che produce contenuti multimediali: podcast, cortometraggi, eventi live e format social pensati da giovani per giovani. Informare, intrattenere e promuovere cultura locale favorendo partecipazione attiva ed espressione libera. Spettacolo pubblico natalizio con tombola comunitaria, palinsesto podcast e puntata speciale Epifania. Progetto di animazione territoriale orientato a costruzione reti giovanili",
    destinatari: "Giovani e comunità locale",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "giovani",
    stato: "in-corso",
    immagini: ["/files/projectsImage/Radio baroque.jpg"]
  },
  {
    id: "23",
    nome: "RADIO CONSULTIAMOCI: LA VOCE GIOVANE DI CASTRONOVO",
    anno: "2025",
    coordinate: [37.6833, 13.6167],
    località: "Castronovo di Sicilia",
    descrizione: "Radio online promossa dalla Consulta Comunale dei Giovani per dare voce ai giovani di Castronovo. Crea spazi di dialogo, confronto e partecipazione affrontando temi attuali e valorizzando territorio tramite interviste a studiosi, professionisti, imprese e cittadini. Durante Castrum Food Fest radio attiva in postazione dedicata e versione itinerante con musica dal vivo. Acquisto attrezzatura rende radio presenza stabile come piattaforma partecipativa",
    destinatari: "Giovani e comunità di Castronovo",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "partecipazione",
    stato: "in-corso",
    immagini: ["/files/projectsImage/Radio consultiamoci.jpg"]
  },
  {
    id: "24",
    nome: "SIKANI LIVE LAB",
    anno: "2025",
    coordinate: [37.7167, 13.4333],
    località: "Prizzi",
    descrizione: "Sostegno alla scena musicale giovanile dei Monti Sicani attraverso tre serate di concerti, sperimentazione sonora e attività collaborative dedicate ai talenti emergenti del territorio. Crea spazio aperto e inclusivo dove giovani artisti possono esprimersi, formarsi e incontrarsi, favorendo socialità, creatività e partecipazione. Performance dal vivo come laboratorio dinamico di crescita artistica e occasione per valorizzare cultura musicale locale",
    destinatari: "Giovani artisti e comunità dei Monti Sicani",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "giovani",
    stato: "in-corso"
  },
  {
    id: "25",
    nome: "PRESEPE VIVENTE DI GIULIANA: TRADIZIONE, COMUNITÀ E MEMORIA",
    anno: "2025",
    coordinate: [37.6740161, 13.2376941],
    località: "Giuliana",
    descrizione: "Rinnovo e valorizzazione del Presepe Vivente di Giuliana attraverso approccio integrato che unisce autenticità storica, coinvolgimento comunitario e documentazione digitale. Realizzazione costumi artigianali ispirati alla Natività, creazione archivio video permanente e allestimento percorso narrativo immersivo. Nel suggestivo borgo medievale la rievocazione diventa esperienza emozionale e partecipata dove cittadini, artigiani e visitatori fanno rivivere tradizione in forma viva e identitaria",
    destinatari: "Comunità di Giuliana e visitatori",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "territoriale",
    stato: "in-corso"
  },
  {
    id: "26",
    nome: "SEMI DI CARTA: BIBLIOTECA DIFFUSA DI CORLEONE",
    anno: "2025",
    coordinate: [37.8127, 13.3009],
    località: "Corleone",
    descrizione: "Il progetto mira a creare una rete di piccoli presìdi di lettura e creatività a Corleone, coinvolgendo scuole, associazioni, giovani e cittadini in un percorso partecipativo e inclusivo. Attraverso punti di lettura diffusi, laboratori di riciclo creativo, attività intergenerazionali, booksharing ed eventi pubblici, l’iniziativa promuove la lettura come esperienza condivisa e accessibile, rafforzando i legami comunitari. L’obiettivo è trasformare la città in una biblioteca viva e aperta, fatta di luoghi d’incontro, scambio e crescita culturale. Il progetto culminerà in un workshop pubblico di presentazione delle attività, pensato come momento di partecipazione e dialogo con il territorio.",
    ente: "Regione Siciliana e Presidenza Consiglio Ministri - Dip. Gioventù e Servizio Civile Universale - Fondo Politiche Giovanili 2023",
    categoria: "territoriale",
    destinatari: "Comunità, associazioni e scuole",
    stato: "in-corso",
    immagini: ["/files/projectsImage/semi di carta.jpg"]
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
  const progettiSlider = progetti.slice(13, 25); // Mostra i primi 6 progetti più significativi

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

      <div className="hidden md:block container mx-auto relative z-10">
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
            Il nostro impegno raccontato attraverso una mappa interattiva. 
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

                {/* Immagini Progetto */}
                {progettoSelezionato.immagini && progettoSelezionato.immagini.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 text-primary">Immagini Progetto</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {progettoSelezionato.immagini.map((immagine, index) => (
                        <div key={index} className="rounded-lg overflow-hidden bg-muted">
                          <img
                            src={immagine}
                            alt={`${progettoSelezionato.nome} - Immagine ${index + 1}`}
                            className="w-full h-auto object-cover max-h-48"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
