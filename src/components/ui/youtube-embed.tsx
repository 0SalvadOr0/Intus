import { Play } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface YouTubeEmbedProps {
  url: string;
  title?: string;
  className?: string;
}

export const YouTubeEmbed = ({ url, title, className }: YouTubeEmbedProps) => {
  const [isLoaded, setIsLoaded] = useState(false);

  // Extract video ID from various YouTube URL formats
  const getVideoId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getVideoId(url);

  if (!videoId) {
    return (
      <div className="bg-muted rounded-lg p-4 text-center">
        <p className="text-muted-foreground">URL YouTube non valido</p>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${videoId}`;
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <div className={cn("relative w-full aspect-video rounded-lg overflow-hidden", className)}>
      {!isLoaded ? (
        // Thumbnail with play button
        <div 
          className="relative w-full h-full cursor-pointer group"
          onClick={() => setIsLoaded(true)}
        >
          <img
            src={thumbnailUrl}
            alt={title || "Video YouTube"}
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-2xl">
              <Play className="w-6 h-6 ml-1" />
            </div>
          </div>
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white font-medium">{title}</h3>
            </div>
          )}
        </div>
      ) : (
        // Actual YouTube embed
        <iframe
          src={embedUrl}
          title={title || "Video YouTube"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      )}
    </div>
  );
};