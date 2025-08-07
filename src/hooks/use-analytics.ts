import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';

// Utility functions per rilevare device info
const getDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
    return 'mobile';
  }
  if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
    return 'tablet';
  }
  return 'desktop';
};

const getBrowser = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) return 'Chrome';
  if (userAgent.includes('firefox')) return 'Firefox';
  if (userAgent.includes('safari')) return 'Safari';
  if (userAgent.includes('edge')) return 'Edge';
  if (userAgent.includes('opera')) return 'Opera';
  return 'Unknown';
};

const getOS = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('windows')) return 'Windows';
  if (userAgent.includes('mac')) return 'macOS';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('android')) return 'Android';
  if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
  return 'Unknown';
};

// Genera o recupera session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Interfaccia per i dati di tracking
interface PageViewData {
  page_path: string;
  page_title: string;
  referrer: string;
  user_agent: string;
  session_id: string;
  user_id?: string;
  device_type: string;
  browser: string;
  os: string;
}

// Hook principale per analytics
export const useAnalytics = () => {
  const location = useLocation();
  const previousLocation = useRef<string>('');

  // Funzione per tracciare una page view
  const trackPageView = async (customData?: Partial<PageViewData>) => {
    try {
      const sessionId = getSessionId();
      
      // Dati base della page view
      const pageViewData: PageViewData = {
        page_path: location.pathname + location.search,
        page_title: document.title,
        referrer: document.referrer || '',
        user_agent: navigator.userAgent,
        session_id: sessionId,
        device_type: getDeviceType(),
        browser: getBrowser(),
        os: getOS(),
        ...customData
      };

      // Aggiungi user_id se l'utente è loggato
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        pageViewData.user_id = user.id;
      }

      // Inserisci nel database
      const { error } = await supabase
        .from('page_views')
        .insert([pageViewData]);

      if (error) {
        console.error('Errore nel tracking page view:', error);
      }

      // Aggiorna o crea sessione
      await updateSession(sessionId, pageViewData);

    } catch (error) {
      console.error('Errore nel tracking analytics:', error);
    }
  };

  // Funzione per aggiornare la sessione
  const updateSession = async (sessionId: string, pageViewData: PageViewData) => {
    try {
      // Verifica se la sessione esiste già
      const { data: existingSession } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (existingSession) {
        // Aggiorna sessione esistente
        const { error } = await supabase
          .from('sessions')
          .update({
            last_visit: new Date().toISOString(),
            page_count: existingSession.page_count + 1
          })
          .eq('id', sessionId);

        if (error) {
          console.error('Errore aggiornamento sessione:', error);
        }
      } else {
        // Crea nuova sessione
        const { error } = await supabase
          .from('sessions')
          .insert([{
            id: sessionId,
            first_visit: new Date().toISOString(),
            last_visit: new Date().toISOString(),
            page_count: 1,
            user_agent: pageViewData.user_agent,
            device_type: pageViewData.device_type,
            browser: pageViewData.browser,
            os: pageViewData.os
          }]);

        if (error) {
          console.error('Errore creazione sessione:', error);
        }
      }
    } catch (error) {
      console.error('Errore gestione sessione:', error);
    }
  };

  // Traccia automaticamente i cambi di pagina
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Evita di tracciare la stessa pagina due volte consecutive
    if (currentPath !== previousLocation.current) {
      // Piccolo delay per assicurarsi che il title sia aggiornato
      setTimeout(() => {
        trackPageView();
      }, 100);
      
      previousLocation.current = currentPath;
    }
  }, [location]);

  // Funzione per tracciare eventi custom
  const trackEvent = async (eventName: string, eventData?: Record<string, any>) => {
    try {
      const sessionId = getSessionId();
      
      const { data: { user } } = await supabase.auth.getUser();
      
      // Inserisci evento come page_view con dati custom
      const { error } = await supabase
        .from('page_views')
        .insert([{
          page_path: `event:${eventName}`,
          page_title: eventName,
          referrer: location.pathname,
          user_agent: navigator.userAgent,
          session_id: sessionId,
          user_id: user?.id,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          // Eventualmente potresti aggiungere una colonna event_data JSONB
        }]);

      if (error) {
        console.error('Errore nel tracking evento:', error);
      }
    } catch (error) {
      console.error('Errore nel tracking evento:', error);
    }
  };

  return {
    trackPageView,
    trackEvent
  };
};

// Hook per ottenere statistiche analytics
export const useAnalyticsStats = () => {
  // Funzione per ottenere statistiche generali
  const getGeneralStats = async () => {
    try {
      const { data, error } = await supabase
        .from('realtime_stats')
        .select('*')
        .single();

      if (error) {
        console.error('Errore nel recupero stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Errore nel recupero statistiche:', error);
      return null;
    }
  };

  // Funzione per ottenere pagine più popolari
  const getPopularPages = async (limit: number = 10) => {
    try {
      const { data, error } = await supabase
        .from('popular_pages')
        .select('*')
        .limit(limit);

      if (error) {
        console.error('Errore nel recupero pagine popolari:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero pagine popolari:', error);
      return [];
    }
  };

  // Funzione per ottenere statistiche per periodo
  const getVisitorStats = async (days: number = 30) => {
    try {
      const { data, error } = await supabase
        .from('visitor_stats')
        .select('*')
        .limit(days);

      if (error) {
        console.error('Errore nel recupero visitor stats:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Errore nel recupero visitor stats:', error);
      return [];
    }
  };

  // Funzione per ottenere totale visualizzazioni (per backward compatibility)
  const getTotalViews = async () => {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('id', { count: 'exact', head: true });

      if (error) {
        console.error('Errore nel conteggio visualizzazioni:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Errore nel conteggio visualizzazioni:', error);
      return 0;
    }
  };

  return {
    getGeneralStats,
    getPopularPages,
    getVisitorStats,
    getTotalViews
  };
};

// Hook per statistiche real-time
export const useRealTimeAnalytics = () => {
  // Funzione per ottenere utenti online ora
  const getActiveUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('page_views')
        .select('session_id')
        .gte('created_at', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Ultimi 5 minuti
        .distinct();

      if (error) {
        console.error('Errore nel recupero utenti attivi:', error);
        return 0;
      }

      return data?.length || 0;
    } catch (error) {
      console.error('Errore nel recupero utenti attivi:', error);
      return 0;
    }
  };

  return {
    getActiveUsers
  };
};
