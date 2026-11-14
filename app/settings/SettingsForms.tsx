'use client';
// Owner: Oggy. The interactive Settings cards (UI overhaul Phase 2, approved plan 14 Nov 2026).
// Each card is its own form with its own server action (actions.ts): failures show next to
// the button with role="alert", successes in a polite status line, and typed values are kept
// on failure (passwords are never sent back).
import { useActionState, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { AlertIcon, CheckIcon } from '@/components/icons';
import { PASSWORD_RULES, validateNewPassword } from '@/app/(auth)/validation';
import { fieldErrorClass, inputClass, labelClass, ruleClass, toggleClass } from '@/app/(auth)/ui';
import { changeEmail, changePassword, type EmailState, type PasswordState } from './actions';

// ---- Shared pieces ----

function CardHeading({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div>
      <h2 id={id} className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">{text}</p>
    </div>
  );
}

function PasswordField({
  id,
  name,
  label,
  autoComplete,
  error,
  hintId,
  value,
  onChange,
}: {
  id: string;
  name: string;
  label: string;
  autoComplete: 'current-password' | 'new-password';
  error?: string;
  hintId?: string;
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [show, setShow] = useState(false);
  const errorId = `${id}-error`;
  const describedBy = [hintId, error ? errorId : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange ? (e) => onChange(e.target.value) : undefined}
          aria-invalid={!!error}
          aria-describedby={describedBy}
          className={inputClass(!!error) + ' pr-16'}
        />
        <button type="button" onClick={() => setShow((s) => !s)} className={toggleClass}>
          {show ? 'Hide' : 'Show'}
          <span className="sr-only"> password</span>
        </button>
      </div>
      {error && (
        <p id={errorId} className={fieldErrorClass}>
          {error}
        </p>
      )}
    </div>
  );
}

/** Always rendered, so screen readers announce the success message when it appears */
function SuccessLine({ text }: { text: string | null }) {
  return (
    <p role="status" aria-live="polite" className="flex items-center gap-2 text-sm font-medium text-green-700">
      {text && (
        <>
          <CheckIcon className="h-4 w-4" />
          {text}
        </>
      )}
    </p>
  );
}

function FormError({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p role="alert" className="flex items-start gap-2 text-sm text-danger">
      <AlertIcon className="mt-0.5 h-5 w-5" />
      {text}
    </p>
  );
}

// ---- Change password ----

export function PasswordCard() {
  const [state, formAction, pending] = useActionState(changePassword, {} as PasswordState);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [clientErrors, setClientErrors] = useState<PasswordState['fieldErrors']>({});

  // After a successful change, empty the new-password boxes
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.savedAt) {
      setPassword('');
      setConfirmPassword('');
    }
  }

  const errors = { ...state.fieldErrors, ...clientErrors };

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const current = String(new FormData(e.currentTarget).get('current') ?? '');
    const found: NonNullable<PasswordState['fieldErrors']> = validateNewPassword(password, confirmPassword);
    if (!current) found.current = 'Enter your current password.';
    if (Object.values(found).some(Boolean)) {
      e.preventDefault();
      setClientErrors(found);
      return;
    }
    setClientErrors({});
  }

  return (
    <Card>
      <section aria-labelledby="password-heading" className="flex flex-col gap-4">
        <CardHeading
          id="password-heading"
          title="Change password"
          text="You'll stay logged in here. Any other devices are logged out."
        />
        <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
          <PasswordField
            id="password-current"
            name="current"
            label="Current password"
            autoComplete="current-password"
            error={errors.current}
          />
          <div>
            <PasswordField
              id="password-new"
              name="password"
              label="New password"
              autoComplete="new-password"
              hintId="password-new-rules"
              error={errors.password}
              value={password}
              onChange={(v) => {
                setPassword(v);
                setClientErrors((p) => ({ ...p, password: undefined }));
              }}
            />
            {/* Live NFR-01 checklist, same as register and reset */}
            <ul id="password-new-rules" className="mt-2 space-y-1 text-sm">
              {PASSWORD_RULES.map((rule) => {
                const ok = rule.test(password);
                return (
                  <li key={rule.label} className={ruleClass(ok)}>
                    <span aria-hidden="true">{ok ? '✓' : '○'}</span> {rule.label}
                    <span className="sr-only">{ok ? ' (met)' : ' (not met)'}</span>
                  </li>
                );
              })}
            </ul>
          </div>
          <PasswordField
            id="password-confirm"
            name="confirmPassword"
            label="Confirm new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            value={confirmPassword}
            onChange={(v) => {
              setConfirmPassword(v);
              setClientErrors((p) => ({ ...p, confirmPassword: undefined }));
            }}
          />
          <FormError text={state.formError} />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="secondary" loading={pending}>
              {pending ? 'Changing…' : 'Change password'}
            </Button>
            <SuccessLine
              text={!pending && state.savedAt ? 'Password changed. Other devices have been logged out.' : null}
            />
          </div>
        </form>
      </section>
    </Card>
  );
}

// ---- Change email ----

export function EmailCard({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(changeEmail, {} as EmailState);
  const errors = state.fieldErrors ?? {};

  return (
    <Card>
      <section aria-labelledby="email-heading" className="flex flex-col gap-4">
        <CardHeading id="email-heading" title="Change email" text="The address you log in with." />
        <p className="text-sm text-ink">
          Current email: <span className="font-medium break-all">{email}</span>
        </p>
        <form action={formAction} noValidate className="flex flex-col gap-4">
          <Input
            id="email-new"
            name="newEmail"
            type="email"
            label="New email"
            autoComplete="email"
            defaultValue={state.values?.newEmail}
            error={errors.newEmail}
          />
          <Input
            id="email-confirm"
            name="confirmEmail"
            type="email"
            label="Confirm new email"
            autoComplete="email"
            defaultValue={state.values?.confirmEmail}
            error={errors.confirmEmail}
          />
          <PasswordField
            id="email-current"
            name="current"
            label="Current password"
            autoComplete="current-password"
            error={errors.current}
          />
          <FormError text={state.formError} />
          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" variant="secondary" loading={pending}>
              {pending ? 'Changing…' : 'Change email'}
            </Button>
            <SuccessLine text={!pending && state.savedAt ? (state.message ?? 'Email changed.') : null} />
          </div>
        </form>
      </section>
    </Card>
  );
}
