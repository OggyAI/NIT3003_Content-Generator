// Skeleton shown while the dashboard reads data from Supabase.
import AppShell from "@/components/AppShell";
import Sidebar from "@/components/Sidebar";
import Card from "@/components/ui/Card";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-control bg-slate-200 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <AppShell sidebar={<Sidebar title="Dashboard" subtitle="Create, manage, and optimise your content." />}>
      <Card className="p-8 sm:p-10">
        <div role="status" className="animate-pulse">
          <span className="sr-only">Loading your dashboard…</span>

          {/* Heading */}
          <div className="flex flex-col items-center gap-3" aria-hidden="true">
            <Bar className="h-8 w-56" />
            <Bar className="h-4 w-72 max-w-full" />
          </div>

          {/* Quick Actions */}
          <div className="mt-10 flex flex-col items-center" aria-hidden="true">
            <Bar className="mb-4 h-6 w-36" />
            <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-3 rounded-control border border-line p-4">
                  <Bar className="h-5 w-3/4" />
                  <Bar className="h-4 w-full" />
                  <Bar className="h-4 w-2/3" />
                  <Bar className="mt-2 h-9 w-20 self-center" />
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="mt-10 flex flex-col items-center" aria-hidden="true">
            <Bar className="mb-4 h-6 w-40" />
            <div className="flex w-full flex-col gap-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex flex-col gap-2 px-2">
                  <Bar className="h-5 w-1/2" />
                  <Bar className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </AppShell>
  );
}