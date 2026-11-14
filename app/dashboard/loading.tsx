// Skeleton shown while the dashboard reads data from Supabase.
// Mirrors the real layout (header, recent drafts, side card) so nothing jumps when it loads.
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-full bg-slate-200 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <AppShell width="wide">
      <div role="status" className="flex flex-col gap-6">
        <span className="sr-only">Loading your dashboard…</span>

        <div aria-hidden="true" className="flex animate-pulse flex-col gap-6">
          {/* Page header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <Bar className="h-8 w-56" />
              <Bar className="h-4 w-80 max-w-full" />
            </div>
            <div className="h-10 w-40 rounded-control bg-slate-200" />
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
            {/* Recent drafts */}
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <Bar className="h-5 w-32" />
                <Bar className="h-4 w-24" />
              </div>
              <Card padded={false}>
                <div className="divide-y divide-line">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex min-h-16 flex-col justify-center gap-2 px-4 py-3 sm:px-6">
                      <Bar className="h-4 w-2/3" />
                      <Bar className="h-4 w-40" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Side card */}
            <Card>
              <div className="flex flex-col gap-4">
                <Bar className="h-5 w-28" />
                <Bar className="h-4 w-full" />
                <Bar className="h-4 w-3/4" />
                <Bar className="h-4 w-2/3" />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
