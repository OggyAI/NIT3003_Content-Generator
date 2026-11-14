// Skeleton shown while the business profile loads. Mirrors the first sections of the form.
import AppShell from "@/components/AppShell";
import Card from "@/components/ui/Card";
import { SkeletonBar, SkeletonBox, SkeletonHeader, SkeletonPage } from "@/components/ui/Skeleton";

function Field({ tall = false }: { tall?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <SkeletonBar className="h-4 w-32" />
      <SkeletonBox className={tall ? "h-24 w-full" : "h-10 w-full"} />
    </div>
  );
}

export default function ProfileLoading() {
  return (
    <AppShell width="narrow">
      <SkeletonPage label="Loading your business profile…">
        <SkeletonHeader action={false} />
        <Card className="flex flex-col gap-4">
          <SkeletonBar className="h-5 w-40" />
          <Field />
          <Field />
          <Field tall />
        </Card>
        <Card className="flex flex-col gap-4">
          <SkeletonBar className="h-5 w-48" />
          <SkeletonBox className="h-16 w-full" />
          <SkeletonBox className="h-16 w-full" />
        </Card>
      </SkeletonPage>
    </AppShell>
  );
}
