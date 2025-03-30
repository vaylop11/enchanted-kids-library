
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
    <div className="flex flex-col space-y-3 mr-auto max-w-[80%] bg-muted p-3 rounded-lg">
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
