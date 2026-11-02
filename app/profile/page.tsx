import LogoutButton from "@/app/(auth)/LogoutButton";

export default function ProfilePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-semibold text-slate-900">Business Profile</h1>
      <p className="mt-1 text-slate-600">Placeholder: profile form coming next (FR-03 to FR-06).</p>
      <div className="mt-6">
        <LogoutButton />
      </div>
    </main>
  );
}