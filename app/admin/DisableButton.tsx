'use client';
// Owner: Oggy. Disable (two-step) or re-enable one business owner's account from /admin.
import { useState, useTransition } from 'react';
import Button from '@/components/ui/Button';
import { setAccountDisabled } from './actions';

export default function DisableButton({
  businessId,
  businessName,
  disabled,
}: {
  businessId: string;
  businessName: string;
  disabled: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const confirmId = `disable-confirm-${businessId}`;
  const openId = `disable-open-${businessId}`;

  function run(disable: boolean) {
    setError(null);
    startTransition(async () => {
      const res = await setAccountDisabled(businessId, disable).catch(() => ({
        ok: false as const,
        message: "Couldn't reach the server. Try again.",
      }));
      if (!res.ok) setError(res.message);
      setConfirming(false);
    });
  }

  return (
    <div className="flex flex-col items-start gap-2 @3xl:items-end">
      {disabled ? (
        <Button variant="secondary" size="sm" loading={pending} onClick={() => run(false)}>
          Enable<span className="sr-only"> {businessName}</span>
        </Button>
      ) : confirming ? (
        <div role="group" aria-label={`Confirm disabling ${businessName}`} className="flex flex-wrap items-center gap-2">
          <Button id={confirmId} variant="danger" size="sm" loading={pending} onClick={() => run(true)}>
            Yes, disable {businessName}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={() => {
              setConfirming(false);
              setTimeout(() => document.getElementById(openId)?.focus(), 0);
            }}
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          id={openId}
          variant="danger-ghost"
          size="sm"
          onClick={() => {
            setConfirming(true);
            setTimeout(() => document.getElementById(confirmId)?.focus(), 0);
          }}
        >
          Disable…<span className="sr-only"> {businessName}</span>
        </Button>
      )}
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
