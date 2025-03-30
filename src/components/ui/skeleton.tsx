
import { cn } from "@/lib/utils"
import { useLanguage } from "@/contexts/LanguageContext"

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
  const { direction } = useLanguage();
  
  return (
    <div className={cn(
      "flex flex-col space-y-3 max-w-[80%] bg-muted p-3 rounded-lg",
      direction === 'rtl' ? 'mr-auto text-right' : 'ml-auto text-left'
    )}
    dir={direction}>
      <Skeleton className={cn("h-4 w-[250px]", direction === 'rtl' ? 'mr-0 ml-auto' : 'ml-0 mr-auto')} />
      <Skeleton className={cn("h-4 w-[200px]", direction === 'rtl' ? 'mr-0 ml-auto' : 'ml-0 mr-auto')} />
      <Skeleton className={cn("h-4 w-[150px]", direction === 'rtl' ? 'mr-0 ml-auto' : 'ml-0 mr-auto')} />
      <div className={cn("flex mt-2", direction === 'rtl' ? 'justify-start' : 'justify-end')}>
        <Skeleton className="h-3 w-[80px]" />
      </div>
    </div>
  )
}

export { Skeleton, ChatMessageSkeleton }
