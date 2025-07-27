import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {}

function Skeleton({
  className,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function BlogCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />
      
      {/* Content skeleton */}
      <div className="p-6 space-y-4">
        {/* Badge skeleton */}
        <Skeleton className="h-5 w-24" />
        
        {/* Title skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-3/4" />
        </div>
        
        {/* Excerpt skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        
        {/* Meta info skeleton */}
        <div className="flex justify-between">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        
        {/* Button skeleton */}
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}

export { Skeleton, BlogCardSkeleton }
