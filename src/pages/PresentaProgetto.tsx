import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Plus, Trash2, DollarSign, MapPin, Calendar, FileText, User, Users, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import CallIdeeNotice from "@/components/CallIdeeNotice";

const partecipanteSchema = z.object({
  nome: z.string().min(2, "Nome richiesto"),
  cognome: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(8, "Numero di telefono valido richiesto"),
  dataNascita: z.string().min(1, "Data di nascita richiesta"),
});

const spesaSchema = z.object({
  descrizione: z.string().min(1, "Descrizione richiesta"),
  costo: z.string().min(1, "Costo richiesto"),
  quantita: z.string().min(1, "Quantità richiesta"),
});

const formSchema = z.object({
  titoloProgetto: z.string().min(3, "Il titolo deve contenere almeno 3 caratteri"),
  descrizioneProgetto: z.string().min(50, "La descrizione deve contenere almeno 50 caratteri"),
  dataInizio: z.string().min(1, "Data di inizio richiesta"),
  dataFine: z.string().min(1, "Data di fine richiesta"),
  
  // Informazioni referente
  referenteNome: z.string().min(2, "Nome richiesto"),
  referenteCognome: z.string().min(2, "Cognome richiesto"),
  referenteEmail: z.string().email("Email non valida"),
  referenteTelefono: z.string().min(8, "Numero di telefono valido richiesto"),
  referenteDataNascita: z.string().min(1, "Data di nascita richiesta"),
  
  // Gruppo
  numeroPartecipanti: z.enum(["2-4", "5-9", "+10"], {
    required_error: "Seleziona il numero di partecipanti",
  }),
  partecipanti: z.array(partecipanteSchema).min(1, "Almeno un partecipante richiesto"),
  
  luogoSvolgimento: z.string().min(2, "Luogo di svolgimento richiesto"),
  categoria: z.string().min(1, "Categoria richiesta"),
  categoriaDescrizione: z.string().min(10, "Descrizione categoria richiesta (min 10 caratteri)"),
  
  // Evento pubblico
  tipoEvento: z.string().min(3, "Tipo di evento richiesto"),
  descrizioneEvento: z.string().min(20, "Descrizione evento richiesta (min 20 caratteri)"),
  
  altro: z.string().optional(),
  
  // Piano finanziario
  speseAttrezzature: z.array(spesaSchema).optional(),
  speseServizi: z.array(spesaSchema).optional(),
  speseGenerali: z.object({
    siae: z.string().optional(),
    assicurazione: z.string().optional(),
    rimborsoSpese: z.string().optional(),
  }),
});

