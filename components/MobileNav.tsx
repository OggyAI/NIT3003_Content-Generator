"use client";
// Mobile-only top bar + slide-in menu. Used inside AppShell; pages don't use this directly.
// The menu is the same Sidebar as desktop, so the items always match.
// Closes on: link click, Escape, tapping outside, or the Close button. Traps Tab focus while open.
import { useEffect, useRef, useState, type ReactNode } from "react";
import BrandMark from "@/components/BrandMark";
import Sidebar from "@/components/Sidebar";
import { MenuIcon } from "@/components/icons";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MobileNav({ business, admin }: { business?: ReactNode; admin?: ReactNode }) {
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
      menuButton?.focus(); // give focus back to the menu button
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-2 border-b border-line bg-white/95 px-4 text-ink backdrop-blur">
        <BrandMark size="sm" />
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setOpen(true)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Open menu"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-navy"
        >
          <MenuIcon className="h-6 w-6" />
        </button>
      </header>

      {open && (
        <div className="fixed inset-0 z-50">
          {/* Tapping the dark background closes the menu */}
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} aria-hidden="true" />

          <div
            id="mobile-menu"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute inset-y-0 left-0 flex w-64 max-w-[85vw] flex-col overflow-y-auto bg-white shadow-xl"
            onClick={(e) => {
              // Close when a link inside the sidebar is tapped
              if ((e.target as HTMLElement).closest("a")) setOpen(false);
            }}
          >
            <Sidebar business={business} admin={admin} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}