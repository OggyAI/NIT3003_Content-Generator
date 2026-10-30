"use client";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Chip from "@/components/ui/Chip";
import SelectableCard from "@/components/ui/SelectableCard";
import Spinner from "@/components/ui/Spinner";
import Toast from "@/components/ui/Toast";

const VOICES = ["Professional", "Friendly", "Casual", "Persuasive"];
const TYPES = ["Social Media", "Blog Post", "Email Newsletter"];

export default function Interactive() {
  const [products, setProducts] = useState(["Clothing", "Electronics"]);
  const [voice, setVoice] = useState("Friendly");
  const [type, setType] = useState("Social Media");
  const [toastOpen, setToastOpen] = useState(false);

  return (
    <>
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Chips</h2>
        <div className="flex flex-wrap gap-2">
          {products.map((p) => (
            <Chip key={p} label={p} onRemove={() => setProducts(products.filter((x) => x !== p))} />
          ))}
        </div>
        <Button variant="secondary" className="self-start" onClick={() => setProducts(["Clothing", "Electronics"])}>
          Reset chips
        </Button>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Brand Voice</h2>
        <div role="group" aria-label="Brand voice" className="grid grid-cols-4 gap-3">
          {VOICES.map((v) => (
            <SelectableCard key={v} label={v} selected={voice === v} onSelect={() => setVoice(v)} />
          ))}
        </div>

        <h2 className="text-xl font-bold">Content Type</h2>
        <div role="group" aria-label="Content type" className="grid grid-cols-3 gap-3">
          {TYPES.map((t) => (
            <SelectableCard key={t} label={t} selected={type === t} onSelect={() => setType(t)} />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Spinner</h2>
        <div className="flex items-center gap-6">
          <Spinner size="sm" />
          <Spinner />
          <Spinner size="lg" label="Generating your draft" />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-bold">Toast</h2>
        <Button className="self-start" onClick={() => setToastOpen(true)}>
          Save Draft
        </Button>
        <Toast open={toastOpen} message="Draft saved" onClose={() => setToastOpen(false)} />
      </section>
    </>
  );
}