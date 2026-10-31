// Shared wrapper for /register and /login. The (auth) folder is a route group,
// so it doesn't appear in the URL. Restyle to match Figma Figure 1.1.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {children}
      </div>
    </main>
  );
}