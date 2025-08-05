import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, Send } from "lucide-react";

const Contatti = () => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    messaggio: ""
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, we'll just show a success message
      // You can implement email sending with Supabase Edge Functions later
      
      toast({
        title: "Messaggio inviato!",
        description: "Ti contatteremo presto. Grazie per averci scritto.",
      });

      // Reset form
      setFormData({
        nome: "",
        email: "",
        messaggio: ""
      });

    } catch (error) {
      toast({
        title: "Errore",
        description: "Si è verificato un errore nell'invio del messaggio.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="animate-fade-in-up">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Contatti</h1>
          <p className="text-muted-foreground text-lg">
            Siamo qui per ascoltarti. Contattaci per qualsiasi informazione.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Contact Information */}
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Informazioni di Contatto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Email */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Email</p>
                  <a 
                    href="mailto:amministratore@intus.it" 
                    className="text-primary hover:underline"
                  >
                    amministratore@intus.it
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Telefono</p>
                  <a 
                    href="tel:+393896783589" 
                    className="text-primary hover:underline"
                  >
                    389 678 3589
                  </a>
                </div>
              </div>

              {/* Address */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">Indirizzo</p>
                  <p className="text-muted-foreground">
                    Via Fra Girolamo da Corleone, 3<br />
                    90034 Corleone (PA)
                  </p>
                </div>
              </div>

              {/* Organization Info */}
              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2">INTUS CORLEONE APS</h3>
                <p className="text-sm text-muted-foreground">
                  Associazione di Promozione Sociale dedicata allo sviluppo 
                  del territorio e al supporto dei giovani nel territorio di Corleone.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Invia un Messaggio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome e Cognome *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Il tuo nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="la.tua.email@esempio.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="messaggio">Messaggio *</Label>
                  <Textarea
                    id="messaggio"
                    name="messaggio"
                    required
                    value={formData.messaggio}
                    onChange={handleInputChange}
                    placeholder="Scrivi qui il tuo messaggio..."
                    rows={6}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Invio in corso...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Invia Messaggio
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  I campi contrassegnati con * sono obbligatori.<br />
                  Leggi la nostra <a href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</a> per informazioni sul trattamento dei dati.
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Contatti;
