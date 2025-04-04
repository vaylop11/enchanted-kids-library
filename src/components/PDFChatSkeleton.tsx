
import { Skeleton } from "@/components/ui/skeleton";

export function PDFChatSkeleton() {
  return (
    <div className="flex flex-col space-y-2 mr-auto max-w-[80%] bg-muted p-3 rounded-lg animate-in fade-in-50 duration-300">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[150px]" />
    </div>
  );
}
