import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  User, 
  Calendar, 
  MapPin, 
  Download, 
  Search, 
  Filter,
  Mail,
  Phone,
  Euro,
  Users,
  FileText,
  ChevronDown,
  ChevronUp,
  Loader2,
  Star,
  MessageSquare,
  Edit,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown
} from "lucide-react";

interface Richiesta {
  id: string;
  titolo_progetto: string;
  categoria: string;
  tipo_evento: string;
  descrizione_progetto: string;
  referente_nome: string;
  referente_cognome: string;
  referente_email: string;
  referente_telefono: string;
  referente_data_nascita: string;
  luogo_svolgimento: string;
  data_inizio: string;
  data_fine: string;
  numero_partecipanti: number;
  categoria_descrizione: string;
  descrizione_evento: string;
  altro?: string;
  partecipanti: Array<{
    nome: string;
    cognome: string;
    email: string;
    telefono: string;
    dataNascita: string;
  }>;
  spese_attrezzature: Array<{
    descrizione: string;
    quantita: number;
    costo: number;
  }>;
  spese_servizi: Array<{
    descrizione: string;
    quantita: number;
    costo: number;
  }>;
  spese_generali: {
    siae?: number;
    assicurazione?: number;
    rimborsoSpese?: number;
  };
  created_at: string;
  valutazione?: {
    punteggio: number;
    stato: "in_valutazione" | "approvato" | "rifiutato" | "in_attesa";
    note_valutatore: string;
    data_valutazione: string;
    valutatore: string;
  };
}

