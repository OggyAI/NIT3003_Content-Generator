"use client";
// Mobile-only top bar + slide-in menu. Used inside AppShell; pages don't use this directly.
// Closes on: link click, Escape, tapping outside, or the × button. Traps Tab focus while open.
import { useEffect, useRef, useState, type ReactNode } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ sidebar }: { sidebar: ReactNode }) {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const panel = panelRef.current;
    const menuButton = menuButtonRef.current;
    const focusables = () => Array.from(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

    // Move focus into the menu and stop the page behind from scrolling
    focusables()[0]?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus(); // give focus back to the ☰ button
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between bg-navy px-4 text-white">
        <p className="text-lg font-bold">AI Content Generator</p>
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          className="flex h-10 w-10 items-center justify-center rounded-control hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Tapping the dark background closes the menu */}
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} aria-hidden="true" />

          <div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] overflow-y-auto shadow-xl"
            onClick={(e) => {
              // Close when a link inside the sidebar is tapped
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="absolute right-3 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-control text-2xl text-white hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-white"
            >
              ×
            </button>
            {sidebar}
          </div>
        </div>
      )}
    </div>
  );
}