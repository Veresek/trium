interface PanelPlaceholderProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PanelPlaceholder({
  eyebrow,
  title,
  description,
}: PanelPlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <p className="text-sm text-ink-soft">{eyebrow}</p>
      <h1 className="mt-2 font-serif text-3xl text-ink md:text-4xl">{title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-ink-soft">
        {description}
      </p>
      <div className="mt-8 rounded-lg border border-dashed border-line bg-paper-raised p-8 text-center text-sm text-ink-faint">
        This area is currently unavailable.
      </div>
    </section>
  );
}
