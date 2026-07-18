export default function TableLoader({ rows = 6 }: { rows?: number }) {
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
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="skeleton h-6 w-40 rounded" />
            <div className="skeleton h-9 w-28 rounded-lg" />
          </div>

          <div className="rounded-xl border border-primary/5 bg-white">
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary/5 bg-primary/[0.02]">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <th key={i} className="px-6 py-3">
                        <div className="skeleton h-3 w-16 rounded" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {Array.from({ length: rows }).map((_, i) => (
                    <tr key={i}>
                      {[1, 2, 3, 4, 5].map((j) => (
                        <td key={j} className="px-6 py-3.5">
                          <div className="skeleton h-3.5 w-20 rounded" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
