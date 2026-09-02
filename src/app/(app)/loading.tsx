export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-black/5" />
      <div className="h-4 w-64 animate-pulse rounded bg-black/5" />
      <div className="grid gap-3">
        <div className="h-28 animate-pulse rounded-2xl bg-black/5" />
        <div className="h-28 animate-pulse rounded-2xl bg-black/5" />
        <div className="h-28 animate-pulse rounded-2xl bg-black/5" />
      </div>
    </div>
  );
}
