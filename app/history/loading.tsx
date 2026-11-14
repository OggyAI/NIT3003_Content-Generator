// Skeleton shown while Draft history loads. Mirrors the real page: header, filters + search, list.
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import { SkeletonBar, SkeletonBox, SkeletonHeader, SkeletonPage } from '@/components/ui/Skeleton';

export default function HistoryLoading() {
  return (
    <AppShell width="wide">
      <SkeletonPage label="Loading your drafts…">
        <SkeletonHeader />
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SkeletonBox className="h-11 w-full max-w-md" />
          <SkeletonBox className="h-10 w-full lg:w-96" />
        </div>
        <Card padded={false}>
          <div className="divide-y divide-line">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:py-3">
                <div className="flex flex-1 flex-col gap-2">
                  <SkeletonBar className="h-4 w-2/3 max-w-sm" />
                  <SkeletonBar className="h-4 w-40" />
                </div>
                <div className="flex gap-2">
                  <SkeletonBox className="h-8 w-16" />
                  <SkeletonBox className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </SkeletonPage>
    </AppShell>
  );
}
