import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function para(text: string, bold = false) {
  return new Paragraph({ children: [new TextRun({ text, bold })] });
}

function sectionHeading(text: string) {
  return new Paragraph({ text, heading: HeadingLevel.HEADING_2 });
}

export async function exportBlogPostToDocx(post: any, selected: string[]) {
  const sections: Paragraph[] = [];

  sections.push(new Paragraph({ text: post?.titolo || "Articolo", heading: HeadingLevel.TITLE }));

  if (selected.includes("categoria") && post?.categoria) {
    sections.push(sectionHeading("Categoria"));
    sections.push(para(String(post.categoria)));
  }
  if (selected.includes("autore") && post?.autore) {
    sections.push(sectionHeading("Autore"));
    sections.push(para(String(post.autore)));
  }
  if (selected.includes("created_at") && post?.created_at) {
    sections.push(sectionHeading("Creato il"));
    sections.push(para(new Date(post.created_at).toLocaleString("it-IT")));
  }
  if (selected.includes("excerpt") && post?.excerpt) {
    sections.push(sectionHeading("Anteprima"));
    sections.push(para(String(post.excerpt)));
  }
  if (selected.includes("contenuto") && post?.contenuto) {
    sections.push(sectionHeading("Contenuto"));
    const parts = String(post.contenuto).split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);
    parts.forEach(p => sections.push(para(p)));
  }
  if (selected.includes("youtube_url") && (post?.youtube_url || post?.youtubeUrl)) {
    sections.push(sectionHeading("Video"));
    sections.push(para(String(post.youtube_url || post.youtubeUrl)));
  }
  if (selected.includes("copertina_url") && post?.copertina_url) {
    sections.push(sectionHeading("Copertina"));
    sections.push(para(String(post.copertina_url)));
  }
  if (selected.includes("immagini") && Array.isArray(post?.immagini) && post.immagini.length) {
    sections.push(sectionHeading("Immagini"));
    post.immagini.forEach((url: string, i: number) => sections.push(para(`${i + 1}. ${url}`)));
  }

  const doc = new Document({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${(post?.titolo || "articolo").replace(/[^a-z0-9_-]+/gi, "-")}.docx`);
}

export async function exportProjectToDocx(project: any, selected: string[]) {
  const sections: Paragraph[] = [];
  sections.push(new Paragraph({ text: project?.titolo || "Progetto", heading: HeadingLevel.TITLE }));

  if (selected.includes("categoria") && project?.categoria) {
    sections.push(sectionHeading("Categoria"));
    sections.push(para(String(project.categoria)));
  }
  if (selected.includes("status") && project?.status) {
    sections.push(sectionHeading("Stato"));
    sections.push(para(String(project.status)));
  }
  if (selected.includes("data_inizio") && project?.data_inizio) {
    sections.push(sectionHeading("Data inizio"));
    sections.push(para(new Date(project.data_inizio).toLocaleDateString("it-IT")));
  }
  if (selected.includes("luoghi") && Array.isArray(project?.luoghi) && project.luoghi.length) {
    sections.push(sectionHeading("Luoghi"));
    sections.push(para(project.luoghi.join(", ")));
  }
  if (selected.includes("numero_partecipanti") && project?.numero_partecipanti != null) {
    sections.push(sectionHeading("Partecipanti"));
    sections.push(para(String(project.numero_partecipanti)));
  }
  if (selected.includes("descrizione_breve") && project?.descrizione_breve) {
    sections.push(sectionHeading("Descrizione breve"));
    sections.push(para(String(project.descrizione_breve)));
  }
  if (selected.includes("contenuto") && project?.contenuto) {
    sections.push(sectionHeading("Contenuto"));
    const parts = String(project.contenuto).split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);
    parts.forEach(p => sections.push(para(p)));
  }
  if (selected.includes("ruolo_intus") && project?.ruolo_intus) {
    sections.push(sectionHeading("Ruolo di Intus"));
    sections.push(para(String(project.ruolo_intus)));
  }
  if (selected.includes("partecipanti_diretti") && project?.partecipanti_diretti) {
    sections.push(sectionHeading("Partecipanti diretti"));
    sections.push(para(String(project.partecipanti_diretti)));
  }
  if (selected.includes("partecipanti_indiretti") && project?.partecipanti_indiretti) {
    sections.push(sectionHeading("Partecipanti indiretti"));
    sections.push(para(String(project.partecipanti_indiretti)));
  }
  if (selected.includes("ente_finanziatore") && project?.ente_finanziatore) {
    sections.push(sectionHeading("Ente finanziatore"));
    sections.push(para(String(project.ente_finanziatore)));
  }
  if (selected.includes("linea_di_finanziamento") && project?.linea_di_finanziamento) {
    sections.push(sectionHeading("Linea di finanziamento"));
    sections.push(para(String(project.linea_di_finanziamento)));
  }
  if (selected.includes("youtube_url") && project?.youtube_url) {
    sections.push(sectionHeading("Video"));
    sections.push(para(String(project.youtube_url)));
  }
  if (selected.includes("youtube_urls") && Array.isArray(project?.youtube_urls) && project.youtube_urls.length) {
    sections.push(sectionHeading("Video aggiuntivi"));
    project.youtube_urls.forEach((url: string, i: number) => sections.push(para(`${i + 1}. ${url}`)));
  }
  if (selected.includes("partner") && Array.isArray(project?.partner) && project.partner.length) {
    sections.push(sectionHeading("Partner"));
    project.partner.forEach((p: any, i: number) => {
      const line = [p?.nome, p?.link ? `(${p.link})` : null, p?.capofila ? "- Capofila" : null].filter(Boolean).join(" ");
      sections.push(para(`${i + 1}. ${line}`));
    });
  }
  if (selected.includes("immagini") && Array.isArray(project?.immagini) && project.immagini.length) {
    sections.push(sectionHeading("Immagini"));
    project.immagini.forEach((url: string, i: number) => sections.push(para(`${i + 1}. ${url}`)));
  }
  if (selected.includes("prodotti") && Array.isArray(project?.prodotti) && project.prodotti.length) {
    sections.push(sectionHeading("Prodotti realizzati"));
    project.prodotti.forEach((prod: any, i: number) => {
      const parts: string[] = [];
      if (prod?.titolo) parts.push(`${i + 1}. ${prod.titolo}`);
      if (prod?.descrizione_breve) parts.push(String(prod.descrizione_breve));
      if (prod?.link) parts.push(`Link: ${prod.link}`);
      if (prod?.immagine) parts.push(`Immagine: ${prod.immagine}`);
      parts.forEach(p => sections.push(para(p)));
      if (i < project.prodotti.length - 1) sections.push(new Paragraph(""));
    });
  }

  const doc = new Document({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${(project?.titolo || "progetto").replace(/[^a-z0-9_-]+/gi, "-")}.docx`);
}

