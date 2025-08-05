import { cn } from "@/lib/utils";

interface AnimatedIntusLogoProps {
  className?: string;
}

export const AnimatedIntusLogo = ({ className }: AnimatedIntusLogoProps) => {
  return (
    <div className={cn("relative", className)}>
      {/* Red version - fades out during pulse */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fc0f7b2c705d74b75bd52d5dc56b5532f%2Fee5f13ead30543ed802e6bb6351f9e3e?format=webp&width=800"
        alt="Intus Corleone APS - Perdersi è scoprire"
        className="w-full h-auto object-contain animate-logo-fade-out"
        style={{animationDuration: '0.8s'}}
      />

      {/* White version - fades in during pulse */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2Fc0f7b2c705d74b75bd52d5dc56b5532f%2F1106e3f089bb467ab179195f74804836?format=webp&width=800"
        alt="Intus Corleone APS - Perdersi è scoprire (White)"
        className="absolute inset-0 w-full h-auto object-contain animate-logo-fade-in"
        style={{animationDuration: '0.8s'}}
      />
    </div>
  );
};
