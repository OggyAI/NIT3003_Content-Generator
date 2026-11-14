"use client";
// Owner: Nicolas (first version, Figure 1.3). Rebuilt by Oggy for the UI overhaul (CLAUDE.md §2.2).
// FR-03 business details, FR-05 products and services (add, edit in place, remove),
// FR-06 target audience, FR-04 brand voice. One Save for the whole form (saveProfile), with
// the same validation in the browser and on the server (validation.ts), and a toast on success.
import { useActionState, useCallback, useState } from "react";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import PageHeader from "@/components/ui/PageHeader";
import Select from "@/components/ui/Select";
import SelectableCard from "@/components/ui/SelectableCard";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";
import { AlertIcon, PlusIcon } from "@/components/icons";
import { saveProfile, type ProfileState } from "./actions";
import {
  INDUSTRIES,
  MAX_PRODUCTS,
  VOICES,
  validateProduct,
  validateProfile,
  type ProductInput,
  type ProfileErrors,
  type ProfileFields,
} from "./validation";

const initialState: ProfileState = {};

// Same wording as the prompt builder's voice guide, so the choice matches what the AI is told
const VOICE_HINTS: Record<string, string> = {
  professional: "Clear, credible and polished",
  friendly: "Warm, approachable, like a helpful local",
  casual: "Relaxed and light-hearted",
  persuasive: "Benefit-led, with a confident call to action",
};

// Fields in the order they appear, for moving focus to the first problem
const FIELD_ORDER: (keyof ProfileFields)[] = [
  "businessName",
  "industry",
  "description",
  "products",
  "audienceDescription",
  "ageRange",
  "interests",
  "voice",
];

type Editing = { index: number; name: string; description: string; error?: string } | null;

