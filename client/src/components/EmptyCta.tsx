import { useId } from "react";

import { Icon } from "./Icon";

interface EmptyCtaProps {
  title: string;
  description: string;
  onClick: () => void;
}

export function EmptyCta({ title, description, onClick }: EmptyCtaProps) {
  const titleId = useId();
  const descriptionId = useId();
  return (
    <button
      aria-describedby={descriptionId}
      aria-labelledby={titleId}
      className="group flex min-h-44 w-full flex-col items-center justify-center rounded-lg border border-dashed border-line bg-paper-raised p-6 text-center transition hover:border-lichen hover:bg-paper"
      onClick={onClick}
      type="button"
    >
      <span className="mb-4 grid size-10 place-items-center rounded-full border border-line text-moss transition group-hover:border-lichen">
        <Icon name="plus" className="size-5" />
      </span>
      <span className="font-medium text-ink" id={titleId}>
        {title}
      </span>
      <span
        className="mt-1 max-w-xs text-sm leading-6 text-ink-soft"
        id={descriptionId}
      >
        {description}
      </span>
    </button>
  );
}
