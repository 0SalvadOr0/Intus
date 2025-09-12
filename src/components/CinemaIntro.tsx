import { useState, useEffect, useCallback, useMemo } from "react";

interface CinemaIntroProps {
  onComplete: () => void;
}

// 🎯 Optimized AnimatedIntusLogo with memoization
const AnimatedIntusLogo = ({ className }: { className?: string }) => (
  <div className={`${className} flex flex-col items-center justify-center`}>
    <div className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56">  
  <img src="/files/logos/logo_cuore.png" alt="Intus Corleone APS - Associazione di Promozione Sociale Logo" className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 lg:w-48 lg:h-48 object-contain animate-pulse-heart" />
    </div>
    <p className="text-white text-center mt-2 sm:mt-4 text-sm sm:text-base md:text-lg font-semibold tracking-wide">
      INTUS Corleone APS
    </p>
  </div>
);

// 🌟 Memoized particle component for better performance
const ParticleField = ({ count, step }: { count: number; step: number }) => {
  const particles = useMemo(() => 
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 3 + Math.random() * 4
    })), [count]
  );

  return (
    <div className="absolute inset-0 overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full opacity-20 animate-pulse"
          style={{
            left: `${particle.left}%`,
            top: `${particle.top}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
            transform: step >= 1 ? 'translateY(0)' : 'translateY(20px)'
          }}
        />
      ))}
    </div>
  );
};

// 🎪 Professional Camera Component
const CinemaCamera = ({ step }: { step: number }) => (
  <div className={`transform transition-all duration-1500 ease-out ${
    step >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-20'
  }`}>
    <div className="relative">
      {/* 📷 Main Camera Body - Responsive sizing */}
      <div className="relative">
        <div className="w-24 h-16 sm:w-32 sm:h-20 md:w-40 md:h-24 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-lg sm:rounded-xl shadow-2xl border border-gray-600 relative overflow-hidden">
          
          {/* ⚡ Power indicator */}
          <div className={`absolute top-2 left-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-500 ${
            step >= 2 ? 'bg-green-400 shadow-lg shadow-green-400/50' : 'bg-gray-600'
          } ${step >= 2 ? 'animate-pulse' : ''}`} />
          
          {/* 🔴 Recording indicator */}
          <div className={`absolute top-2 right-2 w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-700 ${
            step >= 2 ? 'bg-red-500 shadow-lg shadow-red-500/50' : 'bg-gray-700'
          } ${step >= 2 ? 'animate-pulse' : ''}`} />
          
          {/* 🏷️ Brand label */}
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 font-bold tracking-wider">
            Presentiamo
          </div>
          
          {/* 🌟 Lens assembly - Responsive positioning */}
          <div className="absolute -right-6 sm:-right-8 top-1/2 transform -translate-y-1/2">
            <div className="relative">
              {/* Outer lens ring */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-full shadow-xl border-2 border-gray-600">
                {/* Inner lens */}
                <div className="absolute inset-1 sm:inset-2 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black rounded-full flex items-center justify-center">
                  {/* Lens center */}
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 bg-gradient-to-br from-black via-gray-900 to-black rounded-full relative overflow-hidden">
                    {/* Lens reflection */}
                    <div className={`absolute inset-0 bg-gradient-to-tr from-transparent to-white/10 transition-opacity duration-1000 ${
                      step >= 2 ? 'opacity-100' : 'opacity-0'
                    }`} />
                  </div>
                </div>
              </div>
              
              {/* Lens flare effect */}
              <div className={`absolute inset-0 transition-all duration-1000 ${
                step >= 3 ? 'opacity-100 scale-150' : 'opacity-0 scale-100'
              }`}>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent rounded-full blur-sm sm:blur-md animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 🎞️ Film reel animation - Responsive size */}
      <div className={`absolute -top-8 sm:-top-12 -left-4 sm:-left-6 transition-all duration-1000 ${
        step >= 2 ? 'opacity-100' : 'opacity-0'
      } ${step >= 2 ? 'animate-spin' : ''}`} 
      style={{ animationDuration: '4s' }}>
        <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full relative shadow-lg">
          <div className="absolute inset-1 sm:inset-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full">
            <div className="absolute inset-2 sm:inset-4 bg-black rounded-full" />
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-2 sm:w-1 sm:h-3 md:h-4 bg-amber-800 rounded-full"
                style={{
                  left: '50%',
                  top: '50%',
                  transformOrigin: 'center',
                  transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-${8 + (window.innerWidth > 640 ? 8 : 4)}px)`
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 💡 Light Beam System - Optimized for mobile
const LightBeamSystem = ({ step }: { step: number }) => {
  const beamWidth = window.innerWidth < 640 ? 200 : window.innerWidth < 768 ? 300 : 400;
  const beamHeight = window.innerWidth < 640 ? 80 : window.innerWidth < 768 ? 120 : 160;

  return (
    <div className={`absolute left-1/2 top-1/2 transform -translate-y-1/2 transition-all duration-2000 ease-out ${
      step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
    }`}>
      
      {/* 🌈 Primary light cone - Responsive SVG */}
      <div className="relative ml-6 sm:ml-8 md:ml-12">
        <svg width={beamWidth} height={beamHeight} className="absolute -translate-y-1/2">
          <defs>
            <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
              <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
            </linearGradient>
          </defs>
          <polygon 
            points={`0,${beamHeight/2} ${beamWidth-50},${beamHeight*0.25} ${beamWidth-50},${beamHeight*0.75}`}
            fill="url(#lightGradient)" 
            className="animate-pulse"
          />
        </svg>
        
        {/* 💫 Light particles - Reduced for mobile */}
        <div className={`absolute top-1/2 left-6 transform -translate-y-1/2 transition-opacity duration-1000 ${
          step >= 3 ? 'opacity-100' : 'opacity-0'
        }`} style={{ width: beamWidth - 100, height: beamHeight - 40 }}>
          {Array.from({ length: window.innerWidth < 640 ? 8 : 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 sm:w-1 sm:h-1 bg-white rounded-full opacity-80 animate-pulse"
              style={{
                left: `${Math.random() * (beamWidth - 120)}px`,
                top: `${10 + Math.random() * (beamHeight - 60)}px`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// 🎭 Main Cinema Intro Component
const CinemaIntro = ({ onComplete }: CinemaIntroProps) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // 📱 Responsive detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // ⏰ Optimized timing sequence
  const timingSequence = useMemo(() => 
    isMobile 
      ? [200, 800, 1400, 2200, 3200, 4000, 5000, 6000] // Faster for mobile
      : [300, 1000, 1800, 2800, 4200, 5500, 7000, 8000] // Desktop timing
  , [isMobile]);

  const handleAnimationComplete = useCallback(() => {
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  useEffect(() => {
    const timers = timingSequence.map((delay, index) => 
      setTimeout(() => {
        if (index === timingSequence.length - 1) {
          handleAnimationComplete();
        } else {
          setStep(index + 1);
        }
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, [timingSequence, handleAnimationComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      
      {/* 🌌 Background particles - Reduced for performance */}
      <ParticleField count={isMobile ? 20 : 40} step={step} />

      {/* 🎬 Cinema Camera Section */}
      <div className="absolute left-4 sm:left-8 md:left-1/4 top-1/2 transform -translate-y-1/2">
        <CinemaCamera step={step} />
      </div>

      {/* ✨ Professional Light Beam System */}
      <LightBeamSystem step={step} />

      {/* 🎭 Logo Emergence Theater */}
      <div className={`absolute right-4 sm:right-8 md:right-16 top-1/2 transform -translate-y-1/2 transition-all duration-2500 ease-out ${
        step >= 4 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-50 translate-x-8 sm:translate-x-16 md:translate-x-32'
      }`}>
        <div className="relative">
          
          {/* 🌟 Epic glow backdrop */}
          <div className={`absolute -inset-8 sm:-inset-12 md:-inset-20 transition-all duration-1500 ${
            step >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-xl sm:blur-2xl md:blur-3xl animate-pulse" />
            <div className="absolute inset-2 sm:inset-4 bg-gradient-to-r from-cyan-400/15 via-blue-500/15 to-purple-600/15 rounded-full blur-lg sm:blur-xl md:blur-2xl" 
                 style={{ animationDuration: '4s' }} />
          </div>
          
          {/* 🚀 Main logo presentation */}
          <div className={`relative z-10 transition-all duration-2000 ${
            step >= 5 ? 'scale-100 opacity-100' : 'scale-80 opacity-70'
          }`}>
            <AnimatedIntusLogo className="w-32 sm:w-48 md:w-64 lg:w-80 h-auto" />
          </div>

          {/* ✨ Premium sparkle effects - Reduced for mobile */}
          {step >= 5 && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: isMobile ? 10 : 15 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce opacity-70"
                  style={{
                    left: `${Math.random() * (isMobile ? 128 : 256)}px`,
                    top: `${Math.random() * (isMobile ? 100 : 160)}px`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                >
                  <svg width={isMobile ? "6" : "8"} height={isMobile ? "6" : "8"} viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L14.09 8.26L20 10L14.09 11.74L12 18L9.91 11.74L4 10L9.91 8.26L12 2Z" 
                          fill="currentColor" 
                          className="text-yellow-400" />
                  </svg>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🎪 Brand Theater Text - Responsive typography */}
      <div className={`absolute bottom-12 sm:bottom-16 md:bottom-24 left-1/2 transform -translate-x-1/2 transition-all duration-1500 px-4 ${
        step >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center space-y-2 sm:space-y-3">
          <div className="text-lg sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Benvenuto in INTUS Corleone
          </div>
          <div className="text-sm sm:text-base text-gray-300 flex flex-col sm:flex-row items-center justify-center sm:space-x-3 space-y-1 sm:space-y-0">
            <span className="opacity-80">Proiettando il futuro dal</span>
            <span className={`font-bold text-xl sm:text-2xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent transition-all duration-1000 ${
              step >= 6 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'
            } animate-bounce`} style={{animationDelay: '0.8s', animationDuration: '2s'}}>
              1997
            </span>
          </div>
        </div>
      </div>

      {/* 🎬 Professional UI Elements - Simplified for mobile */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
        step >= 6 && step < 7 ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* 📊 Loading progress */}
        <div className="absolute bottom-6 sm:bottom-8 md:bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-48 sm:w-56 md:w-64 h-0.5 sm:h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse" 
                 style={{ animation: 'load-bar 3s ease-out' }} />
          </div>
        </div>
        
        {/* 🎵 Audio visualizer - Only on larger screens */}
        {!isMobile && (
          <div className="absolute left-4 sm:left-8 top-1/2 transform -translate-y-1/2">
            <div className="flex items-end space-x-1">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="w-0.5 sm:w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full animate-pulse"
                  style={{
                    height: `${10 + Math.random() * 30}px`,
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: `${0.6 + Math.random() * 0.8}s`
                  }}
                />
              ))}
            </div>
          </div>
        )}
        
        {/* 🎯 Focus indicator - Only on larger screens */}
        {!isMobile && (
          <div className="absolute right-4 sm:right-8 top-1/2 transform -translate-y-1/2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-white/30 rounded-full relative animate-spin" 
                 style={{ animationDuration: '8s' }}>
              <div className="absolute inset-2 border border-white/50 rounded-full" />
              <div className="absolute inset-4 bg-white/20 rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* 🌅 Elegant fade transition */}
      <div className={`absolute inset-0 bg-gradient-to-br from-black via-transparent to-black transition-opacity duration-2000 ${
        step >= 7 ? 'opacity-100' : 'opacity-0'
      } pointer-events-none`} />
    </div>
  );
};

export default CinemaIntro;