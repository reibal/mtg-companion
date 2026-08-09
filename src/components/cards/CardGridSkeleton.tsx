export function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6" aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <div key={index} className="animate-pulse">
          <div className="aspect-[63/88] w-full rounded-md bg-ink-700" />
          <div className="mt-1.5 h-3 w-3/4 rounded bg-ink-700" />
        </div>
      ))}
    </div>
  )
}