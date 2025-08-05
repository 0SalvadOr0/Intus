-- SQL Queries for New Evaluation System
-- Execute these queries in your Supabase SQL editor

-- =====================================================
-- 1. UPDATE EXISTING VALUTAZIONE STRUCTURE (Optional)
-- =====================================================
-- Note: The current implementation is backward compatible.
-- Existing records with "punteggio" (1-10) will still work.
-- New evaluations will use "punteggio_totale" (0-100) and "criteri" object.

-- No schema changes are needed as we're using JSONB for the valutazione field
-- which allows flexible structure updates.

-- =====================================================
-- 2. QUERY TO GET ALL PROJECTS WITH NEW EVALUATION
-- =====================================================
SELECT 
    id,
    titolo_progetto,
    referente_nome,
    referente_cognome,
    categoria,
    valutazione,
    created_at,
    -- Extract new scoring system values
    COALESCE(
        (valutazione->>'punteggio_totale')::int, 
        (valutazione->>'punteggio')::int
    ) as total_score,
    valutazione->>'stato' as status,
    -- Extract individual criteria scores
    (valutazione->'criteri'->>'cantierabilita')::int as cantierabilita,
    (valutazione->'criteri'->>'sostenibilita')::int as sostenibilita,
    (valutazione->'criteri'->>'risposta_territorio')::int as risposta_territorio,
    (valutazione->'criteri'->>'coinvolgimento_giovani')::int as coinvolgimento_giovani,
    (valutazione->'criteri'->>'promozione_territorio')::int as promozione_territorio
FROM call_idee_giovani
WHERE valutazione IS NOT NULL
ORDER BY 
    COALESCE(
        (valutazione->>'punteggio_totale')::int, 
        (valutazione->>'punteggio')::int
    ) DESC NULLS LAST;

-- =====================================================
-- 3. QUERY TO GET TOP 10 RANKED PROJECTS
-- =====================================================
SELECT 
    id,
    titolo_progetto,
    referente_nome,
    referente_cognome,
    categoria,
    COALESCE(
        (valutazione->>'punteggio_totale')::int, 
        (valutazione->>'punteggio')::int
    ) as total_score,
    valutazione->>'stato' as status,
    created_at
FROM call_idee_giovani
WHERE valutazione IS NOT NULL 
    AND (
        (valutazione->>'punteggio_totale')::int > 0 
        OR 
        (valutazione->>'punteggio')::int > 0
    )
ORDER BY 
    COALESCE(
        (valutazione->>'punteggio_totale')::int, 
        (valutazione->>'punteggio')::int
    ) DESC
LIMIT 10;

-- =====================================================
-- 4. EVALUATION STATISTICS WITH NEW SYSTEM
-- =====================================================
SELECT 
    COUNT(*) as total_requests,
    COUNT(CASE WHEN valutazione IS NULL OR valutazione->>'stato' = 'in_attesa' THEN 1 END) as pending_requests,
    COUNT(CASE WHEN valutazione->>'stato' = 'in_valutazione' THEN 1 END) as in_evaluation_requests,
    COUNT(CASE WHEN valutazione->>'stato' = 'approvato' THEN 1 END) as approved_requests,
    COUNT(CASE WHEN valutazione->>'stato' = 'rifiutato' THEN 1 END) as rejected_requests,
    -- Average score (normalized to percentage)
    AVG(
        CASE 
            WHEN (valutazione->>'punteggio_totale')::int IS NOT NULL THEN 
                (valutazione->>'punteggio_totale')::int 
            WHEN (valutazione->>'punteggio')::int IS NOT NULL THEN 
                (valutazione->>'punteggio')::int * 10  -- Convert 1-10 to 0-100 scale
            ELSE NULL
        END
    ) as average_score_percentage
FROM call_idee_giovani;

-- =====================================================
-- 5. CRITERIA ANALYSIS QUERY
-- =====================================================
-- Get average scores for each criterion
SELECT 
    AVG((valutazione->'criteri'->>'cantierabilita')::int) as avg_cantierabilita,
    AVG((valutazione->'criteri'->>'sostenibilita')::int) as avg_sostenibilita,
    AVG((valutazione->'criteri'->>'risposta_territorio')::int) as avg_risposta_territorio,
    AVG((valutazione->'criteri'->>'coinvolgimento_giovani')::int) as avg_coinvolgimento_giovani,
    AVG((valutazione->'criteri'->>'promozione_territorio')::int) as avg_promozione_territorio,
    COUNT(*) as evaluations_with_criteria
FROM call_idee_giovani
WHERE valutazione->'criteri' IS NOT NULL;

-- =====================================================
-- 6. UPDATE FUNCTION TO MIGRATE OLD SCORES (Optional)
-- =====================================================
-- If you want to migrate old 1-10 scores to the new system structure
-- This is optional and only if you want to normalize all scores

UPDATE call_idee_giovani 
SET valutazione = valutazione || jsonb_build_object(
    'punteggio_totale', (valutazione->>'punteggio')::int * 10,
    'criteri', jsonb_build_object(
        'cantierabilita', FLOOR(RANDOM() * 21),  -- Random distribution for demo
        'sostenibilita', FLOOR(RANDOM() * 21),
        'risposta_territorio', FLOOR(RANDOM() * 21),
        'coinvolgimento_giovani', FLOOR(RANDOM() * 21),
        'promozione_territorio', FLOOR(RANDOM() * 21)
    )
)
WHERE valutazione IS NOT NULL 
    AND valutazione->>'punteggio' IS NOT NULL 
    AND valutazione->>'punteggio_totale' IS NULL;

