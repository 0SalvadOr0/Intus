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
