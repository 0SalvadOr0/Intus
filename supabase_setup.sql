-- ==========================================
-- SETUP SUPABASE PER SISTEMA VALUTAZIONI
-- ==========================================

-- 1. VERIFICA STRUTTURA TABELLA call_idee_giovani
-- La tabella dovrebbe già esistere con il campo valutazione di tipo JSONB

-- Se la tabella non ha il campo valutazione, aggiungerlo:
-- ALTER TABLE call_idee_giovani ADD COLUMN IF NOT EXISTS valutazione JSONB;

-- 2. INDICI PER PERFORMANCE
-- Crea indici per migliorare le performance delle query sulle valutazioni
CREATE INDEX IF NOT EXISTS idx_call_idee_valutazione_stato 
ON call_idee_giovani USING gin ((valutazione->>'stato'));

CREATE INDEX IF NOT EXISTS idx_call_idee_valutazione_punteggio 
ON call_idee_giovani USING btree (((valutazione->>'punteggio')::numeric));

CREATE INDEX IF NOT EXISTS idx_call_idee_created_at 
ON call_idee_giovani (created_at DESC);

-- 3. POLICY RLS (Row Level Security)
-- Assicurati che RLS sia abilitato
ALTER TABLE call_idee_giovani ENABLE ROW LEVEL SECURITY;

-- Policy per la lettura: gli admin possono leggere tutto
CREATE POLICY "Admin can read all call_idee_giovani" ON call_idee_giovani
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.email IN (
                'admin@intus.it',
                'amministratore@intus.it'
                -- Aggiungi qui altri email degli amministratori
            )
        )
    );

-- Policy per l'aggiornamento delle valutazioni: solo admin
CREATE POLICY "Admin can update evaluations" ON call_idee_giovani
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid()
            AND auth.users.email IN (
                'admin@intus.it',
                'amministratore@intus.it'
                -- Aggiungi qui altri email degli amministratori
            )
        )
    );

-- Policy per l'inserimento: tutti possono inserire richieste
CREATE POLICY "Anyone can insert call_idee_giovani" ON call_idee_giovani
    FOR INSERT WITH CHECK (true);

-- Policy per lettura pubblica delle richieste approvate (opzionale)
CREATE POLICY "Public can read approved requests" ON call_idee_giovani
    FOR SELECT USING (
        (valutazione->>'stato') = 'approvato'
    );

-- 4. FUNZIONI HELPER PER LE VALUTAZIONI

