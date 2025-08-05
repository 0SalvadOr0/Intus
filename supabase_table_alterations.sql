-- ========================================
-- SUPABASE TABLE ALTERATION QUERIES
-- ========================================
-- 
-- Run these queries in your Supabase SQL editor to add the new fields
-- to support the updated Call Idee Giovani form
--
-- Execute in order to avoid dependency issues
--

-- 1. Add new columns to call_idee_giovani table
ALTER TABLE call_idee_giovani 
ADD COLUMN IF NOT EXISTS coprogramma JSONB,
ADD COLUMN IF NOT EXISTS autorizzazioni TEXT,
ADD COLUMN IF NOT EXISTS referente_codice_fiscale VARCHAR(16),
ADD COLUMN IF NOT EXISTS descrizione_gruppo TEXT,
ADD COLUMN IF NOT EXISTS figure_supporto JSONB;

-- 2. Update existing partecipanti structure to include codice_fiscale
-- Note: This will preserve existing data while allowing new entries to have the codice_fiscale field
-- No direct alteration needed since partecipanti is already JSONB

-- 3. Add comments to new columns for documentation
COMMENT ON COLUMN call_idee_giovani.coprogramma IS 'Array of activities with attivita, descrizione, mesi fields';
COMMENT ON COLUMN call_idee_giovani.autorizzazioni IS 'Optional field for project authorizations and permits';
COMMENT ON COLUMN call_idee_giovani.referente_codice_fiscale IS 'Tax code of the project reference person';
COMMENT ON COLUMN call_idee_giovani.descrizione_gruppo IS 'Description of the group: who they are, passions, previous collaborations';
COMMENT ON COLUMN call_idee_giovani.figure_supporto IS 'Array of voluntary support figures with personal information';

-- 4. Create indexes for better query performance on new searchable fields
CREATE INDEX IF NOT EXISTS idx_call_idee_referente_codice_fiscale 
ON call_idee_giovani (referente_codice_fiscale);

CREATE INDEX IF NOT EXISTS idx_call_idee_descrizione_gruppo 
ON call_idee_giovani USING gin(to_tsvector('italian', descrizione_gruppo));

CREATE INDEX IF NOT EXISTS idx_call_idee_autorizzazioni 
ON call_idee_giovani USING gin(to_tsvector('italian', autorizzazioni));

-- 5. Add GIN indexes for JSONB fields for efficient querying
CREATE INDEX IF NOT EXISTS idx_call_idee_coprogramma 
ON call_idee_giovani USING gin(coprogramma);

CREATE INDEX IF NOT EXISTS idx_call_idee_figure_supporto 
ON call_idee_giovani USING gin(figure_supporto);

-- 6. Optional: Create a view that includes computed fields for easier querying
CREATE OR REPLACE VIEW v_call_idee_giovani_extended AS
SELECT 
    *,
    CASE 
        WHEN coprogramma IS NOT NULL 
        THEN jsonb_array_length(coprogramma) 
        ELSE 0 
    END as num_attivita_coprogramma,
    CASE 
        WHEN figure_supporto IS NOT NULL 
        THEN jsonb_array_length(figure_supporto) 
        ELSE 0 
    END as num_figure_supporto,
    CASE 
        WHEN partecipanti IS NOT NULL 
        THEN jsonb_array_length(partecipanti) 
        ELSE 0 
    END as num_partecipanti_effettivi
FROM call_idee_giovani;

-- 7. Add RLS (Row Level Security) policies if needed
-- Uncomment if you want to add security policies
/*
ALTER TABLE call_idee_giovani ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all records
CREATE POLICY "Admin can view all call_idee_giovani" ON call_idee_giovani
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

-- Allow authenticated users to insert their own records
CREATE POLICY "Users can insert call_idee_giovani" ON call_idee_giovani
    FOR INSERT WITH CHECK (true);
*/

-- 8. Optional: Create a function to validate codice_fiscale format
CREATE OR REPLACE FUNCTION validate_codice_fiscale(cf TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Basic Italian Codice Fiscale validation (16 alphanumeric characters)
    RETURN cf ~ '^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$';
END;
$$ LANGUAGE plpgsql;

-- 9. Add check constraint for referente_codice_fiscale validation
ALTER TABLE call_idee_giovani 
ADD CONSTRAINT check_referente_codice_fiscale 
CHECK (
    referente_codice_fiscale IS NULL OR 
    validate_codice_fiscale(UPPER(referente_codice_fiscale))
);

-- 10. Create a function to update evaluation (referenced in the dashboard component)
CREATE OR REPLACE FUNCTION update_evaluation(
    request_id UUID,
    new_score INTEGER,
    new_status TEXT,
    evaluator_notes TEXT,
    evaluator_name TEXT
)
RETURNS VOID AS $$
BEGIN
    UPDATE call_idee_giovani 
    SET valutazione = jsonb_build_object(
        'punteggio', new_score,
        'stato', new_status,
        'note_valutatore', evaluator_notes,
        'data_valutazione', NOW(),
        'valutatore', evaluator_name
    )
    WHERE id = request_id;
END;
$$ LANGUAGE plpgsql;

-- ========================================
-- VERIFICATION QUERIES
-- ========================================
-- Run these to verify the changes were applied correctly

-- Check new columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'call_idee_giovani' 
AND column_name IN (
    'coprogramma', 
    'autorizzazioni', 
    'referente_codice_fiscale', 
    'descrizione_gruppo', 
    'figure_supporto'
);

-- Check indexes were created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'call_idee_giovani' 
AND indexname LIKE 'idx_call_idee_%';

-- Verify the view was created
SELECT viewname 
FROM pg_views 
WHERE viewname = 'v_call_idee_giovani_extended';

-- Test the validation function
SELECT validate_codice_fiscale('RSSMRA80A01H501Z') as valid_cf;
SELECT validate_codice_fiscale('INVALID123') as invalid_cf;

-- ========================================
-- SAMPLE DATA MIGRATION (if needed)
-- ========================================
-- If you have existing records that need default values

-- Set empty arrays for new JSONB fields where NULL
UPDATE call_idee_giovani 
SET 
    coprogramma = '[]'::jsonb
WHERE coprogramma IS NULL;

UPDATE call_idee_giovani 
SET 
    figure_supporto = '[]'::jsonb  
WHERE figure_supporto IS NULL;

-- ========================================
-- BACKUP RECOMMENDATION
-- ========================================
/*
Before running these alterations in production, create a backup:

1. Export current data:
   pg_dump --data-only --table=call_idee_giovani your_database > backup_call_idee_giovani.sql

2. Or create a backup table:
   CREATE TABLE call_idee_giovani_backup AS SELECT * FROM call_idee_giovani;

3. After successful migration, you can drop the backup:
   DROP TABLE call_idee_giovani_backup;
*/

-- ========================================
-- PERFORMANCE NOTES
-- ========================================
/*
The new JSONB columns (coprogramma, figure_supporto) allow flexible storage
but consider these performance implications:

1. JSONB is efficient for read operations and supports indexing
2. For frequently queried nested fields, consider extracting to separate columns
3. The GIN indexes will improve query performance on JSONB fields
4. Monitor query performance and adjust indexes as needed

Example efficient queries:
- SELECT * FROM call_idee_giovani WHERE coprogramma @> '[{"attivita": "Workshop"}]';
- SELECT * FROM call_idee_giovani WHERE figure_supporto ? 'nome';
*/
