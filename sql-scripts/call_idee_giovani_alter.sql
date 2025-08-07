-- =============================================
-- Script ALTER per aggiornare call_idee_giovani esistente
-- Database: Supabase (PostgreSQL)
-- Data: 2024
-- =============================================

-- IMPORTANTE: Questo script aggiorna una tabella esistente
-- Eseguire le query una alla volta e verificare i risultati

-- =============================================
-- 1. AGGIUNGERE COLONNE MANCANTI
-- =============================================

-- Aggiungere updated_at se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        RAISE NOTICE 'Colonna updated_at aggiunta';
    ELSE
        RAISE NOTICE 'Colonna updated_at già esistente';
    END IF;
END $$;

-- Aggiungere coprogramma se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'coprogramma'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN coprogramma JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonna coprogramma aggiunta';
    ELSE
        RAISE NOTICE 'Colonna coprogramma già esistente';
    END IF;
END $$;

-- Aggiungere autorizzazioni se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'autorizzazioni'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN autorizzazioni TEXT;
        RAISE NOTICE 'Colonna autorizzazioni aggiunta';
    ELSE
        RAISE NOTICE 'Colonna autorizzazioni già esistente';
    END IF;
END $$;

-- Aggiungere referente_codice_fiscale se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'referente_codice_fiscale'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN referente_codice_fiscale VARCHAR(16);
        RAISE NOTICE 'Colonna referente_codice_fiscale aggiunta';
    ELSE
        RAISE NOTICE 'Colonna referente_codice_fiscale già esistente';
    END IF;
END $$;

-- Aggiungere descrizione_gruppo se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'descrizione_gruppo'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN descrizione_gruppo TEXT;
        RAISE NOTICE 'Colonna descrizione_gruppo aggiunta';
    ELSE
        RAISE NOTICE 'Colonna descrizione_gruppo già esistente';
    END IF;
END $$;

-- Aggiungere figure_supporto se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'figure_supporto'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN figure_supporto JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonna figure_supporto aggiunta';
    ELSE
        RAISE NOTICE 'Colonna figure_supporto già esistente';
    END IF;
END $$;

-- Aggiungere altro se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'altro'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN altro TEXT;
        RAISE NOTICE 'Colonna altro aggiunta';
    ELSE
        RAISE NOTICE 'Colonna altro già esistente';
    END IF;
END $$;

-- Aggiungere allegati se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'allegati'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN allegati JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonna allegati aggiunta';
    ELSE
        RAISE NOTICE 'Colonna allegati già esistente';
    END IF;
END $$;

-- Aggiungere spese_attrezzature se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'spese_attrezzature'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN spese_attrezzature JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonna spese_attrezzature aggiunta';
    ELSE
        RAISE NOTICE 'Colonna spese_attrezzature già esistente';
    END IF;
END $$;

-- Aggiungere spese_servizi se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'spese_servizi'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN spese_servizi JSONB DEFAULT '[]'::jsonb;
        RAISE NOTICE 'Colonna spese_servizi aggiunta';
    ELSE
        RAISE NOTICE 'Colonna spese_servizi già esistente';
    END IF;
END $$;

-- Aggiungere spese_generali se non esiste
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'call_idee_giovani' AND column_name = 'spese_generali'
    ) THEN
        ALTER TABLE call_idee_giovani ADD COLUMN spese_generali JSONB DEFAULT '{}'::jsonb;
        RAISE NOTICE 'Colonna spese_generali aggiunta';
    ELSE
        RAISE NOTICE 'Colonna spese_generali già esistente';
    END IF;
END $$;

-- =============================================
-- 2. MODIFICARE TIPI DI COLONNE SE NECESSARIO
-- =============================================

-- Assicurarsi che i campi JSON abbiano valori di default corretti
UPDATE call_idee_giovani SET coprogramma = '[]'::jsonb WHERE coprogramma IS NULL;
UPDATE call_idee_giovani SET figure_supporto = '[]'::jsonb WHERE figure_supporto IS NULL;
UPDATE call_idee_giovani SET allegati = '[]'::jsonb WHERE allegati IS NULL;
UPDATE call_idee_giovani SET spese_attrezzature = '[]'::jsonb WHERE spese_attrezzature IS NULL;
UPDATE call_idee_giovani SET spese_servizi = '[]'::jsonb WHERE spese_servizi IS NULL;
UPDATE call_idee_giovani SET spese_generali = '{}'::jsonb WHERE spese_generali IS NULL;

-- Assicurarsi che partecipanti non sia NULL
UPDATE call_idee_giovani SET partecipanti = '[]'::jsonb WHERE partecipanti IS NULL;

-- =============================================
-- 3. AGGIUNGERE VINCOLI
-- =============================================

