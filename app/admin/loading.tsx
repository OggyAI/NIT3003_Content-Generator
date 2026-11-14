// Skeleton shown while the admin overview loads. Mirrors the page: header, four totals, list.
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import { SkeletonBar, SkeletonHeader, SkeletonPage } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <AppShell width="wide">
      <SkeletonPage label="Loading the admin overview…">
        <SkeletonHeader action={false} />
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="flex flex-col gap-2">
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-7 w-16" />
            </Card>
          ))}
        </div>
        <Card padded={false}>
          <div className="divide-y divide-line">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col gap-2 px-4 py-4 sm:px-6">
                <SkeletonBar className="h-4 w-1/3" />
                <SkeletonBar className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </Card>
      </SkeletonPage>
    </AppShell>
  );
}
