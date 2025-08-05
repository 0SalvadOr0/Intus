import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Medal, Award, Star, TrendingUp } from "lucide-react";

interface ProjectRankingData {
  id: string;
  titolo_progetto: string;
  referente_nome: string;
  referente_cognome: string;
  categoria: string;
  valutazione?: {
    punteggio_totale?: number;
    punteggio?: number; // Legacy field
    stato: string;
    criteri?: {
      cantierabilita: number;
      sostenibilita: number;
      risposta_territorio: number;
      coinvolgimento_giovani: number;
      promozione_territorio: number;
    };
  };
  created_at: string;
}

const ProjectRanking = () => {
  const [projects, setProjects] = useState<ProjectRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from("call_idee_giovani")
          .select("id, titolo_progetto, referente_nome, referente_cognome, categoria, valutazione, created_at")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Filter and sort projects by score
        const rankedProjects = (data || [])
          .filter(p => p.valutazione && (p.valutazione.punteggio_totale || p.valutazione.punteggio))
          .map(p => ({
            ...p,
            totalScore: p.valutazione?.punteggio_totale || p.valutazione?.punteggio || 0
          }))
          .sort((a, b) => b.totalScore - a.totalScore)
          .slice(0, 10); // Top 10

        setProjects(rankedProjects);
      } catch (error) {
        console.error("Error fetching projects for ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRankBadgeColor = (index: number) => {
    switch (index) {
      case 0: return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case 1: return "bg-gray-100 text-gray-800 border-gray-300";
      case 2: return "bg-amber-100 text-amber-800 border-amber-300";
      default: return "bg-blue-100 text-blue-800 border-blue-300";
    }
  };

  const getStatusBadge = (stato: string) => {
    switch (stato) {
      case "approvato":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Approvato</Badge>;
      case "rifiutato":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Rifiutato</Badge>;
      case "in_valutazione":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">In Valutazione</Badge>;
      default:
        return <Badge variant="secondary">In Attesa</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Classifica Progetti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
                <div className="w-12 h-6 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Classifica Progetti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nessun progetto valutato ancora.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Classifica Progetti
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top {projects.length} progetti per punteggio
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors hover:bg-muted/50 ${
                index < 3 ? 'bg-muted/20' : ''
              }`}
            >
              {/* Rank */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${getRankBadgeColor(index)}`}>
                  {index + 1}
                </div>
                {getRankIcon(index)}
              </div>

              {/* Project Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm truncate">
                    {project.titolo_progetto}
                  </h4>
                  {getStatusBadge(project.valutazione?.stato || 'in_attesa')}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Avatar className="w-4 h-4">
                    <AvatarFallback className="text-xs">
                      {project.referente_nome?.[0]}{project.referente_cognome?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span>{project.referente_nome} {project.referente_cognome}</span>
                  <span>•</span>
                  <span>{project.categoria}</span>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className="font-bold text-lg text-primary">
                  {project.valutazione?.punteggio_totale || project.valutazione?.punteggio}
                </div>
                <div className="text-xs text-muted-foreground">
                  /{project.valutazione?.punteggio_totale ? '100' : '10'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Legend for new scoring system */}
        {projects.some(p => p.valutazione?.punteggio_totale) && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-xs text-muted-foreground mb-2">
              <strong>Nuovo sistema di valutazione:</strong>
            </p>
            <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
              <div>• Cantierabilità (0-20)</div>
              <div>• Sostenibilità (0-20)</div>
              <div>• Risposta al territorio (0-20)</div>
              <div>• Coinvolgimento giovani (0-20)</div>
              <div>• Promozione territorio (0-20)</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectRanking;
