export default function PageLoader() {
  return (
    <>
      <header className="flex items-center justify-between border-b border-primary/5 bg-white px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <div className="skeleton h-9 w-9 rounded-full" />
          <div className="space-y-1.5">
            <div className="skeleton h-3.5 w-24 rounded" />
            <div className="skeleton h-2.5 w-16 rounded" />
          </div>
        </div>
        <div className="hidden sm:block">
          <div className="skeleton h-9 w-64 rounded-lg" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-primary/5 bg-white p-4 sm:p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3">
                    <div className="skeleton h-3 w-20 rounded" />
                    <div className="skeleton h-8 w-12 rounded" />
                    <div className="skeleton h-3 w-28 rounded" />
                  </div>
                  <div className="skeleton h-6 w-6 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
            <div className="xl:col-span-2">
              <div className="rounded-xl border border-primary/5 bg-white">
                <div className="border-b border-primary/5 px-4 py-3 md:px-6 md:py-4">
                  <div className="skeleton h-4 w-32 rounded" />
                </div>
                <div className="space-y-0 divide-y divide-primary/5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 px-4 py-3.5 md:px-6">
                      <div className="skeleton h-3.5 w-20 rounded" />
                      <div className="skeleton h-3.5 w-36 rounded" />
                      <div className="skeleton h-3.5 w-16 rounded" />
                      <div className="ms-auto skeleton h-5 w-5 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="xl:col-span-1">
              <div className="rounded-xl border border-primary/5 bg-white">
                <div className="border-b border-primary/5 px-4 py-3 md:px-6 md:py-4">
                  <div className="skeleton h-4 w-28 rounded" />
                </div>
                <div className="space-y-0 divide-y divide-primary/5">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="px-4 py-3 md:px-6 md:py-4">
                      <div className="skeleton h-3.5 w-24 rounded" />
                      <div className="skeleton mt-2 h-2.5 w-32 rounded" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-primary/5 bg-white">
            <div className="border-b border-primary/5 px-4 py-3 md:px-6 md:py-4">
              <div className="skeleton h-4 w-36 rounded" />
            </div>
            <div className="space-y-0 divide-y divide-primary/5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 md:px-6">
                  <div className="skeleton h-3.5 w-28 rounded" />
                  <div className="skeleton h-3.5 w-24 rounded" />
                  <div className="skeleton h-3.5 w-24 rounded" />
                  <div className="skeleton h-3.5 w-16 rounded" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
