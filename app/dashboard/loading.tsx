// Skeleton shown while the dashboard reads data from Supabase.
// Mirrors the real layout (greeting, navy hero, recent drafts, link cards) so nothing jumps.
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import { SkeletonBar, SkeletonPage } from "@/components/ui/Skeleton";

export default function DashboardLoading() {
  return (
    <AppShell width="wide">
      <SkeletonPage label="Loading your dashboard…">
        <div className="flex flex-col gap-3">
          <SkeletonBar className="h-9 w-72 max-w-full" />
          <SkeletonBar className="h-4 w-96 max-w-full" />
        </div>

        {/* Hero */}
        <div className="h-64 rounded-card bg-navy/80 sm:h-56" />

        <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
          <Card padded={false} className="lg:col-span-2">
            <div className="border-b border-line px-6 py-5">
              <SkeletonBar className="h-5 w-32" />
            </div>
            <div className="divide-y divide-line">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-200" />
                  <div className="flex flex-1 flex-col gap-2">
                    <SkeletonBar className="h-4 w-2/3" />
                    <SkeletonBar className="h-3.5 w-24" />
                  </div>
                </div>
              ))}
            </div>
          </Card>
          <div className="flex flex-col gap-6">
            {[0, 1].map((i) => (
              <Card key={i} className="flex flex-col gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-200" />
                <SkeletonBar className="h-5 w-32" />
                <SkeletonBar className="h-4 w-full" />
              </Card>
            ))}
          </div>
        </div>
      </SkeletonPage>
    </AppShell>
  );
}
