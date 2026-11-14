// Server component: the Admin nav item, only for admins (migration 003, approved Admin plan).
// AppShell streams it into the sidebar with Suspense, like SidebarBusiness. Hiding the link is
// just tidiness: /admin itself returns 404 for non-admins and the database checks the role too.
import { isAdmin } from "@/lib/admin";
import { SidebarLink } from "./Sidebar";

export default async function SidebarAdminLink() {
  if (!(await isAdmin())) return null;
  return (
    <li>
      <SidebarLink href="/admin" label="Admin" icon="admin" match={["/admin"]} />
    </li>
  );
}
