-- Modifiche alla tabella 'progetti' per supportare i nuovi campi

-- 1. Aggiungere campo per ruolo di Intus
ALTER TABLE progetti ADD COLUMN ruolo_intus TEXT;

-- 2. Aggiungere campi per partecipanti (ora come testo invece di numeri)
ALTER TABLE progetti ADD COLUMN partecipanti_diretti TEXT;
ALTER TABLE progetti ADD COLUMN partecipanti_indiretti TEXT;

-- 3. Aggiungere campo per ente finanziatore
ALTER TABLE progetti ADD COLUMN ente_finanziatore TEXT;

-- 4. Modificare il campo partner per supportare il flag capofila
-- Nota: Se hai già dati nel campo partner, assicurati di fare un backup prima
-- Il campo partner dovrebbe essere un JSON array con struttura:
-- [{"nome": "Partner Name", "link": "optional_url", "capofila": true/false}]

-- 5. Aggiungere supporto per multiple YouTube URLs
-- Rinominare il campo esistente e aggiungere un nuovo campo array
ALTER TABLE progetti RENAME COLUMN youtube_url TO youtube_url_old;
ALTER TABLE progetti ADD COLUMN youtube_urls TEXT[]; -- Array di URLs YouTube

-- 6. (Opzionale) Migrare i dati esistenti
-- UPDATE progetti SET youtube_urls = ARRAY[youtube_url_old] WHERE youtube_url_old IS NOT NULL AND youtube_url_old != '';

-- 7. (Opzionale) Rimuovere il vecchio campo dopo la migrazione
-- ALTER TABLE progetti DROP COLUMN youtube_url_old;

-- Esempio di struttura finale della tabella progetti:
/*
progetti:
- id (existing)
- titolo (existing)
- descrizione_breve (existing)
- contenuto (existing)
- categoria (existing)
- luoghi (existing)
- numero_partecipanti (existing - mantenuto per compatibilità)
- immagini (existing)
- immagine_copertina (existing)
- status (existing)
- data_inizio (existing)
- created_at (existing)
- pubblicato (existing)
- partner (existing - JSON array con capofila flag)
- ruolo_intus (NEW - TEXT)
- partecipanti_diretti (NEW - TEXT)
- partecipanti_indiretti (NEW - TEXT)
- ente_finanziatore (NEW - TEXT)
- youtube_urls (NEW - TEXT[])
*/
