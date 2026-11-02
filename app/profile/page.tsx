// Owner: Nicolas. Business profile (Figure 1.3, FR-03 to FR-06).
import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import Sidebar from "@/components/Sidebar";
import LogoutButton from "@/app/(auth)/LogoutButton";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "./ProfileForm";
import type { ProfileFields } from "./validation";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  // Row-level security only returns this user's own business rows
  const { data: business } = await supabase
    .from("business_profile")
    .select("id, business_name, industry, description")
    .maybeSingle();

  let voice = "";
  let audience = { description: "", age_range: "", interests: "" };
  let products: ProfileFields["products"] = [];

  if (business) {
    const [voiceRes, audienceRes, productsRes] = await Promise.all([
      supabase.from("brand_voice").select("voice").eq("business_id", business.id).maybeSingle(),
      supabase
        .from("target_audience")
        .select("description, age_range, interests")
        .eq("business_id", business.id)
        .maybeSingle(),
      supabase
        .from("products")
        .select("id, name, description")
        .eq("business_id", business.id)
        .order("created_at"),
    ]);
    voice = voiceRes.data?.voice ?? "";
    audience = {
      description: audienceRes.data?.description ?? "",
      age_range: audienceRes.data?.age_range ?? "",
      interests: audienceRes.data?.interests ?? "",
    };
    products = (productsRes.data ?? []).map((p) => ({ id: p.id, name: p.name, description: p.description ?? "" }));
  }

  const initial: ProfileFields = {
    businessName: business?.business_name ?? "",
    industry: business?.industry ?? "",
    description: business?.description ?? "",
    voice,
    audienceDescription: audience.description,
    ageRange: audience.age_range,
    interests: audience.interests,
    products,
  };

  return (
    <AppShell sidebar={<Sidebar mode="steps" currentStep={0} />}>
      <div className="mb-4 flex justify-end">
        <LogoutButton />
      </div>
      <ProfileForm initial={initial} />
    </AppShell>
  );
}
