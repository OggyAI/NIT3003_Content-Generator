'use client';
// Owner: Oggy. The interactive Settings cards (UI overhaul Phase 2, approved plan 14 Nov 2026).
// Each card is its own form with its own server action (actions.ts): failures show next to
// the button with role="alert", successes in a polite status line, and typed values are kept
// on failure (passwords are never sent back).
import { useActionState, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import SelectableCard from '@/components/ui/SelectableCard';
import { AlertIcon, CheckIcon, TrashIcon } from '@/components/icons';
import { PASSWORD_RULES, validateNewPassword } from '@/app/(auth)/validation';
import { fieldErrorClass, inputClass, labelClass, ruleClass, toggleClass } from '@/app/(auth)/ui';
import { FORMAT_LABELS, FORMAT_OPTIONS, PLATFORM_OPTIONS } from '@/lib/display';
import type { ContentType, Platform } from '@/lib/types';
import {
  changeEmail,
  changePassword,
  deleteAccount,
  saveDefaults,
  type DefaultsState,
  type DeleteState,
  type EmailState,
  type PasswordState,
} from './actions';

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

// ---- Content defaults ----

export function DefaultsCard({
  initialType,
  initialPlatform,
  ready,
}: {
  initialType: ContentType | null;
  initialPlatform: Platform | null;
  /** false until migration 002 has been run on the database */
  ready: boolean;
}) {
  const [state, formAction, pending] = useActionState(saveDefaults, {} as DefaultsState);
  const [type, setType] = useState<ContentType>(initialType ?? 'social');
  const [platform, setPlatform] = useState<Platform>(initialPlatform ?? 'instagram');

  // What's saved now, so the "Saved" message disappears as soon as the choice changes
  const [saved, setSaved] = useState({ type, platform });
  const [handled, setHandled] = useState(state);
  if (state !== handled) {
    setHandled(state);
    if (state.savedAt) setSaved({ type, platform });
  }
  const unchanged = type === saved.type && (type !== 'social' || platform === saved.platform);

  return (
    <Card>
      <section aria-labelledby="defaults-heading" className="@container flex flex-col gap-4">
        <CardHeading
          id="defaults-heading"
          title="Content defaults"
          text="What Create content starts on. You can still pick something else each time."
        />
        {!ready ? (
          <p className="rounded-control border border-amber-200 bg-warning-light p-3 text-sm text-amber-900">
            Content defaults aren&apos;t available yet: the database needs a small update first.
          </p>
        ) : (
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="contentType" value={type} />
            <input type="hidden" name="platform" value={platform} />
            <fieldset className="min-w-0">
              <legend className="mb-2 text-sm font-medium text-ink">Format</legend>
              <div className="grid grid-cols-1 gap-3 @xl:grid-cols-3">
                {FORMAT_OPTIONS.map((t) => (
                  <SelectableCard
                    key={t.value}
                    label={FORMAT_LABELS[t.value]}
                    description={t.description}
                    selected={type === t.value}
                    onSelect={() => setType(t.value)}
                  />
                ))}
              </div>
            </fieldset>
            {type === 'social' && (
              <fieldset className="min-w-0">
                <legend className="mb-2 text-sm font-medium text-ink">Platform</legend>
                <div className="grid grid-cols-1 gap-3 @sm:grid-cols-2">
                  {PLATFORM_OPTIONS.map((p) => (
                    <SelectableCard
                      key={p.value}
                      label={p.label}
                      description={p.description}
                      selected={platform === p.value}
                      onSelect={() => setPlatform(p.value)}
                    />
                  ))}
                </div>
              </fieldset>
            )}
            <FormError text={state.formError} />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" variant="secondary" loading={pending}>
                {pending ? 'Saving…' : 'Save defaults'}
              </Button>
              <SuccessLine text={!pending && state.savedAt && unchanged ? 'Defaults saved.' : null} />
            </div>
          </form>
        )}
      </section>
    </Card>
  );
}

// ---- Delete account (danger zone) ----

export function DeleteAccountCard({ businessName }: { businessName: string }) {
  const [state, formAction, pending] = useActionState(deleteAccount, {} as DeleteState);
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState('');
  const errors = state.fieldErrors ?? {};
  const name = businessName.trim();
  const matches = name !== '' && confirmName.trim().toLowerCase() === name.toLowerCase();

  function openConfirm() {
    setOpen(true);
    setTimeout(() => document.getElementById('delete-confirm-name')?.focus(), 0);
  }

  function cancel() {
    setOpen(false);
    setConfirmName('');
    setTimeout(() => document.getElementById('delete-open')?.focus(), 0);
  }

  return (
    <Card className="border-danger/30">
      <section aria-labelledby="delete-heading" className="flex flex-col gap-4">
        <CardHeading
          id="delete-heading"
          title="Delete account"
          text="Permanently deletes your login, your business profile and every draft. This can't be undone."
        />
        {!open ? (
          <Button id="delete-open" variant="danger-ghost" onClick={openConfirm} className="self-start">
            <TrashIcon className="h-4 w-4" />
            Delete account…
          </Button>
        ) : (
          <form action={formAction} noValidate className="flex flex-col gap-4">
            <Input
              id="delete-confirm-name"
              name="confirmName"
              label={name ? `Type ${name} to confirm` : 'Type your business name to confirm'}
              autoComplete="off"
              value={confirmName}
              onChange={(e) => setConfirmName(e.target.value)}
              error={errors.confirmName}
            />
            <PasswordField
              id="delete-current"
              name="current"
              label="Current password"
              autoComplete="current-password"
              error={errors.current}
            />
            <FormError text={state.formError} />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="submit" variant="danger" loading={pending} disabled={!matches}>
                {pending ? 'Deleting…' : 'Permanently delete account'}
              </Button>
              <Button variant="ghost" onClick={cancel} disabled={pending}>
                Cancel
              </Button>
            </div>
            {!matches && (
              <p className="text-sm text-muted">The delete button turns on once the business name matches.</p>
            )}
          </form>
        )}
      </section>
    </Card>
  );
}