-- Vincolo email (solo se non esiste)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'call_idee_giovani' AND constraint_name = 'valid_email'
    ) THEN
        ALTER TABLE call_idee_giovani 
        ADD CONSTRAINT valid_email 
        CHECK (referente_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
        RAISE NOTICE 'Vincolo valid_email aggiunto';
    ELSE
        RAISE NOTICE 'Vincolo valid_email già esistente';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Errore aggiungendo vincolo email: %', SQLERRM;
END $$;

-- Vincolo date (solo se non esiste)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'call_idee_giovani' AND constraint_name = 'valid_dates'
    ) THEN
        ALTER TABLE call_idee_giovani 
        ADD CONSTRAINT valid_dates 
        CHECK (data_fine >= data_inizio);
        RAISE NOTICE 'Vincolo valid_dates aggiunto';
    ELSE
        RAISE NOTICE 'Vincolo valid_dates già esistente';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Errore aggiungendo vincolo date: %', SQLERRM;
END $$;

-- Vincolo codice fiscale (solo se non esiste)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'call_idee_giovani' AND constraint_name = 'valid_cf'
    ) THEN
        ALTER TABLE call_idee_giovani 
        ADD CONSTRAINT valid_cf 
        CHECK (referente_codice_fiscale IS NULL OR LENGTH(referente_codice_fiscale) = 16);
        RAISE NOTICE 'Vincolo valid_cf aggiunto';
    ELSE
        RAISE NOTICE 'Vincolo valid_cf già esistente';
    END IF;
EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Errore aggiungendo vincolo CF: %', SQLERRM;
END $$;

-- =============================================
-- 4. CREARE INDICI
-- =============================================

-- Indice created_at
CREATE INDEX IF NOT EXISTS idx_call_idee_created_at ON call_idee_giovani(created_at DESC);

-- Indice email referente
CREATE INDEX IF NOT EXISTS idx_call_idee_referente_email ON call_idee_giovani(referente_email);

-- Indice categoria
CREATE INDEX IF NOT EXISTS idx_call_idee_categoria ON call_idee_giovani(categoria);

-- Indice ricerca titolo (full-text search)
CREATE INDEX IF NOT EXISTS idx_call_idee_titolo ON call_idee_giovani USING gin(to_tsvector('italian', titolo_progetto));

-- =============================================
-- 5. TRIGGER PER UPDATED_AT
-- =============================================

-- Funzione per updated_at (solo se non esiste)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger per updated_at (drop e ricrea per sicurezza)
DROP TRIGGER IF EXISTS update_call_idee_giovani_updated_at ON call_idee_giovani;
CREATE TRIGGER update_call_idee_giovani_updated_at 
    BEFORE UPDATE ON call_idee_giovani 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 6. AGGIORNARE COMMENTI
-- =============================================

COMMENT ON TABLE call_idee_giovani IS 'Tabella per le candidature del Call di Idee Giovani per le comunità locali - Aggiornata';
COMMENT ON COLUMN call_idee_giovani.coprogramma IS 'Array JSON con informazioni sui coprogrammi';
COMMENT ON COLUMN call_idee_giovani.partecipanti IS 'Array JSON con elenco partecipanti';
COMMENT ON COLUMN call_idee_giovani.figure_supporto IS 'Array JSON con figure di supporto';
COMMENT ON COLUMN call_idee_giovani.allegati IS 'Array JSON con URL e nomi dei file allegati';
COMMENT ON COLUMN call_idee_giovani.spese_attrezzature IS 'Array JSON con spese per attrezzature';
COMMENT ON COLUMN call_idee_giovani.spese_servizi IS 'Array JSON con spese per servizi';
COMMENT ON COLUMN call_idee_giovani.spese_generali IS 'Oggetto JSON con spese generali (SIAE, assicurazione, rimborsi)';
COMMENT ON COLUMN call_idee_giovani.valutazione IS 'Oggetto JSON con valutazione completa del progetto';

-- =============================================
-- 7. VERIFICA FINALE
-- =============================================

-- Mostra struttura aggiornata della tabella
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'call_idee_giovani' 
ORDER BY ordinal_position;

-- Mostra vincoli
SELECT 
    constraint_name, 
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'call_idee_giovani';

-- Mostra indici
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'call_idee_giovani';

-- Conta record esistenti
SELECT COUNT(*) as record_totali FROM call_idee_giovani;

-- =============================================
-- FINE SCRIPT ALTER
-- =============================================

RAISE NOTICE '==============================================';
RAISE NOTICE 'Script ALTER completato per call_idee_giovani';
RAISE NOTICE 'Verifica i risultati sopra riportati';
RAISE NOTICE '==============================================';