export default function ProfileForm({ initial }: { initial: ProfileFields }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  // Controlled fields, so typed values survive a failed save
  const [fields, setFields] = useState(initial);
  const [clientErrors, setClientErrors] = useState<ProfileErrors>({});
  const [intent, setIntent] = useState<"save" | "continue">("save");

  // Products as last saved, to mark new and edited ones as "Unsaved"
  const [savedProducts, setSavedProducts] = useState(initial.products);
  const [editing, setEditing] = useState<Editing>(null);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [productError, setProductError] = useState<string>();
  const [productNote, setProductNote] = useState("");

  // When a save succeeds: show the toast and pick up the saved product ids
  const [toastOpen, setToastOpen] = useState(false);
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.savedAt) {
      setToastOpen(true);
      setProductNote("");
      if (state.products) {
        setFields((f) => ({ ...f, products: state.products! }));
        setSavedProducts(state.products);
      }
    }
  }
  const closeToast = useCallback(() => setToastOpen(false), []);

  const errors: ProfileErrors = { ...state.fieldErrors, ...clientErrors };

  // Live progress, using the same four checks as the completeness rule (getBusinessContext)
  const required = [
    fields.businessName.trim() !== "",
    fields.industry !== "",
    fields.audienceDescription.trim() !== "",
    fields.voice !== "",
  ];
  const done = required.filter(Boolean).length;

  function update<K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    // Clear that field's message as soon as the user changes it
    setClientErrors((e) => ({ ...e, [key]: undefined }));
  }

  function focusLater(selector: string) {
    setTimeout(() => document.querySelector<HTMLElement>(selector)?.focus(), 0);
  }

  // ---- Products: add, edit in place, remove (saved with the rest of the form) ----

  function addProduct() {
    const product: ProductInput = { name: newName.trim(), description: newDescription.trim() };
    const problem = validateProduct(product, fields.products);
    if (problem) {
      setProductError(problem);
      return;
    }
    update("products", [...fields.products, product]);
    setNewName("");
    setNewDescription("");
    setProductError(undefined);
    setProductNote(`Added ${product.name}. Save your profile to keep it.`);
    focusLater("#product-new-name");
  }

  function startEdit(index: number) {
    const p = fields.products[index];
    setEditing({ index, name: p.name, description: p.description });
    focusLater(`#product-edit-name-${index}`);
  }

  function finishEdit() {
    if (!editing) return;
    const others = fields.products.filter((_, i) => i !== editing.index);
    const edited = { name: editing.name.trim(), description: editing.description.trim() };
    const problem = validateProduct(edited, others);
    if (problem) {
      setEditing({ ...editing, error: problem });
      return;
    }
    const index = editing.index;
    update(
      "products",
      fields.products.map((p, i) => (i === index ? { ...p, ...edited } : p)),
    );
    setEditing(null);
    setProductNote(`Updated ${edited.name}. Save your profile to keep the change.`);
    focusLater(`#product-edit-${index}`);
  }

  function cancelEdit() {
    if (!editing) return;
    const index = editing.index;
    setEditing(null);
    focusLater(`#product-edit-${index}`);
  }

  function removeProduct(index: number) {
    const removed = fields.products[index];
    const next = fields.products.filter((_, i) => i !== index);
    update("products", next);
    if (editing) setEditing(null);
    setProductNote(
      productStatus(removed) === "new"
        ? `Removed ${removed.name}.`
        : `Removed ${removed.name}. Save your profile to keep this change.`,
    );
    // Keep keyboard users in the list: the next row's Edit button, or the Add box
    focusLater(next.length > index ? `#product-edit-${index}` : "#product-new-name");
  }

  function productStatus(p: ProductInput): "new" | "edited" | null {
    const before = p.id ? savedProducts.find((s) => s.id === p.id) : undefined;
    if (!before) return "new";
    return before.name !== p.name || before.description !== p.description ? "edited" : null;
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    if (editing) {
      // Don't save a half-finished product edit by accident
      e.preventDefault();
      setEditing({ ...editing, error: "Press Done to keep this change, or Cancel." });
      focusLater(`#product-edit-name-${editing.index}`);
      return;
    }
    const found = validateProfile(fields);
    if (Object.keys(found).length > 0) {
      e.preventDefault();
      setClientErrors(found);
      const first = FIELD_ORDER.find((k) => found[k]);
      if (first === "voice") focusLater("#voice-options button");
      else if (first === "products") focusLater("#product-new-name");
      else if (first) focusLater(`[name="${first}"]`);
      return;
    }
    setClientErrors({});
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Business profile"
        description="Tell us about your business so your content sounds like you. Fields marked * are required."
        meta={
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-2 w-24 overflow-hidden rounded-full bg-navy-50">
              <span className="block h-full rounded-full bg-teal" style={{ width: `${(done / required.length) * 100}%` }} />
            </span>
            <span aria-live="polite">
              {done === required.length
                ? "All required details filled in"
                : `${done} of ${required.length} required details filled in`}
            </span>
          </span>
        }
      />

      <form action={formAction} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <input type="hidden" name="products" value={JSON.stringify(fields.products)} />
        <input type="hidden" name="voice" value={fields.voice} />

        {/* FR-03: business details */}
        <Card>
          <section aria-labelledby="details-heading" className="flex flex-col gap-4">
            <SectionHeading id="details-heading" title="Business details" text="Your business name, industry and what you do." />
            <Input
              label="Business name *"
              name="businessName"
              autoComplete="organization"
              placeholder="e.g. Bean There Café"
              value={fields.businessName}
              onChange={(e) => update("businessName", e.target.value)}
              error={errors.businessName}
            />
            <Select
              label="Industry *"
              name="industry"
              placeholder="Select your industry"
              options={INDUSTRIES}
              value={fields.industry}
              onChange={(e) => update("industry", e.target.value)}
              error={errors.industry}
            />
            <Textarea
              label="Business description"
              name="description"
              rows={3}
              placeholder="What does your business do, and what makes it different?"
              value={fields.description}
              onChange={(e) => update("description", e.target.value)}
              error={errors.description}
            />
          </section>
        </Card>

        {/* FR-05: products and services */}
        <Card>
          <section aria-labelledby="products-heading" className="flex flex-col gap-4">
            <SectionHeading
              id="products-heading"
              title="Products and services"
              text={`What you sell, so we can mention it where it fits. Optional, up to ${MAX_PRODUCTS}.`}
            />

            {fields.products.length > 0 ? (
              <ul aria-label="Your products and services" className="divide-y divide-line rounded-control border border-line">
                {fields.products.map((p, i) => {
                  const status = productStatus(p);
                  const isEditing = editing?.index === i;
                  return (
                    <li key={p.id ?? `new-${i}`} className="px-3 py-3 sm:px-4">
                      {isEditing ? (
                        <div
                          className="flex flex-col gap-3"
                          onKeyDown={(e) => {
                            // Enter keeps the edit and Escape cancels it, instead of submitting the form
                            if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                              e.preventDefault();
                              finishEdit();
                            } else if (e.key === "Escape") {
                              e.preventDefault();
                              cancelEdit();
                            }
                          }}
                        >
                          <div className="grid gap-3 sm:grid-cols-2">
                            <Input
                              id={`product-edit-name-${i}`}
                              label="Name"
                              value={editing.name}
                              maxLength={120}
                              onChange={(e) => setEditing({ ...editing, name: e.target.value, error: undefined })}
                            />
                            <Input
                              label="Description (optional)"
                              value={editing.description}
                              maxLength={500}
                              onChange={(e) => setEditing({ ...editing, description: e.target.value, error: undefined })}
                            />
                          </div>
                          {editing.error && (
                            <p role="alert" className="text-sm text-danger">
                              {editing.error}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button variant="secondary" size="sm" onClick={finishEdit}>
                              Done
                            </Button>
                            <Button variant="ghost" size="sm" onClick={cancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-center gap-2 font-medium break-words text-ink">
                              {p.name}
                              {status && <Badge>{status === "new" ? "Unsaved" : "Edited, unsaved"}</Badge>}
                            </p>
                            {p.description && <p className="mt-0.5 text-sm break-words text-muted">{p.description}</p>}
                          </div>
                          <div className="flex shrink-0 gap-1">
                            <Button id={`product-edit-${i}`} variant="ghost" size="sm" onClick={() => startEdit(i)}>
                              Edit<span className="sr-only">: {p.name}</span>
                            </Button>
                            <Button variant="danger-ghost" size="sm" onClick={() => removeProduct(i)}>
                              Remove<span className="sr-only">: {p.name}</span>
                            </Button>
                          </div>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-muted">No products or services added yet.</p>
            )}

            <div
              // @container: the three-column add row only appears when the box is wide enough
              className="@container flex flex-col gap-3 rounded-control bg-page p-3 sm:p-4"
              onKeyDown={(e) => {
                // Enter adds the product instead of submitting the whole form
                if (e.key === "Enter" && (e.target as HTMLElement).tagName === "INPUT") {
                  e.preventDefault();
                  addProduct();
                }
              }}
            >
              <p className="text-sm font-medium text-ink">Add a product or service</p>
              <div className="grid gap-3 @lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] @lg:items-start">
                <Input
                  id="product-new-name"
                  label="Name"
                  placeholder="e.g. Flat white"
                  value={newName}
                  maxLength={120}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setProductError(undefined);
                  }}
                  error={productError}
                />
                <Input
                  label="Description (optional)"
                  placeholder="e.g. Single-origin, roasted in Footscray"
                  value={newDescription}
                  maxLength={500}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
                {/* Lines up with the inputs (below their labels) when side by side */}
                <Button variant="secondary" onClick={addProduct} className="self-start @lg:mt-[1.625rem]">
                  <PlusIcon className="h-4 w-4" />
                  Add
                </Button>
              </div>
            </div>

            {errors.products && (
              <p role="alert" className="text-sm text-danger">
                {errors.products}
              </p>
            )}
            {/* Always rendered (even when empty) so screen readers announce changes */}
            <p role="status" aria-live="polite" className="text-sm text-muted">
              {productNote}
            </p>
          </section>
        </Card>

        {/* FR-06: target audience */}
        <Card>
          <section aria-labelledby="audience-heading" className="flex flex-col gap-4">
            <SectionHeading id="audience-heading" title="Target audience" text="Who you want to reach with your content." />
            <Textarea
              label="Who are your customers? *"
              name="audienceDescription"
              rows={3}
              placeholder="e.g. Local commuters and remote workers who want good coffee and a quick, healthy breakfast"
              value={fields.audienceDescription}
              onChange={(e) => update("audienceDescription", e.target.value)}
              error={errors.audienceDescription}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Age range"
                name="ageRange"
                placeholder="e.g. 25–45"
                value={fields.ageRange}
                onChange={(e) => update("ageRange", e.target.value)}
                error={errors.ageRange}
              />
              <Input
                label="Interests"
                name="interests"
                placeholder="e.g. coffee, brunch, fitness"
                value={fields.interests}
                onChange={(e) => update("interests", e.target.value)}
                error={errors.interests}
              />
            </div>
          </section>
        </Card>

        {/* FR-04: brand voice */}
        <Card>
          <fieldset aria-describedby={errors.voice ? "voice-hint voice-error" : "voice-hint"} className="min-w-0">
            {/* The legend holds the section heading, so screen readers hear "Brand voice" once */}
            <legend className="w-full">
              <h2 className="text-lg font-semibold text-ink">Brand voice *</h2>
            </legend>
            <p id="voice-hint" className="mt-1 text-sm text-muted">
              How your content should sound. You can change it any time.
            </p>
            <div id="voice-options" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {VOICES.map((v) => (
                <SelectableCard
                  key={v.value}
                  label={v.label}
                  description={VOICE_HINTS[v.value]}
                  selected={fields.voice === v.value}
                  onSelect={() => update("voice", v.value)}
                />
              ))}
            </div>
            {errors.voice && (
              <p id="voice-error" className="mt-2 text-sm text-danger">
                {errors.voice}
              </p>
            )}
          </fieldset>
        </Card>

        {/* One Save for the whole form. Floats at the bottom from sm up; on phones it sits at
            the end of the form so it doesn't cover what you're typing */}
        <div className="flex flex-col gap-3 rounded-card border border-line bg-white/95 p-3 shadow-card backdrop-blur sm:sticky sm:bottom-4 sm:z-10 sm:flex-row sm:items-center sm:justify-end sm:p-4">
          {state.formError && (
            <p role="alert" className="flex items-start gap-2 text-sm text-danger sm:mr-auto">
              <AlertIcon className="mt-0.5 h-5 w-5" />
              {state.formError} Your changes are still here.
            </p>
          )}
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <Button
              type="submit"
              name="intent"
              value="continue"
              variant="secondary"
              onClick={() => setIntent("continue")}
              loading={pending && intent === "continue"}
              disabled={pending}
            >
              Save and create content
            </Button>
            <Button
              type="submit"
              name="intent"
              value="save"
              onClick={() => setIntent("save")}
              loading={pending && intent === "save"}
              disabled={pending}
            >
              {pending && intent === "save" ? "Saving…" : "Save profile"}
            </Button>
          </div>
        </div>
      </form>

      <Toast open={toastOpen} message="Profile saved" onClose={closeToast} />
    </div>
  );
}

function SectionHeading({ id, title, text }: { id: string; title: string; text: string }) {
  return (
    <div>
      <h2 id={id} className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <p className="mt-1 text-sm text-muted">
        {text}
      </p>
    </div>
  );
}
