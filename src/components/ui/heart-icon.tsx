import { cn } from "@/lib/utils";

interface HeartIconProps {
  className?: string;
  animate?: boolean;
}

export const HeartIcon = ({ className, animate = true }: HeartIconProps) => {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={cn(
        "w-16 h-16 fill-heart stroke-heart-glow stroke-1",
        animate && "animate-pulse-heart",
        className
      )}
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
};