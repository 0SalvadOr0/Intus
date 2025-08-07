-- Tabella per tracciare le visualizzazioni delle pagine
CREATE TABLE page_views (
  id BIGSERIAL PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  session_id TEXT,
  user_id TEXT, -- Se l'utente è loggato
  country TEXT,
  device_type TEXT, -- mobile, desktop, tablet
  browser TEXT,
  os TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indici per migliorare le performance delle query
CREATE INDEX idx_page_views_page_path ON page_views(page_path);
CREATE INDEX idx_page_views_created_at ON page_views(created_at);
CREATE INDEX idx_page_views_session_id ON page_views(session_id);
CREATE INDEX idx_page_views_user_id ON page_views(user_id);

-- Tabella per tracciare sessioni uniche
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  first_visit TIMESTAMPTZ DEFAULT NOW(),
  last_visit TIMESTAMPTZ DEFAULT NOW(),
  page_count INTEGER DEFAULT 1,
  ip_address INET,
  user_agent TEXT,
  country TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT
);

-- Tabella per statistiche giornaliere (per performance)
CREATE TABLE daily_stats (
  date DATE PRIMARY KEY,
  total_views INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  unique_sessions INTEGER DEFAULT 0,
  bounce_rate DECIMAL(5,2),
  avg_session_duration INTERVAL,
  top_pages JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Funzione per aggiornare le statistiche giornaliere
CREATE OR REPLACE FUNCTION update_daily_stats()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO daily_stats (date, total_views, unique_visitors, unique_sessions)
  VALUES (
    DATE(NEW.created_at),
    1,
    1,
    1
  )
  ON CONFLICT (date) 
  DO UPDATE SET 
    total_views = daily_stats.total_views + 1,
    unique_visitors = (
      SELECT COUNT(DISTINCT COALESCE(user_id, session_id))
      FROM page_views 
      WHERE DATE(created_at) = DATE(NEW.created_at)
    ),
    unique_sessions = (
      SELECT COUNT(DISTINCT session_id)
      FROM page_views 
      WHERE DATE(created_at) = DATE(NEW.created_at)
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger per aggiornare automaticamente le statistiche
CREATE TRIGGER trigger_update_daily_stats
  AFTER INSERT ON page_views
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_stats();

-- RLS (Row Level Security) policies se necessario
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Policy per permettere inserimenti anonimi
CREATE POLICY "Allow anonymous inserts" ON page_views
  FOR INSERT TO anon
  WITH CHECK (true);

CREATE POLICY "Allow anonymous inserts" ON sessions
  FOR INSERT TO anon
  WITH CHECK (true);

-- Policy per permettere letture agli admin
CREATE POLICY "Allow admin read" ON page_views
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow admin read" ON sessions
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Allow admin read" ON daily_stats
  FOR SELECT TO authenticated
  USING (true);

-- Viste per query comuni
CREATE VIEW popular_pages AS
SELECT 
  page_path,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visits,
  AVG(EXTRACT(EPOCH FROM (
    SELECT MAX(created_at) - MIN(created_at) 
    FROM page_views pv2 
    WHERE pv2.session_id = page_views.session_id 
    AND pv2.page_path = page_views.page_path
  ))) as avg_time_on_page
FROM page_views 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY page_path
ORDER BY views DESC;

CREATE VIEW visitor_stats AS
SELECT 
  DATE(created_at) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_visitors,
  COUNT(DISTINCT CASE WHEN user_id IS NOT NULL THEN user_id END) as registered_users
FROM page_views 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- View per statistiche real-time
CREATE VIEW realtime_stats AS
SELECT 
  COUNT(*) as total_views_today,
  COUNT(DISTINCT session_id) as unique_visitors_today,
  (
    SELECT COUNT(*) 
    FROM page_views 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
  ) as views_last_hour,
  (
    SELECT COUNT(DISTINCT session_id) 
    FROM page_views 
    WHERE created_at >= NOW() - INTERVAL '1 hour'
  ) as visitors_last_hour
FROM page_views 
WHERE DATE(created_at) = CURRENT_DATE;
