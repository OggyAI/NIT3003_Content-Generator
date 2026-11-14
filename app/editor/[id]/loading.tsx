// Skeleton shown while a draft loads. Mirrors the editor: header, toolbar, writing column,
// and the analysis panel (beside it from xl, below it otherwise).
import AppShell from '@/components/AppShell';
import Card from '@/components/ui/Card';
import { SkeletonBar, SkeletonBox, SkeletonPage } from '@/components/ui/Skeleton';

export default function EditorLoading() {
  return (
    <AppShell width="editor">
      <div className="max-w-[70ch] xl:max-w-none">
        <SkeletonPage label="Loading your draft…">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-col gap-3">
              <SkeletonBar className="h-4 w-24" />
              <SkeletonBar className="h-8 w-72 max-w-full" />
              <SkeletonBar className="h-4 w-40" />
            </div>
            <SkeletonBox className="h-10 w-28" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonBox key={i} className="h-8 w-28" />
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
            <Card className="flex flex-col gap-4">
              <SkeletonBar className="h-4 w-12" />
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBar className="h-4 w-12" />
              <SkeletonBox className="h-72 w-full" />
            </Card>
            <Card className="flex flex-col gap-4">
              <SkeletonBar className="h-5 w-32" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBox className="h-10 w-full" />
              <SkeletonBox className="h-10 w-full" />
            </Card>
          </div>
        </SkeletonPage>
      </div>
    </AppShell>
  );
}
