"use client";

import { useActionState, useCallback, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Chip from "@/components/ui/Chip";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import SelectableCard from "@/components/ui/SelectableCard";
import Textarea from "@/components/ui/Textarea";
import Toast from "@/components/ui/Toast";
import { saveProfile, type ProfileState } from "./actions";
import {
  INDUSTRIES,
  VOICES,
  validateProduct,
  validateProfile,
  type ProductInput,
  type ProfileErrors,
  type ProfileFields,
} from "./validation";

const initialState: ProfileState = {};

export default function ProfileForm({ initial }: { initial: ProfileFields }) {
  const [state, formAction, pending] = useActionState(saveProfile, initialState);

  // Controlled fields, so typed values survive a failed save
  const [fields, setFields] = useState(initial);
  const [clientErrors, setClientErrors] = useState<ProfileErrors>({});

  // "+ Add" product boxes
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [productError, setProductError] = useState<string>();

  // When a save succeeds: show the toast and pick up the saved product ids
  const [toastOpen, setToastOpen] = useState(false);
  const [handledState, setHandledState] = useState(state);
  if (state !== handledState) {
    setHandledState(state);
    if (state.savedAt) {
      setToastOpen(true);
      if (state.products) setFields((f) => ({ ...f, products: state.products! }));
    }
  }
  const closeToast = useCallback(() => setToastOpen(false), []);

  const errors: ProfileErrors = { ...state.fieldErrors, ...clientErrors };

  function update<K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) {
    setFields((f) => ({ ...f, [key]: value }));
    // Clear that field's message as soon as the user fixes it
    setClientErrors((e) => ({ ...e, [key]: undefined }));
  }

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
  }

  function removeProduct(index: number) {
    update(
      "products",
      fields.products.filter((_, i) => i !== index),
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    const found = validateProfile(fields);
    if (Object.keys(found).length > 0) {
      e.preventDefault();
      setClientErrors(found);
      return;
    }
    setClientErrors({});
  }

  return (
    <Card className="p-8">
      <h1 className="text-2xl font-bold text-gray-900">Business Profile</h1>
      <p className="mt-1 text-sm text-muted">
        Tell us about your business so generated content sounds like you. Fields marked * are required.
      </p>

      {state.formError && (
        <p role="alert" className="mt-4 rounded-control bg-red-50 p-3 text-sm text-red-700">
          {state.formError}
        </p>
      )}

      <form action={formAction} onSubmit={handleSubmit} noValidate className="mt-6 space-y-8">
        <input type="hidden" name="products" value={JSON.stringify(fields.products)} />
        <input type="hidden" name="voice" value={fields.voice} />

        {/* FR-03: business details */}
        <section className="space-y-4">
          <Input
            label="Business Name *"
            name="businessName"
            autoComplete="organization"
            placeholder="Enter your business name"
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
            label="Business Description"
            name="description"
            rows={3}
            placeholder="What does your business do?"
            value={fields.description}
            onChange={(e) => update("description", e.target.value)}
            error={errors.description}
          />
        </section>

        {/* FR-05: products and services */}
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Products / Services</h2>
          {fields.products.length > 0 ? (
            <ul className="flex flex-wrap gap-2" aria-label="Your products and services">
              {fields.products.map((p, i) => (
                <li key={p.id ?? `new-${p.name}`} title={p.description || undefined}>
                  <Chip label={p.name} onRemove={() => removeProduct(i)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No products or services added yet.</p>
          )}
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <Input
              label="Product or service name"
              placeholder="e.g. Haircut"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                // Enter adds the product instead of submitting the whole form
                if (e.key === "Enter") {
                  e.preventDefault();
                  addProduct();
                }
              }}
            />
            <Input
              label="Description (optional)"
              placeholder="e.g. 30 min cut and style"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addProduct();
                }
              }}
            />
            <Button variant="secondary" onClick={addProduct}>
              + Add
            </Button>
          </div>
          {(productError || errors.products) && (
            <p role="alert" className="text-sm text-red-600">
              {productError || errors.products}
            </p>
          )}
        </section>

        {/* FR-06: target audience */}
        <section className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-900">Target Audience</h2>
          <Textarea
            label="Audience Description *"
            name="audienceDescription"
            rows={3}
            placeholder="e.g. Busy local parents who want quick, healthy meals"
            value={fields.audienceDescription}
            onChange={(e) => update("audienceDescription", e.target.value)}
            error={errors.audienceDescription}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Age Range"
              name="ageRange"
              placeholder="e.g. 25-45"
              value={fields.ageRange}
              onChange={(e) => update("ageRange", e.target.value)}
              error={errors.ageRange}
            />
            <Input
              label="Interests"
              name="interests"
              placeholder="e.g. fitness, cooking, travel"
              value={fields.interests}
              onChange={(e) => update("interests", e.target.value)}
              error={errors.interests}
            />
          </div>
        </section>

        {/* FR-04: brand voice */}
        <fieldset aria-describedby={errors.voice ? "voice-error" : undefined}>
          <legend className="text-sm font-semibold text-gray-900">Brand Voice *</legend>
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {VOICES.map((v) => (
              <SelectableCard
                key={v.value}
                label={v.label}
                selected={fields.voice === v.value}
                onSelect={() => update("voice", v.value)}
              />
            ))}
          </div>
          {errors.voice && (
            <p id="voice-error" className="mt-1 text-sm text-red-600">
              {errors.voice}
            </p>
          )}
        </fieldset>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
          <Button type="submit" name="intent" value="save" variant="secondary" disabled={pending}>
            Save
          </Button>
          <Button type="submit" name="intent" value="continue" loading={pending}>
            {pending ? "Saving…" : "Save & Continue"}
          </Button>
        </div>
      </form>

      <Toast open={toastOpen} message="Profile saved" onClose={closeToast} />
    </Card>
  );
}
