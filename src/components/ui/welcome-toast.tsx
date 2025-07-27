import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Heart } from "lucide-react";

export const WelcomeToast = () => {
  const { toast } = useToast();

  useEffect(() => {
    const hasShownWelcome = localStorage.getItem("hasShownWelcome");
    
    if (!hasShownWelcome) {
      const timer = setTimeout(() => {
        toast({
          title: "💖 Benvenuto in Intus!",
          description: "Siamo felici di averti qui. Esplora i nostri progetti e scopri come puoi contribuire al cambiamento.",
          duration: 5000,
        });
        localStorage.setItem("hasShownWelcome", "true");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [toast]);

  return null;
};