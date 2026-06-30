export function ProductDetailSkeleton() {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-5 py-8 sm:gap-12 sm:py-10 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-14">
      <div className="shimmer aspect-square w-full rounded-3xl" />
      <div>
        <div className="flex gap-2">
          <div className="shimmer h-6 w-16 rounded-full" />
          <div className="shimmer h-6 w-20 rounded-full" />
        </div>
        <div className="shimmer mt-4 h-10 w-3/4 rounded-md" />
        <div className="shimmer mt-5 h-4 w-full rounded-md" />
        <div className="shimmer mt-2 h-4 w-5/6 rounded-md" />

        <div className="mt-8 grid grid-cols-2 gap-6 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-2">
            <div className="shimmer h-3 w-20 rounded-md" />
            <div className="shimmer h-7 w-24 rounded-md" />
          </div>
          <div className="space-y-2">
            <div className="shimmer h-3 w-20 rounded-md" />
            <div className="shimmer h-7 w-24 rounded-md" />
          </div>
        </div>

        <div className="shimmer mt-8 h-12 w-full rounded-full" />
        <div className="shimmer mt-3 h-12 w-full rounded-full" />
      </div>
    </section>
  );
}
