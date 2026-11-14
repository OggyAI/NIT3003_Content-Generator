// Shared classes for the four auth forms, so they use the app's design tokens (CLAUDE.md §3):
// field borders, a navy focus outline (the old teal ring was ~2.5:1, under WCAG's 3:1),
// danger colours for errors, and the standard Button style for submit.
import { buttonClasses } from "@/components/ui/Button";

export const titleClass = "text-2xl font-semibold tracking-tight text-ink";
export const introClass = "mt-1 text-sm text-muted";
export const labelClass = "block text-sm font-medium text-ink";
export const fieldErrorClass = "mt-1 text-sm text-danger";
export const formErrorClass =
  "mt-4 rounded-control border border-danger/30 bg-danger-light p-3 text-sm text-danger";
export const submitClass = `${buttonClasses()} w-full`;
export const linkClass =
  "rounded font-medium text-navy underline underline-offset-4 hover:no-underline " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy";
export const footerClass = "mt-6 text-center text-sm text-muted";
// "Show / Hide" inside the password box
export const toggleClass =
  "absolute inset-y-0 right-1 my-auto flex h-8 items-center rounded-lg px-2 text-sm font-medium text-muted " +
  "hover:bg-slate-100 hover:text-ink focus-visible:outline-2 focus-visible:outline-navy";

export function inputClass(hasError: boolean) {
  return [
    "mt-1.5 block min-h-10 w-full rounded-control border bg-white px-3 py-2 text-ink",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy",
    hasError ? "border-danger" : "border-field",
  ].join(" ");
}

// One line of the live password checklist (NFR-01)
export function ruleClass(ok: boolean) {
  return "flex items-center gap-2 " + (ok ? "text-green-700" : "text-muted");
}
