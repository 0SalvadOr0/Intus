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
import FileUploader from "@/components/FileUploader";

const partecipanteSchema = z.object({
  nome: z.string().min(2, "Nome richiesto"),
  cognome: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(8, "Numero di telefono valido richiesto"),
  dataNascita: z.string().min(1, "Data di nascita richiesta"),
  codiceFiscale: z.string().min(16, "Codice fiscale richiesto (16 caratteri)"),
});

const figuraSupportoSchema = z.object({
  nome: z.string().min(2, "Nome richiesto"),
  cognome: z.string().min(2, "Cognome richiesto"),
  email: z.string().email("Email non valida"),
  telefono: z.string().min(8, "Numero di telefono valido richiesto"),
  dataNascita: z.string().min(1, "Data di nascita richiesta"),
  codiceFiscale: z.string().min(16, "Codice fiscale richiesto (16 caratteri)"),
});

const coprogrammaSchema = z.object({
  attivita: z.string().min(3, "Attività richiesta"),
  descrizione: z.string().min(10, "Descrizione richiesta (min 10 caratteri)"),
  mesi: z.string().min(1, "Mesi richiesti"),
});

const spesaSchema = z.object({
  descrizione: z.string().min(1, "Descrizione richiesta"),
  costo: z.string().min(1, "Costo richiesto"),
  quantita: z.string().min(1, "Quantità richiesta"),
});

