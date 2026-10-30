// Owner: Oggy — FR-12/FR-13 content editor and drafts (Figure 1.6). Placeholder until built.
export default async function EditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Content Editor</h1>
      <p>Placeholder — Oggy is building this (FR-12, FR-13). Content id: {id}</p>
    </main>
  );
}
