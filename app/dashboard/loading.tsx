// Skeleton shown while the dashboard reads data from Supabase.
// Mirrors the real layout (header, recent drafts, side card) so nothing jumps when it loads.
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import { SkeletonBar, SkeletonHeader, SkeletonPage } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <AppShell width="wide">
      <SkeletonPage label="Loading your dashboard…">
        <SkeletonHeader />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
          {/* Recent drafts */}
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              <SkeletonBar className="h-5 w-32" />
              <SkeletonBar className="h-4 w-24" />
            </div>
            <Card padded={false}>
              <div className="divide-y divide-line">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex min-h-16 flex-col justify-center gap-2 px-4 py-3 sm:px-6">
                    <SkeletonBar className="h-4 w-2/3" />
                    <SkeletonBar className="h-4 w-40" />
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Side card */}
          <Card>
            <div className="flex flex-col gap-4">
              <SkeletonBar className="h-5 w-28" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-3/4" />
              <SkeletonBar className="h-4 w-2/3" />
            </div>
          </Card>
        </div>
      </SkeletonPage>
    </AppShell>
  );
}
