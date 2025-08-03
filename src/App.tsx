import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

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
import Home from "./pages/Home";
import ChiSiamo from "./pages/ChiSiamo";
import LeNostreAttivita from "./pages/LeNostreAttivita";
import PresentaProgetto from "./pages/PresentaProgetto";
import Blog from "./pages/Blog";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ProjectViewer from "./components/ProjectViewer";

const queryClient = new QueryClient();

const App = () => {
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  useEffect(() => {
    // Check if intro has been shown in this session
    const introShown = sessionStorage.getItem('introShown');
    if (!introShown) {
      setShowIntro(true);
    } else {
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('introShown', 'true');
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

          {/* Cinema Intro */}
          {showIntro && <CinemaIntro onComplete={handleIntroComplete} />}

          {/* Main App */}
          <div className={`transition-opacity duration-1000 ${introComplete ? 'opacity-100' : 'opacity-0'}`}>
            <BrowserRouter>
              <ScrollToTop />
              <Navigation />
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chi-siamo" element={<ChiSiamo />} />
                <Route path="/le-nostre-attivita" element={<LeNostreAttivita />} />
                <Route path="/progetto/:id" element={<ProjectViewer />} />
                <Route path="/presenta-progetto" element={<PresentaProgetto />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/dashboard" element={
                  <ProtectedRoute requireAdmin={true}>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
