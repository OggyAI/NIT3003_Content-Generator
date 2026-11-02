'use client';
// Owner: Oggy — "Duplicate" on Draft History (Figure 1.7): copies the draft
// and opens the copy in the editor.
import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { duplicateDraft } from '@/app/editor/[id]/actions';

export default function DuplicateButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="flex items-center gap-2">
      <Button
        variant="secondary"
        loading={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const res = await duplicateDraft(id);
            if (res.ok) router.push(`/editor/${res.id}`);
            else setError(res.message);
          })
        }
      >
        Duplicate
      </Button>
      {error && (
        <span role="alert" className="text-sm text-amber-800">
          {error}
        </span>
      )}
    </span>
  );
}
