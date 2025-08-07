import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect, lazy, Suspense } from "react";
import { useAnalytics } from "@/hooks/use-analytics";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

import Navigation from "./components/navigation";
import { WelcomeToast } from "./components/ui/welcome-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import CinemaIntro from "./components/CinemaIntro";
import SmoothLoadingScreen from "./components/SmoothLoadingScreen";
import Home from "./pages/Home";
const ChiSiamo = lazy(() => import("./pages/ChiSiamo"));
const LeNostreAttivita = lazy(() => import("./pages/LeNostreAttivita"));
const PresentaProgetto = lazy(() => import("./pages/PresentaProgetto"));
const Blog = lazy(() => import("./pages/Blog"));
const ArchivioDocumenti = lazy(() => import("./pages/ArchivioDocumenti"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const Contatti = lazy(() => import("./pages/Contatti"));
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProjectViewer from "./components/ProjectViewer";
import Footer from "./components/Footer";
import CookieConsent from "./components/CookieConsent";

const queryClient = new QueryClient();

const App = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    const introShown = sessionStorage.getItem("introShown");
    if (!introShown) {
      setShowIntro(true);
    } else {
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem("introShown", "true");
    setShowIntro(false);
    setIntroComplete(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <WelcomeToast />

          {showIntro && <CinemaIntro onComplete={handleIntroComplete} />}

          <div
            className={`transition-opacity duration-1000 ${
              introComplete ? "opacity-100" : "opacity-0"
            }`}
          >
            <BrowserRouter>
              <ScrollToTop />
              <Navigation />
              <Suspense  fallback={<SmoothLoadingScreen  isVisible={true} message="Caricamento pagina" />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/chi-siamo" element={<ChiSiamo />} />
                  <Route path="/le-nostre-attivita" element={<LeNostreAttivita />} />
                  <Route path="/progetto/:id" element={<ProjectViewer />} />
                  <Route path="/presenta-progetto" element={<PresentaProgetto />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/archivio-documenti" element={<ArchivioDocumenti />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/contatti" element={<Contatti />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requireAdmin={true}>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
              <Footer />
            </BrowserRouter>
            <CookieConsent />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