const CallIdeeGiovani = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titoloProgetto: "",
      descrizioneProgetto: "",
      dataInizio: "",
      dataFine: "",
      referenteNome: "",
      referenteCognome: "",
      referenteEmail: "",
      referenteTelefono: "",
      referenteDataNascita: "",
      numeroPartecipanti: "2-4",
      partecipanti: [{ nome: "", cognome: "", email: "", telefono: "", dataNascita: "" }],
      luogoSvolgimento: "",
      categoria: "",
      categoriaDescrizione: "",
      tipoEvento: "",
      descrizioneEvento: "",
      altro: "",
      speseAttrezzature: [],
      speseServizi: [],
      speseGenerali: {
        siae: "",
        assicurazione: "",
        rimborsoSpese: "",
      },
    },
  });

  const { fields: partecipantiFields, append: appendPartecipante, remove: removePartecipante } = useFieldArray({
    control: form.control,
    name: "partecipanti",
  });

  const { fields: attrezzatureFields, append: appendAttrezzatura, remove: removeAttrezzatura } = useFieldArray({
    control: form.control,
    name: "speseAttrezzature",
  });

  const { fields: serviziFields, append: appendServizio, remove: removeServizio } = useFieldArray({
    control: form.control,
    name: "speseServizi",
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    // Prepara i dati per Supabase
    const { error } = await supabase.from('call_idee_giovani').insert([
      {
        titolo_progetto: values.titoloProgetto,
        descrizione_progetto: values.descrizioneProgetto,
        data_inizio: values.dataInizio,
        data_fine: values.dataFine,
        referente_nome: values.referenteNome,
        referente_cognome: values.referenteCognome,
        referente_email: values.referenteEmail,
        referente_telefono: values.referenteTelefono,
        referente_data_nascita: values.referenteDataNascita,
        numero_partecipanti: values.numeroPartecipanti,
        partecipanti: values.partecipanti,
        luogo_svolgimento: values.luogoSvolgimento,
        categoria: values.categoria,
        categoria_descrizione: values.categoriaDescrizione,
        tipo_evento: values.tipoEvento,
        descrizione_evento: values.descrizioneEvento,
        altro: values.altro,
        spese_attrezzature: values.speseAttrezzature,
        spese_servizi: values.speseServizi,
        spese_generali: values.speseGenerali,
      }
    ]);
    if (error) {
      toast({
        title: "Errore nell'invio!",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Candidatura inviata con successo!",
        description: "La tua candidatura è stata presentata per la valutazione. Ti contatteremo presto.",
      });
      form.reset();
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background pt-24 pb-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Call di Idee Giovani per le comunità locali
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-4">
            Microprogetti per il territorio - Presenta la tua idea innovativa per la comunità locale
          </p>
          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 max-w-2xl mx-auto">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <AlertCircle className="w-5 h-5" />
              <p className="font-semibold">Scadenza attività: 31 dicembre 2025</p>
            </div>
          </div>
        </div>

        <CallIdeeNotice />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Informazioni Progetto */}
            <Card className="animate-scale-in shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-6 h-6 text-primary" />
                  Informazioni Progetto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="titoloProgetto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titolo del Progetto</FormLabel>
                      <FormControl>
                        <Input placeholder="Inserisci il titolo del progetto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descrizioneProgetto"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione Progetto</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrivi dettagliatamente il tuo progetto, i suoi obiettivi e come intendi realizzarlo..."
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Minimo 50 caratteri - Sii specifico e dettagliato
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dataInizio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Data Inizio
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataFine"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Data Fine
                        </FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dettagli Progetto */}
            <Card className="animate-scale-in shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-primary" />
                  Dettagli Progetto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="luogoSvolgimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Luogo di Svolgimento</FormLabel>
                      <FormControl>
                        <Input placeholder="Indica il luogo dove si svolgerà il progetto" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleziona categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sociale">Sociale e Volontariato</SelectItem>
                            <SelectItem value="ambientale">Ambientale e Sostenibilità</SelectItem>
                            <SelectItem value="culturale">Culturale e Artistico</SelectItem>
                            <SelectItem value="educativo">Educativo e Formativo</SelectItem>
                            <SelectItem value="tecnologico">Tecnologico e Innovativo</SelectItem>
                            <SelectItem value="sportivo">Sportivo e Benessere</SelectItem>
                            <SelectItem value="imprenditoriale">Imprenditoriale</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoriaDescrizione"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione Categoria</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Breve descrizione della categoria scelta e come si collega al tuo progetto..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Informazioni Referente */}
            <Card className="animate-scale-in shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-6 h-6 text-primary" />
                  Informazioni Personali Referente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="referenteNome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenteCognome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cognome</FormLabel>
                        <FormControl>
                          <Input placeholder="Cognome" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenteEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@esempio.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenteTelefono"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numero di Telefono</FormLabel>
                        <FormControl>
                          <Input placeholder="+39 123 456 7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="referenteDataNascita"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data di Nascita</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Informazioni Gruppo */}
            <Card className="animate-scale-in shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-primary" />
                  Informazioni Gruppo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="numeroPartecipanti"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numero di Partecipanti</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleziona il numero di partecipanti" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2-4">2-4 partecipanti</SelectItem>
                          <SelectItem value="5-9">5-9 partecipanti</SelectItem>
                          <SelectItem value="+10">Più di 10 partecipanti</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Partecipanti</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendPartecipante({ nome: "", cognome: "", email: "", telefono: "", dataNascita: "" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Partecipante
                    </Button>
                  </div>

                  {partecipantiFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Partecipante {index + 1}</h5>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removePartecipante(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`partecipanti.${index}.nome`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`partecipanti.${index}.cognome`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cognome</FormLabel>
                              <FormControl>
                                <Input placeholder="Cognome" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`partecipanti.${index}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="email@esempio.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`partecipanti.${index}.telefono`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefono</FormLabel>
                              <FormControl>
                                <Input placeholder="+39 123 456 7890" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`partecipanti.${index}.dataNascita`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Data di Nascita</FormLabel>
                              <FormControl>
                                <Input type="date" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            

            {/* Evento Pubblico */}
            <Card className="animate-scale-in shadow-lg">
              <CardHeader>
                <CardTitle>Evento Pubblico</CardTitle>
                <CardDescription>
                  Descrivi il tipo di evento che intendi promuovere
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="tipoEvento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo di Evento</FormLabel>
                      <FormControl>
                        <Input placeholder="Es: Workshop, conferenza, spettacolo, mostra..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descrizioneEvento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione Evento</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descrivi brevemente l'evento che intendi organizzare..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="altro"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Altro</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Aggiungi qualsiasi altra informazione rilevante per il progetto..."
                          className="min-h-[80px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>Campo opzionale</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Piano Finanziario */}
            <Card className="animate-scale-in shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  Piano Finanziario Analitico
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Spese Attrezzature */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Spese per Attrezzature</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAttrezzatura({ descrizione: "", costo: "", quantita: "" })}
                      disabled={attrezzatureFields.length >= 15}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Voce
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Massimo 15 voci</p>

                  {attrezzatureFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Voce {index + 1}</h5>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeAttrezzatura(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`speseAttrezzature.${index}.descrizione`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrizione</FormLabel>
                              <FormControl>
                                <Input placeholder="Descrivi l'attrezzatura" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`speseAttrezzature.${index}.costo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo (€)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`speseAttrezzature.${index}.quantita`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantità</FormLabel>
                              <FormControl>
                                <Input placeholder="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Spese Servizi */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Spese per Prestazioni di Servizi</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendServizio({ descrizione: "", costo: "", quantita: "" })}
                      disabled={serviziFields.length >= 15}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Voce
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">Massimo 15 voci</p>

                  {serviziFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Voce {index + 1}</h5>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeServizio(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`speseServizi.${index}.descrizione`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrizione</FormLabel>
                              <FormControl>
                                <Input placeholder="Descrivi il servizio" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`speseServizi.${index}.costo`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Costo (€)</FormLabel>
                              <FormControl>
                                <Input type="number" placeholder="0.00" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`speseServizi.${index}.quantita`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Quantità</FormLabel>
                              <FormControl>
                                <Input placeholder="1" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <Separator />

                {/* Spese Generali */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Spese Generali</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={form.control}
                      name="speseGenerali.siae"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SIAE (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Costi per diritti d'autore</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="speseGenerali.assicurazione"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Assicurazione (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Copertura assicurativa</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="speseGenerali.rimborsoSpese"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rimborso Spese (€)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} />
                          </FormControl>
                          <FormDescription>Spese varie e rimborsi</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Riassunto Finanziario */}
            <Card className="animate-scale-in shadow-lg bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <DollarSign className="w-6 h-6" />
                  Riassunto Finanziario
                </CardTitle>
                <CardDescription>
                  Riepilogo automatico di tutte le spese del progetto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Totale spese per attrezzature:</span>
                      <span className="font-bold text-primary">
                        €{form.watch("speseAttrezzature")?.reduce((total, item) => {
                          const costo = parseFloat(item.costo || "0");
                          const quantita = parseInt(item.quantita || "1");
                          return total + (costo * quantita);
                        }, 0).toFixed(2) || "0.00"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Totale spese per servizi:</span>
                      <span className="font-bold text-primary">
                        €{form.watch("speseServizi")?.reduce((total, item) => {
                          const costo = parseFloat(item.costo || "0");
                          const quantita = parseInt(item.quantita || "1");
                          return total + (costo * quantita);
                        }, 0).toFixed(2) || "0.00"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <span className="font-medium">Totale spese generali:</span>
                      <span className="font-bold text-primary">
                        €{(() => {
                          const siae = parseFloat(form.watch("speseGenerali.siae") || "0");
                          const assicurazione = parseFloat(form.watch("speseGenerali.assicurazione") || "0");
                          const rimborso = parseFloat(form.watch("speseGenerali.rimborsoSpese") || "0");
                          return (siae + assicurazione + rimborso).toFixed(2);
                        })()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20">
                      <span className="font-bold text-lg">TOTALE PROGETTO:</span>
                      <span className="font-bold text-xl text-primary">
                        €{(() => {
                          const attrezzature = form.watch("speseAttrezzature")?.reduce((total, item) => {
                            const costo = parseFloat(item.costo || "0");
                            const quantita = parseInt(item.quantita || "1");
                            return total + (costo * quantita);
                          }, 0) || 0;

                          const servizi = form.watch("speseServizi")?.reduce((total, item) => {
                            const costo = parseFloat(item.costo || "0");
                            const quantita = parseInt(item.quantita || "1");
                            return total + (costo * quantita);
                          }, 0) || 0;

                          const siae = parseFloat(form.watch("speseGenerali.siae") || "0");
                          const assicurazione = parseFloat(form.watch("speseGenerali.assicurazione") || "0");
                          const rimborso = parseFloat(form.watch("speseGenerali.rimborsoSpese") || "0");
                          const generali = siae + assicurazione + rimborso;

                          return (attrezzature + servizi + generali).toFixed(2);
                        })()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Invio in corso...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Invia Candidatura
                </>
              )}
            </Button>
          </form>
        </Form>

        <div className="mt-8 text-center space-y-2 animate-fade-in">
          <p className="text-sm text-muted-foreground">
            I tuoi dati verranno trattati nel rispetto della privacy e utilizzati solo per valutare il progetto.
          </p>
          <p className="text-sm text-muted-foreground">
            Scadenza presentazione candidature: <span className="font-semibold text-primary">31 dicembre 2025</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallIdeeGiovani;
