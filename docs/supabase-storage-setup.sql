-- Script per configurare correttamente i bucket di storage per immagini
-- Eseguire questo script nel SQL Editor di Supabase

-- 1. Creare i bucket se non esistono
DO $$
BEGIN
    -- Bucket per immagini blog
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'blog-images') THEN
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('blog-images', 'blog-images', true);
    END IF;
    
    -- Bucket per immagini progetti  
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'project-images') THEN
        INSERT INTO storage.buckets (id, name, public) 
        VALUES ('project-images', 'project-images', true);
    END IF;
END $$;

-- 2. Policy per permettere lettura pubblica delle immagini blog
CREATE POLICY IF NOT EXISTS "Public can view blog images"
ON storage.objects FOR SELECT
USING (bucket_id = 'blog-images');

-- 3. Policy per permettere lettura pubblica delle immagini progetti
CREATE POLICY IF NOT EXISTS "Public can view project images"  
ON storage.objects FOR SELECT
USING (bucket_id = 'project-images');

-- 4. Policy per permettere upload delle immagini blog (solo autenticati)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload blog images"
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- 5. Policy per permettere upload delle immagini progetti (solo autenticati)
CREATE POLICY IF NOT EXISTS "Authenticated users can upload project images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- 6. Policy per permettere aggiornamento delle immagini blog (solo autenticati)
CREATE POLICY IF NOT EXISTS "Authenticated users can update blog images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- 7. Policy per permettere aggiornamento delle immagini progetti (solo autenticati)  
CREATE POLICY IF NOT EXISTS "Authenticated users can update project images"
ON storage.objects FOR UPDATE
USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- 8. Policy per permettere eliminazione delle immagini blog (solo autenticati)
CREATE POLICY IF NOT EXISTS "Authenticated users can delete blog images"
ON storage.objects FOR DELETE
USING (bucket_id = 'blog-images' AND auth.role() = 'authenticated');

-- 9. Policy per permettere eliminazione delle immagini progetti (solo autenticati)
CREATE POLICY IF NOT EXISTS "Authenticated users can delete project images"  
ON storage.objects FOR DELETE
USING (bucket_id = 'project-images' AND auth.role() = 'authenticated');

-- Verifica che i bucket siano stati creati correttamente
SELECT 
    name, 
    public,
    created_at,
    updated_at
FROM storage.buckets 
WHERE name IN ('blog-images', 'project-images')
ORDER BY name;

-- Verifica le policy create
SELECT 
    schemaname,
    tablename, 
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'objects' 
AND schemaname = 'storage'
AND policyname LIKE '%blog images%' OR policyname LIKE '%project images%'
ORDER BY policyname;
