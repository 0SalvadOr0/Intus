import { useState, useEffect } from "react";

interface CinemaIntroProps {
  onComplete: () => void;
}

// Mock AnimatedIntusLogo component
const AnimatedIntusLogo = ({ className }: { className?: string }) => (
  <div className={`${className} flex items-center justify-center`}>
    <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
      INTUS
    </div>
  </div>
);

const CinemaIntro = ({ onComplete }: CinemaIntroProps) => {
  const [step, setStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),   // 🎥 Camera slide in
      setTimeout(() => setStep(2), 1000),  // ✨ Power on effects
      setTimeout(() => setStep(3), 1800),  // 💡 Light beam activation
      setTimeout(() => setStep(4), 2800),  // 🌟 Logo emergence
      setTimeout(() => setStep(5), 4200),  // 🎭 Full reveal
      setTimeout(() => setStep(6), 5500),  // 📱 UI elements
      setTimeout(() => setStep(7), 7000),  // 🌅 Fade transition
      setTimeout(() => {
        setIsVisible(false);
        onComplete();
      }, 8000)
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center overflow-hidden">
      
      {/* 🌌 Background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* 🎬 Professional Cinema Camera */}
      <div className={`absolute left-1/2 transform -translate-x-1/2 transition-all duration-1500 ease-out ${
        step >= 1 ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-75 translate-y-20'
      }`}>
        <div className="relative">
          
          {/* 📷 Main Camera Body */}
          <div className="relative">
            <div className="w-40 h-24 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-xl shadow-2xl border border-gray-600 relative overflow-hidden">
              
              {/* ⚡ Power indicator */}
              <div className={`absolute top-3 left-3 w-3 h-3 rounded-full transition-all duration-500 ${
                step >= 2 ? 'bg-green-400 shadow-lg shadow-green-400/50 animate-pulse' : 'bg-gray-600'
              }`} />
              
              {/* 🔴 Recording indicator */}
              <div className={`absolute top-3 right-3 w-4 h-4 rounded-full transition-all duration-700 ${
                step >= 2 ? 'bg-red-500 shadow-lg shadow-red-500/50 animate-pulse' : 'bg-gray-700'
              }`} />
              
              {/* 🏷️ Brand label */}
              <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 font-bold tracking-wider">
                INTUS CORLEONE APS
              </div>
              
              {/* 🎛️ Control details */}
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 space-y-1">
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
                <div className="w-2 h-2 bg-gray-500 rounded-full" />
              </div>
              
              {/* 🌟 Lens assembly */}
              <div className="absolute -right-8 top-1/2 transform -translate-y-1/2">
                <div className="relative">
                  {/* Outer lens ring */}
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-full shadow-xl border-2 border-gray-600">
                    {/* Inner lens */}
                    <div className="absolute inset-2 bg-gradient-to-br from-blue-900/40 via-purple-900/30 to-black rounded-full flex items-center justify-center">
                      {/* Lens center */}
                      <div className="w-10 h-10 bg-gradient-to-br from-black via-gray-900 to-black rounded-full relative overflow-hidden">
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
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/20 to-transparent rounded-full blur-md animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 🎞️ Film reel animation */}
          <div className={`absolute -top-12 -left-6 transition-all duration-1000 ${
            step >= 2 ? 'opacity-100 animate-spin-slow' : 'opacity-0'
          }`}>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full relative shadow-lg">
              <div className="absolute inset-2 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full">
                <div className="absolute inset-4 bg-black rounded-full" />
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-4 bg-amber-800 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                      transformOrigin: 'center',
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateY(-16px)`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✨ Professional Light Beam System */}
      <div className={`absolute left-1/2 top-1/2 transform -translate-y-1/2 transition-all duration-2000 ease-out ${
        step >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-0'
      }`}>
        
        {/* 🌈 Primary light cone */}
        <div className="relative ml-12">
          <svg width="500" height="200" className="absolute -translate-y-1/2">
            <defs>
              <linearGradient id="lightGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.6)" />
                <stop offset="50%" stopColor="rgba(255,255,255,0.3)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <polygon 
              points="0,100 450,40 450,160" 
              fill="url(#lightGradient)" 
              filter="url(#glow)"
              className="animate-pulse"
            />
          </svg>
          
          {/* 💫 Light particles */}
          <div className="absolute top-1/2 left-10 transform -translate-y-1/2 w-96 h-32">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-80 animate-float"
                style={{
                  left: `${Math.random() * 380}px`,
                  top: `${20 + Math.random() * 80}px`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
          
          {/* 🔥 Intense core beam */}
          <svg width="500" height="200" className="absolute -translate-y-1/2">
            <polygon 
              points="0,100 420,70 420,130" 
              fill="rgba(255,255,255,0.8)" 
              className="animate-pulse"
            />
          </svg>
        </div>
      </div>

      {/* 🎭 Logo Emergence Theater */}
      <div className={`absolute right-16 top-1/2 transform -translate-y-1/2 transition-all duration-2500 ease-out ${
        step >= 4 ? 'opacity-100 scale-100 translate-x-0' : 'opacity-0 scale-50 translate-x-32'
      }`}>
        <div className="relative">
          
          {/* 🌟 Epic glow backdrop */}
          <div className={`absolute -inset-20 transition-all duration-1500 ${
            step >= 5 ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
          }`}>
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute inset-4 bg-gradient-to-r from-cyan-400/15 via-blue-500/15 to-purple-600/15 rounded-full blur-2xl animate-pulse-slow" />
          </div>
          
          {/* 🚀 Main logo presentation */}
          <div className={`relative z-10 transition-all duration-2000 ${
            step >= 5 ? 'scale-100 opacity-100' : 'scale-80 opacity-70'
          }`}>
            <AnimatedIntusLogo className="w-80 h-auto" />
          </div>

          {/* ✨ Premium sparkle effects */}
          {step >= 5 && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce-in opacity-70"
                  style={{
                    left: `${Math.random() * 320}px`,
                    top: `${Math.random() * 200}px`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${1 + Math.random() * 2}s`
                  }}
                >
                  <svg width="8" height="8" viewBox="0 0 24 24" fill="none">
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

      {/* 🎪 Brand Theater Text */}
      <div className={`absolute bottom-24 left-1/2 transform -translate-x-1/2 transition-all duration-1500 ${
        step >= 6 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}>
        <div className="text-center space-y-3">
          <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
            Benvenuto in INTUS Corleone
          </div>
          <div className="text-base text-gray-300 flex items-center justify-center space-x-3">
            <span className="opacity-80">Proiettando il futuro dal</span>
            <span className={`font-bold text-2xl bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent transition-all duration-1000 ${
              step >= 6 ? 'animate-bounce-in scale-100 opacity-100' : 'scale-75 opacity-0'
            }`} style={{animationDelay: '0.8s'}}>
              1997
            </span>
          </div>
        </div>
      </div>

      {/* 🎬 Professional UI Elements */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
        step >= 6 && step < 7 ? 'opacity-100' : 'opacity-0'
      }`}>
        
        {/* 📊 Loading progress */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2">
          <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-load-bar" />
          </div>
        </div>
        
        {/* 🎵 Audio visualizer */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <div className="flex items-end space-x-1">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${15 + Math.random() * 40}px`,
                  animationDelay: `${i * 0.15}s`,
                  animationDuration: `${0.6 + Math.random() * 0.8}s`
                }}
              />
            ))}
          </div>
        </div>
        
        {/* 🎯 Focus indicator */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <div className="w-16 h-16 border-2 border-white/30 rounded-full relative animate-spin-slow">
            <div className="absolute inset-2 border border-white/50 rounded-full" />
            <div className="absolute inset-4 bg-white/20 rounded-full animate-pulse" />
          </div>
        </div>
      </div>

      {/* 🌅 Elegant fade transition */}
      <div className={`absolute inset-0 bg-gradient-to-br from-black via-transparent to-black transition-opacity duration-2000 ${
        step >= 7 ? 'opacity-100' : 'opacity-0'
      } pointer-events-none`} />

      {/* Custom styles */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-10px) rotate(1deg); }
          66% { transform: translateY(5px) rotate(-1deg); }
        }
        
        @keyframes bounce-in {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 0.8; }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        
        @keyframes load-bar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce-in { animation: bounce-in 2s ease-out; }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-pulse-slow { animation: pulse-slow 3s ease-in-out infinite; }
        .animate-load-bar { animation: load-bar 3s ease-out; }
        .animate-pulse-glow { animation: pulse-slow 2s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default CinemaIntro;