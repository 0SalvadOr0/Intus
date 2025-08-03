import { useState, useEffect, useRef } from "react";

interface ParallaxGlitchTextProps {
  className?: string;
}

const ParallaxGlitchText = ({ className = "" }: ParallaxGlitchTextProps) => {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredLine, setHoveredLine] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const textLines = [
    {
      text: 'Fondata nel ',
      highlight: '1997',
      rest: ' durante la "Primavera Corleonese", promuove la ',
      keyword1: 'legalità',
      rest2: ', i ',
      keyword2: 'diritti umani',
      rest3: ' e la ',
      keyword3: 'cittadinanza attiva',
      end: '.'
    },
    {
      text: "L'associazione forma educatori e sostiene progetti giovanili, sociali ed ecologici a livello locale ed europeo. È attiva nel ",
      keyword1: 'turismo responsabile',
      rest: ' e nella valorizzazione della ',
      keyword2: 'memoria antimafia',
      end: ' attraverso l\'arte.'
    }
  ];

  const getParallaxOffset = (lineIndex: number) => {
    const baseSpeed = 0.1;
    const speed = baseSpeed * (lineIndex + 1) * 0.3;
    return scrollY * speed;
  };

  const getGlitchStyle = (lineIndex: number) => {
    const isHovered = hoveredLine === lineIndex;
    if (!isHovered) return {};

    return {
      textShadow: `
        ${Math.random() * 2 - 1}px ${Math.random() * 2 - 1}px 0 #ff00ff,
        ${Math.random() * 2 - 1}px ${Math.random() * 2 - 1}px 0 #00ffff,
        ${Math.random() * 2 - 1}px ${Math.random() * 2 - 1}px 0 #ffff00
      `,
      transform: `translateX(${Math.random() * 4 - 2}px) translateY(${Math.random() * 2 - 1}px)`,
      filter: 'blur(0.5px)',
    };
  };

  const backgroundLinesStyle = {
    transform: `translateX(${-mousePos.x * 0.02}px) translateY(${-mousePos.y * 0.01}px)`,
    opacity: mousePos.x > 0 ? 0.1 : 0,
  };

  return (
    <div 
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
    >
      {/* Interactive background pattern */}
      <div 
        className="absolute inset-0 pointer-events-none transition-all duration-300"
        style={backgroundLinesStyle}
      >
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
            style={{
              top: `${i * 5}%`,
              left: '0%',
              right: '0%',
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 space-y-8">
        {textLines.map((line, lineIndex) => (
          <div
            key={lineIndex}
            className="text-xl md:text-2xl lg:text-3xl leading-relaxed transition-all duration-500 cursor-default"
            style={{
              transform: `translateY(${getParallaxOffset(lineIndex)}px)`,
              ...getGlitchStyle(lineIndex)
            }}
            onMouseEnter={() => setHoveredLine(lineIndex)}
            onMouseLeave={() => setHoveredLine(null)}
          >
            <span 
              className={`transition-all duration-700 ${
                hoveredLine === lineIndex 
                  ? 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 bg-clip-text text-transparent'
                  : 'text-muted-foreground'
              }`}
            >
              {lineIndex === 0 ? (
                <>
                  {line.text}
                  <span className={`font-bold px-3 py-1 rounded-lg transition-all duration-500 ${
                    hoveredLine === lineIndex 
                      ? 'bg-gradient-to-r from-primary/30 to-accent/30 text-primary animate-pulse scale-110'
                      : 'text-primary bg-primary/10'
                  }`}>
                    {line.highlight}
                  </span>
                  {line.rest}
                  <span className={`font-bold px-2 py-1 rounded-lg transition-all duration-500 ${
                    hoveredLine === lineIndex 
                      ? 'bg-gradient-to-r from-accent/30 to-heart/30 scale-105'
                      : 'text-accent bg-accent/10'
                  }`}>
                    {line.keyword1}
                  </span>
                  {line.rest2}
                  <span className={`font-bold transition-all duration-500 ${
                    hoveredLine === lineIndex 
                      ? 'text-primary scale-105'
                      : 'text-primary'
                  }`}>
                    {line.keyword2}
                  </span>
                  {line.rest3}
                  <span className={`font-bold px-2 py-1 rounded-lg transition-all duration-500 ${
                    hoveredLine === lineIndex 
                      ? 'bg-gradient-to-r from-heart/30 to-primary/30 scale-105'
                      : 'text-heart bg-heart/10'
                  }`}>
                    {line.keyword3}
                  </span>
                  {line.end}
                </>
              ) : (
                <>
                  {line.text}
                  <span className={`font-bold transition-all duration-500 ${
                    hoveredLine === lineIndex 
                      ? 'text-primary scale-105'
                      : 'text-primary'
                  }`}>
                    {line.keyword1}
                  </span>
                  {line.rest}
                  <span className={`font-bold transition-all duration-500 ${
                    hoveredLine === lineIndex 
                      ? 'text-accent scale-105'
                      : 'text-accent'
                  }`}>
                    {line.keyword2}
                  </span>
                  {line.end}
                </>
              )}
            </span>

            {/* Glitch overlay effect */}
            {hoveredLine === lineIndex && (
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"
                  style={{
                    animationDuration: '0.3s',
                    transform: `translateX(${Math.random() * 100}px)`,
                  }}
                />
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-full bg-gradient-to-r from-cyan-400 to-magenta-400 opacity-20 animate-pulse"
                    style={{
                      left: `${Math.random() * 100}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.2s',
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Ambient light effect */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
          transition: 'background 0.3s ease-out',
        }}
      />
    </div>
  );
};

export default ParallaxGlitchText;