-- =====================================================
-- 7. CREATE VIEW FOR EASY EVALUATION ACCESS
-- =====================================================
CREATE OR REPLACE VIEW evaluation_view AS
SELECT 
    id,
    titolo_progetto,
    referente_nome,
    referente_cognome,
    categoria,
    created_at,
    -- Evaluation data
    valutazione->>'stato' as status,
    valutazione->>'valutatore' as evaluator,
    (valutazione->>'data_valutazione')::timestamp as evaluation_date,
    valutazione->>'note_valutatore' as evaluator_notes,
    
    -- Scores (both old and new system)
    (valutazione->>'punteggio')::int as legacy_score,
    (valutazione->>'punteggio_totale')::int as total_score,
    
    -- Individual criteria
    (valutazione->'criteri'->>'cantierabilita')::int as cantierabilita,
    (valutazione->'criteri'->>'sostenibilita')::int as sostenibilita,
    (valutazione->'criteri'->>'risposta_territorio')::int as risposta_territorio,
    (valutazione->'criteri'->>'coinvolgimento_giovani')::int as coinvolgimento_giovani,
    (valutazione->'criteri'->>'promozione_territorio')::int as promozione_territorio,
    
    -- Computed final score (prioritize new system)
    COALESCE(
        (valutazione->>'punteggio_totale')::int, 
        (valutazione->>'punteggio')::int * 10
    ) as final_score,
    
    -- Score category
    CASE 
        WHEN COALESCE(
            (valutazione->>'punteggio_totale')::int, 
            (valutazione->>'punteggio')::int * 10
        ) >= 80 THEN 'Eccellente'
        WHEN COALESCE(
            (valutazione->>'punteggio_totale')::int, 
            (valutazione->>'punteggio')::int * 10
        ) >= 60 THEN 'Buono'
        WHEN COALESCE(
            (valutazione->>'punteggio_totale')::int, 
            (valutazione->>'punteggio')::int * 10
        ) >= 40 THEN 'Sufficiente'
        ELSE 'Insufficiente'
    END as score_category
    
FROM call_idee_giovani
WHERE valutazione IS NOT NULL;

-- =====================================================
-- 8. GET EVALUATION STATISTICS USING THE VIEW
-- =====================================================
SELECT 
    COUNT(*) as total_evaluations,
    COUNT(CASE WHEN status = 'approvato' THEN 1 END) as approved,
    COUNT(CASE WHEN status = 'rifiutato' THEN 1 END) as rejected,
    COUNT(CASE WHEN status = 'in_valutazione' THEN 1 END) as in_evaluation,
    AVG(final_score) as average_score,
    
    -- Score distribution
    COUNT(CASE WHEN score_category = 'Eccellente' THEN 1 END) as eccellente_count,
    COUNT(CASE WHEN score_category = 'Buono' THEN 1 END) as buono_count,
    COUNT(CASE WHEN score_category = 'Sufficiente' THEN 1 END) as sufficiente_count,
    COUNT(CASE WHEN score_category = 'Insufficiente' THEN 1 END) as insufficiente_count
    
FROM evaluation_view;

-- =====================================================
-- 9. RANKING QUERY USING THE VIEW
-- =====================================================
SELECT 
    id,
    titolo_progetto,
    referente_nome,
    referente_cognome,
    categoria,
    final_score,
    score_category,
    status,
    RANK() OVER (ORDER BY final_score DESC) as ranking
FROM evaluation_view
WHERE final_score IS NOT NULL
ORDER BY final_score DESC;

-- =====================================================
-- 10. CREATE RPC FUNCTION FOR DASHBOARD STATS
-- =====================================================
CREATE OR REPLACE FUNCTION get_evaluation_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_requests', COUNT(*),
        'pending_requests', COUNT(CASE WHEN valutazione IS NULL OR valutazione->>'stato' = 'in_attesa' THEN 1 END),
        'in_evaluation_requests', COUNT(CASE WHEN valutazione->>'stato' = 'in_valutazione' THEN 1 END),
        'approved_requests', COUNT(CASE WHEN valutazione->>'stato' = 'approvato' THEN 1 END),
        'rejected_requests', COUNT(CASE WHEN valutazione->>'stato' = 'rifiutato' THEN 1 END),
        'average_score', COALESCE(AVG(
            CASE 
                WHEN (valutazione->>'punteggio_totale')::int IS NOT NULL THEN 
                    (valutazione->>'punteggio_totale')::int 
                WHEN (valutazione->>'punteggio')::int IS NOT NULL THEN 
                    (valutazione->>'punteggio')::int * 10
                ELSE NULL
            END
        ), 0)
    ) INTO result
    FROM call_idee_giovani;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- USAGE EXAMPLES:
-- =====================================================

-- Get evaluation statistics
SELECT * FROM get_evaluation_stats();

-- Get top 5 projects
SELECT * FROM evaluation_view 
WHERE final_score IS NOT NULL 
ORDER BY final_score DESC 
LIMIT 5;

-- Get projects by category ranking
SELECT categoria, 
       COUNT(*) as total_projects,
       AVG(final_score) as avg_score,
       MAX(final_score) as best_score
FROM evaluation_view 
WHERE final_score IS NOT NULL
GROUP BY categoria
ORDER BY avg_score DESC;
