'use client';
// Owner: Oggy — "Duplicate" on Draft History (Figure 1.7): copies the draft
// and opens the copy in the editor.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { duplicateDraft } from '@/app/editor/[id]/actions';

export default function DuplicateButton({ id, title }: { id: string; title?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex flex-wrap items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await duplicateDraft(id).catch(() => ({
              ok: false as const,
              message: "Couldn't reach the server. Please try again.",
            }));
            if (res.ok) router.push(`/editor/${res.id}`);
            else setError(res.message);
          })
        }
      >
        {pending ? 'Duplicating…' : 'Duplicate'}
        {title && <span className="sr-only">: {title}</span>}
      </Button>
      {error && (
        <span role="alert" className="text-sm text-danger">
          {error}
        </span>
      )}
    </span>
  );
}
