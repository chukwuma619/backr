export function GuideSteps({ children }: { children: React.ReactNode }) {
  return (
    <ol className="m-0 flex list-none flex-col gap-10 p-0">{children}</ol>
  );
}

export function GuideStep({
  step,
  title,
  id,
  children,
}: {
  step: number;
  title: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <li
      id={id ?? `step-${step}`}
      className="scroll-mt-24"
    >
      <div className="flex gap-4">
        <div
          className="bg-muted text-foreground flex size-9 shrink-0 items-center justify-center rounded-full border border-border text-sm font-semibold"
          aria-hidden
        >
          {step}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <h2 className="text-foreground text-base font-semibold leading-snug">
            <span className="sr-only">Step {step}: </span>
            {title}
          </h2>
          <div className="text-muted-foreground space-y-2 text-sm leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </li>
  );
}
