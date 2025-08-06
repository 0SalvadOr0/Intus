import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Cookie, 
  Settings, 
  Shield, 
  BarChart3, 
  X, 
  Check,
  Info,
  Eye,
  Target
} from "lucide-react";

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true
    functional: false,
    analytics: false,
    marketing: false
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Delay showing banner to not be intrusive
      setTimeout(() => setShowBanner(true), 2000);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem('cookie-preferences');
      if (savedPreferences) {
        setPreferences({ ...preferences, ...JSON.parse(savedPreferences) });
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie-consent', 'accepted');
    localStorage.setItem('cookie-preferences', JSON.stringify(allAccepted));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie-consent', 'rejected');
    localStorage.setItem('cookie-preferences', JSON.stringify(onlyNecessary));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie-consent', 'customized');
    localStorage.setItem('cookie-preferences', JSON.stringify(preferences));
    setShowBanner(false);
    setShowSettings(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    // Show again after 24 hours if no choice was made
    setTimeout(() => setShowBanner(true), 24 * 60 * 60 * 1000);
  };

  const cookieTypes = [
    {
      id: 'necessary' as keyof CookiePreferences,
      title: 'Cookie Necessari',
      description: 'Essenziali per il funzionamento del sito web. Non possono essere disabilitati.',
      icon: Shield,
      color: 'text-green-600',
      required: true
    },
    {
      id: 'functional' as keyof CookiePreferences,
      title: 'Cookie Funzionali',
      description: 'Permettono funzionalità avanzate come salvare le tue preferenze.',
      icon: Settings,
      color: 'text-blue-600',
      required: false
    },
    {
      id: 'analytics' as keyof CookiePreferences,
      title: 'Cookie Analytics',
      description: 'Ci aiutano a capire come i visitatori interagiscono con il sito.',
      icon: BarChart3,
      color: 'text-orange-600',
      required: false
    },
    {
      id: 'marketing' as keyof CookiePreferences,
      title: 'Cookie Marketing',
      description: 'Utilizzati per mostrare pubblicità personalizzata.',
      icon: Target,
      color: 'text-purple-600',
      required: false
    }
  ];

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
      
      {/* Cookie Banner */}
      <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-in-right">
        <Card className="border-2 border-primary/20 shadow-2xl bg-card/95 backdrop-blur-md">
          <CardContent className="p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 rounded-lg bg-primary/10">
                <Cookie className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg">Cookie Policy</h3>
                  <Badge variant="outline" className="text-xs">
                    <Info className="w-3 h-3 mr-1" />
                    GDPR
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                  Utilizziamo cookie per migliorare la tua esperienza di navigazione, 
                  analizzare il traffico del sito e personalizzare i contenuti.
                </p>
                
                {!showSettings ? (
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        onClick={handleAcceptAll}
                        size="sm"
                        className="flex-1 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Accetta tutti
                      </Button>
                      <Button 
                        onClick={handleRejectAll}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Rifiuta tutti
                      </Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <Button 
                        onClick={() => setShowSettings(true)}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-2"
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Personalizza
                      </Button>
                      <Button 
                        onClick={handleDismiss}
                        variant="ghost"
                        size="sm"
                        className="text-xs h-auto p-2"
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Dopo
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-48 overflow-y-auto space-y-3">
                      {cookieTypes.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <div key={type.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <IconComponent className={`w-5 h-5 mt-0.5 ${type.color}`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h4 className="font-medium text-sm">{type.title}</h4>
                                <div className="flex items-center gap-2">
                                  {type.required && (
                                    <Badge variant="secondary" className="text-xs">
                                      Richiesto
                                    </Badge>
                                  )}
                                  <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={preferences[type.id]}
                                      disabled={type.required}
                                      onChange={(e) => setPreferences({
                                        ...preferences,
                                        [type.id]: e.target.checked
                                      })}
                                      className="sr-only"
                                    />
                                    <div className={`w-10 h-6 rounded-full transition-colors ${
                                      preferences[type.id] 
                                        ? 'bg-primary' 
                                        : 'bg-muted-foreground/30'
                                    } ${type.required ? 'opacity-50' : ''}`}>
                                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                                        preferences[type.id] ? 'translate-x-5' : 'translate-x-1'
                                      } mt-1`} />
                                    </div>
                                  </label>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {type.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleSavePreferences}
                        size="sm"
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Salva preferenze
                      </Button>
                      <Button 
                        onClick={() => setShowSettings(false)}
                        variant="outline"
                        size="sm"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default CookieConsent;
