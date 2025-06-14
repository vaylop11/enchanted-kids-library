
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

function ChatMessageSkeleton() {
  return (
    <div className="flex flex-col space-y-3 mr-auto max-w-[80%] bg-muted p-3 rounded-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] dark:via-white/10" />
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-3 w-[100px] mt-2" />
      </div>
    </div>
  )
}

function PDFAnalysisSkeletonLoader() {
  return (
    <div className="bg-muted/30 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="h-7 w-32 rounded bg-muted animate-pulse" />
        <div className="h-4 w-8 rounded bg-muted animate-pulse" />
      </div>
      
      <div className="h-2 w-full bg-muted/50 rounded overflow-hidden relative">
        <div className="h-full bg-primary rounded absolute left-0 top-0 w-[60%] animate-pulse"></div>
      </div>
      
      <div className="h-4 w-3/4 bg-muted rounded mt-2 animate-pulse"></div>
    </div>
  )
}

export { Skeleton, ChatMessageSkeleton, PDFAnalysisSkeletonLoader }
