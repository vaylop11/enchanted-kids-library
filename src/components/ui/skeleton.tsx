
import { cn } from "@/lib/utils"
import { AnalysisProgress } from "@/services/pdfAnalysisService";

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
      <div className="flex items-center space-x-2 mb-2">
        <div className="h-8 w-8 rounded-full bg-muted/70"></div>
        <Skeleton className="h-4 w-[100px]" />
      </div>
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[230px]" />
      <Skeleton className="h-4 w-[180px]" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-3 w-[100px] mt-2" />
      </div>
      <div className="mt-3 pt-3 border-t border-muted/20">
        <Skeleton className="h-5 w-[150px] mb-2" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-[120px] rounded-full" />
          <Skeleton className="h-8 w-[140px] rounded-full" />
          <Skeleton className="h-8 w-[130px] rounded-full" />
        </div>
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
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-5 w-14" />
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>
    </div>
  )
}

function PDFAnalysisLoadingSkeleton() {
  return (
    <div className="flex flex-col p-4 space-y-3 bg-muted/30 border border-muted/20 backdrop-blur-sm rounded-lg">
      <div className="flex items-center space-x-3">
        <div className="h-6 w-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin"></div>
        <Skeleton className="h-5 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-2.5 w-full rounded-full" />
        <div className="flex justify-between text-xs">
          <Skeleton className="h-3 w-[50px]" />
          <Skeleton className="h-3 w-[40px]" />
        </div>
      </div>
    </div>
  )
}

function ChatActionButtonsSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-muted/20">
      <Skeleton className="h-10 w-[130px] rounded-full" />
      <Skeleton className="h-10 w-[150px] rounded-full" />
      <Skeleton className="h-10 w-[120px] rounded-full" />
    </div>
  )
}

function KeyPointsSkeleton() {
  return (
    <div className="mt-3 pt-3 border-t border-muted/30">
      <Skeleton className="h-5 w-[180px] mb-3" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
      </div>
    </div>
  )
}

export { 
  Skeleton, 
  ChatMessageSkeleton, 
  PDFPageSkeleton,
  PDFAnalysisLoadingSkeleton,
  ChatActionButtonsSkeleton,
  KeyPointsSkeleton
}
