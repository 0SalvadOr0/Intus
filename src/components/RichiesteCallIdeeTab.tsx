import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2
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
}

const RichiesteCallIdeeTab = () => {
  const [richieste, setRichieste] = useState<Richiesta[]>([]);
  const [filteredRichieste, setFilteredRichieste] = useState<Richiesta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [exporting, setExporting] = useState(false);

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

    setFilteredRichieste(filtered);
  }, [richieste, searchTerm, categoryFilter]);

  // 📊 Export Functionality
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Prepare CSV data
      const csvData = filteredRichieste.map(r => ({
        ID: r.id,
        "Titolo Progetto": r.titolo_progetto,
        Categoria: r.categoria,
        "Tipo Evento": r.tipo_evento,
        "Referente Nome": r.referente_nome,
        "Referente Cognome": r.referente_cognome,
        "Referente Email": r.referente_email,
        "Referente Telefono": r.referente_telefono,
        "Data Nascita": r.referente_data_nascita,
        "Luogo Svolgimento": r.luogo_svolgimento,
        "Data Inizio": r.data_inizio,
        "Data Fine": r.data_fine,
        "Numero Partecipanti": r.numero_partecipanti,
        "Descrizione Progetto": r.descrizione_progetto,
        "Totale Spese Attrezzature": r.spese_attrezzature?.reduce((sum, s) => sum + (s.costo * s.quantita), 0) || 0,
        "Totale Spese Servizi": r.spese_servizi?.reduce((sum, s) => sum + (s.costo * s.quantita), 0) || 0,
        "SIAE": r.spese_generali?.siae || 0,
        "Assicurazione": r.spese_generali?.assicurazione || 0,
        "Rimborso Spese": r.spese_generali?.rimborsoSpese || 0,
        "Data Creazione": new Date(r.created_at).toLocaleDateString('it-IT')
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row] || ''}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `richieste_call_idee_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setExporting(false);
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
                onClick={exportToCSV}
                disabled={exporting || filteredRichieste.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md"
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Esporta CSV
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
                {searchTerm || categoryFilter !== "all" ? "Nessun risultato trovato" : "Nessuna richiesta presente"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || categoryFilter !== "all" 
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
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {r.descrizione_progetto}
                      </p>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCardExpansion(r.id)}
                        className="text-primary hover:text-primary/80 h-8 px-3"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4 mr-1" />
                            Meno dettagli
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4 mr-1" />
                            Più dettagli
                          </>
                        )}
                      </Button>
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