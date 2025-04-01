
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
    <div className="flex flex-col space-y-3 mr-auto max-w-[80%] bg-muted/50 p-4 rounded-lg border border-muted/20 backdrop-blur-sm">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[230px]" />
      <Skeleton className="h-4 w-[180px]" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-3 w-[100px] mt-2" />
      </div>
    </div>
  )
}

function PDFPageSkeleton() {
  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="w-full max-w-[600px] h-[842px] bg-muted/40 rounded-md border border-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-muted/60 to-transparent shine-effect"></div>
        <div className="p-8 space-y-4">
          <Skeleton className="h-8 w-3/4 mb-6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <div className="py-4"></div>
          <Skeleton className="h-6 w-2/3 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="flex items-center justify-center space-x-2 mt-2">
        <Skeleton className="h-8 w-20 rounded-md" />
        <Skeleton className="h-8 w-14 rounded-md" />
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

export { Skeleton, ChatMessageSkeleton, PDFPageSkeleton }
