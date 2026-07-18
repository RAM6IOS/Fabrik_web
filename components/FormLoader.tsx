export default function FormLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="mx-auto h-12 w-12 rounded-lg bg-accent/20" />
        <div className="space-y-3 text-center">
          <div className="skeleton mx-auto h-6 w-40 rounded" />
          <div className="skeleton mx-auto h-4 w-56 rounded" />
        </div>
        <div className="space-y-4 rounded-xl border border-primary/5 bg-white p-6">
          <div className="space-y-2">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-20 rounded" />
            <div className="skeleton h-10 w-full rounded-lg" />
          </div>
          <div className="skeleton h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
