import { cn } from "@/lib/utils";

export function PublicCreatorPageShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-3xl px-4 pb-16 pt-6", className)}
    >
      {children}
    </div>
  );
}
