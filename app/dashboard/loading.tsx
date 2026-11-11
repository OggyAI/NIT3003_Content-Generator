// Skeleton shown while the dashboard reads data from Supabase.
import AppShell from "@/components/AppShell";
import Sidebar from "@/components/Sidebar";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`rounded-control bg-slate-200 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <AppShell sidebar={<Sidebar title="Dashboard" subtitle="Create, manage, and optimise your content." />}>
      <div role="status" className="animate-pulse">
        <span className="sr-only">Loading your dashboard…</span>

        <div aria-hidden="true">
          {/* Heading */}
          <Bar className="h-9 w-72 max-w-full" />
          <Bar className="mt-3 h-4 w-80 max-w-full" />

          {/* Create panel */}
          <div className="mt-8 h-64 rounded-card bg-slate-200" />

          {/* Recent activity + shortcuts */}
          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-5 rounded-card border border-line bg-white p-6 lg:col-span-2">
              <Bar className="h-6 w-40" />
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Bar className="h-10 w-10 shrink-0" />
                  <div className="flex flex-1 flex-col gap-2">
                    <Bar className="h-4 w-1/2" />
                    <Bar className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-6">
              {[0, 1].map((i) => (
                <div key={i} className="flex flex-col gap-3 rounded-card border border-line bg-white p-6">
                  <Bar className="h-10 w-10" />
                  <Bar className="h-5 w-1/2" />
                  <Bar className="h-4 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
