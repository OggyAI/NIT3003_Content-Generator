"use client";
// The styleguide sections that need state: chips, selectable cards, spinner and toast.
import { useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import SelectableCard from "@/components/ui/SelectableCard";
import Spinner from "@/components/ui/Spinner";
import Toast from "@/components/ui/Toast";

const VOICES = ["Professional", "Friendly", "Casual", "Persuasive"];
const TYPES = [
  { label: "Social post", description: "Instagram or Facebook caption" },
  { label: "Blog outline", description: "Headings and key points" },
  { label: "Marketing email", description: "Subject line and body" },
];

export default function Interactive() {
  const [products, setProducts] = useState(["Flat white", "Sourdough", "Catering"]);
  const [voice, setVoice] = useState("Friendly");
  const [type, setType] = useState("Social post");
  const [toast, setToast] = useState<"success" | "error" | null>(null);

  return (
    <>
      <Card>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Selectable cards</h2>
          <p className="text-sm text-muted">
            Selection shows as a 2px teal-700 border, a teal-light fill and a check mark, plus aria-pressed.
          </p>
          <h3 className="text-base font-semibold">Brand voice</h3>
          <div role="group" aria-label="Brand voice" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VOICES.map((v) => (
              <SelectableCard key={v} label={v} selected={voice === v} onSelect={() => setVoice(v)} />
            ))}
          </div>
          <h3 className="text-base font-semibold">Content type, with descriptions</h3>
          <div role="group" aria-label="Content type" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {TYPES.map((t) => (
              <SelectableCard
                key={t.label}
                label={t.label}
                description={t.description}
                selected={type === t.label}
                onSelect={() => setType(t.label)}
              />
            ))}
          </div>
        </section>
      </Card>

      <Card>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Chips</h2>
          <div className="flex flex-wrap gap-2">
            {products.map((p) => (
              <Chip key={p} label={p} onRemove={() => setProducts(products.filter((x) => x !== p))} />
            ))}
            <Chip label="Read only" />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="self-start"
            onClick={() => setProducts(["Flat white", "Sourdough", "Catering"])}
          >
            Reset chips
          </Button>
        </section>
      </Card>

      <Card>
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-ink">Spinner and toast</h2>
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner />
            <Spinner size="lg" label="Generating your draft" />
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setToast("success")}>
              Show success toast
            </Button>
            <Button variant="secondary" onClick={() => setToast("error")}>
              Show error toast
            </Button>
          </div>
          <Toast
            open={toast !== null}
            variant={toast ?? "success"}
            message={toast === "error" ? "Couldn't save. Your changes are still here." : "Draft saved"}
            onClose={() => setToast(null)}
          />
        </section>
      </Card>
    </>
  );
}
