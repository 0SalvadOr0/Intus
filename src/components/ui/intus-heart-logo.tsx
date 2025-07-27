import { cn } from "@/lib/utils";

interface IntusHeartLogoProps {
  className?: string;
  animate?: boolean;
}

export const IntusHeartLogo = ({ className, animate = true }: IntusHeartLogoProps) => {
  return (
    <div className={cn("relative", className)}>
      <svg
        viewBox="0 0 100 100"
        className={cn(
          "w-8 h-8 transition-all duration-1000",
          animate && "animate-pulse-heart"
        )}
      >
        {/* White heart version that fades out */}
        <g className={animate ? "animate-white-overlay" : ""}>
          {/* Main heart outline in white */}
          <path
            d="M50 20 C40 10, 20 10, 20 30 C20 50, 50 80, 50 80 C50 80, 80 50, 80 30 C80 10, 60 10, 50 20 Z"
            fill="white"
            stroke="white"
            strokeWidth="2"
          />

          {/* Interwoven maze pattern in pink */}
          <path
            d="M35 25 L45 35 M55 35 L65 25 M30 40 L40 30 M60 30 L70 40 M25 50 L35 40 M65 40 L75 50"
            stroke="rgb(219 39 119)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M40 45 L50 35 L60 45 M35 50 L45 40 M55 40 L65 50 M30 60 L50 60 L70 60"
            stroke="rgb(219 39 119)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          <path
            d="M45 50 L55 50 M50 45 L50 55"
            stroke="rgb(219 39 119)"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* Red/Pink heart version that fades in */}
        <g className={animate ? "animate-color-fade" : "opacity-0"}>
          {/* Main heart outline */}
          <path
            d="M50 20 C40 10, 20 10, 20 30 C20 50, 50 80, 50 80 C50 80, 80 50, 80 30 C80 10, 60 10, 50 20 Z"
            fill="rgb(219 39 119)"
            stroke="rgb(219 39 119)"
            strokeWidth="2"
          />

          {/* Interwoven maze pattern - outer layer */}
          <path
            d="M35 25 L45 35 M55 35 L65 25 M30 40 L40 30 M60 30 L70 40 M25 50 L35 40 M65 40 L75 50"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />

          {/* Interwoven maze pattern - inner layer */}
          <path
            d="M40 45 L50 35 L60 45 M35 50 L45 40 M55 40 L65 50 M30 60 L50 60 L70 60"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />

          {/* Center intersecting lines */}
          <path
            d="M45 50 L55 50 M50 45 L50 55"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
        </g>
      </svg>
    </div>
  );
};