const RichiesteCallIdeeTab = () => {
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [filteredRichieste, setFilteredRichieste] = useState<Richiesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Richiesta | null>(null);
  const [evaluationData, setEvaluationData] = useState({
    punteggio: 0,
    stato: "in_valutazione" as const,
    note_valutatore: ""
  });
  const { toast } = useToast();

  // 🔄 Data Fetching Logic
  useEffect(() => {
    const fetchRichieste = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("call_idee_giovani")
          .select("*")
          .order("created_at", { ascending: false });
        
        if (error) throw error;
        
        console.log("Supabase richieste:", { data, error });
        setRichieste(data || []);
        setFilteredRichieste(data || []);
      } catch (error) {
        console.error("Error fetching richieste:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRichieste();
  }, []);

  // 🔍 Search and Filter Logic
  useEffect(() => {
    let filtered = richieste;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.titolo_progetto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referente_nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.referente_cognome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.descrizione_progetto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(r => r.categoria === categoryFilter);
    }

    // Apply status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(r => {
        const status = r.valutazione?.stato || "in_attesa";
        return status === statusFilter;
      });
    }

    setFilteredRichieste(filtered);
  }, [richieste, searchTerm, categoryFilter, statusFilter]);

  // 📊 Export Functionality
  const exportToCSV = async (singleRequest?: Richiesta) => {
    setExporting(true);
    try {
      const dataToExport = singleRequest ? [singleRequest] : filteredRichieste;
      
      // Prepare CSV data with ALL database fields
      const csvData = dataToExport.map(r => ({
        ID: r.id,
        "Titolo Progetto": r.titolo_progetto,
        "Descrizione Progetto": r.descrizione_progetto,
        "Data Inizio": r.data_inizio,
        "Data Fine": r.data_fine,
        "Referente Nome": r.referente_nome,
        "Referente Cognome": r.referente_cognome,
        "Referente Email": r.referente_email,
        "Referente Telefono": r.referente_telefono,
        "Referente Data Nascita": r.referente_data_nascita,
        "Numero Partecipanti": r.numero_partecipanti,
        "Luogo Svolgimento": r.luogo_svolgimento,
        "Categoria": r.categoria,
        "Categoria Descrizione": r.categoria_descrizione || '',
        "Tipo Evento": r.tipo_evento,
        "Descrizione Evento": r.descrizione_evento || '',
        "Altro": r.altro || '',
        "Partecipanti JSON": JSON.stringify(r.partecipanti || []),
        "Totale Spese Attrezzature": r.spese_attrezzature?.reduce((sum, s) => sum + (s.costo * s.quantita), 0) || 0,
        "Totale Spese Servizi": r.spese_servizi?.reduce((sum, s) => sum + (s.costo * s.quantita), 0) || 0,
        "SIAE": r.spese_generali?.siae || 0,
        "Assicurazione": r.spese_generali?.assicurazione || 0,
        "Rimborso Spese": r.spese_generali?.rimborsoSpese || 0,
        "Totale Complessivo": calculateTotalCost(r),
        "Punteggio Valutazione": r.valutazione?.punteggio || '',
        "Stato Valutazione": r.valutazione?.stato || 'in_attesa',
        "Note Valutatore": r.valutazione?.note_valutatore || '',
        "Data Valutazione": r.valutazione?.data_valutazione || '',
        "Valutatore": r.valutazione?.valutatore || '',
        "Data Creazione": new Date(r.created_at).toLocaleDateString('it-IT'),
        "Timestamp Creazione": r.created_at
      }));

      // Convert to CSV with proper formatting
      const headers = Object.keys(csvData[0]);

      // Escape CSV fields properly
      const escapeCSVField = (field: any): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If field contains comma, newline, or quote, wrap in quotes and escape quotes
        if (str.includes(',') || str.includes('\n') || str.includes('"') || str.includes('\r')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const csvContent = [
        headers.map(escapeCSVField).join(','),
        ...csvData.map(row => headers.map(header => escapeCSVField(row[header as keyof typeof row])).join(','))
      ].join('\r\n');

      // Add BOM for proper Excel compatibility
      const BOM = '\uFEFF';
      const finalContent = BOM + csvContent;

      // Download file
      const blob = new Blob([finalContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const fileName = singleRequest 
        ? `richiesta_${singleRequest.titolo_progetto.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`
        : `richieste_call_idee_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Export completato!",
        description: `File ${fileName} scaricato con successo.`
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Errore nell'export",
        description: "Si è verificato un errore durante l'esportazione.",
        variant: "destructive"
      });
    } finally {
      setExporting(false);
    }
  };

  // 📝 Evaluation Functions
  const saveEvaluation = async () => {
    if (!selectedRequest) return;

    try {
      const evaluationPayload = {
        ...evaluationData,
        data_valutazione: new Date().toISOString(),
        valutatore: "Admin" // In a real app, this would be the current user
      };

      const { error } = await supabase
        .from("call_idee_giovani")
        .update({ valutazione: evaluationPayload })
        .eq("id", selectedRequest.id);

      if (error) throw error;

      // Update local state
      setRichieste(prev => prev.map(r => 
        r.id === selectedRequest.id 
          ? { ...r, valutazione: evaluationPayload }
          : r
      ));

      toast({
        title: "Valutazione salvata!",
        description: "La valutazione è stata salvata con successo."
      });

      setSelectedRequest(null);
      setEvaluationData({ punteggio: 0, stato: "in_valutazione", note_valutatore: "" });
    } catch (error) {
      console.error("Save evaluation error:", error);
      toast({
        title: "Errore nel salvataggio",
        description: "Si è verificato un errore durante il salvataggio della valutazione.",
        variant: "destructive"
      });
    }
  };

  // ⚡ Helper Functions
  const toggleCardExpansion = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };

  const calculateTotalCost = (richiesta: Richiesta): number => {
    // 🔧 Safe numeric calculation with type checking
    const attrezzature = Array.isArray(richiesta.spese_attrezzature) 
      ? richiesta.spese_attrezzature.reduce((sum, s) => {
          const costo = Number(s.costo) || 0;
          const quantita = Number(s.quantita) || 0;
          return sum + (costo * quantita);
        }, 0) 
      : 0;
    
    const servizi = Array.isArray(richiesta.spese_servizi)
      ? richiesta.spese_servizi.reduce((sum, s) => {
          const costo = Number(s.costo) || 0;
          const quantita = Number(s.quantita) || 0;
          return sum + (costo * quantita);
        }, 0)
      : 0;
    
    const generali = (Number(richiesta.spese_generali?.siae) || 0) + 
                    (Number(richiesta.spese_generali?.assicurazione) || 0) + 
                    (Number(richiesta.spese_generali?.rimborsoSpese) || 0);
    
    // 🎯 Ensure return type is always a valid number
    const total = attrezzature + servizi + generali;
    return isNaN(total) ? 0 : total;
  };

  const getUniqueCategories = () => {
    return [...new Set(richieste.map(r => r.categoria))];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approvato": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "rifiutato": return <X className="w-4 h-4 text-red-500" />;
      case "in_valutazione": return <Clock className="w-4 h-4 text-yellow-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approvato": return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approvato</Badge>;
      case "rifiutato": return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rifiutato</Badge>;
      case "in_valutazione": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Valutazione</Badge>;
      default: return <Badge variant="secondary">In Attesa</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 📋 Header Section */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm animate-fade-in-up">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="flex items-center text-2xl font-bold">
              <Eye className="w-6 h-6 mr-3 text-primary" />
              Richieste Call Idee Giovani
              <Badge variant="secondary" className="ml-3 text-sm px-3 py-1">
                {filteredRichieste.length} richieste
              </Badge>
            </CardTitle>
            
            {/* 🎯 Action Buttons */}
            <div className="flex gap-2">
              <Button 
                onClick={() => exportToCSV()}
                disabled={exporting || filteredRichieste.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Esporta Tutto CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        
        {/* 🔍 Search and Filter Section */}
        <CardContent className="pt-0">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca per titolo, referente o descrizione..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-card/80"
              />
            </div>
            <div className="w-full md:w-48">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-white/80 dark:bg-card/80">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtra categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le categorie</SelectItem>
                  {getUniqueCategories().map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-white/80 dark:bg-card/80">
                  <SelectValue placeholder="Filtra stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli stati</SelectItem>
                  <SelectItem value="in_attesa">In Attesa</SelectItem>
                  <SelectItem value="in_valutazione">In Valutazione</SelectItem>
                  <SelectItem value="approvato">Approvato</SelectItem>
                  <SelectItem value="rifiutato">Rifiutato</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📊 Content Section */}
      <Card className="border-0 bg-card/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary mr-3" />
              <span className="text-lg text-muted-foreground">Caricamento richieste...</span>
            </div>
          ) : filteredRichieste.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all" ? "Nessun risultato trovato" : "Nessuna richiesta presente"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                  ? "Prova a modificare i filtri di ricerca" 
                  : "Le richieste appariranno qui quando saranno inviate"
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-6">
              {filteredRichieste.map((r) => {
                const isExpanded = expandedCards.has(r.id);
                const totalCost = calculateTotalCost(r);
                const status = r.valutazione?.stato || "in_attesa";
                
                return (
                  <div 
                    key={r.id} 
                    className="group relative rounded-xl border border-border/50 bg-gradient-to-br from-white to-gray-50/50 dark:from-card dark:to-card/80 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    {/* 🎨 Header Section */}
                    <div className="p-6 pb-4 border-b border-border/30">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg text-primary leading-tight mb-2 line-clamp-2">
                            {r.titolo_progetto}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className="text-xs font-medium">
                              {r.categoria}
                            </Badge>
                            <Badge variant="secondary" className="text-xs font-medium">
                              {r.tipo_evento}
                            </Badge>
                            <Badge variant="destructive" className="text-xs font-medium bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100">
                              €{totalCost.toFixed(2)}
                            </Badge>
                            {getStatusBadge(status)}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                        {r.descrizione_progetto}
                      </p>

                      {/* Evaluation Summary */}
                      {r.valutazione && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-card/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <span className="text-sm font-medium">Valutazione</span>
                            </div>
                            {r.valutazione.punteggio > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-bold">{r.valutazione.punteggio}/10</span>
                              </div>
                            )}
                          </div>
                          {r.valutazione.note_valutatore && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {r.valutazione.note_valutatore}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* 👤 Contact Info */}
                    <div className="p-6 py-4 space-y-2">
                      <div className="flex items-center text-sm">
                        <User className="w-4 h-4 mr-2 text-primary" />
                        <span className="font-medium">{r.referente_nome} {r.referente_cognome}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="w-4 h-4 mr-2" />
                        <span className="truncate">{r.referente_email}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{r.referente_telefono}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="truncate">{r.luogo_svolgimento}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{r.data_inizio} - {r.data_fine}</span>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Users className="w-4 h-4 mr-2" />
                        <span>{r.numero_partecipanti} partecipanti</span>
                      </div>
                    </div>

                    {/* 📋 Expandable Details */}
                    {isExpanded && (
                      <div className="px-6 pb-4 border-t border-border/30 bg-gray-50/50 dark:bg-card/50">
                        <div className="py-4 space-y-4">
                          {/* Detailed Description */}
                          <div>
                            <h4 className="font-semibold text-sm text-primary mb-2">Descrizione Dettagliata</h4>
                            <p className="text-sm text-muted-foreground">{r.descrizione_progetto}</p>
                            {r.descrizione_evento && (
                              <div className="mt-2">
                                <h5 className="font-medium text-xs text-muted-foreground mb-1">Descrizione Evento</h5>
                                <p className="text-xs">{r.descrizione_evento}</p>
                              </div>
                            )}
                            {r.altro && (
                              <div className="mt-2">
                                <h5 className="font-medium text-xs text-muted-foreground mb-1">Note Aggiuntive</h5>
                                <p className="text-xs">{r.altro}</p>
                              </div>
                            )}
                          </div>

                          {/* Partecipanti */}
                          {r.partecipanti?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-sm text-primary mb-2 flex items-center">
                                <Users className="w-4 h-4 mr-1" />
                                Partecipanti ({r.partecipanti.length})
                              </h4>
                              <div className="max-h-32 overflow-y-auto space-y-1">
                                {r.partecipanti.map((p, i) => (
                                  <div key={i} className="text-xs bg-white dark:bg-card rounded px-2 py-1 border">
                                    <span className="font-medium">{p.nome} {p.cognome}</span>
                                    <span className="text-muted-foreground ml-2">{p.email}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Spese */}
                          <div className="grid grid-cols-1 gap-3">
                            {r.spese_attrezzature?.length > 0 && (
                              <div>
                                <h5 className="font-medium text-xs text-muted-foreground mb-1">Attrezzature</h5>
                                <div className="space-y-1">
                                  {r.spese_attrezzature.map((s, i) => (
                                    <div key={i} className="text-xs flex justify-between bg-white dark:bg-card rounded px-2 py-1">
                                      <span>{s.descrizione} (x{s.quantita})</span>
                                      <span className="font-semibold text-green-600">€{(s.costo * s.quantita).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {r.spese_servizi?.length > 0 && (
                              <div>
                                <h5 className="font-medium text-xs text-muted-foreground mb-1">Servizi</h5>
                                <div className="space-y-1">
                                  {r.spese_servizi.map((s, i) => (
                                    <div key={i} className="text-xs flex justify-between bg-white dark:bg-card rounded px-2 py-1">
                                      <span>{s.descrizione} (x{s.quantita})</span>
                                      <span className="font-semibold text-green-600">€{(s.costo * s.quantita).toFixed(2)}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {r.spese_generali && (
                              <div>
                                <h5 className="font-medium text-xs text-muted-foreground mb-1">Spese Generali</h5>
                                <div className="space-y-1">
                                  {r.spese_generali.siae && (
                                    <div className="text-xs flex justify-between bg-white dark:bg-card rounded px-2 py-1">
                                      <span>SIAE</span>
                                      <span className="font-semibold text-green-600">€{r.spese_generali.siae}</span>
                                    </div>
                                  )}
                                  {r.spese_generali.assicurazione && (
                                    <div className="text-xs flex justify-between bg-white dark:bg-card rounded px-2 py-1">
                                      <span>Assicurazione</span>
                                      <span className="font-semibold text-green-600">€{r.spese_generali.assicurazione}</span>
                                    </div>
                                  )}
                                  {r.spese_generali.rimborsoSpese && (
                                    <div className="text-xs flex justify-between bg-white dark:bg-card rounded px-2 py-1">
                                      <span>Rimborso Spese</span>
                                      <span className="font-semibold text-green-600">€{r.spese_generali.rimborsoSpese}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 🎛️ Footer Controls */}
                    <div className="p-6 pt-3 flex justify-between items-center border-t border-border/30 bg-gray-50/30 dark:bg-card/30">
                      <span className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleDateString('it-IT', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => exportToCSV(r)}
                          className="text-green-600 hover:text-green-700 h-8 px-3"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRequest(r);
                                setEvaluationData({
                                  punteggio: r.valutazione?.punteggio || 0,
                                  stato: r.valutazione?.stato || "in_valutazione",
                                  note_valutatore: r.valutazione?.note_valutatore || ""
                                });
                              }}
                              className="text-blue-600 hover:text-blue-700 h-8 px-3"
                            >
                              <Star className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <DialogHeader>
                              <DialogTitle>Valuta Richiesta</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h4 className="font-semibold mb-2">{selectedRequest?.titolo_progetto}</h4>
                                <p className="text-sm text-muted-foreground">{selectedRequest?.descrizione_progetto}</p>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="punteggio">Punteggio (1-10)</Label>
                                  <Input
                                    id="punteggio"
                                    type="number"
                                    min="1"
                                    max="10"
                                    value={evaluationData.punteggio}
                                    onChange={(e) => setEvaluationData(prev => ({
                                      ...prev,
                                      punteggio: parseInt(e.target.value) || 0
                                    }))}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="stato">Stato</Label>
                                  <Select 
                                    value={evaluationData.stato} 
                                    onValueChange={(value: any) => setEvaluationData(prev => ({
                                      ...prev,
                                      stato: value
                                    }))}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="in_valutazione">In Valutazione</SelectItem>
                                      <SelectItem value="approvato">Approvato</SelectItem>
                                      <SelectItem value="rifiutato">Rifiutato</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="note">Note Valutazione</Label>
                                <Textarea
                                  id="note"
                                  placeholder="Inserisci le note sulla valutazione..."
                                  value={evaluationData.note_valutatore}
                                  onChange={(e) => setEvaluationData(prev => ({
                                    ...prev,
                                    note_valutatore: e.target.value
                                  }))}
                                  rows={3}
                                />
                              </div>
                              
                              <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                                  Annulla
                                </Button>
                                <Button onClick={saveEvaluation}>
                                  <Save className="w-4 h-4 mr-2" />
                                  Salva Valutazione
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleCardExpansion(r.id)}
                          className="text-primary hover:text-primary/80 h-8 px-3"
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" />
                              Meno
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" />
                              Più
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RichiesteCallIdeeTab;
