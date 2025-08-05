import { cn } from "@/lib/utils";

interface AnimatedIntusLogoProps {
  className?: string;
}

export const AnimatedIntusLogo = ({ className }: AnimatedIntusLogoProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Red version - fades out during pulse */}
      <img
        src="../files/logos/logo_cuore.png"
        alt="Intus Corleone APS - Perdersi è scoprire"
        className="w-full h-auto object-contain animate-logo-fade-out"
        style={{animationDuration: '2.5s'}}
      />

      {/* White version - fades in during pulse */}
      <img
        src="../files/logos/logo_cuore_bianco.png"
        alt="Intus Corleone APS - Perdersi è scoprire (White)"
        className="absolute inset-0 w-full h-auto object-contain animate-logo-fade-in"
        style={{animationDuration: '2.5s'}}
      />
    </div>
  );
};
