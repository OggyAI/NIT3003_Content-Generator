// Shared validation for the business profile (FR-03 to FR-06, NFR-08).
// Imported by the browser (instant feedback) AND the server action (the real check).
// Length limits match the check constraints in supabase/schema.sql.
import type { BrandVoiceOption } from "@/lib/types";
import { validateBusinessName } from "../(auth)/validation";

export const INDUSTRIES = [
  "Retail",
  "Hospitality",
  "Food & Beverage",
  "Health & Fitness",
  "Beauty & Wellness",
  "Professional Services",
  "Trades & Construction",
  "Education",
  "Technology",
  "Real Estate",
  "Other",
];

export const VOICES: { value: BrandVoiceOption; label: string }[] = [
  { value: "professional", label: "Professional" },
  { value: "friendly", label: "Friendly" },
  { value: "casual", label: "Casual" },
  { value: "persuasive", label: "Persuasive" },
];

export const MAX_PRODUCTS = 20;

// A product in the form. Saved products have an id; newly added ones don't yet.
export type ProductInput = { id?: string; name: string; description: string };

export type ProfileFields = {
  businessName: string;
  industry: string;
  description: string;
  voice: string;
  audienceDescription: string;
  ageRange: string;
  interests: string;
  products: ProductInput[];
};

export type ProfileErrors = Partial<Record<keyof ProfileFields, string>>;

function tooLong(value: string, max: number, label: string): string | undefined {
  return value.trim().length > max ? `${label} must be ${max} characters or fewer.` : undefined;
}

// Checks the "+ Add" product boxes before the product joins the list.
export function validateProduct(p: ProductInput, existing: ProductInput[]): string | undefined {
  const name = p.name.trim();
  if (!name) return "Enter a product or service name.";
  if (name.length > 120) return "Product name must be 120 characters or fewer.";
  if (p.description.trim().length > 500) return "Product description must be 500 characters or fewer.";
  if (existing.some((e) => e.name.trim().toLowerCase() === name.toLowerCase())) {
    return `"${name}" is already in your list.`;
  }
  if (existing.length >= MAX_PRODUCTS) return `You can add up to ${MAX_PRODUCTS} products or services.`;
  return undefined;
}

// Required fields are the ones that make a profile "complete" for /api/generate:
// business name, industry, brand voice and target audience description.
export function validateProfile(f: ProfileFields): ProfileErrors {
  const errors: ProfileErrors = {};

  const businessName = validateBusinessName(f.businessName);
  if (businessName) errors.businessName = businessName;

  if (!f.industry) errors.industry = "Select your industry.";
  else if (!INDUSTRIES.includes(f.industry)) errors.industry = "Select an industry from the list.";

  const description = tooLong(f.description, 1000, "Description");
  if (description) errors.description = description;

  if (!f.voice) errors.voice = "Choose a brand voice.";
  else if (!VOICES.some((v) => v.value === f.voice)) errors.voice = "Choose one of the four brand voices.";

  if (!f.audienceDescription.trim()) errors.audienceDescription = "Describe who your customers are.";
  else {
    const audience = tooLong(f.audienceDescription, 1000, "Audience description");
    if (audience) errors.audienceDescription = audience;
  }

  const ageRange = tooLong(f.ageRange, 40, "Age range");
  if (ageRange) errors.ageRange = ageRange;

  const interests = tooLong(f.interests, 500, "Interests");
  if (interests) errors.interests = interests;

  if (f.products.length > MAX_PRODUCTS) {
    errors.products = `You can add up to ${MAX_PRODUCTS} products or services.`;
  } else {
    for (let i = 0; i < f.products.length; i++) {
      const problem = validateProduct(f.products[i], f.products.slice(0, i));
      if (problem) {
        errors.products = problem;
        break;
      }
    }
  }

  return errors;
}
