-- =============================================
-- Script di Setup per Tabella call_idee_giovani
-- Database: Supabase (PostgreSQL)
-- Data: 2024
-- =============================================

-- 1. DROP TABLE SE ESISTE (ATTENZIONE: CANCELLA TUTTI I DATI!)
-- DROP TABLE IF EXISTS call_idee_giovani CASCADE;

-- 2. CREAZIONE TABELLA COMPLETA
CREATE TABLE IF NOT EXISTS call_idee_giovani (
    -- Campi sistema
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- =====================================
    -- INFORMAZIONI PROGETTO
    -- =====================================
    titolo_progetto VARCHAR(255) NOT NULL,
    descrizione_progetto TEXT NOT NULL,
    coprogramma JSONB DEFAULT '[]'::jsonb,
    data_inizio DATE NOT NULL,
    data_fine DATE NOT NULL,
    autorizzazioni TEXT,
    
    -- =====================================
    -- INFORMAZIONI REFERENTE
    -- =====================================
    referente_nome VARCHAR(100) NOT NULL,
    referente_cognome VARCHAR(100) NOT NULL,
    referente_email VARCHAR(255) NOT NULL,
    referente_telefono VARCHAR(50) NOT NULL,
    referente_data_nascita DATE NOT NULL,
    referente_codice_fiscale VARCHAR(16),
    
    -- =====================================
    -- INFORMAZIONI GRUPPO
    -- =====================================
    numero_partecipanti VARCHAR(10) NOT NULL,
    descrizione_gruppo TEXT,
    partecipanti JSONB NOT NULL DEFAULT '[]'::jsonb,
    figure_supporto JSONB DEFAULT '[]'::jsonb,
    
    -- =====================================
    -- DETTAGLI EVENTO
    -- =====================================
    luogo_svolgimento VARCHAR(255) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    categoria_descrizione TEXT NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL,
    descrizione_evento TEXT NOT NULL,
    altro TEXT,
    
    -- =====================================
    -- FILE E SPESE
    -- =====================================
    allegati JSONB DEFAULT '[]'::jsonb,
    spese_attrezzature JSONB DEFAULT '[]'::jsonb,
    spese_servizi JSONB DEFAULT '[]'::jsonb,
    spese_generali JSONB DEFAULT '{}'::jsonb,
    
    -- =====================================
    -- VALUTAZIONE
    -- =====================================
    valutazione JSONB DEFAULT NULL,
    
    -- =====================================
    -- VINCOLI
    -- =====================================
    CONSTRAINT valid_email CHECK (referente_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_dates CHECK (data_fine >= data_inizio),
    CONSTRAINT valid_cf CHECK (referente_codice_fiscale IS NULL OR LENGTH(referente_codice_fiscale) = 16)
);

-- 3. CREAZIONE INDICI PER PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_call_idee_created_at ON call_idee_giovani(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_call_idee_referente_email ON call_idee_giovani(referente_email);
CREATE INDEX IF NOT EXISTS idx_call_idee_categoria ON call_idee_giovani(categoria);
CREATE INDEX IF NOT EXISTS idx_call_idee_titolo ON call_idee_giovani USING gin(to_tsvector('italian', titolo_progetto));

-- 4. TRIGGER PER UPDATED_AT AUTOMATICO
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_call_idee_giovani_updated_at 
    BEFORE UPDATE ON call_idee_giovani 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. COMMENTI PER DOCUMENTAZIONE
COMMENT ON TABLE call_idee_giovani IS 'Tabella per le candidature del Call di Idee Giovani per le comunità locali';
COMMENT ON COLUMN call_idee_giovani.coprogramma IS 'Array JSON con informazioni sui coprogrammi';
COMMENT ON COLUMN call_idee_giovani.partecipanti IS 'Array JSON con elenco partecipanti';
COMMENT ON COLUMN call_idee_giovani.figure_supporto IS 'Array JSON con figure di supporto';
COMMENT ON COLUMN call_idee_giovani.allegati IS 'Array JSON con URL e nomi dei file allegati';
COMMENT ON COLUMN call_idee_giovani.spese_attrezzature IS 'Array JSON con spese per attrezzature';
COMMENT ON COLUMN call_idee_giovani.spese_servizi IS 'Array JSON con spese per servizi';
COMMENT ON COLUMN call_idee_giovani.spese_generali IS 'Oggetto JSON con spese generali (SIAE, assicurazione, rimborsi)';
COMMENT ON COLUMN call_idee_giovani.valutazione IS 'Oggetto JSON con valutazione completa del progetto';

-- =============================================
-- QUERY DI VERIFICA
-- =============================================

-- Verifica creazione tabella
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'call_idee_giovani' 
ORDER BY ordinal_position;

-- Verifica indici
SELECT 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename = 'call_idee_giovani';

-- =============================================
-- ESEMPI DI UTILIZZO
-- =============================================

-- Esempio inserimento base (per test)
/*
INSERT INTO call_idee_giovani (
    titolo_progetto,
    descrizione_progetto,
    data_inizio,
    data_fine,
    referente_nome,
    referente_cognome,
    referente_email,
    referente_telefono,
    referente_data_nascita,
    numero_partecipanti,
    luogo_svolgimento,
    categoria,
    categoria_descrizione,
    tipo_evento,
    descrizione_evento,
    partecipanti
) VALUES (
    'Progetto Test',
    'Descrizione del progetto di test',
    '2024-06-01',
    '2024-06-30',
    'Mario',
    'Rossi',
    'mario.rossi@example.com',
    '+39 123 456 7890',
    '1990-01-01',
    '10-15',
    'Roma',
    'Educazione',
    'Progetto educativo per giovani',
    'Workshop',
    'Workshop di formazione per giovani',
    '[{"nome":"Mario Rossi","eta":"25","ruolo":"Coordinatore"}]'::jsonb
);
*/

-- Query per recuperare tutte le candidature
/*
SELECT 
    id,
    titolo_progetto,
    referente_nome,
    referente_cognome,
    categoria,
    created_at,
    valutazione->>'stato' as stato_valutazione
FROM call_idee_giovani 
ORDER BY created_at DESC;
*/

-- =============================================
-- FINE SCRIPT
-- =============================================
