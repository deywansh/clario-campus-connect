import { Skeleton } from "@/components/ui/skeleton";

const AnnouncementSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 space-y-4">
    <div className="flex items-center gap-3">
      <Skeleton className="w-10 h-10 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-20 w-full" />
  </div>
);

export { AnnouncementSkeleton };
