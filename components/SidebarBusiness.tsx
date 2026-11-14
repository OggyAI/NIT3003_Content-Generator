// Server component: the business name block at the top of the sidebar.
// AppShell wraps it in <Suspense> so pages never wait for it, and React.cache means the
// desktop sidebar and the mobile menu share one query per request. RLS limits the query
// to the signed-in user's own business.
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

const getBusinessName = cache(async (): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("business_profile").select("business_name").maybeSingle();
  return data?.business_name?.trim() || null;
});

const BOX = "mt-5 rounded-control bg-page px-3 py-2";

export default async function SidebarBusiness() {
  const name = await getBusinessName();
  if (!name) return null;
  return (
    <div className={BOX}>
      <p className="text-sm text-muted">Business</p>
      <p className="truncate font-semibold text-ink" title={name}>
        {name}
      </p>
    </div>
  );
}

// Same size as the real block, so the nav doesn't jump when the name arrives
export function SidebarBusinessPlaceholder() {
  return (
    <div aria-hidden="true" className={BOX}>
      <p className="text-sm text-muted">Business</p>
      <p className="font-semibold">&nbsp;</p>
    </div>
  );
}
