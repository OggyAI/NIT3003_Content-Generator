// Public living reference for the UI (CLAUDE.md §3). Used for the user manual and screenshots.
// Keep it free of user data: it isn't in PROTECTED.
import Link from "next/link";
import type { ReactNode } from "react";
import Button, { buttonClasses } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Callout from "@/components/ui/Callout";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import BrandMark from "@/components/BrandMark";
import * as Icons from "@/components/icons";
import Interactive from "./Interactive";

const COLOURS = [
  { name: "navy", hex: "#1E3A8A", use: "Primary buttons, sidebar, links, focus ring", swatch: "bg-navy" },
  { name: "navy-dark", hex: "#172E6E", use: "Hover on primary", swatch: "bg-navy-dark" },
  { name: "navy-50", hex: "#EEF2FB", use: "Selected rows, subtle highlights", swatch: "bg-navy-50" },
  { name: "navy-100", hex: "#DCE4F6", use: "Stronger tint", swatch: "bg-navy-100" },
  { name: "teal", hex: "#14B8A6", use: "Accent fills only (never text on white)", swatch: "bg-teal" },
  { name: "teal-light", hex: "#CCFBF1", use: "Selected-card background", swatch: "bg-teal-light" },
  { name: "page", hex: "#F6F8FC", use: "Page background", swatch: "bg-page" },
  { name: "ink", hex: "#0F172A", use: "Body and heading text", swatch: "bg-ink" },
  { name: "muted", hex: "#5E6B7F", use: "Secondary text (5.4:1 on white)", swatch: "bg-muted" },
  { name: "field", hex: "#878E9C", use: "Every form-control border", swatch: "bg-field" },
  { name: "line", hex: "#E3E8F0", use: "Decorative dividers and card borders", swatch: "bg-line" },
  { name: "success", hex: "#22C55E", use: "Status fill (text uses green-800)", swatch: "bg-success" },
  { name: "warning", hex: "#F59E0B", use: "Status fill (text uses amber-800)", swatch: "bg-warning" },
  { name: "danger", hex: "#B91C1C", use: "Errors, Delete", swatch: "bg-danger" },
];

const ICONS = Object.entries(Icons).map(([name, Icon]) => ({ name: name.replace(/Icon$/, ""), Icon }));

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card>
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        {children}
      </section>
    </Card>
  );
}

export default function StyleguidePage() {
  return (
    <main className="px-4 py-6 md:px-8 md:py-10">
      <div className="flex max-w-5xl flex-col gap-6">
        <PageHeader
          title="Style guide"
          description="Tokens and components for the AI Content Generator. Inter only, navy and teal, quiet white surfaces."
          actions={
            <Link href="/dashboard" className={buttonClasses("secondary")}>
              Open the app
            </Link>
          }
        />

        <Section title="Colour tokens">
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {COLOURS.map((c) => (
              <li key={c.name} className="flex items-center gap-3">
                <span aria-hidden="true" className={`h-12 w-12 shrink-0 rounded-control border border-line ${c.swatch}`} />
                <span className="min-w-0 text-sm">
                  <span className="block font-medium text-ink">
                    {c.name} <span className="font-normal text-muted">{c.hex}</span>
                  </span>
                  <span className="block text-muted">{c.use}</span>
                </span>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Typography">
          <p className="text-2xl font-semibold tracking-tight text-ink md:text-3xl">Page title (h1)</p>
          <p className="text-lg font-semibold text-ink">Section title (h2)</p>
          <p className="text-base font-semibold">Sub-section (h3)</p>
          <p className="text-sm leading-6 text-ink md:text-base">
            Body text. Write in Australian English and say what things do: optimise, analyse, colour, Save draft.
          </p>
          <p className="text-sm text-muted">Hints and meta text use muted.</p>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Save draft</Button>
            <Button variant="secondary">Save as new version</Button>
            <Button variant="ghost">Duplicate</Button>
            <Button variant="danger">Delete draft</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Open</Button>
            <Button size="sm" variant="secondary">
              <Icons.CopyIcon className="h-4 w-4" />
              Copy
            </Button>
            <Button size="sm" variant="ghost">
              <Icons.DownloadIcon className="h-4 w-4" />
              Export
            </Button>
            <Button loading>Generating…</Button>
            <Button disabled>Disabled</Button>
            <Link href="/styleguide" className={buttonClasses("secondary", "sm")}>
              Link styled as a button
            </Link>
          </div>
          <p className="text-sm text-muted">
            One primary button per screen. Small buttons stay 40px tall on touch screens and shrink to 32px from md up.
          </p>
        </Section>

        <Section title="Form controls">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Input label="Business name" placeholder="e.g. Bean There Café" />
            <Input label="Keywords" hint="Optional. Separate with commas." placeholder="coffee, brunch, Footscray" />
            <Input label="Email address" type="email" defaultValue="not-an-email" error="Please enter a valid email address." />
            <Select
              label="Industry"
              placeholder="Select your industry"
              options={["Retail", "Hospitality", "Health & Beauty", "Professional Services", "Other"]}
            />
            <Input label="Disabled" defaultValue="Can't change this" disabled />
          </div>
          <Textarea
            label="What should we write?"
            rows={4}
            defaultValue={"Announce our new winter menu: chai lattes, pumpkin soup and fresh sourdough. Open from 7am."}
          />
        </Section>

        <Interactive />

        <Section title="Badges and callout">
          <div className="flex flex-wrap gap-2">
            <Badge variant="info">Instagram post</Badge>
            <Badge variant="success">81% SEO</Badge>
            <Badge variant="success">✓ Tone match</Badge>
            <Badge variant="warning">Tone mismatch</Badge>
            <Badge>Out of date</Badge>
          </div>
          <Callout title="Suggestion">Add urgency such as &quot;Ends this Sunday!&quot;</Callout>
        </Section>

        <Section title="Page header">
          <div className="rounded-control border border-line p-4">
            <PageHeader
              title="Create content"
              description="Choose a format and tell us what to write."
              meta={<span>Writing for Bean There Café · Friendly voice</span>}
              actions={
                <Link href="/styleguide" className={buttonClasses("ghost", "sm")}>
                  Edit profile
                </Link>
              }
            />
          </div>
          <p className="text-sm text-muted">Every signed-in page starts with this, and it holds the page&apos;s only h1.</p>
        </Section>

        <Section title="Empty state">
          <EmptyState
            headingLevel="h3"
            title="No drafts yet"
            text="Create your first post and it will show up here."
            action={
              <Link href="/styleguide" className={buttonClasses()}>
                Create content
              </Link>
            }
          />
        </Section>

        <Section title="Brand mark">
          <div className="flex flex-wrap items-center gap-6">
            <BrandMark />
            <span className="rounded-control bg-navy p-4">
              <BrandMark tone="dark" />
            </span>
            <span className="rounded-control bg-navy p-3">
              <BrandMark tone="dark" size="sm" />
            </span>
          </div>
        </Section>

        <Section title="Icons">
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {ICONS.map(({ name, Icon }) => (
              <li key={name} className="flex items-center gap-2 text-sm text-ink">
                <Icon />
                {name}
              </li>
            ))}
          </ul>
          <p className="text-sm text-muted">
            Inline SVG, 20px, 1.75 stroke, hidden from screen readers. Always pair an icon with text or an aria-label.
          </p>
        </Section>
      </div>
    </main>
  );
}