-- Funzione per ottenere statistiche valutazioni
CREATE OR REPLACE FUNCTION get_evaluation_stats()
RETURNS TABLE (
    total_requests bigint,
    pending_requests bigint,
    in_evaluation_requests bigint,
    approved_requests bigint,
    rejected_requests bigint,
    average_score numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_requests,
        COUNT(*) FILTER (WHERE valutazione IS NULL OR valutazione->>'stato' = 'in_attesa') as pending_requests,
        COUNT(*) FILTER (WHERE valutazione->>'stato' = 'in_valutazione') as in_evaluation_requests,
        COUNT(*) FILTER (WHERE valutazione->>'stato' = 'approvato') as approved_requests,
        COUNT(*) FILTER (WHERE valutazione->>'stato' = 'rifiutato') as rejected_requests,
        AVG((valutazione->>'punteggio')::numeric) FILTER (WHERE valutazione->>'punteggio' IS NOT NULL) as average_score
    FROM call_idee_giovani;
END;
$$;

-- Funzione per aggiornare una valutazione
CREATE OR REPLACE FUNCTION update_evaluation(
    request_id TEXT,
    new_score INTEGER,
    new_status TEXT,
    evaluator_notes TEXT,
    evaluator_name TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    evaluation_data JSONB;
BEGIN
    -- Verifica che l'utente sia un admin
    IF NOT EXISTS (
        SELECT 1 FROM auth.users 
        WHERE auth.users.id = auth.uid()
        AND auth.users.email IN (
            'admin@intus.it',
            'amministratore@intus.it'
        )
    ) THEN
        RAISE EXCEPTION 'Access denied: Only administrators can update evaluations';
    END IF;

    -- Costruisci l'oggetto valutazione
    evaluation_data := jsonb_build_object(
        'punteggio', new_score,
        'stato', new_status,
        'note_valutatore', evaluator_notes,
        'data_valutazione', NOW()::text,
        'valutatore', evaluator_name
    );

    -- Aggiorna la richiesta
    UPDATE call_idee_giovani 
    SET valutazione = evaluation_data,
        updated_at = NOW()
    WHERE id = request_id;

    -- Verifica che l'aggiornamento sia avvenuto
    IF FOUND THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$;

-- 5. TRIGGER PER AUDIT LOG (opzionale)
-- Crea tabella per tenere traccia delle modifiche alle valutazioni
CREATE TABLE IF NOT EXISTS evaluation_audit_log (
    id BIGSERIAL PRIMARY KEY,
    request_id TEXT NOT NULL,
    old_evaluation JSONB,
    new_evaluation JSONB,
    changed_by UUID REFERENCES auth.users(id),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Funzione trigger per l'audit log
CREATE OR REPLACE FUNCTION log_evaluation_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Log solo se la valutazione è cambiata
    IF OLD.valutazione IS DISTINCT FROM NEW.valutazione THEN
        INSERT INTO evaluation_audit_log (
            request_id,
            old_evaluation,
            new_evaluation,
            changed_by
        ) VALUES (
            NEW.id,
            OLD.valutazione,
            NEW.valutazione,
            auth.uid()
        );
    END IF;
    
    RETURN NEW;
END;
$$;

-- Crea il trigger
DROP TRIGGER IF EXISTS evaluation_audit_trigger ON call_idee_giovani;
CREATE TRIGGER evaluation_audit_trigger
    AFTER UPDATE ON call_idee_giovani
    FOR EACH ROW
    EXECUTE FUNCTION log_evaluation_changes();

-- 6. VIEW PER REPORTING
-- Vista per report delle valutazioni
CREATE OR REPLACE VIEW evaluation_report AS
SELECT 
    id,
    titolo_progetto,
    categoria,
    referente_nome,
    referente_cognome,
    referente_email,
    numero_partecipanti,
    created_at,
    valutazione->>'punteggio' as punteggio,
    valutazione->>'stato' as stato_valutazione,
    valutazione->>'note_valutatore' as note_valutatore,
    valutazione->>'data_valutazione' as data_valutazione,
    valutazione->>'valutatore' as valutatore,
    -- Calcola costo totale
    COALESCE(
        (
            SELECT SUM((item->>'costo')::numeric * (item->>'quantita')::numeric)
            FROM jsonb_array_elements(spese_attrezzature) item
        ), 0
    ) + COALESCE(
        (
            SELECT SUM((item->>'costo')::numeric * (item->>'quantita')::numeric)
            FROM jsonb_array_elements(spese_servizi) item
        ), 0
    ) + COALESCE((spese_generali->>'siae')::numeric, 0) 
      + COALESCE((spese_generali->>'assicurazione')::numeric, 0) 
      + COALESCE((spese_generali->>'rimborsoSpese')::numeric, 0) as costo_totale
FROM call_idee_giovani
ORDER BY created_at DESC;

-- 7. PERMESSI PER LE FUNZIONI
-- Concedi permessi di esecuzione agli admin autenticati
GRANT EXECUTE ON FUNCTION get_evaluation_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION update_evaluation(TEXT, INTEGER, TEXT, TEXT, TEXT) TO authenticated;

-- Concedi accesso alla vista di reporting
GRANT SELECT ON evaluation_report TO authenticated;
GRANT SELECT ON evaluation_audit_log TO authenticated;

-- ==========================================
-- FINE SETUP
-- ==========================================

-- NOTA: Assicurati di aggiornare gli indirizzi email degli amministratori 
-- nelle policy con quelli effettivamente utilizzati nel tuo sistema.

-- Per testare il setup, puoi usare:
-- SELECT * FROM get_evaluation_stats();
-- SELECT * FROM evaluation_report WHERE stato_valutazione IS NOT NULL;
