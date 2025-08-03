import { useState } from "react";
import { ImageOff, Loader2 } from "lucide-react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  showError?: boolean;
  onError?: (url: string) => void;
  onLoad?: () => void;
}

export const ImageWithFallback = ({ 
  src, 
  alt, 
  className = "", 
  fallbackClassName = "",
  showError = true,
  onError,
  onLoad
}: ImageWithFallbackProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    console.error('Errore caricamento immagine:', src);
    onError?.(src);
  };

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  if (imageError) {
    return (
      <div className={`bg-muted flex items-center justify-center ${fallbackClassName || className}`}>
        {showError ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground p-4">
            <ImageOff className="w-8 h-8" />
            <span className="text-xs text-center">Immagine non disponibile</span>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-muted to-muted/50" />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={`absolute inset-0 bg-muted flex items-center justify-center ${className}`}>
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={className}
        onError={handleError}
        onLoad={handleLoad}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </div>
  );
};
