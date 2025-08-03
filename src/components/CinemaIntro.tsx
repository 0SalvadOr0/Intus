import { useState, useEffect } from "react";
import { AnimatedIntusLogo } from "@/components/ui/animated-intus-logo";

interface CinemaIntroProps {
  onComplete: () => void;
}

const CinemaIntro = ({ onComplete }: CinemaIntroProps) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 500);   // Camera appears
    const timer2 = setTimeout(() => setStep(2), 1500);  // Light starts
    const timer3 = setTimeout(() => setStep(3), 2500);  // Logo emerges
    const timer4 = setTimeout(() => setStep(4), 4500);  // Logo fully visible
    const timer5 = setTimeout(() => setStep(5), 6000);  // Start fade out
    const timer6 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 7000); // Complete

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center overflow-hidden">
      {/* Cinepresa */}
      <div className={`absolute transition-all duration-1000 ease-out ${
        step >= 1 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
      }`}>
        <div className="relative">
          {/* Camera Body */}
          <div className="relative">
            {/* Main camera body */}
            <div className="w-32 h-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg shadow-2xl relative">
              {/* Camera details */}
              <div className="absolute top-2 left-2 w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded-full shadow-lg animate-pulse" />
              <div className="absolute top-2 right-2 w-3 h-3 bg-gradient-to-br from-green-400 to-green-500 rounded-full shadow-lg" />
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 font-bold">INTUS</div>
              
              {/* Lens */}
              <div className="absolute -right-6 top-1/2 transform -translate-y-1/2">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-900 via-black to-gray-800 rounded-full shadow-xl border-4 border-gray-600">
                  <div className="w-full h-full bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-full flex items-center justify-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-800 to-black rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Light Beam */}
          <div className={`absolute -right-20 top-1/2 transform -translate-y-1/2 transition-all duration-2000 ease-out ${
            step >= 2 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
          }`}>
            {/* Main light cone */}
            <div 
              className="relative"
              style={{
                width: '0',
                height: '0',
                borderTop: '60px solid transparent',
                borderBottom: '60px solid transparent',
                borderLeft: '300px solid rgba(255, 255, 255, 0.1)',
                filter: 'blur(2px)'
              }}
            />
            
            {/* Intense center beam */}
            <div 
              className="absolute top-1/2 left-0 transform -translate-y-1/2"
              style={{
                width: '0',
                height: '0',
                borderTop: '20px solid transparent',
                borderBottom: '20px solid transparent',
                borderLeft: '280px solid rgba(255, 255, 255, 0.3)',
                filter: 'blur(1px)'
              }}
            />

            {/* Core light */}
            <div 
              className="absolute top-1/2 left-0 transform -translate-y-1/2"
              style={{
                width: '0',
                height: '0',
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '260px solid rgba(255, 255, 255, 0.6)',
              }}
            />

            {/* Particles in light */}
            <div className="absolute top-1/2 left-10 transform -translate-y-1/2 w-60 h-16">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white rounded-full animate-float opacity-60"
                  style={{
                    left: `${Math.random() * 240}px`,
                    top: `${Math.random() * 64}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>
          </div>

          {/* Film strip animation */}
          <div className={`absolute -top-8 -left-4 transition-all duration-1000 ${
            step >= 2 ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="w-40 h-6 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 rounded-sm relative overflow-hidden">
              {/* Film holes */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute top-1 w-2 h-2 bg-black rounded-full"
                  style={{ left: `${i * 6 + 4}px` }}
                />
              ))}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute bottom-1 w-2 h-2 bg-black rounded-full"
                  style={{ left: `${i * 6 + 4}px` }}
                />
              ))}
              
              {/* Moving film effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-slide-infinite"
                style={{ animationDuration: '1s' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Logo emerging from light */}
      <div className={`absolute right-20 transition-all duration-2000 ease-out ${
        step >= 3 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-50 translate-x-20'
      }`}>
        <div className="relative">
          {/* Glow effect behind logo */}
          <div className={`absolute inset-0 transition-all duration-1000 ${
            step >= 4 ? 'opacity-100' : 'opacity-0'
          }`}>
            <div className="absolute -inset-20 bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-full blur-3xl animate-pulse" />
            <div className="absolute -inset-10 bg-gradient-to-r from-primary/20 via-accent/20 to-heart/20 rounded-full blur-2xl animate-pulse-glow" />
          </div>
          
          {/* Main logo */}
          <div className={`relative z-10 transition-all duration-1500 ${
            step >= 4 ? 'scale-100 opacity-100' : 'scale-75 opacity-70'
          }`}>
            <AnimatedIntusLogo className="w-80 h-auto" />
          </div>

          {/* Sparkles around logo */}
          {step >= 4 && (
            <div className="absolute inset-0">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-gradient-to-r from-primary to-accent rounded-full animate-bounce-in opacity-80"
                  style={{
                    left: `${Math.random() * 320}px`,
                    top: `${Math.random() * 200}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${1 + Math.random()}s`
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Cinema text */}
      <div className={`absolute bottom-20 left-1/2 transform -translate-x-1/2 transition-all duration-1000 ${
        step >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
      }`}>
        <div className="text-white text-center">
          <div className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary via-accent to-heart bg-clip-text text-transparent">
            Benvenuto in INTUS Corleone
          </div>
          <div className="text-sm text-white/70 animate-pulse">
            Proiettando il futuro dal 1997
          </div>
        </div>
      </div>

      {/* Fade out overlay */}
      <div className={`absolute inset-0 bg-black transition-opacity duration-1000 ${
        step >= 5 ? 'opacity-100' : 'opacity-0'
      } pointer-events-none`} />

      {/* Loading dots */}
      <div className={`absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
        step >= 2 && step < 5 ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full animate-pulse"
              style={{
                animationDelay: `${i * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      {/* Sound wave effect */}
      <div className={`absolute left-10 top-1/2 transform -translate-y-1/2 transition-all duration-1000 ${
        step >= 2 ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="flex items-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-1 bg-gradient-to-t from-primary to-accent rounded-full animate-pulse"
              style={{
                height: `${10 + Math.random() * 30}px`,
                animationDelay: `${i * 0.1}s`,
                animationDuration: `${0.5 + Math.random() * 0.5}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default CinemaIntro;
