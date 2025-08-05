import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Star } from "lucide-react";

interface EvaluationCriteria {
  cantierabilita: number;
  sostenibilita: number;
  risposta_territorio: number;
  coinvolgimento_giovani: number;
  promozione_territorio: number;
}

interface NewEvaluationData {
  criteri: EvaluationCriteria;
  punteggio_totale: number;
  stato: "in_valutazione" | "approvato" | "rifiutato" | "in_attesa";
  note_valutatore: string;
}

interface Richiesta {
  id: string;
  titolo_progetto: string;
  descrizione_progetto: string;
  valutazione?: {
    criteri?: EvaluationCriteria;
    punteggio_totale?: number;
    stato: "in_valutazione" | "approvato" | "rifiutato" | "in_attesa";
    note_valutatore: string;
    data_valutazione: string;
    valutatore: string;
  };
}

interface NewEvaluationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRequest: Richiesta | null;
  onSave: (evaluationData: NewEvaluationData) => void;
}

const NewEvaluationDialog = ({ open, onOpenChange, selectedRequest, onSave }: NewEvaluationDialogProps) => {
  const [evaluationData, setEvaluationData] = useState<NewEvaluationData>({
    criteri: {
      cantierabilita: selectedRequest?.valutazione?.criteri?.cantierabilita || 0,
      sostenibilita: selectedRequest?.valutazione?.criteri?.sostenibilita || 0,
      risposta_territorio: selectedRequest?.valutazione?.criteri?.risposta_territorio || 0,
      coinvolgimento_giovani: selectedRequest?.valutazione?.criteri?.coinvolgimento_giovani || 0,
      promozione_territorio: selectedRequest?.valutazione?.criteri?.promozione_territorio || 0,
    },
    punteggio_totale: selectedRequest?.valutazione?.punteggio_totale || 0,
    stato: selectedRequest?.valutazione?.stato || "in_valutazione",
    note_valutatore: selectedRequest?.valutazione?.note_valutatore || ""
  });

  const updateCriterion = (criterion: keyof EvaluationCriteria, value: number) => {
    const newCriteri = {
      ...evaluationData.criteri,
      [criterion]: Math.min(20, Math.max(0, value))
    };
    
    const newTotal = Object.values(newCriteri).reduce((sum, val) => sum + val, 0);
    
    setEvaluationData(prev => ({
      ...prev,
      criteri: newCriteri,
      punteggio_totale: newTotal
    }));
  };

  const handleSave = () => {
    onSave(evaluationData);
    onOpenChange(false);
  };

  const criteriaConfig = [
    {
      key: 'cantierabilita' as const,
      label: 'Cantierabilità della proposta',
      description: 'Capacità e possibilità di avviare subito le azioni proposte'
    },
    {
      key: 'sostenibilita' as const,
      label: 'Sostenibilità della proposta',
      description: 'Viabilità economica e organizzativa del progetto'
    },
    {
      key: 'risposta_territorio' as const,
      label: 'Capacità di rispondere alle esigenze del territorio',
      description: 'Capacità di coinvolgere la cittadinanza e rispondere ai bisogni locali'
    },
    {
      key: 'coinvolgimento_giovani' as const,
      label: 'Coinvolgimento di altri/e giovani',
      description: 'Capacità di coinvolgere e attivare altri giovani'
    },
    {
      key: 'promozione_territorio' as const,
      label: 'Promozione e valorizzazione del territorio',
      description: 'Capacità di valorizzare e promuovere il territorio'
    }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Valuta Richiesta
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{selectedRequest?.titolo_progetto}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{selectedRequest?.descrizione_progetto}</p>
            </CardContent>
          </Card>

          {/* Evaluation Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Criteri di Valutazione</CardTitle>
              <p className="text-sm text-muted-foreground">
                Valuta ogni criterio da 0 a 20 punti. Punteggio massimo: 100 punti.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {criteriaConfig.map((criterion) => (
                <div key={criterion.key} className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <Label className="font-semibold">{criterion.label}</Label>
                      <p className="text-xs text-muted-foreground mt-1">{criterion.description}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={evaluationData.criteri[criterion.key]}
                        onChange={(e) => updateCriterion(criterion.key, parseInt(e.target.value) || 0)}
                        className="w-20 text-center"
                      />
                      <span className="text-sm text-muted-foreground">/20</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Total Score */}
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <Label className="text-lg font-bold">Punteggio Totale</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-primary">
                      {evaluationData.punteggio_totale}
                    </span>
                    <span className="text-muted-foreground">/100</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stato">Stato della Valutazione</Label>
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
            <Label htmlFor="note">Note del Valutatore</Label>
            <Textarea
              id="note"
              placeholder="Inserisci commenti e osservazioni sulla valutazione..."
              value={evaluationData.note_valutatore}
              onChange={(e) => setEvaluationData(prev => ({
                ...prev,
                note_valutatore: e.target.value
              }))}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Salva Valutazione
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewEvaluationDialog;
