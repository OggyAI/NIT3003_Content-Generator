"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { BrandVoiceOption } from "@/lib/types";
import { validateProfile, type ProductInput, type ProfileErrors, type ProfileFields } from "./validation";

export type ProfileState = {
  fieldErrors?: ProfileErrors;
  formError?: string;
  savedAt?: number; // set on success so the form knows to show "Profile saved"
  products?: ProductInput[]; // saved list with real ids, so the form stays in sync
};

// The product list arrives as JSON from a hidden input. Never trust its shape.
function parseProducts(raw: string): ProductInput[] {
  try {
    const list: unknown = JSON.parse(raw || "[]");
    if (!Array.isArray(list)) return [];
    return list.map((p) => ({
      id: typeof p?.id === "string" ? p.id : undefined,
      name: String(p?.name ?? ""),
      description: String(p?.description ?? ""),
    }));
  } catch {
    return [];
  }
}

const SAVE_FAILED = "We couldn't save your profile. Please try again.";

export async function saveProfile(_prev: ProfileState, formData: FormData): Promise<ProfileState> {
  const fields: ProfileFields = {
    businessName: String(formData.get("businessName") ?? ""),
    industry: String(formData.get("industry") ?? ""),
    description: String(formData.get("description") ?? ""),
    voice: String(formData.get("voice") ?? ""),
    audienceDescription: String(formData.get("audienceDescription") ?? ""),
    ageRange: String(formData.get("ageRange") ?? ""),
    interests: String(formData.get("interests") ?? ""),
    products: parseProducts(String(formData.get("products") ?? "")),
  };
  const intent = String(formData.get("intent") ?? "save");

  // 1. Same checks as the browser, because a request can skip the browser
  const fieldErrors = validateProfile(fields);
  if (Object.keys(fieldErrors).length > 0) return { fieldErrors };

  // 2. Who is logged in?
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const orNull = (s: string) => s.trim() || null;

  // 3. Business details (FR-03). One row per owner, normally created at sign-up;
  //    upsert on owner_id also covers an account whose row is missing.
  //    The returned id is this user's business, so every write below is scoped to it.
  const { data: business, error: businessError } = await supabase
    .from("business_profile")
    .upsert(
      {
        owner_id: user.id,
        business_name: fields.businessName.trim(),
        industry: fields.industry,
        description: orNull(fields.description),
      },
      { onConflict: "owner_id" },
    )
    .select("id")
    .single();
  if (businessError || !business) {
    console.error("business_profile upsert failed:", businessError);
    return { formError: SAVE_FAILED };
  }
  const businessId = business.id;

  // 4. Brand voice (FR-04) and target audience (FR-06): one row each per business
  const { error: voiceError } = await supabase
    .from("brand_voice")
    .upsert({ business_id: businessId, voice: fields.voice as BrandVoiceOption }, { onConflict: "business_id" });

  const { error: audienceError } = await supabase.from("target_audience").upsert(
    {
      business_id: businessId,
      description: fields.audienceDescription.trim(),
      age_range: orNull(fields.ageRange),
      interests: orNull(fields.interests),
    },
    { onConflict: "business_id" },
  );
  if (voiceError || audienceError) {
    console.error("brand_voice/target_audience upsert failed:", voiceError ?? audienceError);
    return { formError: SAVE_FAILED };
  }

  // 5. Products (FR-05): delete the ones removed in the form, insert the new ones
  const { data: existing, error: listError } = await supabase
    .from("products")
    .select("id")
    .eq("business_id", businessId);
  if (listError) {
    console.error("products select failed:", listError);
    return { formError: SAVE_FAILED };
  }

  const keepIds = new Set(fields.products.map((p) => p.id).filter(Boolean));
  const removeIds = (existing ?? []).map((p) => p.id).filter((id) => !keepIds.has(id));
  if (removeIds.length > 0) {
    const { error } = await supabase.from("products").delete().eq("business_id", businessId).in("id", removeIds);
    if (error) {
      console.error("products delete failed:", error);
      return { formError: SAVE_FAILED };
    }
  }

  const newProducts = fields.products.filter((p) => !p.id);
  if (newProducts.length > 0) {
    const { error } = await supabase.from("products").insert(
      newProducts.map((p) => ({
        business_id: businessId,
        name: p.name.trim(),
        description: orNull(p.description),
      })),
    );
    if (error) {
      console.error("products insert failed:", error);
      return { formError: SAVE_FAILED };
    }
  }

  // 6. Success: refresh cached pages, then continue or stay with a message
  revalidatePath("/profile");
  revalidatePath("/dashboard");
  if (intent === "continue") redirect("/generate");

  const { data: saved } = await supabase
    .from("products")
    .select("id, name, description")
    .eq("business_id", businessId)
    .order("created_at");

  return {
    savedAt: Date.now(),
    products: (saved ?? []).map((p) => ({ id: p.id, name: p.name, description: p.description ?? "" })),
  };
}
