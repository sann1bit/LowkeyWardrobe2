import { Skeleton } from './Skeleton';

export function ProductCardSkeleton() {
  return (
    <div className="bg-white">
      <Skeleton className="aspect-[3/4] w-full" />
      <div className="pt-4 px-1 pb-4 space-y-2">
        <Skeleton height="11px" width="68%" shape="text-line" />
        <Skeleton height="11px" width="28%" shape="text-line" />
      </div>
    </div>
  );
}
