import { SiteLayout } from "@/components/SiteLayout";

export function StubPage({ title, description }: { title: string; description?: string }) {
  return (
    <SiteLayout>
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-5 py-20 text-center lg:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-accent">Coming soon</p>
        <h1 className="mt-3 font-display text-3xl font-medium text-foreground sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">{description}</p>
        )}
      </section>
    </SiteLayout>
  );
}
