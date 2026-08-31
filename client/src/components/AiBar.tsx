import { Icon } from "./Icon";

export function AiBar() {
  return (
    <div className="border-b border-line bg-paper px-4 py-3 md:px-8">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-md border border-line bg-paper-raised px-3 py-2.5 text-ink-faint">
        <Icon name="leaf" className="size-5 shrink-0 text-lichen" />
        <input
          aria-label="AI assistant (coming later)"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-faint"
          disabled
          placeholder="Ask Trium to help plan your day…"
          type="text"
        />
        <span className="text-xs text-ink-faint">Coming later</span>
      </div>
    </div>
  );
}
