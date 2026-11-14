// Skeleton shown while Create content loads the business profile. Mirrors the form.
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import { SkeletonBar, SkeletonBox, SkeletonHeader, SkeletonPage } from '@/components/ui/Skeleton';

export default function GenerateLoading() {
  return (
    <AppShell width="narrow">
      <SkeletonPage label="Loading…">
        <SkeletonHeader action={false} />
        <Card className="@container flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <SkeletonBar className="h-4 w-16" />
            <div className="grid grid-cols-1 gap-3 @xl:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <SkeletonBox key={i} className="h-16" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <SkeletonBar className="h-4 w-36" />
            <SkeletonBox className="h-32 w-full" />
          </div>
          <div className="flex flex-col gap-2 sm:max-w-md">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBox className="h-10 w-full" />
          </div>
          <SkeletonBox className="h-10 w-36" />
        </Card>
      </SkeletonPage>
    </AppShell>
  );
}
