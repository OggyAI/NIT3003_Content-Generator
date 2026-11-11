// Shared wrapper for /register and /login. The (auth) folder is a route group,
// so it doesn't appear in the URL.
// Layout (Figure 1.1, refreshed by Harry): navy brand panel beside the form card.
// Styling only — the forms and their logic live in login/ and register/.
import BrandMark from "@/components/BrandMark";

const POINTS = ["Generate content instantly", "Refine drafts with AI insights", "Manage saved campaigns"];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <div className="relative isolate hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div aria-hidden="true" className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-teal/30 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-24 -z-10 h-96 w-96 rounded-full bg-blue-500/30 blur-3xl" />

        <p className="flex items-center gap-3 font-display text-lg font-bold">
          <BrandMark />
          AI Content Generator
        </p>

        <div>
          <p className="max-w-md font-display text-4xl font-bold leading-tight tracking-tight xl:text-5xl">
            Marketing content for your business, written in your voice.
          </p>
          <ul className="mt-8 flex flex-col gap-4">
            {POINTS.map((point) => (
              <li key={point} className="flex items-center gap-3 text-blue-100">
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-300/20 text-teal-300"
                >
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="m5 10.5 3 3 7-7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-sm text-blue-100">Built for small businesses: cafés, shops and local services.</p>
      </div>

      <main className="flex flex-col items-center justify-center bg-page px-4 py-12">
        <p className="mb-8 flex items-center gap-3 font-display text-lg font-bold text-ink lg:hidden">
          <BrandMark />
          AI Content Generator
        </p>
        <div className="w-full max-w-md rounded-card border border-line bg-white p-8 shadow-card sm:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
