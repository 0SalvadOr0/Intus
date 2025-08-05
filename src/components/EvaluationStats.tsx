import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertCircle, 
  Star,
  TrendingUp,
  FileText,
  Users
} from "lucide-react";

interface EvaluationStatsData {
  total_requests: number;
  pending_requests: number;
  in_evaluation_requests: number;
  approved_requests: number;
  rejected_requests: number;
  average_score: number;
}

const EvaluationStats = () => {
  const [stats, setStats] = useState<EvaluationStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Prova prima con la funzione RPC
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_evaluation_stats');
        
        if (!rpcError && rpcData && rpcData.length > 0) {
          setStats(rpcData[0]);
        } else {
          // Fallback con query diretta
          console.warn("RPC function not available, using direct query:", rpcError);
          
          const { data, error } = await supabase
            .from("call_idee_giovani")
            .select("valutazione");

          if (error) throw error;

          // Calcola le statistiche manualmente
          const calculatedStats: EvaluationStatsData = {
            total_requests: data.length,
            pending_requests: data.filter(r => !r.valutazione || r.valutazione.stato === 'in_attesa').length,
            in_evaluation_requests: data.filter(r => r.valutazione?.stato === 'in_valutazione').length,
            approved_requests: data.filter(r => r.valutazione?.stato === 'approvato').length,
            rejected_requests: data.filter(r => r.valutazione?.stato === 'rifiutato').length,
            average_score: data
              .filter(r => r.valutazione && (r.valutazione.punteggio_totale || r.valutazione.punteggio))
              .reduce((sum, r, _, arr) => {
                const score = r.valutazione.punteggio_totale || r.valutazione.punteggio;
                const maxScore = r.valutazione.punteggio_totale ? 100 : 10;
                // Normalize to percentage
                return sum + ((score / maxScore * 100) / arr.length);
              }, 0) || 0
          };

          setStats(calculatedStats);
        }
      } catch (error) {
        console.error("Error fetching evaluation stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Statistiche Valutazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Caricamento statistiche...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card className="border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Statistiche Valutazioni
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">
            Nessun dato disponibile
          </div>
        </CardContent>
      </Card>
    );
  }

  const statsItems = [
    {
      label: "Totale Richieste",
      value: stats.total_requests,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/30"
    },
    {
      label: "In Attesa",
      value: stats.pending_requests,
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-100 dark:bg-gray-900/30"
    },
    {
      label: "In Valutazione",
      value: stats.in_evaluation_requests,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100 dark:bg-yellow-900/30"
    },
    {
      label: "Approvate",
      value: stats.approved_requests,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/30"
    },
    {
      label: "Rifiutate",
      value: stats.rejected_requests,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100 dark:bg-red-900/30"
    }
  ];

  const approvalRate = stats.total_requests > 0 
    ? ((stats.approved_requests / (stats.approved_requests + stats.rejected_requests)) * 100).toFixed(1)
    : "0";

  return (
    <Card className="border-0 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-primary" />
            Statistiche Valutazioni
          </div>
          {stats.average_score > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm font-semibold">{stats.average_score.toFixed(1)}/10</span>
              <span className="text-xs text-muted-foreground">media</span>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grid delle statistiche principali */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {statsItems.map((item, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg ${item.bgColor} transition-all hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    {item.label}
                  </p>
                  <p className={`text-lg font-bold ${item.color}`}>
                    {item.value}
                  </p>
                </div>
                <item.icon className={`w-5 h-5 ${item.color}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Statistiche aggiuntive */}
        <div className="pt-4 border-t border-border/50">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasso di Approvazione:</span>
                <Badge variant={parseFloat(approvalRate) > 70 ? "default" : "secondary"}>
                  {approvalRate}%
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Da Valutare:</span>
                <span className="font-medium">
                  {stats.pending_requests + stats.in_evaluation_requests}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valutate:</span>
                <span className="font-medium">
                  {stats.approved_requests + stats.rejected_requests}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">% Completamento:</span>
                <span className="font-medium">
                  {stats.total_requests > 0 
                    ? (((stats.approved_requests + stats.rejected_requests) / stats.total_requests) * 100).toFixed(0)
                    : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EvaluationStats;
