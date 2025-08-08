import { useState } from "react";
import { X, AlertCircle, Download } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useHref } from "react-router-dom";

const CallIdeeNotice = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  return (
    <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 animate-fade-in shadow-lg">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 mt-1" />
          </div>
          
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-2">
                  Avviso importante - Call di Idee Giovani
                </h3>
                <p className="text-amber-700 dark:text-amber-200 text-sm leading-relaxed">
                  Ti consigliamo di leggere attentamente il documento informativo. Usa il modello Word come riferimento: compila i campi lì e poi copia e incolla le risposte direttamente nel form online.
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="text-amber-600 hover:text-amber-800 hover:bg-amber-100 dark:text-amber-400 dark:hover:text-amber-200 dark:hover:bg-amber-900/20 h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-white dark:bg-card rounded-lg p-4 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
              <a
                  href="/public/files/avvisi/avviso_partecipazione.docx"
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-amber-600 dark:text-amber-400 hover:underline"
                >
              <Download   className="w-5 h-5 mr-1"/>
              </a>
                  Scarica il documento informativo
            </div>

            <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-4 h-4" />
              <span>Assicurati di aver letto e compreso tutte le informazioni prima di inviare la tua candidatura.</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CallIdeeNotice;