const formSchema = z.object({
  titoloProgetto: z.string().min(3, "Il titolo deve contenere almeno 3 caratteri"),
  descrizioneProgetto: z.string().min(50, "La descrizione deve contenere almeno 50 caratteri"),
  
  // Coprogramma
  coprogramma: z.array(coprogrammaSchema).min(1, "Almeno un'attività del coprogramma richiesta"),
  
  dataInizio: z.string().min(1, "Data di inizio richiesta"),
  dataFine: z.string().min(1, "Data di fine richiesta"),
  
  // Dettagli progetto - autorizzazioni opzionali
  autorizzazioni: z.string().optional(),
  
  // Informazioni referente
  referenteNome: z.string().min(2, "Nome richiesto"),
  referenteCognome: z.string().min(2, "Cognome richiesto"),
  referenteEmail: z.string().email("Email non valida"),
  referenteTelefono: z.string().min(8, "Numero di telefono valido richiesto"),
  referenteDataNascita: z.string().min(1, "Data di nascita richiesta"),
  referenteCodiceFiscale: z.string().min(16, "Codice fiscale richiesto (16 caratteri)"),
  
  // Gruppo
  numeroPartecipanti: z.enum(["2-4", "5-9", "+10"], {
    required_error: "Seleziona il numero di partecipanti",
  }),
  descrizioneGruppo: z.string().min(20, "Descrizione gruppo richiesta (min 20 caratteri)"),
  partecipanti: z.array(partecipanteSchema).min(1, "Almeno un partecipante richiesto"),
  
  // Figure di supporto volontario
  figureSupporto: z.array(figuraSupportoSchema).optional(),
  
  luogoSvolgimento: z.string().min(2, "Luogo di svolgimento richiesto"),
  categoria: z.string().min(1, "Categoria richiesta"),
  categoriaDescrizione: z.string().min(10, "Descrizione categoria e risultati attesi richiesta (min 10 caratteri)"),
  
  // Evento pubblico
  tipoEvento: z.string().min(3, "Tipo di evento richiesto"),
  descrizioneEvento: z.string().min(20, "Descrizione evento richiesta (min 20 caratteri)"),
  
  altro: z.string().optional(),

  // Allegati
  allegati: z.array(z.object({
    url: z.string(),
    name: z.string()
  })).optional(),

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

  const handleFileUpload = (url: string, name: string) => {
    const currentAllegati = form.getValues("allegati") || [];
    form.setValue("allegati", [...currentAllegati, { url, name }]);
  };

  const handleFileRemove = (url: string) => {
    const currentAllegati = form.getValues("allegati") || [];
    const filtered = currentAllegati.filter(file => file.url !== url);
    form.setValue("allegati", filtered);
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      titoloProgetto: "",
      descrizioneProgetto: "",
      coprogramma: [{ attivita: "", descrizione: "", mesi: "" }],
      dataInizio: "",
      dataFine: "",
      autorizzazioni: "",
      referenteNome: "",
      referenteCognome: "",
      referenteEmail: "",
      referenteTelefono: "",
      referenteDataNascita: "",
      referenteCodiceFiscale: "",
      numeroPartecipanti: "2-4",
      descrizioneGruppo: "",
      partecipanti: [{ nome: "", cognome: "", email: "", telefono: "", dataNascita: "", codiceFiscale: "" }],
      figureSupporto: [],
      luogoSvolgimento: "",
      categoria: "",
      categoriaDescrizione: "",
      tipoEvento: "",
      descrizioneEvento: "",
      altro: "",
      allegati: [],
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

  const { fields: coprogrammaFields, append: appendCoprogramma, remove: removeCoprogramma } = useFieldArray({
    control: form.control,
    name: "coprogramma",
  });

  const { fields: figureSupportoFields, append: appendFiguraSupporto, remove: removeFiguraSupporto } = useFieldArray({
    control: form.control,
    name: "figureSupporto",
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
        coprogramma: values.coprogramma,
        data_inizio: values.dataInizio,
        data_fine: values.dataFine,
        autorizzazioni: values.autorizzazioni,
        referente_nome: values.referenteNome,
        referente_cognome: values.referenteCognome,
        referente_email: values.referenteEmail,
        referente_telefono: values.referenteTelefono,
        referente_data_nascita: values.referenteDataNascita,
        referente_codice_fiscale: values.referenteCodiceFiscale,
        numero_partecipanti: values.numeroPartecipanti,
        descrizione_gruppo: values.descrizioneGruppo,
        partecipanti: values.partecipanti,
        figure_supporto: values.figureSupporto,
        luogo_svolgimento: values.luogoSvolgimento,
        categoria: values.categoria,
        categoria_descrizione: values.categoriaDescrizione,
        tipo_evento: values.tipoEvento,
        descrizione_evento: values.descrizioneEvento,
        altro: values.altro,
        allegati: values.allegati,
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

                {/* Coprogramma */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold">Coprogramma</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendCoprogramma({ attivita: "", descrizione: "", mesi: "" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Attività
                    </Button>
                  </div>

                  {coprogrammaFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Attività {index + 1}</h5>
                        {index > 0 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => removeCoprogramma(index)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`coprogramma.${index}.attivita`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Attività</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome dell'attività" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`coprogramma.${index}.descrizione`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Descrizione</FormLabel>
                              <FormControl>
                                <Input placeholder="Descrivi l'attività" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`coprogramma.${index}.mesi`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mesi</FormLabel>
                              <FormControl>
                                <Input placeholder="Es: Ottobre-Novembre" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

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
                            <SelectItem value="Animazione territoriale">Animazione territoriale</SelectItem>
                            <SelectItem value="Educazione alla legalità">Educazione alla legalità</SelectItem>
                            <SelectItem value="Politiche giovanili">Politiche giovanili</SelectItem>
                            <SelectItem value="Sviluppo di ricerche/Intervento">Sviluppo di ricerche/Intervento</SelectItem>
                            <SelectItem value="Promozione del territorio">Promozione del territorio</SelectItem>
                            <SelectItem value="Inclusione sociale">Inclusione sociale</SelectItem>
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
                      <FormLabel>Descrizione Categoria e risulati attesi</FormLabel>
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

                  <FormField
                    control={form.control}
                    name="referenteCodiceFiscale"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Codice Fiscale</FormLabel>
                        <FormControl>
                          <Input placeholder="RSSMRA80A01H501Z" {...field} />
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

                <FormField
                  control={form.control}
                  name="descrizioneGruppo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrizione Gruppo</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Chi siete e che passioni avete? Avete già realizzato qualcosa insieme?"
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Raccontaci qualcosa di più sul vostro gruppo
                      </FormDescription>
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
                      onClick={() => appendPartecipante({ nome: "", cognome: "", email: "", telefono: "", dataNascita: "", codiceFiscale: "" })}
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

                        <FormField
                          control={form.control}
                          name={`partecipanti.${index}.codiceFiscale`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Codice Fiscale</FormLabel>
                              <FormControl>
                                <Input placeholder="RSSMRA80A01H501Z" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                {/* Figure di supporto volontario */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold">Figure di Supporto a Titolo Volontario</h4>
                      <p className="text-sm text-muted-foreground">Opzionale - Aggiungi persone che supporteranno il progetto a titolo volontario</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendFiguraSupporto({ nome: "", cognome: "", email: "", telefono: "", dataNascita: "", codiceFiscale: "" })}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Aggiungi Figura di Supporto
                    </Button>
                  </div>

                  {figureSupportoFields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium">Figura di Supporto {index + 1}</h5>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeFiguraSupporto(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <FormField
                          control={form.control}
                          name={`figureSupporto.${index}.nome`}
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
                          name={`figureSupporto.${index}.cognome`}
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
                          name={`figureSupporto.${index}.email`}
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
                          name={`figureSupporto.${index}.telefono`}
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
                          name={`figureSupporto.${index}.dataNascita`}
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

                        <FormField
                          control={form.control}
                          name={`figureSupporto.${index}.codiceFiscale`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Ruolo</FormLabel>
                              <FormControl>
                                <Input placeholder="Ruolo" {...field} />
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

                {/* Allegati */}
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Allegati (Opzionale)
                    </label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Carica documenti PDF o Word di supporto al progetto
                    </p>
                  </div>
                  <FileUploader
                    onFileUpload={(url, name) => {
                      const currentAllegati = form.getValues("allegati") || [];
                      form.setValue("allegati", [...currentAllegati, { url, name }]);
                    }}
                    onFileRemove={(url) => {
                      const currentAllegati = form.getValues("allegati") || [];
                      const filtered = currentAllegati.filter(file => file.url !== url);
                      form.setValue("allegati", filtered);
                    }}
                    uploadedFiles={(form.watch("allegati") || []).map(file => ({
                                    url: file.url || '',
                                    name: file.name || ''
                                  }))}
                    maxFiles={3}
                    acceptedTypes={['.pdf', '.doc', '.docx']}
                    maxFileSize={10}
                  />
                </div>
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
            Scadenza presentazione candidature: <span className="font-semibold text-primary">12 Settembre 2025</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CallIdeeGiovani;