export async function exportCallIdeeRequestToDocx(req: any) {
  const sections: Paragraph[] = [];

  const fmtDate = (d?: string) => (d ? new Date(d).toLocaleDateString("it-IT") : "");
  const currency = (n?: number) =>
    typeof n === "number" && !isNaN(n) ? n.toLocaleString("it-IT", { style: "currency", currency: "EUR" }) : "€0,00";

  sections.push(new Paragraph({ text: req?.titolo_progetto || "Progetto", heading: HeadingLevel.TITLE }));

  sections.push(sectionHeading("Dettagli"));
  const dettagli: string[] = [];
  if (req?.categoria) dettagli.push(`Categoria: ${req.categoria}`);
  if (req?.categoria_descrizione) dettagli.push(`Descrizione categoria: ${req.categoria_descrizione}`);
  if (req?.tipo_evento) dettagli.push(`Tipo evento: ${req.tipo_evento}`);
  if (req?.luogo_svolgimento) dettagli.push(`Luogo: ${req.luogo_svolgimento}`);
  if (req?.data_inizio || req?.data_fine) dettagli.push(`Periodo: ${fmtDate(req.data_inizio)} - ${fmtDate(req.data_fine)}`);
  if (req?.numero_partecipanti) dettagli.push(`Numero partecipanti: ${req.numero_partecipanti}`);
  dettagli.forEach(line => sections.push(para(line)));

  if (req?.descrizione_progetto) {
    sections.push(sectionHeading("Descrizione Progetto"));
    String(req.descrizione_progetto).split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean).forEach((p: string) => sections.push(para(p)));
  }
  if (req?.descrizione_evento) {
    sections.push(sectionHeading("Descrizione Evento"));
    String(req.descrizione_evento).split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean).forEach((p: string) => sections.push(para(p)));
  }

  if (Array.isArray(req?.coprogramma) && req.coprogramma.length) {
    sections.push(sectionHeading("Coprogramma"));
    req.coprogramma.forEach((c: any, i: number) => {
      if (!c) return;
      if (c.attivita) sections.push(para(`${i + 1}. Attività: ${c.attivita}`));
      if (c.descrizione) sections.push(para(`   Descrizione: ${c.descrizione}`));
      if (c.mesi) sections.push(para(`   Periodo: ${c.mesi}`));
    });
  }

  sections.push(sectionHeading("Referente"));
  const refLines: string[] = [];
  if (req?.referente_nome || req?.referente_cognome) refLines.push(`Nome: ${[req?.referente_nome, req?.referente_cognome].filter(Boolean).join(" ")}`);
  if (req?.referente_email) refLines.push(`Email: ${req.referente_email}`);
  if (req?.referente_telefono) refLines.push(`Telefono: ${req.referente_telefono}`);
  if (req?.referente_data_nascita) refLines.push(`Data nascita: ${fmtDate(req.referente_data_nascita)}`);
  if (req?.referente_codice_fiscale) refLines.push(`Codice fiscale: ${req.referente_codice_fiscale}`);
  if (req?.autorizzazioni) refLines.push(`Autorizzazioni: ${req.autorizzazioni}`);
  refLines.forEach(l => sections.push(para(l)));

  if (Array.isArray(req?.partecipanti) && req.partecipanti.length) {
    sections.push(sectionHeading("Partecipanti"));
    req.partecipanti.forEach((p: any, i: number) => {
      const name = [p?.nome, p?.cognome].filter(Boolean).join(" ") || `Partecipante ${i + 1}`;
      sections.push(para(`${i + 1}. ${name}`));
      if (p?.email) sections.push(para(`   Email: ${p.email}`));
      if (p?.telefono) sections.push(para(`   Telefono: ${p.telefono}`));
      if (p?.dataNascita) sections.push(para(`   Data nascita: ${fmtDate(p.dataNascita)}`));
      if (p?.codiceFiscale) sections.push(para(`   Codice fiscale: ${p.codiceFiscale}`));
    });
  }

  if (Array.isArray(req?.figure_supporto) && req.figure_supporto.length) {
    sections.push(sectionHeading("Figure di supporto"));
    req.figure_supporto.forEach((f: any, i: number) => {
      const name = [f?.nome, f?.cognome].filter(Boolean).join(" ") || `Figura ${i + 1}`;
      sections.push(para(`${i + 1}. ${name}`));
      if (f?.email) sections.push(para(`   Email: ${f.email}`));
      if (f?.telefono) sections.push(para(`   Telefono: ${f.telefono}`));
      if (f?.dataNascita) sections.push(para(`   Data nascita: ${fmtDate(f.dataNascita)}`));
      if (f?.codiceFiscale) sections.push(para(`   Codice fiscale: ${f.codiceFiscale}`));
    });
  }

  if (Array.isArray(req?.allegati) && req.allegati.length) {
    sections.push(sectionHeading("Allegati"));
    req.allegati.forEach((a: any, i: number) => {
      const name = a?.name || `Allegato ${i + 1}`;
      const line = a?.url ? `${name} - ${a.url}` : name;
      sections.push(para(line));
    });
  }

  const sumSpese = (arr?: any[]) => Array.isArray(arr) ? arr.reduce((s, x) => s + ((Number(x?.costo) || 0) * (Number(x?.quantita) || 0)), 0) : 0;
  const totaleAtt = sumSpese(req?.spese_attrezzature);
  const totaleServ = sumSpese(req?.spese_servizi);
  const generali = (Number(req?.spese_generali?.siae) || 0) + (Number(req?.spese_generali?.assicurazione) || 0) + (Number(req?.spese_generali?.rimborsoSpese) || 0);
  const totale = totaleAtt + totaleServ + generali;

  sections.push(sectionHeading("Budget"));
  if (Array.isArray(req?.spese_attrezzature) && req.spese_attrezzature.length) {
    sections.push(para(`Attrezzature - Totale: ${currency(totaleAtt)}`));
    req.spese_attrezzature.forEach((s: any) => sections.push(para(`  • ${s?.descrizione} x${s?.quantita} = ${currency((Number(s?.costo) || 0) * (Number(s?.quantita) || 0))}`)));
  }
  if (Array.isArray(req?.spese_servizi) && req.spese_servizi.length) {
    sections.push(para(`Servizi - Totale: ${currency(totaleServ)}`));
    req.spese_servizi.forEach((s: any) => sections.push(para(`  • ${s?.descrizione} x${s?.quantita} = ${currency((Number(s?.costo) || 0) * (Number(s?.quantita) || 0))}`)));
  }
  if (req?.spese_generali) {
    if (req.spese_generali.siae) sections.push(para(`SIAE: ${currency(Number(req.spese_generali.siae))}`));
    if (req.spese_generali.assicurazione) sections.push(para(`Assicurazione: ${currency(Number(req.spese_generali.assicurazione))}`));
    if (req.spese_generali.rimborsoSpese) sections.push(para(`Rimborso Spese: ${currency(Number(req.spese_generali.rimborsoSpese))}`));
  }
  sections.push(para(`Totale complessivo: ${currency(totale)}`, true));

  if (req?.valutazione) {
    sections.push(sectionHeading("Valutazione"));
    if (req.valutazione.stato) sections.push(para(`Stato: ${req.valutazione.stato}`));
    const score = req.valutazione.punteggio_totale ?? req.valutazione.punteggio;
    if (score != null) sections.push(para(`Punteggio: ${score}`));
    if (req.valutazione.criteri) {
      const c = req.valutazione.criteri;
      sections.push(para(`Criteri:`));
      if (typeof c.cantierabilita === 'number') sections.push(para(`  • Cantierabilità: ${c.cantierabilita}`));
      if (typeof c.sostenibilita === 'number') sections.push(para(`  • Sostenibilità: ${c.sostenibilita}`));
      if (typeof c.risposta_territorio === 'number') sections.push(para(`  • Risposta al territorio: ${c.risposta_territorio}`));
      if (typeof c.coinvolgimento_giovani === 'number') sections.push(para(`  • Coinvolgimento giovani: ${c.coinvolgimento_giovani}`));
      if (typeof c.promozione_territorio === 'number') sections.push(para(`  • Promozione del territorio: ${c.promozione_territorio}`));
    }
    if (req.valutazione.note_valutatore) sections.push(para(`Note: ${req.valutazione.note_valutatore}`));
    if (req.valutazione.data_valutazione) sections.push(para(`Data valutazione: ${fmtDate(req.valutazione.data_valutazione)}`));
    if (req.valutazione.valutatore) sections.push(para(`Valutatore: ${req.valutazione.valutatore}`));
  }

  const doc = new Document({ sections: [{ children: sections }] });
  const blob = await Packer.toBlob(doc);
  const filename = `${(req?.titolo_progetto || 'progetto').replace(/[^a-z0-9_-]+/gi, '-')}.docx`;
  downloadBlob(blob, filename);
}
