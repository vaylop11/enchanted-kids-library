
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

interface ChatMessageSkeletonProps {
  isUser?: boolean;
}

function ChatMessageSkeleton({ isUser = false }: ChatMessageSkeletonProps) {
  return (
    <div className={cn(
      "flex flex-col space-y-3 p-3 rounded-lg max-w-[80%]",
      isUser 
        ? "bg-primary/10 ml-auto rounded-br-none" 
        : "bg-muted mr-auto rounded-bl-none"
    )}>
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-3 w-[100px] mt-2" />
      </div>
    </div>
  )
}

export { Skeleton, ChatMessageSkeleton }
