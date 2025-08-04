import { useState, useEffect } from "react";
import { AnimatedIntusLogo } from "@/components/ui/animated-intus-logo";

interface SmoothLoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

const SmoothLoadingScreen = ({ isVisible, message = "Caricamento in corso..." }: SmoothLoadingScreenProps) => {
  const [dots, setDots] = useState("");
  const [showLogo, setShowLogo] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShowLogo(true);
      
      // Animated dots
      const interval = setInterval(() => {
        setDots(prev => {
          if (prev === "...") return "";
          return prev + ".";
        });
      }, 500);

      return () => clearInterval(interval);
    } else {
      setShowLogo(false);
      setDots("");
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-background via-background/95 to-background backdrop-blur-sm">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full animate-float" style={{animationDelay: '0s', animationDuration: '4s'}}></div>
        <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-accent/20 rounded-full animate-float" style={{animationDelay: '1s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-heart/20 rounded-full animate-float" style={{animationDelay: '2s', animationDuration: '3.5s'}}></div>
        <div className="absolute bottom-1/4 right-1/3 w-28 h-28 bg-primary/10 rounded-full animate-float" style={{animationDelay: '0.5s', animationDuration: '4.5s'}}></div>
      </div>

      {/* Content container */}
      <div className="relative z-10 text-center">
        {/* Logo with smooth entrance */}
        <div className={`mb-8 transition-all duration-800 ease-out transform ${
          showLogo ? 'scale-100 opacity-100 translate-y-0' : 'scale-75 opacity-0 translate-y-8'
        }`}>
          <div className="relative inline-block">
            <AnimatedIntusLogo className="w-48 h-auto md:w-64 animate-pulse-glow" />
            
            {/* Glow effect */}
            <div className="absolute -inset-8 bg-gradient-to-r from-primary/20 via-accent/20 to-heart/20 rounded-full blur-2xl animate-pulse opacity-60"></div>
            
            {/* Rotating border */}
            <div className="absolute -inset-4 border-2 border-transparent bg-gradient-to-r from-primary via-accent to-heart bg-clip-border opacity-30 rounded-full animate-spin-slow"></div>
          </div>
        </div>

        {/* Loading text with typing effect */}
        <div className={`transition-all duration-500 delay-300 ${
          showLogo ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-heart bg-clip-text text-transparent">
              {message}
            </span>
            <span className="text-primary animate-pulse ml-1">{dots}</span>
          </h2>

          {/* Progress bar */}
          <div className="w-64 h-1 bg-muted/30 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary via-accent to-heart rounded-full animate-gradient-shift bg-[length:200%_200%]"></div>
          </div>

          {/* Subtle hint text */}
          <p className="text-sm text-muted-foreground mt-6 animate-fade-in" style={{animationDelay: '1s'}}>
            Preparando un'esperienza straordinaria
          </p>
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 bg-primary/40 rounded-full animate-float opacity-60`}
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${3 + i * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SmoothLoadingScreen;
