import { useState, useEffect } from "react";

interface ComicTextBubbleProps {
  className?: string;
}

const ComicTextBubble = ({ className = "" }: ComicTextBubbleProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {/* Comic background effects */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Comic dots pattern */}
        <div className="absolute inset-0 opacity-20" 
             style={{
               backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
               backgroundSize: '16px 16px'
             }}>
        </div>
        
        {/* Action lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-primary/30 to-transparent transform -rotate-12"></div>
        <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-accent/30 to-transparent transform rotate-12"></div>
      </div>

      {/* Main speech bubble */}
      <div className={`relative bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-2xl border-2 border-black dark:border-white transition-all duration-1000 transform${
        isVisible ? 'scale-100 opacity-100 rotate-0' : 'scale-95 opacity-0 rotate-1'
      }`}>
        
        {/* Speech bubble tail */}
        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2">
          <div className="w-0 h-0 border-l-[18px] border-r-[18px] border-t-[22px] border-l-transparent border-r-transparent border-t-black dark:border-t-white"></div>
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 translate-y-1 w-0 h-0 border-l-[15px] border-r-[15px] border-t-[19px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-900"></div>
        </div>

        {/* Comic text styling */}
        <div className="space-y-6 text-black dark:text-white">
          <div className={`text-xl md:text-2xl lg:text-3xl leading-relaxed font-bold transform transition-all duration-700 ${
            isVisible ? 'translate-y-0' : 'translate-y-4'
          }`} style={{
            fontFamily: 'Ink Free',
            textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
            animationDelay: '0.2s'
          }}>
            Dal 1997 coltiviamo semi di cambiamento nel territorio corleonese, costruendo una cultura della legalità, della pace e della cittadinanza attiva.  
Crediamo nell’educazione, nella memoria e nella partecipazione come strumenti per trasformare il presente.  
Con progetti dedicati ai giovani e al territorio, lavoriamo in rete per generare nuove visioni, valorizzare storie e custodire impegno civile.            </div>
          
          <div className={`text-xl md:text-2xl lg:text-3xl leading-relaxed font-bold transform transition-all duration-700 ${
            isVisible ? 'translate-y-0' : 'translate-y-4'
          }`} style={{
            fontFamily: 'Ink Free',
            textShadow: '2px 2px 0px rgba(0,0,0,0.1)',
            animationDelay: '0.4s'
          }}>
            INTUS è uno spazio in cui le idee diventano azioni, e le radici si intrecciano al futuro.
          </div>
        </div>

        {/* Comic book decorative elements */}
        <div className="absolute top-4 right-4">
          <div className="w-6 h-6 bg-yellow-400 rounded-full animate-pulse"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>
        </div>
        
        <div className="absolute bottom-4 left-4">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0s'}}></div>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
        </div>
        

      </div>

      {/* Thought bubble trail */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex space-x-2">
        <div className="w-3 h-3 bg-white dark:bg-gray-900 border border-black dark:border-white rounded-full animate-float"></div>
        <div className="w-4 h-4 bg-white dark:bg-gray-900 border border-black dark:border-white rounded-full animate-float" style={{animationDelay: '0.2s'}}></div>
        <div className="w-5 h-5 bg-white dark:bg-gray-900 border border-black dark:border-white rounded-full animate-float" style={{animationDelay: '0.4s'}}></div>
      </div>
    </div>
  );
};

export default ComicTextBubble;
